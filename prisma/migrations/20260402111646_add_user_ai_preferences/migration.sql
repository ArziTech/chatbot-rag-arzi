-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anthropicKey" TEXT,
ADD COLUMN     "defaultModel" TEXT NOT NULL DEFAULT 'gpt-4o',
ADD COLUMN     "defaultProvider" TEXT NOT NULL DEFAULT 'openai',
ADD COLUMN     "openaiKey" TEXT;

-- CreateTable
CREATE TABLE "RuntimeEnv" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RuntimeEnv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RuntimeEnv_userId_idx" ON "RuntimeEnv"("userId");

-- CreateIndex
CREATE INDEX "RuntimeEnv_isActive_idx" ON "RuntimeEnv"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "RuntimeEnv_userId_key_key" ON "RuntimeEnv"("userId", "key");

-- AddForeignKey
ALTER TABLE "RuntimeEnv" ADD CONSTRAINT "RuntimeEnv_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
