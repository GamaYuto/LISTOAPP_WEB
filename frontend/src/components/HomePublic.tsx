import { useState } from 'react';
import WindowQuoteModal from './WindowQuoteModal';

export default function HomePublic({ setView }: { setView: (view: any) => void }) {
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  const services = [
    { name: 'Limpieza de Hogar', icon: '✨', desc: 'Limpieza profunda y mantenimiento para tu hogar.' },
    { name: 'Carpintería de Aluminio', icon: '🚪', desc: 'Ventanas, puertas y cerramientos de alta calidad.' },
    { name: 'Persianas y Motorización', icon: '🪟', desc: 'Instalación y reparación de persianas manuales o a motor.' },
    { name: 'Mamparas y Cristalería', icon: '🚿', desc: 'Mamparas de baño a medida y trabajos en cristal.' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-brand-primary-bg rounded-xl flex items-center justify-center text-brand-primary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold tracking-tight">Listo<span className="text-brand-accent">App</span></span>
          </div>
          <nav className="hidden md:flex gap-6 font-medium text-slate-600">
            <a href="#servicios" className="hover:text-brand-primary transition">Servicios</a>
            <a href="#contacto" className="hover:text-brand-primary transition">Contacto</a>
          </nav>
          <button 
            onClick={() => setView('login')}
            className="rounded-full bg-brand-primary px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary-dark hover:-translate-y-0.5"
          >
            Iniciar Sesión / Acceso
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden">
        {/* Background Decorative */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-primary via-slate-900 to-slate-900"></div>
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              Soluciones expertas para tu hogar al <span className="text-brand-accent">instante</span>.
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl">
              Desde limpieza profunda hasta carpintería de aluminio. Encuentra a los mejores profesionales en un solo lugar y solicita cotizaciones en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start">
              <button 
                onClick={() => setView('register')}
                className="rounded-full bg-brand-accent px-8 py-4 text-base font-bold text-slate-900 shadow-xl shadow-brand-accent/20 transition hover:scale-105"
              >
                Regístrate Gratis
              </button>
              <button 
                onClick={() => setIsQuoteModalOpen(true)}
                className="rounded-full bg-white/10 backdrop-blur border border-white/20 px-8 py-4 text-base font-bold text-white transition hover:bg-white/20"
              >
                Cotizar Ventana Rápido
              </button>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md relative">
            <div className="absolute inset-0 bg-brand-primary rounded-full blur-3xl opacity-20 animate-pulse"></div>
            <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800" alt="Hogar Impecable" className="rounded-3xl shadow-2xl relative z-10 border-4 border-white/10 object-cover h-[400px] w-full" />
          </div>
        </div>
      </section>

      {/* Promos / Banners Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full -mt-10 relative z-20">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Banner 1 */}
          <div 
            onClick={() => setView('login')}
            className="group cursor-pointer bg-gradient-to-r from-brand-accent to-yellow-300 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden relative"
          >
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-slate-900/10 text-slate-900 font-bold text-xs rounded-full uppercase tracking-wider mb-2">Oferta Exclusiva</span>
              <h3 className="text-3xl font-black text-slate-900 leading-tight">10% Descuento Especial</h3>
              <p className="text-slate-800 font-medium mt-2 mb-6">En tu primera solicitud de limpieza de hogar profunda.</p>
              <span className="inline-flex items-center gap-2 text-slate-900 font-bold group-hover:underline">
                Contratar ahora <span className="text-xl">→</span>
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 rotate-12 transition group-hover:rotate-0">✨</div>
          </div>

          {/* Banner 2 */}
          <div 
            onClick={() => setIsQuoteModalOpen(true)}
            className="group cursor-pointer bg-gradient-to-r from-brand-primary to-blue-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 overflow-hidden relative"
          >
            <div className="relative z-10 text-white">
              <span className="inline-block px-3 py-1 bg-white/20 font-bold text-xs rounded-full uppercase tracking-wider mb-2">Presupuesto sin compromiso</span>
              <h3 className="text-3xl font-black leading-tight">Solicita tu Ventana</h3>
              <p className="text-blue-100 font-medium mt-2 mb-6">Cotiza carpintería de aluminio directo por WhatsApp.</p>
              <span className="inline-flex items-center gap-2 font-bold group-hover:underline">
                Empezar cotización <span className="text-xl">→</span>
              </span>
            </div>
            <div className="absolute -right-4 -bottom-4 text-9xl opacity-20 -rotate-12 transition group-hover:rotate-0">🪟</div>
          </div>
        </div>
      </section>

      {/* Services Catalog */}
      <section id="servicios" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900">Catálogo de Servicios</h2>
            <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Nuestros expertos están listos para atender cualquier necesidad de tu hogar o negocio con la mejor calidad y rapidez.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(srv => (
              <div key={srv.name} className="p-6 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{srv.icon}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{srv.name}</h3>
                <p className="text-sm text-slate-500">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contacto" className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6 text-brand-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
              </svg>
              <span className="text-xl font-extrabold tracking-tight">Listo<span className="text-brand-accent">App</span></span>
            </div>
            <p className="text-sm">Conectando hogares con soluciones rápidas y efectivas. Tu aliado de confianza.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>📞 +34 611 23 69 88</li>
              <li>✉️ info@listoapp.com</li>
              <li>📍 Madrid, España</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('login')} className="hover:text-brand-accent transition">Acceso Profesionales</button></li>
              <li><button onClick={() => setView('register')} className="hover:text-brand-accent transition">Registrarse como Cliente</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-xs">
          © {new Date().getFullYear()} ListoApp. Todos los derechos reservados.
        </div>
      </footer>

      {/* Modal Independiente de Cotización */}
      <WindowQuoteModal open={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </div>
  );
}
