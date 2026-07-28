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
      <div className="min-h-screen bg-brand-50 flex flex-col w-full">
        <header className="bg-white p-4 shadow-sm flex justify-between items-center px-8">
          <div className="flex items-center gap-2 text-brand-primary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">Listo<span className="text-brand-accent">App</span> Admin</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-bold text-red-500 hover:text-red-700 transition">Cerrar Sesión</button>
        </header>
        <div className="flex-1 flex justify-center p-6 items-start">
          <WindowQuotesAdmin />
        </div>
      </div>
    );
  }

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
