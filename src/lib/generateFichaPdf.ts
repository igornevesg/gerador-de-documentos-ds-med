import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export type FichaData = {
  nome: string;
  cpf: string;
  dataNasc: string;
  cargo: string;
  empregador: string;
  rg: string;
  cnpj: string;
  dataExame: string;
};

type DrawField = {
  value: string;
  x: number;
  y: number;
  size?: number;
  maxWidth?: number;
};

/**
 * Ajuste conforme o seu PDF modelo.
 * Você comentou que já conseguiu calibrar manualmente; então mantenha aqui
 * os valores que estiverem corretos no seu ambiente.
 */
const FIELD_MAP: Record<keyof FichaData, Omit<DrawField, "value">> = {

  nome: { x: 72, y: 766, size: 11, maxWidth: 360 },

  cpf: { x: 442, y: 766, size: 11, maxWidth: 170 },

  dataNasc: { x: 479, y: 747, size: 11, maxWidth: 150 },

  cargo: { x: 80, y: 728, size: 11, maxWidth: 330 },

  rg: { x: 437, y: 728, size: 11, maxWidth: 170 },

  empregador: { x: 116, y: 708, size: 11, maxWidth: 300 },

  cnpj: { x: 449, y: 708, size: 11, maxWidth: 170 },

  dataExame: { x: 126, y: 689, size: 11, maxWidth: 140 },

};

function fitText(value: string, maxChars: number) {
  if (value.length <= maxChars) return value;
  return value.slice(0, Math.max(0, maxChars - 1)) + "…";
}

export async function generateFichaPdf(data: FichaData): Promise<Uint8Array> {
  const existingPdfBytes = await fetch("/ficha-modelo.pdf").then((res) => {
    if (!res.ok) {
      throw new Error("Não foi possível carregar /public/ficha-modelo.pdf");
    }
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const page = pdfDoc.getPages()[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const color = rgb(0, 0, 0);

  const draw = (field: DrawField) => {
    const size = field.size ?? 10;
    const maxWidth = field.maxWidth ?? 200;
    const avgCharWidth = size * 0.52;
    const maxChars = Math.max(1, Math.floor(maxWidth / avgCharWidth));
    const text = fitText(field.value || "", maxChars);

    page.drawText(text, {
      x: field.x,
      y: field.y,
      size,
      font,
      color,
      maxWidth,
    });
  };

  draw({ value: data.nome, ...FIELD_MAP.nome });
  draw({ value: data.cpf, ...FIELD_MAP.cpf });
  draw({ value: data.dataNasc, ...FIELD_MAP.dataNasc });
  draw({ value: data.cargo, ...FIELD_MAP.cargo });
  draw({ value: data.rg, ...FIELD_MAP.rg });
  draw({ value: data.empregador, ...FIELD_MAP.empregador });
  draw({ value: data.cnpj, ...FIELD_MAP.cnpj });
  draw({ value: data.dataExame, ...FIELD_MAP.dataExame });

  return await pdfDoc.save();
}
