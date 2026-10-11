/**
 * DENTAL PROSTHETICS PUBLIC PORTFOLIO APP LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // App State
  let categories = [];
  let works = [];
  let currentCategoryId = 'all';
  let searchQuery = '';
  let activeWork = null;
  let activeImageIndex = 0;

  // DOM Elements
  const portfolioGrid = document.getElementById('portfolioGrid');
  const emptyState = document.getElementById('emptyState');
  const categoryFilters = document.getElementById('categoryFilters');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');

  // Hero Card Elements
  const heroCardImg = document.getElementById('heroCardImg');
  const heroCardCategory = document.getElementById('heroCardCategory');
  const heroCardTitle = document.getElementById('heroCardTitle');
  const heroCardDesc = document.getElementById('heroCardDesc');

  // Modal / Lightbox Elements
  const workModal = document.getElementById('workModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const lightboxMainImg = document.getElementById('lightboxMainImg');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxThumbnails = document.getElementById('lightboxThumbnails');
  const modalCategory = document.getElementById('modalCategory');
  const modalMaterial = document.getElementById('modalMaterial');
  const modalTitle = document.getElementById('modalTitle');
  const modalDescription = document.getElementById('modalDescription');
  const modalSpecMaterial = document.getElementById('modalSpecMaterial');
  const modalSpecCategory = document.getElementById('modalSpecCategory');
  const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');

  // Mobile Nav Elements
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileNav = document.getElementById('closeMobileNav');
  const mobileNav = document.getElementById('mobileNav');

  // Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --------------------------------------------------------------------------
  // Mobile Nav Handlers
  // --------------------------------------------------------------------------
  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', () => mobileNav.classList.add('active'));
  }
  if (closeMobileNav && mobileNav) {
    closeMobileNav.addEventListener('click', () => mobileNav.classList.remove('active'));
  }
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('active'));
  });

  // Settings State
  let appSettings = {
    instagram_url: "https://instagram.com/Cruz3Desing",
    whatsapp_number: "(43) 99677-3154",
    whatsapp_raw: "5543996773154",
    contact_email: "cruz3desing@outlook.com"
  };

  // --------------------------------------------------------------------------
  // Fetch Data from API
  // --------------------------------------------------------------------------
  async function init() {
    await fetchSettings();
    await fetchCategories();
    await fetchWorks();
  }

  async function fetchSettings() {
    try {
      const res = {ok: true, json: async () => window.PORTFOLIO_DATA.settings};
      if (res.ok) {
        appSettings = await res.json();
        applyPublicSettings();
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    }
  }

  function applyPublicSettings() {
    const rawWa = appSettings.whatsapp_raw || '5543996773154';
    const waNum = appSettings.whatsapp_number || '(43) 99677-3154';
    const insta = appSettings.instagram_url || 'https://instagram.com/Cruz3Desing';
    const email = appSettings.contact_email || 'cruz3desing@outlook.com';

    // WhatsApp Links
    document.querySelectorAll('.js-whatsapp-link').forEach(link => {
      const msg = link.dataset.msg ? encodeURIComponent(link.dataset.msg) : encodeURIComponent('Olá Cruz3Design! Gostaria de um orçamento para prótese dentária digital.');
      link.href = `https://wa.me/${rawWa}?text=${msg}`;
      link.target = '_blank';
    });

    // WhatsApp Number Text
    document.querySelectorAll('.js-whatsapp-num').forEach(el => {
      el.textContent = waNum;
    });

    // Instagram Links
    document.querySelectorAll('.js-instagram-link').forEach(link => {
      link.href = insta;
      link.target = '_blank';
    });

    // Email Links & Text
    document.querySelectorAll('.js-email-link').forEach(link => {
      link.href = `mailto:${email}`;
      link.target = '_blank';
    });
    document.querySelectorAll('.js-email-text').forEach(el => {
      el.textContent = email;
    });
  }

  async function fetchCategories() {
    try {
      const res = {ok: true, json: async () => window.PORTFOLIO_DATA.categories};
      if (!res.ok) throw new Error('Falha ao carregar categorias');
      categories = await res.json();
      renderCategoryFilters();
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }

  async function fetchWorks() {
    try {
      showLoading();
      
      const query = searchQuery.toLocaleLowerCase('pt-BR');
      works = window.PORTFOLIO_DATA.works.filter(work =>
        (currentCategoryId === 'all' || String(work.category_id) === String(currentCategoryId)) &&
        (!query || [work.title, work.description, work.material].some(value =>
          String(value || '').toLocaleLowerCase('pt-BR').includes(query)))
      );

      renderWorks();
      renderHeroHighlight();
    } catch (err) {
      console.error('Erro ao carregar trabalhos:', err);
      if (portfolioGrid) {
        portfolioGrid.innerHTML = `
          <div class="empty-state">
            <i data-lucide="alert-circle"></i>
            <h3>Erro ao carregar trabalhos</h3>
            <p>Por favor, tente recarregar a página.</p>
          </div>
        `;
        if (window.lucide) lucide.createIcons();
      }
    }
  }

  function showLoading() {
    if (portfolioGrid) {
      portfolioGrid.innerHTML = `
        <div class="loading-spinner-wrap">
          <div class="spinner"></div>
          <p>Carregando trabalhos do portfólio...</p>
        </div>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // Render Category Filters
  // --------------------------------------------------------------------------
  function renderCategoryFilters() {
    if (!categoryFilters) return;

    let html = `
      <button class="filter-btn ${currentCategoryId === 'all' ? 'active' : ''}" data-cat="all">
        Todos os Trabalhos
      </button>
    `;

    categories.forEach(cat => {
      if (cat.work_count > 0 || true) { // Always show available categories
        html += `
          <button class="filter-btn ${currentCategoryId == cat.id ? 'active' : ''}" data-cat="${cat.id}">
            ${escapeHtml(cat.name)}
          </button>
        `;
      }
    });

    categoryFilters.innerHTML = html;

    // Filter click events
    categoryFilters.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        currentCategoryId = e.currentTarget.dataset.cat;
        fetchWorks();
      });
    });
  }

  // --------------------------------------------------------------------------
  // Render Hero Featured Card
  // --------------------------------------------------------------------------
  function renderHeroHighlight() {
    if (!works || works.length === 0) return;
    
    // Find featured work or take the first one
    const featured = works.find(w => w.featured === 1) || works[0];
    if (featured) {
      if (heroCardImg) heroCardImg.src = featured.cover_image;
      if (heroCardCategory) heroCardCategory.textContent = featured.category_name || 'Prótese Odontológica';
      if (heroCardTitle) heroCardTitle.textContent = featured.title;
      if (heroCardDesc) heroCardDesc.textContent = featured.description || 'Trabalho protético em destaque.';

      // Clicking hero card opens modal
      const heroCard = document.getElementById('heroFeaturedCard');
      if (heroCard) {
        heroCard.onclick = () => openWorkModal(featured);
      }
    }
  }

  // --------------------------------------------------------------------------
  // Render Works Grid
  // --------------------------------------------------------------------------
  function renderWorks() {
    if (!portfolioGrid) return;

    if (works.length === 0) {
      portfolioGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    portfolioGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    portfolioGrid.innerHTML = works.map(work => `
      <div class="work-card" data-id="${work.id}">
        <div class="work-card-img-wrap">
          <img src="${escapeHtml(work.cover_image)}" alt="${escapeHtml(work.title)}" loading="lazy">
          <div class="work-card-badges">
            <span class="badge badge-cat">${escapeHtml(work.category_name || 'Prótese')}</span>
            ${work.featured === 1 ? '<span class="badge badge-featured"><i data-lucide="star"></i> Destaque</span>' : ''}
          </div>
        </div>
        <div class="work-card-body">
          <h3 class="work-card-title">${escapeHtml(work.title)}</h3>
          <p class="work-card-desc">${escapeHtml(work.description || '')}</p>
          
          <div class="work-card-footer">
            <div class="work-material-pill">
              <i data-lucide="shield"></i>
              <span>${escapeHtml(work.material || 'Cerâmica Pura')}</span>
            </div>
            <span class="work-expand-link">
              <span>Ver Detalhes</span>
              <i data-lucide="chevron-right"></i>
            </span>
          </div>
        </div>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();

    // Attach click events
    portfolioGrid.querySelectorAll('.work-card').forEach(card => {
      card.addEventListener('click', () => {
        const workId = parseInt(card.dataset.id, 10);
        const work = works.find(w => w.id === workId);
        if (work) openWorkModal(work);
      });
    });
  }

  // --------------------------------------------------------------------------
  // Search Input Handler
  // --------------------------------------------------------------------------
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = searchQuery ? 'flex' : 'none';
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        fetchWorks();
      }, 300);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.style.display = 'none';
      fetchWorks();
    });
  }

  // --------------------------------------------------------------------------
  // Work Detail Modal & Lightbox Logic
  // --------------------------------------------------------------------------
  function openWorkModal(work) {
    activeWork = work;
    activeImageIndex = 0;

    // Populate metadata
    if (modalCategory) modalCategory.textContent = work.category_name || 'Prótese Odontológica';
    if (modalMaterial) modalMaterial.textContent = work.material || 'Cerâmica';
    if (modalTitle) modalTitle.textContent = work.title;
    if (modalDescription) modalDescription.textContent = work.description || 'Nenhuma descrição técnica informada.';
    if (modalSpecMaterial) modalSpecMaterial.textContent = work.material || 'Não especificado';
    if (modalSpecCategory) modalSpecCategory.textContent = work.category_name || 'Geral';

    // WhatsApp Button
    if (modalWhatsappBtn) {
      const rawWa = appSettings.whatsapp_raw || '5543996773154';
      const msg = encodeURIComponent(`Olá Cruz3Design! Gostaria de consultar informações sobre o trabalho "${work.title}".`);
      modalWhatsappBtn.href = `https://wa.me/${rawWa}?text=${msg}`;
    }

    renderLightboxStage();

    // Display modal
    if (workModal) {
      workModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  const lightboxFullResLink = document.getElementById('lightboxFullResLink');

  function renderLightboxStage() {
    if (!activeWork || !activeWork.images || activeWork.images.length === 0) {
      const fallbackUrl = activeWork ? activeWork.cover_image : '';
      if (lightboxMainImg) lightboxMainImg.src = fallbackUrl;
      if (lightboxFullResLink) lightboxFullResLink.href = fallbackUrl;
      if (lightboxCounter) lightboxCounter.textContent = '1 / 1';
      if (lightboxThumbnails) lightboxThumbnails.innerHTML = '';
      if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'none';
      if (lightboxNextBtn) lightboxNextBtn.style.display = 'none';
      return;
    }

    const images = activeWork.images;
    if (activeImageIndex < 0) activeImageIndex = images.length - 1;
    if (activeImageIndex >= images.length) activeImageIndex = 0;

    const currentImg = images[activeImageIndex];
    if (lightboxMainImg) lightboxMainImg.src = currentImg.image_url;
    if (lightboxFullResLink) lightboxFullResLink.href = currentImg.image_url;
    if (lightboxCounter) lightboxCounter.textContent = `${activeImageIndex + 1} / ${images.length}`;

    // Nav buttons visibility
    if (images.length > 1) {
      if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'flex';
      if (lightboxNextBtn) lightboxNextBtn.style.display = 'flex';
    } else {
      if (lightboxPrevBtn) lightboxPrevBtn.style.display = 'none';
      if (lightboxNextBtn) lightboxNextBtn.style.display = 'none';
    }

    // Thumbnails
    if (lightboxThumbnails) {
      lightboxThumbnails.innerHTML = images.map((img, idx) => `
        <div class="thumb-item ${idx === activeImageIndex ? 'active' : ''}" data-idx="${idx}">
          <img src="${escapeHtml(img.image_url)}" alt="Miniatura ${idx + 1}">
        </div>
      `).join('');

      lightboxThumbnails.querySelectorAll('.thumb-item').forEach(thumb => {
        thumb.addEventListener('click', (e) => {
          activeImageIndex = parseInt(e.currentTarget.dataset.idx, 10);
          renderLightboxStage();
        });
      });
    }
  }

  function closeWorkModal() {
    if (workModal) {
      workModal.classList.remove('active');
      document.body.style.overflow = '';
    }
    activeWork = null;
  }

  // Modal Event Listeners
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeWorkModal);

  if (workModal) {
    workModal.addEventListener('click', (e) => {
      if (e.target === workModal) closeWorkModal();
    });
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      activeImageIndex--;
      renderLightboxStage();
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      activeImageIndex++;
      renderLightboxStage();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!workModal || !workModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeWorkModal();
    if (e.key === 'ArrowLeft') {
      activeImageIndex--;
      renderLightboxStage();
    }
    if (e.key === 'ArrowRight') {
      activeImageIndex++;
      renderLightboxStage();
    }
  });

  // Utility HTML Escape
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function loadPublicReviews() {
    const grid = document.getElementById('publicReviewsGrid');
    if (!grid) return;
    grid.innerHTML = window.PORTFOLIO_DATA.reviews.map(review => `
      <article class="review-card">
        <h3>${escapeHtml(review.client_name)}</h3>
        <p aria-label="${Number(review.rating)} de 5 estrelas">${'★'.repeat(Math.max(0, Math.min(5, Number(review.rating))))}</p>
        <p>${escapeHtml(review.comment || '')}</p>
      </article>`).join('');
  }

  // Start Application
  init();
  loadPublicReviews();
});
