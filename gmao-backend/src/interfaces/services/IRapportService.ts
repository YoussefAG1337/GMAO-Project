import { RapportIntervention, Role } from '@prisma/client';
import { Paginated } from '../../utils/pagination';

export interface IRapportService {
  getRapports(
    currentUser: { userId: number; role: Role },
    page: number,
    limit: number,
  ): Promise<Paginated<RapportIntervention>>;
  getRapportById(id: number): Promise<RapportIntervention>;
  getRapportByOT(otId: number): Promise<RapportIntervention>;
}
