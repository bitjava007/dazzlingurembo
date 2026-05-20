CREATE TABLE IF NOT EXISTS "bank_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bank_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "iban" TEXT,
    "swift" TEXT,
    "currency_code" TEXT NOT NULL DEFAULT 'XOF',
    "branch_id" TEXT NOT NULL,
    "current_balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "bank_transactions" (
    "id" TEXT NOT NULL,
    "bank_account_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bank_transactions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "bank_accounts_account_number_key" ON "bank_accounts"("account_number");
CREATE INDEX IF NOT EXISTS "bank_accounts_branch_id_idx" ON "bank_accounts"("branch_id");
CREATE INDEX IF NOT EXISTS "bank_accounts_deleted_at_idx" ON "bank_accounts"("deleted_at");
CREATE INDEX IF NOT EXISTS "bank_transactions_bank_account_id_idx" ON "bank_transactions"("bank_account_id");
CREATE INDEX IF NOT EXISTS "bank_transactions_type_idx" ON "bank_transactions"("type");
CREATE INDEX IF NOT EXISTS "bank_transactions_transaction_date_idx" ON "bank_transactions"("transaction_date");

ALTER TABLE "bank_transactions" ADD CONSTRAINT IF NOT EXISTS "bank_transactions_bank_account_id_fkey"
    FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
