import { PatientData } from "./patient";
export type PdfFieldConfig = { key:keyof PatientData | "clinicaRxNome" | "clinicaRxEndereco"; x:number; y:number; size?:number; maxWidth?:number; page?:number; lineHeight?:number; multiline?:boolean; align?:"left" | "center"; };
export type ExtraFieldType = "examesComplementares" | "raioXSolicitado";
export type PdfTemplate = { id:string; name:string; description?:string; templateUrl:string; outputFileName:string; fields:PdfFieldConfig[]; extraField?:ExtraFieldType; };
