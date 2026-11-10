import { fichaAudiologicaTemplate, fichaAudiologicaComAnamneseTemplate } from "./fichaAudiologica";
import { solicitacaoExamesComplementaresTemplate } from "./solicitacaoExamesComplementares";
import { solicitacaoRxTemplate } from "./solicitacaoRx";
import { fichaAcuidadeVisualTemplate } from "./fichaAcuidadeVisual";
export const documentTemplates = [fichaAudiologicaTemplate, solicitacaoExamesComplementaresTemplate, solicitacaoRxTemplate, fichaAcuidadeVisualTemplate];
export const defaultSelectedDocumentIds = ["ficha-audiologica"];
export function getTemplateById(id:string, anamneseAudiologica: "sem" | "com" = "sem"){if(id === "ficha-audiologica" && anamneseAudiologica === "com") return fichaAudiologicaComAnamneseTemplate;return documentTemplates.find(t=>t.id===id);}
