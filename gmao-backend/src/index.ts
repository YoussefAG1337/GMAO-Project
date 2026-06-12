/**
 * @fileoverview Point d'entrée principal de l'application GMAO Backend
 * @description Configure Express avec les middlewares de sécurité,
 *              monte les routes et démarre le serveur.
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.routes';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/errorHandler.middleware';

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ══════════════════════════════════════════
// Middlewares de sécurité
// ══════════════════════════════════════════

/** En-têtes de sécurité HTTP */
app.use(helmet());

/** Configuration CORS pour le frontend */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

/** Parsing des cookies */
app.use(cookieParser());

/** Parsing du corps JSON avec une limite de taille */
app.use(express.json({ limit: '10mb' }));

/** Parsing des formulaires URL-encoded */
app.use(express.urlencoded({ extended: true }));

/** Limiteur de débit général */
app.use(generalLimiter);

// ══════════════════════════════════════════
// Routes
// ══════════════════════════════════════════

/** Route de santé pour les vérifications de disponibilité */
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API GMAO opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/** Routes d'authentification */
app.use('/api/auth', authRoutes);

// ══════════════════════════════════════════
// Gestion des erreurs
// ══════════════════════════════════════════

/** Route 404 pour les endpoints non trouvés */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'La ressource demandée est introuvable.',
    code: 'NOT_FOUND',
  });
});

/** Gestionnaire d'erreurs global */
app.use(errorHandler);

// ══════════════════════════════════════════
// Démarrage du serveur
// ══════════════════════════════════════════

app.listen(PORT, () => {
  console.log('══════════════════════════════════════════');
  console.log(`🚀 Serveur GMAO démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend: ${FRONTEND_URL}`);
  console.log('══════════════════════════════════════════');
});

export default app;
