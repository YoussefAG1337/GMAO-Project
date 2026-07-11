import { StatutOT, StatutDI, Role, TypeMouvement } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors';
import { IOtService } from '../interfaces/services/IOtService';
import { CreateOTDTO, UpdateOTDTO, SubmitRapportDTO } from '../dtos/ot.dto';

class OtService implements IOtService {
  public async getOTs(
    filters: any,
    pageNum: number,
    limitNum: number,
    currentUser: { userId: number; role: Role },
  ) {
    const skip = (pageNum - 1) * limitNum;

    if (currentUser.role === Role.TECHNICIEN) {
      filters.technicienId = currentUser.userId;
    }

    const [total, ots] = await Promise.all([
      prisma.ordreTravail.count({ where: filters }),
      prisma.ordreTravail.findMany({
        where: filters,
        include: {
          atelier: { select: { nom: true } },
          ligne: { select: { nom: true } },
          poste: { select: { nom: true } },
          technicien: { select: { nom: true, prenom: true } },
          demandeIntervention: { select: { numeroDI: true } },
        },
        orderBy: [{ datePrevue: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limitNum,
      }),
    ]);

    return {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      ots,
    };
  }

  public async getOTById(id: number) {
    const ot = await prisma.ordreTravail.findUnique({
      where: { id },
      include: {
        atelier: true,
        ligne: true,
        poste: true,
        technicien: { select: { id: true, nom: true, prenom: true } },
        demandeIntervention: true,
        rapportIntervention: true,
      },
    });

    if (!ot) {
      throw new NotFoundError('OT introuvable');
    }

    return ot;
  }

  public async createOT(data: CreateOTDTO) {
    const {
      demandeInterventionId,
      technicienId,
      atelierId,
      ligneId,
      posteId,
      datePrevue,
      priorite,
      typeMaintenance,
      description,
    } = data;

    let finalAtelierId = atelierId;
    let finalLigneId = ligneId;
    let finalPosteId = posteId;

    if (demandeInterventionId) {
      const di = await prisma.demandeIntervention.findUnique({
        where: { id: demandeInterventionId },
      });
      if (!di) {
        throw new NotFoundError('DI introuvable');
      }
      finalAtelierId = di.atelierId;
      finalLigneId = di.ligneId;
      finalPosteId = di.posteId;

      if (di.statut === StatutDI.NOUVELLE) {
        await prisma.demandeIntervention.update({
          where: { id: demandeInterventionId },
          data: { statut: StatutDI.EN_COURS },
        });
      }
    }

    const ot = await prisma.ordreTravail.create({
      data: {
        numeroOT: 'TEMP-' + Date.now(),
        demandeInterventionId,
        technicienId,
        atelierId: finalAtelierId,
        ligneId: finalLigneId,
        posteId: finalPosteId,
        datePrevue: datePrevue ? new Date(datePrevue) : null,
        priorite,
        typeMaintenance,
        description,
        statut: technicienId ? StatutOT.ASSIGNE : StatutOT.CREE,
      },
    });

    const formattedNumero = 'OT-' + ot.id.toString().padStart(6, '0');
    return prisma.ordreTravail.update({
      where: { id: ot.id },
      data: { numeroOT: formattedNumero },
    });
  }

  public async updateOT(id: number, data: UpdateOTDTO) {
    const { datePrevue, ...updateData } = data;

    const preparedData: any = { ...updateData };
    if (datePrevue) {
      preparedData.datePrevue = new Date(datePrevue);
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: preparedData,
    });
  }

  public async assignOT(id: number, technicienId: number) {
    return prisma.ordreTravail.update({
      where: { id },
      data: { technicienId, statut: StatutOT.ASSIGNE },
    });
  }

  public async startOT(id: number, currentUser: { userId: number; role: Role }) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });

    if (!ot) {
      throw new NotFoundError('OT introuvable');
    }

    if (ot.technicienId !== currentUser.userId && currentUser.role !== Role.ADMIN) {
      throw new UnauthorizedError('Vous ne pouvez pas démarrer un OT qui ne vous est pas assigné');
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.EN_COURS, dateDebut: new Date() },
    });
  }

  public async startFromDi(diId: number, userId: number) {
    const di = await prisma.demandeIntervention.findUnique({
      where: { id: diId },
    });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    if (di.technicienId !== userId && di.declareParId !== userId) {
      throw new UnauthorizedError("Vous n'êtes pas assigné à cette DI");
    }

    if (di.statut === StatutDI.RESOLUE || di.statut === StatutDI.CLOTUREE) {
      throw new BadRequestError('Cette DI est déjà résolue ou clôturée');
    }

    // Create the OT
    const ot = await prisma.ordreTravail.create({
      data: {
        numeroOT: 'TEMP-' + Date.now(),
        demandeInterventionId: di.id,
        technicienId: userId,
        atelierId: di.atelierId,
        ligneId: di.ligneId,
        posteId: di.posteId,
        datePrevue: new Date(),
        dateDebut: new Date(),
        statut: StatutOT.EN_COURS,
        description: `OT créé automatiquement à partir de la DI ${di.numeroDI}`,
      },
    });

    const formattedNumero = 'OT-' + ot.id.toString().padStart(6, '0');
    const updatedOT = await prisma.ordreTravail.update({
      where: { id: ot.id },
      data: { numeroOT: formattedNumero },
    });

    // Update DI status
    await prisma.demandeIntervention.update({
      where: { id: di.id },
      data: { statut: StatutDI.EN_COURS },
    });

    return updatedOT;
  }

  public async submitRapport(
    id: number,
    data: SubmitRapportDTO,
    currentUser: { userId: number; role: Role },
  ) {
    const ot = await prisma.ordreTravail.findUnique({
      where: { id },
      include: { rapportIntervention: true },
    });

    if (!ot) {
      throw new NotFoundError('OT introuvable');
    }

    if (ot.technicienId !== currentUser.userId && currentUser.role !== Role.ADMIN) {
      throw new UnauthorizedError('Seul le technicien assigné peut soumettre le rapport');
    }

    if (ot.rapportIntervention) {
      throw new BadRequestError('Un rapport existe déjà pour cet OT');
    }

    const { piecesUtilisees, ...rapportData } = data;

    return prisma.$transaction(async (tx) => {
      const rapport = await tx.rapportIntervention.create({
        data: {
          ...rapportData,
          ordreTravailId: ot.id,
          redacteurId: currentUser.userId,
        },
      });

      // Handle piecesUtilisees
      if (piecesUtilisees && piecesUtilisees.length > 0) {
        await tx.pieceUtilisee.createMany({
          data: piecesUtilisees.map((p) => ({
            rapportInterventionId: rapport.id,
            pieceId: p.pieceId,
            quantite: p.quantite,
          })),
        });

        for (const pu of piecesUtilisees) {
          // Verify stock
          const piece = await tx.pieceRechange.findUnique({ where: { id: pu.pieceId } });
          if (!piece || piece.quantiteStock < pu.quantite) {
            throw new BadRequestError(`Stock insuffisant pour la pièce ID: ${pu.pieceId}`);
          }

          // Create MouvementStock (Sortie)
          await tx.mouvementStock.create({
            data: {
              pieceId: pu.pieceId,
              type: TypeMouvement.SORTIE,
              quantite: pu.quantite,
              referenceOT: ot.numeroOT,
              userId: currentUser.userId,
            },
          });

          // Update stock quantity
          await tx.pieceRechange.update({
            where: { id: pu.pieceId },
            data: { quantiteStock: { decrement: pu.quantite } },
          });
        }
      }

      await tx.ordreTravail.update({
        where: { id: ot.id },
        data: { statut: StatutOT.EN_ATTENTE_VALIDATION, dateFin: new Date() },
      });

      if (ot.demandeInterventionId) {
        await tx.demandeIntervention.update({
          where: { id: ot.demandeInterventionId },
          data: { statut: StatutDI.RESOLUE },
        });
      }

      return rapport;
    });
  }

  public async validateOT(id: number, userId: number) {
    const ot = await prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.FERME, valideParId: userId, dateValidation: new Date() },
    });

    if (ot.demandeInterventionId) {
      const allOTs = await prisma.ordreTravail.findMany({
        where: { demandeInterventionId: ot.demandeInterventionId },
      });
      const allClosed = allOTs.every((o) => o.statut === StatutOT.FERME);

      if (allClosed) {
        await prisma.demandeIntervention.update({
          where: { id: ot.demandeInterventionId },
          data: { statut: StatutDI.CLOTUREE },
        });
      }
    }

    return ot;
  }

  public async deleteOT(id: number) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });

    if (!ot) {
      throw new NotFoundError('OT introuvable');
    }

    // Restriction removed: ADMINs can delete OT in any state

    await prisma.$transaction(async (tx) => {
      const rapport = await tx.rapportIntervention.findUnique({
        where: { ordreTravailId: id },
      });

      if (rapport) {
        await tx.pieceUtilisee.deleteMany({
          where: { rapportInterventionId: rapport.id },
        });
        await tx.rapportIntervention.delete({
          where: { id: rapport.id },
        });
      }

      await tx.ordreTravail.delete({ where: { id } });
    });
  }

  public async getOTStats() {
    const [byStatut, byType] = await Promise.all([
      prisma.ordreTravail.groupBy({ by: ['statut'], _count: true }),
      prisma.ordreTravail.groupBy({ by: ['typeMaintenance'], _count: true }),
    ]);

    return { byStatut, byType };
  }
}

export const otService = new OtService();
