import { PdfTemplate } from "@/lib/types/document";
import { headerSolicitacoesFields } from "./shared/headerSolicitacoes";

export const solicitacaoExamesComplementaresTemplate: PdfTemplate = {
  id: "solicitacao-exames-complementares",
  name: "Solicitação de Exames Complementares",
  description: "Solicitação com lista de exames complementares.",
  templateUrl: "/templates/solicitacao-exames-complementares.pdf",
  outputFileName: "solicitacao_exames_complementares",
  extraField: "examesComplementares",
  fields: [
    ...headerSolicitacoesFields,

    // Campo condicional que SERÁ IMPRESSO no PDF:
    // ajuste x/y se precisar reposicionar no formulário.
    {

  key: "examesComplementares",

  x: 75,

  y: 460,

  size: 10,

  maxWidth: 465,

  multiline: true,

  lineHeight: 15,

},
  ],
};
