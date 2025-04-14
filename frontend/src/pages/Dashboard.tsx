import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Widget {
  id: number;
  name: string;
  value: number;
}

const Dashboard = () => {
  const { logout } = useAuth();
  const [widgets, setWidgets] = useState<Widget[]>([]);

  const fetchWidgets = async () => {
    const res = await axios.get('http://localhost:3001/api/widgets', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    setWidgets(res.data);
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={logout} className="text-sm text-red-500 underline">
          Logout
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
};

export default Dashboard;