/*
  Warnings:

  - Added the required column `closeTime` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `openTime` to the `Court` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `court` ADD COLUMN `closeTime` VARCHAR(191) NOT NULL,
    ADD COLUMN `openTime` VARCHAR(191) NOT NULL;
