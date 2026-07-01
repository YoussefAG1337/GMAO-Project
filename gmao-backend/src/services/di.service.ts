import { StatutDI } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { IDiService } from '../interfaces/services/IDiService';
import { CreateDIDTO, UpdateDIDTO } from '../dtos/di.dto';

class DiService implements IDiService {
  public async getDIs(filters: any, pageNum: number, limitNum: number) {
    const skip = (pageNum - 1) * limitNum;

    const [total, dis] = await Promise.all([
      prisma.demandeIntervention.count({ where: filters }),
      prisma.demandeIntervention.findMany({
        where: filters,
        include: {
          atelier: { select: { nom: true } },
          ligne: { select: { nom: true } },
          poste: { select: { nom: true } },
          declarePar: { select: { nom: true, prenom: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      dis,
    };
  }

  public async getDIById(id: number) {
    const di = await prisma.demandeIntervention.findUnique({
      where: { id },
      include: {
        atelier: true,
        ligne: true,
        poste: true,
        declarePar: { select: { id: true, nom: true, prenom: true } },
        ordresTravail: true,
      },
    });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    return di;
  }

  public async createDI(userId: number, data: CreateDIDTO) {
    const {
      atelierId,
      ligneId,
      posteId,
      produit,
      referenceProduit,
      familleProduit,
      description,
      priorite,
    } = data;

    // Validate hierarchy consistency
    const poste = await prisma.poste.findUnique({ where: { id: posteId } });
    if (!poste || poste.ligneId !== ligneId) {
      throw new BadRequestError("Le poste n'existe pas ou n'appartient pas à la ligne spécifiée");
    }

    const ligne = await prisma.ligne.findUnique({ where: { id: ligneId } });
    if (!ligne || ligne.atelierId !== atelierId) {
      throw new BadRequestError("La ligne n'existe pas ou n'appartient pas à l'atelier spécifié");
    }

    // Create DI with a temporary numeroDI
    const di = await prisma.demandeIntervention.create({
      data: {
        numeroDI: 'TEMP-' + Date.now(),
        atelierId,
        ligneId,
        posteId,
        produit,
        referenceProduit,
        familleProduit,
        description,
        priorite,
        declareParId: userId,
      },
    });

    // Update with proper formatted numeroDI
    const formattedNumero = 'DI-' + di.id.toString().padStart(6, '0');
    return prisma.demandeIntervention.update({
      where: { id: di.id },
      data: { numeroDI: formattedNumero },
    });
  }

  public async updateDI(id: number, data: UpdateDIDTO) {
    return prisma.demandeIntervention.update({
      where: { id },
      data,
    });
  }

  public async deleteDI(id: number) {
    const di = await prisma.demandeIntervention.findUnique({
      where: { id },
    });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    if (di.statut !== StatutDI.NOUVELLE) {
      throw new BadRequestError("Impossible de supprimer une DI qui n'est plus à l'état NOUVELLE");
    }

    await prisma.demandeIntervention.delete({
      where: { id },
    });
  }

  public async getDIStats() {
    return prisma.demandeIntervention.groupBy({
      by: ['statut'],
      _count: true,
    });
  }
}

export const diService = new DiService();
