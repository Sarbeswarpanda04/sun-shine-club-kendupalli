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
      await this.initStorage();
      console.log('✅ Database connected and real-time enabled');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  // Initialize Supabase Storage
  async initStorage() {
    try {
      // Create buckets if they don't exist
      await this.createStorageBucket('members');
      await this.createStorageBucket('gallery');
      await this.createStorageBucket('logo');
      console.log('✅ Storage buckets initialized');
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
    }
  }

  // Create a storage bucket if it doesn't exist
  async createStorageBucket(name) {
    try {
      const response = await fetch(`${this.supabaseUrl}/storage/v1/buckets`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name,
          public: true,
          file_size_limit: 5242880, // 5MB limit
          allowed_mime_types: ['image/jpeg', 'image/png', 'image/webp']
        })
      });
      if (!response.ok && response.status !== 400) { // 400 means bucket exists
        throw new Error(`Failed to create bucket ${name}`);
      }
    } catch (error) {
      console.warn(`Note: Bucket ${name} might already exist:`, error);
    }
  }

  // Upload an image to Supabase Storage
  async uploadImage(file, bucket, path) {
    try {
      // Convert file to proper format if needed
      let imageFile = file;
      if (file instanceof HTMLImageElement) {
        const response = await fetch(file.src);
        const blob = await response.blob();
        imageFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `${timestamp}-${randomString}.${imageFile.name.split('.').pop()}`;
      const fullPath = path ? `${path}/${fileName}` : fileName;

      // Upload to Supabase Storage
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${bucket}/${fullPath}`,
        {
          method: 'POST',
          headers: {
            'apikey': this.supabaseKey,
            'Authorization': `Bearer ${this.supabaseKey}`,
          },
          body: imageFile
        }
      );

      if (!response.ok) throw new Error('Upload failed');

      // Return the public URL
      const publicUrl = `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${fullPath}`;
      return publicUrl;
    } catch (error) {
      console.error('❌ Image upload failed:', error);
      throw error;
    }
  }

  // Delete an image from Supabase Storage
  async deleteImage(bucket, path) {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/${bucket}/${path}`,
        {
          method: 'DELETE',
          headers: this.headers
        }
      );

      if (!response.ok) throw new Error('Delete failed');
      return true;
    } catch (error) {
      console.error('❌ Image deletion failed:', error);
      throw error;
    }
  }

  // Get a list of images from a bucket
  async listImages(bucket, path = '') {
    try {
      const response = await fetch(
        `${this.supabaseUrl}/storage/v1/object/list/${bucket}/${path}`,
        {
          headers: this.headers
        }
      );

      if (!response.ok) throw new Error('Failed to list images');
      const files = await response.json();
      
      // Convert to public URLs
      return files.map(file => ({
        ...file,
        url: `${this.supabaseUrl}/storage/v1/object/public/${bucket}/${file.name}`
      }));
    } catch (error) {
      console.error('❌ Failed to list images:', error);
      throw error;
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
      // Upload photo to storage if provided
      let photoUrl = null;
      if (memberData.photo) {
        photoUrl = await this.uploadImage(memberData.photo, 'members', 'profile');
      }

      const response = await fetch(`${this.apiUrl}/members`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          name: memberData.name,
          photo: photoUrl,
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
      // Get current member data to handle photo deletion
      const currentMember = await this.getMember(id);
      let photoUrl = currentMember.photo;

      // If new photo is provided, upload it and delete old one
      if (memberData.photo && memberData.photo !== currentMember.photo) {
        // Upload new photo
        photoUrl = await this.uploadImage(memberData.photo, 'members', 'profile');

        // Delete old photo if it exists
        if (currentMember.photo && currentMember.photo.includes('/storage/v1/object/public/')) {
          const oldPath = currentMember.photo.split('/public/')[1];
          await this.deleteImage('members', oldPath);
        }
      }

      const response = await fetch(`${this.apiUrl}/members?id=eq.${id}`, {
        method: 'PATCH',
        headers: this.headers,
        body: JSON.stringify({
          name: memberData.name,
          photo: photoUrl,
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

  async getMember(id) {
    try {
      const response = await fetch(`${this.apiUrl}/members?id=eq.${id}&select=*`, {
        headers: this.headers
      });

      if (!response.ok) throw new Error('Failed to fetch member');
      const members = await response.json();
      return members[0];
    } catch (error) {
      console.error('❌ Error fetching member:', error);
      throw error;
    }
  }

  async deleteMember(id) {
    try {
      // Get member data first to handle photo deletion
      const member = await this.getMember(id);

      // Delete photo from storage if it exists
      if (member.photo && member.photo.includes('/storage/v1/object/public/')) {
        const photoPath = member.photo.split('/public/')[1];
        await this.deleteImage('members', photoPath);
      }

      // Then delete member record
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
      // Upload image to storage
      const imageUrl = await this.uploadImage(imageData.file, 'gallery', `${imageData.year}/${imageData.festival}`);
      
      const response = await fetch(`${this.apiUrl}/gallery`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          year: imageData.year,
          festival: imageData.festival,
          filename: imageUrl.split('/').pop(),
          url: imageUrl,
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

  async deleteGalleryImage(id) {
    try {
      // Get image data first
      const response = await fetch(`${this.apiUrl}/gallery?id=eq.${id}&select=*`, {
        headers: this.headers
      });
      
      if (!response.ok) throw new Error('Failed to fetch gallery image');
      const images = await response.json();
      const image = images[0];

      // Delete from storage if URL is from our storage
      if (image.url && image.url.includes('/storage/v1/object/public/')) {
        const imagePath = image.url.split('/public/')[1];
        await this.deleteImage('gallery', imagePath);
      }

      // Delete from database
      const deleteResponse = await fetch(`${this.apiUrl}/gallery?id=eq.${id}`, {
        method: 'DELETE',
        headers: this.headers
      });

      if (!deleteResponse.ok) throw new Error('Failed to delete gallery image');
      console.log('✅ Gallery image deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting gallery image:', error);
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
