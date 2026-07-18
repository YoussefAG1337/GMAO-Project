import { StatutDI } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { IDiService } from '../interfaces/services/IDiService';
import { CreateDIDTO, UpdateDIDTO } from '../dtos/di.dto';
import { Role } from '@prisma/client';
import { DiAssignmentEmailData } from './email.service';

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
          panne: { select: { nom: true } },
          produit: { select: { nom: true } },
          technicien: { select: { nom: true, prenom: true } },
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
        panne: true,
        declarePar: { select: { id: true, nom: true, prenom: true } },
        ordresTravail: true,
      },
    });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    return di;
  }

  public async createDI(userId: number, data: CreateDIDTO, documentUtileUrl?: string) {
    const {
      atelierId,
      ligneId,
      posteId,
      produitId,
      panneId,
      nouvellePanneNom,
      nouvellePanneType,
      priorite,
    } = data as CreateDIDTO & {
      nouvellePanneNom?: string;
      nouvellePanneType?: 'TECHNIQUE' | 'QUALITE';
    };

    // Validate hierarchy consistency
    const poste = await prisma.poste.findUnique({ where: { id: posteId } });
    if (!poste || poste.ligneId !== ligneId) {
      throw new BadRequestError("Le poste n'existe pas ou n'appartient pas à la ligne spécifiée");
    }

    const ligne = await prisma.ligne.findUnique({
      where: { id: ligneId },
      include: { techniciens: true },
    });
    if (!ligne || ligne.atelierId !== atelierId) {
      throw new BadRequestError("La ligne n'existe pas ou n'appartient pas à l'atelier spécifié");
    }

    // Auto-assign to the requested technician or the first technician associated with this line
    let technicienId = data.technicienId;
    if (!technicienId && ligne.techniciens && ligne.techniciens.length > 0) {
      technicienId = ligne.techniciens[0].id;
    }

    // --- MAGIC HAPPENS HERE: We wrap everything in $transaction ---
    return await prisma.$transaction(async (tx) => {
      let finalPanneId = panneId;
      if (nouvellePanneNom && !finalPanneId) {
        const newPanne = await tx.panne.create({
          data: { nom: nouvellePanneNom, type: nouvellePanneType, ligneId, posteId },
        });
        finalPanneId = newPanne.id;
      }

      // Create DI with a temporary numeroDI
      const di = await tx.demandeIntervention.create({
        data: {
          numeroDI: 'TEMP-' + Date.now(),
          atelierId,
          ligneId,
          posteId,
          produitId,
          panneId: finalPanneId,
          documentUtileUrl,
          priorite,
          declareParId: userId,
          technicienId,
        },
      });

      // Update with proper formatted numeroDI AND include everything needed to enrich the email
      const formattedNumero = di.id.toString().padStart(6, '0');
      const updatedDi = await tx.demandeIntervention.update({
        where: { id: di.id },
        data: { numeroDI: formattedNumero },
        include: {
          technicien: true, // We need this to get their email address!
          atelier: { select: { nom: true } },
          ligne: { select: { nom: true } },
          poste: { select: { nom: true } },
          produit: { select: { nom: true } },
          panne: { select: { nom: true, description: true, type: true } },
        },
      });

      // If assigned to a technician, safely log our intent to send an email
      let outboxEvent = null;
      if (updatedDi.technicienId && updatedDi.technicien?.email) {
        const emailData: DiAssignmentEmailData = {
          diNumero: updatedDi.numeroDI,
          atelier: updatedDi.atelier.nom,
          ligne: updatedDi.ligne.nom,
          poste: updatedDi.poste.nom,
          priorite: updatedDi.priorite,
          produit: updatedDi.produit?.nom ?? null,
          panneNom: updatedDi.panne?.nom ?? null,
          panneDescription: updatedDi.panne?.description ?? null,
          panneType: updatedDi.panne?.type ?? null,
        };

        outboxEvent = await tx.outboxEvent.create({
          data: {
            type: 'EMAIL_DI_ASSIGNED',
            payload: {
              ...emailData,
              technicienEmail: updatedDi.technicien.email,
            },
            status: 'PENDING',
          },
        });
      }

      // Return both so the controller knows if it should push to Redis
      return { updatedDi, outboxEvent };
    });
  }

  public async updateDI(
    id: number,
    data: UpdateDIDTO & { nouvellePanneNom?: string; nouvellePanneType?: 'TECHNIQUE' | 'QUALITE' },
  ) {
    const { nouvellePanneNom, nouvellePanneType, ...updateData } = data;

    let finalPanneId = updateData.panneId;
    if (nouvellePanneNom && !finalPanneId) {
      // If we create a new panne, we need ligneId and posteId from the existing DI or the update data
      const existingDi = await prisma.demandeIntervention.findUnique({ where: { id } });
      if (existingDi) {
        const ligneId = updateData.ligneId || existingDi.ligneId;
        const posteId = updateData.posteId || existingDi.posteId;
        const newPanne = await prisma.panne.create({
          data: { nom: nouvellePanneNom, type: nouvellePanneType, ligneId, posteId },
        });
        finalPanneId = newPanne.id;
      }
    }

    if (finalPanneId !== undefined) {
      updateData.panneId = finalPanneId;
    }

    return prisma.demandeIntervention.update({
      where: { id },
      data: updateData,
    });
  }

  public async deleteDI(id: number) {
    const di = await prisma.demandeIntervention.findUnique({
      where: { id },
    });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    // Restriction removed: ADMINs can delete DI in any state

    await prisma.$transaction(async (tx) => {
      const ots = await tx.ordreTravail.findMany({
        where: { demandeInterventionId: id },
      });

      for (const ot of ots) {
        const rapport = await tx.rapportIntervention.findUnique({
          where: { ordreTravailId: ot.id },
        });
        if (rapport) {
          await tx.pieceUtilisee.deleteMany({
            where: { rapportInterventionId: rapport.id },
          });
          await tx.rapportIntervention.delete({
            where: { id: rapport.id },
          });
        }
        await tx.ordreTravail.delete({ where: { id: ot.id } });
      }

      await tx.demandeIntervention.delete({
        where: { id },
      });
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
