import fs from 'node:fs';
import path from 'node:path';
import csv from 'csv-parser';
import { find as findTimeZone } from 'geo-tz';

const airports = {};

fs.createReadStream(path.join(import.meta.dirname, '../data/airports.csv'))
    .pipe(csv())
    .on('data', (data) => {
        if(data.icao_code && data.iata_code && data.iata_code.length > 0) {
            const lat = parseFloat(data.latitude_deg);
            const lon = parseFloat(data.longitude_deg);

            airports[data.iata_code] = {
                name: data.name,
                iata: data.iata_code,
                icao: data.icao_code,
                lat,
                lon,
                mun: data.municipality,
                tz: findTimeZone(lat, lon)[0],
            };
        }
    })
    .on('end', () => {
        console.log(`[INFO] Writing ${Object.keys(airports).length} airports!`);

        const combined = {
            iata: Object.keys(airports),
            by_iata: airports,
        };

        fs.writeFileSync(path.join(import.meta.dirname, '../data/airports.json'), JSON.stringify(combined, null, 4), 'utf-8');
    });
