CREATE TABLE roomietab.recurring_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES roomietab.households(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  category text NOT NULL CHECK (category IN ('rent', 'utilities', 'groceries', 'dining', 'subscriptions', 'transport', 'household', 'other')),
  split_type text NOT NULL DEFAULT 'equal' CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
  paid_by_member_id uuid NOT NULL REFERENCES roomietab.members(id),
  split_config jsonb NOT NULL DEFAULT '[]'::jsonb,
  day_of_month integer NOT NULL CHECK (day_of_month >= 1 AND day_of_month <= 31),
  is_active boolean NOT NULL DEFAULT true,
  last_generated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurring_household ON roomietab.recurring_templates(household_id);
CREATE INDEX idx_recurring_active_day ON roomietab.recurring_templates(day_of_month) WHERE is_active = true;
