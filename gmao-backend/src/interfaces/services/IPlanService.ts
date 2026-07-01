import { CreatePlanDTO, UpdatePlanDTO } from '../../dtos/plan.dto';
import { PlanMaintenance, OrdreTravail } from '@prisma/client';

export interface IPlanService {
  getPlans(filters: any): Promise<PlanMaintenance[]>;
  getPlanById(id: number): Promise<PlanMaintenance>;
  createPlan(userId: number, data: CreatePlanDTO): Promise<PlanMaintenance>;
  updatePlan(id: number, data: UpdatePlanDTO): Promise<PlanMaintenance>;
  deletePlan(id: number): Promise<void>;
  triggerPlan(id: number): Promise<OrdreTravail>;
}
