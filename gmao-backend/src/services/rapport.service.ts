import { Role } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError } from '../utils/errors';
import { IRapportService } from '../interfaces/services/IRapportService';

class RapportService implements IRapportService {
  public async getRapports(currentUser: { userId: number; role: Role }) {
    const where: any = {};
    if (currentUser.role === Role.TECHNICIEN) {
      where.redacteurId = currentUser.userId;
    }

    return prisma.rapportIntervention.findMany({
      where,
      include: {
        ordreTravail: {
          include: {
            atelier: { select: { nom: true } },
            ligne: { select: { nom: true } },
            poste: { select: { nom: true } },
          },
        },
        redacteur: { select: { nom: true, prenom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getRapportById(id: number) {
    const rapport = await prisma.rapportIntervention.findUnique({
      where: { id },
      include: {
        ordreTravail: true,
        redacteur: { select: { nom: true, prenom: true } },
      },
    });

    if (!rapport) {
      throw new NotFoundError('Rapport introuvable');
    }

    return rapport;
  }

  public async getRapportByOT(otId: number) {
    const rapport = await prisma.rapportIntervention.findUnique({
      where: { ordreTravailId: otId },
    });

    if (!rapport) {
      throw new NotFoundError('Rapport introuvable pour cet OT');
    }

    return rapport;
  }
}

export const rapportService = new RapportService();
