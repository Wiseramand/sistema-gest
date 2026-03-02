-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "institutionFeedback" DROP NOT NULL,
ALTER COLUMN "institutionFeedback" SET DATA TYPE TEXT,
ALTER COLUMN "trainerFeedback" DROP NOT NULL,
ALTER COLUMN "trainerFeedback" SET DATA TYPE TEXT,
ALTER COLUMN "courseFeedback" DROP NOT NULL,
ALTER COLUMN "courseFeedback" SET DATA TYPE TEXT;
