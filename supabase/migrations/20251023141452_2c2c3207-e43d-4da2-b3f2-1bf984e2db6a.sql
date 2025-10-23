-- Remove Adolf Hitler sim and associated data
-- First delete related embeddings
DELETE FROM advisor_embeddings 
WHERE advisor_id IN (
  SELECT id FROM advisors WHERE custom_url = 'adolf-hitler'
);

-- Delete related documents
DELETE FROM advisor_documents 
WHERE advisor_id IN (
  SELECT id FROM advisors WHERE custom_url = 'adolf-hitler'
);

-- Delete conversation embeddings
DELETE FROM conversation_embeddings 
WHERE advisor_id IN (
  SELECT id FROM advisors WHERE custom_url = 'adolf-hitler'
);

-- Delete messages from conversations with this advisor
DELETE FROM messages 
WHERE conversation_id IN (
  SELECT id FROM conversations 
  WHERE advisor_id IN (
    SELECT id FROM advisors WHERE custom_url = 'adolf-hitler'
  )
);

-- Delete conversations
DELETE FROM conversations 
WHERE advisor_id IN (
  SELECT id FROM advisors WHERE custom_url = 'adolf-hitler'
);

-- Finally, delete the advisor
DELETE FROM advisors WHERE custom_url = 'adolf-hitler';