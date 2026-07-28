import { useState, useEffect } from 'react';
import { getPendingServices, createOffer } from '../services/api.service';
import WindowQuotesAdmin from './WindowQuotesAdmin';

export default function DashboardProvider({ onLogout }: { onLogout: () => void }) {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [offerForm, setOfferForm] = useState<{ [key: string]: { price: string; comment: string } }>({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState<string | null>(null);

  // Estados para el Popup de Confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [terms, setTerms] = useState({
    appointmentPlace: false,
    qualityService: false
  });

  // Estado para controlar qué tarjeta tiene los campos expandidos ("Ver Detalle")
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [panelView, setPanelView] = useState<'feed' | 'window-quotes'>('feed');

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

  // Al hacer clic en "Enviar Oferta", validamos los campos de precio y disparamos el popup de confirmación
  const handleOpenConfirmModal = (id: string) => {
    const offer = offerForm[id];
    if (!offer?.price) {
      setMessage({ type: 'error', text: 'El precio es requerido para enviar una oferta.' });
      return;
    }
    setSelectedServiceId(id);
    setTerms({ appointmentPlace: false, qualityService: false }); // Reset checkboxes
    setShowConfirmModal(true);
  };

  // Se ejecuta una vez se aceptan los términos en el popup modal
  const handleConfirmSendOffer = async () => {
    if (!selectedServiceId) return;
    const offer = offerForm[selectedServiceId];
    if (!offer?.price) return;

    setShowConfirmModal(false);
    setSubmitting(selectedServiceId);
    setMessage({ type: '', text: '' });

    try {
      await createOffer({
        serviceRequestId: selectedServiceId,
        priceOffered: parseFloat(offer.price),
        comment: offer.comment || ''
      });
      setMessage({ type: 'success', text: '¡Tu oferta ha sido enviada con éxito al cliente!' });
      // Remove service from list
      setServices(prev => prev.filter(s => s.id !== selectedServiceId));
      setExpandedCardId(null);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al enviar la oferta.' });
    } finally {
      setSubmitting(null);
      setSelectedServiceId(null);
    }
  };

  // Función para formatear valores monetarios a COP
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

  // Direcciones colombianas ficticias mockeadas por ID para simular realismo en la tarjeta
  const mockAddresses = [
    "Prado, Barranquilla",
    "Calle 72 #43-21, Barranquilla",
    "Cra 53 #82-102, Alto Prado",
    "Calle 93 #46-78, Barranquilla",
    "Cra 43 #50-12, Centro"
  ];

  const getMockAddress = (id: string) => {
    // Generamos un índice determinista basado en el ID del servicio
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % mockAddresses.length;
    return mockAddresses[idx];
  };

  return (
    <div className="min-h-screen bg-brand-gray-light w-full p-4 md:p-8 pb-24 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-6">

        {/* Cabecera Superior Azul (Idéntica al Cliente pero adaptada al Rol) */}
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
              <p className="text-[10px] text-brand-primary-light font-bold uppercase tracking-wider">Panel de Técnico</p>
            </div>
          </div>

          {/* Perfil del Técnico & Logout */}
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

        {/* Tarjeta de Gamificación (Nivel Bronce con barra al 98%) */}
        <div className="w-full bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-primary opacity-10 rounded-full blur-2xl"></div>

          <div className="space-y-2 relative z-10">
            <span className="bg-amber-700 text-amber-100 text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider shadow">
              Rango del Técnico
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-tight flex items-center space-x-2">
              <span>Nivel Bronce</span>
              <span className="text-xs text-slate-400 font-bold">(Alcanza el nivel plata para obtener beneficios!)</span>
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              ¡Estás a solo unos servicios de desbloquear comisiones preferenciales y soporte prioritario!
            </p>
          </div>

          {/* Barra de progreso verde al 98% */}
          <div className="w-full md:w-64 space-y-1.5 relative z-10 shrink-0">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>Progreso de Nivel</span>
              <span className="text-brand-success">98%</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden p-0.5 border border-slate-600">
              <div className="h-full bg-brand-success rounded-full transition-all duration-500" style={{ width: '98%' }}></div>
            </div>
          </div>
        </div>

        {/* Mensaje global */}
        {message.text && (
          <div className={`p-4 rounded-2xl text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* View Switcher */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPanelView('feed')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${panelView === 'feed' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Feed de Servicios
            </button>
            <button
              type="button"
              onClick={() => setPanelView('window-quotes')}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${panelView === 'window-quotes' ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Cotizaciones de Ventanas
            </button>
          </div>
          <span className="text-xs text-slate-500">Actualmente estás en: <strong>{panelView === 'feed' ? 'Feed de servicios' : 'Panel de cotizaciones'}</strong></span>
        </div>

        {panelView === 'window-quotes' ? (
          <WindowQuotesAdmin />
        ) : (
          <div className="space-y-4">
          <div className="border-b border-slate-200 pb-2 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Feed de Servicios Pendientes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Explora las solicitudes publicadas recientemente y postula tu oferta</p>
            </div>
            <span className="bg-slate-200 text-slate-700 text-xs font-black px-3 py-1 rounded-full">
              {services.length} disponibles
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 space-x-2 text-slate-500">
              <svg className="animate-spin h-5 w-5 text-brand-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-semibold text-sm">Cargando solicitudes...</span>
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-slate-100 space-y-4">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.637 10.637Z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-700">No hay solicitudes pendientes</h3>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">Te avisaremos tan pronto como un cliente publique un nuevo requerimiento en tu zona.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service) => {
                const isExpanded = expandedCardId === service.id;
                const address = getMockAddress(service.id);

                return (
                  <div key={service.id} className="bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between">
                    <div className="p-6 space-y-4">

                      {/* Cabecera Tarjeta */}
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <span className="px-2.5 py-0.5 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase rounded-full tracking-wider">
                            {service.category}
                          </span>
                          <h3 className="text-lg font-extrabold text-slate-800 leading-tight">{service.title}</h3>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider">Sugerido</p>
                          <p className="text-base font-black text-slate-900">{formatCurrency(service.priceSuggested)}</p>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed">{service.description}</p>

                      {/* Dirección Física Ficticia */}
                      <div className="flex items-center space-x-2 text-slate-400 pt-2 border-t border-slate-50">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 text-brand-primary shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="text-xs font-bold text-slate-600">{address}</span>
                      </div>

                    </div>

                    {/* Botón Ver Detalle (para desplegar formulario de oferta) */}
                    <div className="px-6 pb-6 pt-2">
                      {!isExpanded ? (
                        <button
                          onClick={() => setExpandedCardId(service.id)}
                          className="w-full py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-slate-900 text-xs font-extrabold rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow active:scale-[0.98] text-center"
                        >
                          Ver Detalle / Ofertar
                        </button>
                      ) : (
                        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3 transition-all duration-300">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Formular Oferta</h4>
                            <button onClick={() => setExpandedCardId(null)} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 hover:underline">
                              Cancelar
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tu Tarifa ($ COP)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">$</span>
                              <input
                                type="number"
                                min="1000"
                                step="1"
                                placeholder="Precio de tu oferta"
                                value={offerForm[service.id]?.price || ''}
                                onChange={(e) => handleOfferChange(service.id, 'price', e.target.value)}
                                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs text-slate-800"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Comentario Adicional (Opcional)</label>
                            <input
                              type="text"
                              placeholder="Ej. Llevo mis propios implementos de aseo"
                              value={offerForm[service.id]?.comment || ''}
                              onChange={(e) => handleOfferChange(service.id, 'comment', e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none text-xs text-slate-800"
                            />
                          </div>

                          <button
                            onClick={() => handleOpenConfirmModal(service.id)}
                            disabled={submitting === service.id}
                            className="w-full py-2 bg-brand-primary hover:bg-brand-primary-dark text-white text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow active:scale-95"
                          >
                            {submitting === service.id ? 'Enviando...' : 'Enviar Oferta'}
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      </div>

      {/* Popup / Modal de Confirmación de Términos */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 space-y-5 animate-scale-up">

            <div className="flex items-center space-x-3 text-brand-primary">
              <div className="w-10 h-10 bg-brand-primary-bg rounded-xl flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">Confirmación de Oferta</h3>
                <p className="text-xs text-slate-400">Por favor, confirma que aceptas las condiciones</p>
              </div>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed border-t border-b border-slate-50 py-3">
              Para garantizar una experiencia excepcional tanto a clientes como a técnicos en ListoApp, requerimos que confirmes las siguientes condiciones para realizar la prestación del servicio.
            </p>

            <div className="space-y-3.5">
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={terms.appointmentPlace}
                  onChange={(e) => setTerms({ ...terms, appointmentPlace: e.target.checked })}
                  className="mt-0.5 h-4.5 w-4.5 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                  Acepto ir al lugar de la cita en la fecha y hora indicadas.
                </span>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={terms.qualityService}
                  onChange={(e) => setTerms({ ...terms, qualityService: e.target.checked })}
                  className="mt-0.5 h-4.5 w-4.5 rounded text-brand-primary focus:ring-brand-primary border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-800 transition-colors">
                  Acepto realizar el servicio con los estándares de calidad de ListoApp.
                </span>
              </label>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={!terms.appointmentPlace || !terms.qualityService}
                onClick={handleConfirmSendOffer}
                className="flex-1 py-2.5 bg-brand-success hover:bg-brand-success-hover text-white text-xs font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow hover:shadow-md"
              >
                Aceptar y Enviar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Navbar Inferior Estética de color Azul Fija para Técnico */}
      <nav className="fixed bottom-0 left-0 right-0 bg-brand-primary text-white border-t border-brand-primary-dark px-6 py-4 shadow-2xl flex justify-around items-center z-40 rounded-t-3xl max-w-2xl mx-auto">
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
          <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">1</span>
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
