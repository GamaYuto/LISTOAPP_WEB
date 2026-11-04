import { useState } from 'react';
import WindowQuoteModal from '../components/WindowQuoteModal';
import ListoLogo from '../components/ui/ListoLogo';

export default function HomePublic({ setView }: { setView: (view: any) => void }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const categories = [
    {
      id: 'aluminio',
      name: 'Carpintería de Aluminio',
      shortName: 'Aluminio',
      desc: 'Puertas, ventanas y cerramientos a medida',
      icon: 'window',
      color: 'bg-[#001F3F]/10 text-[#001F3F]',
      action: () => setIsQuoteModalOpen(true),
      tag: 'Express'
    },
    {
      id: 'limpieza',
      name: 'Limpieza de Hogar',
      shortName: 'Limpieza',
      desc: 'Hogar, oficinas y desinfección profunda',
      icon: 'cleaning_services',
      color: 'bg-emerald-50 text-emerald-700',
      action: () => setView('login'),
      tag: '10% OFF'
    },
    {
      id: 'persianas',
      name: 'Persianas y Motores',
      shortName: 'Persianas',
      desc: 'Instalación, cambio de cintas y motorización',
      icon: 'blinds',
      color: 'bg-amber-50 text-amber-800',
      action: () => setView('login'),
      tag: 'Popular'
    },
    {
      id: 'cristaleria',
      name: 'Mamparas y Cristalería',
      shortName: 'Cristalería',
      desc: 'Mamparas de baño, espejos y vidrio templado',
      icon: 'countertops',
      color: 'bg-[#001F3F]/10 text-[#001F3F]',
      action: () => setIsQuoteModalOpen(true),
      tag: 'Garantía'
    },
  ];

  const features = [
    {
      icon: 'verified_user',
      title: 'Técnicos Verificados',
      desc: 'Profesionales calificados y evaluados por clientes reales en España.'
    },
    {
      icon: 'bolt',
      title: 'Respuesta Inmediata',
      desc: 'Recibe cotizaciones y propuestas directas en menos de 15 minutos.'
    },
    {
      icon: 'price_check',
      title: 'Precios Claros en Euros',
      desc: 'Sin sorpresas ni cargos ocultos. Transparencia y garantía de inicio a fin.'
    }
  ];

  return (
    <div className="min-h-screen bg-brand-white font-sans text-brand-dark flex flex-col">
      {/* App Shell Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-container">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListoLogo size="md" variant="color" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-heading font-semibold rounded-full bg-[#001F3F]/10 text-[#001F3F]">
              España · Hogar & Servicios
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-heading font-semibold text-[#001F3F] bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">architecture</span>
              Cotizador Rápido
            </button>
            <button
              onClick={() => setView('login')}
              className="px-5 py-2 rounded-full text-xs font-heading font-semibold bg-[#001F3F] text-white hover:bg-[#082D59] transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-8">
        {/* Welcome Greeting Banner (Azul Profundo de Marca con Alto Contraste y Acciones en Oro) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#082D59] to-[#0A4B82] text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-900/40">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="font-heading text-amber-300">Plataforma Oficial de Servicios</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight leading-tight text-white">
                ¿Qué espacio de tu hogar <span className="text-brand-accent drop-shadow">renovamos hoy?</span>
              </h1>
              <p className="text-sm md:text-base text-slate-200 font-normal leading-relaxed">
                Soluciones expertas en cristalería, carpintería de aluminio y mantenimiento en España. Conecta con técnicos calificados al instante.
              </p>
            </div>

            {/* CTAs con Alto Contraste */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-6 py-3.5 rounded-2xl bg-brand-accent text-slate-900 font-heading font-bold text-sm shadow-lg hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">architecture</span>
                Cotizar Ventana
              </button>
              <button
                onClick={() => setView('register')}
                className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-heading font-semibold text-sm border border-white/30 backdrop-blur-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Registrarme Gratis
              </button>
            </div>
          </div>
        </div>

        {/* Promotional Banner (Tarjeta de Oferta de Bienvenida con Alto Contraste) */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-[#0B1E36] to-[#001F3F] text-white rounded-3xl p-5 md:p-6 shadow-lg border border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-accent text-slate-900 flex items-center justify-center shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[26px]">local_offer</span>
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-accent">Oferta Especial de Bienvenida</span>
              <h2 className="text-lg md:text-xl font-bold text-white">10% OFF en tu primer servicio</h2>
              <p className="text-xs text-slate-300 font-normal">Publica tu requerimiento y obtén descuento inmediato con los mejores técnicos en España.</p>
            </div>
          </div>
          <button
            onClick={() => setView('login')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-brand-accent text-slate-900 text-xs font-bold shadow-md hover:bg-amber-300 active:scale-95 transition-transform shrink-0 cursor-pointer text-center"
          >
            Aprovechar Descuento
          </button>
        </div>

        {/* Quick Access Services Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">Servicios Principales</h2>
              <p className="text-xs text-on-surface-variant">Selecciona una categoría para iniciar o cotizar</p>
            </div>
            <button
              onClick={() => setView('login')}
              className="text-xs font-bold text-[#001F3F] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver todos <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                onClick={cat.action}
                className="group relative cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 rounded-3xl p-5 shadow-sm hover:shadow-md border border-surface-container flex flex-col justify-between overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${cat.color}`}>
                    <span className="material-symbols-outlined text-[26px]">{cat.icon}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                    {cat.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-sm md:text-base text-on-surface mb-1 group-hover:text-secondary transition-colors">
                    {cat.shortName}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-[#001F3F]">
                  <span>Explorar</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick CTA Card: Cotizador Express de Ventanas con Alto Contraste y Claridad */}
        <div
          onClick={() => setIsQuoteModalOpen(true)}
          className="cursor-pointer bg-gradient-to-r from-[#001F3F] via-[#0A2E5C] to-[#0A4B82] text-white rounded-3xl p-6 shadow-xl border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-2xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-brand-accent flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-[30px] text-brand-accent">straighten</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent inline-block mb-0.5">Calculadora Express en Euros (€)</span>
              <h3 className="text-xl md:text-2xl font-black text-white">Cotizador Personalizado de Ventanas</h3>
              <p className="text-xs text-slate-200 mt-0.5 font-normal">Ingresa medidas (alto x ancho), tipo de perfil y recibe un presupuesto exacto en € con envío a WhatsApp.</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-accent text-slate-900 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </div>
        </div>

        {/* Platform Trust Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {features.map((feat, idx) => (
            <div key={idx} className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-[#001F3F]/10 text-[#001F3F] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">{feat.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-sm text-on-surface">{feat.title}</h4>
                <p className="text-xs text-on-surface-variant mt-0.5">{feat.desc}</p>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-container bg-surface-container-lowest py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <ListoLogo size="sm" variant="color" />
            <span>&copy; {new Date().getFullYear()} ListoApp España. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos de Servicio</a>
            <a href="#" className="hover:underline">Soporte</a>
          </div>
        </div>
      </footer>

      {/* Modal de Cotización de Ventanas */}
      <WindowQuoteModal
        open={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </div>
  );
}
