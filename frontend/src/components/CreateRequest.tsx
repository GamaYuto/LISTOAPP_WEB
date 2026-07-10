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
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Ocurrió un error al crear la solicitud. Verifica tu sesión.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-full max-w-2xl flex flex-col space-y-8 pb-10">
      {/* Form Container */}
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-brand-100 transition-all duration-300">
        <div className="bg-gradient-to-r from-brand-500 to-brand-600 p-6 text-white flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Crear Solicitud</h2>
          <p className="text-brand-100 text-sm mt-1 opacity-90">Describe el servicio de limpieza que necesitas</p>
        </div>
        <button onClick={onLogout} className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors">
          Salir
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {message.text && (
          <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Título</label>
          <input 
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="Ej. Limpieza de Apartamento 2 hab"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Categoría</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Presupuesto Sugerido ($)</label>
          <input 
            type="number"
            name="priceSuggested"
            value={formData.priceSuggested}
            onChange={handleChange}
            required
            min="1"
            step="0.01"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            placeholder="0.00"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Descripción detallada</label>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all resize-none"
            placeholder="Detalla lo que necesitas que se limpie..."
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
        >
          {loading ? 'Publicando...' : 'Publicar Solicitud'}
        </button>
      </form>
    </div>

      {/* My Requests and Offers */}
      <MyRequests refreshTrigger={refreshRequests} />
    </div>
  );
}
