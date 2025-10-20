-- Delete old generic welcome messages from conversations with historical advisors
-- This will allow new custom welcome messages to be displayed
DELETE FROM messages 
WHERE role = 'system' 
AND conversation_id IN (
  SELECT c.id 
  FROM conversations c
  JOIN advisors a ON c.tutor_id = a.id
  WHERE a.is_official = true
)
AND (
  content LIKE 'Hi! I''m %.%How can I help you today?'
  OR content LIKE 'Hi! I am %.%How can I help you today?'
  OR content = 'Hi! I''m Jethro. How can I help you today?'
);