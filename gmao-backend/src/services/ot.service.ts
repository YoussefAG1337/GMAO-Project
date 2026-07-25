import { StatutOT, StatutDI, Role, TypeMouvement } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError, BadRequestError, UnauthorizedError } from '../utils/errors';
import { IOtService } from '../interfaces/services/IOtService';
import { CreateOTDTO, UpdateOTDTO, SubmitRapportDTO } from '../dtos/ot.dto';
import { buildPagination, paginated } from '../utils/pagination';

class OtService implements IOtService {
  public async getOTs(
    filters: any,
    page: number,
    limit: number,
    currentUser: { userId: number; role: Role },
  ) {
    const { skip, take } = buildPagination(page, limit);

    if (currentUser.role === Role.TECHNICIEN) {
      filters.technicienId = currentUser.userId;
    }

    const [total, items] = await Promise.all([
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
        take,
      }),
    ]);

    return paginated(items, total, page, limit);
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
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });
    if (!ot) throw new NotFoundError('OT introuvable');

    // Allow reassigning from NON_VALIDE — resets the OT back to EN_COURS
    const newStatut = ot.statut === StatutOT.NON_VALIDE ? StatutOT.EN_COURS : StatutOT.ASSIGNE;

    return prisma.ordreTravail.update({
      where: { id },
      data: { technicienId, statut: newStatut, raisonNonValidation: null },
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
    const di = await prisma.demandeIntervention.findUnique({ where: { id: diId } });

    if (!di) {
      throw new NotFoundError('DI introuvable');
    }

    if (di.technicienId !== userId && di.declareParId !== userId) {
      throw new UnauthorizedError("Vous n'êtes pas assigné à cette DI");
    }

    if (di.statut === StatutDI.RESOLUE || di.statut === StatutDI.CLOTUREE) {
      throw new BadRequestError('Cette DI est déjà résolue ou clôturée');
    }

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

    if (ot.statut === StatutOT.EN_ATTENTE_VALIDATION || ot.statut === StatutOT.FERME) {
      throw new BadRequestError('Le rapport ne peut plus être modifié après validation');
    }

    const { piecesUtilisees, ...rapportData } = data;

    return prisma.$transaction(async (tx) => {
      let rapport;

      if (ot.rapportIntervention) {
        // Update existing rapport (tech can re-submit before validating)
        await tx.pieceUtilisee.deleteMany({
          where: { rapportInterventionId: ot.rapportIntervention.id },
        });
        rapport = await tx.rapportIntervention.update({
          where: { id: ot.rapportIntervention.id },
          data: { ...rapportData, redacteurId: currentUser.userId },
        });
      } else {
        // First submission
        rapport = await tx.rapportIntervention.create({
          data: {
            ...rapportData,
            ordreTravailId: ot.id,
            redacteurId: currentUser.userId,
          },
        });
      }

      if (piecesUtilisees && piecesUtilisees.length > 0) {
        await tx.pieceUtilisee.createMany({
          data: piecesUtilisees.map((p) => ({
            rapportInterventionId: rapport.id,
            pieceId: p.pieceId,
            quantite: p.quantite,
          })),
        });

        for (const pu of piecesUtilisees) {
          const piece = await tx.pieceRechange.findUnique({ where: { id: pu.pieceId } });
          if (!piece || piece.quantiteStock < pu.quantite) {
            throw new BadRequestError(`Stock insuffisant pour la pièce ID: ${pu.pieceId}`);
          }

          await tx.mouvementStock.create({
            data: {
              pieceId: pu.pieceId,
              type: TypeMouvement.SORTIE,
              quantite: pu.quantite,
              referenceOT: ot.numeroOT,
              userId: currentUser.userId,
            },
          });

          await tx.pieceRechange.update({
            where: { id: pu.pieceId },
            data: { quantiteStock: { decrement: pu.quantite } },
          });
        }
      }

      // Move to RAPPORTE — rapport still editable until tech self-validates
      await tx.ordreTravail.update({
        where: { id: ot.id },
        data: { statut: StatutOT.RAPPORTE, dateFin: new Date() },
      });

      return rapport;
    });
  }

  public async validerTechnicien(id: number, currentUser: { userId: number; role: Role }) {
    const ot = await prisma.ordreTravail.findUnique({
      where: { id },
      include: { rapportIntervention: true },
    });

    if (!ot) throw new NotFoundError('OT introuvable');

    if (ot.statut !== StatutOT.RAPPORTE) {
      throw new BadRequestError(
        'Seul un OT à l\'état "Rapporté" peut être validé par le technicien',
      );
    }

    if (ot.technicienId !== currentUser.userId && currentUser.role !== Role.ADMIN) {
      throw new UnauthorizedError('Seul le technicien assigné peut valider son travail');
    }

    if (!ot.rapportIntervention) {
      throw new BadRequestError('Un rapport doit être soumis avant de valider');
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.EN_ATTENTE_VALIDATION },
    });
  }

  public async validateOT(id: number, userId: number) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });
    if (!ot) throw new NotFoundError('OT introuvable');

    if (ot.statut !== StatutOT.EN_ATTENTE_VALIDATION) {
      throw new BadRequestError('Seul un OT en attente de validation peut être validé');
    }

    const updatedOt = await prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.FERME, valideParId: userId, dateValidation: new Date() },
    });

    if (updatedOt.demandeInterventionId) {
      const allOTs = await prisma.ordreTravail.findMany({
        where: { demandeInterventionId: updatedOt.demandeInterventionId },
      });
      const allClosed = allOTs.every((o) => o.statut === StatutOT.FERME);

      if (allClosed) {
        await prisma.demandeIntervention.update({
          where: { id: updatedOt.demandeInterventionId },
          data: { statut: StatutDI.CLOTUREE },
        });
      }
    }

    return updatedOt;
  }

  public async reporterOT(id: number, raison: string, currentUser: { userId: number; role: Role }) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });
    if (!ot) throw new NotFoundError('OT introuvable');

    if (ot.statut !== StatutOT.EN_COURS) {
      throw new BadRequestError('Seul un OT en cours peut être reporté');
    }

    if (ot.technicienId !== currentUser.userId && currentUser.role !== Role.ADMIN) {
      throw new UnauthorizedError("Vous n'êtes pas autorisé à reporter cet OT");
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.REPORTE, raisonReport: raison },
    });
  }

  public async annulerOT(id: number, raison: string, currentUser: { userId: number; role: Role }) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });
    if (!ot) throw new NotFoundError('OT introuvable');

    const cancellableStatuts: StatutOT[] = [StatutOT.EN_COURS, StatutOT.RAPPORTE];
    if (!cancellableStatuts.includes(ot.statut)) {
      throw new BadRequestError('Cet OT ne peut pas être annulé dans son état actuel');
    }

    if (ot.technicienId !== currentUser.userId && currentUser.role !== Role.ADMIN) {
      throw new UnauthorizedError("Vous n'êtes pas autorisé à annuler cet OT");
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.ANNULE, raisonAnnulation: raison },
    });
  }

  public async nonValiderOT(
    id: number,
    raison: string,
    currentUser: { userId: number; role: Role },
  ) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });
    if (!ot) throw new NotFoundError('OT introuvable');

    const isAdminOrChef =
      currentUser.role === Role.ADMIN || currentUser.role === Role.CHEF_TECHNICIEN;

    if (ot.statut === StatutOT.RAPPORTE) {
      if (ot.technicienId !== currentUser.userId && !isAdminOrChef) {
        throw new UnauthorizedError("Vous n'êtes pas autorisé à effectuer cette action");
      }
    } else if (ot.statut === StatutOT.EN_ATTENTE_VALIDATION) {
      if (!isAdminOrChef) {
        throw new UnauthorizedError('Seul un admin ou chef peut rejeter à cette étape');
      }
    } else {
      throw new BadRequestError("L'OT ne peut pas être marqué non validé dans son état actuel");
    }

    return prisma.ordreTravail.update({
      where: { id },
      data: { statut: StatutOT.NON_VALIDE, raisonNonValidation: raison },
    });
  }

  public async deleteOT(id: number) {
    const ot = await prisma.ordreTravail.findUnique({ where: { id } });

    if (!ot) {
      throw new NotFoundError('OT introuvable');
    }

    await prisma.$transaction(async (tx) => {
      const rapport = await tx.rapportIntervention.findUnique({
        where: { ordreTravailId: id },
      });

      if (rapport) {
        await tx.pieceUtilisee.deleteMany({ where: { rapportInterventionId: rapport.id } });
        await tx.rapportIntervention.delete({ where: { id: rapport.id } });
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
