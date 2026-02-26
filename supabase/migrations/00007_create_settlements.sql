CREATE TABLE roomietab.settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES roomietab.households(id) ON DELETE CASCADE,
  month date NOT NULL,
  is_archived boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  archived_by uuid REFERENCES roomietab.members(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_settlements_household ON roomietab.settlements(household_id);
CREATE UNIQUE INDEX idx_settlements_household_month ON roomietab.settlements(household_id, month);

CREATE TABLE roomietab.settlement_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id uuid NOT NULL REFERENCES roomietab.settlements(id) ON DELETE CASCADE,
  payer_member_id uuid NOT NULL REFERENCES roomietab.members(id),
  receiver_member_id uuid NOT NULL REFERENCES roomietab.members(id),
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  is_settled boolean NOT NULL DEFAULT false,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (payer_member_id != receiver_member_id)
);

CREATE INDEX idx_stxn_settlement ON roomietab.settlement_transactions(settlement_id);
CREATE INDEX idx_stxn_payer ON roomietab.settlement_transactions(payer_member_id);
CREATE INDEX idx_stxn_receiver ON roomietab.settlement_transactions(receiver_member_id);
