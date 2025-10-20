-- Set custom_url for Sapphire Cloud
UPDATE advisors
SET custom_url = 'sapphire-cloud'
WHERE id = '93d82f1b-7027-45a5-bca8-1de4cc91e8ff' AND name = 'Sapphire Cloud' AND custom_url IS NULL;