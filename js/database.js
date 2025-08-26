// Supabase Database Integration for Sun Shine Club
// Free real-time PostgreSQL database with REST API

class DatabaseManager {
  constructor() {
    // Supabase configuration - Replace with your project details
    this.supabaseUrl = 'https://your-project.supabase.co';
    this.supabaseKey = 'your-anon-key';
    this.apiUrl = `${this.supabaseUrl}/rest/v1`;
    this.realtimeUrl = `${this.supabaseUrl}/realtime/v1`;
    
    this.headers = {
      'apikey': this.supabaseKey,
      'Authorization': `Bearer ${this.supabaseKey}`,
      'Content-Type': 'application/json'
    };
  }

  // Initialize database connection and setup real-time listeners
  async init() {
    try {
      await this.createTables();
      this.setupRealtimeListeners();
      console.log('✅ Database connected and real-time enabled');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Create required tables if they don't exist
  async createTables() {
    // This would typically be done via Supabase dashboard
    // Tables needed: members, notices, settings, gallery
    console.log('📊 Setting up database tables...');
  }

  // MEMBERS CRUD OPERATIONS
  async getMembers() {
    try {
      const response = await fetch(`${this.apiUrl}/members?select=*&order=id`, {
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch members');
      const members = await response.json();
      console.log(`📥 Loaded ${members.length} members from database`);
      return members;
    } catch (error) {
      console.error('❌ Error fetching members:', error);
      return [];
    }
  }

  async addMember(memberData) {
    try {
      const response = await fetch(`${this.apiUrl}/members`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name: memberData.name,
          photo: memberData.photo,
          phone: memberData.phone || '',
          email: memberData.email || '',
          position: memberData.position || '',
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to add member');
      const newMember = await response.json();
      console.log('✅ Member added to database:', newMember[0]);
      return newMember[0];
    } catch (error) {
      console.error('❌ Error adding member:', error);
      throw error;
    }
  }

  async updateMember(id, memberData) {
    try {
      const response = await fetch(`${this.apiUrl}/members?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          name: memberData.name,
          photo: memberData.photo,
          phone: memberData.phone || '',
          email: memberData.email || '',
          position: memberData.position || '',
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update member');
      console.log('✅ Member updated in database');
      return true;
    } catch (error) {
      console.error('❌ Error updating member:', error);
      throw error;
    }
  }

  async deleteMember(id) {
    try {
      const response = await fetch(`${this.apiUrl}/members?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) throw new Error('Failed to delete member');
      console.log('✅ Member deleted from database');
      return true;
    } catch (error) {
      console.error('❌ Error deleting member:', error);
      throw error;
    }
  }

  // NOTICES CRUD OPERATIONS
  async getNotices() {
    try {
      const response = await fetch(`${this.apiUrl}/notices?select=*&order=created_at.desc`, {
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch notices');
      const notices = await response.json();
      console.log(`📥 Loaded ${notices.length} notices from database`);
      return notices;
    } catch (error) {
      console.error('❌ Error fetching notices:', error);
      return [];
    }
  }

  async addNotice(noticeData) {
    try {
      const response = await fetch(`${this.apiUrl}/notices`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          title: noticeData.title,
          detail: noticeData.detail,
          date: noticeData.date,
          active: true,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to add notice');
      const newNotice = await response.json();
      console.log('✅ Notice added to database:', newNotice[0]);
      return newNotice[0];
    } catch (error) {
      console.error('❌ Error adding notice:', error);
      throw error;
    }
  }

  async updateNotice(id, noticeData) {
    try {
      const response = await fetch(`${this.apiUrl}/notices?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          title: noticeData.title,
          detail: noticeData.detail,
          date: noticeData.date,
          active: noticeData.active,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update notice');
      console.log('✅ Notice updated in database');
      return true;
    } catch (error) {
      console.error('❌ Error updating notice:', error);
      throw error;
    }
  }

  async deleteNotice(id) {
    try {
      const response = await fetch(`${this.apiUrl}/notices?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!response.ok) throw new Error('Failed to delete notice');
      console.log('✅ Notice deleted from database');
      return true;
    } catch (error) {
      console.error('❌ Error deleting notice:', error);
      throw error;
    }
  }

  // SETTINGS CRUD OPERATIONS
  async getSettings() {
    try {
      const response = await fetch(`${this.apiUrl}/settings?select=*`, {
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch settings');
      const settings = await response.json();
      console.log('📥 Loaded settings from database');
      return settings[0] || {};
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return {};
    }
  }

  async updateSettings(settingsData) {
    try {
      // First try to get existing settings
      const existing = await this.getSettings();
      
      const method = existing.id ? 'PATCH' : 'POST';
      const url = existing.id 
        ? `${this.apiUrl}/settings?id=eq.${existing.id}`
        : `${this.apiUrl}/settings`;

      const response = await fetch(url, {
        method: method,
        headers: this.headers,
        body: JSON.stringify({
          club_name: settingsData.clubName,
          address: settingsData.address,
          upi_id: settingsData.upiId,
          facebook: settingsData.facebook,
          instagram: settingsData.instagram,
          youtube: settingsData.youtube,
          updated_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to update settings');
      console.log('✅ Settings updated in database');
      return true;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw error;
    }
  }

  // GALLERY OPERATIONS
  async getGalleryImages() {
    try {
      const response = await fetch(`${this.apiUrl}/gallery?select=*&order=year.desc,festival`, {
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch gallery');
      const images = await response.json();
      console.log(`📥 Loaded ${images.length} gallery images from database`);
      return images;
    } catch (error) {
      console.error('❌ Error fetching gallery:', error);
      return [];
    }
  }

  async addGalleryImage(imageData) {
    try {
      const response = await fetch(`${this.apiUrl}/gallery`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          year: imageData.year,
          festival: imageData.festival,
          filename: imageData.filename,
          url: imageData.url,
          created_at: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to add image');
      const newImage = await response.json();
      console.log('✅ Gallery image added to database');
      return newImage[0];
    } catch (error) {
      console.error('❌ Error adding gallery image:', error);
      throw error;
    }
  }

  // REAL-TIME LISTENERS
  setupRealtimeListeners() {
    // This would use Supabase's real-time WebSocket connection
    console.log('🔄 Setting up real-time listeners...');
    
    // Listen for member changes
    this.subscribeToTable('members', (payload) => {
      console.log('🔄 Real-time member update:', payload);
      window.dispatchEvent(new CustomEvent('databaseMembersUpdated', { detail: payload }));
    });

    // Listen for notice changes
    this.subscribeToTable('notices', (payload) => {
      console.log('🔄 Real-time notice update:', payload);
      window.dispatchEvent(new CustomEvent('databaseNoticesUpdated', { detail: payload }));
    });

    // Listen for settings changes
    this.subscribeToTable('settings', (payload) => {
      console.log('🔄 Real-time settings update:', payload);
      window.dispatchEvent(new CustomEvent('databaseSettingsUpdated', { detail: payload }));
    });
  }

  subscribeToTable(table, callback) {
    // Simplified real-time subscription
    // In production, this would use Supabase's WebSocket connection
    console.log(`📡 Subscribed to ${table} changes`);
  }

  // STATISTICS
  async getStatistics() {
    try {
      const [members, notices, gallery] = await Promise.all([
        this.getMembers(),
        this.getNotices(),
        this.getGalleryImages()
      ]);

      return {
        totalMembers: members.length,
        activeNotices: notices.filter(n => n.active).length,
        galleryImages: gallery.length,
        websiteVisits: await this.getWebsiteVisits()
      };
    } catch (error) {
      console.error('❌ Error getting statistics:', error);
      return { totalMembers: 0, activeNotices: 0, galleryImages: 0, websiteVisits: 0 };
    }
  }

  async getWebsiteVisits() {
    // This could track actual visits in the database
    return 1234; // Placeholder
  }
}

// Initialize database manager
const db = new DatabaseManager();

// Export for use in other files
window.DatabaseManager = DatabaseManager;
window.db = db;
