import { StatutOT, TypeMaintenance, FrequenceMaintenance } from '@prisma/client';
import prisma from '../config/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { IPlanService } from '../interfaces/services/IPlanService';
import { CreatePlanDTO, UpdatePlanDTO } from '../dtos/plan.dto';
import { generateOTFromPlan } from './preventive.service';

class PlanService implements IPlanService {
  public async getPlans(filters: any) {
    return prisma.planMaintenance.findMany({
      where: filters,
      include: {
        atelier: { select: { nom: true } },
        ligne: { select: { nom: true } },
        poste: { select: { nom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async getPlanById(id: number) {
    const plan = await prisma.planMaintenance.findUnique({
      where: { id },
      include: {
        atelier: true,
        ligne: true,
        poste: true,
        creePar: { select: { id: true, nom: true, prenom: true } },
        ordresTravail: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!plan) {
      throw new NotFoundError('Plan de maintenance introuvable');
    }

    return plan;
  }

  public async createPlan(userId: number, data: CreatePlanDTO) {
    const { intitule, description, atelierId, ligneId, posteId, frequence, prochaineExecution } =
      data;
    const prochaineDate = prochaineExecution ? new Date(prochaineExecution) : new Date();

    if (!prochaineExecution) {
      switch (frequence) {
        case FrequenceMaintenance.HEBDOMADAIRE:
          prochaineDate.setDate(prochaineDate.getDate() + 7);
          break;
        case FrequenceMaintenance.MENSUELLE:
          prochaineDate.setMonth(prochaineDate.getMonth() + 1);
          break;
        case FrequenceMaintenance.TRIMESTRIELLE:
          prochaineDate.setMonth(prochaineDate.getMonth() + 3);
          break;
        case FrequenceMaintenance.SEMESTRIELLE:
          prochaineDate.setMonth(prochaineDate.getMonth() + 6);
          break;
        case FrequenceMaintenance.ANNUELLE:
          prochaineDate.setFullYear(prochaineDate.getFullYear() + 1);
          break;
      }
    }

    return prisma.planMaintenance.create({
      data: {
        intitule,
        description,
        atelierId,
        ligneId,
        posteId,
        frequence,
        prochaineExecution: prochaineDate,
        creeParId: userId,
      },
    });
  }

  public async updatePlan(id: number, data: UpdatePlanDTO) {
    const { prochaineExecution, ...updateData } = data;

    const preparedData: any = { ...updateData };
    if (prochaineExecution) {
      preparedData.prochaineExecution = new Date(prochaineExecution);
    }

    return prisma.planMaintenance.update({
      where: { id },
      data: preparedData,
    });
  }

  public async deletePlan(id: number) {
    await prisma.planMaintenance.delete({
      where: { id },
    });
  }

  public async triggerPlan(id: number) {
    try {
      return await generateOTFromPlan(id);
    } catch (error: any) {
      if (error.message === 'Plan de maintenance introuvable') {
        throw new NotFoundError(error.message);
      }
      if (error.message === 'Ce plan de maintenance est inactif') {
        throw new BadRequestError(error.message);
      }
      throw error;
    }
  }
}

export const planService = new PlanService();
