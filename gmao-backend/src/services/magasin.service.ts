import prisma from '../config/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';
import { TypeMouvement } from '@prisma/client';

class MagasinService {
  // --- PieceRechange ---
  public async getPieces() {
    return prisma.pieceRechange.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  public async getPieceById(id: number) {
    const piece = await prisma.pieceRechange.findUnique({
      where: { id },
      include: {
        mouvements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: { utilisateur: { select: { nom: true, prenom: true } } },
        },
      },
    });
    if (!piece) throw new NotFoundError('Pièce introuvable');
    return piece;
  }

  public async createPiece(data: {
    code: string;
    nom: string;
    description?: string;
    seuilAlerte: number;
    prixUnitaire?: number;
  }) {
    const existing = await prisma.pieceRechange.findUnique({ where: { code: data.code } });
    if (existing) throw new ConflictError('Ce code pièce existe déjà');
    return prisma.pieceRechange.create({ data });
  }

  public async updatePiece(id: number, data: any) {
    if (data.code) {
      const existing = await prisma.pieceRechange.findUnique({ where: { code: data.code } });
      if (existing && existing.id !== id) throw new ConflictError('Ce code pièce existe déjà');
    }
    return prisma.pieceRechange.update({ where: { id }, data });
  }

  public async deletePiece(id: number) {
    await prisma.pieceRechange.delete({ where: { id } });
  }

  // --- MouvementStock ---
  public async createMouvement(
    userId: number,
    data: { pieceId: number; type: TypeMouvement; quantite: number; referenceOT?: string },
  ) {
    return prisma.$transaction(async (tx) => {
      // Create the movement
      const mouvement = await tx.mouvementStock.create({
        data: {
          pieceId: data.pieceId,
          type: data.type,
          quantite: data.quantite,
          referenceOT: data.referenceOT,
          userId,
        },
      });

      // Update the stock quantity
      const incrementValue = data.type === TypeMouvement.ENTREE ? data.quantite : -data.quantite;

      const piece = await tx.pieceRechange.update({
        where: { id: data.pieceId },
        data: {
          quantiteStock: { increment: incrementValue },
        },
      });

      // Verify stock didn't drop below 0
      if (piece.quantiteStock < 0) {
        throw new ConflictError('Stock insuffisant pour ce mouvement');
      }

      return mouvement;
    });
  }
}

export const magasinService = new MagasinService();
