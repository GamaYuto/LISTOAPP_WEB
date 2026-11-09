import { useState, useEffect, useRef } from 'react';
import { registerUser } from '../services/api.service';
import ListoLogo from '../components/ui/ListoLogo';

type RoleType = 'CLIENT' | 'PROVIDER';
type DocumentType = 'DNI' | 'NIE' | 'PASSPORT';
type ViewState = 'home-public' | 'login' | 'register' | 'create-request' | 'dashboard-provider' | 'window-quotes-admin';

interface RegisterProps {
  setView: (v: ViewState) => void;
  onSuccess?: () => void;
}

export default function Register({ setView }: RegisterProps) {
  const [role, setRole] = useState<RoleType>('CLIENT');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Campos específicos para técnicos (PROVIDER)
  const [documentType, setDocumentType] = useState<DocumentType>('DNI');
  const [documentNumber, setDocumentNumber] = useState('');
  const [address, setAddress] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Términos y condiciones
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setError('Por favor selecciona una imagen válida en formato JPG, PNG o WEBP.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('El tamaño del archivo no puede superar los 5 MB.');
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setDocumentFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setDocumentFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setError('Por favor ingresa tu nombre y apellidos completos.');
      return;
    }

    if (!phone.trim()) {
      setError('Por favor ingresa un número de teléfono / WhatsApp de contacto.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (role === 'PROVIDER') {
      if (!documentNumber.trim()) {
        setError('Por favor indica el número de tu documento de identidad.');
        return;
      }

      if (!address.trim()) {
        setError('Por favor indica tu dirección de residencia en España.');
        return;
      }

      if (!documentFile) {
        setError('Por favor sube la foto o copia escaneada de tu documento de identidad para validar tu perfil.');
        return;
      }
    }

    if (!acceptTerms) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad de Golden System SAS.');
      return;
    }

    setLoading(true);

    try {
      if (role === 'PROVIDER') {
        const formData = new FormData();
        formData.append('fullName', fullName.trim());
        formData.append('phone', phone.trim());
        formData.append('email', email.trim());
        formData.append('password', password);
        formData.append('role', 'PROVIDER');
        formData.append('documentType', documentType);
        formData.append('documentNumber', documentNumber.trim().toUpperCase());
        formData.append('address', address.trim());
        if (documentFile) {
          formData.append('documentImage', documentFile);
        }

        await registerUser(formData);
      } else {
        await registerUser({
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          password,
          role: 'CLIENT'
        });
      }

      setSuccessMessage('¡Cuenta creada correctamente! Redirigiendo a iniciar sesión...');
      setTimeout(() => {
        setView('login');
      }, 1500);
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj.message || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 flex flex-col p-6 sm:p-8 space-y-6 relative my-6">
      {/* Botón Volver al Inicio */}
      <button 
        onClick={() => setView('home-public')} 
        className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Inicio
      </button>

      {/* Logotipo Oficial */}
      <div className="flex flex-col items-center text-center pt-2">
        <ListoLogo size="lg" variant="color" />
        <p className="text-slate-500 text-xs font-normal mt-2">Soluciones y servicios del hogar en España</p>
      </div>

      <div className="border-b border-slate-100 pb-3 text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Crea tu cuenta</h2>
        <p className="text-slate-500 text-xs mt-1">Únete a la plataforma para conectar con clientes o encontrar trabajos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Alerta de Error */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Alerta de Éxito */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm font-medium flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}
        
        {/* Selector de Rol Principal */}
        <div className="space-y-2">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
            ¿Cómo deseas participar?
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setRole('CLIENT');
                setError('');
              }}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                role === 'CLIENT'
                  ? 'border-secondary bg-secondary/5 text-secondary shadow-sm ring-2 ring-secondary/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                role === 'CLIENT' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[22px]">person</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900">Contratar</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Publicar solicitudes de servicio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('PROVIDER');
                setError('');
              }}
              className={`flex flex-col items-center text-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                role === 'PROVIDER'
                  ? 'border-secondary bg-secondary/5 text-secondary shadow-sm ring-2 ring-secondary/20'
                  : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1.5 ${
                role === 'PROVIDER' ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="material-symbols-outlined text-[22px]">handyman</span>
              </div>
              <span className="text-sm font-extrabold text-slate-900">Trabajar</span>
              <span className="text-[11px] text-slate-500 mt-0.5">Ofrecer servicios y cotizar</span>
            </button>
          </div>
        </div>

        {/* Sección: Datos de Contacto Obligatorios */}
        <div className="space-y-3.5 pt-1">
          {/* Nombre y Apellidos */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Nombre y Apellidos *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </span>
              <input
                type="text"
                required
                placeholder="Ej. Juan Pérez García"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-400">Tu nombre real será visible para clientes y técnicos verificados</p>
          </div>

          {/* Teléfono / WhatsApp */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Teléfono / WhatsApp *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">call</span>
              </span>
              <input
                type="tel"
                required
                placeholder="+34 612 345 678"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-400">Para coordinar solicitudes, visitas y notificaciones directas</p>
          </div>

          {/* Correo Electrónico */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Correo electrónico *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <input
                type="email"
                required
                placeholder="juan.perez@ejemplo.es"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Contraseña *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* CAMPOS ADICIONALES PARA TÉCNICOS (PROVIDER) */}
        {role === 'PROVIDER' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">verified_user</span>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Verificación de Seguridad Profesional
                </h3>
                <p className="text-[11px] text-slate-500">
                  Requerido para generar confianza ante clientes y recibir solicitudes oficiales
                </p>
              </div>
            </div>

            {/* Selector de Tipo de Documento y Número */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                  Tipo Doc. *
                </label>
                <select
                  value={documentType}
                  onChange={e => setDocumentType(e.target.value as DocumentType)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-bold"
                >
                  <option value="DNI">DNI</option>
                  <option value="NIE">NIE</option>
                  <option value="PASSPORT">Pasaporte</option>
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 12345678Z o Y1234567X"
                  value={documentNumber}
                  onChange={e => setDocumentNumber(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium uppercase"
                />
              </div>
            </div>

            {/* Dirección de residencia */}
            <div className="space-y-1">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Dirección de residencia *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">home_pin</span>
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ej. Calle de Alcalá 45, 2º B, 28014 Madrid"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all text-sm text-slate-800 font-medium"
                />
              </div>
            </div>

            {/* Cargador de Foto del Documento con Vista Previa */}
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                Foto del Documento de Identidad *
              </label>

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-secondary rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center bg-white cursor-pointer transition-all hover:bg-slate-50 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-[26px]">add_a_photo</span>
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Haz clic para subir la foto de tu {documentType}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Formatos JPG, PNG o WEBP (máximo 5 MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Vista previa del documento"
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {documentFile?.name || 'documento.jpg'}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Documento listo para enviar
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                    title="Eliminar foto seleccionada"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              )}

              {/* Nota Informativa RGPD con Icono de Escudo */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs">
                <span className="material-symbols-outlined text-[20px] text-amber-600 shrink-0 mt-0.5">
                  shield
                </span>
                <p className="leading-relaxed">
                  <strong className="font-bold">🔒 Verificación segura RGPD:</strong> La foto de tu documento solo será revisada por administración para validar tu identidad y se eliminará automáticamente del servidor tras tu aprobación.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Checkbox Obligatorio de Términos y Condiciones */}
        <div className="pt-2">
          <label className="flex items-start gap-3 cursor-pointer group select-none">
            <input
              type="checkbox"
              required
              checked={acceptTerms}
              onChange={e => setAcceptTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-secondary focus:ring-secondary cursor-pointer shrink-0"
            />
            <span className="text-xs text-slate-600 leading-normal">
              Acepto los <span className="font-semibold text-slate-800 underline">Términos y Condiciones</span> y la <span className="font-semibold text-slate-800 underline">Política de Privacidad</span> de Golden System SAS.
            </span>
          </label>
        </div>

        {/* Botón de Envío */}
        <button
          disabled={loading}
          type="submit"
          className="w-full py-3.5 bg-brand-accent hover:bg-[#e6b000] text-slate-900 font-extrabold rounded-2xl shadow-md active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed text-center text-sm cursor-pointer mt-3 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creando tu cuenta...</span>
            </>
          ) : (
            <span>Completar Registro</span>
          )}
        </button>

        {/* Enlace para Iniciar Sesión */}
        <p className="text-center text-xs text-slate-500 pt-1">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={() => setView('login')}
            className="text-secondary font-extrabold hover:underline cursor-pointer"
          >
            Inicia Sesión aquí
          </button>
        </p>
      </form>
    </div>
  );
}
