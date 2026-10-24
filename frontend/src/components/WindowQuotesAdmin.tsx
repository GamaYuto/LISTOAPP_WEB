import { useEffect, useState } from 'react';
import { exportWindowQuotesExcel, getWindowQuotes, updateWindowQuoteStatus } from '../services/api.service';

const statusOptions = [
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'QUOTED', label: 'Cotizadas' },
  { key: 'ACCEPTED', label: 'Aceptadas' },
  { key: 'REJECTED', label: 'Rechazadas' }
];

export default function WindowQuotesAdmin() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [filteredStatus, setFilteredStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      const data = await getWindowQuotes();
      setQuotes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar cotizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateWindowQuoteStatus(id, newStatus);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado');
    }
  };

  const handleExport = async () => {
    try {
      const blob = await exportWindowQuotesExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotizaciones-listoapp-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar a Excel');
    }
  };

  const parseDimensions = (dimensionsStr: string | null) => {
    if (!dimensionsStr) return [];
    try {
      const parsed = JSON.parse(dimensionsStr);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // not JSON
    }
    return [];
  };

  const filteredQuotes = quotes.filter(quote => quote.status === filteredStatus);

  return (
    <div className="w-full space-y-6">
      {/* Header con botón de exportación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-on-surface tracking-tight">
            Gestión de Cotizaciones de Ventanas
          </h2>
          <p className="text-xs text-on-surface-variant">
            Seguimiento de pedidos de carpintería y cristalería
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-5 py-2.5 rounded-full bg-secondary text-white text-xs font-bold shadow-md hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">file_download</span>
          <span>Exportar a Excel</span>
        </button>
      </div>

      {/* Tabs Píldoras para Filtrar por Estado */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {statusOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setFilteredStatus(option.key)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filteredStatus === option.key
                ? 'bg-primary text-on-primary shadow-sm'
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container border border-surface-container'
            }`}
          >
            {option.label} ({quotes.filter(q => q.status === option.key).length})
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-xs font-bold">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-3 text-on-surface-variant">
          <div className="w-10 h-10 rounded-full border-4 border-secondary-container border-t-secondary animate-spin"></div>
          <span className="font-semibold text-xs">Cargando cotizaciones...</span>
        </div>
      ) : filteredQuotes.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-3xl p-10 text-center border border-surface-container space-y-3 shadow-sm">
          <div className="w-14 h-14 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant mx-auto">
            <span className="material-symbols-outlined text-[28px]">receipt_long</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface">No hay cotizaciones con este estado</h4>
          <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
            Las nuevas solicitudes de ventanería aparecerán aquí tan pronto los clientes coticen.
          </p>
        </div>
      ) : (
        /* Formato de Tarjetas Colapsables Moderno */
        <div className="space-y-4">
          {filteredQuotes.map(quote => {
            const isExpanded = expandedQuoteId === quote.id;
            const items = parseDimensions(quote.dimensions);

            return (
              <div
                key={quote.id}
                className="bg-surface-container-low rounded-3xl p-5 shadow-sm border border-surface-container transition-all hover:shadow-md space-y-4"
              >
                {/* Header de la Tarjeta Colapsable */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">window</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-container text-secondary">
                          {quote.serviceCategory}
                        </span>
                        <span className="text-[11px] text-outline">
                          {new Date(quote.createdAt).toLocaleDateString('es-CO')}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-on-surface mt-1">
                        {quote.fullName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">phone</span>
                          {quote.phone}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline truncate max-w-[200px]">{quote.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estado Badge y Selector Rápido */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${
                      quote.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : quote.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : quote.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-surface-container text-on-surface'
                    }`}>
                      {quote.status === 'PENDING' ? 'Pendiente' : quote.status === 'QUOTED' ? 'Cotizado' : quote.status === 'ACCEPTED' ? 'Aceptado' : 'Rechazado'}
                    </span>

                    <button
                      onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                      className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <span>{isExpanded ? 'Ver menos' : 'Ver detalle'}</span>
                      <span className={`material-symbols-outlined text-[16px] transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                  </div>
                </div>

                {/* Resumen rápido de medidas si está colapsado */}
                {!isExpanded && items.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-surface-container">
                    <span className="px-2.5 py-1 rounded-xl bg-surface-container-lowest text-on-surface-variant border border-surface-container">
                      📏 {items[0].dimensions || 'Medidas estándar'} ({items[0].description})
                    </span>
                    {items.length > 1 && (
                      <span className="px-2 py-1 rounded-xl bg-secondary-container/50 text-secondary text-[11px] font-bold">
                        +{items.length - 1} pieza(s) adicional(es)
                      </span>
                    )}
                  </div>
                )}

                {/* Contenido Expandible (Detalles, Ítems completos, Foto y Acciones) */}
                {isExpanded && (
                  <div className="space-y-4 pt-3 border-t border-surface-container animate-in fade-in duration-200">
                    {/* Notas y Requerimientos */}
                    <div className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container/70 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-outline block">
                        Detalles y Observaciones
                      </span>
                      <p className="text-xs text-on-surface leading-relaxed">
                        {quote.details || 'Sin observaciones adicionales.'}
                      </p>
                    </div>

                    {/* Tabla de Medidas y Elementos */}
                    {items.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-outline block">
                          Desglose de Piezas y Medidas ({items.length})
                        </span>
                        <div className="rounded-2xl border border-surface-container overflow-hidden bg-surface-container-lowest">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-surface-container text-on-surface-variant font-bold">
                              <tr>
                                <th className="p-2.5">Descripción / Perfil</th>
                                <th className="p-2.5">Medidas</th>
                                <th className="p-2.5 text-center">Cant.</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-container text-on-surface">
                              {items.map((it: any, idx: number) => (
                                <tr key={idx} className="hover:bg-surface-container-low/50">
                                  <td className="p-2.5 font-medium">{it.description || 'Ítem'}</td>
                                  <td className="p-2.5">{it.dimensions || 'N/A'}</td>
                                  <td className="p-2.5 text-center font-bold">{it.quantity || 1}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Foto Adjunta */}
                    {quote.imageUrl && (
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-outline block mb-1.5">
                          Foto o Plano Adjunto
                        </span>
                        <a
                          href={quote.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block max-w-xs rounded-2xl overflow-hidden border border-surface-container relative group"
                        >
                          <img src={quote.imageUrl} alt="Referencia" className="w-full h-36 object-cover" />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                            Ver en tamaño completo
                          </div>
                        </a>
                      </div>
                    )}

                    {/* Acciones Rápidas de Edición y WhatsApp */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-surface-container">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-on-surface-variant whitespace-nowrap">Cambiar estado:</span>
                        <select
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                          className="bg-surface-container-lowest border border-surface-container rounded-2xl px-3 py-1.5 text-xs text-on-surface font-semibold outline-none focus:ring-2 focus:ring-secondary cursor-pointer shadow-sm"
                        >
                          <option value="PENDING">Pendiente</option>
                          <option value="QUOTED">Cotizado</option>
                          <option value="ACCEPTED">Aceptado</option>
                          <option value="REJECTED">Rechazado</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          const cleanPhone = quote.phone.replace(/\D/g, '');
                          window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=Hola%20${encodeURIComponent(quote.fullName)},%20te%20escribimos%20de%20ListoApp%20respecto%20a%20tu%20cotizaci%C3%B3n%20de%20${encodeURIComponent(quote.serviceCategory)}...`, '_blank');
                        }}
                        className="w-full sm:w-auto px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px]">chat</span>
                        <span>Contactar por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
