import { useEffect, useState } from 'react';
import { exportWindowQuotesExcel, getWindowQuotes, updateWindowQuoteStatus } from '../services/api.service';

const statusOptions = ['PENDING', 'QUOTED', 'ACCEPTED', 'REJECTED'];

const renderDimensionsModal = (dimensionsStr: string | null) => {
  if (!dimensionsStr) return 'N/A';
  try {
    const parsed = JSON.parse(dimensionsStr);
    if (Array.isArray(parsed)) {
      return (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-500">
              <tr>
                <th className="px-3 py-2 font-semibold">Descripción</th>
                <th className="px-3 py-2 font-semibold">Medidas</th>
                <th className="px-3 py-2 font-semibold text-center">Cant.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
              {parsed.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{item.description || 'Ítem'}</td>
                  <td className="px-3 py-2">{item.dimensions || 'N/A'}</td>
                  <td className="px-3 py-2 text-center">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  } catch (e) {
    // Not JSON
  }
  return <p className="text-sm text-slate-700">{dimensionsStr}</p>;
};

const renderDimensionsTable = (dimensionsStr: string | null) => {
  if (!dimensionsStr) return <span className="text-slate-400">N/A</span>;
  try {
    const parsed = JSON.parse(dimensionsStr);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const firstItem = parsed[0];
      const hasMore = parsed.length > 1;
      return (
        <div className="flex flex-col gap-1 max-w-[200px]">
          <span className="truncate font-medium text-slate-700" title={firstItem.description}>
            {firstItem.description || 'Ítem'}
          </span>
          <span className="truncate text-xs text-slate-500" title={firstItem.dimensions}>
            {firstItem.dimensions || 'Sin medidas'}
          </span>
          {hasMore && (
            <span className="inline-flex w-fit items-center rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
              +{parsed.length - 1} más
            </span>
          )}
        </div>
      );
    }
  } catch (e) {
    // Not JSON
  }
  return <div className="truncate max-w-[200px]" title={dimensionsStr}>{dimensionsStr}</div>;
};

export default function WindowQuotesAdmin() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [filteredStatus, setFilteredStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateWindowQuoteStatus(id, newStatus);
      setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el estado');
    }
  };

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

  const handleExport = async () => {
    try {
      const blob = await exportWindowQuotesExcel();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'window-quotes.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Error al exportar a Excel');
    }
  };

  const filteredQuotes = quotes.filter(quote => quote.status === filteredStatus);

  return (
    <div className="w-full max-w-6xl space-y-6 px-4 md:px-0">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Panel de Cotizaciones de Ventanas</h2>
          <p className="text-sm text-slate-500">Administra y exporta las solicitudes de cotización.</p>
        </div>
        <button onClick={handleExport} className="rounded-3xl bg-brand-accent px-6 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-brand-accent-hover">
          Exportar a Excel
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2 mb-4">
          {statusOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setFilteredStatus(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${filteredStatus === option ? 'bg-brand-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {option === 'PENDING' ? 'Pendiente' : option === 'QUOTED' ? 'Cotizado' : option === 'ACCEPTED' ? 'Aceptado' : 'Rechazado'}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500">Cargando cotizaciones...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-separate border-spacing-y-3">
              <thead>
                <tr className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 rounded-tl-3xl">Cliente</th>
                  <th className="px-4 py-3">Servicio</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Medidas</th>
                  <th className="px-4 py-3">Creado</th>
                  <th className="px-4 py-3 rounded-tr-3xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No hay cotizaciones con este estado.</td>
                  </tr>
                ) : filteredQuotes.map(quote => (
                  <tr key={quote.id} className="bg-white shadow-sm rounded-3xl overflow-hidden border border-slate-100">
                    <td className="px-4 py-4 align-top text-sm text-slate-800 font-semibold">{quote.fullName}</td>
                    <td className="px-4 py-4 align-top text-sm text-slate-600">{quote.serviceCategory}</td>
                    <td className="px-4 py-4 align-top text-sm text-brand-primary underline decoration-brand-primary/30 transition hover:text-brand-primary-dark cursor-pointer" onClick={() => window.open(`https://wa.me/57${quote.phone.replace(/\D/g, '')}`, '_blank')}>
                      {quote.phone}
                    </td>
                    <td className="px-4 py-4 align-top text-sm font-bold">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs ${quote.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : quote.status === 'ACCEPTED' ? 'bg-emerald-100 text-emerald-700' : quote.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                        {quote.status === 'PENDING' ? 'Pendiente' : quote.status === 'QUOTED' ? 'Cotizado' : quote.status === 'ACCEPTED' ? 'Aceptado' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-slate-600">
                      {renderDimensionsTable(quote.dimensions)}
                    </td>
                    <td className="px-4 py-4 align-top text-sm text-slate-500">{new Date(quote.createdAt).toLocaleDateString('es-CO')}</td>
                    <td className="px-4 py-4 align-top text-sm">
                      <div className="flex flex-col gap-2">
                        <select 
                          value={quote.status}
                          onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                          className="rounded-2xl border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 shadow-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                        >
                          <option value="PENDING">Volver a Pendiente</option>
                          <option value="QUOTED">Marcar como Cotizado</option>
                          <option value="ACCEPTED">Marcar como Aceptado</option>
                          <option value="REJECTED">Marcar como Rechazado</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => window.open(`https://wa.me/57${quote.phone.replace(/\D/g, '')}`, '_blank')} className="flex-1 rounded-2xl bg-brand-primary px-3 py-1.5 text-white text-xs font-semibold transition hover:bg-brand-primary-dark">
                            WhatsApp
                          </button>
                          <button onClick={() => setSelectedQuote(quote)} className="flex-1 rounded-2xl bg-slate-200 px-3 py-1.5 text-slate-700 text-xs font-semibold transition hover:bg-slate-300">
                            Detalles
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalles */}
      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Detalles de Cotización</h3>
              <button onClick={() => setSelectedQuote(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Cliente</span>
                <p className="text-slate-800 font-medium">{selectedQuote.fullName}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contacto</span>
                <p className="text-slate-800">{selectedQuote.email} | {selectedQuote.phone}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Servicio</span>
                <p className="text-slate-800">{selectedQuote.serviceCategory}</p>
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Detalles Completos</span>
                <p className="text-slate-700 bg-slate-50 p-3 rounded-2xl mt-1 text-sm">{selectedQuote.details}</p>
              </div>
              {selectedQuote.dimensions && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Medidas e Ítems</span>
                  {renderDimensionsModal(selectedQuote.dimensions)}
                </div>
              )}
              {selectedQuote.imageUrl && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">Foto Adjunta</span>
                  <a href={selectedQuote.imageUrl} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-2xl border border-slate-200 group relative">
                    <img src={selectedQuote.imageUrl} alt="Foto cotización" className="w-full h-auto transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-slate-900/0 transition-colors group-hover:bg-slate-900/10 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition-opacity">Ver completa</span>
                    </div>
                  </a>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
              <button onClick={() => window.open(`https://wa.me/57${selectedQuote.phone.replace(/\D/g, '')}`, '_blank')} className="px-6 py-2 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary-dark transition flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" /></svg>
                Contactar por WhatsApp
              </button>
              <button onClick={() => setSelectedQuote(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-300 transition">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
