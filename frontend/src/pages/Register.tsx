import { useState } from 'react';
import { registerUser } from '../services/api.service';

export default function Register({ setView }: { setView: (v: any) => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    role: 'CLIENT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Por favor indica tu nombre y apellidos.');
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData);
      // Redirigimos al login con mensaje
      setView('login');
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col p-6 sm:p-8 space-y-6 relative">
      <button 
        onClick={() => setView('home-public')} 
        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition flex items-center gap-1 text-sm font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Inicio
      </button>

      {/* Logotipo Isotipo SVG + Texto */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <div className="w-14 h-14 bg-brand-primary-bg rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 mt-1">
          Listo<span className="text-brand-accent">App</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-medium">Soluciones del hogar y servicios en España</p>
      </div>

      <div className="border-b border-slate-100 pb-2">
        <h2 className="text-lg sm:text-xl font-bold text-slate-800">Crea tu cuenta profesional</h2>
        <p className="text-slate-400 text-xs mt-0.5">Ingresa tus datos reales para que clientes y técnicos te identifiquen</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-xs sm:text-sm font-medium">
            {error}
          </div>
        )}
        
        {/* Selector de Rol */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">¿Qué deseas hacer?</label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer transition-all ${
              formData.role === 'CLIENT'
                ? 'border-brand-primary bg-brand-primary-bg text-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="role"
                value="CLIENT"
                checked={formData.role === 'CLIENT'}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="sr-only"
              />
              <span className="text-xs sm:text-sm font-bold text-center">Cliente</span>
              <span className="text-[10px] mt-0.5 opacity-80 text-center">Buscar y contratar servicios</span>
            </label>

            <label className={`flex flex-col items-center justify-center p-3 border rounded-2xl cursor-pointer transition-all ${
              formData.role === 'PROVIDER'
                ? 'border-brand-primary bg-brand-primary-bg text-brand-primary shadow-sm ring-2 ring-brand-primary/20'
                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
            }`}>
              <input
                type="radio"
                name="role"
                value="PROVIDER"
                checked={formData.role === 'PROVIDER'}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="sr-only"
              />
              <span className="text-xs sm:text-sm font-bold text-center">Profesional / Técnico</span>
              <span className="text-[10px] mt-0.5 opacity-80 text-center">Ofrecer servicios y cotizar</span>
            </label>
          </div>
        </div>

        {/* Nombre y Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Nombre *</label>
            <input
              type="text"
              required
              placeholder="Ej. Juan"
              value={formData.firstName}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, firstName: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Apellidos *</label>
            <input
              type="text"
              required
              placeholder="Ej. García López"
              value={formData.lastName}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, lastName: e.target.value})}
            />
          </div>
        </div>

        {/* Teléfono / WhatsApp */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Teléfono / WhatsApp *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
              </svg>
            </span>
            <input
              type="tel"
              required
              placeholder="+34 612 345 678"
              value={formData.phone}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <span className="text-[10px] text-slate-400">Utilizado para coordinar ofertas y visitas de servicio</span>
        </div>

        {/* Campo Email */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Correo electrónico *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </span>
            <input
              type="email"
              required
              placeholder="juan.garcia@correo.es"
              value={formData.email}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
        </div>

        {/* Campo Contraseña */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contraseña *</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
            </span>
            <input
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>
        
        {/* Botón de envío */}
        <button
          disabled={loading}
          type="submit"
          className="w-full py-3.5 bg-brand-accent hover:bg-[#e6b000] text-slate-900 font-bold rounded-2xl shadow-md active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-center text-sm cursor-pointer mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando tu cuenta...</span>
            </span>
          ) : 'Completar Registro'}
        </button>

        <p className="text-center text-xs text-slate-500 mt-3">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-brand-primary font-bold hover:underline cursor-pointer"
          >
            Inicia Sesión aquí
          </button>
        </p>
      </form>
    </div>
  );
}
