-- Update demo store logo
UPDATE stores 
SET logo_url = '/src/assets/sim-demo-logo.png'
WHERE x_username = 'sim';

-- Update product images for demo store
-- Product 1: Wireless Noise-Canceling Headphones
UPDATE products 
SET image_urls = '["/src/assets/products/headphones.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Wireless Noise-Canceling Headphones';

-- Product 2: Smart Fitness Watch
UPDATE products 
SET image_urls = '["/src/assets/products/fitness-watch.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Smart Fitness Watch';

-- Product 3: Premium Leather Wallet
UPDATE products 
SET image_urls = '["/src/assets/products/leather-wallet.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Premium Leather Wallet';

-- Product 4: Organic Cotton T-Shirt
UPDATE products 
SET image_urls = '["/src/assets/products/cotton-tshirt.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Organic Cotton T-Shirt';

-- Product 5: Stainless Steel Water Bottle
UPDATE products 
SET image_urls = '["/src/assets/products/water-bottle.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Stainless Steel Water Bottle';

-- Product 6: Portable Bluetooth Speaker
UPDATE products 
SET image_urls = '["/src/assets/products/bluetooth-speaker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Portable Bluetooth Speaker';

-- Product 7: Memory Foam Pillow
UPDATE products 
SET image_urls = '["/src/assets/products/memory-foam-pillow.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Memory Foam Pillow';

-- Product 8: Natural Face Serum
UPDATE products 
SET image_urls = '["/src/assets/products/face-serum.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Natural Face Serum';

-- Product 9: Yoga Mat Pro
UPDATE products 
SET image_urls = '["/src/assets/products/yoga-mat.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Yoga Mat Pro';

-- Product 10: Coffee Maker Deluxe
UPDATE products 
SET image_urls = '["/src/assets/products/coffee-maker.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Coffee Maker Deluxe';

-- Product 11: Reading Lamp LED
UPDATE products 
SET image_urls = '["/src/assets/products/reading-lamp.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Reading Lamp LED';

-- Product 12: Running Shoes Ultra
UPDATE products 
SET image_urls = '["/src/assets/products/running-shoes.jpg"]'::jsonb
WHERE store_id = 'e1eb9c10-8823-41d1-961a-776b6d7d9b8d' 
AND title = 'Running Shoes Ultra';