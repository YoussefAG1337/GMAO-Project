import { Request, Response, NextFunction } from 'express';
import { produitService } from '../services/produit.service';

class ProduitController {
  // --- FamilleProduit ---
  public getFamilles = async (req: Request, res: Response) => {
    const familles = await produitService.getFamilles();
    res.status(200).json(familles);
  };

  public getFamilleById = async (req: Request, res: Response) => {
    const famille = await produitService.getFamilleById(Number(req.params.id));
    res.status(200).json(famille);
  };

  public createFamille = async (req: Request, res: Response) => {
    const famille = await produitService.createFamille(req.body);
    res.status(201).json(famille);
  };

  public updateFamille = async (req: Request, res: Response) => {
    const famille = await produitService.updateFamille(Number(req.params.id), req.body);
    res.status(200).json(famille);
  };

  public deleteFamille = async (req: Request, res: Response) => {
    await produitService.deleteFamille(Number(req.params.id));
    res.status(204).send();
  };

  // --- Produit ---
  public getProduits = async (req: Request, res: Response) => {
    const familleId = req.query.familleId ? parseInt(req.query.familleId as string) : undefined;
    const produits = await produitService.getProduits(familleId);
    res.status(200).json(produits);
  };

  public getProduitById = async (req: Request, res: Response) => {
    const produit = await produitService.getProduitById(Number(req.params.id));
    res.status(200).json(produit);
  };

  public createProduit = async (req: Request, res: Response) => {
    const produit = await produitService.createProduit(req.body);
    res.status(201).json(produit);
  };

  public updateProduit = async (req: Request, res: Response) => {
    const produit = await produitService.updateProduit(Number(req.params.id), req.body);
    res.status(200).json(produit);
  };

  public deleteProduit = async (req: Request, res: Response) => {
    await produitService.deleteProduit(Number(req.params.id));
    res.status(204).send();
  };
}

export const produitController = new ProduitController();
