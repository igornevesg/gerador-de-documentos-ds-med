import { formatCNPJ, formatCPF, formatDate } from "@/lib/format/masks";
import type { PatientData } from "@/lib/types/patient";
import {
  extractExamesProcedimentosBlock,
  sanitizeExamesComplementares,
} from "./extractComplementaryExams";
import * as pdfjsLib from "pdfjs-dist";

type ExtractedData = Partial<PatientData> & {
  extractedText?: string;
  examesProcedimentosRaw?: string;
};

type TextItem = {
  str: string;
  x: number;
  y: number;
};

function cleanValue(value?: string) {
  return (value || "")
    .replace(/[|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function groupItemsIntoLines(items: TextItem[]) {
  const sorted = [...items].sort((a, b) => {
    if (Math.abs(b.y - a.y) > 2) return b.y - a.y;
    return a.x - b.x;
  });

  const lines: TextItem[][] = [];
  const tolerance = 2.5;

  for (const item of sorted) {
    const lastLine = lines[lines.length - 1];

    if (!lastLine) {
      lines.push([item]);
      continue;
    }

    if (Math.abs(lastLine[0].y - item.y) <= tolerance) {
      lastLine.push(item);
    } else {
      lines.push([item]);
    }
  }

  return lines.map((line) =>
    line
      .sort((a, b) => a.x - b.x)
      .map((item) => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function findLine(lines: string[], labelRegex: string) {
  return lines.find((line) => new RegExp(labelRegex, "i").test(line)) || "";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractBetweenLabels(
  line: string,
  startLabel: string,
  endLabel?: string
) {
  if (!line) return "";

  const start = escapeRegex(startLabel);
  const optionalPunctuation = "\\s*[.:]?\\s*";

  const regex = endLabel
    ? new RegExp(
        `${start}${optionalPunctuation}(.*?)\\s*(?=${escapeRegex(
          endLabel
        )}${optionalPunctuation}|$)`,
        "i"
      )
    : new RegExp(`${start}${optionalPunctuation}(.*)$`, "i");

  return cleanValue(line.match(regex)?.[1]);
}

function extractFirstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return cleanValue(match[1]);
  }

  return "";
}

function extractFirstDate(text: string) {
  return (
    text.match(/\b(\d{2}\/\d{2}\/\d{4})\b/)?.[1] || ""
  );
}

function buildPdfWorkerUrl() {
  return new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();
}

export async function extractAsoDataFromPdf(
  file: File
): Promise<ExtractedData> {
  const arrayBuffer = await file.arrayBuffer();

  pdfjsLib.GlobalWorkerOptions.workerSrc = buildPdfWorkerUrl();

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const content = await page.getTextContent();

  const items: TextItem[] = (content.items as any[])
    .map((item) => {
      if (!("str" in item) || !item.str) return null;

      const transform = item.transform || [1, 0, 0, 1, 0, 0];

      return {
        str: String(item.str).trim(),
        x: Number(transform[4] || 0),
        y: Number(transform[5] || 0),
      };
    })
    .filter(Boolean) as TextItem[];

  const lines = groupItemsIntoLines(items);
  const fullText = lines.join("\n");

  const razaoLine = findLine(lines, "Raz[aã]o\\s+Social");
  const nomeLine = findLine(lines, "\\bNome\\b.*\\bCPF\\b");
  const dataCargoLine = findLine(
    lines,
    "Data\\s*(?:de\\s+Nascimento|Nasc\\.?)"
  );
  const cargoLine =
    findLine(lines, "\\bCargo\\b") ||
    findLine(lines, "\\bFun[cç][aã]o\\b");
  const emissaoLine = findLine(lines, "Data\\s+de\\s+Emiss[aã]o");

  const empregador =
    extractBetweenLabels(razaoLine, "Razão Social", "CNPJ") ||
    extractFirstMatch(fullText, [
      /Raz[aã]o\s+Social\s*[.:]?\s*(.*?)\s*(?=CNPJ\s*[.:]?|$)/i,
    ]);

  const cnpj = formatCNPJ(
    extractBetweenLabels(razaoLine, "CNPJ") ||
      extractFirstMatch(fullText, [
        /CNPJ\s*[.:]?\s*([\d./-]{14,18})/i,
      ])
  );

  // Novo ASO: Nome: ... Sexo: M CPF: ...
  // ASO antigo: Nome: ... CPF: ...
  const nome =
    extractBetweenLabels(nomeLine, "Nome", "Sexo") ||
    extractBetweenLabels(nomeLine, "Nome", "CPF") ||
    extractFirstMatch(fullText, [
      /Nome\s*[.:]?\s*(.*?)\s*(?=Sexo\s*[.:]?|CPF\s*[.:]?|$)/i,
    ]);

  const cpf = formatCPF(
    extractBetweenLabels(nomeLine, "CPF") ||
      extractFirstMatch(fullText, [
        /CPF\s*[.:]?\s*([\d.-]{11,14})/i,
      ])
  );

  const dataNasc = formatDate(
    extractBetweenLabels(dataCargoLine, "Data Nasc", "Cargo") ||
      extractBetweenLabels(dataCargoLine, "Data Nasc.", "Cargo") ||
      extractBetweenLabels(dataCargoLine, "Data de Nascimento", "Idade") ||
      extractBetweenLabels(dataCargoLine, "Data de Nascimento", "Cargo") ||
      extractFirstMatch(fullText, [
        /Data\s*Nasc\.?\s*[.:]?\s*(\d{2}\/\d{2}\/\d{4})/i,
        /Data\s+de\s+Nascimento\s*[.:]?\s*(\d{2}\/\d{2}\/\d{4})/i,
      ])
  );

  const cargoRaw =
    extractBetweenLabels(cargoLine, "Cargo", "Setor") ||
    extractBetweenLabels(cargoLine, "Função", "Setor") ||
    extractBetweenLabels(cargoLine, "Cargo", "PCD") ||
    extractBetweenLabels(cargoLine, "Cargo", "Data de Emissão") ||
    extractFirstMatch(fullText, [
      /Cargo\s*[.:]?\s*(.*?)\s*(?=Setor\s*[.:]?|PCD\s*[.:]?|Data\s+de\s+Emiss[aã]o\s*[.:]?|$)/i,
      /Fun[cç][aã]o\s*[.:]?\s*(.*?)\s*(?=Setor\s*[.:]?|$)/i,
    ]);

  const cargo = cargoRaw
    .replace(/\bPCD\s*[.:]?\s*SIM\b/gi, "")
    .replace(/\bPCD\s*[.:]?\s*N[ÃA]O\b/gi, "")
    .trim();

  const examesProcedimentosRaw = extractExamesProcedimentosBlock(fullText);
  const examesComplementares = sanitizeExamesComplementares(
    examesProcedimentosRaw
  );

  // Modelo antigo: usa Data de Emissão.
  // Modelo novo: usa a primeira data da relação de exames complementares.
  const dataExame = formatDate(
    extractBetweenLabels(emissaoLine, "Data de Emissão") ||
      extractFirstMatch(fullText, [
        /Data\s+de\s+Emiss[aã]o\s*[.:]?\s*(\d{2}\/\d{2}\/\d{4})/i,
      ]) ||
      extractFirstDate(examesProcedimentosRaw)
  );

  return {
    nome,
    cpf,
    dataNasc,
    cargo,
    empregador,
    cnpj,
    dataExame,
    examesComplementares,
    examesProcedimentosRaw,
    extractedText: fullText,
  };
}
