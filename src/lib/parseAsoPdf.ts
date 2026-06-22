import type { FichaData } from "./generateFichaPdf";

import * as pdfjsLib from "pdfjs-dist";

type ExtractedData = Partial<FichaData> & {

  extractedText?: string;

};

type TextItem = {

  str: string;

  x: number;

  y: number;

};

function normalizeSpaces(text: string) {

  return text

    .replace(/\u00A0/g, " ")

    .replace(/[ \t]+/g, " ")

    .replace(/\s*\n\s*/g, "\n")

    .trim();

}

function onlyDigits(value: string) {

  return (value || "").replace(/\D/g, "");

}

function formatCPF(value: string) {

  const v = onlyDigits(value).slice(0, 11);

  if (!v) return "";

  return v

    .replace(/(\d{3})(\d)/, "$1.$2")

    .replace(/(\d{3})(\d)/, "$1.$2")

    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

}

function formatCNPJ(value: string) {

  const v = onlyDigits(value).slice(0, 14);

  if (!v) return "";

  return v

    .replace(/(\d{2})(\d)/, "$1.$2")

    .replace(/(\d{3})(\d)/, "$1.$2")

    .replace(/(\d{3})(\d)/, "$1/$2")

    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");

}

function formatDate(value: string) {

  const v = onlyDigits(value).slice(0, 8);

  if (!v) return "";

  if (v.length <= 2) return v;

  if (v.length <= 4) return v.replace(/(\d{2})(\d+)/, "$1/$2");

  return v.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");

}

function cleanValue(v?: string) {

  return (v || "")

    .replace(/[|]+/g, " ")

    .replace(/\s+/g, " ")

    .trim();

}

/**

 * Agrupa os pedaços do PDF por linha, usando a coordenada Y.

 * Depois ordena cada linha da esquerda para a direita (X).

 */

function groupItemsIntoLines(items: TextItem[]) {

  const sorted = [...items].sort((a, b) => {

    // primeiro por Y (de cima para baixo), depois por X

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

    const refY = lastLine[0].y;

    if (Math.abs(refY - item.y) <= tolerance) {

      lastLine.push(item);

    } else {

      lines.push([item]);

    }

  }

  return lines.map((line) =>

    line

      .sort((a, b) => a.x - b.x)

      .map((i) => i.str)

      .join(" ")

      .replace(/\s+/g, " ")

      .trim()

  );

}

function findLine(lines: string[], label: string) {

  return lines.find((line) => new RegExp(label, "i").test(line)) || "";

}

function extractAfterLabelInLine(line: string, label: string) {

  if (!line) return "";

  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(`${escaped}\\s*:?\\s*(.*)$`, "i");

  const m = line.match(regex);

  return cleanValue(m?.[1]);

}

/**

 * Extrai valor entre dois rótulos na mesma linha.

 * Exemplo:

 * Nome: JOÃO SILVA CPF: 123...

 */

function extractBetweenLabels(line: string, startLabel: string, endLabel?: string) {

  if (!line) return "";

  const start = startLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const end = endLabel ? endLabel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") : null;

  const regex = end

    ? new RegExp(`${start}\\s*:?\\s*(.*?)\\s*(?=${end}\\s*:|$)`, "i")

    : new RegExp(`${start}\\s*:?\\s*(.*)$`, "i");

  const m = line.match(regex);

  return cleanValue(m?.[1]);

}

function extractFirstMatch(text: string, patterns: RegExp[]) {

  for (const pattern of patterns) {

    const m = text.match(pattern);

    if (m?.[1]) return cleanValue(m[1]);

  }

  return "";

}

function findLineContainingAll(lines: string[], labels: string[]) {

  return (

    lines.find((line) =>

      labels.every((label) => new RegExp(label, "i").test(line))

    ) || ""

  );

}

export async function extractAsoDataFromPdf(file: File): Promise<ExtractedData> {

  const arrayBuffer = await file.arrayBuffer();

  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const page = await pdf.getPage(1);

  const content = await page.getTextContent();

  const items: TextItem[] = (content.items as any[])

    .map((item) => {

      if (!("str" in item) || !item.str) return null;

      const transform = item.transform || [1, 0, 0, 1, 0, 0];

      const x = Number(transform[4] || 0);

      const y = Number(transform[5] || 0);

      return {

        str: String(item.str).trim(),

        x,

        y,

      };

    })

    .filter(Boolean) as TextItem[];

  const lines = groupItemsIntoLines(items);

  const fullText = normalizeSpaces(lines.join("\n"));

  // Linhas principais

  const razaoLine =

    findLineContainingAll(lines, ["Raz[aã]o\\s+Social", "CNPJ"]) ||

    findLine(lines, "Raz[aã]o\\s+Social");

  const nomeLine =

    findLineContainingAll(lines, ["\\bNome\\b", "\\bCPF\\b"]) ||

    findLine(lines, "\\bNome\\b");

  const cargoLine = findLine(lines, "\\bCargo\\b");

  const emissaoLine = findLine(lines, "Data\\s+de\\s+Emiss[aã]o");

  const dataNascLine = findLine(lines, "Data\\s*Nasc");

  // =========================

  // EMPREGADOR

  // =========================

  const empregador =

    extractBetweenLabels(razaoLine, "Razão Social", "CNPJ") ||

    extractFirstMatch(fullText, [

      /Raz[aã]o Social\s*:?\s*(.*?)\s*(?=CNPJ\s*:|$)/i,

    ]);

  // =========================

  // CNPJ

  // =========================

  const cnpj = formatCNPJ(

    extractBetweenLabels(razaoLine, "CNPJ") ||

      extractFirstMatch(fullText, [

        /CNPJ\s*:?\s*([\d./-]{14,18})/i,

      ])

  );

  // =========================

  // NOME

  // =========================

  const nome =

    extractBetweenLabels(nomeLine, "Nome", "CPF") ||

    extractFirstMatch(fullText, [

      /Nome\s*:?\s*(.*?)\s*(?=CPF\s*:|$)/i,

    ]);

  // =========================

  // CPF

  // =========================

  const cpf = formatCPF(

    extractBetweenLabels(nomeLine, "CPF", "RG") ||

      extractBetweenLabels(nomeLine, "CPF", "Data Nasc") ||

      extractFirstMatch(fullText, [

        /CPF\s*:?\s*([\d.-]{11,14})/i,

      ])

  );

  // =========================

  // DATA NASC

  // =========================

  const dataNasc = formatDate(

  extractBetweenLabels(dataNascLine, "Data Nasc") ||

    extractAfterLabelInLine(dataNascLine, "Data Nasc") ||

    extractFirstMatch(fullText, [

      /Data\s*Nasc\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,

    ])

);

  // =========================

  // CARGO

  // =========================

  // Regra principal:

  // pega o que vem depois de "Cargo:" e para antes de:

  // PCD:, Setor:, Função:, RG:, Data de Emissão: ou fim da linha

  const cargo =

    extractFirstMatch(cargoLine, [

      /Cargo\s*:?\s*(.*?)\s*(?=PCD\s*:|Setor\s*:|Fun[cç][aã]o\s*:|RG\s*:|Data\s+de\s+Emiss[aã]o\s*:|$)/i,

    ]) ||

    extractFirstMatch(fullText, [

      /Cargo\s*:?\s*(.*?)\s*(?=PCD\s*:|Setor\s*:|Fun[cç][aã]o\s*:|RG\s*:|Data\s+de\s+Emiss[aã]o\s*:|$)/i,

    ]);

  // =========================

  // DATA DO EXAME = DATA DE EMISSÃO

  // =========================

  const dataExame = formatDate(

    extractBetweenLabels(emissaoLine, "Data de Emissão") ||

      extractFirstMatch(fullText, [

        /Data\s+de\s+Emiss[aã]o\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,

      ])

  );

  return {

    nome,

    cpf,

    dataNasc,

    cargo,

    empregador,

    cnpj,

    dataExame,

    extractedText: lines.join("\n"),

  };

}