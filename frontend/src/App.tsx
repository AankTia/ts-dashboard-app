// import { useState, useState } from 'react'
// import axios from 'axios';
import axios from 'axios';
import { useEffect, useState } from 'react';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

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
    <div className='p-6 max-w-xl mx-auto'>
      <h1 className='text-2xl font-bold mb-4'> Dashboard</h1>
      <div className='mb-4 space-y-2'>
        <input type='text' className='border-p2 w-full' placeholder='Widget name' value={name} onChange={(e) => setName(e.target.value)} />
        <input type='number' className='border p-2 w-full' placeholder='Value' value={value} onChange={(e) => setValue(Number(e.target.value))} />
        <button onClick={addWidget} className='bg-blue-500 text-white px-4 py-2 rounded'>
          Add Widget
        </button>
      </div>
      <ul className='space-y-2'>
        {widgets.map((w) => (
          <li key={w.id} className='border p-2 rouded shadow'>
            {w.name}: {w.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App
