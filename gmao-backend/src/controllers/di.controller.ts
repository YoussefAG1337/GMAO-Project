import { Request, Response } from 'express';
import { diService } from '../services/di.service';
import { emailQueue } from '../jobs/email.queue';
import prisma from '../config/prisma';
import { logger } from '../utils/logger';
import { GetDIsQuery } from '../dtos/di.dto';

const log = logger.child({ module: 'di-controller' });

export const getDIs = async (req: Request, res: Response): Promise<void> => {
  // Query params are validated + coerced by validateRequest(getDIsSchema),
  // so page/limit are numbers with defaults and filters are typed.
  const { page, limit, statut, priorite, atelierId, ligneId, posteId } =
    req.query as unknown as GetDIsQuery;

  const filters: any = {};
  if (statut) filters.statut = statut;
  if (priorite) filters.priorite = priorite;
  if (atelierId) filters.atelierId = atelierId;
  if (ligneId) filters.ligneId = ligneId;
  if (posteId) filters.posteId = posteId;

  const result = await diService.getDIs(filters, page, limit);

  res.status(200).json({
    success: true,
    message: "Demandes d'intervention récupérées avec succès",
    data: result,
  });
};

export const getDIById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const di = await diService.getDIById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: "Demande d'intervention récupérée avec succès",
    data: di,
  });
};

export const createDI = async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.userId;
  // Extract documentUrl if a file was uploaded
  const documentUtileUrl = req.file ? `/uploads/di-documents/${req.file.filename}` : undefined;

  // Convert stringified numbers to actual numbers since multer turns body to strings
  const parsedBody = {
    ...req.body,
    atelierId: parseInt(req.body.atelierId),
    ligneId: parseInt(req.body.ligneId),
    posteId: parseInt(req.body.posteId),
    produitId: req.body.produitId ? parseInt(req.body.produitId) : undefined,
    panneId: req.body.panneId ? parseInt(req.body.panneId) : undefined,
    nouvellePanneNom: req.body.nouvellePanneNom || undefined,
    nouvellePanneType: req.body.nouvellePanneType || undefined,
    technicienId: req.body.technicienId ? parseInt(req.body.technicienId) : undefined,
  };

  // 1. Save to DB safely using our new transaction
  const { updatedDi, outboxEvent } = await diService.createDI(userId, parsedBody, documentUtileUrl);

  // 2. If an email needs to be sent, try to push to Redis instantly
  if (outboxEvent) {
    try {
      await Promise.race([
        emailQueue.add(
          'EMAIL_DI_ASSIGNED',
          {
            ...(outboxEvent.payload as object),
            outboxEventId: outboxEvent.id,
          }, // Pass the DB ID to the worker
          { jobId: `outbox-${outboxEvent.id}` },
        ),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Redis connection timeout')), 1000),
        ),
      ]);

      // Update the status because we successfully pushed it!
      await prisma.outboxEvent.update({
        where: { id: outboxEvent.id },
        data: { status: 'QUEUED' },
      });
    } catch (redisError) {
      log.warn({ err: redisError }, 'Redis push failed, relying on Node-Cron fallback');
    }
  }

  // 3. Return response to user instantly
  res.status(201).json({
    success: true,
    message: "Demande d'intervention créée avec succès",
    data: updatedDi,
  });
};

export const updateDI = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const parsedBody = {
    ...req.body,
    atelierId: req.body.atelierId ? parseInt(req.body.atelierId) : undefined,
    ligneId: req.body.ligneId ? parseInt(req.body.ligneId) : undefined,
    posteId: req.body.posteId ? parseInt(req.body.posteId) : undefined,
    produitId: req.body.produitId ? parseInt(req.body.produitId) : undefined,
    panneId: req.body.panneId ? parseInt(req.body.panneId) : undefined,
    nouvellePanneNom: req.body.nouvellePanneNom || undefined,
    nouvellePanneType: req.body.nouvellePanneType || undefined,
    technicienId: req.body.technicienId ? parseInt(req.body.technicienId) : undefined,
  };

  const di = await diService.updateDI(parseInt(id as string, 10), parsedBody);

  res.status(200).json({
    success: true,
    message: "Demande d'intervention mise à jour avec succès",
    data: di,
  });
};

export const deleteDI = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await diService.deleteDI(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: "Demande d'intervention supprimée avec succès",
  });
};

export const getDIStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await diService.getDIStats();

  res.status(200).json({
    success: true,
    message: 'Statistiques des DI récupérées',
    data: stats,
  });
};
