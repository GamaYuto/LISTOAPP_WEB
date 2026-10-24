import { useState, useEffect } from 'react';
import { getPendingServices, createOffer, getMyJobs, updateServiceStatus } from '../services/api.service';
import WindowQuotesAdmin from './WindowQuotesAdmin';

export default function DashboardProvider({ onLogout }: { onLogout: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  // Filtros superiores en formato pills
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Estado para el BottomSheet / Modal Flotante Exprés de Oferta
  const [activeOfferService, setActiveOfferService] = useState<any | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickComment, setQuickComment] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Tabs superiores de vista: Feed vs Mis Trabajos vs Cotizaciones
  const [panelView, setPanelView] = useState<'feed' | 'my-jobs' | 'window-quotes'>('feed');

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

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (err: any) {
      console.error('Error al cargar mis trabajos:', err);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchJobs();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const email = localStorage.getItem('email') || '';
  const friendlyName = email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Técnico';
  const initialLetter = friendlyName.charAt(0);

  // Abrir vista rápida flotante de oferta
  const handleOpenQuickOffer = (service: any) => {
    setActiveOfferService(service);
    setQuickPrice(service.priceSuggested ? String(service.priceSuggested) : '');
    setQuickComment('¡Hola! Tengo disponibilidad inmediata. Servicio con garantía.');
    setAgreeTerms(true);
  };

  // Envío Exprés de Oferta con 1 solo clic
  const handleSendQuickOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfferService) return;

    if (!quickPrice || parseFloat(quickPrice) <= 0) {
      alert('Por favor ingresa un precio propuesto válido.');
      return;
    }

    setSubmitting(activeOfferService.id);
    try {
      await createOffer({
        serviceRequestId: activeOfferService.id,
        priceOffered: parseFloat(quickPrice),
        comment: quickComment || 'Oferta enviada con disponibilidad inmediata.'
      });
      setMessage({ type: 'success', text: `¡Tu propuesta para "${activeOfferService.title}" ha sido enviada al cliente!` });
      // Remover de la lista activa
      setServices(prev => prev.filter(s => s.id !== activeOfferService.id));
      setActiveOfferService(null);
    } catch (err: any) {
      alert(err.message || 'Error al enviar la oferta.');
    } finally {
      setSubmitting(null);
    }
  };

  const categories = ['Todas', 'Ventanas', 'Aluminio', 'Limpieza', 'Persianas', 'Generales'];

  const filteredServices = services.filter(service => {
    if (selectedCategory === 'Todas') return true;
    const cat = (service.category || '').toLowerCase();
    const title = (service.title || '').toLowerCase();
    const term = selectedCategory.toLowerCase();
    return cat.includes(term) || title.includes(term);
  });

  const handleUpdateJobStatus = async (serviceId: string, nextStatus: string) => {
    setUpdatingJobId(serviceId);
    try {
      await updateServiceStatus(serviceId, nextStatus);
      await fetchJobs();
      setMessage({ type: 'success', text: `Estado del trabajo actualizado a ${nextStatus}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el estado' });
    } finally {
      setUpdatingJobId(null);
    }
  };

  return (
    <div className="w-full max-w-4xl min-h-screen bg-surface flex flex-col justify-between pb-28 pt-2 px-4 md:px-0">
      
      {/* App Shell Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md py-3 border-b border-surface-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#88C1E0] text-white flex items-center justify-center shadow-md font-bold text-lg">
            ⚡
          </div>
          <div>
            <h1 className="text-lg font-heading font-extrabold tracking-tight text-on-surface">
              Listo<span className="text-[#88C1E0] font-heading font-bold">App</span> Pro
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Panel de Especialistas</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-slate-400 font-medium">Técnico Certificado</p>
            <p className="text-xs font-bold text-on-surface">{friendlyName}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-[#eaf4fa] text-[#1b4965] flex items-center justify-center font-bold text-sm shadow-sm border border-[#eaf4fa]">
            {initialLetter}
          </div>
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="pt-4 space-y-6">

        {/* View Switcher: Feed vs Mis Trabajos vs Cotizaciones de Ventanas */}
        <div className="flex p-1 bg-surface-container rounded-full w-full">
          <button
            onClick={() => setPanelView('feed')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              panelView === 'feed'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dynamic_feed</span>
            Feed ({services.length})
          </button>

          <button
            onClick={() => setPanelView('my-jobs')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              panelView === 'my-jobs'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">handshake</span>
            Mis Trabajos ({jobs.filter(j => j.status !== 'COMPLETED').length})
          </button>

          <button
            onClick={() => setPanelView('window-quotes')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              panelView === 'window-quotes'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_view</span>
            Cotizaciones
          </button>
        </div>

        {panelView === 'window-quotes' ? (
          <WindowQuotesAdmin />
        ) : panelView === 'my-jobs' ? (
          /* Pestaña: Mis Trabajos Asignados */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-heading font-bold text-on-surface">Mis Trabajos Ganados y en Curso</h3>
                <p className="text-xs text-on-surface-variant">Gestiona el progreso y ponte en contacto con los clientes</p>
              </div>
              <button
                onClick={fetchJobs}
                className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                title="Actualizar trabajos"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
              </button>
            </div>

            {jobsLoading ? (
              <div className="text-center py-12 text-xs font-bold text-slate-400">Cargando tus trabajos...</div>
            ) : jobs.length === 0 ? (
              <div className="bg-white rounded-3xl border border-surface-container p-8 text-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                  <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                </div>
                <h4 className="text-sm font-heading font-bold text-on-surface">Aún no tienes trabajos asignados</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Postula a solicitudes en el feed de oportunidades. En cuanto un cliente acepte tu oferta, aparecerá aquí.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => {
                  const acceptedOffer = job.offers && job.offers[0];
                  const clientEmail = job.client?.email || 'Cliente';
                  const clientName = clientEmail.split('@')[0];
                  const isInProgress = job.status === 'IN_PROGRESS';
                  const isCompleted = job.status === 'COMPLETED';

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-surface-container space-y-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#eaf4fa] text-[#1b4965] text-[10px] font-heading font-bold uppercase tracking-wider">
                              {job.category}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">
                              #JOB-{job.id.slice(-4).toUpperCase()}
                            </span>
                          </div>
                          <h4 className="text-base font-heading font-bold text-on-surface">{job.title}</h4>
                        </div>

                        <div>
                          {isCompleted ? (
                            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                              ✓ Completado
                            </span>
                          ) : isInProgress ? (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200 animate-pulse">
                              ⏳ En Curso
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200">
                              🤝 Por Iniciar
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-on-surface-variant bg-surface-container-low p-3 rounded-2xl">
                        {job.description}
                      </p>

                      {/* Datos del Cliente y Botón de Contacto */}
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Cliente Solicitante</span>
                          <span className="text-xs font-bold text-on-surface">{clientName} ({clientEmail})</span>
                          {acceptedOffer && (
                            <span className="text-xs text-emerald-700 font-extrabold block mt-0.5">
                              Pago Acordado: {formatCurrency(acceptedOffer.priceOffered)}
                            </span>
                          )}
                        </div>

                        <a
                          href={`https://wa.me/?text=Hola%20${clientName},%20soy%20el%20técnico%20de%20ListoApp%20asignado%20para%20tu%20solicitud%20${encodeURIComponent(job.title)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[16px]">chat</span>
                          Escribir por WhatsApp
                        </a>
                      </div>

                      {/* Botones de Cambio de Estado para el Proveedor */}
                      {!isCompleted && (
                        <div className="flex gap-2 pt-1">
                          {!isInProgress ? (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'IN_PROGRESS')}
                              disabled={updatingJobId === job.id}
                              className="flex-1 py-2.5 px-4 bg-brand-accent hover:bg-[#e6b000] text-brand-dark rounded-xl text-xs font-heading font-bold shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                              <span>{updatingJobId === job.id ? 'Actualizando...' : 'Iniciar Trabajo / En Camino'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                              disabled={updatingJobId === job.id}
                              className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-heading font-bold shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <span className="material-symbols-outlined text-[16px]">check_circle</span>
                              <span>{updatingJobId === job.id ? 'Finalizando...' : 'Marcar Trabajo como Finalizado'}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Gamification Level Card (Stitch: Bronze Level Pro) */}
            <div className="bg-primary-container text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-secondary/30 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/15">
                    🥉
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Rango Actual</span>
                    <h2 className="text-lg md:text-xl font-black">Bronce Pro (98%)</h2>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Activo
                </span>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-1.5 relative z-10">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Progreso a Nivel Plata</span>
                  <span className="font-bold text-white">2 solicitudes más para subir</span>
                </div>
                <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full w-[98%] transition-all duration-700"></div>
                </div>
              </div>
            </div>

            {/* Metrics Overview Bar (Stitch Metrics) */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-[22px] mb-1">bolt</span>
                <div className="text-xl font-black text-on-surface">{services.length}</div>
                <div className="text-[11px] text-on-surface-variant font-medium">Disponibles</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-[22px] mb-1">send</span>
                <div className="text-xl font-black text-on-surface">5</div>
                <div className="text-[11px] text-on-surface-variant font-medium">Enviadas</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-amber-500 text-[22px] mb-1">star</span>
                <div className="text-xl font-black text-on-surface">4.9</div>
                <div className="text-[11px] text-on-surface-variant font-medium">Calificación</div>
              </div>
            </div>

            {/* Category Pills Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container'
                  }`}
                >
                  {cat} {cat === 'Todas' ? `(${services.length})` : ''}
                </button>
              ))}
            </div>

            {/* Notification message */}
            {message.text && (
              <div className={`p-4 rounded-2xl text-xs font-bold ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-error-container text-on-error-container'
              }`}>
                {message.text}
              </div>
            )}

            {/* Feed de Oportunidades Estilo Muro */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base md:text-lg font-black text-on-surface tracking-tight">
                    Solicitudes Activas en tu Zona
                  </h3>
                  <p className="text-xs text-on-surface-variant">Postula con un clic y sé el primero en ser aceptado</p>
                </div>
                <button
                  onClick={fetchServices}
                  className="p-2 rounded-full hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
                  title="Actualizar feed"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3 text-on-surface-variant">
                  <div className="w-10 h-10 rounded-full border-4 border-secondary-container border-t-secondary animate-spin"></div>
                  <span className="font-semibold text-xs">Cargando oportunidades para ti...</span>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-3xl p-10 text-center border border-surface-container space-y-3 shadow-sm">
                  <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mx-auto">
                    <span className="material-symbols-outlined text-[28px]">search_off</span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">No hay solicitudes en esta categoría</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                    Selecciona otra píldora de filtro o revisa en unos minutos para nuevas publicaciones de clientes.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-surface-container-low rounded-3xl p-5 shadow-sm border border-surface-container flex flex-col justify-between hover:shadow-md transition-all space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Header de la tarjeta */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                              <span className="material-symbols-outlined text-[22px]">
                                {service.category?.toLowerCase().includes('vidrio') || service.category?.toLowerCase().includes('aluminio')
                                  ? 'window'
                                  : service.category?.toLowerCase().includes('limpieza')
                                  ? 'cleaning_services'
                                  : 'handyman'}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] font-extrabold text-secondary uppercase tracking-wider">
                                {service.category || 'General'}
                              </span>
                              <h4 className="text-sm md:text-base font-extrabold text-on-surface leading-tight">
                                {service.title}
                              </h4>
                            </div>
                          </div>

                          <span className="bg-tertiary-fixed text-on-tertiary-fixed px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                            Nuevo
                          </span>
                        </div>

                        {/* Descripción y Detalles */}
                        <p className="text-xs text-on-surface-variant line-clamp-3 bg-surface-container-lowest p-3 rounded-2xl border border-surface-container/60">
                          {service.description}
                        </p>

                        {/* Metadatos y Precio Sugerido */}
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-surface-container">
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                            <span className="text-[11px]">Reciente</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-outline block uppercase font-bold">Presupuesto Sugerido</span>
                            <span className="text-sm font-black text-on-surface">
                              {formatCurrency(service.priceSuggested)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botón de Enviar Oferta Rápida */}
                      <button
                        onClick={() => handleOpenQuickOffer(service)}
                        className="w-full py-3 px-4 rounded-2xl bg-primary hover:bg-slate-800 text-on-primary text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-transform cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">local_offer</span>
                        <span>Enviar Oferta Exprés</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* Floating BottomSheet Modal para Envío Exprés de Ofertas */}
      {activeOfferService && (
        <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-surface w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-surface-container animate-in slide-in-from-bottom duration-300">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-secondary-container text-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">local_offer</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-sm md:text-base text-on-surface">
                    Enviar Propuesta Exprés
                  </h4>
                  <p className="text-[11px] text-on-surface-variant truncate max-w-[220px]">
                    {activeOfferService.title}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveOfferService(null)}
                className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSendQuickOffer} className="p-6 space-y-4">
              {/* Precio Propuesto */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tu Precio Propuesto ($ COP) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-on-surface-variant font-bold">$</span>
                  <input
                    type="number"
                    min="1000"
                    step="500"
                    required
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    placeholder="120000"
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 pl-8 text-base font-extrabold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
                <p className="text-[11px] text-outline mt-1">
                  Sugerido por cliente: {formatCurrency(activeOfferService.priceSuggested)}
                </p>
              </div>

              {/* Mensaje Corto */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Mensaje Corto para el Cliente
                </label>
                <textarea
                  rows={2}
                  value={quickComment}
                  onChange={(e) => setQuickComment(e.target.value)}
                  placeholder="Ej. Tengo disponibilidad inmediata, cuento con herramientas completas..."
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary resize-none shadow-sm"
                />
              </div>

              {/* Términos de Servicio */}
              <label className="flex items-start gap-2.5 cursor-pointer bg-surface-container-low p-3 rounded-2xl border border-surface-container">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-secondary focus:ring-secondary cursor-pointer"
                />
                <span className="text-[11px] text-on-surface-variant leading-tight">
                  Acepto los términos de servicio, estándares de calidad y acudir puntualmente al lugar del cliente.
                </span>
              </label>

              {/* Botón de Enviar a la API con 1 solo clic */}
              <button
                type="submit"
                disabled={!agreeTerms || submitting === activeOfferService.id}
                className="w-full py-4 rounded-2xl bg-secondary text-on-secondary font-bold text-xs md:text-sm shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting === activeOfferService.id ? (
                  <span>Enviando propuesta...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                    <span>Enviar Propuesta al Cliente</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar Fija para Técnico (Stitch) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-surface-container shadow-2xl max-w-4xl mx-auto pb-safe">
        <div className="flex justify-around items-center h-18 px-4">
          <button
            onClick={() => setPanelView('feed')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              panelView === 'feed' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">dynamic_feed</span>
            <span className="text-[10px]">Oportunidades</span>
          </button>

          <button
            onClick={() => setPanelView('window-quotes')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              panelView === 'window-quotes' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">table_view</span>
            <span className="text-[10px]">Cotizaciones</span>
          </button>

          <button
            onClick={fetchServices}
            className="flex flex-col items-center justify-center gap-1 w-16 h-14 text-secondary hover:text-blue-700 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">sync</span>
            <span className="text-[10px] font-bold">Refrescar</span>
          </button>

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center gap-1 w-16 h-14 text-on-surface-variant hover:text-error transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">logout</span>
            <span className="text-[10px]">Salir</span>
          </button>
        </div>
      </nav>

    </div>
  );
}
