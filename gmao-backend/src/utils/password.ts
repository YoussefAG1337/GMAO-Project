/**
 * @fileoverview Utilitaires de gestion des mots de passe
 * @description Fournit les fonctions de hachage et de comparaison des mots de passe avec bcryptjs.
 */

import bcrypt from 'bcryptjs';

/**
 * Hache un mot de passe avec bcrypt
 * @param password - Mot de passe en clair
 * @returns Mot de passe haché
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
}

/**
 * Compare un mot de passe en clair avec son hash
 * @param password - Mot de passe en clair
 * @param hash - Hash bcrypt stocké en base de données
 * @returns true si les mots de passe correspondent
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
