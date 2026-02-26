CREATE TABLE roomietab.members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id uuid NOT NULL REFERENCES roomietab.households(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  display_name text NOT NULL,
  email text,
  avatar_url text,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  venmo_handle text,
  paypal_email text,
  notification_prefs jsonb NOT NULL DEFAULT '{"new_expense": true, "tagged": true, "month_end": true, "recurring": false}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_members_household_id ON roomietab.members(household_id);
CREATE INDEX idx_members_user_id ON roomietab.members(user_id);
CREATE UNIQUE INDEX idx_members_household_user ON roomietab.members(household_id, user_id) WHERE user_id IS NOT NULL;
