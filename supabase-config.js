// ============================================================
// Configuración de Supabase
// ============================================================
// Reemplazá estos valores con los de tu proyecto en Supabase:
//   https://supabase.com/dashboard → Settings → API
// ============================================================

const SUPABASE_URL = 'https://ahhixnkbpmvaxmwcydke.supabase.co';
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
  whatsapp TEXT
);

-- Habilitar acceso público de lectura (Row Level Security):
ALTER TABLE dependencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura pública"
  ON dependencias
  FOR SELECT
  USING (true);
*/
