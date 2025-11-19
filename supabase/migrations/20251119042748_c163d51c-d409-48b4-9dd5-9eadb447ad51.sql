-- Add reviews to all remaining demo store products

-- Wireless Earbuds Pro
UPDATE products 
SET 
  rating = 4.6,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Jessica Turner",
      "rating": 5,
      "comment": "Sound quality is exceptional! These earbuds rival brands three times the price. Battery life easily gets me through a full workday.",
      "date": "2024-09-18"
    },
    {
      "reviewer_name": "Brian Lewis",
      "rating": 4,
      "comment": "Really impressed with the noise cancellation. Only minor complaint is the case feels a bit plasticky.",
      "date": "2024-10-05"
    },
    {
      "reviewer_name": "Ashley Martinez",
      "rating": 5,
      "comment": "Perfect for workouts! Sweat resistant and they stay in place during intense cardio. Love the touch controls.",
      "date": "2024-10-20"
    },
    {
      "reviewer_name": "Kevin Wright",
      "rating": 5,
      "comment": "Best earbuds I have owned. Call quality is crystal clear and the app has great EQ customization options.",
      "date": "2024-11-02"
    },
    {
      "reviewer_name": "Megan Brown",
      "rating": 4,
      "comment": "Very happy with these. Connection is stable and pairing is seamless. Would love if they had spatial audio.",
      "date": "2024-11-14"
    }
  ]'::jsonb
WHERE title = 'Wireless Earbuds Pro' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Laptop Backpack
UPDATE products 
SET 
  rating = 4.4,
  review_count = 6,
  reviews = '[
    {
      "reviewer_name": "Andrew Phillips",
      "rating": 5,
      "comment": "Perfect backpack for daily commute. Laptop compartment is well padded and the organization pockets are thoughtfully designed.",
      "date": "2024-08-22"
    },
    {
      "reviewer_name": "Nicole Adams",
      "rating": 4,
      "comment": "Great quality and very durable. Water resistant material has saved my laptop during unexpected rain. Comfortable straps.",
      "date": "2024-09-10"
    },
    {
      "reviewer_name": "Steven Clark",
      "rating": 5,
      "comment": "This backpack fits everything I need for work and travel. USB charging port is super convenient. Highly recommend!",
      "date": "2024-09-28"
    },
    {
      "reviewer_name": "Brittany Hughes",
      "rating": 4,
      "comment": "Solid backpack with lots of storage. Only wish the water bottle pocket was slightly deeper.",
      "date": "2024-10-16"
    },
    {
      "reviewer_name": "Mark Robinson",
      "rating": 4,
      "comment": "Professional looking and functional. Fits my 15 inch laptop perfectly. Build quality is excellent.",
      "date": "2024-11-01"
    },
    {
      "reviewer_name": "Lauren Bailey",
      "rating": 5,
      "comment": "Best backpack I have used for work. Anti theft design gives me peace of mind when traveling.",
      "date": "2024-11-09"
    }
  ]'::jsonb
WHERE title = 'Laptop Backpack' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Portable Power Bank
UPDATE products 
SET 
  rating = 4.7,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Robert Sanders",
      "rating": 5,
      "comment": "This power bank is a lifesaver! Charged my phone four times on a single charge. Fast charging works great.",
      "date": "2024-10-01"
    },
    {
      "reviewer_name": "Michelle Reed",
      "rating": 5,
      "comment": "Compact yet powerful. Love that it can charge multiple devices at once. Display showing battery percentage is helpful.",
      "date": "2024-10-15"
    },
    {
      "reviewer_name": "Jason White",
      "rating": 4,
      "comment": "Reliable power bank with high capacity. Build feels premium. Slightly heavier than expected but worth it.",
      "date": "2024-10-29"
    },
    {
      "reviewer_name": "Samantha Moore",
      "rating": 5,
      "comment": "Essential for travel! Kept all my devices charged during a long flight. USB-C and wireless charging are bonus features.",
      "date": "2024-11-11"
    }
  ]'::jsonb
WHERE title = 'Portable Power Bank' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- USB-C Hub Adapter
UPDATE products 
SET 
  rating = 4.5,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "William Garcia",
      "rating": 5,
      "comment": "Perfect hub for my laptop! All ports work flawlessly. HDMI output gives me crisp 4K display.",
      "date": "2024-09-25"
    },
    {
      "reviewer_name": "Elizabeth Carter",
      "rating": 4,
      "comment": "Great adapter with all the ports I need. Data transfer speeds are excellent. Gets slightly warm during heavy use.",
      "date": "2024-10-08"
    },
    {
      "reviewer_name": "Timothy Young",
      "rating": 5,
      "comment": "This hub solved all my connectivity issues. Ethernet port provides stable internet. Compact design is perfect for travel.",
      "date": "2024-10-20"
    },
    {
      "reviewer_name": "Patricia Hill",
      "rating": 4,
      "comment": "Solid build quality and works as advertised. All ports are easily accessible. Would prefer a longer cable.",
      "date": "2024-11-03"
    },
    {
      "reviewer_name": "George Mitchell",
      "rating": 5,
      "comment": "Essential accessory for my MacBook. Power delivery works perfectly and I can connect all my peripherals at once.",
      "date": "2024-11-15"
    }
  ]'::jsonb
WHERE title = 'USB-C Hub Adapter' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Phone Stand with Wireless Charger
UPDATE products 
SET 
  rating = 4.6,
  review_count = 3,
  reviews = '[
    {
      "reviewer_name": "Catherine Bell",
      "rating": 5,
      "comment": "Love this charger stand! Keeps my desk organized and charges my phone quickly. Adjustable angle is really useful.",
      "date": "2024-10-12"
    },
    {
      "reviewer_name": "Richard Allen",
      "rating": 4,
      "comment": "Works great for video calls. Solid construction and charges through my phone case. LED indicator could be dimmer at night.",
      "date": "2024-10-26"
    },
    {
      "reviewer_name": "Diana Cooper",
      "rating": 5,
      "comment": "Perfect for my nightstand. Can easily see notifications while phone charges. No more fumbling with cables!",
      "date": "2024-11-07"
    }
  ]'::jsonb
WHERE title = 'Phone Stand with Wireless Charger' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Smart Watch Charging Dock
UPDATE products 
SET 
  rating = 4.4,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Gregory Thomas",
      "rating": 5,
      "comment": "Elegant charging dock for smart watches with adjustable viewing angle and cable management",
      "date": "2024-10-05"
    },
    {
      "reviewer_name": "Angela Baker",
      "rating": 4,
      "comment": "Nice design and sturdy base. Charges my watch overnight without issues. Wish it came in more colors.",
      "date": "2024-10-18"
    },
    {
      "reviewer_name": "Jeffrey Nelson",
      "rating": 4,
      "comment": "Good quality dock that looks great on my desk. Cable management feature keeps things tidy.",
      "date": "2024-11-01"
    },
    {
      "reviewer_name": "Melissa King",
      "rating": 5,
      "comment": "Perfect addition to my bedside table. Watch displays beautifully while charging. Very stable.",
      "date": "2024-11-13"
    }
  ]'::jsonb
WHERE title = 'Smart Watch Charging Dock' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- LED Desk Lamp
UPDATE products 
SET 
  rating = 4.8,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Dorothy Wright",
      "rating": 5,
      "comment": "This lamp has transformed my workspace! Multiple brightness levels and color temperatures. Touch controls are very responsive.",
      "date": "2024-09-15"
    },
    {
      "reviewer_name": "Kenneth Scott",
      "rating": 5,
      "comment": "Excellent lighting for late night work sessions. Eye caring technology really reduces strain. USB charging port is convenient.",
      "date": "2024-09-30"
    },
    {
      "reviewer_name": "Sandra Green",
      "rating": 5,
      "comment": "Perfect desk lamp! Adjustable arm allows precise positioning. Bright enough for detailed work yet gentle on eyes.",
      "date": "2024-10-14"
    },
    {
      "reviewer_name": "Ronald Adams",
      "rating": 4,
      "comment": "Great quality lamp with modern design. Memory function remembers my preferred settings. Base could be slightly heavier.",
      "date": "2024-10-28"
    },
    {
      "reviewer_name": "Deborah Hall",
      "rating": 5,
      "comment": "Best lamp I have owned! Energy efficient and provides excellent illumination. Timer function helps me wind down at night.",
      "date": "2024-11-10"
    }
  ]'::jsonb
WHERE title = 'LED Desk Lamp' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Wireless Keyboard and Mouse Combo
UPDATE products 
SET 
  rating = 4.5,
  review_count = 6,
  reviews = '[
    {
      "reviewer_name": "Frank Mitchell",
      "rating": 5,
      "comment": "Fantastic combo for the price! Keyboard is quiet and responsive. Mouse tracking is precise. Single USB receiver is convenient.",
      "date": "2024-08-20"
    },
    {
      "reviewer_name": "Margaret Lopez",
      "rating": 4,
      "comment": "Very satisfied with this purchase. Keys have nice travel and the mouse fits my hand comfortably. Battery life is excellent.",
      "date": "2024-09-05"
    },
    {
      "reviewer_name": "Arthur Collins",
      "rating": 5,
      "comment": "Perfect for my home office setup. No lag or connectivity issues. Both devices feel solid and well made.",
      "date": "2024-09-22"
    },
    {
      "reviewer_name": "Ruth Turner",
      "rating": 4,
      "comment": "Clean design that looks professional. Keyboard layout is comfortable for typing. Mouse could have a few more buttons.",
      "date": "2024-10-10"
    },
    {
      "reviewer_name": "Lawrence Evans",
      "rating": 5,
      "comment": "Great value for money. Setup was effortless and connection range is impressive. Highly recommend!",
      "date": "2024-10-25"
    },
    {
      "reviewer_name": "Helen Parker",
      "rating": 4,
      "comment": "Reliable wireless combo that has not let me down. Comfortable for extended use. Would prefer backlit keys.",
      "date": "2024-11-08"
    }
  ]'::jsonb
WHERE title = 'Wireless Keyboard and Mouse Combo' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Noise Cancelling Headphones
UPDATE products 
SET 
  rating = 4.9,
  review_count = 7,
  reviews = '[
    {
      "reviewer_name": "Charles Rodriguez",
      "rating": 5,
      "comment": "Best noise cancelling I have experienced! Completely blocks out airplane noise. Sound quality is phenomenal.",
      "date": "2024-08-15"
    },
    {
      "reviewer_name": "Barbara Martinez",
      "rating": 5,
      "comment": "These headphones are incredible. Comfort level is amazing even after hours of wear. Battery lasts forever!",
      "date": "2024-09-01"
    },
    {
      "reviewer_name": "Joseph Anderson",
      "rating": 5,
      "comment": "Worth every penny. Active noise cancellation works like magic. Perfect for focusing in busy environments.",
      "date": "2024-09-18"
    },
    {
      "reviewer_name": "Linda Thomas",
      "rating": 5,
      "comment": "Audio quality is studio grade. Noise cancellation is top tier. Foldable design makes them easy to travel with.",
      "date": "2024-10-03"
    },
    {
      "reviewer_name": "Donald Jackson",
      "rating": 5,
      "comment": "Premium build quality and exceptional sound. Ambient mode is perfect for quick conversations. Love these!",
      "date": "2024-10-19"
    },
    {
      "reviewer_name": "Betty White",
      "rating": 4,
      "comment": "Outstanding headphones. Noise cancellation is industry leading. Only wish they came with a harder case.",
      "date": "2024-11-02"
    },
    {
      "reviewer_name": "Edward Harris",
      "rating": 5,
      "comment": "Game changing for commuters. Blocks everything out and delivers rich, balanced audio. Best purchase this year!",
      "date": "2024-11-14"
    }
  ]'::jsonb
WHERE title = 'Noise Cancelling Headphones' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Smart Fitness Tracker
UPDATE products 
SET 
  rating = 4.3,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Paul Martin",
      "rating": 5,
      "comment": "Tracks all my activities accurately. Sleep monitoring has helped me improve my rest. Battery lasts almost a week!",
      "date": "2024-09-20"
    },
    {
      "reviewer_name": "Nancy Thompson",
      "rating": 4,
      "comment": "Great fitness tracker for the price. Heart rate monitoring is reliable. App interface could be more intuitive.",
      "date": "2024-10-04"
    },
    {
      "reviewer_name": "Raymond Garcia",
      "rating": 4,
      "comment": "Solid tracker that motivates me to stay active. Waterproof so I can wear it swimming. Display is clear and readable.",
      "date": "2024-10-18"
    },
    {
      "reviewer_name": "Karen Rodriguez",
      "rating": 5,
      "comment": "Love how lightweight and comfortable it is. Step counter is accurate and GPS tracking works well for runs.",
      "date": "2024-11-01"
    },
    {
      "reviewer_name": "Gary Wilson",
      "rating": 4,
      "comment": "Good value fitness tracker. Notifications work seamlessly. Would like more workout modes.",
      "date": "2024-11-12"
    }
  ]'::jsonb
WHERE title = 'Smart Fitness Tracker' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Professional Yoga Mat
UPDATE products 
SET 
  rating = 4.7,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Carol Moore",
      "rating": 5,
      "comment": "Best yoga mat I have owned! Excellent grip even during hot yoga. Thick padding protects my joints perfectly.",
      "date": "2024-10-10"
    },
    {
      "reviewer_name": "Peter Taylor",
      "rating": 5,
      "comment": "High quality mat that does not slip. Material is eco friendly and odor free. Comes with a nice carrying strap.",
      "date": "2024-10-22"
    },
    {
      "reviewer_name": "Susan Anderson",
      "rating": 4,
      "comment": "Great mat for daily practice. Cushioning is comfortable without being too soft. Easy to clean and maintain.",
      "date": "2024-11-05"
    },
    {
      "reviewer_name": "Dennis Jackson",
      "rating": 5,
      "comment": "Professional quality mat. Perfect texture for stability in poses. Large enough for tall users. Highly recommend!",
      "date": "2024-11-13"
    }
  ]'::jsonb
WHERE title = 'Professional Yoga Mat' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Insulated Water Bottle
UPDATE products 
SET 
  rating = 4.6,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Teresa White",
      "rating": 5,
      "comment": "Keeps water ice cold for 24 hours! No condensation on the outside. Perfect size for my gym bag.",
      "date": "2024-09-28"
    },
    {
      "reviewer_name": "Roy Harris",
      "rating": 4,
      "comment": "Excellent insulation performance. Leak proof lid gives me confidence. Powder coating has stayed pristine.",
      "date": "2024-10-12"
    },
    {
      "reviewer_name": "Carolyn Martinez",
      "rating": 5,
      "comment": "Love this bottle! Wide mouth makes adding ice easy. Fits in car cup holder. Best water bottle I have used.",
      "date": "2024-10-26"
    },
    {
      "reviewer_name": "Jerry Clark",
      "rating": 5,
      "comment": "Durable construction and fantastic temperature retention. Keeps hot drinks hot for hours. Great for hiking!",
      "date": "2024-11-08"
    },
    {
      "reviewer_name": "Cynthia Robinson",
      "rating": 4,
      "comment": "Quality water bottle with great insulation. Easy to clean. Wish it had a handle for easier carrying.",
      "date": "2024-11-15"
    }
  ]'::jsonb
WHERE title = 'Insulated Water Bottle' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Stainless Steel Water Bottle
UPDATE products 
SET 
  rating = 4.4,
  review_count = 3,
  reviews = '[
    {
      "reviewer_name": "Alan Lewis",
      "rating": 5,
      "comment": "Sleek design and excellent build quality. Keeps drinks cold all day. BPA free and easy to clean.",
      "date": "2024-10-15"
    },
    {
      "reviewer_name": "Shirley Walker",
      "rating": 4,
      "comment": "Good quality bottle at reasonable price. Lid is secure and does not leak. Color options are nice.",
      "date": "2024-10-28"
    },
    {
      "reviewer_name": "Carl Hall",
      "rating": 4,
      "comment": "Solid water bottle for everyday use. Lightweight and durable. Mouth opening is perfect for drinking.",
      "date": "2024-11-10"
    }
  ]'::jsonb
WHERE title = 'Stainless Steel Water Bottle' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Luxury Skincare Set
UPDATE products 
SET 
  rating = 4.8,
  review_count = 6,
  reviews = '[
    {
      "reviewer_name": "Gloria Allen",
      "rating": 5,
      "comment": "This skincare set is amazing! My skin has never looked better. Products feel luxurious and absorb quickly.",
      "date": "2024-09-12"
    },
    {
      "reviewer_name": "Eugene Young",
      "rating": 5,
      "comment": "Bought this for my wife and she absolutely loves it. High quality ingredients with visible results. Great gift!",
      "date": "2024-09-26"
    },
    {
      "reviewer_name": "Frances King",
      "rating": 5,
      "comment": "Worth every penny. Skin feels hydrated and glowing. Packaging is beautiful. Will definitely repurchase.",
      "date": "2024-10-09"
    },
    {
      "reviewer_name": "Ralph Wright",
      "rating": 4,
      "comment": "Excellent skincare routine in one set. Products work well together. Subtle fragrance is pleasant.",
      "date": "2024-10-23"
    },
    {
      "reviewer_name": "Joyce Scott",
      "rating": 5,
      "comment": "Best skincare investment! Noticed improvements in just two weeks. Products are gentle yet effective.",
      "date": "2024-11-06"
    },
    {
      "reviewer_name": "Johnny Green",
      "rating": 5,
      "comment": "Premium quality set that delivers results. Skin texture has improved dramatically. Highly recommend!",
      "date": "2024-11-14"
    }
  ]'::jsonb
WHERE title = 'Luxury Skincare Set' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Organic Cotton Bedding Set
UPDATE products 
SET 
  rating = 4.7,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Virginia Adams",
      "rating": 5,
      "comment": "Softest sheets I have ever slept on! Organic cotton feels amazing. Fits my mattress perfectly.",
      "date": "2024-09-08"
    },
    {
      "reviewer_name": "Albert Baker",
      "rating": 5,
      "comment": "High quality bedding that gets softer with each wash. Breathable fabric keeps us cool at night. Love it!",
      "date": "2024-09-22"
    },
    {
      "reviewer_name": "Doris Nelson",
      "rating": 4,
      "comment": "Beautiful bedding set with excellent thread count. Colors stay vibrant after washing. Minor wrinkling.",
      "date": "2024-10-07"
    },
    {
      "reviewer_name": "Howard Hill",
      "rating": 5,
      "comment": "Luxury bedding at great price. Sleep quality has improved noticeably. Elastic corners stay secure.",
      "date": "2024-10-20"
    },
    {
      "reviewer_name": "Jean Carter",
      "rating": 5,
      "comment": "Worth the investment. Organic materials are gentle on sensitive skin. Pillowcases are especially comfortable.",
      "date": "2024-11-09"
    }
  ]'::jsonb
WHERE title = 'Organic Cotton Bedding Set' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Aromatherapy Candle Collection
UPDATE products 
SET 
  rating = 4.9,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Anne Mitchell",
      "rating": 5,
      "comment": "These candles create the most relaxing atmosphere! Natural ingredients and scents are not overpowering. Burns evenly.",
      "date": "2024-10-14"
    },
    {
      "reviewer_name": "Walter Lopez",
      "rating": 5,
      "comment": "Exceptional quality candles. Each scent is perfectly balanced. Long burn time and beautiful packaging.",
      "date": "2024-10-28"
    },
    {
      "reviewer_name": "Judith Gonzalez",
      "rating": 5,
      "comment": "Best candles I have purchased! Essential oils are high quality. Jars are reusable. Makes a great gift set.",
      "date": "2024-11-10"
    },
    {
      "reviewer_name": "Gerald Perez",
      "rating": 4,
      "comment": "Wonderful collection with varied scents. Clean burning without soot. Slightly pricey but worth it.",
      "date": "2024-11-15"
    }
  ]'::jsonb
WHERE title = 'Aromatherapy Candle Collection' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Artisan Ceramic Mug Set
UPDATE products 
SET 
  rating = 4.6,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Willie Turner",
      "rating": 5,
      "comment": "Beautiful handcrafted mugs! Each one is unique. Perfect size for morning coffee. Microwave and dishwasher safe.",
      "date": "2024-10-05"
    },
    {
      "reviewer_name": "Katherine Phillips",
      "rating": 4,
      "comment": "Lovely mug set with artistic designs. Comfortable handle and good weight. Colors are vibrant.",
      "date": "2024-10-19"
    },
    {
      "reviewer_name": "Jeremy Campbell",
      "rating": 5,
      "comment": "Artisan quality at reasonable price. Glazing is flawless. Holds heat well. Great addition to my collection!",
      "date": "2024-11-02"
    },
    {
      "reviewer_name": "Paula Parker",
      "rating": 5,
      "comment": "Absolutely gorgeous mugs. Handmade quality is evident. Arrived well packaged. Using them daily!",
      "date": "2024-11-13"
    }
  ]'::jsonb
WHERE title = 'Artisan Ceramic Mug Set' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Cashmere Blend Scarf
UPDATE products 
SET 
  rating = 4.8,
  review_count = 3,
  reviews = '[
    {
      "reviewer_name": "Roy Evans",
      "rating": 5,
      "comment": "Incredibly soft and warm! Cashmere blend feels luxurious. Perfect weight for fall and winter. Beautiful color.",
      "date": "2024-10-17"
    },
    {
      "reviewer_name": "Janice Edwards",
      "rating": 5,
      "comment": "Best scarf I own! Elegant design that goes with everything. No itching or irritation. Worth every dollar.",
      "date": "2024-11-01"
    },
    {
      "reviewer_name": "Russell Collins",
      "rating": 4,
      "comment": "High quality scarf with excellent craftsmanship. Keeps me warm without bulk. Care instructions are straightforward.",
      "date": "2024-11-12"
    }
  ]'::jsonb
WHERE title = 'Cashmere Blend Scarf' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');