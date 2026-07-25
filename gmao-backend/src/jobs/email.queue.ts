import { Queue, Worker, Job } from 'bullmq';
import { sendDiAssignmentEmail, DiAssignmentEmailData } from '../services/email.service';
import prisma from '../config/prisma'; // Make sure this path is correct for your Prisma client
import { logger } from '../utils/logger';

const log = logger.child({ module: 'email-queue' });

const QUEUE_NAME = 'email-queue';

const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
};

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  },
});

emailQueue.on('error', (err) => {
  log.error({ err }, 'Queue error');
});

export const emailWorker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    log.info({ jobId: job.id, jobName: job.name }, 'Processing job');

    if (job.name === 'EMAIL_DI_ASSIGNED') {
      const {
        technicienEmail,
        outboxEventId,
        diNumero,
        atelier,
        ligne,
        poste,
        priorite,
        produit,
        panneNom,
        panneDescription,
        panneType,
      } = job.data as DiAssignmentEmailData & { technicienEmail: string; outboxEventId?: number };

      await sendDiAssignmentEmail(technicienEmail, {
        diNumero,
        atelier,
        ligne,
        poste,
        priorite,
        produit,
        panneNom,
        panneDescription,
        panneType,
      });

      if (outboxEventId) {
        await prisma.outboxEvent.update({
          where: { id: outboxEventId },
          data: { status: 'PROCESSED' },
        });
      }
    }
  },
  { connection: redisConnection },
);

emailWorker.on('failed', async (job, err) => {
  log.error({ jobId: job?.id, err }, 'Job failed');

  if (job?.data?.outboxEventId) {
    if (job.attemptsMade >= (job.opts.attempts || 1)) {
      await prisma.outboxEvent.update({
        where: { id: job.data.outboxEventId },
        data: { status: 'FAILED', error: err.message },
      });
    }
  }
});

emailWorker.on('error', (err) => {
  log.error({ err }, 'Worker error');
});
