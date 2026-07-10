import { useState, useEffect } from 'react';
import { getMyRequests, acceptOffer } from '../services/api.service';

export default function MyRequests({ refreshTrigger }: { refreshTrigger: number }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchMyRequests = async () => {
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar tus solicitudes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [refreshTrigger]);

  const handleAccept = async (offerId: string) => {
    setAcceptingId(offerId);
    try {
      await acceptOffer(offerId);
      await fetchMyRequests(); // Refresh data to show accepted state
    } catch (err: any) {
      alert(err.message || 'Error al aceptar la oferta');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <div className="text-center py-6 text-gray-500">Cargando tus solicitudes...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>;

  return (
    <div className="space-y-6 mt-8">
      <h3 className="text-xl font-bold text-gray-800">Mis Solicitudes y Ofertas</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500 text-sm">Aún no has publicado ninguna solicitud.</p>
      ) : (
        <div className="space-y-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-xl shadow-sm border border-brand-100 overflow-hidden">
              <div className="p-5 flex justify-between items-start bg-gray-50/50">
                <div>
                  <h4 className="text-lg font-bold text-gray-800">{req.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">Sugerido: ${req.priceSuggested.toFixed(2)} • Categoría: {req.category}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                  req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                  req.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="p-5 border-t border-brand-50">
                <h5 className="text-sm font-semibold text-gray-700 mb-3">Ofertas Recibidas ({req.offers?.length || 0})</h5>
                {req.offers?.length === 0 ? (
                  <p className="text-sm text-gray-500">Ningún técnico ha ofertado aún.</p>
                ) : (
                  <div className="space-y-3">
                    {req.offers.map((offer: any) => (
                      <div key={offer.id} className={`flex justify-between items-center p-3 rounded-lg border ${
                        offer.status === 'ACCEPTED' ? 'bg-green-50 border-green-200' :
                        offer.status === 'REJECTED' ? 'bg-gray-50 border-gray-200 opacity-60' :
                        'bg-white border-gray-200'
                      }`}>
                        <div>
                          <div className="font-semibold text-gray-800">${offer.priceOffered.toFixed(2)}</div>
                          {offer.comment && <p className="text-xs text-gray-600 mt-1 italic">"{offer.comment}"</p>}
                          <div className="text-xs text-gray-500 mt-1">Técnico: {offer.provider.email}</div>
                        </div>
                        
                        {req.status === 'PENDING' && offer.status === 'PENDING' && (
                          <button
                            onClick={() => handleAccept(offer.id)}
                            disabled={acceptingId === offer.id}
                            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                          >
                            {acceptingId === offer.id ? 'Aceptando...' : 'Aceptar'}
                          </button>
                        )}
                        {offer.status === 'ACCEPTED' && (
                          <span className="text-green-700 text-sm font-bold flex items-center">
                            ✓ Oferta Aceptada
                          </span>
                        )}
                        {offer.status === 'REJECTED' && (
                          <span className="text-gray-500 text-sm font-medium">Rechazada</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
