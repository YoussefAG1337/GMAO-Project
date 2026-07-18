import { CreateOTDTO, UpdateOTDTO, SubmitRapportDTO } from '../../dtos/ot.dto';
import { OrdreTravail, RapportIntervention, Role } from '@prisma/client';

export interface IOtService {
  getOTs(
    filters: any,
    pageNum: number,
    limitNum: number,
    currentUser: { userId: number; role: Role },
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    ots: OrdreTravail[];
  }>;
  getOTById(id: number): Promise<OrdreTravail>;
  createOT(data: CreateOTDTO): Promise<OrdreTravail>;
  updateOT(id: number, data: UpdateOTDTO): Promise<OrdreTravail>;
  assignOT(id: number, technicienId: number): Promise<OrdreTravail>;
  startOT(id: number, currentUser: { userId: number; role: Role }): Promise<OrdreTravail>;
  submitRapport(
    id: number,
    data: SubmitRapportDTO,
    currentUser: { userId: number; role: Role },
  ): Promise<RapportIntervention>;
  validerTechnicien(id: number, currentUser: { userId: number; role: Role }): Promise<OrdreTravail>;
  validateOT(id: number, userId: number): Promise<OrdreTravail>;
  reporterOT(id: number, raison: string, currentUser: { userId: number; role: Role }): Promise<OrdreTravail>;
  annulerOT(id: number, raison: string, currentUser: { userId: number; role: Role }): Promise<OrdreTravail>;
  nonValiderOT(id: number, raison: string, currentUser: { userId: number; role: Role }): Promise<OrdreTravail>;
  deleteOT(id: number): Promise<void>;
  getOTStats(): Promise<any>;
}
