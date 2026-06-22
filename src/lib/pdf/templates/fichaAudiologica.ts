import { PdfTemplate } from "@/lib/types/document";
import { headerAudiologicaFields } from "./shared/headerAudiologica";
export const fichaAudiologicaTemplate: PdfTemplate = { id:"ficha-audiologica", name:"Ficha Audiológica", description:"Ficha de avaliação audiológica ocupacional.", templateUrl:"/templates/ficha-audiologica.pdf", outputFileName:"ficha_audiologica", fields:[...headerAudiologicaFields] };
