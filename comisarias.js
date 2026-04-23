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
            // DEBUG: Ver qué columnas trae la primera comisaría (quitar después)
            console.log("Datos de la primera comisaría detectada:", comisariasZona[0]);
            
            comisariasZona.forEach(comisaria => {
                // 1. Limpieza de Título y Ciudad
                let title = comisaria.dependencia;
                let city = "";
                
                if (title.toLowerCase().includes("río grande")) {
                    title = title.replace(/Río Grande/gi, "").trim();
                    city = "Río Grande";
                } else if (title.toLowerCase().includes("ushuaia")) {
                    title = title.replace(/Ushuaia/gi, "").trim();
                    city = "Ushuaia";
                } else if (title.toLowerCase().includes("tolhuin")) {
                    title = title.replace(/Tolhuin/gi, "").trim();
                    city = "Tolhuin";
                }

                // 2. Detección de URLs de Imagen y Mapa
                const imgUrl = comisaria.imagen || comisaria.Imagen || comisaria.IMAGEN || comisaria.image || comisaria.img || null;
                const rawMapa = comisaria.mapa || comisaria.Mapa || comisaria.MAPA || comisaria.map || null;

                const extras = EXTRAS_COMISARIAS[comisaria.dependencia] || {
                    img: `https://via.placeholder.com/600x400/003354/ffffff?text=${encodeURIComponent(title)}`,
                    map: "#"
                };

                // Extraer link del mapa si es un iframe o generar búsqueda por defecto
                let mapLink = "#";
                const mapContent = rawMapa || extras.map;
                
                if (mapContent && mapContent.includes('<iframe')) {
                    const match = mapContent.match(/src="([^"]+)"/);
                    mapLink = match ? match[1] : "#";
                } else if (mapContent && mapContent !== "#") {
                    mapLink = mapContent;
                } else {
                    // Si no hay mapa en la BD, crear un link de búsqueda dinámico en Google Maps
                    const query = `${comisaria.dependencia} ${city} Tierra del Fuego`;
                    mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
                }

                // 3. Renderizado de la tarjeta
                const cardHtml = `
                    <article class="comisaria-card">
                        <div class="comisaria-img-wrapper">
                            <img src="${imgUrl || extras.img}" alt="${comisaria.dependencia}" loading="lazy">
                        </div>
                        <div class="comisaria-info">
                            <h2 class="comisaria-title">
                                ${title}
                                <span class="city-suffix">${city}</span>
                            </h2>
                            
                            <ul class="comisaria-contact-list">
                                ${comisaria.direccion ? `<li>${comisaria.direccion}</li>` : ''}
                                ${comisaria.telefono ? `<li>${comisaria.telefono}</li>` : ''}
                                ${comisaria.whatsapp ? `<li>+54 9 ${comisaria.whatsapp}</li>` : ''}
                            </ul>

                            <div class="comisaria-actions">
                                <a href="${mapLink}" target="_blank" class="action-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    Ir
                                </a>
                                <a href="https://wa.me/549${comisaria.whatsapp?.replace(/\D/g, '')}" target="_blank" class="action-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    WA
                                </a>
                                <a href="tel:${comisaria.telefono?.replace(/\D/g, '')}" class="action-btn">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                    Tel
                                </a>
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
