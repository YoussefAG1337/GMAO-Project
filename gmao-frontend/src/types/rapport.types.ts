import { Ot } from './ot.types';
import { User } from './index';

export interface Rapport {
  id: number;
  diagnostic: string;
  causePanne: string;
  actionsRealisees: string;
  tempsIntervention: number;
  tempsArret?: number;
  commentaires: string;
  ordreTravailId: number;
  ordreTravail?: Ot & { numeroOT?: string };
  redacteurId: number;
  redacteur?: User;
  createdAt: string;
  updatedAt: string;
}
