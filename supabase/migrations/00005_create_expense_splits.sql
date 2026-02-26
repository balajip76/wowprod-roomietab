CREATE TABLE roomietab.expense_splits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_id uuid NOT NULL REFERENCES roomietab.expenses(id) ON DELETE CASCADE,
  member_id uuid NOT NULL REFERENCES roomietab.members(id),
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  percentage numeric(5,2) CHECK (percentage >= 0 AND percentage <= 100),
  shares integer CHECK (shares >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_splits_expense_id ON roomietab.expense_splits(expense_id);
CREATE INDEX idx_splits_member_id ON roomietab.expense_splits(member_id);
CREATE UNIQUE INDEX idx_splits_expense_member ON roomietab.expense_splits(expense_id, member_id);
