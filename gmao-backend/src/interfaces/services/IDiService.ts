import { CreateDIDTO, UpdateDIDTO } from '../../dtos/di.dto';
import { DemandeIntervention, OutboxEvent } from '@prisma/client';
import { Paginated } from '../../utils/pagination';

export interface IDiService {
  getDIs(filters: any, page: number, limit: number): Promise<Paginated<DemandeIntervention>>;
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
