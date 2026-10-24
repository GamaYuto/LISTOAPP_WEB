import { useState, useRef } from 'react';
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

type QuoteItem = {
  id: number;
  description: string;
  dimensions: string;
  quantity: number;
};

export default function WindowQuoteModal({ open, onClose }: Props) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceCategory: serviceOptions[0],
    details: ''
  });

  const [materialType, setMaterialType] = useState<'aluminio' | 'pvc'>('aluminio');
  const [glassType, setGlassType] = useState('Doble Acristalamiento Climalit (4/16/4)');
  const [width, setWidth] = useState<number>(120);
  const [height, setHeight] = useState<number>(140);
  const [quantity, setQuantity] = useState<number>(1);

  const [items, setItems] = useState<QuoteItem[]>([
    { id: Date.now(), description: 'Ventana Principal (Aluminio RPT)', dimensions: '120cm x 140cm', quantity: 1 }
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  // Calculadora interactiva de precio preliminar estimada
  const calculateEstimatedPrice = () => {
    // Estimación base en COP (o moneda estándar) basada en m2, tipo de material y vidrio
    const areaM2 = ((width || 100) * (height || 100)) / 10000;
    const materialMultiplier = materialType === 'aluminio' ? 180000 : 150000;
    const glassMultiplier = glassType.includes('Doble') ? 1.3 : 1.1;
    const baseTotal = areaM2 * materialMultiplier * glassMultiplier * (quantity || 1);
    return Math.max(120000, Math.round(baseTotal / 1000) * 1000);
  };

  const estimatedPrice = calculateEstimatedPrice();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addItemFromCurrentSpecs = () => {
    const newItem: QuoteItem = {
      id: Date.now(),
      description: `${materialType === 'aluminio' ? 'Aluminio RPT' : 'PVC Clásico'} - ${glassType}`,
      dimensions: `${width}cm x ${height}cm`,
      quantity: quantity || 1
    };
    setItems(prev => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const buildWhatsAppText = (data: typeof formData, currentItems: QuoteItem[], imageUrl: string | null) => {
    const itemsText = currentItems
      .map(item => `  • ${item.description}: ${item.dimensions} (Cant: ${item.quantity})`)
      .join('\n');
    const imageLine = imageUrl ? imageUrl : 'Sin imagen adjunta';

    return encodeURIComponent(`Hola! Quisiera cotizar un servicio de *${data.serviceCategory}*:
- *Cliente:* ${data.fullName}
- *Teléfono:* ${data.phone}
- *Email:* ${data.email}
- *Presupuesto Estimado en App:* $${estimatedPrice.toLocaleString('es-CO')} COP
- *Ítems y Medidas:*\n${itemsText || '  • Medidas: ' + width + 'x' + height + 'cm'}
- *Notas:* ${data.details || 'Sin observaciones adicionales'}
- *Foto adjunta:* ${imageLine}`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setMessage({ type: 'error', text: 'Por favor completa tu nombre, email y teléfono para enviarte la cotización.' });
      setSaving(false);
      return;
    }

    try {
      const finalItems = items.length > 0 ? items : [{
        id: Date.now(),
        description: `${materialType === 'aluminio' ? 'Aluminio RPT' : 'PVC Clásico'} - ${glassType}`,
        dimensions: `${width}cm x ${height}cm`,
        quantity: quantity || 1
      }];

      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('serviceCategory', formData.serviceCategory);
      payload.append('details', formData.details ? `${formData.details} (Est: $${estimatedPrice})` : `Presupuesto estimado: $${estimatedPrice}`);
      payload.append('dimensions', JSON.stringify(finalItems));
      if (imageFile) payload.append('image', imageFile);

      const result = await createWindowQuote(payload);
      const imageUrl = result.windowQuote?.imageUrl || null;
      const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_WHATSAPP || '34611236988';

      const whatsappText = buildWhatsAppText(formData, finalItems, imageUrl);
      const shareData: any = {
        title: 'Cotización de Ventana - ListoApp',
        text: decodeURIComponent(whatsappText) + '\n\n(Compartiendo con la línea oficial de ListoApp)'
      };

      if (imageFile) {
        shareData.files = [imageFile];
      }

      const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare(shareData)) {
        try {
          await navigator.share(shareData);
        } catch {
          const whatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${whatsappText}`;
          window.open(whatsappUrl, '_blank');
        }
      } else {
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${whatsappText}`;
        window.open(whatsappUrl, '_blank');
      }

      onClose();
      setMessage({ type: '', text: '' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Error al guardar la cotización.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-surface w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col border border-surface-container animate-in slide-in-from-bottom duration-300">
        
        {/* Header con estilo Bottom Sheet */}
        <div className="px-6 py-4 bg-surface-container-lowest border-b border-surface-container flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[22px]">window</span>
            </div>
            <div>
              <h3 className="font-extrabold text-base md:text-lg text-on-surface tracking-tight">
                Cotizador de Ventanas y Cristalería
              </h3>
              <p className="text-xs text-on-surface-variant">Cálculo en tiempo real con envío a WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body Scrollable */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {message.text && (
            <div className={`p-3.5 rounded-2xl text-xs font-semibold ${message.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-emerald-50 text-emerald-800'}`}>
              {message.text}
            </div>
          )}

          {/* Selector de Material con Píldoras Visuales */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
              Tipo de Perfil / Material
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMaterialType('aluminio')}
                className={`py-3 px-4 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  materialType === 'aluminio'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                Aluminio RPT
              </button>
              <button
                type="button"
                onClick={() => setMaterialType('pvc')}
                className={`py-3 px-4 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                  materialType === 'pvc'
                    ? 'bg-primary text-on-primary border-primary shadow-sm'
                    : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">layers</span>
                PVC Clásico
              </button>
            </div>
          </div>

          {/* Dimensiones con Inputs Numéricos Grandes */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
              Dimensiones por Unidad (cm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Ancho (cm)</span>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-center text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Alto (cm)</span>
                <div className="relative">
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-center text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
              </div>
              <div>
                <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Cantidad</span>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-center text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de Vidrio */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Tipo de Vidrio o Cristal
            </label>
            <select
              value={glassType}
              onChange={(e) => setGlassType(e.target.value)}
              className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3.5 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary cursor-pointer shadow-sm"
            >
              <option value="Doble Acristalamiento Climalit (4/16/4)">Doble Acristalamiento Climalit (4/16/4)</option>
              <option value="Vidrio Templado de Seguridad 6mm">Vidrio Templado de Seguridad 6mm</option>
              <option value="Vidrio Laminado Acústico">Vidrio Laminado Acústico</option>
              <option value="Vidrio Simple Float 4mm">Vidrio Simple Float 4mm</option>
            </select>
          </div>

          {/* Resumen de Precio en Tiempo Real (Stitch Card) */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-on-surface-variant font-medium">Presupuesto Estimado:</span>
              <span className="text-xl md:text-2xl font-black text-secondary">
                ${estimatedPrice.toLocaleString('es-CO')} <span className="text-xs font-bold text-on-surface-variant">COP</span>
              </span>
            </div>
            <p className="text-[11px] text-outline">
              * Estimación preliminar. Incluye asesoría técnica y perfilería estándar.
            </p>
          </div>

          {/* Lista de Piezas Añadidas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Piezas del Proyecto ({items.length})
              </span>
              <button
                type="button"
                onClick={addItemFromCurrentSpecs}
                className="text-xs font-bold text-secondary flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add_circle</span>
                Añadir otra medida
              </button>
            </div>
            {items.map((item, index) => (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs">
                <div>
                  <span className="font-bold text-on-surface mr-2">#{index + 1} {item.dimensions}</span>
                  <span className="text-on-surface-variant">({item.description} - Cant: {item.quantity})</span>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-error hover:bg-error-container/40 p-1 rounded-full cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Adjuntar Foto */}
          <div>
            <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
              Foto o Plano de Referencia (Opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-surface-container max-h-40">
                <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-surface-container hover:border-secondary text-on-surface-variant hover:text-secondary text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                Subir foto del espacio o plano
              </button>
            )}
          </div>

          {/* Datos de Contacto del Cliente */}
          <div className="space-y-3 pt-2 border-t border-surface-container">
            <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Datos para Enviarte la Cotización
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Tu Nombre Completo *"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                />
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="WhatsApp / Teléfono *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                />
              </div>
            </div>
            <div>
              <input
                type="email"
                placeholder="Correo Electrónico *"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
              />
            </div>
            <div>
              <textarea
                placeholder="Observaciones adicionales (ej. instalación en segundo piso, color negro mate...)"
                rows={2}
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Botón de Enviar a WhatsApp - CTA con Naranja Acento #FFC300 según Manual de Marca */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="w-full py-4 rounded-2xl bg-brand-accent text-brand-dark font-heading font-bold text-sm shadow-md hover:bg-[#e6b000] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Guardando cotización...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Guardar y Enviar a WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
