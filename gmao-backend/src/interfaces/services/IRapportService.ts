import { RapportIntervention, Role } from '@prisma/client';

export interface IRapportService {
  getRapports(currentUser: { userId: number; role: Role }): Promise<RapportIntervention[]>;
  getRapportById(id: number): Promise<RapportIntervention>;
  getRapportByOT(otId: number): Promise<RapportIntervention>;
}
