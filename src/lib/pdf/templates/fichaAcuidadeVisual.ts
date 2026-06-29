import { PdfTemplate } from "@/lib/types/document";
import { headerAudiologicaFields } from "./shared/headerAudiologica";

export const fichaAcuidadeVisualTemplate: PdfTemplate = {
  id: "ficha-acuidade-visual",
  name: "Ficha de Acuidade Visual",
  description: "Ficha de avaliação de acuidade visual.",
  templateUrl: "/templates/ficha-acuidade-visual.pdf",
  outputFileName: "ficha_acuidade_visual",
  fields: [
    ...headerAudiologicaFields,
  ],
};