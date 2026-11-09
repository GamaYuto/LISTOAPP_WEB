import { useState } from 'react';
import WindowQuoteModal from '../components/WindowQuoteModal';
import ListoLogo from '../components/ui/ListoLogo';

interface HomePublicProps {
  setView: (view: 'home-public' | 'login' | 'register' | 'create-request' | 'dashboard-provider' | 'window-quotes-admin') => void;
}

export default function HomePublic({ setView }: HomePublicProps) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState<boolean>(false);
  const [selectedQuoteCategory, setSelectedQuoteCategory] = useState<string>('Carpintería de Aluminio y PVC');

  const openDirectQuote = (categoryName: string) => {
    setSelectedQuoteCategory(categoryName);
    setIsQuoteModalOpen(true);
  };

  // 4 Botones Principales de Cotización Directa (Express con PDF y WhatsApp)
  const directQuoteServices = [
    {
      id: 'aluminio-pvc',
      name: 'Carpintería de Aluminio y PVC',
      desc: 'Ventanas, puertas, cerramientos, persianas motorizadas y mosquiteras',
      icon: 'window',
      tag: 'Cotización Inmediata',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    },
    {
      id: 'mamparas',
      name: 'Mamparas de Baño',
      desc: 'Mamparas de baño a medida frontales y esquineras',
      icon: 'countertops',
      tag: 'A Medida',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    },
    {
      id: 'paleteria',
      name: 'Paletería y Reformas',
      desc: 'Reformas integrales de vivienda, remodelaciones y reparaciones',
      icon: 'construction',
      tag: 'Presupuesto Llave en Mano',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    },
    {
      id: 'climatizacion',
      name: 'Aires Acondicionados',
      desc: 'Instalación, mantenimiento preventivo y climatización',
      icon: 'ac_unit',
      tag: 'Garantía Oficial',
      badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    },
  ];

  // 8 Categorías Oficiales del Marketplace ListoApp
  const marketplaceCategories = [
    {
      id: 'limpieza',
      name: 'Limpieza de Hogares y Fin de Obra',
      desc: 'Hogares, empresas y limpiezas después de obra.',
      icon: 'cleaning_services',
    },
    {
      id: 'planchado',
      name: 'Planchado de Prendas',
      desc: 'Planchado doméstico por horas o lotes con entrega impecable.',
      icon: 'iron',
    },
    {
      id: 'pintura',
      name: 'Pintura General de Viviendas',
      desc: 'Pintura de interiores, pisos, habitaciones y fachadas.',
      icon: 'format_paint',
    },
    {
      id: 'mudanzas',
      name: 'Acarreos, Mudanzas y Furgonetas',
      desc: 'Furgonetas para mover material, compras grandes y mudanzas completas.',
      icon: 'local_shipping',
    },
    {
      id: 'cuidado-adultos',
      name: 'Cuidado de Adultos Mayores',
      desc: 'Asistencia, compañía y cuidados domiciliarios calificados.',
      icon: 'elderly',
    },
    {
      id: 'cuidado-ninos',
      name: 'Cuidado de Niños',
      desc: 'Cuidado infantil de confianza y apoyo en el hogar.',
      icon: 'child_care',
    },
    {
      id: 'manitas',
      name: 'Manitas y Lampistería',
      desc: 'Reparaciones del hogar, fontanería, cerrajería y electricidad.',
      icon: 'handyman',
    },
    {
      id: 'mensajeria',
      name: 'Mensajería Puerta a Puerta',
      desc: 'Envíos, compras y recados locales inmediatos punto a punto.',
      icon: 'package_2',
    },
  ];

  const features = [
    {
      icon: 'verified_user',
      title: 'Técnicos Verificados',
      desc: 'Profesionales calificados y evaluados por clientes reales en España.',
    },
    {
      icon: 'bolt',
      title: 'Respuesta Inmediata',
      desc: 'Recibe cotizaciones y propuestas directas en menos de 15 minutos.',
    },
    {
      icon: 'price_check',
      title: 'Precios Claros en Euros (€)',
      desc: 'Sin sorpresas ni cargos ocultos. Transparencia y garantía de inicio a fin.',
    },
  ];

  return (
    <div className="min-h-screen bg-brand-white font-sans text-brand-dark flex flex-col">
      {/* App Shell Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-surface-container">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListoLogo size="md" variant="color" />
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[11px] font-heading font-semibold rounded-full bg-[#001F3F]/10 text-[#001F3F]">
              España · Hogar & Reformas
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openDirectQuote('Carpintería de Aluminio y PVC')}
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
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-10">
        {/* Welcome Hero Banner */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#001F3F] via-[#082D59] to-[#0A4B82] text-white rounded-3xl p-6 md:p-10 shadow-xl border border-blue-900/40">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-md border border-white/20">
                <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
                <span className="font-heading text-amber-300">Plataforma Oficial de Servicios & Reformas</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-extrabold tracking-tight leading-tight text-white">
                ¿Qué espacio de tu hogar <span className="text-brand-accent drop-shadow">deseas renovar?</span>
              </h1>
              <p className="text-sm md:text-base text-slate-200 font-normal leading-relaxed">
                Cotiza al instante carpintería, mamparas, reformas o climatización con documento PDF oficial, o solicita profesionales verificados para tu hogar en España.
              </p>
            </div>

            {/* CTAs con Alto Contraste */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => openDirectQuote('Carpintería de Aluminio y PVC')}
                className="px-6 py-3.5 rounded-2xl bg-brand-accent text-slate-900 font-heading font-bold text-sm shadow-lg hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">architecture</span>
                Cotizar Directo
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

        {/* 1. SECCIÓN DE COTIZACIÓN DIRECTA (4 BOTONES PRINCIPALES) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-secondary px-2.5 py-0.5 rounded-full bg-secondary/10">
                  Cotizador Express con PDF
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-on-surface tracking-tight mt-1">
                Cotización Directa para tu Proyecto
              </h2>
              <p className="text-xs text-on-surface-variant">
                Obtén un presupuesto exacto en Euros con descarga de documento técnico y envío a WhatsApp
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {directQuoteServices.map((service) => (
              <div
                key={service.id}
                onClick={() => openDirectQuote(service.name)}
                className="group relative cursor-pointer bg-surface-container-lowest hover:bg-white transition-all duration-300 rounded-3xl p-5 shadow-sm hover:shadow-xl border border-surface-container hover:border-secondary/40 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#001F3F] text-brand-accent flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[26px]">{service.icon}</span>
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${service.badgeColor}`}>
                      {service.tag}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm md:text-base text-on-surface mb-1 group-hover:text-secondary transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed line-clamp-3">
                    {service.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-bold text-[#001F3F]">
                  <span>Cotizar ahora</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-brand-accent group-hover:text-slate-900 flex items-center justify-center transition-all">
                    <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 2. SECCIÓN MARKETPLACE (8 CATEGORÍAS OFICIALES) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
                  Técnicos & Profesionales Calificados
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-on-surface tracking-tight mt-1">
                Nuestros Servicios (Marketplace)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Publica tu solicitud o contrata profesionales con ofertas a medida
              </p>
            </div>
            <button
              onClick={() => setView('login')}
              className="text-xs font-bold text-[#001F3F] hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              Publicar solicitud <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {marketplaceCategories.map((cat) => (
              <div
                key={cat.id}
                onClick={() => setView('login')}
                className="group relative cursor-pointer bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-200 rounded-3xl p-5 shadow-sm hover:shadow-md border border-surface-container flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-surface-container text-secondary flex items-center justify-center mb-3 group-hover:bg-secondary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                  </div>
                  <h3 className="font-bold text-sm text-on-surface mb-1 group-hover:text-secondary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-surface-container flex items-center justify-between text-xs font-semibold text-on-surface-variant group-hover:text-on-surface">
                  <span>Solicitar técnico</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Banner Rápido al Cotizador de Ventanas */}
        <div
          onClick={() => openDirectQuote('Carpintería de Aluminio y PVC')}
          className="cursor-pointer bg-gradient-to-r from-[#001F3F] via-[#0A2E5C] to-[#0A4B82] text-white rounded-3xl p-6 shadow-xl border border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:shadow-2xl transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 text-brand-accent flex items-center justify-center shrink-0 backdrop-blur-md border border-white/20">
              <span className="material-symbols-outlined text-[30px] text-brand-accent">straighten</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-accent inline-block mb-0.5">Calculadora Express en Euros (€)</span>
              <h3 className="text-xl md:text-2xl font-black text-white">Cotizador Personalizado a Medida</h3>
              <p className="text-xs text-slate-200 mt-0.5 font-normal">Configura medidas, perfiles o estancias y recibe presupuesto formal en PDF con envío a WhatsApp.</p>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-brand-accent text-slate-900 flex items-center justify-center group-hover:scale-105 transition-all shrink-0 shadow-lg">
            <span className="material-symbols-outlined text-[24px]">arrow_forward</span>
          </div>
        </div>

        {/* Ventajas y Confianza */}
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
            <span>&copy; 2026 ListoApp es una marca operada por Golden System SAS. Todos los derechos reservados.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos de Servicio</a>
            <a href="#" className="hover:underline">Soporte</a>
          </div>
        </div>
      </footer>

      {/* Modal de Cotización Directa */}
      <WindowQuoteModal
        open={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        initialCategory={selectedQuoteCategory}
      />
    </div>
  );
}
