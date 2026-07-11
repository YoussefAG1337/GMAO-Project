import { CreateDIDTO, UpdateDIDTO } from '../../dtos/di.dto';
import { DemandeIntervention, OutboxEvent } from '@prisma/client';

export interface IDiService {
  getDIs(
    filters: any,
    pageNum: number,
    limitNum: number,
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    dis: DemandeIntervention[];
  }>;
  getDIById(id: number): Promise<DemandeIntervention>;
  createDI(
    userId: number,
    data: CreateDIDTO,
    documentUtileUrl?: string,
  ): Promise<{
    updatedDi: DemandeIntervention;
    outboxEvent: OutboxEvent | null;
  }>;
  updateDI(id: number, data: UpdateDIDTO): Promise<DemandeIntervention>;
  deleteDI(id: number): Promise<any>;
  getDIStats(): Promise<any>;
}
