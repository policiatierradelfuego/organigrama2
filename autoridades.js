/**
 * Lógica para la vista de tabla 'autoridades.html'
 */

let allData = [];
const tableBody = document.getElementById('tableBody');
const tableSearch = document.getElementById('tableSearch');
const resultsCount = document.getElementById('resultsCount');
const loadingOverlay = document.getElementById('loadingOverlay');

async function init() {
    showLoading(true);

    // 1. Obtener datos (Supabase o Local)
    allData = await fetchFromSupabase();

    if (!allData || allData.length === 0) {
        console.warn('Usando datos de respaldo local...');
        allData = (typeof FALLBACK_DATA !== 'undefined') ? FALLBACK_DATA : [];
    }

    renderTable(allData);
    showLoading(false);

    // 2. Navegación por arrastre (Drag to scroll) en 4 DIRECCIONES
    const slider = document.querySelector('.table-wrapper');
    let isDown = false;
    let startX, startY;
    let scrollLeft, scrollTop;

    slider.addEventListener('mousedown', (e) => {
        isDown = true;
        slider.classList.add('active-dragging');
        // Posición inicial del mouse
        startX = e.pageX - slider.offsetLeft;
        startY = e.pageY - slider.offsetTop;
        // Posición inicial del scroll
        scrollLeft = slider.scrollLeft;
        scrollTop = window.scrollY; // Para scroll vertical de la página
    });

    slider.addEventListener('mouseleave', () => {
        isDown = false;
        slider.classList.remove('active-dragging');
    });

    slider.addEventListener('mouseup', () => {
        isDown = false;
        slider.classList.remove('active-dragging');
    });

    slider.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();

        // Eje X (Horizontal en el contenedor)
        const x = e.pageX - slider.offsetLeft;
        const walkX = (x - startX) * 2;
        slider.scrollLeft = scrollLeft - walkX;

        // Eje Y (Vertical - movemos el scroll de la ventana)
        const y = e.pageY - slider.offsetTop;
        const walkY = (y - startY) * 1.5;
        window.scrollTo(0, scrollTop - walkY);
    });

    // 3. Event listener para búsqueda
    tableSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = allData.filter(item => {
            return (
                (item.dependencia || '').toLowerCase().includes(term) ||
                (item.responsable || '').toLowerCase().includes(term) ||
                (item.guia || '').toLowerCase().includes(term) ||
                (item.jerarquia || '').toLowerCase().includes(term) ||
                (item.direccion || '').toLowerCase().includes(term) ||
                (item.email || '').toLowerCase().includes(term)
            );
        });
        renderTable(filtered);
    });
}

function renderTable(data) {
    tableBody.innerHTML = '';

    if (data.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No se encontraron resultados</td></tr>';
        resultsCount.textContent = '0 resultados';
        return;
    }

    resultsCount.textContent = `${data.length} resultados`;

    data.forEach(item => {
        const tr = document.createElement('tr');

        // Determinar color de badge por Guía
        const badgeClass = getBadgeColorClass(item.guia);

        tr.innerHTML = `
            <td class="col-guia"><span class="table-badge ${badgeClass}">${escapeHtml(item.guia)}</span></td>
            <td class="col-dep"><strong>${escapeHtml(item.dependencia)}</strong></td>
            <td class="col-rank">${escapeHtml(item.jerarquia || '-')}</td>
            <td class="col-resp">${escapeHtml(item.responsable || '-')}</td>
            <td class="col-dir">${escapeHtml(item.direccion || '-')}</td>
            <td class="col-mail"><a href="mailto:${item.email}" class="table-link">${escapeHtml(item.email || '-')}</a></td>
        `;
        tableBody.appendChild(tr);
    });
}

function getBadgeColorClass(guia) {
    const g = (guia || '').toLowerCase();
    if (g.includes('jefatura')) return 'badge-purple';
    if (g.includes('subjefatura')) return 'badge-yellow';
    if (g.includes('zona norte')) return 'badge-blue';
    if (g.includes('zona sur')) return 'badge-red';
    if (g.includes('zona centro')) return 'badge-green';
    return 'badge-gray';
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
        '&': '&am p;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Iniciar
document.addEventListener('DOMContentLoaded', () => {
    init();

});


