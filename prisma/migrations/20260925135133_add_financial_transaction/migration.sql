-- CreateEnum
CREATE TYPE "DebtType" AS ENUM ('TUITION', 'SCHOOL_HELP', 'BOOK', 'INSURANCE', 'BOOK_INSURANCE', 'TRIP', 'SCHOOL_SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('POS', 'CARD_TO_CARD', 'TRANSFER', 'CASH', 'CHECK', 'OTHER');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEBT', 'PAYMENT');

-- CreateTable
CREATE TABLE "financial_transaction" (
    "id" TEXT NOT NULL,
    "studentEnrollmentId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" BIGINT NOT NULL,
    "description" TEXT,
    "date" DATE NOT NULL,
    "debtType" "DebtType",
    "paymentMethod" "PaymentMethod",
    "lastEditedByUsername" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "financial_transaction_studentEnrollmentId_idx" ON "financial_transaction"("studentEnrollmentId");

-- CreateIndex
CREATE INDEX "financial_transaction_date_idx" ON "financial_transaction"("date");

-- CreateIndex
CREATE INDEX "financial_transaction_type_idx" ON "financial_transaction"("type");

-- AddForeignKey
ALTER TABLE "financial_transaction" ADD CONSTRAINT "financial_transaction_studentEnrollmentId_fkey" FOREIGN KEY ("studentEnrollmentId") REFERENCES "student_enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
