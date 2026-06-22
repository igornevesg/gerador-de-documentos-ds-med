import { PatientData } from "./patient";
export type PdfFieldConfig = { key:keyof PatientData; x:number; y:number; size?:number; maxWidth?:number; page?:number; lineHeight?:number; multiline?:boolean; };
export type ExtraFieldType = "examesComplementares" | "raioXSolicitado";
export type PdfTemplate = { id:string; name:string; description?:string; templateUrl:string; outputFileName:string; fields:PdfFieldConfig[]; extraField?:ExtraFieldType; };
