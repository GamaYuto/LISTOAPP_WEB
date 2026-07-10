import { useState } from 'react';
import { registerUser } from '../services/api.service';

export default function Register({ setView, onSuccess }: { setView: (v: any) => void, onSuccess: () => void }) {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'CLIENT' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await registerUser(formData);
      // Tras registrar, forzamos login o pedimos que inicie sesión. Aquí podemos simplificar redirigiendo al login.
      onSuccess(); // Or we can redirect to success
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-100">
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white">
        <h2 className="text-2xl font-bold">Registro</h2>
        <p className="text-brand-100 text-sm mt-1">Únete a ListoApp</p>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700 block">¿Qué buscas en ListoApp?</label>
          <div className="flex flex-col space-y-2">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="role" value="CLIENT" checked={formData.role === 'CLIENT'} onChange={e => setFormData({...formData, role: e.target.value})} className="text-brand-600 focus:ring-brand-500 h-4 w-4" />
              <span className="text-sm font-medium text-gray-700">Quiero contratar servicios (Cliente)</span>
            </label>
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="radio" name="role" value="PROVIDER" checked={formData.role === 'PROVIDER'} onChange={e => setFormData({...formData, role: e.target.value})} className="text-brand-600 focus:ring-brand-500 h-4 w-4" />
              <span className="text-sm font-medium text-gray-700">Quiero ofrecer servicios (Técnico)</span>
            </label>
          </div>
        </div>

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
            type="password" required minLength={6}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-brand-500 focus:border-brand-500 outline-none"
            onChange={e => setFormData({...formData, password: e.target.value})}
          />
        </div>
        
        <button disabled={loading} type="submit" className="w-full py-3 bg-brand-600 text-white font-semibold rounded-lg shadow hover:bg-brand-700 disabled:opacity-70 transition-all">
          {loading ? 'Cargando...' : 'Crear Cuenta'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          ¿Ya tienes cuenta? <button type="button" onClick={() => setView('login')} className="text-brand-600 font-semibold hover:underline">Inicia Sesión</button>
        </p>
      </form>
    </div>
  );
}
