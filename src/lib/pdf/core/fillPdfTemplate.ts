import { PDFDocument, StandardFonts, rgb, PDFName } from "pdf-lib";
import { PatientData } from "@/lib/types/patient";
import { PdfTemplate } from "@/lib/types/document";
import { fitTextToWidth, wrapTextToWidth } from "./fitText";

function toTitleCase(text: string): string {

  const lowerWords = ["de", "da", "do", "das", "dos", "e"];

  return text

    .toLowerCase()

    .split(" ")

    .map((word, index) => {

      if (index > 0 && lowerWords.includes(word)) {

        return word;

      }

      return word.charAt(0).toUpperCase() + word.slice(1);

    })

    .join(" ");

}

export async function fillPdfTemplate(
  template: PdfTemplate,
  data: PatientData
): Promise<Uint8Array> {
  const existingPdfBytes = await fetch(template.templateUrl).then((res) => {
    if (!res.ok) {
      throw new Error(`Não foi possível carregar ${template.templateUrl}`);
    }

    return res.arrayBuffer();
  });

  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    page.node.delete(PDFName.of("Annots"));
  });

  const firstPage = pages[0];

  if (firstPage && data.nome?.trim()) {

  firstPage.drawText(toTitleCase(data.nome.replace(/\s+/g, " ").trim()), {

    x: 72,

    y: 766,

    size: 11,

    font,

    color: rgb(0, 0, 0),

  });

}

  for (const field of template.fields) {
    if (field.key === "nome") continue;

    const page = pages[(field.page ?? 1) - 1];
    if (!page) continue;

let rawValue = field.multiline

  ? String(data[field.key] ?? "")

      .replace(/\r/g, "\n")

      .replace(/[ \t]+/g, " ")

      .replace(/\n{2,}/g, "\n")

      .trim()

  : String(data[field.key] ?? "")

      .replace(/\s+/g, " ")

      .trim();

const titleCaseFields = [

  "nome",

  "cargo",

  "empregador",

  "examesComplementares",

  "raioXSolicitado",

];

if (titleCaseFields.includes(field.key)) {

  rawValue = toTitleCase(rawValue);

}

    if (!rawValue) continue;

    const size = field.size ?? 10;
    const maxWidth = field.maxWidth ?? 200;
    const lineHeight = field.lineHeight ?? size + 3;

    if (field.multiline) {

  const lines =

    field.key === "examesComplementares"

      ? rawValue

          .split("\n")

          .map((item) => item.trim())

          .filter(Boolean)

      : wrapTextToWidth(rawValue, size, maxWidth);

  lines.forEach((line, index) => {

    page.drawText(line, {

      x: field.x,

      y: field.y - index * lineHeight,

      size,

      font,

      color: rgb(0, 0, 0),

    });

  });

  continue;

}

    page.drawText(fitTextToWidth(rawValue, size, maxWidth), {
      x: field.x,
      y: field.y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
  }

  return pdfDoc.save();
}