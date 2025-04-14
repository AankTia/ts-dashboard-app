import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { open } from 'sqlite';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key' // Use env var in prod

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

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `);
})();

app.get('/api/widgets', authenticateToken, async (_req, res) => {
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

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    try {
        await db.run('INSERT INTO users (username, password) VALUES (?,?)', [
            username, hash
        ]);
        res.json({ message: 'User registered' });
    } catch (error) {
        res.status(400).json({ error: 'Username already exists' });
    }
});

app.post('/api/login', async (req: any, res: any) => {
    const { username, password } = req.body;

    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Auth Middleware
function authenticateToken(req: any, res: any, next: any) {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];
  
    if (!token) return res.status(401).json({ error: 'Missing token' });
  
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Invalid token' });
      req.user = user;
      next();
    });
  }

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});