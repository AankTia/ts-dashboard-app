import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { open } from 'sqlite';

const app = express()
const port = 3001;

app.use(express.json());
app.use(cors());

// For tighter security in production, you can specify:
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true // if using cookies or auth headers
//   }));

// If you're sending an Authorization header (like Bearer token), make sure you also allow headers:
// app.use(cors({
//     origin: 'http://localhost:5173',
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization']
//   }));

// Initialise DB
let db: any;

(async () => {
    db = await open({
        filename: '.dashboard.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS widgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            value INTEGER
        )
    `);
})();

app.get('/api/widgets', async (_req, res) => {
    const widgets = await db.all('SELECT * FROM widgets');
    res.json(widgets);
});

app.post('/api/widgets', async (req, res) => {
    const { name, value } = req.body;
    const result = await db.run('INSERT INTO widgets (name, value) VALUES (?,?)', [
        name, value
    ]);
    res.json({ id: result.lastID });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});