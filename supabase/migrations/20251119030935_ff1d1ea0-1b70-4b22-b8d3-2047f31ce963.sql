-- Update demo store logo to public path
UPDATE stores 
SET logo_url = '/sim-demo-logo.png'
WHERE x_username = 'sim';

-- Update all product images to public paths
UPDATE products 
SET image_urls = '["/products/headphones.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Wireless Noise-Canceling Headphones';

UPDATE products 
SET image_urls = '["/products/fitness-watch.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Smart Fitness Watch';

UPDATE products 
SET image_urls = '["/products/leather-wallet.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Premium Leather Wallet';

UPDATE products 
SET image_urls = '["/products/cotton-tshirt.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Organic Cotton T-Shirt';

UPDATE products 
SET image_urls = '["/products/water-bottle.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Stainless Steel Water Bottle';

UPDATE products 
SET image_urls = '["/products/bluetooth-speaker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Portable Bluetooth Speaker';

UPDATE products 
SET image_urls = '["/products/memory-foam-pillow.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Memory Foam Pillow';

UPDATE products 
SET image_urls = '["/products/face-serum.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Natural Face Serum';

UPDATE products 
SET image_urls = '["/products/yoga-mat.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Yoga Mat Pro';

UPDATE products 
SET image_urls = '["/products/coffee-maker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Coffee Maker Deluxe';

UPDATE products 
SET image_urls = '["/products/reading-lamp.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Reading Lamp LED';

UPDATE products 
SET image_urls = '["/products/running-shoes.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Running Shoes Ultra';