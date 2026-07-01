import {
  CreateAtelierDTO,
  UpdateAtelierDTO,
  CreateLigneDTO,
  UpdateLigneDTO,
  CreatePosteDTO,
  UpdatePosteDTO,
} from '../../dtos/equipement.dto';
import { Atelier, Ligne, Poste } from '@prisma/client';

export interface IEquipementService {
  getAteliers(actif?: boolean): Promise<Atelier[]>;
  getAtelierById(id: number): Promise<Atelier>;
  createAtelier(data: CreateAtelierDTO): Promise<Atelier>;
  updateAtelier(id: number, data: UpdateAtelierDTO): Promise<Atelier>;
  deleteAtelier(id: number): Promise<any>;

  getLignes(atelierId?: number, actif?: boolean): Promise<Ligne[]>;
  getLigneById(id: number): Promise<Ligne>;
  createLigne(data: CreateLigneDTO): Promise<Ligne>;
  updateLigne(id: number, data: UpdateLigneDTO): Promise<Ligne>;
  deleteLigne(id: number): Promise<any>;

  getPostes(ligneId?: number, actif?: boolean): Promise<Poste[]>;
  getPosteById(id: number): Promise<Poste>;
  createPoste(data: CreatePosteDTO): Promise<Poste>;
  updatePoste(id: number, data: UpdatePosteDTO): Promise<Poste>;
  deletePoste(id: number): Promise<any>;
}
