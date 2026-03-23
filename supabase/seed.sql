-- Insert mock users (Authors/Filmmakers)
INSERT INTO users (id, wallet_address, display_name, username) VALUES 
  ('00000000-0000-0000-0000-000000000001', '0xElena...', 'Elena Rostova', 'elenar'),
  ('00000000-0000-0000-0000-000000000002', '0xKaito...', 'Kaito Mori', 'kaitom'),
  ('00000000-0000-0000-0000-000000000003', '0xMarcus...', 'Marcus Chen', 'marcusc'),
  ('00000000-0000-0000-0000-000000000004', '0xSarah...', 'Sarah Jenkins', 'sarahj'),
  ('00000000-0000-0000-0000-000000000005', '0xAisha...', 'Aisha Patel', 'aishap'),
  ('00000000-0000-0000-0000-000000000006', '0xLeo...', 'Leo Vance', 'leov')
ON CONFLICT DO NOTHING;

-- Insert the 6 mock films
INSERT INTO films (id, filmmaker_id, title, director, year, genre, runtime, description, poster_url, upload_status, revenue_split) VALUES
  (
    '11111111-1111-1111-1111-111111111111', 
    '00000000-0000-0000-0000-000000000001',
    'The Silent Echo', 'Elena Rostova', 2024, 'Drama', 98, 
    'A visually stunning exploration of isolation in a hyper-connected world. A deaf painter retreats to a lighthouse only to find the silence broken by mysterious signals from the sea.', 
    'https://picsum.photos/seed/film3/600/400', 'live',
    '{"director": 60, "producer": 25, "crew": 10, "protocol": 5, "fundingGoal": 150000, "fundingRaised": 127500, "status": "Now Minting", "festivalBadges": ["Sundance Official Selection", "IDFA Winner"], "curatorEndorsed": true, "curatorName": "CineVault Curator", "backers": 412, "tokens": {"rental": {"price": 150, "supply": 5000, "remaining": 3420}, "ownership": {"price": 500, "supply": 1000, "remaining": 287}, "collector": {"price": 2500, "supply": 100, "remaining": 12}}}'::jsonb
  ),
  (
    '22222222-2222-2222-2222-222222222222', 
    '00000000-0000-0000-0000-000000000002',
    'Neon Dreams', 'Kaito Mori', 2024, 'Sci-Fi', 112, 
    'In 2077 Tokyo, a rogue AI composer escapes containment and teams up with a down-and-out musician to perform one last concert before the city shuts it down forever.', 
    'https://picsum.photos/seed/film1/600/400', 'live',
    '{"director": 55, "producer": 30, "crew": 10, "protocol": 5, "fundingGoal": 200000, "fundingRaised": 200000, "status": "Funded", "festivalBadges": ["SXSW Midnight"], "curatorEndorsed": true, "curatorName": "NeonCurator", "backers": 890, "tokens": {"rental": {"price": 200, "supply": 8000, "remaining": 6120}, "ownership": {"price": 800, "supply": 2000, "remaining": 450}, "collector": {"price": 4000, "supply": 50, "remaining": 3}}}'::jsonb
  ),
  (
    '33333333-3333-3333-3333-333333333333', 
    '00000000-0000-0000-0000-000000000003',
    'The Last Heist', 'Marcus Chen', 2023, 'Action', 105, 
    'A retired safecracker is pulled back for one final job — stealing the master print of the world''s most valuable lost film from a private vault in Monaco.', 
    'https://picsum.photos/seed/film2/600/400', 'live',
    '{"director": 65, "producer": 20, "crew": 10, "protocol": 5, "fundingGoal": 180000, "fundingRaised": 180000, "status": "Released", "festivalBadges": [], "curatorEndorsed": false, "backers": 1204, "tokens": {"rental": {"price": 100, "supply": 10000, "remaining": 8000}, "ownership": {"price": 400, "supply": 3000, "remaining": 2100}, "collector": {"price": 2000, "supply": 200, "remaining": 88}}}'::jsonb
  ),
  (
    '44444444-4444-4444-4444-444444444444', 
    '00000000-0000-0000-0000-000000000004',
    'Whispers in the Dark', 'Sarah Jenkins', 2024, 'Thriller', 91, 
    'A grief counselor discovers her clients are all dreaming the same dream — a house that doesn''t exist. Until it does.', 
    'https://picsum.photos/seed/film4/600/400', 'live',
    '{"director": 70, "producer": 15, "crew": 10, "protocol": 5, "fundingGoal": 90000, "fundingRaised": 62000, "status": "Now Minting", "festivalBadges": ["Tribeca Spotlight"], "curatorEndorsed": true, "curatorName": "DarkCuratorDao", "backers": 228, "tokens": {"rental": {"price": 120, "supply": 4000, "remaining": 2890}, "ownership": {"price": 450, "supply": 800, "remaining": 620}, "collector": {"price": 2000, "supply": 75, "remaining": 60}}}'::jsonb
  ),
  (
    '55555555-5555-5555-5555-555555555555', 
    '00000000-0000-0000-0000-000000000005',
    'A Distant Star', 'Aisha Patel', 2025, 'Sci-Fi', 124, 
    'The first interstellar colony''s sole survivor returns to Earth after 40 years — to find she has only aged three months, and Earth doesn''t remember sending her.', 
    'https://picsum.photos/seed/film5/600/400', 'live',
    '{"director": 60, "producer": 25, "crew": 10, "protocol": 5, "fundingGoal": 250000, "fundingRaised": 75000, "status": "Now Minting", "festivalBadges": [], "curatorEndorsed": false, "backers": 94, "tokens": {"rental": {"price": 180, "supply": 6000, "remaining": 5988}, "ownership": {"price": 700, "supply": 1500, "remaining": 1498}, "collector": {"price": 3500, "supply": 80, "remaining": 79}}}'::jsonb
  ),
  (
    '66666666-6666-6666-6666-666666666666', 
    '00000000-0000-0000-0000-000000000006',
    'Concrete Jungle', 'Leo Vance', 2023, 'Documentary', 78, 
    'An intimate portrait of the last five remaining independent theater owners in Manhattan, fighting to keep the art of cinema alive against the streaming tide.', 
    'https://picsum.photos/seed/film6/600/400', 'live',
    '{"director": 75, "producer": 10, "crew": 10, "protocol": 5, "fundingGoal": 60000, "fundingRaised": 60000, "status": "Released", "festivalBadges": ["DOC NYC Award"], "curatorEndorsed": true, "curatorName": "DocuCollective", "backers": 567, "tokens": {"rental": {"price": 80, "supply": 12000, "remaining": 9500}, "ownership": {"price": 300, "supply": 2000, "remaining": 1800}, "collector": {"price": 1500, "supply": 100, "remaining": 65}}}'::jsonb
  )
ON CONFLICT DO NOTHING;
