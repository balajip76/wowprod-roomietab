-- Auto-update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION roomietab.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON roomietab.households
  FOR EACH ROW EXECUTE FUNCTION roomietab.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON roomietab.members
  FOR EACH ROW EXECUTE FUNCTION roomietab.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON roomietab.expenses
  FOR EACH ROW EXECUTE FUNCTION roomietab.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON roomietab.recurring_templates
  FOR EACH ROW EXECUTE FUNCTION roomietab.update_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON roomietab.settlements
  FOR EACH ROW EXECUTE FUNCTION roomietab.update_updated_at();
