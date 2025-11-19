-- Add sample reviews to demo store products for realistic demo experience

-- Update Premium Wireless Headphones
UPDATE products 
SET 
  rating = 4.5,
  review_count = 3,
  reviews = '[
    {
      "reviewer_name": "Sarah Mitchell",
      "rating": 5,
      "comment": "Absolutely love these headphones! The sound quality is incredible and they are super comfortable for long listening sessions.",
      "date": "2024-10-15"
    },
    {
      "reviewer_name": "James Park",
      "rating": 4,
      "comment": "Great headphones overall. Battery life could be better, but the noise cancellation is top-notch.",
      "date": "2024-10-28"
    },
    {
      "reviewer_name": "Emily Chen",
      "rating": 5,
      "comment": "Best purchase I have made this year. The wireless range is amazing and they fold up nicely for travel.",
      "date": "2024-11-05"
    }
  ]'::jsonb
WHERE title = 'Premium Wireless Headphones' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Update Portable Bluetooth Speaker
UPDATE products 
SET 
  rating = 4.7,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Michael Rodriguez",
      "rating": 5,
      "comment": "This speaker is a game changer! Crystal clear sound and the bass is impressive for such a compact size.",
      "date": "2024-10-20"
    },
    {
      "reviewer_name": "Lisa Thompson",
      "rating": 5,
      "comment": "Perfect for outdoor gatherings. Waterproof feature really works, survived a pool party!",
      "date": "2024-10-25"
    },
    {
      "reviewer_name": "David Kim",
      "rating": 4,
      "comment": "Very happy with this speaker. Only wish the battery lasted a bit longer on max volume.",
      "date": "2024-11-01"
    },
    {
      "reviewer_name": "Rachel Green",
      "rating": 5,
      "comment": "Exceeded my expectations. Pairing is instant and sound quality rivals speakers twice the price.",
      "date": "2024-11-10"
    }
  ]'::jsonb
WHERE title = 'Portable Bluetooth Speaker' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Update Smart Watch Pro
UPDATE products 
SET 
  rating = 4.3,
  review_count = 5,
  reviews = '[
    {
      "reviewer_name": "Alex Johnson",
      "rating": 5,
      "comment": "This smartwatch has everything I need. Fitness tracking is accurate and notifications work flawlessly.",
      "date": "2024-09-15"
    },
    {
      "reviewer_name": "Sophia Martinez",
      "rating": 4,
      "comment": "Really enjoying this watch. Interface is intuitive and battery lasts almost 2 days with moderate use.",
      "date": "2024-10-02"
    },
    {
      "reviewer_name": "Tom Wilson",
      "rating": 5,
      "comment": "Best smartwatch in this price range. Sleep tracking has helped me improve my sleep schedule significantly.",
      "date": "2024-10-18"
    },
    {
      "reviewer_name": "Jennifer Lee",
      "rating": 4,
      "comment": "Great features and looks stylish. Would give 5 stars if it had more third-party app support.",
      "date": "2024-10-30"
    },
    {
      "reviewer_name": "Chris Anderson",
      "rating": 4,
      "comment": "Solid smartwatch. Heart rate monitor is very accurate compared to my gym equipment.",
      "date": "2024-11-08"
    }
  ]'::jsonb
WHERE title = 'Smart Watch Pro' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Update Designer Sunglasses
UPDATE products 
SET 
  rating = 4.8,
  review_count = 3,
  reviews = '[
    {
      "reviewer_name": "Nathan Brooks",
      "rating": 5,
      "comment": "These sunglasses are stunning! The polarized lenses make such a difference when driving.",
      "date": "2024-10-12"
    },
    {
      "reviewer_name": "Amanda Foster",
      "rating": 5,
      "comment": "Absolutely gorgeous design and super comfortable. Get compliments every time I wear them.",
      "date": "2024-10-22"
    },
    {
      "reviewer_name": "Marcus Taylor",
      "rating": 4,
      "comment": "High quality sunglasses that feel premium. Case could be more protective though.",
      "date": "2024-11-03"
    }
  ]'::jsonb
WHERE title = 'Designer Sunglasses' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');

-- Update Genuine Leather Wallet
UPDATE products 
SET 
  rating = 4.6,
  review_count = 4,
  reviews = '[
    {
      "reviewer_name": "Daniel Cooper",
      "rating": 5,
      "comment": "Beautiful craftsmanship! The leather is soft yet durable. Perfect size for all my cards and cash.",
      "date": "2024-09-28"
    },
    {
      "reviewer_name": "Olivia Harris",
      "rating": 4,
      "comment": "Bought this as a gift for my husband. He loves the quality and design. Fits perfectly in his pocket.",
      "date": "2024-10-15"
    },
    {
      "reviewer_name": "Ryan Scott",
      "rating": 5,
      "comment": "This wallet has aged beautifully over the past month. The patina adds character. Highly recommend!",
      "date": "2024-10-29"
    },
    {
      "reviewer_name": "Emma Davis",
      "rating": 5,
      "comment": "Sleek and minimalist design. Holds everything I need without being bulky. Love it!",
      "date": "2024-11-12"
    }
  ]'::jsonb
WHERE title = 'Genuine Leather Wallet' AND store_id IN (SELECT id FROM stores WHERE x_username = 'sim');