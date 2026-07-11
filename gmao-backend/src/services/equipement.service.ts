import prisma from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { IEquipementService } from '../interfaces/services/IEquipementService';
import {
  CreateAtelierDTO,
  UpdateAtelierDTO,
  CreateLigneDTO,
  UpdateLigneDTO,
  CreatePosteDTO,
  UpdatePosteDTO,
} from '../dtos/equipement.dto';

class EquipementService implements IEquipementService {
  // ==========================================
  // ATELIERS
  // ==========================================

  public async getAteliers(actif?: boolean) {
    const where = actif !== undefined ? { actif } : {};

    return prisma.atelier.findMany({
      where,
      include: {
        _count: {
          select: { lignes: true },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  public async getAtelierById(id: number) {
    const atelier = await prisma.atelier.findUnique({
      where: { id },
      include: {
        lignes: {
          include: {
            _count: {
              select: { postes: true },
            },
          },
        },
      },
    });

    if (!atelier) {
      throw new NotFoundError('Atelier introuvable');
    }

    return atelier;
  }

  public async createAtelier(data: CreateAtelierDTO) {
    return prisma.atelier.create({
      data,
    });
  }

  public async updateAtelier(id: number, data: UpdateAtelierDTO) {
    if (data.actif === false) {
      // Cascading deactivation
      const updatedAtelier = await prisma.atelier.update({
        where: { id },
        data,
      });
      await prisma.ligne.updateMany({
        where: { atelierId: id },
        data: { actif: false },
      });
      const lignes = await prisma.ligne.findMany({
        where: { atelierId: id },
        select: { id: true },
      });
      const ligneIds = lignes.map((l) => l.id);
      if (ligneIds.length > 0) {
        await prisma.poste.updateMany({
          where: { ligneId: { in: ligneIds } },
          data: { actif: false },
        });
      }
      return updatedAtelier;
    }

    return prisma.atelier.update({
      where: { id },
      data,
    });
  }

  public async deleteAtelier(id: number) {
    return prisma.atelier.delete({
      where: { id },
    });
  }

  // ==========================================
  // LIGNES
  // ==========================================

  public async getLignes(atelierId?: number, actif?: boolean) {
    const where: any = {};
    if (actif !== undefined) where.actif = actif;
    if (atelierId) where.atelierId = atelierId;

    return prisma.ligne.findMany({
      where,
      include: {
        atelier: { select: { nom: true } },
        _count: { select: { postes: true } },
        techniciens: { select: { id: true, nom: true, prenom: true } },
      },
      orderBy: { nom: 'asc' },
    });
  }

  public async getLigneById(id: number) {
    const ligne = await prisma.ligne.findUnique({
      where: { id },
      include: {
        atelier: true,
        postes: true,
      },
    });

    if (!ligne) {
      throw new NotFoundError('Ligne introuvable');
    }

    return ligne;
  }

  public async createLigne(data: CreateLigneDTO) {
    const atelierExists = await prisma.atelier.findUnique({ where: { id: data.atelierId } });
    if (!atelierExists) {
      throw new BadRequestError("L'atelier spécifié n'existe pas");
    }

    const { technicienIds, ...ligneData } = data;

    return prisma.ligne.create({
      data: {
        ...ligneData,
        techniciens:
          technicienIds && technicienIds.length > 0
            ? { connect: technicienIds.map((id) => ({ id })) }
            : undefined,
      },
    });
  }

  public async updateLigne(id: number, data: UpdateLigneDTO) {
    if (data.atelierId) {
      const atelierExists = await prisma.atelier.findUnique({ where: { id: data.atelierId } });
      if (!atelierExists) {
        throw new BadRequestError("L'atelier spécifié n'existe pas");
      }
    }

    const { technicienIds, ...ligneData } = data;

    if (data.actif === false) {
      await prisma.poste.updateMany({
        where: { ligneId: id },
        data: { actif: false },
      });
    }

    return prisma.ligne.update({
      where: { id },
      data: {
        ...ligneData,
        techniciens:
          technicienIds !== undefined
            ? { set: technicienIds.map((tId) => ({ id: tId })) }
            : undefined,
      },
    });
  }

  public async deleteLigne(id: number) {
    return prisma.ligne.delete({
      where: { id },
    });
  }

  // ==========================================
  // POSTES
  // ==========================================

  public async getPostes(ligneId?: number, actif?: boolean) {
    const where: any = {};
    if (actif !== undefined) where.actif = actif;
    if (ligneId) where.ligneId = ligneId;

    return prisma.poste.findMany({
      where,
      include: {
        ligne: {
          select: {
            nom: true,
            atelier: { select: { nom: true } },
          },
        },
      },
      orderBy: { nom: 'asc' },
    });
  }

  public async getPosteById(id: number) {
    const poste = await prisma.poste.findUnique({
      where: { id },
      include: {
        ligne: {
          include: { atelier: true },
        },
      },
    });

    if (!poste) {
      throw new NotFoundError('Poste introuvable');
    }

    return poste;
  }

  public async createPoste(data: CreatePosteDTO) {
    const ligneExists = await prisma.ligne.findUnique({ where: { id: data.ligneId } });
    if (!ligneExists) {
      throw new BadRequestError("La ligne spécifiée n'existe pas");
    }

    return prisma.poste.create({
      data,
    });
  }

  public async updatePoste(id: number, data: UpdatePosteDTO) {
    if (data.ligneId) {
      const ligneExists = await prisma.ligne.findUnique({ where: { id: data.ligneId } });
      if (!ligneExists) {
        throw new BadRequestError("La ligne spécifiée n'existe pas");
      }
    }

    return prisma.poste.update({
      where: { id },
      data,
    });
  }

  public async deletePoste(id: number) {
    return prisma.poste.delete({
      where: { id },
    });
  }
}

export const equipementService = new EquipementService();
