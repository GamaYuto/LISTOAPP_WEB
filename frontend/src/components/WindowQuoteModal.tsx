import { useState, useRef, useEffect } from 'react';
import { createWindowQuote } from '../services/api.service';
import { generateQuotePdfFile, triggerFileDownload } from '../utils/quoteDocumentGenerator';

export interface VerticalGroup {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const VERTICAL_GROUPS: VerticalGroup[] = [
  {
    id: 'aluminio-pvc',
    name: 'Carpintería de Aluminio y PVC',
    icon: 'window',
    subcategories: [
      'Mantenimiento y reparación en ventanas, puertas y cerramientos (Aluminio y PVC)',
      'Mantenimiento y reparación de persianas / instalación de motores o estores eléctricos',
      'Mosquiteras enrollables y plisadas para ventanas y puertas a medida',
    ],
  },
  {
    id: 'mamparas',
    name: 'Mamparas de Baño',
    icon: 'shower',
    subcategories: [
      'Mamparas de baño a medida frontales',
      'Mamparas de baño a medida esquineras',
    ],
  },
  {
    id: 'paleteria',
    name: 'Paletería y Reformas',
    icon: 'construction',
    subcategories: [
      'Paletería y reformas integrales para vivienda',
      'Remodelaciones de interiores, cocinas o baños',
      'Reparaciones locativas y albañilería',
    ],
  },
  {
    id: 'climatizacion',
    name: 'Aires Acondicionados',
    icon: 'ac_unit',
    subcategories: [
      'Instalación de aire acondicionado',
      'Mantenimiento y reparación de aire acondicionado',
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export interface QuoteItem {
  id: number;
  description: string;
  dimensions: string;
  quantity: number;
}

export default function WindowQuoteModal({ open, onClose, initialCategory }: Props) {
  const [selectedVertical, setSelectedVertical] = useState<string>(
    initialCategory || VERTICAL_GROUPS[0].name
  );

  const activeGroup =
    VERTICAL_GROUPS.find((v) => v.name.toLowerCase() === selectedVertical.toLowerCase()) ||
    VERTICAL_GROUPS[0];

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    serviceCategory: activeGroup.subcategories[0],
    details: '',
  });

  const [materialType, setMaterialType] = useState<'aluminio' | 'pvc'>('aluminio');
  const [glassType, setGlassType] = useState('Doble Acristalamiento Climalit (4/16/4)');
  const [width, setWidth] = useState<number>(120);
  const [height, setHeight] = useState<number>(140);
  const [quantity, setQuantity] = useState<number>(1);

  const [items, setItems] = useState<QuoteItem[]>([
    { id: Date.now(), description: `${activeGroup.name} - Estándar`, dimensions: '120cm x 140cm', quantity: 1 },
  ]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sincronizar vertical inicial cuando se abre el modal
  useEffect(() => {
    if (initialCategory) {
      const match = VERTICAL_GROUPS.find(
        (v) =>
          v.name.toLowerCase() === initialCategory.toLowerCase() ||
          v.subcategories.some((s) => s.toLowerCase() === initialCategory.toLowerCase())
      );
      if (match) {
        setSelectedVertical(match.name);
        setFormData((prev) => ({
          ...prev,
          serviceCategory: match.subcategories[0],
        }));
      }
    }
  }, [initialCategory, open]);

  // Bloqueo de scroll del body para contención visual estricta en pantallas móviles
  useEffect(() => {
    if (open) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;

  // Calculadora interactiva adaptada a las 4 verticales en Euros (€) para España
  const calculateEstimatedPrice = (): number => {
    const areaM2 = ((width || 100) * (height || 100)) / 10000;
    const qty = quantity || 1;

    if (selectedVertical === 'Carpintería de Aluminio y PVC') {
      if (formData.serviceCategory.includes('persianas') || formData.serviceCategory.includes('estores')) {
        return Math.max(90, Math.round((110 * qty) / 5) * 5);
      }
      if (formData.serviceCategory.includes('Mosquiteras')) {
        return Math.max(75, Math.round((85 * areaM2 * qty) / 5) * 5);
      }
      const baseM2 = materialType === 'aluminio' ? 180 : 150;
      let glassMultiplier = 1.1;
      if (glassType.includes('Doble')) glassMultiplier = 1.25;
      else if (glassType.includes('Acústico')) glassMultiplier = 1.35;
      else if (glassType.includes('Templado')) glassMultiplier = 1.30;
      return Math.max(90, Math.round((areaM2 * baseM2 * glassMultiplier * qty) / 5) * 5);
    }

    if (selectedVertical === 'Mamparas de Baño') {
      const isEsquinera = formData.serviceCategory.includes('esquineras');
      const baseM2 = isEsquinera ? 260 : 220;
      return Math.max(160, Math.round((areaM2 * baseM2 * qty) / 5) * 5);
    }

    if (selectedVertical === 'Paletería y Reformas') {
      if (formData.serviceCategory.includes('integrales')) {
        return Math.max(450, Math.round((areaM2 * 280 * qty) / 10) * 10);
      }
      return Math.max(120, Math.round((areaM2 * 190 * qty) / 5) * 5);
    }

    if (selectedVertical === 'Aires Acondicionados') {
      if (formData.serviceCategory.includes('Instalación')) {
        return Math.max(250, 250 * qty);
      }
      return Math.max(90, 95 * qty);
    }

    return Math.max(90, Math.round((areaM2 * 180 * qty) / 5) * 5);
  };

  const estimatedPrice = calculateEstimatedPrice();

  const handleVerticalChange = (verticalName: string) => {
    setSelectedVertical(verticalName);
    const targetGroup = VERTICAL_GROUPS.find((v) => v.name === verticalName);
    if (targetGroup) {
      setFormData((prev) => ({
        ...prev,
        serviceCategory: targetGroup.subcategories[0],
      }));
    }
  };

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
      description: `${formData.serviceCategory} (${materialType === 'aluminio' ? 'Aluminio' : 'PVC'})`,
      dimensions: `${width}cm x ${height}cm`,
      quantity: quantity || 1,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
      const finalItems =
        items.length > 0
          ? items
          : [
              {
                id: Date.now(),
                description: `${formData.serviceCategory} (${materialType})`,
                dimensions: `${width}cm x ${height}cm`,
                quantity: quantity || 1,
              },
            ];

      // 1. Guardar en Backend / Turso Cloud
      const payload = new FormData();
      payload.append('fullName', formData.fullName);
      payload.append('email', formData.email);
      payload.append('phone', formData.phone);
      payload.append('serviceCategory', formData.serviceCategory);
      payload.append(
        'details',
        formData.details
          ? `${formData.details} (Vertical: ${selectedVertical} | Est: ${estimatedPrice} € EUR)`
          : `Cotización de ${selectedVertical} - Presupuesto estimado: ${estimatedPrice} € EUR`
      );
      payload.append('dimensions', JSON.stringify(finalItems));
      if (imageFile) payload.append('image', imageFile);

      await createWindowQuote(payload);

      // 2. Generar el documento físico PDF de cotización formal con branding de ListoApp
      const folio = `COT-${Date.now().toString().slice(-6)}`;
      const currentDate = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

      const quotePdfFile = generateQuotePdfFile({
        folio,
        date: currentDate,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        serviceCategory: formData.serviceCategory,
        materialType,
        glassType,
        items: finalItems,
        estimatedPrice,
        details: formData.details,
      });

      const BUSINESS_PHONE = import.meta.env.VITE_BUSINESS_WHATSAPP || '34611236988';
      const shareText = `Hola! Adjunto la cotización formal #${folio} de ${formData.serviceCategory} por un valor estimado de ${estimatedPrice.toLocaleString('es-ES')} € EUR.\n\nPor favor revisar el documento PDF adjunto con las medidas y especificaciones técnicas.`;

      // 3. Compartir con Web Share API (WhatsApp u otras apps)
      let sharedSuccessfully = false;

      if (navigator.canShare) {
        const shareData: ShareData = {
          title: `Cotización ListoApp #${folio}`,
          text: shareText,
          files: [quotePdfFile],
        };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            sharedSuccessfully = true;
          } catch (shareErr) {
            const err = shareErr as Error;
            if (err.name === 'AbortError') {
              onClose();
              return;
            }
          }
        }
      }

      // 4. Fallback si no soporta Web Share API con archivos (PC/Desktop)
      if (!sharedSuccessfully) {
        triggerFileDownload(quotePdfFile);

        const fallbackText = encodeURIComponent(
          `Hola! Quisiera cotizar un servicio de *${formData.serviceCategory}* (${selectedVertical}):\n` +
            `- *Cliente:* ${formData.fullName}\n` +
            `- *Teléfono:* ${formData.phone}\n` +
            `- *Folio:* ${folio}\n` +
            `- *Presupuesto Estimado:* ${estimatedPrice.toLocaleString('es-ES')} € EUR\n\n` +
            `Acabo de generar y descargar la cotización formal *${quotePdfFile.name}*. Adjunto el archivo en este chat.`
        );
        const whatsappUrl = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${fallbackText}`;
        window.open(whatsappUrl, '_blank');
      }

      onClose();
      setMessage({ type: '', text: '' });
    } catch (error) {
      const err = error as Error;
      setMessage({ type: 'error', text: err.message || 'Error al guardar la cotización.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain select-none animate-in fade-in duration-200">
      {/* Contenedor Modal con Reglas de Contención Visual Estricta */}
      <div className="bg-surface w-full sm:max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl h-[92dvh] sm:h-auto sm:max-h-[90vh] flex flex-col border border-surface-container overflow-hidden overscroll-contain animate-in slide-in-from-bottom duration-300">
        {/* Header Fijo */}
        <div className="px-6 pt-3 pb-3 bg-surface-container-lowest border-b border-surface-container shrink-0">
          <div className="w-10 h-1 bg-surface-container-highest rounded-full mx-auto mb-2 sm:hidden" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-secondary-container text-secondary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-[22px]">{activeGroup.icon}</span>
              </div>
              <div>
                <h3 className="font-extrabold text-base md:text-lg text-on-surface tracking-tight">
                  Cotizador Directo Oficial
                </h3>
                <p className="text-xs text-on-surface-variant">Cálculo en tiempo real con documento PDF en Euros (€)</p>
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
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* Cuerpo Scrolleable */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5 touch-pan-y"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            {message.text && (
              <div
                className={`p-3.5 rounded-2xl text-xs font-semibold ${
                  message.type === 'error' ? 'bg-error-container text-on-error-container' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {message.text}
              </div>
            )}

            {/* 1. Selector de las 4 Verticales Principales */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Área del Proyecto
              </label>
              <div className="grid grid-cols-2 gap-2">
                {VERTICAL_GROUPS.map((v) => {
                  const isSelected = selectedVertical === v.name;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVerticalChange(v.name)}
                      className={`p-2.5 rounded-2xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#001F3F] text-white border-[#001F3F] shadow-sm'
                          : 'bg-surface-container-lowest text-on-surface border-surface-container hover:bg-surface-container-low'
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] ${
                          isSelected ? 'text-brand-accent' : 'text-on-surface-variant'
                        }`}
                      >
                        {v.icon}
                      </span>
                      <span className="text-xs font-bold leading-tight truncate">{v.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Selector de Subcategoría / Servicio Específico */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                Servicio o Tipo de Trabajo
              </label>
              <select
                value={formData.serviceCategory}
                onChange={(e) => setFormData((prev) => ({ ...prev, serviceCategory: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary cursor-pointer shadow-sm font-semibold"
              >
                {activeGroup.subcategories.map((sub, idx) => (
                  <option key={idx} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Selector de Material (para Carpintería de Aluminio y PVC) */}
            {selectedVertical === 'Carpintería de Aluminio y PVC' && (
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                  Tipo de Perfil / Material
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMaterialType('aluminio')}
                    className={`py-2.5 px-4 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      materialType === 'aluminio'
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                    Aluminio RPT (180 €/m²)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMaterialType('pvc')}
                    className={`py-2.5 px-4 rounded-2xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      materialType === 'pvc'
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface-container-low text-on-surface border-surface-container hover:bg-surface-container'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">layers</span>
                    PVC Clásico (150 €/m²)
                  </button>
                </div>
              </div>
            )}

            {/* 4. Dimensiones / Unidades */}
            <div>
              <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                Medidas Estimadas y Cantidad
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Ancho (cm)</span>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-2.5 text-center text-base md:text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Alto (cm)</span>
                  <input
                    type="number"
                    min="30"
                    max="600"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-2.5 text-center text-base md:text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-on-surface-variant mb-1 font-semibold">Cantidad</span>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-2.5 text-center text-base md:text-lg font-bold text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* 5. Tipo de Vidrio (para Aluminio/PVC y Mamparas) */}
            {(selectedVertical === 'Carpintería de Aluminio y PVC' || selectedVertical === 'Mamparas de Baño') && (
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase tracking-wider mb-1.5">
                  Tipo de Vidrio o Acabado
                </label>
                <select
                  value={glassType}
                  onChange={(e) => setGlassType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary cursor-pointer shadow-sm"
                >
                  <option value="Doble Acristalamiento Climalit (4/16/4)">Doble Acristalamiento Climalit (4/16/4)</option>
                  <option value="Vidrio Templado de Seguridad 6mm">Vidrio Templado de Seguridad 6mm</option>
                  <option value="Vidrio Laminado Acústico">Vidrio Laminado Acústico</option>
                  <option value="Vidrio Simple Float 4mm">Vidrio Simple Float 4mm</option>
                </select>
              </div>
            )}

            {/* Lista de Piezas Añadidas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Elementos del Proyecto ({items.length})
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
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest border border-surface-container text-xs"
                >
                  <div>
                    <span className="font-bold text-on-surface mr-2">
                      #{index + 1} {item.dimensions}
                    </span>
                    <span className="text-on-surface-variant">
                      ({item.description} - Cant: {item.quantity})
                    </span>
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
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-surface-container max-h-40">
                  <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-surface-container hover:border-secondary text-on-surface-variant hover:text-secondary text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                  Subir foto del espacio o plano
                </button>
              )}
            </div>

            {/* Datos de Contacto del Cliente */}
            <div className="space-y-3 pt-2 border-t border-surface-container">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Datos para tu Cotización Formal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Tu Nombre Completo *"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                />
                <input
                  type="tel"
                  placeholder="WhatsApp / Teléfono (+34) *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
                />
              </div>
              <input
                type="email"
                placeholder="Correo Electrónico *"
                required
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary shadow-sm"
              />
              <textarea
                placeholder="Observaciones adicionales (ej. instalación en segundo piso, color negro mate...)"
                rows={2}
                value={formData.details}
                onChange={(e) => setFormData((prev) => ({ ...prev, details: e.target.value }))}
                className="w-full bg-surface-container-lowest border border-surface-container rounded-2xl p-3 text-xs md:text-sm text-on-surface outline-none focus:ring-2 focus:ring-secondary resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Footer Fijo / Sticky Abajo con Precio en Tiempo Real y CTA */}
          <div className="shrink-0 p-4 sm:p-5 bg-surface-container-lowest border-t border-surface-container shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant font-semibold block">Presupuesto Estimado:</span>
                <span className="text-xl md:text-2xl font-black text-secondary leading-tight">
                  {estimatedPrice.toLocaleString('es-ES')} € <span className="text-xs font-bold text-on-surface-variant">EUR</span>
                </span>
              </div>
              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-outline block">Precios con IVA y asesoría</span>
                <span className="text-[11px] text-secondary font-semibold">ListoApp Oficial España</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 sm:py-4 rounded-2xl bg-brand-accent text-brand-dark font-heading font-bold text-sm shadow-md hover:bg-[#e6b000] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? (
                <span>Generando cotización formal y PDF...</span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  <span>Guardar y Enviar a WhatsApp</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-secondary">picture_as_pdf</span>
              Se generará y adjuntará automáticamente tu cotización formal en PDF
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
