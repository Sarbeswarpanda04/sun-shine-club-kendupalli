/* Admin Panel JavaScript */

// Admin credentials (in production, this should be server-side)
const ADMIN_CREDENTIALS = {
  email: 'admin@sunshineclubkendupalli.com',
  password: 'sunshine2025'
};

// Admin state
let adminData = {
  isLoggedIn: false,
  currentUser: null,
  members: [],
  gallery: {},
  notices: [],
  settings: {
    clubName: 'Sun Shine Club',
    address: 'Kendupalli, Barabati, Bhapur, Nayagarh, Odisha – 752077',
    upiId: 'sunshineclubkendupalli@axl',
    facebook: '',
    instagram: '',
    youtube: 'https://www.youtube.com/@SunshineClubKendupalli'
  }
};

document.addEventListener('DOMContentLoaded', async function() {
  // Initialize database connection first
  if (window.db) {
    const dbConnected = await db.init();
    if (dbConnected) {
      console.log('🚀 Database connected successfully');
      toast('🌐 Connected to real-time database');
    } else {
      console.warn('⚠️ Database connection failed, using local storage');
      toast('⚠️ Using offline mode - database unavailable');
    }
  }
  
  if (document.body.dataset.page === 'admin') {
    initAdminPanel();
  } else {
    checkAdminStatus();
  }
});

function initAdminPanel() {
  checkAdminLogin();
  initAdminEventListeners();
  loadAdminData();
}

function checkAdminStatus() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const adminNav = document.getElementById('admin-nav');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (adminNav && logoutBtn) {
    if (isLoggedIn) {
      // Show admin controls with smooth fade-in
      adminNav.style.opacity = '0';
      logoutBtn.style.opacity = '0';
      
      adminNav.style.display = 'flex';
      logoutBtn.style.display = 'flex';
      
      // Trigger reflow
      void adminNav.offsetWidth;
      void logoutBtn.offsetWidth;
      
      // Add transition
      adminNav.style.transition = 'opacity 0.3s ease-in-out';
      logoutBtn.style.transition = 'opacity 0.3s ease-in-out';
      
      // Show buttons
      adminNav.style.opacity = '1';
      logoutBtn.style.opacity = '1';
      
      // Add logout functionality
      logoutBtn.addEventListener('click', adminLogout);
    } else {
      // Hide admin controls
      adminNav.style.display = 'none';
      logoutBtn.style.display = 'none';
    }
  }
}

function checkAdminLogin() {
  const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const loginSection = document.getElementById('loginSection');
  const adminPanel = document.getElementById('adminPanel');
  
  if (isLoggedIn) {
    loginSection.style.display = 'none';
    adminPanel.style.display = 'block';
    adminData.isLoggedIn = true;
    adminData.currentUser = localStorage.getItem('adminEmail');
    document.getElementById('adminWelcome').textContent = adminData.currentUser;
    
    // Load dashboard data immediately after login
    loadAdminData();
  } else {
    loginSection.style.display = 'block';
    adminPanel.style.display = 'none';
  }
}

function initAdminEventListeners() {
  // Login form
  const loginForm = document.getElementById('adminLoginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Members management
  const addMemberBtn = document.getElementById('addMemberBtn');
  if (addMemberBtn) {
    addMemberBtn.addEventListener('click', () => openMemberModal());
  }

  // Member modal
  const memberForm = document.getElementById('memberForm');
  if (memberForm) {
    memberForm.addEventListener('submit', saveMember);
  }

  const closeMemberModal = document.getElementById('closeMemberModal');
  const cancelMemberBtn = document.getElementById('cancelMemberBtn');
  if (closeMemberModal) closeMemberModal.addEventListener('click', closeMemberModalHandler);
  if (cancelMemberBtn) cancelMemberBtn.addEventListener('click', closeMemberModalHandler);

  // Notices management
  const addNoticeBtn = document.getElementById('addNoticeBtn');
  if (addNoticeBtn) {
    addNoticeBtn.addEventListener('click', () => openNoticeModal());
  }

  // Notice modal
  const noticeForm = document.getElementById('noticeForm');
  if (noticeForm) {
    noticeForm.addEventListener('submit', saveNotice);
  }

  const closeNoticeModal = document.getElementById('closeNoticeModal');
  const cancelNoticeBtn = document.getElementById('cancelNoticeBtn');
  if (closeNoticeModal) closeNoticeModal.addEventListener('click', closeNoticeModalHandler);
  if (cancelNoticeBtn) cancelNoticeBtn.addEventListener('click', closeNoticeModalHandler);

  // Settings forms
  const siteSettingsForm = document.getElementById('siteSettingsForm');
  if (siteSettingsForm) {
    siteSettingsForm.addEventListener('submit', saveSiteSettings);
  }

  const socialSettingsForm = document.getElementById('socialSettingsForm');
  if (socialSettingsForm) {
    socialSettingsForm.addEventListener('submit', saveSocialSettings);
  }
}

function handleAdminLogin(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');

  if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
    // Login successful
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminEmail', email);
    adminData.isLoggedIn = true;
    adminData.currentUser = email;
    
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('adminWelcome').textContent = email;
    
    toast('✅ Login successful! Welcome to admin panel.');
    loadAdminData();
    logActivity('Admin logged in');
  } else {
    toast('❌ Invalid email or password!');
  }
}

function adminLogout() {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminEmail');
  adminData.isLoggedIn = false;
  adminData.currentUser = null;
  
  // Redirect to login
  if (window.location.pathname.includes('admin.html')) {
    window.location.reload();
  } else {
    window.location.href = '/admin.html';
  }
  
  toast('👋 Logged out successfully!');
}

function switchTab(tabName) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Remove active class from all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected tab content
  document.getElementById(tabName).classList.add('active');
  
  // Add active class to clicked button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Load tab-specific data
  if (tabName === 'dashboard') {
    loadAdminData();
  } else if (tabName === 'members') {
    loadMembersData();
  } else if (tabName === 'gallery') {
    loadGalleryData();
  } else if (tabName === 'notices') {
    loadNoticesData();
  } else if (tabName === 'settings') {
    loadSettingsData();
  }
}

async function loadAdminData() {
  await loadMembersData();
  await loadNoticesData();
  updateDashboardStats();
}

async function loadMembersData() {
  try {
    // Try to load from database first
    if (window.db) {
      const members = await db.getMembers();
      if (members && members.length > 0) {
        adminData.members = members;
        renderMembersTable();
        updateDashboardStats();
        console.log('✅ Loaded members from database');
        return;
      }
    }
    
    // Fallback to localStorage
    const adminMembers = localStorage.getItem('adminMembers');
    if (adminMembers) {
      try {
        adminData.members = JSON.parse(adminMembers);
        renderMembersTable();
        updateDashboardStats();
        console.log('📱 Loaded members from local storage');
        return;
      } catch (error) {
        console.warn('Failed to parse admin members:', error);
      }
    }

    // Final fallback to JSON file
    try {
      const response = await fetch('/data/members.json');
      const members = await response.json();
      adminData.members = members;
      
      // Save to database if available
      if (window.db) {
        for (const member of members) {
          await db.addMember(member);
        }
      }
      
      renderMembersTable();
      updateDashboardStats();
      console.log('📁 Loaded members from JSON file');
    } catch (error) {
      console.error('❌ Failed to load members:', error);
      adminData.members = [];
      renderMembersTable();
      updateDashboardStats();
    }
  } catch (error) {
    console.error('❌ Error in loadMembersData:', error);
    adminData.members = [];
    updateDashboardStats();
  }
}

function renderMembersTable() {
  const tbody = document.getElementById('membersTableBody');
  if (!tbody) return;

  tbody.innerHTML = adminData.members.map((member, index) => `
    <tr>
      <td><img src="${member.photo}" alt="${member.name}" onerror="this.src='/assets/icons/logo.png'"></td>
      <td>${member.name}</td>
      <td>${member.phone || 'N/A'}</td>
      <td>${member.position || 'Member'}</td>
      <td>#${String(index + 1).padStart(3, '0')}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-edit" onclick="editMember(${index})">Edit</button>
          <button class="btn-delete" onclick="deleteMember(${index})">Delete</button>
          <button class="btn-id-card" onclick="generateIDCard(${index})">Generate ID</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openMemberModal(memberIndex = null) {
  const modal = document.getElementById('memberModal');
  const title = document.getElementById('memberModalTitle');
  const form = document.getElementById('memberForm');
  
  if (memberIndex !== null) {
    // Edit mode
    const member = adminData.members[memberIndex];
    title.textContent = 'Edit Member';
    document.getElementById('memberIndex').value = memberIndex;
    document.getElementById('memberName').value = member.name;
    document.getElementById('memberPhone').value = member.phone || '';
    document.getElementById('memberPosition').value = member.position || '';
    document.getElementById('memberPhoto').value = member.photo;
    document.getElementById('memberAlt').value = member.alt || '';
  } else {
    // Add mode
    title.textContent = 'Add New Member';
    form.reset();
    document.getElementById('memberIndex').value = '';
  }
  
  modal.style.display = 'flex';
}

function closeMemberModalHandler() {
  document.getElementById('memberModal').style.display = 'none';
}

function editMember(index) {
  openMemberModal(index);
}

async function deleteMember(index) {
  if (confirm('Are you sure you want to delete this member?')) {
    const member = adminData.members[index];
    const memberName = member.name;
    
    try {
      // Try to delete from database first
      if (window.db && member.id) {
        // Delete photo from storage if it exists
        if (member.photo && member.photo.includes('/storage/v1/object/public/')) {
          try {
            await db.deleteImage('members', member.photo.split('/public/')[1]);
          } catch (imageError) {
            console.warn('Failed to delete member photo:', imageError);
          }
        }

        // Delete member record
        await db.deleteMember(member.id);
        toast(`✅ ${memberName} deleted from database.`);
        logActivity(`Deleted member from database: ${memberName}`);
      } else {
        toast(`⚠️ ${memberName} deleted locally (database unavailable).`);
        logActivity(`Deleted member locally: ${memberName}`);
      }
      
      // Remove from local array
      adminData.members.splice(index, 1);
      saveMembersData(); // Also save to localStorage as backup
      renderMembersTable();
      updateDashboardStats();
    } catch (error) {
      console.error('Failed to delete member:', error);
      toast(`❌ Failed to delete ${memberName}. Please try again.`);
    }
  }
}

function saveMember(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const memberIndex = document.getElementById('memberIndex').value;
  const photoInput = document.getElementById('photoInput');
  
  const memberData = {
    name: formData.get('name'),
    phone: formData.get('phone') || '',
    position: formData.get('position') || 'Member',
    alt: formData.get('alt') || formData.get('name')
  };

  // Handle photo file or URL
  if (photoInput && photoInput.files && photoInput.files[0]) {
    memberData.photoFile = photoInput.files[0]; // Store the actual file
    memberData.photo = URL.createObjectURL(photoInput.files[0]); // Temporary URL for preview
  } else {
    memberData.photo = formData.get('photo') || ''; // Use existing photo URL if no new file
  }
  
  if (memberIndex === '') {
    // Add new member
    addNewMemberToDatabase(memberData);
  } else {
    // Edit existing member
    updateExistingMemberInDatabase(parseInt(memberIndex), memberData);
  }
}

async function addNewMemberToDatabase(memberData) {
  try {
    // Try to add to database first
    if (window.db) {
      // Handle file upload if it's present
      if (memberData.photoFile) {
        try {
          // Create a File object from the input
          const photoFile = memberData.photoFile instanceof File ? 
            memberData.photoFile : 
            await fetch(memberData.photo).then(r => r.blob()).then(blob => 
              new File([blob], 'profile.jpg', { type: 'image/jpeg' })
            );
          
          // Upload to storage and get URL
          memberData.photo = await db.uploadImage(photoFile, 'members', 'profile');
        } catch (uploadError) {
          console.error('Failed to upload image:', uploadError);
          toast('⚠️ Failed to upload image, but will continue with member creation');
        }
        delete memberData.photoFile; // Remove the file object before saving to database
      }

      const newMember = await db.addMember(memberData);
      if (newMember) {
        // Add to local array with database ID
        adminData.members.push({...memberData, id: newMember.id});
        toast(`✅ ${memberData.name} added to database and members list.`);
        logActivity(`Added new member to database: ${memberData.name}`);
        renderMembersTable();
        updateDashboardStats();
        closeMemberModalHandler();
        return;
      }
    }
    
    // Fallback to local storage only
    adminData.members.push(memberData);
    toast(`⚠️ ${memberData.name} added locally (database unavailable).`);
    logActivity(`Added new member locally: ${memberData.name}`);
    saveMembersData();
    renderMembersTable();
    updateDashboardStats();
    closeMemberModalHandler();
  } catch (error) {
    console.error('Failed to add member:', error);
    toast(`❌ Failed to add ${memberData.name}. Please try again.`);
  }
}

async function updateExistingMemberInDatabase(memberIndex, memberData) {
  try {
    const existingMember = adminData.members[memberIndex];
    
    // Try to update in database first
    if (window.db && existingMember.id) {
      // Handle file upload if it's present
      if (memberData.photoFile) {
        try {
          // Create a File object from the input
          const photoFile = memberData.photoFile instanceof File ? 
            memberData.photoFile : 
            await fetch(memberData.photo).then(r => r.blob()).then(blob => 
              new File([blob], 'profile.jpg', { type: 'image/jpeg' })
            );
          
          // Delete old photo if it exists
          if (existingMember.photo && existingMember.photo.includes('/storage/v1/object/public/')) {
            await db.deleteImage('members', existingMember.photo.split('/public/')[1]);
          }

          // Upload new photo and get URL
          memberData.photo = await db.uploadImage(photoFile, 'members', 'profile');
        } catch (uploadError) {
          console.error('Failed to handle image update:', uploadError);
          toast('⚠️ Failed to update image, but will continue with other updates');
          memberData.photo = existingMember.photo; // Keep old photo if upload fails
        }
        delete memberData.photoFile; // Remove the file object before saving to database
      }

      const updatedMember = await db.updateMember(existingMember.id, memberData);
      if (updatedMember) {
        // Update local array
        adminData.members[memberIndex] = {...memberData, id: existingMember.id};
        toast(`✅ ${memberData.name} updated in database.`);
        logActivity(`Updated member in database: ${memberData.name}`);
        renderMembersTable();
        updateDashboardStats();
        closeMemberModalHandler();
        return;
      }
    }
    
    // Fallback to local storage only
    adminData.members[memberIndex] = memberData;
    toast(`⚠️ ${memberData.name} updated locally (database unavailable).`);
    logActivity(`Updated member locally: ${memberData.name}`);
    saveMembersData();
    renderMembersTable();
    updateDashboardStats();
    closeMemberModalHandler();
  } catch (error) {
    console.error('Failed to update member:', error);
    toast(`❌ Failed to update ${memberData.name}. Please try again.`);
  }
}

async function saveMembersData() {
  // Save to localStorage for persistence
  localStorage.setItem('adminMembers', JSON.stringify(adminData.members));
  
  // Also update the main members data that the website uses
  localStorage.setItem('websiteMembers', JSON.stringify(adminData.members));
  
  console.log('Members data saved:', adminData.members);
  
  // Notify other pages about the data change
  window.dispatchEvent(new CustomEvent('membersUpdated', { 
    detail: adminData.members 
  }));
}

async function loadNoticesData() {
  try {
    // Try to load from database first
    if (window.db) {
      const notices = await db.getNotices();
      if (notices && notices.length > 0) {
        adminData.notices = notices;
        renderNoticesList();
        updateDashboardStats();
        console.log('✅ Loaded notices from database');
        return;
      }
    }
    
    // Fallback to localStorage
    const adminNotices = localStorage.getItem('adminNotices');
    if (adminNotices) {
      try {
        adminData.notices = JSON.parse(adminNotices);
        renderNoticesList();
        updateDashboardStats();
        console.log('📱 Loaded notices from local storage');
        return;
      } catch (error) {
        console.warn('Failed to parse admin notices:', error);
      }
    }

    // Default notices if no data available
    adminData.notices = [
      { id: 'n1', date: '2025-08-15', title: 'Independence Day cleanliness drive', detail: 'Join 7 AM at community center.' },
      { id: 'n2', date: '2025-07-20', title: 'Ganesh Puja planning meeting', detail: 'Volunteers needed for decoration, prasad & security.' },
      { id: 'n3', date: '2025-02-14', title: 'Saraswati Puja cultural evening', detail: 'Music & recitations from 6 PM.' },
      { id: 'n4', date: '2024-12-31', title: 'Year-end report published', detail: 'See Donate page for transparency note.' }
    ];
    
    // Save to database if available
    if (window.db) {
      for (const notice of adminData.notices) {
        await db.addNotice(notice);
      }
    }
    
    renderNoticesList();
    updateDashboardStats();
    console.log('📁 Loaded default notices');
  } catch (error) {
    console.error('❌ Error in loadNoticesData:', error);
    adminData.notices = [];
    updateDashboardStats();
  }
}

function renderNoticesList() {
  const container = document.getElementById('adminNoticesList');
  if (!container) return;

  container.innerHTML = adminData.notices.map(notice => `
    <div class="notice-item">
      <div class="notice-item-header">
        <h3>${notice.title}</h3>
        <div>
          <span class="notice-date">${new Date(notice.date).toLocaleDateString('en-IN')}</span>
          <div class="action-buttons" style="margin-top: 0.5rem;">
            <button class="btn-edit" onclick="editNotice('${notice.id}')">Edit</button>
            <button class="btn-delete" onclick="deleteNotice('${notice.id}')">Delete</button>
          </div>
        </div>
      </div>
      <p>${notice.detail}</p>
    </div>
  `).join('');
}

function openNoticeModal(noticeId = null) {
  const modal = document.getElementById('noticeModal');
  const title = document.getElementById('noticeModalTitle');
  const form = document.getElementById('noticeForm');
  
  if (noticeId) {
    // Edit mode
    const notice = adminData.notices.find(n => n.id === noticeId);
    title.textContent = 'Edit Notice';
    document.getElementById('noticeId').value = noticeId;
    document.getElementById('noticeTitle').value = notice.title;
    document.getElementById('noticeDate').value = notice.date;
    document.getElementById('noticeDetail').value = notice.detail;
  } else {
    // Add mode
    title.textContent = 'Add New Notice';
    form.reset();
    document.getElementById('noticeId').value = '';
  }
  
  modal.style.display = 'flex';
}

function closeNoticeModalHandler() {
  document.getElementById('noticeModal').style.display = 'none';
}

function editNotice(id) {
  openNoticeModal(id);
}

function deleteNotice(id) {
  if (confirm('Are you sure you want to delete this notice?')) {
    const notice = adminData.notices.find(n => n.id === id);
    adminData.notices = adminData.notices.filter(n => n.id !== id);
    renderNoticesList();
    updateDashboardStats();
    toast(`🗑️ Notice "${notice.title}" deleted.`);
    logActivity(`Deleted notice: ${notice.title}`);
  }
}

function saveNotice(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const noticeId = document.getElementById('noticeId').value;
  
  const noticeData = {
    id: noticeId || 'n' + Date.now(),
    title: formData.get('title'),
    date: formData.get('date'),
    detail: formData.get('detail')
  };
  
  if (noticeId) {
    // Edit existing notice
    const index = adminData.notices.findIndex(n => n.id === noticeId);
    adminData.notices[index] = noticeData;
    toast(`✅ Notice "${noticeData.title}" updated.`);
    logActivity(`Updated notice: ${noticeData.title}`);
  } else {
    // Add new notice
    adminData.notices.unshift(noticeData);
    toast(`✅ Notice "${noticeData.title}" added.`);
    logActivity(`Added new notice: ${noticeData.title}`);
  }
  
  // Save notices data
  saveNoticesData();
  
  renderNoticesList();
  updateDashboardStats();
  closeNoticeModalHandler();
}

function saveNoticesData() {
  // Save to localStorage for persistence
  localStorage.setItem('adminNotices', JSON.stringify(adminData.notices));
  
  // Also update the main notices data that the website uses
  localStorage.setItem('websiteNotices', JSON.stringify(adminData.notices));
  
  console.log('Notices data saved:', adminData.notices);
  
  // Notify other pages about the data change
  window.dispatchEvent(new CustomEvent('noticesUpdated', { 
    detail: adminData.notices 
  }));
}

function loadGalleryData() {
  // Placeholder for gallery management
  const container = document.getElementById('adminGalleryGrid');
  if (container) {
    container.innerHTML = '<p class="muted">Gallery management coming soon...</p>';
  }
}

function loadSettingsData() {
  // Load from admin localStorage if available
  const adminSettings = localStorage.getItem('adminSettings');
  if (adminSettings) {
    try {
      adminData.settings = { ...adminData.settings, ...JSON.parse(adminSettings) };
      console.log('Loaded settings from admin storage');
    } catch (error) {
      console.warn('Failed to parse admin settings:', error);
    }
  }

  // Update form fields
  document.getElementById('clubName').value = adminData.settings.clubName;
  document.getElementById('clubAddress').value = adminData.settings.address;
  document.getElementById('upiIdSetting').value = adminData.settings.upiId;
  document.getElementById('facebookUrl').value = adminData.settings.facebook;
  document.getElementById('instagramUrl').value = adminData.settings.instagram;
  document.getElementById('youtubeUrl').value = adminData.settings.youtube;
}

function saveSiteSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  adminData.settings.clubName = formData.get('clubName') || formData.get('clubName');
  adminData.settings.address = formData.get('clubAddress') || formData.get('clubAddress'); 
  adminData.settings.upiId = formData.get('upiIdSetting') || formData.get('upiIdSetting');
  
  // Save to localStorage for persistence
  localStorage.setItem('adminSettings', JSON.stringify(adminData.settings));
  localStorage.setItem('websiteSettings', JSON.stringify(adminData.settings));
  localStorage.setItem('adminSettingsTimestamp', Date.now().toString());
  
  // Dispatch custom event for real-time updates
  const event_update = new CustomEvent('adminSettingsUpdated', { 
    detail: adminData.settings 
  });
  window.dispatchEvent(event_update);
  
  // Update UPI ID on donation page immediately
  updateWebsiteSettings();
  
  toast('✅ Site settings saved successfully!');
  logActivity('Updated site settings');
}

function saveSocialSettings(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  adminData.settings.facebook = formData.get('facebookUrl') || '';
  adminData.settings.instagram = formData.get('instagramUrl') || '';
  adminData.settings.youtube = formData.get('youtubeUrl') || '';
  
  // Save to localStorage for persistence
  localStorage.setItem('adminSettings', JSON.stringify(adminData.settings));
  localStorage.setItem('websiteSettings', JSON.stringify(adminData.settings));
  localStorage.setItem('adminSettingsTimestamp', Date.now().toString());
  
  // Dispatch custom event for real-time updates
  const event_update = new CustomEvent('adminSettingsUpdated', { 
    detail: adminData.settings 
  });
  window.dispatchEvent(event_update);
  
  // Update social links on website immediately
  updateWebsiteSettings();
  
  toast('✅ Social media settings saved!');
  logActivity('Updated social media settings');
}

function updateWebsiteSettings() {
  // Notify other pages about settings change
  window.dispatchEvent(new CustomEvent('settingsUpdated', { 
    detail: adminData.settings 
  }));
  
  // If we're on a page that needs immediate updates, apply them
  if (document.body.dataset.page === 'donate') {
    const upiElement = document.getElementById('upiId');
    if (upiElement && adminData.settings.upiId) {
      upiElement.textContent = adminData.settings.upiId;
    }
  }
}

async function updateDashboardStats() {
  console.log('📊 Updating dashboard stats...');
  
  try {
    // Try to get statistics from database
    if (window.db) {
      const stats = await db.getStatistics();
      
      const totalMembersEl = document.getElementById('totalMembers');
      const totalNoticesEl = document.getElementById('totalNotices');
      const totalImagesEl = document.getElementById('totalImages');
      const websiteVisitsEl = document.querySelector('.stat-card:last-child .stat-number');
      
      if (totalMembersEl) totalMembersEl.textContent = stats.totalMembers;
      if (totalNoticesEl) totalNoticesEl.textContent = stats.activeNotices;
      if (totalImagesEl) totalImagesEl.textContent = stats.galleryImages;
      if (websiteVisitsEl) websiteVisitsEl.textContent = stats.websiteVisits.toLocaleString();
      
      console.log('✅ Dashboard stats updated from database:', stats);
      return;
    }
  } catch (error) {
    console.error('❌ Error fetching database statistics:', error);
  }
  
  // Fallback to local data
  console.log('📱 Using local data for statistics');
  console.log('Members count:', adminData.members.length);
  console.log('Notices count:', adminData.notices.length);
  
  const totalMembersEl = document.getElementById('totalMembers');
  const totalNoticesEl = document.getElementById('totalNotices');
  const totalImagesEl = document.getElementById('totalImages');
  
  if (totalMembersEl) totalMembersEl.textContent = adminData.members.length;
  if (totalNoticesEl) totalNoticesEl.textContent = adminData.notices.length;
  
  // Count gallery images from the gallery.json file
  if (totalImagesEl) {
    try {
      const response = await fetch('/data/gallery.json');
      const galleryData = await response.json();
      let imageCount = 0;
      
      // Iterate through years (2025, 2024, etc.)
      Object.values(galleryData).forEach(yearData => {
        // Iterate through festivals (ganesh, saraswati, etc.)
        Object.values(yearData).forEach(festivalImages => {
          if (Array.isArray(festivalImages)) {
            imageCount += festivalImages.length;
          }
        });
      });
      
      totalImagesEl.textContent = imageCount;
      console.log('Gallery images count:', imageCount);
    } catch (error) {
      console.error('Failed to load gallery data:', error);
      if (totalImagesEl) totalImagesEl.textContent = '0';
    }
  }
}

function logActivity(action) {
  const timestamp = new Date().toLocaleString('en-IN');
  const activity = `${timestamp}: ${action}`;
  
  let activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  activities.unshift(activity);
  activities = activities.slice(0, 10); // Keep only last 10 activities
  
  localStorage.setItem('adminActivities', JSON.stringify(activities));
  updateActivityList();
}

function updateActivityList() {
  const container = document.getElementById('activityList');
  if (!container) return;
  
  const activities = JSON.parse(localStorage.getItem('adminActivities') || '[]');
  
  if (activities.length === 0) {
    container.innerHTML = '<p class="muted">No recent activity</p>';
  } else {
    container.innerHTML = activities.map(activity => 
      `<p class="activity-item">${activity}</p>`
    ).join('');
  }
}

// Initialize activity list on load
document.addEventListener('DOMContentLoaded', function() {
  setTimeout(updateActivityList, 1000);
});

// Utility function for toast (if not already defined)
if (typeof toast === 'undefined') {
  function toast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(t._to);
    t._to = setTimeout(() => t.hidden = true, 4000);
  }
}

// ID Card Generation Functions
function generateIDCard(index) {
  const member = adminData.members[index];
  const modal = document.getElementById('idCardModal');
  const canvas = document.getElementById('idCardCanvas');
  
  // Generate the ID card HTML
  canvas.innerHTML = `
    <div class="id-card-header">
      <img src="/assets/logo.png" alt="Sun Shine Club Logo" class="id-card-logo" onerror="this.src='/assets/favicon.png'">
      <div class="id-card-org">
        <div class="id-card-org-name">SUN SHINE CLUB</div>
        <div class="id-card-website">sunshineclubkendupalli.cooo.in</div>
      </div>
    </div>
    
    <div class="id-card-body">
      <img src="${member.photo}" alt="${member.name}" class="id-card-photo" onerror="this.src='/assets/icons/logo.png'">
      <div class="id-card-info">
        <div class="id-card-name">${member.name}</div>
        <div class="id-card-position">${member.position || 'Member'}</div>
        <div class="id-card-contact">
          📱 ${member.phone || 'Not provided'}<br>
          📧 ${member.email || 'info@sunshineclubkendupalli.cooo.in'}<br>
          📍 Kendupalli, Odisha
        </div>
      </div>
    </div>
    
    <div class="id-card-footer">
      <div class="id-card-id">ID: #${String(index + 1).padStart(3, '0')}</div>
      <div>Valid Till: ${new Date(Date.now() + 365*24*60*60*1000).getFullYear()}</div>
    </div>
  `;
  
  // Store current member for download/share functions
  window.currentIDMember = { ...member, index };
  
  modal.style.display = 'flex';
}

function closeIDCardModal() {
  document.getElementById('idCardModal').style.display = 'none';
}

async function downloadIDCard() {
  try {
    const canvas = await convertIDCardToCanvas();
    const link = document.createElement('a');
    link.download = `${window.currentIDMember.name.replace(/\s+/g, '_')}_ID_Card.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.9);
    link.click();
    toast('✅ ID Card downloaded successfully!');
  } catch (error) {
    console.error('Error downloading ID card:', error);
    toast('❌ Failed to download ID card. Please try again.');
  }
}

async function shareIDCard() {
  try {
    const canvas = await convertIDCardToCanvas();
    
    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare) {
        // Use Web Share API if available
        const file = new File([blob], `${window.currentIDMember.name}_ID_Card.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `${window.currentIDMember.name} - Sun Shine Club ID Card`,
            text: `ID Card for ${window.currentIDMember.name}, ${window.currentIDMember.position || 'Member'} at Sun Shine Club Kendupalli`,
            files: [file]
          });
          toast('✅ ID Card shared successfully!');
        } else {
          // Fallback to copy to clipboard
          copyIDCardToClipboard(blob);
        }
      } else {
        // Fallback to download
        copyIDCardToClipboard(blob);
      }
    }, 'image/jpeg', 0.9);
    
  } catch (error) {
    console.error('Error sharing ID card:', error);
    toast('❌ Failed to share ID card. Please try again.');
  }
}

async function copyIDCardToClipboard(blob) {
  try {
    if (navigator.clipboard && navigator.clipboard.write) {
      const item = new ClipboardItem({ 'image/jpeg': blob });
      await navigator.clipboard.write([item]);
      toast('✅ ID Card copied to clipboard! You can paste it anywhere.');
    } else {
      // Final fallback - trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${window.currentIDMember.name.replace(/\s+/g, '_')}_ID_Card.jpg`;
      link.click();
      URL.revokeObjectURL(url);
      toast('✅ ID Card downloaded (sharing not supported on this device).');
    }
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    toast('❌ Failed to copy ID card. Please try the download option.');
  }
}

function printIDCard() {
  const printWindow = window.open('', '_blank');
  const member = window.currentIDMember;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print ID Card - ${member.name}</title>
      <style>
        body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
        .print-container { display: flex; justify-content: center; }
        .id-card { 
          width: 350px; height: 220px; 
          background: linear-gradient(135deg, #F59E0B 0%, #EAB308 100%);
          border-radius: 15px; position: relative; overflow: hidden;
          color: white; display: flex; flex-direction: column;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        }
        .id-card-header { display: flex; align-items: center; padding: 15px; background: rgba(255,255,255,0.1); }
        .id-card-logo { width: 40px; height: 40px; border-radius: 50%; margin-right: 12px; border: 2px solid rgba(255,255,255,0.3); }
        .id-card-org { flex: 1; }
        .id-card-org-name { font-size: 14px; font-weight: 700; line-height: 1.2; margin: 0; }
        .id-card-website { font-size: 10px; opacity: 0.9; margin: 0; }
        .id-card-body { flex: 1; display: flex; padding: 15px; gap: 15px; }
        .id-card-photo { width: 70px; height: 70px; border-radius: 12px; object-fit: cover; border: 3px solid rgba(255,255,255,0.3); }
        .id-card-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
        .id-card-name { font-size: 18px; font-weight: 700; margin: 0; line-height: 1.2; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        .id-card-position { font-size: 12px; opacity: 0.9; margin: 4px 0; font-weight: 500; }
        .id-card-contact { font-size: 11px; opacity: 0.8; line-height: 1.3; }
        .id-card-footer { padding: 8px 15px; background: rgba(0,0,0,0.1); display: flex; justify-content: space-between; align-items: center; font-size: 10px; opacity: 0.8; }
        @media print { body { margin: 0; } .print-container { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="print-container">
        <div class="id-card">
          <div class="id-card-header">
            <img src="/assets/logo.png" alt="Sun Shine Club Logo" class="id-card-logo" onerror="this.src='/assets/favicon.png'">
            <div class="id-card-org">
              <div class="id-card-org-name">SUN SHINE CLUB</div>
              <div class="id-card-website">sunshineclubkendupalli.cooo.in</div>
            </div>
          </div>
          
          <div class="id-card-body">
            <img src="${member.photo}" alt="${member.name}" class="id-card-photo" onerror="this.src='/assets/icons/logo.png'">
            <div class="id-card-info">
              <div class="id-card-name">${member.name}</div>
              <div class="id-card-position">${member.position || 'Member'}</div>
              <div class="id-card-contact">
                📱 ${member.phone || 'Not provided'}<br>
                📧 ${member.email || 'info@sunshineclubkendupalli.cooo.in'}<br>
                📍 Kendupalli, Odisha
              </div>
            </div>
          </div>
          
          <div class="id-card-footer">
            <div class="id-card-id">ID: #${String(member.index + 1).padStart(3, '0')}</div>
            <div>Valid Till: ${new Date(Date.now() + 365*24*60*60*1000).getFullYear()}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
  printWindow.focus();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
    toast('✅ ID Card sent to printer!');
  }, 500);
}

// Helper function to convert ID card to canvas for download/share
async function convertIDCardToCanvas() {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Add roundRect polyfill if not available
      if (!ctx.roundRect) {
        ctx.roundRect = function(x, y, width, height, radius) {
          this.beginPath();
          this.moveTo(x + radius, y);
          this.lineTo(x + width - radius, y);
          this.quadraticCurveTo(x + width, y, x + width, y + radius);
          this.lineTo(x + width, y + height - radius);
          this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
          this.lineTo(x + radius, y + height);
          this.quadraticCurveTo(x, y + height, x, y + height - radius);
          this.lineTo(x, y + radius);
          this.quadraticCurveTo(x, y, x + radius, y);
          this.closePath();
        };
      }
      
      // Set canvas size (ID card dimensions)
      canvas.width = 700; // Higher resolution for better quality
      canvas.height = 440;
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#F59E0B');
      gradient.addColorStop(1, '#EAB308');
      
      // Fill background with rounded corners
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(0, 0, canvas.width, canvas.height, 30);
      ctx.fill();
      
      // Add header background
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, 0, canvas.width, 80);
      
      // Add footer background
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
      
      // Add text content
      ctx.fillStyle = 'white';
      ctx.font = 'bold 28px Inter, Arial, sans-serif';
      ctx.fillText('SUN SHINE CLUB', 120, 40);
      
      ctx.font = '20px Inter, Arial, sans-serif';
      ctx.fillText('sunshineclubkendupalli.cooo.in', 120, 65);
      
      // Member info
      const member = window.currentIDMember;
      ctx.font = 'bold 36px Inter, Arial, sans-serif';
      ctx.fillText(member.name, 200, 160);
      
      ctx.font = '24px Inter, Arial, sans-serif';
      ctx.fillText(member.position || 'Member', 200, 190);
      
      ctx.font = '22px Inter, Arial, sans-serif';
      ctx.fillText(`📱 ${member.phone || 'Not provided'}`, 200, 220);
      ctx.fillText(`📧 ${member.email || 'info@sunshineclubkendupalli.cooo.in'}`, 200, 250);
      ctx.fillText('📍 Kendupalli, Odisha', 200, 280);
      
      // Footer text
      ctx.font = '20px Inter, Arial, sans-serif';
      ctx.fillText(`ID: #${String(member.index + 1).padStart(3, '0')}`, 30, canvas.height - 20);
      ctx.fillText(`Valid Till: ${new Date(Date.now() + 365*24*60*60*1000).getFullYear()}`, canvas.width - 200, canvas.height - 20);
      
      // Load and draw images
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      logoImg.onload = () => {
        // Draw logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(70, 40, 35, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(logoImg, 35, 5, 70, 70);
        ctx.restore();
        
        // Load member photo
        const memberImg = new Image();
        memberImg.crossOrigin = 'anonymous';
        memberImg.onload = () => {
          // Draw member photo with rounded corners
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(30, 120, 140, 140, 24);
          ctx.clip();
          ctx.drawImage(memberImg, 30, 120, 140, 140);
          ctx.restore();
          
          resolve(canvas);
        };
        memberImg.onerror = () => {
          // Draw placeholder if image fails
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(30, 120, 140, 140);
          ctx.fillStyle = 'white';
          ctx.font = '16px Arial';
          ctx.fillText('Photo', 80, 200);
          resolve(canvas);
        };
        memberImg.src = member.photo;
      };
      logoImg.onerror = () => {
        // Draw placeholder logo
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(70, 40, 35, 0, Math.PI * 2);
        ctx.fill();
        
        // Continue with member photo
        const memberImg = new Image();
        memberImg.crossOrigin = 'anonymous';
        memberImg.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(30, 120, 140, 140, 24);
          ctx.clip();
          ctx.drawImage(memberImg, 30, 120, 140, 140);
          ctx.restore();
          resolve(canvas);
        };
        memberImg.onerror = () => {
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.fillRect(30, 120, 140, 140);
          resolve(canvas);
        };
        memberImg.src = member.photo;
      };
      logoImg.src = '/assets/logo.png';
      
    } catch (error) {
      reject(error);
    }
  });
}
