import prisma from '../config/prisma';

class PanneService {
  public async getPannes(filters: any) {
    return prisma.panne.findMany({
      where: filters,
      orderBy: { nom: 'asc' },
    });
  }

  public async createPanne(data: {
    nom: string;
    description?: string;
    ligneId?: number;
    posteId?: number;
  }) {
    return prisma.panne.create({
      data,
    });
  }

  public async updatePanne(id: number, data: { nom?: string; description?: string }) {
    return prisma.panne.update({
      where: { id },
      data,
    });
  }

  public async deletePanne(id: number) {
    return prisma.panne.delete({
      where: { id },
    });
  }
}

export const panneService = new PanneService();
