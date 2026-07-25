import { Request, Response, NextFunction } from 'express';
import { equipementService } from '../services/equipement.service';

export const getAteliers = async (req: Request, res: Response): Promise<void> => {
  const { actif } = req.query;
  const isActif = actif !== undefined ? actif === 'true' : undefined;

  const ateliers = await equipementService.getAteliers(isActif);

  res.status(200).json({
    success: true,
    message: 'Ateliers récupérés avec succès',
    data: ateliers,
  });
};

export const getAtelierById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const atelier = await equipementService.getAtelierById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Atelier récupéré avec succès',
    data: atelier,
  });
};

export const createAtelier = async (req: Request, res: Response): Promise<void> => {
  const atelier = await equipementService.createAtelier(req.body);

  res.status(201).json({
    success: true,
    message: 'Atelier créé avec succès',
    data: atelier,
  });
};

export const updateAtelier = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const atelier = await equipementService.updateAtelier(parseInt(id as string, 10), req.body);

  res.status(200).json({
    success: true,
    message: 'Atelier mis à jour avec succès',
    data: atelier,
  });
};

export const deleteAtelier = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const atelier = await equipementService.deleteAtelier(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Atelier supprimé (désactivé) avec succès',
    data: atelier,
  });
};

export const getLignes = async (req: Request, res: Response): Promise<void> => {
  const { actif, atelierId } = req.query;

  const isActif = actif !== undefined ? actif === 'true' : undefined;
  const pAtelierId = atelierId ? parseInt(atelierId as string, 10) : undefined;

  const lignes = await equipementService.getLignes(pAtelierId, isActif);

  res.status(200).json({
    success: true,
    message: 'Lignes récupérées avec succès',
    data: lignes,
  });
};

export const getLigneById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ligne = await equipementService.getLigneById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Ligne récupérée avec succès',
    data: ligne,
  });
};

export const getLigneKpis = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const kpis = await equipementService.getLigneKpis(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'KPIs de la ligne récupérés avec succès',
    data: kpis,
  });
};

export const createLigne = async (req: Request, res: Response): Promise<void> => {
  const ligne = await equipementService.createLigne(req.body);

  res.status(201).json({
    success: true,
    message: 'Ligne créée avec succès',
    data: ligne,
  });
};

export const updateLigne = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ligne = await equipementService.updateLigne(parseInt(id as string, 10), req.body);

  res.status(200).json({
    success: true,
    message: 'Ligne mise à jour avec succès',
    data: ligne,
  });
};

export const deleteLigne = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const ligne = await equipementService.deleteLigne(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Ligne supprimée (désactivée) avec succès',
    data: ligne,
  });
};

export const getPostes = async (req: Request, res: Response): Promise<void> => {
  const { actif, ligneId } = req.query;

  const isActif = actif !== undefined ? actif === 'true' : undefined;
  const pLigneId = ligneId ? parseInt(ligneId as string, 10) : undefined;

  const postes = await equipementService.getPostes(pLigneId, isActif);

  res.status(200).json({
    success: true,
    message: 'Postes récupérés avec succès',
    data: postes,
  });
};

export const getPosteById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const poste = await equipementService.getPosteById(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Poste récupéré avec succès',
    data: poste,
  });
};

export const getPosteKpis = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const kpis = await equipementService.getPosteKpis(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'KPIs du poste récupérés avec succès',
    data: kpis,
  });
};

export const createPoste = async (req: Request, res: Response): Promise<void> => {
  const poste = await equipementService.createPoste(req.body);

  res.status(201).json({
    success: true,
    message: 'Poste créé avec succès',
    data: poste,
  });
};

export const updatePoste = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const poste = await equipementService.updatePoste(parseInt(id as string, 10), req.body);

  res.status(200).json({
    success: true,
    message: 'Poste mis à jour avec succès',
    data: poste,
  });
};

export const deletePoste = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const poste = await equipementService.deletePoste(parseInt(id as string, 10));

  res.status(200).json({
    success: true,
    message: 'Poste supprimé (désactivé) avec succès',
    data: poste,
  });
};
