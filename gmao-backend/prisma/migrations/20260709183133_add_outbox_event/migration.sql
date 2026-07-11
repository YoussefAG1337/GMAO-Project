/*
  Warnings:

  - You are about to drop the column `description` on the `demandes_intervention` table. All the data in the column will be lost.
  - You are about to drop the column `familleProduit` on the `demandes_intervention` table. All the data in the column will be lost.
  - You are about to drop the column `produit` on the `demandes_intervention` table. All the data in the column will be lost.
  - You are about to drop the column `referenceProduit` on the `demandes_intervention` table. All the data in the column will be lost.
  - You are about to drop the column `piecesUtilisees` on the `rapports_intervention` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `demandes_intervention` DROP COLUMN `description`,
    DROP COLUMN `familleProduit`,
    DROP COLUMN `produit`,
    DROP COLUMN `referenceProduit`,
    ADD COLUMN `documentUtileUrl` VARCHAR(500) NULL,
    ADD COLUMN `panneId` INTEGER NULL,
    ADD COLUMN `produitId` INTEGER NULL,
    ADD COLUMN `technicienId` INTEGER NULL;

-- AlterTable
ALTER TABLE `rapports_intervention` DROP COLUMN `piecesUtilisees`;

-- AlterTable
ALTER TABLE `refresh_tokens` ALTER COLUMN `expiresAt` DROP DEFAULT;

-- CreateTable
CREATE TABLE `pannes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `ligneId` INTEGER NULL,
    `posteId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pannes_ligneId_idx`(`ligneId`),
    INDEX `pannes_posteId_idx`(`posteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `familles_produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `familles_produits_nom_key`(`nom`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `produits` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(200) NOT NULL,
    `familleProduitId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `produits_familleProduitId_idx`(`familleProduitId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pieces_rechange` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `nom` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `quantiteStock` INTEGER NOT NULL DEFAULT 0,
    `seuilAlerte` INTEGER NOT NULL DEFAULT 5,
    `prixUnitaire` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `pieces_rechange_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mouvements_stock` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `pieceId` INTEGER NOT NULL,
    `type` ENUM('ENTREE', 'SORTIE') NOT NULL,
    `quantite` INTEGER NOT NULL,
    `referenceOT` VARCHAR(50) NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `mouvements_stock_pieceId_idx`(`pieceId`),
    INDEX `mouvements_stock_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pieces_utilisees` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rapportInterventionId` INTEGER NOT NULL,
    `pieceId` INTEGER NOT NULL,
    `quantite` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `pieces_utilisees_rapportInterventionId_idx`(`rapportInterventionId`),
    INDEX `pieces_utilisees_pieceId_idx`(`pieceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `outbox_events` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(100) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'QUEUED', 'PROCESSED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `outbox_events_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_TechnicienLignes` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_TechnicienLignes_AB_unique`(`A`, `B`),
    INDEX `_TechnicienLignes_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `demandes_intervention_produitId_idx` ON `demandes_intervention`(`produitId`);

-- CreateIndex
CREATE INDEX `demandes_intervention_technicienId_idx` ON `demandes_intervention`(`technicienId`);

-- CreateIndex
CREATE INDEX `demandes_intervention_panneId_idx` ON `demandes_intervention`(`panneId`);

-- AddForeignKey
ALTER TABLE `pannes` ADD CONSTRAINT `pannes_ligneId_fkey` FOREIGN KEY (`ligneId`) REFERENCES `lignes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pannes` ADD CONSTRAINT `pannes_posteId_fkey` FOREIGN KEY (`posteId`) REFERENCES `postes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `produits` ADD CONSTRAINT `produits_familleProduitId_fkey` FOREIGN KEY (`familleProduitId`) REFERENCES `familles_produits`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvements_stock` ADD CONSTRAINT `mouvements_stock_pieceId_fkey` FOREIGN KEY (`pieceId`) REFERENCES `pieces_rechange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mouvements_stock` ADD CONSTRAINT `mouvements_stock_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pieces_utilisees` ADD CONSTRAINT `pieces_utilisees_rapportInterventionId_fkey` FOREIGN KEY (`rapportInterventionId`) REFERENCES `rapports_intervention`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pieces_utilisees` ADD CONSTRAINT `pieces_utilisees_pieceId_fkey` FOREIGN KEY (`pieceId`) REFERENCES `pieces_rechange`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_technicienId_fkey` FOREIGN KEY (`technicienId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_produitId_fkey` FOREIGN KEY (`produitId`) REFERENCES `produits`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `demandes_intervention` ADD CONSTRAINT `demandes_intervention_panneId_fkey` FOREIGN KEY (`panneId`) REFERENCES `pannes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TechnicienLignes` ADD CONSTRAINT `_TechnicienLignes_A_fkey` FOREIGN KEY (`A`) REFERENCES `lignes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_TechnicienLignes` ADD CONSTRAINT `_TechnicienLignes_B_fkey` FOREIGN KEY (`B`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
