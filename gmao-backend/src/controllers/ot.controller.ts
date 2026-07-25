import { Request, Response, NextFunction } from 'express';
import { otService } from '../services/ot.service';
import { UnauthorizedError } from '../utils/errors';
import { GetOTsQuery } from '../dtos/ot.dto';

export const getOTs = async (req: Request, res: Response): Promise<void> => {
  // Validated + coerced by validateRequest(getOTsSchema).
  const { page, limit, statut, typeMaintenance, technicienId, atelierId } =
    req.query as unknown as GetOTsQuery;

  const filters: any = {};
  if (statut) filters.statut = statut;
  if (typeMaintenance) filters.typeMaintenance = typeMaintenance;
  if (technicienId) filters.technicienId = technicienId;
  if (atelierId) filters.atelierId = atelierId;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const result = await otService.getOTs(filters, page, limit, req.user);

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
    message: 'Rapport soumis avec succès',
    data: rapport,
  });
};

export const validerTechnicien = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const ot = await otService.validerTechnicien(parseInt(id as string, 10), req.user);

  res.status(200).json({
    success: true,
    message: 'Travail validé — en attente de validation admin',
    data: ot,
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

export const reporterOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { raison } = req.body;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const ot = await otService.reporterOT(parseInt(id as string, 10), raison, req.user);

  res.status(200).json({
    success: true,
    message: 'Intervention reportée à une autre date',
    data: ot,
  });
};

export const annulerOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { raison } = req.body;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const ot = await otService.annulerOT(parseInt(id as string, 10), raison, req.user);

  res.status(200).json({
    success: true,
    message: 'OT annulé',
    data: ot,
  });
};

export const nonValiderOT = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { raison } = req.body;

  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const ot = await otService.nonValiderOT(parseInt(id as string, 10), raison, req.user);

  res.status(200).json({
    success: true,
    message: 'OT marqué comme non validé',
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
