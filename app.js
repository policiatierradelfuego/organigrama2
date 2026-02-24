// ============================================================
// Organigrama Policial — Lógica Principal
// ============================================================

// Grupos que se muestran como TARJETAS (galería)
const CARD_GROUPS = ['Jefatura de Policía', 'Subjefatura de Policía'];

// Orden jerárquico deseado para las secciones
const SECTION_ORDER = [
    'Jefatura de Policía',
    'Subjefatura de Policía',
    'Dirección General de Administración',
    'Dirección General de Recursos Humanos',
    'Dirección General de Investigaciones Criminales',
    'Dirección General Regional Zona Sur',
    'Dirección General Regional Zona Norte',
    'Dirección General Regional Zona Centro',
    'Dirección Institutos Policiales'
];

let allData = [];

// ============================================================
// Inicialización
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Intentar Supabase, fallback a datos locales
    const supabaseData = await fetchFromSupabase();
    allData = supabaseData || FALLBACK_DATA;

    // Ocultar spinner
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.add('hidden');

    // Renderizar
    renderOrganigrama(allData);

    // Eventos
    setupSearch();
    setupModal();
    setupPWAInstall(); // Lógica para el botón de instalar
});

// ============================================================
// PWA Instalación
// ============================================================
let deferredPrompt;

function setupPWAInstall() {
    const installBtn = document.getElementById('installAppBtn');
    if (!installBtn) return;

    // Escuchar el evento de que la PWA es instalable
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevenir que Chrome 67 y anteriores muestren el prompt automáticamente
        e.preventDefault();
        // Guardar el evento para dispararlo luego
        deferredPrompt = e;
        // Mostrar el botón de instalación
        installBtn.classList.remove('hidden');
    });

    // Manejar el clic en el botón de instalar
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Mostrar el prompt nativo
        deferredPrompt.prompt();

        // Esperar a ver qué responde el usuario
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // El prompt ya no se puede usar, lo limpiamos
        deferredPrompt = null;
        // Ocultar el botón
        installBtn.classList.add('hidden');
    });

    // Detectar si la app ya fue instalada
    window.addEventListener('appinstalled', () => {
        console.log('PWA ya ha sido instalada');
        // Ocultar el botón si está visible
        installBtn.classList.add('hidden');
        // Limpiar el prompt
        deferredPrompt = null;
    });
}

// ============================================================
// Renderizar organigrama completo
// ============================================================
function renderOrganigrama(data) {
    const main = document.getElementById('mainContent');

    // Limpiar contenido previo (excepto spinner)
    const existingSections = main.querySelectorAll('.org-section, .no-results');
    existingSections.forEach(el => el.remove());

    // Agrupar por "guia"
    const groups = groupBy(data, 'guia');

    // Si no hay datos
    if (Object.keys(groups).length === 0) {
        main.innerHTML += `
      <div class="no-results">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <p>No se encontraron resultados</p>
      </div>`;
        return;
    }

    // Ordenar secciones
    const orderedKeys = sortSections(Object.keys(groups));

    // Crear cada sección
    orderedKeys.forEach(guia => {
        const items = groups[guia];
        const isCardGroup = CARD_GROUPS.includes(guia);
        const section = createSection(guia, items, isCardGroup);
        main.appendChild(section);
    });
}

// ============================================================
// Crear sección (Card grid o Lista)
// ============================================================
function createSection(title, items, isCardView) {
    const section = document.createElement('section');
    section.className = 'org-section';
    section.dataset.sectionTitle = title;

    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
    <div class="section-toggle" id="toggle-${slugify(title)}">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>
    <h2 class="section-title">${escapeHtml(title)}</h2>
  `;

    // Body
    const body = document.createElement('div');
    body.className = 'section-body';
    body.id = `body-${slugify(title)}`;

    if (isCardView) {
        const grid = document.createElement('div');
        grid.className = 'cards-grid';
        items.forEach(item => {
            grid.appendChild(createCard(item));
        });
        body.appendChild(grid);
    } else {
        const list = document.createElement('ul');
        list.className = 'org-list';
        items.forEach(item => {
            list.appendChild(createListItem(item));
        });
        body.appendChild(list);
    }

    // Toggle logic
    header.addEventListener('click', () => {
        const toggle = header.querySelector('.section-toggle');
        const isCollapsed = body.classList.contains('collapsed');
        if (isCollapsed) {
            body.style.maxHeight = body.scrollHeight + 'px';
            body.classList.remove('collapsed');
            toggle.classList.remove('collapsed');
        } else {
            body.style.maxHeight = body.scrollHeight + 'px';
            requestAnimationFrame(() => {
                body.classList.add('collapsed');
                toggle.classList.add('collapsed');
            });
        }
    });

    // Iniciar colapsado por defecto
    body.classList.add('collapsed');
    const toggleIcon = header.querySelector('.section-toggle');
    toggleIcon.classList.add('collapsed');
    body.style.maxHeight = '0px';

    section.appendChild(header);
    section.appendChild(body);

    return section;
}

// ============================================================
// Crear tarjeta (Card)
// ============================================================
function createCard(item) {
    const card = document.createElement('div');
    card.className = 'org-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
    <div class="card-title">${escapeHtml(item.dependencia)}</div>
    <div class="card-rank">${escapeHtml(item.jerarquia || '')}</div>
    <div class="card-name">${escapeHtml(item.responsable || '')}</div>
    ${item.telefono ? `<div class="card-phone">${escapeHtml(item.telefono)}</div>` : ''}
    ${item.email ? `<div class="card-email">${escapeHtml(item.email)}</div>` : ''}
  `;

    card.addEventListener('click', () => openModal(item));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(item);
        }
    });

    return card;
}

// ============================================================
// Crear ítem de lista
// ============================================================
function createListItem(item) {
    const li = document.createElement('li');
    li.className = 'org-list-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');

    li.innerHTML = `
    <span class="org-list-item-text">${escapeHtml(item.dependencia)}</span>
    <svg class="org-list-item-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  `;

    li.addEventListener('click', () => openModal(item));
    li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(item);
        }
    });

    return li;
}

// ============================================================
// Modal
// ============================================================
function setupModal() {
    const overlay = document.getElementById('modalOverlay');
    const closeBtn = document.getElementById('modalClose');

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }

    if (overlay) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

function openModal(item) {
    const overlay = document.getElementById('modalOverlay');

    document.getElementById('modalTitle').textContent = item.dependencia || '';
    document.getElementById('modalBadge').textContent = item.guia || '';

    // Responsable
    setField('fieldResponsable', 'modalResponsable', item.responsable);

    // Dirección
    setField('fieldDireccion', 'modalDireccion', item.direccion);

    // Email
    const emailField = document.getElementById('fieldEmail');
    const emailEl = document.getElementById('modalEmail');
    if (item.email && item.email.trim()) {
        emailField.classList.remove('hidden');
        emailEl.textContent = item.email;
        emailEl.href = `mailto:${item.email}`;
    } else {
        emailField.classList.add('hidden');
    }

    // Teléfono
    const telField = document.getElementById('fieldTelefono');
    const telEl = document.getElementById('modalTelefono');
    if (item.telefono && item.telefono.trim()) {
        telField.classList.remove('hidden');
        const telNumber = item.telefono.replace(/[^\d+]/g, ''); // Limpiar para el link
        telEl.textContent = item.telefono;
        telEl.href = `tel:${telNumber}`;
    } else {
        telField.classList.add('hidden');
    }

    // WhatsApp
    const waField = document.getElementById('fieldWhatsapp');
    const waEl = document.getElementById('modalWhatsapp');
    if (item.whatsapp && item.whatsapp.trim()) {
        waField.classList.remove('hidden');
        const waNumber = item.whatsapp.replace(/\D/g, '');
        waEl.textContent = item.whatsapp;
        waEl.href = `https://wa.me/54${waNumber}`;
    } else {
        waField.classList.add('hidden');
    }

    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function setField(fieldId, valueId, value) {
    const field = document.getElementById(fieldId);
    const valueEl = document.getElementById(valueId);
    if (value && value.trim()) {
        field.classList.remove('hidden');
        valueEl.textContent = value;
    } else {
        field.classList.add('hidden');
    }
}

// ============================================================
// Búsqueda
// ============================================================
function setupSearch() {
    const input = document.getElementById('searchInput');
    let debounceTimer;

    input.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = input.value.trim().toLowerCase();
            if (!query) {
                renderOrganigrama(allData);
                return;
            }

            const filtered = allData.filter(item =>
                (item.dependencia || '').toLowerCase().includes(query) ||
                (item.responsable || '').toLowerCase().includes(query) ||
                (item.direccion || '').toLowerCase().includes(query) ||
                (item.jerarquia || '').toLowerCase().includes(query) ||
                (item.guia || '').toLowerCase().includes(query)
            );

            renderOrganigrama(filtered);
        }, 200);
    });
}

// ============================================================
// Helpers
// ============================================================
function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
        const group = (item[key] || '').trim();
        if (!acc[group]) acc[group] = [];
        acc[group].push(item);
        return acc;
    }, {});
}

function sortSections(keys) {
    return keys.sort((a, b) => {
        const idxA = SECTION_ORDER.indexOf(a);
        const idxB = SECTION_ORDER.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });
}

function slugify(str) {
    return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
