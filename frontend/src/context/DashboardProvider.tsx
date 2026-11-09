import { useState, useEffect, useRef } from 'react';
import {
  getPendingServices,
  createOffer,
  getMyJobs,
  updateServiceStatus,
  getMyOffers,
  getMyProfile,
  rechargeCredits,
  addProviderExperience,
  updateProfileAvatar
} from '../services/api.service';
import type { UserProfile, ProviderExperience } from '../services/api.service';

interface ServiceRequestItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priceSuggested: number;
  status: string;
  createdAt: string;
  client?: {
    id: string;
    email: string;
    fullName?: string | null;
    phone?: string | null;
  };
}

interface JobOfferItem {
  id: string;
  priceOffered: number;
  comment: string;
  status: string;
}

interface JobItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priceSuggested: number;
  status: string;
  client?: {
    id: string;
    email: string;
    fullName?: string | null;
    phone?: string | null;
  };
  offers?: JobOfferItem[];
}

interface ProviderOfferItem {
  id: string;
  serviceRequestId: string;
  priceOffered: number;
  comment: string;
  status: string;
  createdAt: string;
  serviceRequest?: {
    id: string;
    title: string;
    category: string;
  };
}

type PanelView = 'feed' | 'my-jobs' | 'credits' | 'profile';

export default function DashboardProvider({ onLogout }: { onLogout: () => void }) {
  const [panelView, setPanelView] = useState<PanelView>('feed');
  const [services, setServices] = useState<ServiceRequestItem[]>([]);
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [myOffers, setMyOffers] = useState<ProviderOfferItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);

  // Filtros superiores en formato pills con las 8 categorías del Marketplace
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Estado para el Modal Flotante Exprés de Oferta
  const [activeOfferService, setActiveOfferService] = useState<ServiceRequestItem | null>(null);
  const [quickPrice, setQuickPrice] = useState<string>('');
  const [quickComment, setQuickComment] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  // Estados de Recarga de Créditos
  const [rechargingCredits, setRechargingCredits] = useState<number | null>(null);

  // Estados de Formulario de Experiencia
  const [companyName, setCompanyName] = useState('');
  const [duration, setDuration] = useState('');
  const [period, setPeriod] = useState('');
  const [expDescription, setExpDescription] = useState('');
  const [experienceFiles, setExperienceFiles] = useState<File[]>([]);
  const [expPreviews, setExpPreviews] = useState<string[]>([]);
  const [savingExp, setSavingExp] = useState(false);
  const expFileInputRef = useRef<HTMLInputElement>(null);

  // Estados de Foto de Perfil
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const fetchServices = async () => {
    try {
      const data = await getPendingServices();
      setServices(data);
    } catch (err) {
      const errorObj = err as Error;
      setMessage({ type: 'error', text: errorObj.message || 'Error al cargar solicitudes' });
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const data = await getMyJobs();
      setJobs(data);
    } catch (err) {
      console.error('Error al cargar mis trabajos:', (err as Error).message);
    } finally {
      setJobsLoading(false);
    }
  };

  const fetchMyOffers = async () => {
    try {
      const data = await getMyOffers();
      setMyOffers(data);
    } catch (err) {
      console.error('Error al cargar mis ofertas:', (err as Error).message);
    }
  };

  const fetchProfile = async () => {
    try {
      const data = await getMyProfile();
      setUserProfile(data);
    } catch (err) {
      console.error('Error al cargar perfil:', (err as Error).message);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchJobs();
    fetchMyOffers();
    fetchProfile();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const storedName = localStorage.getItem('userName');
  const email = localStorage.getItem('email') || '';
  const friendlyName =
    userProfile?.fullName ||
    storedName ||
    (email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Profesional');
  const initialLetter = friendlyName.charAt(0);
  const userRating = userProfile?.rating ?? Number(localStorage.getItem('userRating') || '5.0');
  const availableCredits = userProfile?.availableCredits ?? 0;
  const frozenCredits = userProfile?.frozenCredits ?? 0;

  // Abrir modal exprés de oferta verificando créditos disponibles
  const handleOpenQuickOffer = (service: ServiceRequestItem) => {
    if (availableCredits <= 0) {
      alert('⚠️ Saldo insuficiente: Tienes 0 créditos disponibles. Cada postulación reserva 1 crédito (4 €). Te redirigimos a tu billetera para recargar créditos.');
      setPanelView('credits');
      return;
    }
    setActiveOfferService(service);
    setQuickPrice(service.priceSuggested ? String(service.priceSuggested) : '45');
    setQuickComment('¡Hola! Cuento con total disponibilidad y herramientas completas para tu servicio.');
    setAgreeTerms(true);
  };

  // Envío Exprés de Oferta
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
      setMessage({
        type: 'success',
        text: `¡Tu propuesta para "${activeOfferService.title}" ha sido enviada al cliente! Se reservó 1 crédito temporalmente.`
      });
      setServices(prev => prev.filter(s => s.id !== activeOfferService.id));
      await fetchMyOffers();
      await fetchProfile();
      setActiveOfferService(null);
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error al enviar la oferta.');
    } finally {
      setSubmitting(null);
    }
  };

  // 8 categorías oficiales del Marketplace
  const categories = [
    'Todas',
    'Limpieza',
    'Planchado',
    'Pintura',
    'Mudanzas y Furgonetas',
    'Adultos Mayores',
    'Cuidado de Niños',
    'Manitas y Lampistería',
    'Mensajería'
  ];

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
    } catch (err) {
      const errorObj = err as Error;
      setMessage({ type: 'error', text: errorObj.message || 'Error al actualizar el estado' });
    } finally {
      setUpdatingJobId(null);
    }
  };

  // Recarga Rápida de Créditos (4 € / crédito)
  const handleRechargeCredits = async (credits: number, amountEur: number) => {
    setRechargingCredits(credits);
    setMessage({ type: '', text: '' });
    try {
      const res = await rechargeCredits(credits, amountEur);
      setMessage({
        type: 'success',
        text: `¡Recarga completada! Has adquirido ${res.creditsAdded} créditos por ${res.amountPaidEur} €.`
      });
      await fetchProfile();
    } catch (err) {
      const errorObj = err as Error;
      setMessage({ type: 'error', text: errorObj.message || 'Error al recargar créditos.' });
    } finally {
      setRechargingCredits(null);
    }
  };

  // Manejo de Fotos Testimonio de Experiencia
  const handleExperienceFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files).slice(0, 4);
    setExperienceFiles(filesArray);

    expPreviews.forEach(p => URL.revokeObjectURL(p));
    const newPreviews = filesArray.map(f => URL.createObjectURL(f));
    setExpPreviews(newPreviews);
  };

  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !duration.trim() || !period.trim() || !expDescription.trim()) {
      alert('Por favor completa todos los campos de la experiencia laboral.');
      return;
    }

    setSavingExp(true);
    try {
      const formData = new FormData();
      formData.append('companyName', companyName.trim());
      formData.append('duration', duration.trim());
      formData.append('period', period.trim());
      formData.append('description', expDescription.trim());
      experienceFiles.forEach(f => {
        formData.append('photos', f);
      });

      await addProviderExperience(formData);
      setMessage({ type: 'success', text: '¡Nueva experiencia laboral añadida con éxito!' });
      setCompanyName('');
      setDuration('');
      setPeriod('');
      setExpDescription('');
      setExperienceFiles([]);
      expPreviews.forEach(p => URL.revokeObjectURL(p));
      setExpPreviews([]);
      if (expFileInputRef.current) expFileInputRef.current.value = '';
      await fetchProfile();
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error al guardar la experiencia.');
    } finally {
      setSavingExp(false);
    }
  };

  // Manejo de Foto de Perfil (Avatar)
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveAvatar = async () => {
    if (!avatarFile) return;
    setSavingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const res = await updateProfileAvatar(formData);
      setMessage({ type: 'success', text: '¡Foto de perfil actualizada correctamente!' });
      if (res.user.avatarUrl) {
        setUserProfile(prev => (prev ? { ...prev, avatarUrl: res.user.avatarUrl ?? null } : null));
      }
      setAvatarFile(null);
    } catch (err) {
      const errorObj = err as Error;
      alert(errorObj.message || 'Error al actualizar foto de perfil.');
    } finally {
      setSavingAvatar(false);
    }
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

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Badge Rápido de Créditos */}
          <button
            onClick={() => setPanelView('credits')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black shadow-sm hover:bg-amber-100 transition-all cursor-pointer"
            title="Ver saldo y recargas"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-600">account_balance_wallet</span>
            <span>{availableCredits} Cr.</span>
          </button>

          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-slate-400 font-medium">Técnico Certificado</p>
            <p className="text-xs font-bold text-on-surface truncate max-w-[140px]">{friendlyName}</p>
          </div>

          {/* Avatar o Inicial */}
          {userProfile?.avatarUrl ? (
            <img
              src={userProfile.avatarUrl}
              alt={friendlyName}
              className="w-9 h-9 rounded-full object-cover border border-[#88C1E0] shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#eaf4fa] text-[#1b4965] flex items-center justify-center font-bold text-sm shadow-sm border border-[#eaf4fa]">
              {initialLetter}
            </div>
          )}

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

        {/* View Switcher: 4 Tabs Oficiales del Técnico */}
        <div className="flex p-1 bg-surface-container rounded-full w-full overflow-x-auto no-scrollbar">
          <button
            onClick={() => setPanelView('feed')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              panelView === 'feed'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">dynamic_feed</span>
            Oportunidades ({services.length})
          </button>

          <button
            onClick={() => setPanelView('my-jobs')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              panelView === 'my-jobs'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">handshake</span>
            Mis Trabajos ({jobs.filter(j => j.status !== 'COMPLETED').length})
          </button>

          <button
            onClick={() => setPanelView('credits')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              panelView === 'credits'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
            Billetera ({availableCredits})
          </button>

          <button
            onClick={() => setPanelView('profile')}
            className={`flex-1 py-2.5 px-3 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
              panelView === 'profile'
                ? 'bg-[#88C1E0] text-white shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">badge</span>
            Mi Perfil
          </button>
        </div>

        {/* Notificación global */}
        {message.text && (
          <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-error-container text-on-error-container'
          }`}>
            <span className="material-symbols-outlined text-[18px]">
              {message.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* -------------------- PESTAÑA: BILLETERA DE CRÉDITOS -------------------- */}
        {panelView === 'credits' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header de Billetera */}
            <div>
              <h3 className="text-xl font-heading font-extrabold text-on-surface">
                Billetera de Créditos de Postulación
              </h3>
              <p className="text-xs text-on-surface-variant">
                Administra tus créditos para enviar presupuestos a clientes en España (1 crédito = 4 €)
              </p>
            </div>

            {/* Tarjetas de Saldo Actual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                    Créditos Disponibles
                  </span>
                  <span className="material-symbols-outlined text-[24px] text-emerald-200">bolt</span>
                </div>
                <div className="text-4xl font-black">{availableCredits}</div>
                <p className="text-xs text-emerald-100 mt-2">
                  Equivalente a <strong>{availableCredits * 4} € EUR</strong> de saldo disponible para postularte.
                </p>
              </div>

              <div className="bg-gradient-to-br from-secondary to-blue-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                    Créditos Retenidos en Ofertas
                  </span>
                  <span className="material-symbols-outlined text-[24px] text-blue-200">lock_clock</span>
                </div>
                <div className="text-4xl font-black">{frozenCredits}</div>
                <p className="text-xs text-blue-200 mt-2">
                  Retenidos en ofertas pendientes de respuesta por parte del cliente.
                </p>
              </div>
            </div>

            {/* Banner Informativo de Garantía de Devolución */}
            <div className="p-4 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
              <span className="material-symbols-outlined text-[24px] text-amber-600 shrink-0 mt-0.5">
                verified
              </span>
              <div className="text-xs text-amber-950 space-y-1">
                <h4 className="font-extrabold uppercase tracking-wide text-amber-900">
                  ¿Cómo funciona la devolución automática de créditos?
                </h4>
                <p className="leading-relaxed">
                  Cada postulación reserva <strong>1 crédito (4 €)</strong>. Si el cliente elige a otro profesional o cancela la solicitud, tu crédito <strong>se devuelve automáticamente a tu saldo disponible</strong>. Solo consumes tu crédito de forma definitiva si el cliente acepta tu propuesta y ganas el trabajo.
                </p>
              </div>
            </div>

            {/* Tarjetas de Recarga Rápida */}
            <div className="space-y-3">
              <h4 className="text-sm font-black uppercase tracking-wider text-on-surface">
                Comprar Paquetes de Créditos
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Paquete Básico */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                      Paquete Básico
                    </span>
                    <h5 className="text-2xl font-black text-on-surface">3 Créditos</h5>
                    <p className="text-xs text-slate-500">Ideal para empezar y postular a 3 solicitudes.</p>
                    <div className="text-xl font-extrabold text-secondary pt-2">12 € EUR</div>
                    <span className="text-[10px] text-slate-400 block">4 € por crédito</span>
                  </div>
                  <button
                    onClick={() => handleRechargeCredits(3, 12)}
                    disabled={rechargingCredits === 3}
                    className="w-full mt-4 py-3 rounded-2xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>{rechargingCredits === 3 ? 'Procesando...' : 'Recargar 12 €'}</span>
                  </button>
                </div>

                {/* Paquete Estándar (Popular) */}
                <div className="bg-white rounded-3xl p-5 border-2 border-[#88C1E0] shadow-md flex flex-col justify-between hover:shadow-lg transition-all relative">
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-brand-accent text-slate-900 text-[10px] font-black uppercase tracking-wider shadow">
                    Más Popular
                  </span>
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-[#eaf4fa] text-[#1b4965] text-[10px] font-bold uppercase tracking-wider">
                      Paquete Estándar
                    </span>
                    <h5 className="text-2xl font-black text-on-surface">5 Créditos</h5>
                    <p className="text-xs text-slate-500">Perfecto para una semana activa de trabajo.</p>
                    <div className="text-xl font-extrabold text-secondary pt-2">20 € EUR</div>
                    <span className="text-[10px] text-slate-400 block">4 € por crédito</span>
                  </div>
                  <button
                    onClick={() => handleRechargeCredits(5, 20)}
                    disabled={rechargingCredits === 5}
                    className="w-full mt-4 py-3 rounded-2xl bg-[#88C1E0] hover:bg-[#72b2d4] text-slate-900 font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>{rechargingCredits === 5 ? 'Procesando...' : 'Recargar 20 €'}</span>
                  </button>
                </div>

                {/* Paquete Pro */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider">
                      Paquete Pro
                    </span>
                    <h5 className="text-2xl font-black text-on-surface">10 Créditos</h5>
                    <p className="text-xs text-slate-500">Máxima autonomía para especialistas de alto volumen.</p>
                    <div className="text-xl font-extrabold text-secondary pt-2">40 € EUR</div>
                    <span className="text-[10px] text-slate-400 block">4 € por crédito</span>
                  </div>
                  <button
                    onClick={() => handleRechargeCredits(10, 40)}
                    disabled={rechargingCredits === 10}
                    className="w-full mt-4 py-3 rounded-2xl bg-secondary text-white font-bold text-xs shadow-md hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                    <span>{rechargingCredits === 10 ? 'Procesando...' : 'Recargar 40 €'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- PESTAÑA: MI PERFIL Y EXPERIENCIA -------------------- */}
        {panelView === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-heading font-extrabold text-on-surface">
                Mi Perfil y Experiencia Laboral
              </h3>
              <p className="text-xs text-on-surface-variant">
                Actualiza tu foto de perfil y añade experiencias con fotos de testimonio para generar confianza ante los clientes
              </p>
            </div>

            {/* Sección de Foto de Perfil */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-secondary">account_circle</span>
                Foto de Perfil Profesional
              </h4>

              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#88C1E0] shadow-md"
                    />
                  ) : userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-2 border-[#88C1E0] shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#eaf4fa] text-[#1b4965] flex items-center justify-center font-bold text-3xl shadow-inner border border-[#88C1E0]">
                      {initialLetter}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-center sm:text-left">
                  <p className="text-xs text-slate-600">
                    Sube una foto clara de tu rostro o logotipo de tu empresa (JPG, PNG o WEBP, máx 5 MB).
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      Seleccionar Foto
                    </button>

                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleSaveAvatar}
                        disabled={savingAvatar}
                        className="px-4 py-2 rounded-xl bg-secondary hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                        {savingAvatar ? 'Guardando...' : 'Guardar Foto'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario Dinámico: Añadir Experiencia Laboral */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-secondary">work_history</span>
                  Añadir Experiencia Laboral
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registra empresas donde has trabajado o tus años como autónomo con fotos de respaldo
                </p>
              </div>

              <form onSubmit={handleAddExperience} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                      Empresa o Modalidad *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Autónomo / Empresa SL"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                      Tiempo de Duración *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 2 años y medio"
                      value={duration}
                      onChange={e => setDuration(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                      Periodo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. 2022 - 2024"
                      value={period}
                      onChange={e => setPeriod(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-secondary"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Descripción de las Labores Realizadas *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Detalla los trabajos realizados, tipos de reformas o especialidades..."
                    value={expDescription}
                    onChange={e => setExpDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:ring-2 focus:ring-secondary resize-none"
                  />
                </div>

                {/* Subida de Fotos Testimonio (Hasta 4) */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                    Fotos de Testimonio de Trabajos (Hasta 4 fotos)
                  </label>
                  <input
                    ref={expFileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleExperienceFilesChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => expFileInputRef.current?.click()}
                    className="w-full py-3 px-4 border-2 border-dashed border-slate-200 hover:border-secondary rounded-2xl text-slate-600 hover:text-secondary text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">add_photo_alternate</span>
                    <span>Seleccionar hasta 4 fotos de trabajos realizados</span>
                  </button>

                  {expPreviews.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      {expPreviews.map((p, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                          <img src={p} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={savingExp}
                  className="w-full py-3.5 rounded-2xl bg-brand-accent hover:bg-[#e6b000] text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>{savingExp ? 'Guardando experiencia...' : 'Guardar Experiencia Laboral'}</span>
                </button>
              </form>
            </div>

            {/* Listado de Experiencias Guardadas */}
            <div className="space-y-4">
              <h4 className="text-sm font-black uppercase tracking-wider text-slate-800">
                Portafolio de Experiencias Registradas ({userProfile?.experiences?.length || 0})
              </h4>

              {(!userProfile?.experiences || userProfile.experiences.length === 0) ? (
                <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                    <span className="material-symbols-outlined text-[24px]">work_outline</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-700">Aún no has registrado experiencias</h5>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    Añade tus trabajos realizados para que los clientes vean fotos de tu labor antes de contratarte.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userProfile.experiences.map((exp: ProviderExperience) => {
                    const photos = parsePhotos(exp.testimonyPhotos);
                    return (
                      <div
                        key={exp.id}
                        className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">
                              {exp.period} • {exp.duration}
                            </span>
                            <h5 className="text-base font-extrabold text-slate-900">{exp.companyName}</h5>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                            Verificado
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl">
                          {exp.description}
                        </p>

                        {photos.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Fotos Testimonio del Trabajo
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {photos.map((photoUrl, pIdx) => (
                                <a
                                  key={pIdx}
                                  href={photoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="block h-24 rounded-xl overflow-hidden border border-slate-200 hover:opacity-90 transition-opacity"
                                >
                                  <img
                                    src={photoUrl}
                                    alt={`Trabajo ${pIdx + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------------------- PESTAÑA: MIS TRABAJOS GANADOS -------------------- */}
        {panelView === 'my-jobs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
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
                  const clientName = job.client?.fullName || clientEmail.split('@')[0];
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
                          href={job.client?.phone ? `https://wa.me/${job.client.phone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(clientName)},%20soy%20el%20técnico%20de%20ListoApp%20asignado%20para%20tu%20solicitud%20${encodeURIComponent(job.title)}` : `https://wa.me/?text=Hola%20${encodeURIComponent(clientName)},%20soy%20el%20técnico%20de%20ListoApp%20asignado%20para%20tu%20solicitud%20${encodeURIComponent(job.title)}`}
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
        )}

        {/* -------------------- PESTAÑA: FEED DE OPORTUNIDADES -------------------- */}
        {panelView === 'feed' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Gamification Level Card */}
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

            {/* Metrics Overview Bar */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-[22px] mb-1">bolt</span>
                <div className="text-xl font-black text-on-surface">{services.length}</div>
                <div className="text-[11px] text-on-surface-variant font-medium">Disponibles</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-secondary text-[22px] mb-1">send</span>
                <div className="text-xl font-black text-on-surface">{myOffers.length}</div>
                <div className="text-[11px] text-on-surface-variant font-medium">Ofertas Enviadas</div>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-4 text-center shadow-sm border border-surface-container">
                <span className="material-symbols-outlined text-amber-500 text-[22px] mb-1">star</span>
                <div className="text-xl font-black text-on-surface">{userRating.toFixed(1)}</div>
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
                                  : service.category?.toLowerCase().includes('planchado')
                                  ? 'iron'
                                  : service.category?.toLowerCase().includes('pintura')
                                  ? 'format_paint'
                                  : service.category?.toLowerCase().includes('mudanza')
                                  ? 'local_shipping'
                                  : service.category?.toLowerCase().includes('adulto')
                                  ? 'elderly'
                                  : service.category?.toLowerCase().includes('niño')
                                  ? 'child_care'
                                  : service.category?.toLowerCase().includes('mensajer')
                                  ? 'package_2'
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
                        <span>Enviar Oferta Exprés (1 Crédito)</span>
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
              {/* Saldo de Créditos Informativo */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">bolt</span>
                  Saldo disponible: {availableCredits} créditos
                </span>
                <span className="text-[10px] bg-emerald-200/80 px-2 py-0.5 rounded-full font-bold">
                  Reserva: 1 crédito
                </span>
              </div>

              {/* Precio Propuesto en Euros */}
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tu Precio Propuesto (€ EUR) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-on-surface-variant font-bold">€</span>
                  <input
                    type="number"
                    min="10"
                    step="1"
                    required
                    value={quickPrice}
                    onChange={(e) => setQuickPrice(e.target.value)}
                    placeholder="45"
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
                  placeholder="Ej. Cuento con total disponibilidad y herramientas profesionales..."
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
                  Acepto reservar 1 crédito de postulación (4 €) y cumplir puntualmente con los estándares de calidad de ListoApp.
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

      {/* Bottom Navigation Bar Fija para Técnico */}
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
            onClick={() => setPanelView('my-jobs')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              panelView === 'my-jobs' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">handshake</span>
            <span className="text-[10px]">Mis Trabajos</span>
          </button>

          <button
            onClick={() => setPanelView('credits')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              panelView === 'credits' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">account_balance_wallet</span>
            <span className="text-[10px]">Billetera</span>
          </button>

          <button
            onClick={() => setPanelView('profile')}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              panelView === 'profile' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">badge</span>
            <span className="text-[10px]">Mi Perfil</span>
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
