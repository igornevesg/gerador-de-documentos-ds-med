import { PdfTemplate } from "@/lib/types/document";
import { headerSolicitacoesFields } from "./shared/headerSolicitacoes";

export const solicitacaoRxTemplate: PdfTemplate = {
  id: "solicitacao-rx",
  name: "Solicitação de RX",
  description: "Solicitação de raio-X.",
  templateUrl: "/templates/solicitacao-rx.pdf",
  outputFileName: "solicitacao_rx",
  extraField: "raioXSolicitado",
  fields: [
    ...headerSolicitacoesFields,

    // Campo condicional que SERÁ IMPRESSO no PDF:
    // ajuste x/y se precisar reposicionar no formulário.
    {
      key: "raioXSolicitado",
      x: 75,
      y: 365,
      size: 10,
      maxWidth: 465,
      multiline: true,
      lineHeight: 14,
    },
  ],
};
