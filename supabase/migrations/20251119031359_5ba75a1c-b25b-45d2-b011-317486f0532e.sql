-- Fix all product image URLs for demo store
UPDATE products 
SET image_urls = '["headphones.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Premium Wireless Headphones';

UPDATE products 
SET image_urls = '["fitness-watch.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Smart Watch Pro';

UPDATE products 
SET image_urls = '["leather-wallet.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Genuine Leather Wallet';

UPDATE products 
SET image_urls = '["cotton-tshirt.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Premium Cotton T-Shirt';

UPDATE products 
SET image_urls = '["water-bottle.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Insulated Water Bottle';

UPDATE products 
SET image_urls = '["bluetooth-speaker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Portable Bluetooth Speaker';

UPDATE products 
SET image_urls = '["memory-foam-pillow.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Memory Foam Pillow';

UPDATE products 
SET image_urls = '["face-serum.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Vitamin C Face Serum';

UPDATE products 
SET image_urls = '["yoga-mat.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Eco-Friendly Yoga Mat';

UPDATE products 
SET image_urls = '["coffee-maker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Programmable Coffee Maker';

UPDATE products 
SET image_urls = '["reading-lamp.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Adjustable Reading Lamp';

UPDATE products 
SET image_urls = '["running-shoes.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Performance Running Shoes';

-- Fix store logo
UPDATE stores 
SET logo_url = 'sim-demo-logo.png'
WHERE x_username = 'sim';