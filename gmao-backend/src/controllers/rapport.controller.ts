import { Request, Response, NextFunction } from 'express';
import { rapportService } from '../services/rapport.service';
import { UnauthorizedError } from '../utils/errors';

export const getRapports = async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw new UnauthorizedError('Utilisateur non authentifié');
  }

  const rapports = await rapportService.getRapports(req.user);

  res.status(200).json({
    success: true,
    message: 'Rapports récupérés',
    data: rapports,
  });
};

export const getRapportById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const rapport = await rapportService.getRapportById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Rapport récupéré',
    data: rapport,
  });
};

export const getRapportByOT = async (req: Request, res: Response): Promise<void> => {
  const { otId } = req.params;
  const rapport = await rapportService.getRapportByOT(parseInt(otId as string, 10));

  res.status(200).json({
    success: true,
    message: 'Rapport récupéré',
    data: rapport,
  });
};
