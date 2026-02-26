-- Enable Supabase Realtime for live sync tables
ALTER PUBLICATION supabase_realtime ADD TABLE roomietab.expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE roomietab.settlement_transactions;
