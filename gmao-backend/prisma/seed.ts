/**
 * @fileoverview Script de seed pour la base de données GMAO
 * @description Crée les utilisateurs initiaux avec les 4 rôles du système.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

async function main() {
  console.log('🌱 Début du seeding de la base de données GMAO...\n');

  // Hachage des mots de passe
  const [adminPassword, chefPassword, techPassword, magPassword] = await Promise.all([
    hashPassword('Admin@123'),
    hashPassword('Chef@123'),
    hashPassword('Tech@123'),
    hashPassword('Mag@1234'),
  ]);

  // Création de l'administrateur système
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmao.com' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'Système',
      email: 'admin@gmao.com',
      motDePasse: adminPassword,
      role: 'ADMIN',
      actif: true,
    },
  });
  console.log(`✅ Admin créé: ${admin.prenom} ${admin.nom} (${admin.email})`);

  // Création du chef de maintenance
  const chef = await prisma.user.upsert({
    where: { email: 'ahmed@gmao.com' },
    update: {},
    create: {
      nom: 'Benali',
      prenom: 'Ahmed',
      email: 'ahmed@gmao.com',
      motDePasse: chefPassword,
      role: 'CHEF_MAINTENANCE',
      actif: true,
    },
  });
  console.log(`✅ Chef de maintenance créé: ${chef.prenom} ${chef.nom} (${chef.email})`);

  // Création du technicien
  const technicien = await prisma.user.upsert({
    where: { email: 'karim@gmao.com' },
    update: {},
    create: {
      nom: 'Zaidi',
      prenom: 'Karim',
      email: 'karim@gmao.com',
      motDePasse: techPassword,
      role: 'TECHNICIEN',
      actif: true,
    },
  });
  console.log(`✅ Technicien créé: ${technicien.prenom} ${technicien.nom} (${technicien.email})`);

  // Création du chef technicien
  const chefTechPassword = await hashPassword('ChefTech@123');
  const chefTechnicien = await prisma.user.upsert({
    where: { email: 'cheftech@gmao.com' },
    update: {},
    create: {
      nom: 'Tech',
      prenom: 'Chef',
      email: 'cheftech@gmao.com',
      motDePasse: chefTechPassword,
      role: 'CHEF_TECHNICIEN',
      actif: true,
    },
  });
  console.log(`✅ Chef Technicien créé: ${chefTechnicien.prenom} ${chefTechnicien.nom} (${chefTechnicien.email})`);

  // Création du magasinier
  const magasinier = await prisma.user.upsert({
    where: { email: 'fatima@gmao.com' },
    update: {},
    create: {
      nom: 'Mansouri',
      prenom: 'Fatima',
      email: 'fatima@gmao.com',
      motDePasse: magPassword,
      role: 'MAGASINIER',
      actif: true,
    },
  });
  console.log(`✅ Magasinier créé: ${magasinier.prenom} ${magasinier.nom} (${magasinier.email})`);

  console.log('\n🎉 Seeding terminé avec succès!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
