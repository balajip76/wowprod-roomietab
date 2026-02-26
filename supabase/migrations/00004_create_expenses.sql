CREATE TABLE roomietab.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES roomietab.households(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  category text NOT NULL DEFAULT 'other' CHECK (category IN ('rent', 'utilities', 'groceries', 'dining', 'subscriptions', 'transport', 'household', 'other')),
  split_type text NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
  paid_by_member_id uuid NOT NULL REFERENCES roomietab.members(id),
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url text,
  is_recurring boolean NOT NULL DEFAULT false,
  recurring_day integer CHECK (recurring_day >= 1 AND recurring_day <= 31),
  recurring_template_id uuid,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_household_id ON roomietab.expenses(household_id);
CREATE INDEX idx_expenses_paid_by ON roomietab.expenses(paid_by_member_id);
CREATE INDEX idx_expenses_household_date ON roomietab.expenses(household_id, expense_date DESC) WHERE is_deleted = false;
CREATE INDEX idx_expenses_category ON roomietab.expenses(household_id, category) WHERE is_deleted = false;
