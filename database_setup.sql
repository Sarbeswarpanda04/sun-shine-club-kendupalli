-- Sun Shine Club Database Setup
-- Copy and paste this entire code into Supabase SQL Editor

-- Members table
CREATE TABLE members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  photo VARCHAR(500),
  phone VARCHAR(20),
  email VARCHAR(255),
  position VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Notices table  
CREATE TABLE notices (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  detail TEXT,
  date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Settings table
CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  club_name VARCHAR(255) DEFAULT 'Sun Shine Club',
  address TEXT,
  upi_id VARCHAR(100),
  facebook VARCHAR(500),
  instagram VARCHAR(500),
  youtube VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  year INTEGER NOT NULL,
  festival VARCHAR(100) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access" ON members FOR SELECT USING (true);
CREATE POLICY "Public read access" ON notices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON settings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON gallery FOR SELECT USING (true);

-- Admin write policies
CREATE POLICY "Admin write access" ON members FOR ALL USING (true);
CREATE POLICY "Admin write access" ON notices FOR ALL USING (true);
CREATE POLICY "Admin write access" ON settings FOR ALL USING (true);
CREATE POLICY "Admin write access" ON gallery FOR ALL USING (true);

-- Import your existing members
INSERT INTO members (name, photo) VALUES
('Prasanna Kumar Panda', '/assets/members/member01.jpg'),
('Trinatha panda', '/assets/members/member02.jpg'),
('Bhagirathi panda', '/assets/members/member03.jpg'),
('Krushna Chandra Panda', '/assets/members/member04.jpg'),
('Jagabandhu Panda', '/assets/members/member05.jpg'),
('Member 06', '/assets/members/member06.jpg'),
('Biswaranjan Panda', '/assets/members/member07.jpg'),
('Biswakesan Panda', '/assets/members/member08.jpg'),
('Bikash kumar Panda', '/assets/members/member09.jpg'),
('Alok Kumar Pradhan', '/assets/members/member10.jpg'),
('Niladri Kumar Panda', '/assets/members/member11.jpg'),
('Member 12', '/assets/members/member12.jpg'),
('Member 13', '/assets/members/member13.jpg'),
('Member 14', '/assets/members/member14.jpg'),
('Member 15', '/assets/members/member15.jpg'),
('Member 16', '/assets/members/member16.jpg'),
('Member 17', '/assets/members/member17.jpg'),
('Member 18', '/assets/members/member18.jpg'),
('Member 19', '/assets/members/member19.jpg'),
('Member 20', '/assets/members/member20.jpg'),
('Member 21', '/assets/members/member21.jpg'),
('Member 22', '/assets/members/member22.jpg'),
('Member 23', '/assets/members/member23.jpg'),
('Member 24', '/assets/members/member24.jpg'),
('Member 25', '/assets/members/member25.jpg'),
('Member 26', '/assets/members/member26.jpg'),
('Member 27', '/assets/members/member27.jpg'),
('Member 28', '/assets/members/member28.jpg'),
('Member 29', '/assets/members/member29.jpg'),
('Member 30', '/assets/members/member30.jpg'),
('Member 31', '/assets/members/member31.jpg'),
('Member 32', '/assets/members/member32.jpg'),
('Member 33', '/assets/members/member33.jpg'),
('Member 34', '/assets/members/member34.jpg'),
('Member 35', '/assets/members/member35.jpg'),
('Member 36', '/assets/members/member36.jpg');

-- Import existing notices
INSERT INTO notices (title, detail, date, active) VALUES
('Independence Day cleanliness drive', 'Join 7 AM at community center.', '2025-08-15', true),
('Ganesh Puja planning meeting', 'Volunteers needed for decoration, prasad & security.', '2025-07-20', true),
('Saraswati Puja cultural evening', 'Music & recitations from 6 PM.', '2025-02-14', true),
('Year-end report published', 'See Donate page for transparency note.', '2024-12-31', true);

-- Import initial settings
INSERT INTO settings (club_name, address, upi_id) VALUES
('Sun Shine Club Kendupalli', 'Kendupalli, Bhubaneswar, Odisha', 'your-upi-id@okaxis');

-- Import gallery data (sample from your existing gallery.json)
INSERT INTO gallery (year, festival, filename, url) VALUES
(2025, 'ganesh', 'img01.jpg', '/assets/gallery/2025/ganesh/img01.jpg'),
(2025, 'ganesh', 'img02.jpg', '/assets/gallery/2025/ganesh/img02.jpg'),
(2025, 'ganesh', 'img03.jpg', '/assets/gallery/2025/ganesh/img03.jpg'),
(2025, 'ganesh', 'img04.jpg', '/assets/gallery/2025/ganesh/img04.jpg'),
(2025, 'ganesh', 'img05.jpg', '/assets/gallery/2025/ganesh/img05.jpg'),
(2025, 'ganesh', 'img06.jpg', '/assets/gallery/2025/ganesh/img06.jpg'),
(2025, 'ganesh', 'img07.jpg', '/assets/gallery/2025/ganesh/img07.jpg'),
(2025, 'ganesh', 'img08.jpg', '/assets/gallery/2025/ganesh/img08.jpg'),
(2025, 'saraswati', 'img01.jpg', '/assets/gallery/2025/saraswati/img01.jpg'),
(2025, 'saraswati', 'img02.jpg', '/assets/gallery/2025/saraswati/img02.jpg'),
(2025, 'saraswati', 'img03.jpg', '/assets/gallery/2025/saraswati/img03.jpg'),
(2025, 'saraswati', 'img04.jpg', '/assets/gallery/2025/saraswati/img04.jpg'),
(2025, 'saraswati', 'img05.jpg', '/assets/gallery/2025/saraswati/img05.jpg'),
(2025, 'saraswati', 'img06.jpg', '/assets/gallery/2025/saraswati/img06.jpg'),
(2024, 'ganesh', 'img01.jpg', '/assets/gallery/2024/ganesh/img01.jpg'),
(2024, 'ganesh', 'img02.jpg', '/assets/gallery/2024/ganesh/img02.jpg'),
(2024, 'ganesh', 'img03.jpg', '/assets/gallery/2024/ganesh/img03.jpg'),
(2024, 'ganesh', 'img04.jpg', '/assets/gallery/2024/ganesh/img04.jpg'),
(2024, 'ganesh', 'img05.jpg', '/assets/gallery/2024/ganesh/img05.jpg'),
(2024, 'ganesh', 'img06.jpg', '/assets/gallery/2024/ganesh/img06.jpg'),
(2024, 'saraswati', 'img01.jpg', '/assets/gallery/2024/saraswati/img01.jpg'),
(2024, 'saraswati', 'img02.jpg', '/assets/gallery/2024/saraswati/img02.jpg'),
(2024, 'saraswati', 'img03.jpg', '/assets/gallery/2024/saraswati/img03.jpg'),
(2024, 'saraswati', 'img04.jpg', '/assets/gallery/2024/saraswati/img04.jpg'),
(2024, 'saraswati', 'img05.jpg', '/assets/gallery/2024/saraswati/img05.jpg'),
(2024, 'saraswati', 'img06.jpg', '/assets/gallery/2024/saraswati/img06.jpg'),
(2024, 'saraswati', 'img07.jpg', '/assets/gallery/2024/saraswati/img07.jpg'),
(2023, 'ganesh', 'img01.jpg', '/assets/gallery/2023/ganesh/img01.jpg'),
(2023, 'ganesh', 'img02.jpg', '/assets/gallery/2023/ganesh/img02.jpg'),
(2023, 'ganesh', 'img03.jpg', '/assets/gallery/2023/ganesh/img03.jpg'),
(2023, 'ganesh', 'img04.jpg', '/assets/gallery/2023/ganesh/img04.jpg'),
(2023, 'ganesh', 'img05.jpg', '/assets/gallery/2023/ganesh/img05.jpg'),
(2023, 'ganesh', 'img06.jpg', '/assets/gallery/2023/ganesh/img06.jpg'),
(2023, 'saraswati', 'img01.jpg', '/assets/gallery/2023/saraswati/img01.jpg'),
(2023, 'saraswati', 'img02.jpg', '/assets/gallery/2023/saraswati/img02.jpg'),
(2023, 'saraswati', 'img03.jpg', '/assets/gallery/2023/saraswati/img03.jpg'),
(2023, 'saraswati', 'img04.jpg', '/assets/gallery/2023/saraswati/img04.jpg'),
(2023, 'saraswati', 'img05.jpg', '/assets/gallery/2023/saraswati/img05.jpg'),
(2023, 'saraswati', 'img06.jpg', '/assets/gallery/2023/saraswati/img06.jpg');
