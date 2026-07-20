import cron from 'node-cron';
import prisma from '../config/prisma';
import { emailQueue } from '../jobs/email.queue';
import { logger } from '../utils/logger';

const log = logger.child({ module: 'outbox-cron' });

// Run every 5 minutes: "*/5 * * * *"
cron.schedule('*/5 * * * *', async () => {
  try {
    // 1. Find all PENDING events
    const pendingEvents = await prisma.outboxEvent.findMany({
      where: { status: 'PENDING' },
      take: 50, // Process in batches of 50 to avoid overloading
    });

    if (pendingEvents.length === 0) return;

    log.info({ count: pendingEvents.length }, 'Found pending events. Queuing...');

    // 2. Loop through and push to BullMQ
    for (const event of pendingEvents) {
      // Add to BullMQ
      await emailQueue.add(
        event.type,
        {
          ...(event.payload as object),
          outboxEventId: event.id,
        },
        { jobId: `outbox-${event.id}` }, // Important so the worker knows which DB record to update
      );

      // 3. Mark as QUEUED in the database
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { status: 'QUEUED' },
      });
    }
  } catch (error) {
    log.error({ err: error }, 'Error sweeping outbox');
  }
});
