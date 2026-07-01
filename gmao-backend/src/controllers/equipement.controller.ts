/**
 * @fileoverview Contrôleur des équipements (Atelier, Ligne, Poste)
 * @description Gère le CRUD pour la structure hiérarchique de l'usine
 */

import { Request, Response, NextFunction } from 'express';
import { equipementService } from '../services/equipement.service';

// ==========================================
// ATELIERS
// ==========================================

export const getAteliers = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { actif } = req.query;
    const isActif = actif !== undefined ? actif === 'true' : undefined;

    const ateliers = await equipementService.getAteliers(isActif);

    res.status(200).json({
      success: true,
      message: 'Ateliers récupérés avec succès',
      data: ateliers,
    });
  } catch (error) {
    next(error);
  }
};

export const getAtelierById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const atelier = await equipementService.getAtelierById(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Atelier récupéré avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const createAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const atelier = await equipementService.createAtelier(req.body);

    res.status(201).json({
      success: true,
      message: 'Atelier créé avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const atelier = await equipementService.updateAtelier(parseInt(id as string, 10), req.body);

    res.status(200).json({
      success: true,
      message: 'Atelier mis à jour avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAtelier = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const atelier = await equipementService.deleteAtelier(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Atelier supprimé (désactivé) avec succès',
      data: atelier,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// LIGNES
// ==========================================

export const getLignes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, atelierId } = req.query;

    const isActif = actif !== undefined ? actif === 'true' : undefined;
    const pAtelierId = atelierId ? parseInt(atelierId as string, 10) : undefined;

    const lignes = await equipementService.getLignes(pAtelierId, isActif);

    res.status(200).json({
      success: true,
      message: 'Lignes récupérées avec succès',
      data: lignes,
    });
  } catch (error) {
    next(error);
  }
};

export const getLigneById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ligne = await equipementService.getLigneById(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Ligne récupérée avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const createLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const ligne = await equipementService.createLigne(req.body);

    res.status(201).json({
      success: true,
      message: 'Ligne créée avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ligne = await equipementService.updateLigne(parseInt(id as string, 10), req.body);

    res.status(200).json({
      success: true,
      message: 'Ligne mise à jour avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLigne = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const ligne = await equipementService.deleteLigne(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Ligne supprimée (désactivée) avec succès',
      data: ligne,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// POSTES
// ==========================================

export const getPostes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { actif, ligneId } = req.query;

    const isActif = actif !== undefined ? actif === 'true' : undefined;
    const pLigneId = ligneId ? parseInt(ligneId as string, 10) : undefined;

    const postes = await equipementService.getPostes(pLigneId, isActif);

    res.status(200).json({
      success: true,
      message: 'Postes récupérés avec succès',
      data: postes,
    });
  } catch (error) {
    next(error);
  }
};

export const getPosteById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const poste = await equipementService.getPosteById(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Poste récupéré avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const createPoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const poste = await equipementService.createPoste(req.body);

    res.status(201).json({
      success: true,
      message: 'Poste créé avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const poste = await equipementService.updatePoste(parseInt(id as string, 10), req.body);

    res.status(200).json({
      success: true,
      message: 'Poste mis à jour avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePoste = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const poste = await equipementService.deletePoste(parseInt(id as string, 10));

    res.status(200).json({
      success: true,
      message: 'Poste supprimé (désactivé) avec succès',
      data: poste,
    });
  } catch (error) {
    next(error);
  }
};
