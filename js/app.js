/* Sun Shine Club – shared JS
   - Sticky header nav toggle + active links
   - Intersection Observer fade-in
   - Counter animation (hero stats)
   - Members grid (from JSON)
   - Gallery by year (from JSON) + lightbox with keyboard & swipe
   - Forms validation + toast
   - Notices demo
   - Reduced motion respect
*/

const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initParallax();
  initCounters();
  pageInit();
  initLightbox();
  setYear();
  initRealTimeUpdates();
  
  // Load admin data if available
  loadMembersData();
  loadNoticesData();
  loadSettingsData();
});

function initRealTimeUpdates() {
  // Listen for admin panel updates
window.addEventListener('adminMembersUpdated', function(event) {
  console.log('Admin members updated, refreshing website data...');
  loadMembersData();
});

window.addEventListener('adminNoticesUpdated', function(event) {
  console.log('Admin notices updated, refreshing website data...');
  loadNoticesData();
});

window.addEventListener('adminSettingsUpdated', function(event) {
  console.log('Admin settings updated, updating website...');
  updateWebsiteWithNewSettings(event.detail);
});

function updateWebsiteWithNewSettings(settings) {
  // Update UPI ID in donation form if we're on donate page
  if (window.location.pathname.includes('donate.html')) {
    const upiIdElements = document.querySelectorAll('[data-upi-id]');
    upiIdElements.forEach(element => {
      element.setAttribute('data-upi-id', settings.upiId || '');
    });
  }
  
  // Update club name in headers
  const clubNameElements = document.querySelectorAll('.club-name');
  clubNameElements.forEach(element => {
    element.textContent = settings.clubName || 'Sun Shine Club';
  });
  
  // Update social links in footer
  const socialLinks = {
    facebook: document.querySelector('.social-links a[href*="facebook"]'),
    instagram: document.querySelector('.social-links a[href*="instagram"]'),
    youtube: document.querySelector('.social-links a[href*="youtube"]')
  };
  
  if (socialLinks.facebook && settings.facebook) {
    socialLinks.facebook.href = settings.facebook;
  }
  if (socialLinks.instagram && settings.instagram) {
    socialLinks.instagram.href = settings.instagram;
  }
  if (socialLinks.youtube && settings.youtube) {
    socialLinks.youtube.href = settings.youtube;
  }
}

function loadSettingsData() {
  // Load from admin localStorage first if available
  const adminSettings = localStorage.getItem('adminSettings');
  if (adminSettings) {
    try {
      const settings = JSON.parse(adminSettings);
      updateWebsiteWithNewSettings(settings);
      console.log('Loaded settings from admin storage');
      return;
    } catch (error) {
      console.warn('Failed to parse admin settings:', error);
    }
  }
  
  // Fallback to default settings if no admin data
  const defaultSettings = {
    clubName: 'Sun Shine Club',
    upiId: '',
    facebook: '',
    instagram: '',
    youtube: ''
  };
  updateWebsiteWithNewSettings(defaultSettings);
}
}

function updateMemberCount(count) {
  const statNumbers = document.querySelectorAll('.stat-number[data-countto="36"]');
  statNumbers.forEach(el => {
    el.textContent = count;
    el.dataset.countto = count;
  });
}

function applySettingsUpdates(settings) {
  // Update UPI ID on donation page
  const upiElement = document.getElementById('upiId');
  if (upiElement && settings.upiId) {
    upiElement.textContent = settings.upiId;
  }

  // Update social media links
  if (settings.youtube) {
    const youtubeLinks = document.querySelectorAll('a[href*="youtube"]');
    youtubeLinks.forEach(link => {
      link.href = settings.youtube;
    });
  }

  // Update club name in footer and other places
  if (settings.clubName) {
    const brandTexts = document.querySelectorAll('.brand-text');
    brandTexts.forEach(el => {
      el.textContent = settings.clubName;
    });
  }

  // Update address in footer
  if (settings.address) {
    const addresses = document.querySelectorAll('.address');
    addresses.forEach(el => {
      el.textContent = settings.address;
    });
  }
}

function initNav(){
  const toggle = $('.nav-toggle');
  const list = $('#nav-menu');
  if(!toggle || !list) return;
  toggle.addEventListener('click', () => {
    const open = list.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  // close on link click (mobile)
  $$('#nav-menu a').forEach(a => a.addEventListener('click', ()=> list.classList.remove('open')));
}

function initReveal(){
  const els = $$('.reveal');
  if(!('IntersectionObserver' in window) || !els.length){ els.forEach(el=>el.classList.add('revealed')); return; }
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('revealed'); obs.unobserve(e.target); }
    });
  }, { threshold: .15 });
  els.forEach(el=>io.observe(el));
}

function initParallax(){
  const layer = $('.hero-parallax');
  if(!layer) return;
  let ticking=false;
  window.addEventListener('scroll', ()=>{
    if(ticking) return;
    window.requestAnimationFrame(()=>{
      const y = window.scrollY || 0;
      layer.style.transform = `translateY(${Math.min(y * .12, 60)}px)`;
      ticking=false;
    });
    ticking=true;
  }, { passive:true });
}

function prefersReducedMotion(){ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

function initCounters(){
  if(prefersReducedMotion()) return;
  $$('.stat-number').forEach(el=>{
    const to = parseInt(el.dataset.countto || '0', 10);
    let n=0; const step = Math.max(1, Math.ceil(to/60));
    const t = setInterval(()=>{
      n = Math.min(to, n+step);
      el.textContent = String(n);
      if(n>=to) clearInterval(t);
    }, 16);
  });
}

function pageInit(){
  const page = document.body.dataset.page;
  if(page === 'members') renderMembers();
  if(page === 'gallery') renderGallery();
  if(page === 'home') renderHomeNotices();
  if(page === 'notices') renderAllNotices();
  if(page === 'donate') initDonateForm();
  if(page === 'contact') initContactForm();
  copyUpiHandler();
}

function setYear(){ const y=$('#year'); if(y) y.textContent = String(new Date().getFullYear()); }

/* ---------- Notices (demo data inline) ---------- */
let NOTICES = [
  { id:'n1', date:'2025-08-15', title:'Independence Day cleanliness drive', detail:'Join 7 AM at community center.' },
  { id:'n2', date:'2025-07-20', title:'Ganesh Puja planning meeting', detail:'Volunteers needed for decoration, prasad & security.' },
  { id:'n3', date:'2025-02-14', title:'Saraswati Puja cultural evening', detail:'Music & recitations from 6 PM.' },
  { id:'n4', date:'2024-12-31', title:'Year-end report published', detail:'See Donate page for transparency note.' },
];

// Load admin-modified notices if available
function loadNoticesData() {
  const adminNotices = localStorage.getItem('websiteNotices');
  if (adminNotices) {
    try {
      NOTICES = JSON.parse(adminNotices);
      console.log(`[notices] Loaded ${NOTICES.length} notices from admin data`);
    } catch (error) {
      console.warn('Failed to parse admin notices data:', error);
    }
  }
}

function renderHomeNotices(){
  loadNoticesData(); // Load latest admin data
  const ul = $('#home-notices'); if(!ul) return;
  ul.innerHTML = NOTICES.slice(0,3).map(n => noticeItem(n, true)).join('');
}
function renderAllNotices(){
  loadNoticesData(); // Load latest admin data
  const ul = $('#notice-list'); if(!ul) return;
  ul.innerHTML = NOTICES.map(n => noticeItem(n, false)).join('');
  ul.addEventListener('click', (e)=>{
    const li = e.target.closest('li[data-id]'); if(!li) return;
    const id = li.dataset.id;
    const n = NOTICES.find(x=>x.id===id); if(!n) return;
    toast(`${n.title} — ${n.detail}`);
  });
}
function noticeItem(n, compact){
  const d = new Date(n.date);
  const badge = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short' });
  return `<li class="notice" data-id="${n.id}">
    <span class="date" aria-hidden="true">${badge}</span>
    <div>
      <p><strong>${n.title}</strong></p>
      ${compact ? '' : `<p class="muted">${n.detail}</p>`}
    </div>
  </li>`;
}

/* ---------- Members (JSON + Live Counter, robust path) ---------- */
async function renderMembers(){
  const grid = document.getElementById('members-grid');
  const counter = document.getElementById('member-count');

  let members = null;

  // First try to get admin-modified data from localStorage
  const adminMembers = localStorage.getItem('websiteMembers');
  if (adminMembers) {
    try {
      members = JSON.parse(adminMembers);
      console.log(`[members] Loaded ${members.length} members from admin data`);
    } catch (error) {
      console.warn('Failed to parse admin members data:', error);
    }
  }

  // If no admin data, try to load from JSON files
  if (!members) {
    // Try common locations, prefer a path that works on subfolder hosting (GitHub Pages)
    const candidates = [
      'data/members.json',          // ✅ relative to site root or subfolder
      '/data/members.json',         // absolute from domain root
      'assets/data/members.json',   // if you moved it under /assets
      '/assets/data/members.json'
    ];

    let usedUrl = '';
    for (const url of candidates){
      try{
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        members = await res.json();
        usedUrl = url;
        break; // success
      }catch(err){
        // try next candidate
        console.warn(`[members] Failed ${url}: ${err.message}`);
      }
    }
  }

  if (!members){
    console.error('Could not load members.json from any known path.');
    if (counter) counter.textContent = 'Could not load members at this time ❗';
    toast?.('Could not load members.json'); // uses your existing toast helper
    return;
  }

  // Render cards
  grid.innerHTML = members.map(m => `
    <article class="member-card" role="listitem">
      <img src="${m.photo}" alt="${m.alt || m.name}" loading="lazy" width="400" height="400">
      <div class="name">${m.name}</div>
    </article>
  `).join('');

  // Live counter (with small count‑up animation)
  if (counter){
    const total = members.length;
    let n = 0;
    const step = Math.max(1, Math.ceil(total / 40));
    const t = setInterval(() => {
      n = Math.min(total, n + step);
      counter.textContent = String(n);
      if (n >= total) clearInterval(t);
    }, 16);
    counter.classList.add('member-counter');
  }

  console.log(`[members] Rendered ${members.length} members successfully`);
}


  
/* ---------- Gallery (JSON) ---------- */
let LB = { items:[], index:0 };
async function renderGallery(){
  const sel = $('#yearSelect'); const albums = $('#albums');
  try{
    const res = await fetch('/data/gallery.json', { cache:'no-store' });
    const data = await res.json();
    const years = Object.keys(data).sort((a,b)=>b.localeCompare(a));
    sel.innerHTML = years.map(y=>`<option value="${y}">${y}</option>`).join('');

    function draw(y){
      const year = data[y];
      albums.innerHTML = `
        <h2 id="year-${y}" class="section-title">Year ${y}</h2>
        ${renderAlbum('Ganesh Puja', year.ganesh, `/assets/gallery/${y}/ganesh/`)}
        ${renderAlbum('Saraswati Puja', year.saraswati, `/assets/gallery/${y}/saraswati/`)}
      `;
      // jump to hash if present (#year-202X)
      if(location.hash && location.hash.includes(y)) document.getElementById(`year-${y}`)?.scrollIntoView({behavior:'smooth'});
    }

    sel.addEventListener('change', e=> draw(e.target.value));
    const hashYear = (location.hash.match(/year-(\d{4})/)||[])[1];
    draw(years.includes(hashYear) ? hashYear : years[0]);

  }catch(err){
    console.error(err); toast('Could not load gallery.json');
  }
}

function renderAlbum(title, items, base){
  const pics = items.map(f => ({src: base + f, caption: `${title} – ${f.replace('.jpg','')}`}));
  const cards = pics.map((p, i)=> `
    <figure class="card" data-lb-index="${LB.items.length + i}">
      <img src="${p.src}" alt="${title} photo (demo)" loading="lazy" width="600" height="400">
      <figcaption class="small muted">${p.caption}</figcaption>
    </figure>
  `).join('');
  // extend lightbox list
  LB.items.push(...pics);
  return `
    <section class="block reveal">
      <div class="section-head"><h3 class="section-title">${title}</h3></div>
      <div class="grid three">${cards}</div>
    </section>
  `;
}

/* ---------- Lightbox with keyboard & swipe ---------- */
function initLightbox(){
  const lb = $('#lightbox'); if(!lb) return;
  const img = $('.lb-img', lb);
  const cap = $('.lb-caption', lb);
  const closeBtn = $('.lb-close', lb);
  const prevBtn = $('.lb-prev', lb);
  const nextBtn = $('.lb-next', lb);

  document.body.addEventListener('click', e=>{
    const fig = e.target.closest('figure[data-lb-index]'); if(!fig) return;
    LB.index = parseInt(fig.dataset.lbIndex, 10);
    open();
  });

  function open(){
    update();
    lb.hidden = false; document.body.style.overflow='hidden';
  }
  function close(){
    lb.hidden = true; document.body.style.overflow='';
  }
  function update(){
    const item = LB.items[LB.index]; if(!item) return;
    img.src = item.src; img.alt = item.caption; cap.textContent = item.caption;
  }
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', ()=>{ LB.index = (LB.index-1+LB.items.length)%LB.items.length; update(); });
  nextBtn.addEventListener('click', ()=>{ LB.index = (LB.index+1)%LB.items.length; update(); });
  lb.addEventListener('click', e=>{ if(e.target === lb) close(); });

  // keyboard
  document.addEventListener('keydown', e=>{
    if(lb.hidden) return;
    if(e.key==='Escape') close();
    if(e.key==='ArrowLeft') prevBtn.click();
    if(e.key==='ArrowRight') nextBtn.click();
  });

  // swipe (basic)
  let startX=0;
  lb.addEventListener('touchstart', e=>{ startX = e.touches[0].clientX; }, {passive:true});
  lb.addEventListener('touchend', e=>{
    const dx = e.changedTouches[0].clientX - startX;
    if(Math.abs(dx)>40){ dx>0 ? prevBtn.click() : nextBtn.click(); }
  });
}

/* ---------- Forms ---------- */
function initDonateForm(){
  const form = $('#donateForm'); if(!form) return;
  
  // amount pill buttons
  $$('.pill', form).forEach(btn=> btn.addEventListener('click', ()=>{ 
    form.amount.value = btn.dataset.amt; 
    // Add visual feedback
    $$('.pill').forEach(p => p.style.background = '#FEF3C7');
    btn.style.background = 'var(--primary)';
    btn.style.color = '#fff';
  }));

  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate(form)) return;
    
    const formData = new FormData(form);
    const amount = formData.get('amount');
    const name = formData.get('name');
    const purpose = formData.get('purpose') || 'General';
    const message = formData.get('message') || '';
    const upiId = 'sunshineclubkendupalli@axl';
    
    // Create UPI URL
    const note = `${purpose} - ${name}${message ? ' - ' + message : ''}`;
    const upiUrl = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=${encodeURIComponent(note)}`;
    
    // Try to open UPI app
    const link = document.createElement('a');
    link.href = upiUrl;
    link.click();
    
    // Also send EmailJS if available
    if(window.emailjs){
      emailjs.sendForm('service_9neddop', 'template_lm1upie', this)
        .then(function() {
          toast('🎉 UPI app opened! Your donation details have been sent via email.');
        }, function(error) {
          toast('⚡ UPI app opened! Email notification failed, but donation can proceed.');
        });
    } else {
      toast('🎉 UPI app opened! Complete your donation in the app.');
    }
    
    // Don't reset form immediately - let user see the UPI app opened
    setTimeout(() => {
      form.reset();
      $$('.pill').forEach(p => p.style.background = '#FEF3C7');
    }, 2000);
  });
}
function initContactForm(){
  const form = $('#contactForm'); if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    if(!validate(form)) return;
    setTimeout(()=> { toast('Message sent! We will contact you soon.'); form.reset(); }, 250);
  });
}
function validate(form){
  let ok=true;
  $$('input, textarea, select', form).forEach(el=>{
    const errId = el.name + '-err';
    let msg = '';
    if(el.hasAttribute('required') && !el.value.trim()) msg='Required';
    if(el.name==='phone' && el.value && !/^\d{10}$/.test(el.value)) msg='Enter 10-digit phone';
    if(el.name==='email' && el.value && !/^\S+@\S+\.\S+$/.test(el.value)) msg='Invalid email';
    setFieldError(el, msg);
    if(msg) ok=false;
  });
  return ok;
}
function setFieldError(el, msg){
  el.classList.toggle('error', !!msg);
  let fe = document.getElementById(el.name+'-err');
  if(!fe){
    fe = document.createElement('div'); fe.id = el.name+'-err'; fe.className='form-error';
    el.insertAdjacentElement('afterend', fe);
  }
  fe.textContent = msg || '';
  fe.hidden = !msg;
}

/* ---------- Misc ---------- */
function copyUpiHandler(){
  const btn = $('#copyUpi'); const upi = $('#upiId');
  if(!btn || !upi) return;
  
  // Make UPI ID clickable to select all text
  upi.addEventListener('click', () => {
    try {
      const range = document.createRange();
      range.selectNodeContents(upi);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      toast('📋 UPI ID selected. Press Ctrl+C to copy!');
    } catch (err) {
      console.log('Text selection failed');
    }
  });
  
  btn.addEventListener('click', async ()=>{
    const upiText = upi.textContent.trim();
    let success = false;
    
    // Method 1: Try modern clipboard API (works on HTTPS)
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(upiText);
        success = true;
      } catch (err) {
        console.log('Clipboard API failed, trying fallback method');
      }
    }
    
    // Method 2: Fallback method (works on HTTP and older browsers)
    if (!success) {
      try {
        // Create a temporary textarea element
        const textArea = document.createElement('textarea');
        textArea.value = upiText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '-9999px';
        document.body.appendChild(textArea);
        
        // Select and copy the text
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        success = true;
      } catch (err) {
        console.log('Fallback copy method also failed');
      }
    }
    
    if (success) {
      // Visual feedback
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.background = '#10B981';
      btn.style.color = '#fff';
      
      toast('📋 UPI ID copied to clipboard!');
      
      // Reset button after 2 seconds
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    } else {
      // If all methods fail, select the text for manual copy
      try {
        const range = document.createRange();
        range.selectNodeContents(upi);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        toast('📋 UPI ID selected. Press Ctrl+C to copy!');
      } catch (err) {
        toast('❌ Please manually select and copy the UPI ID above.');
      }
    }
  });
}
function toast(msg){
  const t = $('#toast'); if(!t) return;
  t.textContent = msg; t.hidden=false; clearTimeout(t._to);
  t._to = setTimeout(()=> t.hidden=true, 3000);
}

// Enhanced Member Card Interactions
function initEnhancedMemberCards() {
  const memberCards = $$('.member-card');
  
  memberCards.forEach((card, index) => {
    // Add staggered animation delay
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Add hover sound effect (optional)
    card.addEventListener('mouseenter', () => {
      // Add subtle scale animation on hover
      card.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
    
    // Add click interaction for member details (if needed)
    card.addEventListener('click', () => {
      const memberName = card.querySelector('.name')?.textContent;
      if (memberName) {
        // Could expand to show member details modal
        console.log(`Clicked on member: ${memberName}`);
        // Add subtle click feedback
        card.style.transform = 'scale(0.98)';
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      }
    });
  });
}

// Enhanced Loading Animation
function showLoadingAnimation(element) {
  element.classList.add('loading');
  
  // Create shimmer effect
  const shimmer = document.createElement('div');
  shimmer.className = 'shimmer-overlay';
  shimmer.innerHTML = '<div class="shimmer-line"></div>'.repeat(3);
  element.appendChild(shimmer);
  
  return () => {
    element.classList.remove('loading');
    shimmer.remove();
  };
}

// Enhanced Scroll Animations
function initEnhancedScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = entry.target.dataset.animation || 'fadeInUp 0.6s ease-out both';
        scrollObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe elements for scroll animations
  $$('.member-card, .section-title, .hero-stats').forEach(el => {
    scrollObserver.observe(el);
  });
}

// Enhanced Page Transitions
function initPageTransitions() {
  // Add page transition effects
  document.body.style.opacity = '0';
  document.body.style.transform = 'translateY(20px)';
  
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    document.body.style.opacity = '1';
    document.body.style.transform = 'translateY(0)';
  });
}

// Initialize enhanced features when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add delay to ensure other scripts have loaded
  setTimeout(() => {
    initEnhancedMemberCards();
    initEnhancedScrollAnimations();
    initPageTransitions();
  }, 100);
});

// Add CSS for shimmer loading effect
const enhancedStyles = `
<style>
.shimmer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  z-index: 10;
  pointer-events: none;
}

.shimmer-line {
  height: 12px;
  background: linear-gradient(90deg, 
    rgba(255,255,255,0) 0%, 
    rgba(255,255,255,0.3) 50%, 
    rgba(255,255,255,0) 100%
  );
  margin: 8px;
  border-radius: 4px;
  animation: shimmerMove 1.5s infinite;
}

@keyframes shimmerMove {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.member-card.loading {
  position: relative;
  overflow: hidden;
}

/* Enhanced mobile responsiveness - optimized for 4/3/2 grid layout */
@media (max-width: 980px) {
  .member-card {
    margin: 0;
  }
  
  .member-card:hover {
    transform: translateY(-6px) scale(1.015);
  }
}

@media (max-width: 640px) {
  .member-card {
    margin: 0;
  }
  
  .member-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
  
  .hero-stats {
    gap: 1.5rem;
  }
  
  .stat {
    min-width: 100px;
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .member-card {
    margin: 0;
  }
  
  .member-card:hover {
    transform: translateY(-3px) scale(1.005);
  }
  
  .hero-stats {
    gap: 1rem;
    flex-direction: column;
    align-items: center;
  }
  
  .stat {
    min-width: 80px;
    padding: 0.5rem;
  }
}
</style>
`;

// Inject enhanced styles
document.head.insertAdjacentHTML('beforeend', enhancedStyles);