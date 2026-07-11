import { Request, Response, NextFunction } from 'express';
import { panneService } from '../services/panne.service';

export const getPannes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { ligneId, posteId } = req.query;

    const OR: any[] = [];
    if (ligneId) OR.push({ ligneId: parseInt(ligneId as string, 10) });
    if (posteId) OR.push({ posteId: parseInt(posteId as string, 10) });

    const filters: any = {};
    if (OR.length > 0) {
      filters.OR = OR;
    }

    // Si aucun filtre n'est fourni, on pourrait renvoyer une erreur, mais renvoyons tout pour l'instant
    const pannes = await panneService.getPannes(filters);

    res.status(200).json({
      success: true,
      message: 'Pannes récupérées avec succès',
      data: pannes,
    });
  } catch (error) {
    next(error);
  }
};

export const createPanne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const panne = await panneService.createPanne(req.body);
    res.status(201).json({
      success: true,
      message: 'Panne créée avec succès',
      data: panne,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePanne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const panne = await panneService.updatePanne(parseInt(id as string, 10), req.body);
    res.status(200).json({
      success: true,
      message: 'Panne modifiée avec succès',
      data: panne,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePanne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    await panneService.deletePanne(parseInt(id as string, 10));
    res.status(200).json({
      success: true,
      message: 'Panne supprimée avec succès',
    });
  } catch (error) {
    next(error);
  }
};
