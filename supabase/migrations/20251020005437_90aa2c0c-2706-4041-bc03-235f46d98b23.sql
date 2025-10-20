-- Move sims to crypto & web3 category
UPDATE advisors SET category = 'crypto' WHERE name IN ('$gruta', 'agent99', 'alon', 'DC', 'Tx (asteroid arc)', 'Virgen Soldier');

-- Move sims to fictional category
UPDATE advisors SET category = 'fictional' WHERE name IN ('Rick Sanchez', 'Satoshi Nakamoto');

-- Move sims to influencers category
UPDATE advisors SET category = 'influencers' WHERE name IN ('Elon Musk', 'Donald J. Trump', 'David Icke', 'Mark Zuckberg', 'Mark Zuckerberg');