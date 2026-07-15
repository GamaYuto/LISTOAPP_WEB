import { useState } from 'react';
import { loginUser } from '../services/api.service';

export default function Login({ setView, onSuccess }: { setView: (v: any) => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await loginUser(formData);
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.user.role);
      localStorage.setItem('email', res.user.email); // Guardamos para mostrar nombre amigable
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col p-8 space-y-6">
      {/* Logotipo Isotipo SVG + Texto */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-16 h-16 bg-brand-primary-bg rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
          {/* SVG Isotipo de ListoApp (Rayo + Escoba/Brillo estilizado) */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
          Listo<span className="text-brand-accent">App</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium">Soluciones de limpieza al instante</p>
      </div>

      <div className="border-b border-slate-100 pb-2">
        <h2 className="text-xl font-bold text-slate-800">Iniciar Sesión</h2>
        <p className="text-slate-400 text-xs mt-1">Ingresa tus credenciales para acceder</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Correo electrónico</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
            <input
              type="email"
              required
              placeholder="ejemplo@correo.com"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contraseña</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-3.5 bg-brand-accent hover:bg-brand-accent-hover text-slate-900 font-bold rounded-2xl shadow-lg shadow-yellow-500/10 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-center text-sm cursor-pointer mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Verificando...</span>
            </span>
          ) : 'Iniciar Sesión'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-4">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => setView('register')}
            className="text-brand-primary font-bold hover:underline cursor-pointer"
          >
            Regístrate aquí
          </button>
        </p>
      </form>
    </div>
  );
}
