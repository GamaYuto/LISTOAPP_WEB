import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import CreateRequest from './components/CreateRequest';
import DashboardProvider from './components/DashboardProvider';
import { getAuthToken } from './services/api.service';

type ViewState = 'login' | 'register' | 'create-request' | 'dashboard-provider';

function App() {
  const [view, setView] = useState<ViewState>('login');

  useEffect(() => {
    // Check if user is logged in
    const token = getAuthToken();
    const role = localStorage.getItem('role');
    
    if (token) {
      if (role === 'CLIENT') {
        setView('create-request');
      } else if (role === 'PROVIDER') {
        setView('dashboard-provider');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setView('login');
  };

  const handleAuthSuccess = () => {
    const role = localStorage.getItem('role');
    if (role === 'PROVIDER') {
      setView('dashboard-provider');
    } else {
      setView('create-request');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-brand-50 ${view === 'dashboard-provider' ? 'items-start' : 'p-4'}`}>
      {view === 'login' && <Login setView={setView} onSuccess={handleAuthSuccess} />}
      {view === 'register' && <Register setView={setView} onSuccess={handleAuthSuccess} />}
      {view === 'create-request' && <CreateRequest onLogout={handleLogout} />}
      {view === 'dashboard-provider' && <DashboardProvider onLogout={handleLogout} />}
    </div>
  );
}

export default App;
