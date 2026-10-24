import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import CreateRequest from './components/CreateRequest';
import DashboardProvider from './components/DashboardProvider';
import HomePublic from './components/HomePublic';
import WindowQuotesAdmin from './components/WindowQuotesAdmin';
import { getAuthToken } from './services/api.service';

type ViewState = 'home-public' | 'login' | 'register' | 'create-request' | 'dashboard-provider' | 'window-quotes-admin';

function App() {
  const [view, setView] = useState<ViewState>('home-public');

  useEffect(() => {
    // Check if user is logged in
    const token = getAuthToken();
    const role = localStorage.getItem('role');
    
    if (token) {
      if (role === 'CLIENT') {
        setView('create-request');
      } else if (role === 'PROVIDER' || role === 'TECNICO') {
        setView('dashboard-provider');
      } else if (role === 'ADMIN') {
        setView('window-quotes-admin');
      } else {
        // Fallback for providers acting as admin before
        setView('dashboard-provider');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    setView('home-public');
  };

  const handleAuthSuccess = () => {
    const role = localStorage.getItem('role');
    if (role === 'ADMIN') {
      setView('window-quotes-admin');
    } else if (role === 'PROVIDER' || role === 'TECNICO') {
      setView('dashboard-provider');
    } else {
      setView('create-request');
    }
  };

  if (view === 'home-public') {
    return <HomePublic setView={setView} />;
  }

  if (view === 'window-quotes-admin') {
    return (
      <div className="min-h-screen bg-surface flex flex-col w-full text-on-surface">
        <header className="bg-surface/90 backdrop-blur-xl border-b border-surface-container p-4 flex justify-between items-center px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            </div>
            <span className="text-lg md:text-xl font-extrabold tracking-tight text-on-surface">
              Listo<span className="text-secondary">App</span> Admin
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-error hover:underline transition cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </header>
        <div className="flex-1 flex justify-center p-4 md:p-8 items-start">
          <div className="w-full max-w-6xl">
            <WindowQuotesAdmin />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex justify-center bg-surface font-sans text-on-surface ${view === 'dashboard-provider' || view === 'create-request' ? 'items-start' : 'items-center p-4'}`}>
      {view === 'login' && <Login setView={setView} onSuccess={handleAuthSuccess} />}
      {view === 'register' && <Register setView={setView} onSuccess={handleAuthSuccess} />}
      {view === 'create-request' && <CreateRequest onLogout={handleLogout} />}
      {view === 'dashboard-provider' && <DashboardProvider onLogout={handleLogout} />}
    </div>
  );
}

export default App;
