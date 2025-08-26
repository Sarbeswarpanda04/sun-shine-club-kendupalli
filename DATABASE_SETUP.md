# Sun Shine Club - Real-Time Database Setup Guide

## 🗄️ FREE Online SQL Database Integration

Transform your website with **real-time data synchronization** using Supabase - a free PostgreSQL database with instant updates across all devices.

## ✨ What You Get:

- 🔄 **Real-time updates**: Changes appear instantly on all connected devices
- 💾 **Cloud storage**: Your data is safely backed up online
- 📊 **Live statistics**: Dashboard shows real member/notice counts
- 🚀 **Scalable**: Handles thousands of records effortlessly
- 💰 **100% FREE**: No credit card required, generous free tier

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Supabase Account

1. Visit [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub/Google or email
4. Create a new project:
   - **Project Name**: `sun-shine-club-kendupalli`
   - **Database Password**: (create a strong password)
   - **Region**: Choose closest to your location
   - **Pricing**: Free (500MB storage + 2GB bandwidth monthly)

### Step 2: Get Your Credentials

After project creation:
1. Go to **Settings** → **API**
2. Copy these two values:
   ```
   Project URL: https://your-project-id.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Update Configuration

Edit `js/config.js` in your website:

```javascript
const DATABASE_CONFIG = {
  // Enable database integration
  ENABLE_DATABASE: true, // ← Change from false to true
  
  // Replace with your actual values
  SUPABASE_URL: 'https://your-actual-project-id.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIs...your-actual-key',
  
  ENABLE_REALTIME: true,
  DEBUG_MODE: true
};
```

### Step 4: Create Database Tables

Go to **SQL Editor** in Supabase and run this:

```sql
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
```

### Step 5: Enable Real-time Features

1. Go to **Database** → **Replication**
2. Turn **ON** replication for these tables:
   - ✅ `members`
   - ✅ `notices` 
   - ✅ `settings`
   - ✅ `gallery`

### Step 6: Import Your Existing Data

Run this SQL to import your current data:

```sql
-- Import existing members
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

-- Import notices
INSERT INTO notices (title, detail, date) VALUES
('Independence Day cleanliness drive', 'Join 7 AM at community center.', '2025-08-15'),
('Ganesh Puja planning meeting', 'Volunteers needed for decoration, prasad & security.', '2025-07-20'),
('Saraswati Puja cultural evening', 'Music & recitations from 6 PM.', '2025-02-14'),
('Year-end report published', 'See Donate page for transparency note.', '2024-12-31');

-- Import initial settings
INSERT INTO settings (club_name, address, upi_id) VALUES
('Sun Shine Club Kendupalli', 'Kendupalli, Bhubaneswar, Odisha', 'your-upi-id@okaxis');
```

---

## 🎉 You're Done!

After completing these steps:

1. **Visit your admin panel**: Login and see real database statistics
2. **Add/edit data**: Changes appear instantly across all devices  
3. **Test real-time**: Open website on multiple tabs/devices and watch live updates
4. **Monitor usage**: Check Supabase dashboard for database stats

## 🔍 Troubleshooting

**Dashboard still shows 0s?**
- Check `js/config.js` - ensure `ENABLE_DATABASE: true`
- Verify your Supabase URL and key are correct
- Open browser console and look for error messages
- Make sure all SQL tables were created successfully

**Database not connecting?**
- Confirm your Supabase project is active
- Check if Row Level Security policies are created
- Ensure internet connection is stable

**Need help?**
- Check browser console for error messages
- Visit [Supabase Documentation](https://supabase.com/docs)
- Review `DATABASE_SETUP.md` for detailed instructions

---

## 💰 Pricing (Always Free)

- **500MB** database storage
- **2GB** bandwidth per month  
- **Unlimited** API requests
- **Real-time subscriptions** included
- **No credit card** required
- **No time limits**

Perfect for community websites like yours! 🏠✨
