import { CreatePlanDTO, UpdatePlanDTO } from '../../dtos/plan.dto';
import { PlanMaintenance, OrdreTravail } from '@prisma/client';
import { Paginated } from '../../utils/pagination';

export interface IPlanService {
  getPlans(filters: any, page: number, limit: number): Promise<Paginated<PlanMaintenance>>;
  getPlanById(id: number): Promise<PlanMaintenance>;
  createPlan(userId: number, data: CreatePlanDTO): Promise<PlanMaintenance>;
  updatePlan(id: number, data: UpdatePlanDTO): Promise<PlanMaintenance>;
  deletePlan(id: number): Promise<void>;
  triggerPlan(id: number): Promise<OrdreTravail>;
}
