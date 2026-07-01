/**
 * @fileoverview Contrôleur des Demandes d'Intervention (DI)
 * @description Gère le cycle de vie des signalements d'incidents
 */

import { Request, Response, NextFunction } from 'express';
import { diService } from '../services/di.service';

export const getDIs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { statut, priorite, atelierId, ligneId, posteId, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const filters: any = {};
    if (statut) filters.statut = statut;
    if (priorite) filters.priorite = priorite;
    if (atelierId) filters.atelierId = parseInt(atelierId as string, 10);
    if (ligneId) filters.ligneId = parseInt(ligneId as string, 10);
    if (posteId) filters.posteId = parseInt(posteId as string, 10);

    const result = await diService.getDIs(filters, pageNum, limitNum);

    res.status(200).json({
      success: true,
      message: "Demandes d'intervention récupérées avec succès",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getDIById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const di = await diService.getDIById(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: "Demande d'intervention récupérée avec succès",
      data: di,
    });
  } catch (error) {
    next(error);
  }
};

export const createDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const updatedDi = await diService.createDI(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Demande d'intervention créée avec succès",
      data: updatedDi,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const di = await diService.updateDI(parseInt(id as string, 10), req.body);

    res.status(200).json({
      success: true,
      message: "Demande d'intervention mise à jour avec succès",
      data: di,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDI = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await diService.deleteDI(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: "Demande d'intervention supprimée avec succès",
    });
  } catch (error) {
    next(error);
  }
};

export const getDIStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const stats = await diService.getDIStats();

    res.status(200).json({
      success: true,
      message: 'Statistiques des DI récupérées',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
