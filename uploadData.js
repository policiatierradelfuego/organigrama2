const fs = require('fs');

function parseCSVLine(line) {
    let result = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            inQuotes = !inQuotes;
        } else if (c === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur.trim());
    return result;
}

function escapeSQL(str) {
    return str.replace(/'/g, "''");
}

async function generateSQL() {
    try {
        const csvContent = fs.readFileSync('Autoridades Policiales 2026.csv', 'utf8');
        const lines = csvContent.split('\n').map(l => l.trim()).filter(l => l);

        // La primera línea es la cabecera
        const dataRows = lines.slice(1);

        const records = dataRows.map(line => {
            const columns = parseCSVLine(line);
            return `('${escapeSQL(columns[0] || '')}', '${escapeSQL(columns[1] || '')}', '${escapeSQL(columns[2] || '')}', '${escapeSQL(columns[3] || '')}', '${escapeSQL(columns[4] || '')}', '${escapeSQL(columns[5] || '')}', '${escapeSQL(columns[6] || '')}', '${escapeSQL(columns[7] || '')}')`;
        });

        const sql = `INSERT INTO dependencias (guia, dependencia, jerarquia, responsable, direccion, email, telefono, whatsapp) VALUES\n${records.join(',\n')};`;

        fs.writeFileSync('insert_data.sql', sql, 'utf8');
        console.log('Archivo insert_data.sql generado con éxito.');

    } catch (e) {
        console.error('Ocurrió un error inesperado:', e);
    }
}

generateSQL();
