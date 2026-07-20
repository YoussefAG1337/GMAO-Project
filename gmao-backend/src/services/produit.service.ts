import prisma from '../config/prisma';
import { NotFoundError, ConflictError } from '../utils/errors';

class ProduitService {
  public async getFamilles() {
    return prisma.familleProduit.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  public async getFamilleById(id: number) {
    const famille = await prisma.familleProduit.findUnique({
      where: { id },
      include: { produits: true },
    });
    if (!famille) throw new NotFoundError('Famille de produits introuvable');
    return famille;
  }

  public async createFamille(data: { nom: string }) {
    const existing = await prisma.familleProduit.findUnique({ where: { nom: data.nom } });
    if (existing) throw new ConflictError('Cette famille existe déjà');
    return prisma.familleProduit.create({ data });
  }

  public async updateFamille(id: number, data: { nom: string }) {
    const existing = await prisma.familleProduit.findUnique({ where: { nom: data.nom } });
    if (existing && existing.id !== id) throw new ConflictError('Cette famille existe déjà');
    return prisma.familleProduit.update({ where: { id }, data });
  }

  public async deleteFamille(id: number) {
    await prisma.familleProduit.delete({ where: { id } });
  }

  // --- Produit ---
  public async getProduits(familleProduitId?: number) {
    return prisma.produit.findMany({
      where: familleProduitId ? { familleProduitId } : {},
      include: { familleProduit: true },
      orderBy: { nom: 'asc' },
    });
  }

  public async getProduitById(id: number) {
    const produit = await prisma.produit.findUnique({
      where: { id },
      include: { familleProduit: true },
    });
    if (!produit) throw new NotFoundError('Produit introuvable');
    return produit;
  }

  public async createProduit(data: { nom: string; familleProduitId: number }) {
    return prisma.produit.create({ data });
  }

  public async updateProduit(id: number, data: { nom?: string; familleProduitId?: number }) {
    return prisma.produit.update({ where: { id }, data });
  }

  public async deleteProduit(id: number) {
    await prisma.produit.delete({ where: { id } });
  }
}

export const produitService = new ProduitService();
