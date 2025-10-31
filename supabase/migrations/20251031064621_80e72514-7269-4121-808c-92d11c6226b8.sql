-- Add cryptodivix and ProfessrWeb3 to approved X creators
INSERT INTO approved_x_creators (username, notes)
VALUES 
  ('cryptodivix', 'Added via admin request'),
  ('ProfessrWeb3', 'Added via admin request')
ON CONFLICT (username) DO NOTHING;