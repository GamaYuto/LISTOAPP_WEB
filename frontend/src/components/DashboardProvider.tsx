import { useState, useEffect } from 'react';
import { getPendingServices, createOffer } from '../services/api.service';

export default function DashboardProvider({ onLogout }: { onLogout: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerForm, setOfferForm] = useState<{ [key: string]: { price: string; comment: string } }>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const data = await getPendingServices();
      setServices(data);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al cargar servicios' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOfferChange = (id: string, field: 'price' | 'comment', value: string) => {
    setOfferForm(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSendOffer = async (id: string) => {
    const offer = offerForm[id];
    if (!offer?.price) {
      setMessage({ type: 'error', text: 'El precio es requerido' });
      return;
    }

    setSubmitting(id);
    setMessage({ type: '', text: '' });

    try {
      await createOffer({
        serviceRequestId: id,
        priceOffered: parseFloat(offer.price),
        comment: offer.comment || ''
      });
      setMessage({ type: 'success', text: '¡Oferta enviada con éxito!' });
      // Remove service from list or just re-fetch
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al enviar oferta' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 w-full p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-brand-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard de Técnico</h1>
            <p className="text-gray-500 text-sm mt-1">Explora las solicitudes y envía tus ofertas</p>
          </div>
          <button onClick={onLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors">
            Cerrar Sesión
          </button>
        </header>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10 text-gray-500">Cargando solicitudes...</div>
        ) : services.length === 0 ? (
          <div className="bg-white p-10 text-center rounded-2xl shadow-sm border border-brand-100">
            <h3 className="text-xl font-medium text-gray-700">No hay solicitudes pendientes</h3>
            <p className="text-gray-500 mt-2">Revisa más tarde para encontrar nuevas oportunidades de trabajo.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div key={service.id} className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-800 leading-tight">{service.title}</h3>
                    <span className="px-2.5 py-1 bg-brand-100 text-brand-700 text-xs font-semibold rounded-full whitespace-nowrap">
                      {service.category}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3">{service.description}</p>
                  
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">Presupuesto sugerido</div>
                    <div className="font-semibold text-gray-800">${service.priceSuggested.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 border-t border-brand-100 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-700">Tu Oferta</h4>
                  <div className="flex space-x-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input 
                        type="number"
                        min="1"
                        step="0.01"
                        placeholder="Precio"
                        value={offerForm[service.id]?.price || ''}
                        onChange={(e) => handleOfferChange(service.id, 'price', e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <input 
                    type="text"
                    placeholder="Comentario opcional (ej. Llevo mis equipos)"
                    value={offerForm[service.id]?.comment || ''}
                    onChange={(e) => handleOfferChange(service.id, 'comment', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                  />
                  <button 
                    onClick={() => handleSendOffer(service.id)}
                    disabled={submitting === service.id}
                    className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                  >
                    {submitting === service.id ? 'Enviando...' : 'Enviar Oferta'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
