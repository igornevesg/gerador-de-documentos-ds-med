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
    // Impressos abaixo de "MÉDICO SOLICITANTE" (centro da página).
    { key: "medicoSolicitanteNome", x: 170, y: 365, size: 11, maxWidth: 330 },
    { key: "medicoSolicitanteCrm", x: 225, y: 346, size: 10, maxWidth: 210 },
  ],
};
