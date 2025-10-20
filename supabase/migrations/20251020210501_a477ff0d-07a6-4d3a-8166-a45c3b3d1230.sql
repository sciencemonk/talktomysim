-- Update sim descriptions with AI-generated display text
UPDATE advisors 
SET description = CASE id
  WHEN 'c2c0cca5-f42a-46e6-9535-a156477b2737' THEN 'Transforms your business concepts into profitable venture ideas with strategic market insights and innovative solutions.'
  WHEN '9e057f9d-b723-4706-bcc0-feac96bb3182' THEN 'Find spiritual guidance and comfort through relevant scripture tailored to your life''s challenges and questions.'
  WHEN 'da28fb12-3ddf-4258-be2f-2ae2760d8798' THEN 'Journey through ancient Rome with engaging historical narratives, vivid storytelling, and expert insights into emperors and empires.'
  WHEN '44643cb2-0d0c-4fea-98e2-66e36bd6bf5a' THEN 'Get personalized meal plans tailored to your lifestyle, health goals, and dietary preferences for balanced nutrition.'
  WHEN '0fd5bcc0-ff8c-4157-a27e-753146c3c27b' THEN 'Analyze Solana wallets to identify whale activity, assess portfolio holdings, and evaluate on-chain metrics.'
END
WHERE id IN (
  'c2c0cca5-f42a-46e6-9535-a156477b2737',
  '9e057f9d-b723-4706-bcc0-feac96bb3182',
  'da28fb12-3ddf-4258-be2f-2ae2760d8798',
  '44643cb2-0d0c-4fea-98e2-66e36bd6bf5a',
  '0fd5bcc0-ff8c-4157-a27e-753146c3c27b'
);