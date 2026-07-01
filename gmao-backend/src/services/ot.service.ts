import { StatutOT, StatutDI, Role } from '@prisma/client';
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

    const rapport = await prisma.rapportIntervention.create({
      data: {
        ...data,
        ordreTravailId: ot.id,
        redacteurId: currentUser.userId,
      },
    });

    await prisma.ordreTravail.update({
      where: { id: ot.id },
      data: { statut: StatutOT.EN_ATTENTE_VALIDATION, dateFin: new Date() },
    });

    if (ot.demandeInterventionId) {
      await prisma.demandeIntervention.update({
        where: { id: ot.demandeInterventionId },
        data: { statut: StatutDI.RESOLUE },
      });
    }

    return rapport;
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

    if (ot.statut !== StatutOT.CREE) {
      throw new BadRequestError("Seul un OT à l'état CREE peut être supprimé");
    }

    await prisma.ordreTravail.delete({ where: { id } });
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
