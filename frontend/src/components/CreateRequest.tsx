import { useState } from 'react';
import { createServiceRequest } from '../services/api.service';
import MyRequests from './MyRequests';

export default function CreateRequest({ onLogout }: { onLogout: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Residencial',
    priceSuggested: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshRequests, setRefreshRequests] = useState(0);
  const [isOpen, setIsOpen] = useState(false); // Acordeón para colapsar/desplegar formulario

  const categories = ['Residencial', 'Profunda', 'Express', 'Post-Construcción'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createServiceRequest({
        ...formData,
        priceSuggested: parseFloat(formData.priceSuggested)
      });
      setMessage({ type: 'success', text: '¡Solicitud creada exitosamente!' });
      setFormData({ title: '', description: '', category: 'Residencial', priceSuggested: '' });
      setRefreshRequests(prev => prev + 1);
      setTimeout(() => setIsOpen(false), 2000); // Cerramos el formulario después de un éxito
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ocurrió un error al crear la solicitud. Verifica tu sesión.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Obtener un nombre de usuario amigable desde el localStorage (email)
  const email = localStorage.getItem('email') || '';
  const friendlyName = email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Cliente';
  const initialLetter = friendlyName.charAt(0);

  return (
    <div className="w-full max-w-2xl flex flex-col space-y-6 pb-24 relative px-4 md:px-0">
      
      {/* Cabecera Superior Azul */}
      <header className="w-full bg-brand-primary text-white rounded-3xl p-5 shadow-lg flex items-center justify-between border border-brand-primary-dark">
        <div className="flex items-center space-x-3">
          {/* Logo ListoApp */}
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center">
              Listo<span className="text-brand-accent">App</span>
            </h1>
            <p className="text-[10px] text-brand-primary-light font-bold uppercase tracking-wider">Módulo Cliente</p>
          </div>
        </div>

        {/* Perfil del Cliente & Logout */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold opacity-75">Bienvenido</p>
            <p className="text-sm font-bold">{friendlyName}</p>
          </div>
          {/* Avatar con Iniciales */}
          <div className="w-10 h-10 rounded-full bg-brand-accent text-slate-900 flex items-center justify-center font-bold text-base shadow-md border-2 border-white">
            {initialLetter}
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white cursor-pointer"
            title="Cerrar Sesión"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>
      </header>

      {/* Banner de Descuento (Puro CSS y SVG de Tailwind) */}
      <div className="w-full bg-gradient-to-br from-brand-primary to-brand-primary-dark rounded-3xl p-6 text-white shadow-xl flex items-center justify-between overflow-hidden relative border border-brand-primary-dark">
        {/* Decoraciones de fondo */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-brand-primary-light opacity-20 rounded-full blur-2xl"></div>
        <div className="absolute -left-10 -top-10 w-32 h-32 bg-white opacity-10 rounded-full blur-xl"></div>

        <div className="space-y-2 relative z-10 max-w-[70%]">
          <span className="bg-brand-accent text-slate-950 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow">
            ¡Especial Primer Servicio!
          </span>
          <h2 className="text-xl md:text-2xl font-black leading-tight">
            10% descuento especial en tu primer servicio
          </h2>
          <p className="text-xs text-brand-primary-light font-medium">
            Aprovecha esta tarifa promocional reservando con nuestros técnicos calificados de confianza.
          </p>
        </div>

        {/* Ilustración nativa en SVG */}
        <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center p-3 text-brand-accent border border-white/20 shadow-inner relative z-10 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m9-9H3M9.12 12.94A2.4 2.4 0 0 0 11.5 15h.01a2.4 2.4 0 0 0 2.38-2.06c.09-.76-.5-1.44-1.27-1.44H11.5c-.77 0-1.36-.68-1.27-1.44A2.4 2.4 0 0 1 12.5 8h.01a2.4 2.4 0 0 1 2.38 2.06M12 1v22M1 12h22" />
          </svg>
        </div>
      </div>

      {/* Botón de Acción Principal para Abrir/Colapsar el Formulario */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4.5 bg-brand-accent hover:bg-brand-accent-hover text-slate-900 font-extrabold rounded-3xl shadow-lg hover:shadow-xl hover:shadow-yellow-500/10 active:scale-[0.99] transition-all flex items-center justify-center space-x-3 text-lg cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        <span>Solicitar Limpieza</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {/* Form Container (Acordeón que se despliega verticalmente) */}
      <div className={`w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 transition-all duration-300 ${isOpen ? 'max-h-[800px] opacity-100 border-t-4 border-t-brand-primary' : 'max-h-0 opacity-0 pointer-events-none'}`}>
        <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Nueva Solicitud</h2>
            <p className="text-xs text-slate-400 mt-0.5">Define el servicio de limpieza que requieres</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message.text && (
            <div className={`p-3.5 rounded-2xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Título del Servicio</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
              placeholder="Ej. Limpieza a fondo de Apartamento 2 hab"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Categoría</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800 cursor-pointer"
              >
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Presupuesto Sugerido ($ COP)</label>
              <input
                type="number"
                name="priceSuggested"
                value={formData.priceSuggested}
                onChange={handleChange}
                required
                min="1000"
                step="1"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800"
                placeholder="Ej. 120000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Descripción Detallada</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition-all text-sm text-slate-800 resize-none"
              placeholder="Detalla lo que necesitas que se limpie (ej. cocina, habitaciones, baños, etc.)..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-dark text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 cursor-pointer text-sm"
          >
            {loading ? 'Publicando Solicitud...' : 'Confirmar y Publicar'}
          </button>
        </form>
      </div>

      {/* My Requests and Offers (Historial) */}
      <MyRequests refreshTrigger={refreshRequests} />

      {/* Navbar Inferior Estética de color Azul Fija */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-primary text-white border-t border-brand-primary-dark px-6 py-4 shadow-2xl flex justify-around items-center z-50 rounded-t-3xl max-w-2xl mx-auto">
        <button className="flex flex-col items-center justify-center space-y-1 text-white hover:text-brand-accent transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6 text-brand-accent">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span className="text-[10px] font-bold tracking-wide">Home</span>
        </button>

        <button className="flex flex-col items-center justify-center space-y-1 text-white hover:text-brand-accent transition-colors cursor-pointer relative">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wide opacity-80">Chat</span>
          <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">2</span>
        </button>

        <button className="flex flex-col items-center justify-center space-y-1 text-white hover:text-brand-accent transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wide opacity-80">Historial</span>
        </button>

        <button className="flex flex-col items-center justify-center space-y-1 text-white hover:text-brand-accent transition-colors cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.2" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span className="text-[10px] font-bold tracking-wide opacity-80">Perfil</span>
        </button>
      </nav>

    </div>
  );
}
