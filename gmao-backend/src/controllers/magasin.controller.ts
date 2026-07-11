import { Request, Response, NextFunction } from 'express';
import { magasinService } from '../services/magasin.service';

class MagasinController {
  // --- PieceRechange ---
  public getPieces = async (req: Request, res: Response) => {
    const pieces = await magasinService.getPieces();
    res.status(200).json(pieces);
  };

  public getPieceById = async (req: Request, res: Response) => {
    const piece = await magasinService.getPieceById(Number(req.params.id));
    res.status(200).json(piece);
  };

  public createPiece = async (req: Request, res: Response) => {
    const piece = await magasinService.createPiece(req.body);
    res.status(201).json(piece);
  };

  public updatePiece = async (req: Request, res: Response) => {
    const piece = await magasinService.updatePiece(Number(req.params.id), req.body);
    res.status(200).json(piece);
  };

  public deletePiece = async (req: Request, res: Response) => {
    await magasinService.deletePiece(Number(req.params.id));
    res.status(204).send();
  };

  // --- MouvementStock ---
  public createMouvement = async (req: Request, res: Response) => {
    const userId = req.user?.userId || (req as any).user?.userId;
    const mouvement = await magasinService.createMouvement(userId, req.body);
    res.status(201).json(mouvement);
  };
}

export const magasinController = new MagasinController();
