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

  // Función para formatear valores monetarios a pesos colombianos COP o similar de forma estéticamente prolija
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-10 space-x-2 text-slate-500">
      <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span className="font-semibold text-sm">Cargando tus solicitudes...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl text-sm font-semibold">
      {error}
    </div>
  );

  return (
    <div className="space-y-5 mt-4">
      <div className="border-b border-slate-100 pb-2">
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Mis Solicitudes y Ofertas</h3>
        <p className="text-xs text-slate-400 mt-0.5">Controla las ofertas recibidas de los mejores técnicos</p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center space-y-3 shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-slate-500 text-sm font-medium">Aún no has publicado ninguna solicitud. ¡Comienza solicitando tu primera limpieza!</p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">

              {/* Cabecera de Solicitud */}
              <div className="p-5 flex justify-between items-start bg-slate-50/60 border-b border-slate-100/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-full tracking-wider">
                      {req.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      ID: #{req.id.slice(-4).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-lg font-extrabold text-slate-800 mt-1.5 leading-snug">{req.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{req.description}</p>
                </div>

                <div className="flex flex-col items-end space-y-1.5">
                  <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full tracking-wider shadow-sm ${
                    req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    req.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                    'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {req.status === 'PENDING' ? 'Buscando' : req.status === 'ACCEPTED' ? 'Aceptado' : req.status}
                  </span>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Sugerido</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(req.priceSuggested)}</p>
                  </div>
                </div>
              </div>
              
              {/* Ofertas Recibidas */}
              <div className="p-5 bg-white space-y-3.5">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-2">
                    <span>Ofertas Recibidas</span>
                    <span className="bg-brand-primary text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {req.offers?.length || 0}
                    </span>
                  </h5>
                </div>

                {req.offers?.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Esperando que técnicos calificados oferten. Te notificaremos al instante.</p>
                ) : (
                  <div className="space-y-3">
                    {req.offers.map((offer: any, idx: number) => {
                      // Mockear calificación del técnico para cumplir con el diseño: 4.8 estrellas ★★★★☆
                      const ratings = ['4.8 ★★★★☆', '4.9 ★★★★★', '5.0 ★★★★★', '4.7 ★★★★☆'];
                      const mockRating = ratings[idx % ratings.length];
                      const techEmail = offer.provider.email;
                      const techName = techEmail.split('@')[0].charAt(0).toUpperCase() + techEmail.split('@')[0].slice(1);

                      return (
                        <div
                          key={offer.id}
                          className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all ${
                            offer.status === 'ACCEPTED'
                              ? 'bg-emerald-50/70 border-emerald-200 shadow-sm'
                              : offer.status === 'REJECTED'
                              ? 'bg-slate-50/50 border-slate-100 opacity-60'
                              : 'bg-card-orange-light/30 border-orange-100 hover:border-orange-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-black text-slate-800">{techName}</span>
                              <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                {mockRating}
                              </span>
                            </div>
                            {offer.comment && (
                              <p className="text-xs text-slate-600 italic bg-white/70 p-2 rounded-xl border border-slate-100 mt-1.5">
                                "{offer.comment}"
                              </p>
                            )}
                            <p className="text-[10px] text-slate-400 font-medium">Técnico ID: #{offer.provider.id.slice(-4).toUpperCase()}</p>
                          </div>

                          {/* Precio destacado y botón verde */}
                          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                            <div className="text-right">
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Tarifa Ofrecida</p>
                              <p className="text-base font-black text-brand-primary">{formatCurrency(offer.priceOffered)}</p>
                            </div>

                            {req.status === 'PENDING' && offer.status === 'PENDING' && (
                              <button
                                onClick={() => handleAccept(offer.id)}
                                disabled={acceptingId === offer.id}
                                className="px-4 py-2.5 bg-brand-success hover:bg-brand-success-hover text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow hover:shadow-md active:scale-95 shrink-0"
                              >
                                {acceptingId === offer.id ? 'Aceptando...' : 'Aceptar Oferta'}
                              </button>
                            )}
                            {offer.status === 'ACCEPTED' && (
                              <span className="px-3 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-black rounded-xl flex items-center space-x-1 shrink-0 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4 text-emerald-700">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                                <span>Aceptada</span>
                              </span>
                            )}
                            {offer.status === 'REJECTED' && (
                              <span className="text-slate-400 text-xs font-bold">Rechazada</span>
                            )}
                          </div>

                        </div>
                      );
                    })}
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
