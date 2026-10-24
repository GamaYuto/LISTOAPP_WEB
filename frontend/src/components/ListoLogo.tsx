
interface ListoLogoProps {
  variant?: 'color' | 'monochrome' | 'white';
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ListoLogo({
  variant = 'color',
  showText = true,
  size = 'md',
  className = ''
}: ListoLogoProps) {
  // Dimensiones según el tamaño respetando área de protección y legibilidad
  const dimensions = {
    sm: { icon: 26, height: 28, text: 'text-lg', badge: 'text-[9px]' },
    md: { icon: 34, height: 38, text: 'text-2xl', badge: 'text-[10px]' },
    lg: { icon: 44, height: 48, text: 'text-3xl', badge: 'text-xs' },
    xl: { icon: 60, height: 64, text: 'text-4xl', badge: 'text-sm' }
  }[size];

  // Paleta oficial según variante
  const isColor = variant === 'color';
  const isWhite = variant === 'white';

  const bodyColor = isColor ? '#88C1E0' : isWhite ? '#FFFFFF' : '#333333';
  const checkAccentColor = isColor ? '#FFC300' : isWhite ? '#FFFFFF' : '#333333';
  const textColor = isColor ? '#333333' : isWhite ? '#FFFFFF' : '#333333';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      style={{ padding: '4px' }} // Área de protección perimetral obligatoria
      aria-label="ListoApp Logo"
    >
      {/* Isotipo: Hexágono/Pin en Azul Principal con el Check en Naranja de Acción */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        {/* Cuerpo del Logo - Azul Principal (#88C1E0) */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="12"
          fill={bodyColor}
        />
        {/* Check de "Listo" en Naranja Acento (#FFC300) con trazo grueso y limpio */}
        <path
          d="M14 24.5L21.5 32L34.5 16"
          stroke={checkAccentColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Tipografía Primaria: Poppins en negrita para "Listo" */}
      {showText && (
        <div className="flex items-baseline leading-none">
          <span
            className={`font-heading font-extrabold tracking-tight ${dimensions.text}`}
            style={{ color: textColor }}
          >
            Listo
          </span>
          <span
            className={`font-heading font-bold ml-0.5 ${dimensions.text}`}
            style={{ color: isColor ? '#88C1E0' : textColor }}
          >
            App
          </span>
        </div>
      )}
    </div>
  );
}
