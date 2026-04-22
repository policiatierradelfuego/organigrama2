// ============================================================
// Comisarías - Lógica para renderizar desde la BD (Supabase/Excel)
// ============================================================

const ZONAS_MAP = {
    'norte': 'Dirección General Regional Zona Norte',
    'centro': 'Dirección General Regional Zona Centro',
    'sur': 'Dirección General Regional Zona Sur'
};

// Diccionario opcional para agregar imágenes y mapas por nombre de dependencia.
// Si luego se agregan estas columnas al Excel, se pueden leer directamente de 'item.imagen' e 'item.mapa'.
const EXTRAS_COMISARIAS = {
    "Comisaría Quinta Río Grande": {
        img: "https://via.placeholder.com/600x400/dddddd/666666?text=Fachada+Comisaria+Quinta",
        map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2348.651737754877!2d-67.73977502324707!3d-53.76673897241857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbc4b163e79435b87%3A0xb2b404d0ab02a1b5!2sComisaria%20Quinta!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar" width="100%" height="150" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    },
    "Comisaría de Género y Familia Río Grande": {
        img: "https://via.placeholder.com/600x400/dddddd/666666?text=Fachada+Genero+y+Familia",
        map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2348.651737754877!2d-67.73977502324707!3d-53.76673897241857!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbc4b163e79435b87%3A0xb2b404d0ab02a1b5!2sComisaria%20Quinta!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar" width="100%" height="150" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    },
    "Comisaría Tolhuin": {
        img: "https://via.placeholder.com/600x400/dddddd/666666?text=Fachada+Tolhuin",
        map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4677.346896567364!2d-67.1994626248386!3d-54.512684812601716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbc4c3db3bd000001%3A0xc6222b467657d423!2sComisaria%20Policial%20Tolhuin!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar" width="100%" height="150" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    },
    "Comisaría Primera Ushuaia": {
        img: "https://via.placeholder.com/600x400/dddddd/666666?text=Fachada+Ushuaia",
        map: `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4547.01633519391!2d-68.3039871!3d-54.8080894!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xbc4c22b51268cd15%3A0xc3b83b3e2b2512a2!2sComisaria%20Primera%20Ushuaia!5e0!3m2!1ses-419!2sar!4v1700000000000!5m2!1ses-419!2sar" width="100%" height="150" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Identificar la zona actual desde el atributo data-zona en el body
    const zonaActual = document.body.dataset.zona;
    if (!zonaActual || !ZONAS_MAP[zonaActual]) return;

    // 2. Mostrar spinner si existe
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.classList.remove('hidden');

    // 3. Obtener datos (Intenta Supabase, sino usa FALLBACK_DATA de data.js)
    let allData = [];
    if (typeof fetchFromSupabase === 'function') {
        allData = await fetchFromSupabase() || FALLBACK_DATA;
    } else {
        allData = FALLBACK_DATA;
    }

    // 4. Filtrar datos para la zona actual
    const targetGuia = ZONAS_MAP[zonaActual];
    // Solo mostramos las que sean "Comisaría" para limpiar un poco (opcional)
    const comisariasZona = allData.filter(item => 
        item.guia === targetGuia && 
        item.dependencia.toLowerCase().includes('comisar')
    );

    // 5. Renderizar
    const grid = document.getElementById('comisariasGrid');
    if (grid) {
        grid.innerHTML = ''; // Limpiar
        
        if (comisariasZona.length === 0) {
            grid.innerHTML = `<p style="text-align:center; width:100%; color:#666;">No se encontraron comisarías para esta zona.</p>`;
        } else {
            comisariasZona.forEach(comisaria => {
                const extras = EXTRAS_COMISARIAS[comisaria.dependencia] || {
                    img: `https://via.placeholder.com/600x400/dddddd/666666?text=${encodeURIComponent(comisaria.dependencia)}`,
                    map: `<div style="height:150px; background:#e0e0e0; display:flex; align-items:center; justify-content:center; color:#666; font-size:0.9rem;">Mapa no disponible</div>`
                };

                const cardHtml = `
                    <article class="comisaria-card">
                        <div class="comisaria-img-wrapper">
                            <img src="${comisaria.imagen || extras.img}" alt="${comisaria.dependencia}">
                        </div>
                        <div class="comisaria-info">
                            <h2 class="comisaria-title">${comisaria.dependencia}</h2>
                            <ul class="comisaria-contact-list">
                                ${comisaria.direccion ? `
                                <li>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span>${comisaria.direccion}</span>
                                </li>` : ''}
                                ${comisaria.telefono ? `
                                <li>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    <span>${comisaria.telefono}</span>
                                </li>` : ''}
                                ${comisaria.whatsapp ? `
                                <li>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                                    <span>${comisaria.whatsapp}</span>
                                </li>` : ''}
                            </ul>
                            <div class="comisaria-map">
                                ${comisaria.mapa || extras.map}
                            </div>
                        </div>
                    </article>
                `;
                grid.innerHTML += cardHtml;
            });
        }
    }

    if (spinner) spinner.classList.add('hidden');
});
