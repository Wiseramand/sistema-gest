/*
  Warnings:

  - You are about to drop the column `specialization` on the `Trainer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Classroom" ADD COLUMN     "availability" TEXT NOT NULL DEFAULT 'Disponível';

-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "contactPerson" TEXT,
ADD COLUMN     "logo" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "materials" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "students" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Matriculation" ADD COLUMN     "amountDue" INTEGER DEFAULT 0,
ADD COLUMN     "classroom" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "duration" TEXT,
ADD COLUMN     "paymentStatus" TEXT DEFAULT 'Pendente',
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "trainer" TEXT;

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "clientType" TEXT NOT NULL DEFAULT 'Particular',
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "course" TEXT,
ADD COLUMN     "idDocument" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Ativo',
ADD COLUMN     "validity" TEXT;

-- AlterTable
ALTER TABLE "Trainer" DROP COLUMN "specialization",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "idDocument" TEXT,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "photo" TEXT,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'Ativo',
ADD COLUMN     "students" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "validity" TEXT;
