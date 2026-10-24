import { useState, useRef } from 'react';
import { createServiceRequest } from '../services/api.service';
import MyRequests from './MyRequests';
import WindowQuoteModal from './WindowQuoteModal';

export default function CreateRequest({ onLogout }: { onLogout: () => void }) {
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
  const [step, setStep] = useState<number>(1);

  // Form Wizard State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Limpieza',
    priceSuggested: '85000',
    description: '',
    location: 'Bogotá, D.C.'
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [refreshRequests, setRefreshRequests] = useState(0);

  const categories = [
    { id: 'Limpieza', label: 'Limpieza', icon: 'cleaning_services', desc: 'Hogar y oficinas' },
    { id: 'Aluminio', label: 'Aluminio', icon: 'window', desc: 'Puertas y ventanas' },
    { id: 'Persianas', label: 'Persianas', icon: 'blinds', desc: 'Instalación y arreglo' },
    { id: 'Cristalería', label: 'Cristalería', icon: 'countertops', desc: 'Mamparas y espejos' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.title.trim()) {
        setMessage({ type: 'error', text: 'Por favor ingresa un título descriptivo para la solicitud.' });
        return;
      }
      setMessage({ type: '', text: '' });
      setStep(2);
    } else if (step === 2) {
      if (!formData.description.trim()) {
        setMessage({ type: 'error', text: 'Por favor proporciona los detalles de lo que requieres.' });
        return;
      }
      setMessage({ type: '', text: '' });
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setMessage({ type: '', text: '' });
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await createServiceRequest({
        title: formData.title,
        description: `${formData.description} (Ubicación: ${formData.location})`,
        category: formData.category,
        priceSuggested: parseFloat(formData.priceSuggested) || 85000
      });
      setMessage({ type: 'success', text: '¡Solicitud publicada exitosamente!' });
      setFormData({
        title: '',
        category: 'Limpieza',
        priceSuggested: '85000',
        description: '',
        location: 'Bogotá, D.C.'
      });
      setImagePreview(null);
      setRefreshRequests(prev => prev + 1);
      // Tras publicar, cambiar a ver Mis Solicitudes
      setTimeout(() => {
        setStep(1);
        setActiveTab('requests');
      }, 1200);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error al publicar la solicitud.' });
    } finally {
      setLoading(false);
    }
  };

  // Nombre amigable del usuario
  const email = localStorage.getItem('email') || '';
  const friendlyName = email ? email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1) : 'Cliente';
  const initialLetter = friendlyName.charAt(0);

  return (
    <div className="w-full max-w-2xl min-h-screen bg-surface flex flex-col justify-between pb-28 pt-2 px-4 sm:px-0">
      
      {/* Top Header App Shell */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl py-3 border-b border-surface-container flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[20px]">architecture</span>
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-on-surface">
              Listo<span className="text-secondary font-black">App</span>
            </h1>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Módulo Cliente</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-[11px] text-on-surface-variant font-medium">Conectado como</p>
            <p className="text-xs font-bold text-on-surface">{friendlyName}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shadow-sm border border-secondary-container">
            {initialLetter}
          </div>
          <button
            onClick={onLogout}
            className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface transition-colors cursor-pointer"
            title="Cerrar Sesión"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* Main Tab Controller (Crear vs Mis Solicitudes) */}
      <div className="pt-4 space-y-5">
        <div className="flex p-1 bg-surface-container rounded-full w-full">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'create'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">edit_square</span>
            Crear Solicitud
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-2.5 px-4 rounded-full text-xs font-bold transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            Mis Solicitudes y Ofertas
          </button>
        </div>

        {activeTab === 'create' ? (
          <div className="space-y-6">
            {/* Greeting Hero Stitch */}
            <div className="relative overflow-hidden bg-primary-container text-white rounded-3xl p-6 shadow-xl">
              <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-secondary/30 rounded-full blur-2xl pointer-events-none"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <div className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                    <span className="material-symbols-outlined text-[14px]">home_repair_service</span>
                    ListoApp Concierge
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">¡Hola, {friendlyName}! 👋</h2>
                  <p className="text-xs text-slate-300 mt-1">¿Qué espacio de tu hogar renovamos hoy?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowWindowModal(true)}
                  className="px-3.5 py-2 rounded-2xl bg-secondary hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]">architecture</span>
                  <span className="hidden sm:inline">Cotizador</span> Ventanas
                </button>
              </div>
            </div>

            {/* Wizard Form Container */}
            <div className="bg-surface-container-low rounded-3xl p-6 shadow-sm border border-surface-container">
              
              {/* Wizard Progress Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-container">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">playlist_add_check</span>
                  <div>
                    <h3 className="font-extrabold text-base text-on-surface">Asistente de Solicitud</h3>
                    <p className="text-xs text-on-surface-variant">Publica en 3 pasos para recibir ofertas de técnicos</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                        step === s
                          ? 'bg-secondary text-white shadow-sm scale-110'
                          : step > s
                          ? 'bg-emerald-500 text-white'
                          : 'bg-surface-container text-on-surface-variant'
                      }`}
                    >
                      {step > s ? '✓' : s}
                    </div>
                  ))}
                </div>
              </div>

              {message.text && (
                <div className={`p-3.5 mb-4 rounded-2xl text-xs font-bold ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-error-container text-on-error-container'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Paso 1: Selección de Categoría y Título */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                        Paso 1: Selecciona la Categoría del Servicio
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((cat) => (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setFormData(prev => ({ ...prev, category: cat.id }));
                              if (!formData.title) {
                                setFormData(prev => ({ ...prev, title: `Servicio de ${cat.label} Residencial` }));
                              }
                            }}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                              formData.category === cat.id
                                ? 'bg-primary text-on-primary border-primary shadow-sm'
                                : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-high'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                            <div>
                              <p className="text-xs font-bold">{cat.label}</p>
                              <p className={`text-[10px] ${formData.category === cat.id ? 'text-slate-300' : 'text-on-surface-variant'}`}>{cat.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                        Título Descriptivo
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Ej. Limpieza a fondo de Apartamento 2 habitaciones"
                        className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Paso 2: Detalles del Servicio y Carga de Fotos */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                        Paso 2: Describe lo que necesitas
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Detalla las zonas, condiciones particulares, si hay mascotas o accesibilidad..."
                        className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary resize-none shadow-sm"
                      />
                    </div>

                    {/* Presupuesto Sugerido */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                        Presupuesto Sugerido ($ COP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3.5 text-on-surface-variant font-bold">$</span>
                        <input
                          type="number"
                          required
                          min="1000"
                          value={formData.priceSuggested}
                          onChange={(e) => setFormData(prev => ({ ...prev, priceSuggested: e.target.value }))}
                          className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 pl-8 text-sm font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                        />
                      </div>
                      <p className="text-[11px] text-outline mt-1">Los técnicos podrán ofertar un monto igual, superior o inferior.</p>
                    </div>

                    {/* Carga de Imágenes con Vista Previa Inmediata */}
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                        Fotos del Espacio / Requerimiento (Opcional)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      {imagePreview ? (
                        <div className="relative rounded-2xl overflow-hidden border border-surface-container max-h-48">
                          <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 cursor-pointer hover:bg-slate-900"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-surface-container hover:border-secondary text-on-surface-variant hover:text-secondary text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer bg-surface-container-lowest"
                        >
                          <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                          <span>Adjuntar foto con vista previa</span>
                        </button>
                      )}
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-3 rounded-full bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer"
                      >
                        Atrás
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center gap-2 shadow-md hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
                      >
                        <span>Siguiente</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Paso 3: Ubicación y Confirmación */}
                {step === 3 && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                        Paso 3: Ubicación del Servicio
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3.5 top-3.5">location_on</span>
                        <input
                          type="text"
                          required
                          value={formData.location}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Ej. Calle 93 #15-42, Bogotá"
                          className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 pl-10 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                        />
                      </div>
                    </div>

                    {/* Resumen de la Solicitud */}
                    <div className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container space-y-2">
                      <h4 className="text-xs font-black uppercase text-secondary tracking-wider">Resumen de tu Solicitud</h4>
                      <p className="text-sm font-extrabold text-on-surface">{formData.title}</p>
                      <div className="flex flex-wrap gap-2 text-xs text-on-surface-variant">
                        <span className="px-2 py-0.5 rounded-md bg-surface-container">Categoría: {formData.category}</span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container">Sugerido: ${Number(formData.priceSuggested).toLocaleString('es-CO')} COP</span>
                      </div>
                      <p className="text-xs text-on-surface-variant italic pt-1 border-t border-surface-container">
                        "{formData.description}"
                      </p>
                    </div>

                    {/* Garantía ListoApp */}
                    <div className="bg-surface-container p-4 rounded-2xl flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-[22px] mt-0.5">verified_user</span>
                      <div>
                        <h5 className="text-xs font-bold text-on-surface">Garantía ListoApp Pro</h5>
                        <p className="text-[11px] text-on-surface-variant">Técnicos verificados, soporte en línea y tarifas protegidas.</p>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="px-5 py-3 rounded-full bg-surface-container text-on-surface font-bold text-xs hover:bg-surface-container-high transition-all cursor-pointer"
                      >
                        Atrás
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3.5 rounded-full bg-secondary text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                        <span>{loading ? 'Publicando...' : 'Publicar Solicitud'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : (
          <MyRequests refreshTrigger={refreshRequests} />
        )}
      </div>

      {/* Bottom Navigation Bar Fija (App Shell Stitch) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface/95 backdrop-blur-xl border-t border-surface-container shadow-2xl max-w-2xl mx-auto pb-safe">
        <div className="flex justify-around items-center h-18 px-4">
          <button
            onClick={() => { setActiveTab('create'); }}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              activeTab === 'create' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">home</span>
            <span className="text-[10px]">Inicio</span>
          </button>

          <button
            onClick={() => { setActiveTab('requests'); }}
            className={`flex flex-col items-center justify-center gap-1 w-16 h-14 transition-all cursor-pointer ${
              activeTab === 'requests' ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">assignment</span>
            <span className="text-[10px]">Solicitudes</span>
          </button>

          <button
            onClick={() => setShowWindowModal(true)}
            className="flex flex-col items-center justify-center gap-1 w-16 h-14 text-secondary hover:text-blue-700 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[24px]">architecture</span>
            <span className="text-[10px] font-bold">Cotizador</span>
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

      <WindowQuoteModal open={showWindowModal} onClose={() => setShowWindowModal(false)} />
    </div>
  );
}
