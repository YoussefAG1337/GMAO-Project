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

// 1. Initialize the Queue
export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3, // Retry 3 times if it fails
    backoff: {
      type: 'exponential',
      delay: 5000, // Wait 5s, then 25s, then 125s...
    },
  },
});

emailQueue.on('error', (err) => {
  log.error({ err }, 'Queue error');
});

// 2. Initialize the Worker (The consumer)
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

      // Call our Nodemailer service
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

      // Once successful, update the OutboxEvent status in the DB
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

// Listen for errors
emailWorker.on('failed', async (job, err) => {
  log.error({ jobId: job?.id, err }, 'Job failed');

  if (job?.data?.outboxEventId) {
    // Mark as failed in DB if we run out of retries
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
