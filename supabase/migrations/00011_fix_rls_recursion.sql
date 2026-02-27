-- Fix infinite recursion in RLS policies
-- The original policies on members referenced members itself, causing infinite loops.
-- Solution: use a SECURITY DEFINER function that bypasses RLS to check membership.

-- 1. Create SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION roomietab.get_my_household_ids()
RETURNS SETOF uuid
LANGUAGE sql SECURITY DEFINER SET search_path = roomietab
AS $$
  SELECT household_id FROM roomietab.members WHERE user_id = auth.uid() AND is_active = true;
$$;

GRANT EXECUTE ON FUNCTION roomietab.get_my_household_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION roomietab.get_my_household_ids() TO anon;
GRANT EXECUTE ON FUNCTION roomietab.get_my_household_ids() TO service_role;

-- 2. Drop recursive policies
DROP POLICY IF EXISTS "Users can view households they belong to" ON roomietab.households;
DROP POLICY IF EXISTS "Authenticated users can create households" ON roomietab.households;
DROP POLICY IF EXISTS "Only admin can update household" ON roomietab.households;
DROP POLICY IF EXISTS "Members can view other members in their household" ON roomietab.members;
DROP POLICY IF EXISTS "Users can insert themselves as members" ON roomietab.members;
DROP POLICY IF EXISTS "Members can update their own profile" ON roomietab.members;
DROP POLICY IF EXISTS "Members can view expenses in their household" ON roomietab.expenses;
DROP POLICY IF EXISTS "Members can create expenses in their household" ON roomietab.expenses;
DROP POLICY IF EXISTS "Members can update expenses in their household" ON roomietab.expenses;
DROP POLICY IF EXISTS "Members can soft-delete expenses in their household" ON roomietab.expenses;
DROP POLICY IF EXISTS "Members can view splits for expenses in their household" ON roomietab.expense_splits;
DROP POLICY IF EXISTS "Members can create splits for expenses in their household" ON roomietab.expense_splits;
DROP POLICY IF EXISTS "Members can update splits for expenses in their household" ON roomietab.expense_splits;
DROP POLICY IF EXISTS "Members can delete splits for expenses in their household" ON roomietab.expense_splits;
DROP POLICY IF EXISTS "Members can view recurring templates in their household" ON roomietab.recurring_templates;
DROP POLICY IF EXISTS "Members can create recurring templates" ON roomietab.recurring_templates;
DROP POLICY IF EXISTS "Members can update recurring templates" ON roomietab.recurring_templates;
DROP POLICY IF EXISTS "Members can view settlements in their household" ON roomietab.settlements;
DROP POLICY IF EXISTS "Members can create settlements" ON roomietab.settlements;
DROP POLICY IF EXISTS "Members can update settlements" ON roomietab.settlements;
DROP POLICY IF EXISTS "Members can view settlement transactions" ON roomietab.settlement_transactions;
DROP POLICY IF EXISTS "Members can create settlement transactions" ON roomietab.settlement_transactions;
DROP POLICY IF EXISTS "Members can update settlement transactions" ON roomietab.settlement_transactions;

-- 3. Recreate non-recursive policies using get_my_household_ids()

-- Households
CREATE POLICY "Users can view households they belong to" ON roomietab.households
  FOR SELECT USING (id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Authenticated users can create households" ON roomietab.households
  FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Only admin can update household" ON roomietab.households
  FOR UPDATE USING (id IN (SELECT roomietab.get_my_household_ids()));

-- Members
CREATE POLICY "Members can view other members in their household" ON roomietab.members
  FOR SELECT USING (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Users can insert themselves as members" ON roomietab.members
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Members can update their own profile" ON roomietab.members
  FOR UPDATE USING (user_id = auth.uid());

-- Expenses
CREATE POLICY "Members can view expenses in their household" ON roomietab.expenses
  FOR SELECT USING (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can create expenses in their household" ON roomietab.expenses
  FOR INSERT WITH CHECK (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can update expenses in their household" ON roomietab.expenses
  FOR UPDATE USING (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can soft-delete expenses in their household" ON roomietab.expenses
  FOR DELETE USING (household_id IN (SELECT roomietab.get_my_household_ids()));

-- Expense splits
CREATE POLICY "Members can view splits for expenses in their household" ON roomietab.expense_splits
  FOR SELECT USING (expense_id IN (
    SELECT id FROM roomietab.expenses WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
CREATE POLICY "Members can create splits for expenses in their household" ON roomietab.expense_splits
  FOR INSERT WITH CHECK (expense_id IN (
    SELECT id FROM roomietab.expenses WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
CREATE POLICY "Members can update splits for expenses in their household" ON roomietab.expense_splits
  FOR UPDATE USING (expense_id IN (
    SELECT id FROM roomietab.expenses WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
CREATE POLICY "Members can delete splits for expenses in their household" ON roomietab.expense_splits
  FOR DELETE USING (expense_id IN (
    SELECT id FROM roomietab.expenses WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));

-- Recurring templates
CREATE POLICY "Members can view recurring templates in their household" ON roomietab.recurring_templates
  FOR SELECT USING (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can create recurring templates" ON roomietab.recurring_templates
  FOR INSERT WITH CHECK (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can update recurring templates" ON roomietab.recurring_templates
  FOR UPDATE USING (household_id IN (SELECT roomietab.get_my_household_ids()));

-- Settlements
CREATE POLICY "Members can view settlements in their household" ON roomietab.settlements
  FOR SELECT USING (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can create settlements" ON roomietab.settlements
  FOR INSERT WITH CHECK (household_id IN (SELECT roomietab.get_my_household_ids()));
CREATE POLICY "Members can update settlements" ON roomietab.settlements
  FOR UPDATE USING (household_id IN (SELECT roomietab.get_my_household_ids()));

-- Settlement transactions
CREATE POLICY "Members can view settlement transactions" ON roomietab.settlement_transactions
  FOR SELECT USING (settlement_id IN (
    SELECT id FROM roomietab.settlements WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
CREATE POLICY "Members can create settlement transactions" ON roomietab.settlement_transactions
  FOR INSERT WITH CHECK (settlement_id IN (
    SELECT id FROM roomietab.settlements WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
CREATE POLICY "Members can update settlement transactions" ON roomietab.settlement_transactions
  FOR UPDATE USING (settlement_id IN (
    SELECT id FROM roomietab.settlements WHERE household_id IN (SELECT roomietab.get_my_household_ids())
  ));
