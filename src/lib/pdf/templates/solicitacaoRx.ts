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
    // Coordenadas do texto de exames previamente calibradas; mantidas.
    { key: "raioXSolicitado", x: 75, y: 480, size: 10, maxWidth: 465, multiline: true, lineHeight: 14 },
    // Preenchimento do cabeçalho próprio do formulário RX.
    { key: "clinicaRxNome", x: 99, y: 690, size: 11, maxWidth: 415 },
    { key: "clinicaRxEndereco", x: 224, y: 620, size: 10.5, maxWidth: 340 },
    // Centro do título MÉDICO SOLICITANTE no PDF base: x = 294 pt.
    // x indica o início da caixa; align centraliza pela largura real do texto.
    { key: "medicoSolicitanteNome", x: 129, y: 365, size: 11, maxWidth: 330, align: "center" },
    { key: "medicoSolicitanteCrm", x: 189, y: 346, size: 10, maxWidth: 210, align: "center" },
  ],
};
