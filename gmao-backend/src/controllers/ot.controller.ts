import { Request, Response, NextFunction } from 'express';
import { otService } from '../services/ot.service';
import { UnauthorizedError } from '../utils/errors';

export const getOTs = async (req: Request, res: Response): Promise<void> => {
  const { statut, typeMaintenance, technicienId, atelierId, page = '1', limit = '20' } = req.query;

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);

  const filters: any = {};
  if (statut) filters.statut = statut;
  if (typeMaintenance) filters.typeMaintenance = typeMaintenance;
  if (technicienId) filters.technicienId = parseInt(technicienId as string, 10);
  if (atelierId) filters.atelierId = parseInt(atelierId as string, 10);

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const result = await otService.getOTs(filters, pageNum, limitNum, req.user);

  res.status(200).json({
    success: true,
    message: 'Ordres de travail récupérés avec succès',
    data: result,
  });
};

export const getOTById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ot = await otService.getOTById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'OT récupéré avec succès',
    data: ot,
  });
};

export const createOT = async (req: Request, res: Response): Promise<void> => {
  const updatedOT = await otService.createOT(req.body);

  res.status(201).json({
    success: true,
    message: 'OT créé avec succès',
    data: updatedOT,
  });
};

export const updateOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ot = await otService.updateOT(parseInt(id as string, 10), req.body);

  res.status(200).json({
    success: true,
    message: 'OT mis à jour avec succès',
    data: ot,
  });
};

export const assignOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { technicienId } = req.body;

  const ot = await otService.assignOT(parseInt(id as string, 10), technicienId);

  res.status(200).json({
    success: true,
    message: 'Technicien assigné avec succès',
    data: ot,
  });
};

export const startOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const updatedOT = await otService.startOT(parseInt(id as string, 10), req.user);

  res.status(200).json({
    success: true,
    message: 'Intervention démarrée',
    data: updatedOT,
  });
};

export const startFromDi = async (req: Request, res: Response): Promise<void> => {
  const { diId } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const newOT = await otService.startFromDi(parseInt(diId as string, 10), req.user.userId);

  res.status(201).json({
    success: true,
    message: 'OT créé et démarré avec succès',
    data: newOT,
  });
};

export const submitRapport = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const rapport = await otService.submitRapport(parseInt(id as string, 10), req.body, req.user);

  res.status(201).json({
    success: true,
    message: 'Rapport soumis avec succès, en attente de validation',
    data: rapport,
  });
};

export const validateOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const ot = await otService.validateOT(parseInt(id as string, 10), req.user.userId);

  res.status(200).json({
    success: true,
    message: 'OT validé et fermé',
    data: ot,
  });
};

export const deleteOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  await otService.deleteOT(parseInt(id as string, 10));

  res.status(200).json({ success: true, message: 'OT supprimé' });
};

export const getOTStats = async (req: Request, res: Response): Promise<void> => {
  const stats = await otService.getOTStats();

  res.status(200).json({
    success: true,
    message: 'Statistiques OT',
    data: stats,
  });
};
