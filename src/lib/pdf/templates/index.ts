import { fichaAudiologicaTemplate } from "./fichaAudiologica";
import { solicitacaoExamesComplementaresTemplate } from "./solicitacaoExamesComplementares";
import { solicitacaoRxTemplate } from "./solicitacaoRx";
import { fichaAcuidadeVisualTemplate } from "./fichaAcuidadeVisual";
export const documentTemplates = [fichaAudiologicaTemplate, solicitacaoExamesComplementaresTemplate, solicitacaoRxTemplate, fichaAcuidadeVisualTemplate];
export const defaultSelectedDocumentIds = ["ficha-audiologica"];
export function getTemplateById(id:string){return documentTemplates.find(t=>t.id===id);}
