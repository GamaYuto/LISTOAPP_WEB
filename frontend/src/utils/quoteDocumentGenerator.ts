export interface QuotePdfData {
  folio: string;
  date: string;
  fullName: string;
  phone: string;
  email: string;
  serviceCategory: string;
  materialType: string;
  glassType: string;
  items: Array<{
    id: number;
    description: string;
    dimensions: string;
    quantity: number;
  }>;
  estimatedPrice: number;
  details?: string;
}

function escapePdfText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/á/g, 'a')
    .replace(/é/g, 'e')
    .replace(/í/g, 'i')
    .replace(/ó/g, 'o')
    .replace(/ú/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/Á/g, 'A')
    .replace(/É/g, 'E')
    .replace(/Í/g, 'I')
    .replace(/Ó/g, 'O')
    .replace(/Ú/g, 'U')
    .replace(/Ñ/g, 'N');
}

/**
 * Genera un archivo PDF físico conforme al estándar PDF-1.4 sin dependencias externas.
 * Incluye cabecera corporativa ListoApp, datos del cliente, desglose de carpintería y presupuesto.
 */
export function generateQuotePdfFile(data: QuotePdfData): File {
  const encoder = new TextEncoder();
  const objects: string[] = [];

  // Dimensiones estándar A4 en puntos (72 dpi)
  const W = 595.28;
  const H = 841.89;

  let stream = '';

  // Rectángulo relleno (RGB normalizado 0 a 1)
  const fillRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number) => {
    stream += `q ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f Q\n`;
  };

  // Rectángulo con borde
  const strokeRect = (x: number, y: number, w: number, h: number, r: number, g: number, b: number, lineWidth = 1) => {
    stream += `q ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${lineWidth} w ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S Q\n`;
  };

  // Texto con fuente tipográfica
  const addText = (text: string, x: number, y: number, size = 10, isBold = false, r = 0.06, g = 0.09, b = 0.16) => {
    const font = isBold ? '/F2' : '/F1';
    stream += `BT ${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(text)}) Tj ET\n`;
  };

  // 1. Banner Superior: Azul Profundo ListoApp (#001F3F -> 0, 0.122, 0.247)
  fillRect(0, H - 110, W, 110, 0, 0.122, 0.247);
  // Barra de acento dorado ListoApp (#FFC300 -> 1, 0.765, 0)
  fillRect(0, H - 116, W, 6, 1, 0.765, 0);

  // Logo & Encabezado de marca
  addText('LISTOAPP', 45, H - 50, 22, true, 1, 0.765, 0);
  addText('Soluciones y Servicios para tu Hogar', 45, H - 70, 10, false, 0.85, 0.90, 0.98);
  addText('COTIZACION OFICIAL DE PROYECTO', 45, H - 90, 11, true, 1, 1, 1);

  // Folio y Fecha (Bloque lateral derecho)
  addText(`Folio: ${data.folio}`, W - 200, H - 50, 11, true, 1, 1, 1);
  addText(`Fecha: ${data.date}`, W - 200, H - 68, 10, false, 0.85, 0.90, 0.98);
  addText('Validez: 15 dias habiles', W - 200, H - 85, 9, false, 0.85, 0.90, 0.98);

  // 2. Ficha de Información del Cliente
  fillRect(45, H - 225, 505, 95, 0.96, 0.97, 0.98);
  strokeRect(45, H - 225, 505, 95, 0.88, 0.91, 0.94);
  fillRect(45, H - 150, 505, 20, 0.90, 0.93, 0.96);
  addText('INFORMACION DEL CLIENTE Y SERVICIO', 55, H - 144, 9, true, 0.2, 0.25, 0.35);

  addText(`Cliente: ${data.fullName}`, 55, H - 170, 10, true);
  addText(`Telefono: ${data.phone}`, 55, H - 190, 10, false);
  addText(`Email: ${data.email}`, 55, H - 210, 10, false);

  addText(`Servicio: ${data.serviceCategory}`, 310, H - 170, 10, true);
  addText(`Perfil / Material: ${data.materialType.toUpperCase()}`, 310, H - 190, 10, false);
  addText(`Vidrio: ${data.glassType}`, 310, H - 210, 9, false);

  // 3. Tabla Desglosada de Ítems y Medidas
  let currentY = H - 265;
  addText('DESGLOSE DE MEDIDAS Y PIEZAS', 45, currentY, 11, true, 0, 0.122, 0.247);
  currentY -= 20;

  // Cabecera de la tabla
  fillRect(45, currentY - 5, 505, 22, 0, 0.122, 0.247);
  addText('#', 55, currentY + 2, 9, true, 1, 1, 1);
  addText('Pieza / Descripcion', 85, currentY + 2, 9, true, 1, 1, 1);
  addText('Dimensiones (An x Al)', 320, currentY + 2, 9, true, 1, 1, 1);
  addText('Cant.', 460, currentY + 2, 9, true, 1, 1, 1);
  currentY -= 25;

  // Filas de piezas
  data.items.forEach((item, index) => {
    const isEven = index % 2 === 0;
    fillRect(45, currentY - 5, 505, 22, isEven ? 0.98 : 0.94, isEven ? 0.98 : 0.95, isEven ? 0.99 : 0.96);
    strokeRect(45, currentY - 5, 505, 22, 0.90, 0.92, 0.94);

    addText(String(index + 1), 55, currentY + 1, 9, false);
    addText(item.description, 85, currentY + 1, 9, false);
    addText(item.dimensions, 320, currentY + 1, 9, true);
    addText(String(item.quantity), 470, currentY + 1, 9, true);
    currentY -= 24;
  });

  // 4. Observaciones Técnicas
  if (data.details) {
    currentY -= 10;
    addText('Observaciones del Proyecto:', 45, currentY, 9, true, 0.2, 0.25, 0.35);
    currentY -= 15;
    fillRect(45, currentY - 15, 505, 25, 0.97, 0.98, 0.99);
    strokeRect(45, currentY - 15, 505, 25, 0.88, 0.90, 0.92);
    addText(data.details.slice(0, 95), 55, currentY - 7, 9, false, 0.3, 0.35, 0.4);
    currentY -= 25;
  }

  // 5. Banner de Presupuesto Estimado
  currentY -= 20;
  fillRect(45, currentY - 45, 505, 55, 0.95, 0.98, 0.95);
  strokeRect(45, currentY - 45, 505, 55, 0.13, 0.60, 0.35, 1.5);
  addText('PRESUPUESTO PRELIMINAR ESTIMADO', 60, currentY - 15, 10, true, 0.1, 0.45, 0.2);
  addText('* Incluye perfileria estandar, corte a medida y asesoria tecnica.', 60, currentY - 35, 8, false, 0.3, 0.4, 0.3);
  addText(`$${data.estimatedPrice.toLocaleString('es-CO')} COP`, 340, currentY - 25, 18, true, 0.05, 0.45, 0.2);

  // 6. Sello de Garantía ListoApp
  currentY -= 65;
  fillRect(45, currentY - 35, 505, 40, 0.98, 0.98, 0.98);
  strokeRect(45, currentY - 35, 505, 40, 0.88, 0.90, 0.92);
  addText('GARANTIA Y RESPALDO LISTOAPP', 60, currentY - 12, 9, true, 0, 0.122, 0.247);
  addText('Trabajamos con tecnicos verificados, perfileria de alta resistencia y garantia de instalacion.', 60, currentY - 27, 8, false, 0.3, 0.35, 0.4);

  // 7. Pie de Página Corporativo
  fillRect(0, 0, W, 40, 0, 0.122, 0.247);
  addText('ListoApp Colombia - Plataforma Oficial de Cotizacion | Soporte y Linea Oficial WhatsApp', 50, 16, 8, false, 0.9, 0.95, 1);

  // Estructura de Objetos PDF
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj');
  objects.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj`);
  objects.push('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj');
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj');
  objects.push(`6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`);

  let offset = 0;
  const header = '%PDF-1.4\n';
  offset += encoder.encode(header).length;

  const xref = [0];
  let body = '';
  for (const obj of objects) {
    xref.push(offset);
    const objStr = obj + '\n';
    body += objStr;
    offset += encoder.encode(objStr).length;
  }

  const startxref = offset;
  let xrefStr = `xref\n0 ${xref.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < xref.length; i++) {
    xrefStr += xref[i].toString().padStart(10, '0') + ' 00000 n \n';
  }

  const trailer = `trailer\n<< /Size ${xref.length} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;
  const fullBytes = encoder.encode(header + body + xrefStr + trailer);

  const fileName = `Cotizacion_ListoApp_${data.folio}.pdf`;
  return new File([fullBytes], fileName, { type: 'application/pdf' });
}

/**
 * Dispara la descarga física del archivo en el dispositivo (útil para PC/Desktop o respaldo)
 */
export function triggerFileDownload(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
