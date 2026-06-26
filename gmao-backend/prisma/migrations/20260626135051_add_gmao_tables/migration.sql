-- AlterTable
ALTER TABLE `refresh_tokens` ALTER COLUMN `expiresAt` DROP DEFAULT;

-- AlterTable
ALTER TABLE `users` MODIFY `role` ENUM('ADMIN', 'CHEF_MAINTENANCE', 'CHEF_TECHNICIEN', 'TECHNICIEN', 'MAGASINIER') NOT NULL DEFAULT 'TECHNICIEN';

-- CreateTable
CREATE TABLE `ateliers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lignes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `atelierId` INTEGER NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `lignes_atelierId_idx`(`atelierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `ligneId` INTEGER NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `postes_ligneId_idx`(`ligneId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `demandes_intervention` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroDI` VARCHAR(20) NOT NULL,
    `atelierId` INTEGER NOT NULL,
    `ligneId` INTEGER NOT NULL,
    `posteId` INTEGER NOT NULL,
    `produit` VARCHAR(200) NULL,
    `referenceProduit` VARCHAR(100) NULL,
    `familleProduit` VARCHAR(100) NULL,
    `description` TEXT NOT NULL,
    `priorite` ENUM('BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE') NOT NULL DEFAULT 'MOYENNE',
    `statut` ENUM('NOUVELLE', 'EN_COURS', 'RESOLUE', 'CLOTUREE') NOT NULL DEFAULT 'NOUVELLE',
    `declareParId` INTEGER NOT NULL,
    `dateDeclaration` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `demandes_intervention_numeroDI_key`(`numeroDI`),
    INDEX `demandes_intervention_atelierId_idx`(`atelierId`),
    INDEX `demandes_intervention_ligneId_idx`(`ligneId`),
    INDEX `demandes_intervention_posteId_idx`(`posteId`),
    INDEX `demandes_intervention_declareParId_idx`(`declareParId`),
    INDEX `demandes_intervention_statut_idx`(`statut`),
    INDEX `demandes_intervention_priorite_idx`(`priorite`),
    INDEX `demandes_intervention_dateDeclaration_idx`(`dateDeclaration`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ordres_travail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numeroOT` VARCHAR(20) NOT NULL,
    `demandeInterventionId` INTEGER NULL,
    `technicienId` INTEGER NULL,
    `atelierId` INTEGER NOT NULL,
    `ligneId` INTEGER NOT NULL,
    `posteId` INTEGER NOT NULL,
    `datePrevue` DATE NULL,
    `priorite` ENUM('BASSE', 'MOYENNE', 'HAUTE', 'CRITIQUE') NOT NULL DEFAULT 'MOYENNE',
    `statut` ENUM('CREE', 'ASSIGNE', 'EN_COURS', 'EN_ATTENTE_VALIDATION', 'FERME') NOT NULL DEFAULT 'CREE',
    `typeMaintenance` ENUM('CORRECTIVE', 'PREVENTIVE') NOT NULL DEFAULT 'CORRECTIVE',
    `description` TEXT NULL,
    `planMaintenanceId` INTEGER NULL,
    `valideParId` INTEGER NULL,
    `dateValidation` DATETIME(3) NULL,
    `dateDebut` DATETIME(3) NULL,
    `dateFin` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ordres_travail_numeroOT_key`(`numeroOT`),
    INDEX `ordres_travail_demandeInterventionId_idx`(`demandeInterventionId`),
    INDEX `ordres_travail_technicienId_idx`(`technicienId`),
    INDEX `ordres_travail_atelierId_idx`(`atelierId`),
    INDEX `ordres_travail_ligneId_idx`(`ligneId`),
    INDEX `ordres_travail_posteId_idx`(`posteId`),
    INDEX `ordres_travail_statut_idx`(`statut`),
    INDEX `ordres_travail_typeMaintenance_idx`(`typeMaintenance`),
    INDEX `ordres_travail_planMaintenanceId_idx`(`planMaintenanceId`),
    INDEX `ordres_travail_datePrevue_idx`(`datePrevue`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rapports_intervention` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordreTravailId` INTEGER NOT NULL,
    `diagnostic` TEXT NOT NULL,
    `causePanne` TEXT NULL,
    `actionsRealisees` TEXT NOT NULL,
    `tempsIntervention` INTEGER NOT NULL,
    `tempsArret` INTEGER NULL,
    `piecesUtilisees` TEXT NULL,
    `commentaires` TEXT NULL,
    `redacteurId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `rapports_intervention_ordreTravailId_key`(`ordreTravailId`),
    INDEX `rapports_intervention_redacteurId_idx`(`redacteurId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `plans_maintenance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `intitule` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `atelierId` INTEGER NOT NULL,
    `ligneId` INTEGER NOT NULL,
    `posteId` INTEGER NOT NULL,
    `frequence` ENUM('HEBDOMADAIRE', 'MENSUELLE', 'TRIMESTRIELLE', 'SEMESTRIELLE', 'ANNUELLE') NOT NULL,
    `actif` BOOLEAN NOT NULL DEFAULT true,
    `dernierExecution` DATETIME(3) NULL,
    `prochaineExecution` DATE NULL,
    `creeParId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `plans_maintenance_atelierId_idx`(`atelierId`),
    INDEX `plans_maintenance_ligneId_idx`(`ligneId`),
    INDEX `plans_maintenance_posteId_idx`(`posteId`),
    INDEX `plans_maintenance_creeParId_idx`(`creeParId`),
    INDEX `plans_maintenance_prochaineExecution_idx`(`prochaineExecution`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lignes` ADD CONSTRAINT `lignes_atelierId_fkey` FOREIGN KEY (`atelierId`) REFERENCES `ateliers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postes` ADD CONSTRAINT `postes_ligneId_fkey` FOREIGN KEY (`ligneId`) REFERENCES `lignes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_atelierId_fkey` FOREIGN KEY (`atelierId`) REFERENCES `ateliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_ligneId_fkey` FOREIGN KEY (`ligneId`) REFERENCES `lignes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_posteId_fkey` FOREIGN KEY (`posteId`) REFERENCES `postes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_declareParId_fkey` FOREIGN KEY (`declareParId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_demandeInterventionId_fkey` FOREIGN KEY (`demandeInterventionId`) REFERENCES `demandes_intervention`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_technicienId_fkey` FOREIGN KEY (`technicienId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_atelierId_fkey` FOREIGN KEY (`atelierId`) REFERENCES `ateliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_ligneId_fkey` FOREIGN KEY (`ligneId`) REFERENCES `lignes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_posteId_fkey` FOREIGN KEY (`posteId`) REFERENCES `postes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_planMaintenanceId_fkey` FOREIGN KEY (`planMaintenanceId`) REFERENCES `plans_maintenance`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ordres_travail` ADD CONSTRAINT `ordres_travail_valideParId_fkey` FOREIGN KEY (`valideParId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapports_intervention` ADD CONSTRAINT `rapports_intervention_ordreTravailId_fkey` FOREIGN KEY (`ordreTravailId`) REFERENCES `ordres_travail`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rapports_intervention` ADD CONSTRAINT `rapports_intervention_redacteurId_fkey` FOREIGN KEY (`redacteurId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans_maintenance` ADD CONSTRAINT `plans_maintenance_atelierId_fkey` FOREIGN KEY (`atelierId`) REFERENCES `ateliers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans_maintenance` ADD CONSTRAINT `plans_maintenance_ligneId_fkey` FOREIGN KEY (`ligneId`) REFERENCES `lignes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans_maintenance` ADD CONSTRAINT `plans_maintenance_posteId_fkey` FOREIGN KEY (`posteId`) REFERENCES `postes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `plans_maintenance` ADD CONSTRAINT `plans_maintenance_creeParId_fkey` FOREIGN KEY (`creeParId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
