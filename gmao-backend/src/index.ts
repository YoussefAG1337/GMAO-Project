import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import equipementRoutes from './routes/equipement.routes';
import diRoutes from './routes/di.routes';
import otRoutes from './routes/ot.routes';
import planRoutes from './routes/plan.routes';
import calendarRoutes from './routes/calendar.routes';
import dashboardRoutes from './routes/dashboard.routes';
import produitRoutes from './routes/produit.routes';
import magasinRoutes from './routes/magasin.routes';
import analyticsRoutes from './routes/analytics.routes';
import panneRoutes from './routes/panne.routes';
import { initPreventiveCron } from './cron/preventive.cron';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';
import { logger } from './utils/logger';
import prisma from './config/prisma';
import { redis } from './config/redis';
import { emailQueue, emailWorker } from './jobs/email.queue';
import './cron/outbox.cron';
const app = express();
app.set('trust proxy', 1);
const PORT = parseInt(process.env.PORT || '5000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// En-têtes de sécurité HTTP
app.use(helmet());

//Configuration CORS pour le frontend
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

/** Limiteur de débit général */
app.use(generalLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API GMAO opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);
app.use('/api/equipements', equipementRoutes);
app.use('/api/dis', diRoutes);
app.use('/api/ots', otRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/magasin', magasinRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/pannes', panneRoutes);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'La ressource demandée est introuvable.',
    code: 'NOT_FOUND',
  });
});

app.use(errorHandler);

// Initialisation du cron de maintenance préventive
initPreventiveCron();

const server = app.listen(PORT, () => {
  logger.info(
    { port: PORT, environment: process.env.NODE_ENV || 'development', frontendUrl: FRONTEND_URL },
    'Serveur GMAO démarré',
  );
});

/**
 * Arrêt propre : sur SIGTERM/SIGINT (envoyés par Docker/Container Apps/k8s
 * avant le SIGKILL), on cesse d'accepter de nouvelles connexions, on laisse
 * les requêtes en cours se terminer, on draine le worker BullMQ (pour ne pas
 * tuer un envoi d'email en cours), puis on ferme proprement Redis et Prisma.
 * Un délai de sécurité force la sortie si l'arrêt se bloque (connexions
 * keep-alive, job récalcitrant).
 *
 * Note : les crons (préventif, outbox) ne sont pas drainés explicitement — ils
 * sont conçus pour être ré-exécutés sans effet de bord (l'outbox rejoue depuis
 * la DB, le préventif régénère au prochain passage), donc une interruption au
 * niveau du process est sûre.
 */
let shuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Signal d’arrêt reçu, fermeture propre en cours...');

  const forceExit = setTimeout(() => {
    logger.error('Arrêt propre trop long — sortie forcée');
    process.exit(1);
  }, 10000);
  forceExit.unref();

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, 'Erreur lors de la fermeture du serveur HTTP');
    }
    try {
      await emailWorker.close();
      await emailQueue.close();
      await redis.quit();
      await prisma.$disconnect();
      logger.info('Arrêt propre terminé');
      clearTimeout(forceExit);
      process.exit(0);
    } catch (e) {
      logger.error({ err: e }, "Erreur pendant l'arrêt propre");
      process.exit(1);
    }
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

export default app;
