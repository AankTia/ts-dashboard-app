Here’s a **step-by-step tutorial** for building a **simple web app dashboard** using **TypeScript** and **SQLite**. We'll use:

- **Express.js** for backend
- **SQLite3** for the database
- **TypeORM** or **better-sqlite3** for database interaction
- **React with TypeScript** for frontend
- **Vite** for bundling frontend
- **Tailwind CSS** for styling

---

## 🛠️ Step-by-Step: Web App Dashboard with TypeScript & SQLite

---

### ✅ Step 1: Project Structure

We'll use a monorepo-like structure:

```
ts-dashboard-app/
├── backend/
│   ├── src/
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   └── tsconfig.json
├── package.json
└── README.md
```

---

### ⚙️ Step 2: Initialize Projects

#### Root Folder

```bash
mkdir ts-dashboard-app && cd ts-dashboard-app
npm init -y
```

#### Backend Setup

```bash
mkdir backend && cd backend
npm init -y
npm install express sqlite3 typescript ts-node-dev @types/express
npm install --save-dev @types/cors
npx tsc --init
```

Edit `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
  }
}
```

---

### 🗃️ Step 3: Setup SQLite and API

Create `backend/src/index.ts`:

```ts
import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
const port = 3001;

app.use(express.json());

// Initialize DB
let db: any;

(async () => {
  db = await open({
    filename: './dashboard.db',
    driver: sqlite3.Database
  });

  await db.exec(`CREATE TABLE IF NOT EXISTS widgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    value INTEGER
  )`);
})();

app.get('/api/widgets', async (_req, res) => {
  const widgets = await db.all('SELECT * FROM widgets');
  res.json(widgets);
});

app.post('/api/widgets', async (req, res) => {
  const { name, value } = req.body;
  const result = await db.run(
    'INSERT INTO widgets (name, value) VALUES (?, ?)',
    [name, value]
  );
  res.json({ id: result.lastID });
});

app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
```

To run:
```bash
npx ts-node-dev src/index.ts
```

---

### 🎨 Step 4: Setup Frontend with React + Vite + TS

```bash
cd ../
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

Edit `tailwind.config.js`:

```js
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

In `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 🧩 Step 5: Build Dashboard UI

In `frontend/src/App.tsx`:

```tsx
import { useEffect, useState } from 'react';
import axios from 'axios';

interface Widget {
  id: number;
  name: string;
  value: number;
}

function App() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [name, setName] = useState('');
  const [value, setValue] = useState(0);

  useEffect(() => {
    fetchWidgets();
  }, []);

  const fetchWidgets = async () => {
    const res = await axios.get('http://localhost:3001/api/widgets');
    setWidgets(res.data);
  };

  const addWidget = async () => {
    await axios.post('http://localhost:3001/api/widgets', { name, value });
    setName('');
    setValue(0);
    fetchWidgets();
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4 space-y-2">
        <input
          type="text"
          className="border p-2 w-full"
          placeholder="Widget name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="number"
          className="border p-2 w-full"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <button onClick={addWidget} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Widget
        </button>
      </div>
      <ul className="space-y-2">
        {widgets.map((w) => (
          <li key={w.id} className="border p-2 rounded shadow">
            {w.name}: {w.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

---

### 🚀 Step 6: Run It All

**Backend:**
```bash
cd backend
npx ts-node-dev src/index.ts
```

**Frontend:**
```bash
cd frontend
npm run dev
```

---

Alright! Let’s add **User Login with JWT** to your TypeScript + SQLite web app. This will involve:

1. Creating a `users` table
2. User registration & login endpoints
3. Password hashing with `bcrypt`
4. JWT token generation with `jsonwebtoken`
5. Middleware to protect routes

---

## 🔐 Step-by-Step: Add User Login with JWT

---

### 📦 Step 1: Install Auth Dependencies (Backend)

Go to your `backend` folder and install:

```bash
npm install bcrypt jsonwebtoken
npm install --save-dev @types/bcrypt @types/jsonwebtoken
```

---

### 🗃️ Step 2: Update Database (Add Users Table)

Update your DB setup in `backend/src/index.ts`:

```ts
await db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);
```

---

### 🧂 Step 3: Register User Endpoint

Add this to `index.ts`:

```ts
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // Use env var in prod

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ error: 'Username already exists' });
  }
});
```

---

### 🔐 Step 4: Login User + Issue JWT

```ts
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});
```

---

### 🛡️ Step 5: Auth Middleware

```ts
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
```

Use it to protect routes:

```ts
app.get('/api/widgets', authenticateToken, async (_req, res) => {
  const widgets = await db.all('SELECT * FROM widgets');
  res.json(widgets);
});
```

---

### 🌐 Step 6: Frontend Login Example (React)

In your frontend, create a login form and store the JWT:

```tsx
const login = async () => {
  const res = await axios.post('http://localhost:3001/api/login', { username, password });
  localStorage.setItem('token', res.data.token);
};
```

And use the token in requests:

```tsx
axios.get('http://localhost:3001/api/widgets', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});
```

---

### ✅ Done!

Now you have:

- ✅ User registration & login
- ✅ Secure JWT-based authentication
- ✅ Protected routes

---

Do you want help adding logout, persistent login, or a full auth flow with React context/hooks?
