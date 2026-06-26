/**
 * @fileoverview Contrôleur des Ordres de Travail (OT)
 */

import { Request, Response, NextFunction } from 'express';
import { StatutOT, StatutDI, Role } from '@prisma/client';
import prisma from '../config/prisma';

export const getOTs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      statut,
      typeMaintenance,
      technicienId,
      atelierId,
      page = '1',
      limit = '20',
    } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (statut) where.statut = statut;
    if (typeMaintenance) where.typeMaintenance = typeMaintenance;
    if (technicienId) where.technicienId = parseInt(technicienId as string, 10);
    if (atelierId) where.atelierId = parseInt(atelierId as string, 10);

    if (req.user!.role === Role.TECHNICIEN) {
      where.technicienId = req.user!.userId;
    }

    const [total, ots] = await Promise.all([
      prisma.ordreTravail.count({ where }),
      prisma.ordreTravail.findMany({
        where,
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

    res.status(200).json({
      success: true,
      message: 'Ordres de travail récupérés avec succès',
      data: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        ots,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOTById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const ot = await prisma.ordreTravail.findUnique({
      where: { id: parseInt(id, 10) },
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
      res.status(404).json({ success: false, message: 'OT introuvable', code: 'NOT_FOUND' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'OT récupéré avec succès',
      data: ot,
    });
  } catch (error) {
    next(error);
  }
};

export const createOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
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
    } = req.body;

    let finalAtelierId = atelierId;
    let finalLigneId = ligneId;
    let finalPosteId = posteId;

    if (demandeInterventionId) {
      const di = await prisma.demandeIntervention.findUnique({
        where: { id: demandeInterventionId },
      });
      if (!di) {
        res.status(404).json({ success: false, message: 'DI introuvable', code: 'NOT_FOUND' });
        return;
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
    const updatedOT = await prisma.ordreTravail.update({
      where: { id: ot.id },
      data: { numeroOT: formattedNumero },
    });

    res.status(201).json({
      success: true,
      message: 'OT créé avec succès',
      data: updatedOT,
    });
  } catch (error) {
    next(error);
  }
};

export const updateOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { datePrevue, ...updateData } = req.body;

    if (datePrevue) {
      updateData.datePrevue = new Date(datePrevue);
    }

    const ot = await prisma.ordreTravail.update({
      where: { id: parseInt(id, 10) },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: 'OT mis à jour avec succès',
      data: ot,
    });
  } catch (error) {
    next(error);
  }
};

export const assignOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { technicienId } = req.body;

    const ot = await prisma.ordreTravail.update({
      where: { id: parseInt(id, 10) },
      data: { technicienId, statut: StatutOT.ASSIGNE },
    });

    res.status(200).json({
      success: true,
      message: 'Technicien assigné avec succès',
      data: ot,
    });
  } catch (error) {
    next(error);
  }
};

export const startOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const ot = await prisma.ordreTravail.findUnique({ where: { id: parseInt(id, 10) } });
    if (!ot) {
      res.status(404).json({ success: false, message: 'OT introuvable' });
      return;
    }

    if (ot.technicienId !== userId && req.user!.role !== Role.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Vous ne pouvez pas démarrer un OT qui ne vous est pas assigné',
      });
      return;
    }

    const updatedOT = await prisma.ordreTravail.update({
      where: { id: parseInt(id, 10) },
      data: { statut: StatutOT.EN_COURS, dateDebut: new Date() },
    });

    res.status(200).json({
      success: true,
      message: 'Intervention démarrée',
      data: updatedOT,
    });
  } catch (error) {
    next(error);
  }
};

export const submitRapport = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const ot = await prisma.ordreTravail.findUnique({
      where: { id: parseInt(id, 10) },
      include: { rapportIntervention: true },
    });
    if (!ot) {
      res.status(404).json({ success: false, message: 'OT introuvable' });
      return;
    }

    if (ot.technicienId !== userId && req.user!.role !== Role.ADMIN) {
      res
        .status(403)
        .json({ success: false, message: 'Seul le technicien assigné peut soumettre le rapport' });
      return;
    }

    if (ot.rapportIntervention) {
      res.status(400).json({ success: false, message: 'Un rapport existe déjà pour cet OT' });
      return;
    }

    const rapport = await prisma.rapportIntervention.create({
      data: {
        ...req.body,
        ordreTravailId: ot.id,
        redacteurId: userId,
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

    res.status(201).json({
      success: true,
      message: 'Rapport soumis avec succès, en attente de validation',
      data: rapport,
    });
  } catch (error) {
    next(error);
  }
};

export const validateOT = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const ot = await prisma.ordreTravail.update({
      where: { id: parseInt(id, 10) },
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

    res.status(200).json({
      success: true,
      message: 'OT validé et fermé',
      data: ot,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteOT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const ot = await prisma.ordreTravail.findUnique({ where: { id: parseInt(id, 10) } });
    if (!ot) {
      res.status(404).json({ success: false, message: 'OT introuvable' });
      return;
    }

    if (ot.statut !== StatutOT.CREE) {
      res
        .status(400)
        .json({ success: false, message: "Seul un OT à l'état CREE peut être supprimé" });
      return;
    }

    await prisma.ordreTravail.delete({ where: { id: parseInt(id, 10) } });

    res.status(200).json({ success: true, message: 'OT supprimé' });
  } catch (error) {
    next(error);
  }
};

export const getOTStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const [byStatut, byType] = await Promise.all([
      prisma.ordreTravail.groupBy({ by: ['statut'], _count: true }),
      prisma.ordreTravail.groupBy({ by: ['typeMaintenance'], _count: true }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Statistiques OT',
      data: { byStatut, byType },
    });
  } catch (error) {
    next(error);
  }
};
