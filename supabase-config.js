// ============================================================
// Configuración de Supabase
// ============================================================
// Reemplazá estos valores con los de tu proyecto en Supabase:
//   https://supabase.com/dashboard → Settings → API
// ============================================================

const SUPABASE_URL = 'https://ahhixnkbpmvaxmwcydke.supabase.co';
// ATENCIÓN: Esta es una clave 'service_role' (maestra). 
// Por favor, cámbiala urgente por tu clave 'anon / public'.
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaGl4bmticG12YXhtd2N5ZGtlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTkxNjg2MCwiZXhwIjoyMDg3NDkyODYwfQ.yhOlZ0SKUfY_Art5K2wvP8qs4sxOcDXlS3icmo3RS40';

// Nombre de la tabla en Supabase
const TABLE_NAME = 'dependencias';

/**
 * Fetch todos los registros de la tabla `dependencias` en Supabase.
 * Retorna un array de objetos o null si falla.
 */
async function fetchFromSupabase() {
    try {
        const url = `${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=*&order=id.asc`;
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('Supabase respondió con error:', response.status);
            return null;
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('No se pudo conectar a Supabase, usando datos locales:', error.message);
        return null;
    }
}

/*
-- SQL para crear la tabla en Supabase:
-- Ir a SQL Editor en tu dashboard de Supabase y ejecutar:

CREATE TABLE IF NOT EXISTS dependencias (
  id SERIAL PRIMARY KEY,
  guia TEXT NOT NULL,
  dependencia TEXT NOT NULL,
  jerarquia TEXT,
  responsable TEXT,
  direccion TEXT,
  email TEXT,
  telefono TEXT,
  whatsapp TEXT,
  imagen TEXT,
  mapa TEXT
);

-- Habilitar acceso público de lectura (Row Level Security):
ALTER TABLE dependencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública"
  ON dependencias
  FOR SELECT
  USING (true);
*/


// ============================================================
// CÓDIGO PARA GOOGLE APPS SCRIPT (COPIAR DESDE AQUÍ)
// ============================================================
/*
  INSTRUCCIONES FINALES:
  1. En Google Sheets: Extensiones -> Apps Script.
  2. Pegá el código de abajo (aseguráte de NO incluir estas instrucciones).
  3. Guardá y recargá tu Google Sheet. 
  4. Verás un nuevo menú llamado "🚀 Supabase" al lado de "Ayuda".
*/

// --- INICIO DEL SCRIPT PARA GOOGLE ---
/*
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 Supabase')
    .addItem('Sincronizar fila activa', 'syncToSupabase')
    .addToUi();
}

function syncToSupabase() {
  // Configuración (REEMPLAZAR CON TUS DATOS)
  const SB_URL = 'https://ahhixnkbpmvaxmwcydke.supabase.co';
  const SB_KEY = 'TU_SERVICE_ROLE_KEY_AQUÍ'; // Usá la clave que empieza con 'eyJ...'
  
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  
  if (row < 2) {
    SpreadsheetApp.getUi().alert('Seleccioná una fila con datos (no el encabezado).');
    return;
  }

  const rowData = sheet.getRange(row, 1, 1, 10).getValues()[0];
  
  const payload = {
    guia: rowData[0],
    dependencia: rowData[1],
    jerarquia: rowData[2],
    responsable: rowData[3],
    direccion: rowData[4],
    email: rowData[5],
    telefono: String(rowData[6]),
    whatsapp: String(rowData[7]),
    imagen: rowData[8],
    mapa: rowData[9]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey': SB_KEY,
      'Authorization': 'Bearer ' + SB_KEY,
      'Prefer': 'resolution=merge-duplicates'
    },
    payload: JSON.stringify(payload)
  };

  try {
    UrlFetchApp.fetch(SB_URL + '/rest/v1/dependencias', options);
    sheet.getRange(row, 11).setValue('Sincronizado ✅'); // Marca en columna K
    SpreadsheetApp.getActiveSpreadsheet().toast('Fila ' + row + ' sincronizada con éxito.');
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
  }
}
*/
// --- FIN DEL SCRIPT PARA GOOGLE ---

