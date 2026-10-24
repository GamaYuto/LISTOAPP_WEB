import { useState, useEffect } from 'react';
import { getMyRequests, acceptOffer } from '../services/api.service';

export default function MyRequests({ refreshTrigger }: { refreshTrigger: number }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

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
      await fetchMyRequests();
    } catch (err: any) {
      alert(err.message || 'Error al aceptar la oferta');
    } finally {
      setAcceptingId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const filteredRequests = requests.filter(req => {
    if (filterTab === 'active') return req.status === 'PENDING' || (req.offers && req.offers.some((o: any) => o.status === 'PENDING'));
    if (filterTab === 'completed') return req.status === 'ACCEPTED' || req.status === 'COMPLETED';
    return true;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-on-surface-variant">
      <div className="w-10 h-10 rounded-full border-4 border-secondary-container border-t-secondary animate-spin"></div>
      <span className="font-semibold text-xs">Cargando tus solicitudes y ofertas...</span>
    </div>
  );

  if (error) return (
    <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-semibold">
      {error}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Subheader & Tabs Filtro */}
      <div className="flex items-center justify-between pb-2 border-b border-surface-container">
        <div>
          <h3 className="text-lg font-black text-on-surface tracking-tight">Mis Solicitudes</h3>
          <p className="text-xs text-on-surface-variant">Propuestas y ofertas recibidas en tiempo real</p>
        </div>
        <div className="flex gap-1 bg-surface-container p-1 rounded-full text-xs">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'all' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Todas ({requests.length})
          </button>
          <button
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'active' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Activas
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl border border-surface-container p-8 text-center space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mx-auto">
            <span className="material-symbols-outlined text-[28px]">assignment_add</span>
          </div>
          <h4 className="text-sm font-extrabold text-on-surface">No hay solicitudes en esta sección</h4>
          <p className="text-on-surface-variant text-xs max-w-sm mx-auto">
            Publica una nueva solicitud en el asistente o cotiza una ventana para ver aquí tus presupuestos.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((req) => {
            const hasOffers = req.offers && req.offers.length > 0;
            const isAccepted = req.status === 'ACCEPTED';

            return (
              <div
                key={req.id}
                className="bg-surface-container-low rounded-3xl p-5 shadow-sm border border-surface-container transition-all hover:shadow-md space-y-4"
              >
                {/* Header de la Tarjeta con Badges de Estado Coloridos */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface text-[10px] font-extrabold uppercase tracking-wider">
                        {req.category}
                      </span>
                      <span className="text-[11px] text-outline">
                        #REQ-{req.id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-on-surface leading-snug">
                      {req.title}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isAccepted ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 shadow-sm border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Aceptado
                      </span>
                    ) : hasOffers ? (
                      <span className="px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[11px] font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        Ofertas Recibidas ({req.offers.length})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-outline animate-spin"></span>
                        Buscando Técnicos
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción y Detalles */}
                <p className="text-xs text-on-surface-variant bg-surface-container-lowest p-3 rounded-2xl border border-surface-container/60">
                  {req.description}
                </p>

                {/* Presupuesto Sugerido */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-outline">Presupuesto Sugerido:</span>
                  <span className="font-extrabold text-on-surface">{formatCurrency(req.priceSuggested)}</span>
                </div>

                {/* Sección de Ofertas Recibidas (Stitch Proposals) */}
                <div className="space-y-3 pt-2 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-secondary">local_offer</span>
                      Propuestas de Técnicos ({req.offers?.length || 0})
                    </span>
                  </div>

                  {!hasOffers ? (
                    <div className="bg-surface-container-lowest rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-surface-container">
                      <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px] animate-bounce">radar</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface">Notificando a técnicos calificados en tu zona</p>
                      <p className="text-[11px] text-on-surface-variant max-w-xs">
                        Las ofertas suelen llegar en menos de 15 minutos. Te avisaremos en cuanto un profesional postule.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {req.offers.map((offer: any, idx: number) => {
                        const ratings = ['4.9 ★★★★★', '4.8 ★★★★☆', '5.0 ★★★★★', '4.7 ★★★★☆'];
                        const mockRating = ratings[idx % ratings.length];
                        const techEmail = offer.provider?.email || 'Técnico';
                        const techName = techEmail.split('@')[0].charAt(0).toUpperCase() + techEmail.split('@')[0].slice(1);
                        const isThisOfferAccepted = offer.status === 'ACCEPTED';

                        return (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isThisOfferAccepted
                                ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                                : 'bg-surface-container-lowest border-surface-container shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-secondary-container text-secondary flex items-center justify-center font-bold text-sm shadow-inner">
                                  {techName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1">
                                    <h5 className="text-xs md:text-sm font-bold text-on-surface">{techName}</h5>
                                    <span className="material-symbols-outlined text-[15px] text-secondary">verified</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-0.5">
                                    <span className="font-bold text-amber-600">{mockRating}</span>
                                    <span className="text-outline">• Técnico Certificado</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-outline block uppercase font-bold">Valor Propuesto</span>
                                <span className="text-sm md:text-base font-black text-on-surface">
                                  {formatCurrency(offer.priceOffered)}
                                </span>
                              </div>
                            </div>

                            {offer.comment && (
                              <p className="text-xs text-on-surface-variant bg-surface-container-low p-2.5 rounded-xl italic">
                                "{offer.comment}"
                              </p>
                            )}

                            {/* Botón de Aceptar Oferta Claro */}
                            <div className="pt-1">
                              {!isAccepted && offer.status === 'PENDING' && (
                                <button
                                  onClick={() => handleAccept(offer.id)}
                                  disabled={acceptingId === offer.id}
                                  className="w-full py-2.5 px-4 bg-tertiary-fixed hover:bg-tertiary-fixed-dim text-on-tertiary-fixed rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                  <span>{acceptingId === offer.id ? 'Aceptando propuesta...' : 'Aceptar Oferta'}</span>
                                </button>
                              )}

                              {isThisOfferAccepted && (
                                <div className="w-full py-2 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                                  <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                  <span>Oferta Aceptada - Técnico en camino</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
