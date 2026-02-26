-- Enable RLS on all tables
ALTER TABLE roomietab.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.recurring_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE roomietab.settlement_transactions ENABLE ROW LEVEL SECURITY;

-- Households policies
CREATE POLICY "Users can view households they belong to" ON roomietab.households
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = households.id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Authenticated users can create households" ON roomietab.households
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Only admin can update household" ON roomietab.households
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = households.id
      AND members.user_id = auth.uid()
      AND members.role = 'admin'
      AND members.is_active = true
    )
  );

-- Members policies
CREATE POLICY "Members can view other members in their household" ON roomietab.members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.members AS m
      WHERE m.household_id = members.household_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Users can insert themselves as members" ON roomietab.members
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM roomietab.members AS m
      WHERE m.household_id = members.household_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

CREATE POLICY "Members can update their own profile" ON roomietab.members
  FOR UPDATE USING (user_id = auth.uid());

-- Expenses policies
CREATE POLICY "Members can view expenses in their household" ON roomietab.expenses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = expenses.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can create expenses in their household" ON roomietab.expenses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = expenses.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can update expenses in their household" ON roomietab.expenses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = expenses.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can soft-delete expenses in their household" ON roomietab.expenses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = expenses.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

-- Expense splits policies
CREATE POLICY "Members can view splits for expenses in their household" ON roomietab.expense_splits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.expenses e
      JOIN roomietab.members m ON m.household_id = e.household_id
      WHERE e.id = expense_splits.expense_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Members can create splits for expenses in their household" ON roomietab.expense_splits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roomietab.expenses e
      JOIN roomietab.members m ON m.household_id = e.household_id
      WHERE e.id = expense_splits.expense_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Members can update splits for expenses in their household" ON roomietab.expense_splits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.expenses e
      JOIN roomietab.members m ON m.household_id = e.household_id
      WHERE e.id = expense_splits.expense_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Members can delete splits for expenses in their household" ON roomietab.expense_splits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM roomietab.expenses e
      JOIN roomietab.members m ON m.household_id = e.household_id
      WHERE e.id = expense_splits.expense_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

-- Recurring templates policies
CREATE POLICY "Members can view recurring templates in their household" ON roomietab.recurring_templates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = recurring_templates.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can create recurring templates" ON roomietab.recurring_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = recurring_templates.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can update recurring templates" ON roomietab.recurring_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = recurring_templates.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

-- Settlements policies
CREATE POLICY "Members can view settlements in their household" ON roomietab.settlements
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = settlements.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can create settlements" ON roomietab.settlements
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = settlements.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

CREATE POLICY "Members can update settlements" ON roomietab.settlements
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.members
      WHERE members.household_id = settlements.household_id
      AND members.user_id = auth.uid()
      AND members.is_active = true
    )
  );

-- Settlement transactions policies
CREATE POLICY "Members can view settlement transactions" ON roomietab.settlement_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM roomietab.settlements s
      JOIN roomietab.members m ON m.household_id = s.household_id
      WHERE s.id = settlement_transactions.settlement_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Members can create settlement transactions" ON roomietab.settlement_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM roomietab.settlements s
      JOIN roomietab.members m ON m.household_id = s.household_id
      WHERE s.id = settlement_transactions.settlement_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Members can update settlement transactions" ON roomietab.settlement_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM roomietab.settlements s
      JOIN roomietab.members m ON m.household_id = s.household_id
      WHERE s.id = settlement_transactions.settlement_id
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );
