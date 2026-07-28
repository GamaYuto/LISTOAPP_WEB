import { useState } from 'react';
import { createWindowQuote } from '../services/api.service';

const serviceOptions = [
  'Carpintería de aluminio',
  'Persianas',
  'Motorización de Persianas',
  'Mallorquinas',
  'Ventanas y puertas',
  'Cristalería',
  'Mamparas',
  'Mosquiteras'
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function WindowQuoteModal({ open, onClose }: Props) {
  type QuoteItem = { id: number; description: string; dimensions: string; quantity: number };

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceCategory: serviceOptions[0],
    details: ''
  });
  const [items, setItems] = useState<QuoteItem[]>([{ id: Date.now(), description: '', dimensions: '', quantity: 1 }]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  if (!open) return null;

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const buildWhatsAppText = (data: typeof formData, currentItems: QuoteItem[], imageUrl: string | null) => {
    const itemsText = currentItems.map(item => `  • ${item.description || 'Sin descripción'}: ${item.dimensions || 'Sin medidas'} (Cant: ${item.quantity})`).join('\n');
    const imageLine = imageUrl ? imageUrl : 'Sin imagen adjunta';

    return encodeURIComponent(`Hola! Quisiera cotizar un servicio de *${data.serviceCategory}*:
- *Nombre del Cliente:* ${data.fullName}
- *Teléfono del Cliente:* ${data.phone}
- *Email del Cliente:* ${data.email}
- *Ítems y Medidas:*\n${itemsText || '  • N/A'}
- *Detalles:* ${data.details}
- *Foto adjunta:* ${imageLine}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.details.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa todos los campos obligatorios.' });
      setSaving(false);
      return;
    }

    try {
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('serviceCategory', formData.serviceCategory);
      payload.append('details', formData.details);
      payload.append('dimensions', JSON.stringify(items));
      if (imageFile) payload.append('image', imageFile);

      const result = await createWindowQuote(payload);
      const imageUrl = result.windowQuote.imageUrl || null;
      const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_WHATSAPP || '34611236988';
      
      const whatsappText = buildWhatsAppText(formData, items, imageUrl);
      const shareData: any = {
        title: 'Cotización de Ventana',
        text: decodeURIComponent(whatsappText) + '\n\n(Compartiendo con la línea oficial de ListoApp)'
      };
      
      if (imageFile) {
        shareData.files = [imageFile];
      }

      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare(shareData)) {
        try {
          alert('Se abrirá el menú de tu dispositivo. Por favor, selecciona WhatsApp para enviar esta cotización a nuestra línea oficial.');
          await navigator.share(shareData);
        } catch (shareErr) {
          console.error('Error sharing:', shareErr);
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${whatsappText}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${whatsappText}`;
        window.open(whatsappUrl, '_blank');
      }

      onClose();
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        serviceCategory: serviceOptions[0],
        details: ''
      });
      setItems([{ id: Date.now(), description: '', dimensions: '', quantity: 1 }]);
      setImageFile(null);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al enviar la cotización.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 bg-brand-primary text-white">
          <div>
            <h2 className="text-xl font-black">Cotización Especial de Ventanas</h2>
            <p className="text-sm text-brand-primary-light">Completa los datos y finaliza tu solicitud con WhatsApp.</p>
          </div>
          <button onClick={onClose} className="text-white text-2xl leading-none hover:text-brand-accent">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {message.text && (
            <div className={`rounded-2xl p-3 text-sm font-semibold ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-700">
              Nombre completo
              <input
                value={formData.fullName}
                onChange={e => handleChange('fullName', e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              Correo electrónico
              <input
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              Celular de contacto
              <input
                type="tel"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                required
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-700">
              Tipo de Servicio
              <select
                value={formData.serviceCategory}
                onChange={e => handleChange('serviceCategory', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
              >
                {serviceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Ítems y Medidas</h3>
              <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <span className="font-semibold text-brand-primary">Adjuntar foto general</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20"
                />
              </label>
            </div>
            
            {items.map((item, index) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-end bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="flex-1 space-y-1 text-xs text-slate-700 w-full">
                  Descripción (ej. Ventana)
                  <input
                    value={item.description}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].description = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="Ventana salón"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                  />
                </label>
                <label className="flex-1 space-y-1 text-xs text-slate-700 w-full">
                  Medidas
                  <input
                    value={item.dimensions}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].dimensions = e.target.value;
                      setItems(newItems);
                    }}
                    placeholder="120x150 cm"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                  />
                </label>
                <label className="w-full sm:w-24 space-y-1 text-xs text-slate-700">
                  Cant.
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={e => {
                      const newItems = [...items];
                      newItems[index].quantity = parseInt(e.target.value) || 1;
                      setItems(newItems);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                  className={`p-2 rounded-xl transition ${items.length === 1 ? 'opacity-0 cursor-default' : 'text-red-500 hover:bg-red-50 border border-red-100'}`}
                  title="Eliminar ítem"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mx-auto">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => setItems([...items, { id: Date.now(), description: '', dimensions: '', quantity: 1 }])}
              className="text-sm font-semibold text-brand-primary hover:text-brand-primary-dark transition flex items-center gap-1"
            >
              <span>+ Agregar elemento/medida</span>
            </button>
          </div>

          <label className="space-y-2 text-sm text-slate-700">
            Detalle de la solicitud
            <textarea
              value={formData.details}
              onChange={e => handleChange('details', e.target.value)}
              required
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 resize-none"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-brand-primary px-5 py-3 text-sm font-bold text-white transition hover:bg-brand-primary-dark disabled:opacity-70"
            >
              {saving ? 'Enviando...' : 'Guardar y Abrir WhatsApp'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
