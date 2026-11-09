import { useState, useEffect } from 'react';
import { getMyRequests, acceptOffer, updateServiceStatus } from '../services/api.service';

interface ProviderExperienceItem {
  id: string;
  companyName: string;
  duration: string;
  period: string;
  description: string;
  testimonyPhotos: string;
  createdAt: string;
}

interface ProviderInfo {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  email: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  rating?: number;
  experiences?: ProviderExperienceItem[];
}

interface OfferItem {
  id: string;
  priceOffered: number;
  comment: string;
  status: string;
  createdAt?: string;
  provider?: ProviderInfo;
}

interface ServiceRequestWithOffers {
  id: string;
  title: string;
  description: string;
  category: string;
  priceSuggested: number;
  status: string;
  createdAt: string;
  provider?: ProviderInfo | null;
  offers?: OfferItem[];
}

export default function MyRequests({ refreshTrigger }: { refreshTrigger: number }) {
  const [requests, setRequests] = useState<ServiceRequestWithOffers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingServiceId, setUpdatingServiceId] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  // Estado para expandir la experiencia del técnico por ID de oferta
  const [expandedOfferId, setExpandedOfferId] = useState<string | null>(null);

  const fetchMyRequests = async () => {
    try {
      const data = await getMyRequests();
      setRequests(data);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error al cargar tus solicitudes');
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
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error al aceptar la oferta');
    } finally {
      setAcceptingId(null);
    }
  };

  const handleCompleteService = async (serviceId: string) => {
    if (!window.confirm('¿Confirmas que el servicio fue realizado satisfactoriamente?')) return;
    setUpdatingServiceId(serviceId);
    try {
      await updateServiceStatus(serviceId, 'COMPLETED');
      await fetchMyRequests();
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error al actualizar el estado del servicio');
    } finally {
      setUpdatingServiceId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const parsePhotos = (testimonyPhotos: string | null | undefined): string[] => {
    if (!testimonyPhotos) return [];
    try {
      const parsed = JSON.parse(testimonyPhotos);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON
    }
    return [];
  };

  const filteredRequests = requests.filter(req => {
    if (filterTab === 'active') return req.status === 'PENDING' || (req.offers && req.offers.some(o => o.status === 'PENDING'));
    if (filterTab === 'completed') return req.status === 'ACCEPTED' || req.status === 'COMPLETED' || req.status === 'IN_PROGRESS';
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
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
              filterTab === 'completed' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Completadas
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
            Publica una nueva solicitud en el asistente o cotiza para ver aquí tus presupuestos.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredRequests.map((req) => {
            const hasOffers = req.offers && req.offers.length > 0;
            const isAccepted = req.status === 'ACCEPTED';
            const isInProgress = req.status === 'IN_PROGRESS';
            const isCompleted = req.status === 'COMPLETED';
            const acceptedOffer = req.offers?.find(o => o.status === 'ACCEPTED') || (req.provider ? { provider: req.provider, priceOffered: req.priceSuggested, comment: '', id: 'assigned', status: 'ACCEPTED' } : undefined);

            const activeTech = acceptedOffer?.provider || req.provider;
            const techCleanPhone = activeTech?.phone ? activeTech.phone.replace(/[^0-9]/g, '') : '';
            const activeTechName =
              activeTech?.fullName ||
              [activeTech?.firstName, activeTech?.lastName].filter(Boolean).join(' ') ||
              activeTech?.email?.split('@')[0] ||
              'Técnico Especialista';

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-surface-container transition-all hover:shadow-md space-y-4"
              >
                {/* Header de la Tarjeta con Badges de Estado */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-[#eaf4fa] text-[#1b4965] text-[10px] font-heading font-bold uppercase tracking-wider">
                        {req.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        #REQ-{req.id.slice(-4).toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-base font-heading font-bold text-on-surface leading-snug">
                      {req.title}
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isCompleted ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Finalizado
                      </span>
                    ) : isInProgress ? (
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold flex items-center gap-1 border border-blue-200">
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        En Progreso
                      </span>
                    ) : isAccepted ? (
                      <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold flex items-center gap-1 border border-amber-200">
                        <span className="material-symbols-outlined text-[14px]">handshake</span>
                        Técnico Asignado
                      </span>
                    ) : hasOffers ? (
                      <span className="px-3 py-1 rounded-full bg-[#eaf4fa] text-[#1b4965] text-[11px] font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <span className="w-2 h-2 rounded-full bg-[#88C1E0] animate-pulse"></span>
                        Ofertas Recibidas ({req.offers?.length})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-outline animate-spin"></span>
                        Buscando Técnicos
                      </span>
                    )}
                  </div>
                </div>

                {/* Ciclo de Vida Visual del Servicio */}
                {(isAccepted || isInProgress || isCompleted) && (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span className={isAccepted || isInProgress || isCompleted ? 'text-emerald-600 font-bold' : ''}>
                        1. Oferta Aceptada ✓
                      </span>
                      <span className={isInProgress || isCompleted ? 'text-blue-600 font-bold' : ''}>
                        2. En Progreso {isInProgress ? '⏳' : isCompleted ? '✓' : ''}
                      </span>
                      <span className={isCompleted ? 'text-emerald-700 font-bold' : ''}>
                        3. Completado {isCompleted ? '🎉' : ''}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-accent h-full transition-all duration-500"
                        style={{ width: isCompleted ? '100%' : isInProgress ? '66%' : '33%' }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Descripción y Detalles */}
                <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-2xl border border-surface-container/60">
                  {req.description}
                </p>

                {/* Presupuesto Sugerido */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Presupuesto Sugerido:</span>
                  <span className="font-heading font-bold text-on-surface">{formatCurrency(req.priceSuggested)}</span>
                </div>

                {/* Técnico Asignado con Botón Directo WhatsApp */}
                {(isAccepted || isInProgress || isCompleted) && activeTech && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {activeTech.avatarUrl ? (
                          <img
                            src={activeTech.avatarUrl}
                            alt={activeTechName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-400 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#88C1E0] text-white flex items-center justify-center font-bold text-base shadow-sm">
                            {activeTechName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs sm:text-sm font-bold text-emerald-950 font-heading">
                              {activeTechName}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">
                              Técnico Asignado
                            </span>
                          </div>
                          {acceptedOffer && (
                            <p className="text-[11px] text-emerald-700">
                              Precio Acordado: <strong>{formatCurrency(acceptedOffer.priceOffered)}</strong>
                            </p>
                          )}
                          {activeTech.phone && (
                            <p className="text-[10px] text-emerald-600 mt-0.5">
                              Tel: {activeTech.phone}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Botón Directo WhatsApp para Contactar al Técnico */}
                      {techCleanPhone && (
                        <a
                          href={`https://wa.me/${techCleanPhone}?text=Hola%20${encodeURIComponent(activeTechName)},%20te%20contacto%20desde%20ListoApp%20sobre%20mi%20solicitud%20${encodeURIComponent(req.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[18px]">chat</span>
                          <span>Contactar Técnico por WhatsApp</span>
                        </a>
                      )}
                    </div>

                    {/* Botón para que el cliente confirme el servicio */}
                    {!isCompleted && (
                      <button
                        onClick={() => handleCompleteService(req.id)}
                        disabled={updatingServiceId === req.id}
                        className="w-full py-2.5 px-4 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">task_alt</span>
                        <span>{updatingServiceId === req.id ? 'Confirmando...' : 'Confirmar Trabajo Recibido y Finalizado'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Sección de Ofertas Recibidas */}
                <div className="space-y-3 pt-2 border-t border-surface-container">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-heading font-bold text-on-surface flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#88C1E0]">local_offer</span>
                      Propuestas de Técnicos ({req.offers?.length || 0})
                    </span>
                  </div>

                  {!hasOffers ? (
                    <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col items-center text-center gap-2 border border-surface-container">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#88C1E0] shadow-sm">
                        <span className="material-symbols-outlined text-[20px] animate-bounce">radar</span>
                      </div>
                      <p className="text-xs font-bold text-on-surface">Notificando a técnicos en tu zona</p>
                      <p className="text-[11px] text-on-surface-variant max-w-xs">
                        Las ofertas suelen llegar en poco tiempo. Te avisaremos en cuanto un profesional postule.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {req.offers?.map((offer) => {
                        const techName =
                          offer.provider?.fullName ||
                          [offer.provider?.firstName, offer.provider?.lastName].filter(Boolean).join(' ') ||
                          offer.provider?.email?.split('@')[0] ||
                          'Técnico';
                        const isThisOfferAccepted = offer.status === 'ACCEPTED';
                        const isExpanded = expandedOfferId === offer.id;
                        const providerCleanPhone = offer.provider?.phone ? offer.provider.phone.replace(/[^0-9]/g, '') : '';
                        const experiences = offer.provider?.experiences || [];

                        return (
                          <div
                            key={offer.id}
                            className={`p-4 rounded-2xl border transition-all space-y-3 ${
                              isThisOfferAccepted
                                ? 'bg-emerald-50/90 border-emerald-300 shadow-sm'
                                : 'bg-surface-container-low border-surface-container shadow-sm hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-start sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {offer.provider?.avatarUrl ? (
                                  <img
                                    src={offer.provider.avatarUrl}
                                    alt={techName}
                                    className="w-11 h-11 rounded-full object-cover border border-[#88C1E0] shadow-sm shrink-0"
                                  />
                                ) : (
                                  <div className="w-11 h-11 rounded-full bg-[#eaf4fa] text-[#1b4965] flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                                    {techName.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-1">
                                    <h5 className="text-xs md:text-sm font-heading font-bold text-on-surface">{techName}</h5>
                                    {offer.provider?.isVerified && (
                                      <span className="material-symbols-outlined text-[16px] text-emerald-600" title="Técnico Verificado RGPD">
                                        verified
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-0.5">
                                    <span className="font-bold text-amber-600">
                                      ★ {(offer.provider?.rating ?? 5.0).toFixed(1)}
                                    </span>
                                    <span className="text-slate-400">• Profesional ListoApp</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-slate-400 block uppercase font-bold">Valor Propuesto</span>
                                <span className="text-sm md:text-base font-heading font-extrabold text-on-surface">
                                  {formatCurrency(offer.priceOffered)}
                                </span>
                              </div>
                            </div>

                            {offer.comment && (
                              <p className="text-xs text-on-surface-variant bg-white p-2.5 rounded-xl italic border border-slate-100">
                                "{offer.comment}"
                              </p>
                            )}

                            {/* Botón Desplegable: Ver experiencia y fotos de trabajos */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedOfferId(prev => prev === offer.id ? null : offer.id)}
                                className="w-full py-2 px-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span className="flex items-center gap-1.5">
                                  <span className="material-symbols-outlined text-[16px] text-secondary">photo_library</span>
                                  <span>Ver experiencia y fotos de trabajos ({experiences.length})</span>
                                </span>
                                <span className="material-symbols-outlined text-[18px]">
                                  {isExpanded ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                                </span>
                              </button>

                              {/* Acordeón de Experiencias y Fotos */}
                              {isExpanded && (
                                <div className="mt-2.5 p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 animate-in fade-in duration-200">
                                  <div className="border-b border-slate-100 pb-1.5">
                                    <h6 className="text-[11px] font-black uppercase tracking-wider text-slate-600">
                                      Portafolio de Trabajos Anteriores
                                    </h6>
                                  </div>

                                  {experiences.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">
                                      Este profesional aún no ha adjuntado fotos de experiencias en su portafolio.
                                    </p>
                                  ) : (
                                    <div className="space-y-3">
                                      {experiences.map((exp) => {
                                        const photos = parsePhotos(exp.testimonyPhotos);
                                        return (
                                          <div key={exp.id} className="p-3 bg-slate-50 rounded-xl space-y-2">
                                            <div className="flex items-baseline justify-between gap-2">
                                              <span className="text-xs font-extrabold text-slate-800">{exp.companyName}</span>
                                              <span className="text-[10px] text-secondary font-bold">{exp.period} ({exp.duration})</span>
                                            </div>
                                            <p className="text-xs text-slate-600 leading-relaxed">{exp.description}</p>
                                            {photos.length > 0 && (
                                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                                                {photos.map((photoUrl, pIdx) => (
                                                  <a
                                                    key={pIdx}
                                                    href={photoUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="block h-20 rounded-lg overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                                                  >
                                                    <img
                                                      src={photoUrl}
                                                      alt={`Foto testimonio ${pIdx + 1}`}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </a>
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Acciones de la Oferta */}
                            <div className="pt-1 flex flex-col sm:flex-row gap-2">
                              {/* Botón de Aceptar Oferta */}
                              {!isAccepted && !isInProgress && !isCompleted && offer.status === 'PENDING' && (
                                <button
                                  onClick={() => handleAccept(offer.id)}
                                  disabled={acceptingId === offer.id}
                                  className="w-full py-2.5 px-4 bg-brand-accent hover:bg-[#e6b000] text-brand-dark rounded-xl text-xs font-heading font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                                >
                                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                  <span>{acceptingId === offer.id ? 'Aceptando propuesta...' : 'Aceptar Oferta'}</span>
                                </button>
                              )}

                              {/* Estado Aceptada con Botón Directo WhatsApp */}
                              {isThisOfferAccepted && (
                                <div className="w-full flex flex-col sm:flex-row items-center gap-2">
                                  <div className="flex-1 py-2 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200">
                                    <span className="material-symbols-outlined text-[16px]">task_alt</span>
                                    <span>Oferta Aceptada</span>
                                  </div>
                                  {providerCleanPhone && (
                                    <a
                                      href={`https://wa.me/${providerCleanPhone}?text=Hola%20${encodeURIComponent(techName)},%20te%20contacto%20desde%20ListoApp%20sobre%20mi%20solicitud%20${encodeURIComponent(req.title)}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 whitespace-nowrap"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">chat</span>
                                      <span>Contactar por WhatsApp</span>
                                    </a>
                                  )}
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
