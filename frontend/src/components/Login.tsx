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
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-100">
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
        <p className="text-brand-100 text-sm mt-1">Bienvenido de nuevo a ListoApp</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Email</label>
          <input 
            type="email" required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none"
            onChange={e => setFormData({...formData, email: e.target.value})}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Contraseña</label>
          <input 
            type="password" required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
        <button disabled={loading} type="submit" className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg shadow hover:bg-brand-700 disabled:opacity-70 transition-all">
          {loading ? 'Cargando...' : 'Entrar'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿No tienes cuenta? <button type="button" onClick={() => setView('register')} className="text-brand-600 font-semibold hover:underline">Regístrate</button>
        </p>
      </form>
    </div>
  );
}
