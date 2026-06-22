import type { PatientData } from "@/lib/types/patient";
import { formatCNPJ, formatCPF, formatDate } from "@/lib/format/masks";
import { extractExamesProcedimentosBlock, sanitizeExamesComplementares } from "./extractComplementaryExams";
import * as pdfjsLib from "pdfjs-dist";
type ExtractedData = Partial<PatientData> & { extractedText?: string; examesProcedimentosRaw?: string; };
type TextItem = { str:string; x:number; y:number; };
function cleanValue(v?:string){return (v||"").replace(/[|]+/g," ").replace(/\s+/g," ").trim();}
function groupItemsIntoLines(items:TextItem[]){const sorted=[...items].sort((a,b)=>Math.abs(b.y-a.y)>2?b.y-a.y:a.x-b.x);const lines:TextItem[][]=[];const tolerance=2.5;for(const item of sorted){const last=lines[lines.length-1];if(!last){lines.push([item]);continue;}if(Math.abs(last[0].y-item.y)<=tolerance)last.push(item);else lines.push([item]);}return lines.map(line=>line.sort((a,b)=>a.x-b.x).map(i=>i.str).join(" ").replace(/\s+/g," ").trim());}
function findLine(lines:string[],labelRegex:string){return lines.find(line=>new RegExp(labelRegex,"i").test(line))||"";}
function esc(s:string){return s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
function extractAfterLabelInLine(line: string, label: string) {

  if (!line) return "";

  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(`${escaped}\\s*:?\\s*(.*)$`, "i");

  const match = line.match(regex);

  return cleanValue(match?.[1]);

}
function extractBetweenLabels(line:string,startLabel:string,endLabel?:string){if(!line)return"";const start=esc(startLabel);const regex=endLabel?new RegExp(`${start}\\s*:?\\s*(.*?)\\s*(?=${esc(endLabel)}\\s*:|$)`,`i`):new RegExp(`${start}\\s*:?\\s*(.*)$`,`i`);return cleanValue(line.match(regex)?.[1]);}
function extractFirstMatch(text:string,patterns:RegExp[]){for(const p of patterns){const m=text.match(p);if(m?.[1])return cleanValue(m[1]);}return"";}
function buildPdfWorkerUrl(){return new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();}
export async function extractAsoDataFromPdf(file:File):Promise<ExtractedData>{const arrayBuffer=await file.arrayBuffer();pdfjsLib.GlobalWorkerOptions.workerSrc=buildPdfWorkerUrl();const pdf=await pdfjsLib.getDocument({data:arrayBuffer}).promise;const page=await pdf.getPage(1);const content=await page.getTextContent();const items:TextItem[]=(content.items as any[]).map(item=>{if(!("str" in item)||!item.str)return null;const transform=item.transform||[1,0,0,1,0,0];return{str:String(item.str).trim(),x:Number(transform[4]||0),y:Number(transform[5]||0)};}).filter(Boolean) as TextItem[];const lines=groupItemsIntoLines(items);const fullText=lines.join("\n");const razaoLine=findLine(lines,"Raz[aã]o\\s+Social");const nomeLine=findLine(lines,"\\bNome\\b");const cargoLine=findLine(lines,"\\bCargo\\b");const emissaoLine=findLine(lines,"Data\\s+de\\s+Emiss[aã]o");const dataNascLine = findLine(lines, "Data\\s*Nasc");const empregador=extractBetweenLabels(razaoLine,"Razão Social","CNPJ")||extractFirstMatch(fullText,[/Raz[aã]o Social\s*:?\s*(.*?)\s*(?=CNPJ\s*:|$)/i]);const cnpj=formatCNPJ(extractBetweenLabels(razaoLine,"CNPJ")||extractFirstMatch(fullText,[/CNPJ\s*:?\s*([\d./-]{14,18})/i]));const nome=extractBetweenLabels(nomeLine,"Nome","CPF")||extractFirstMatch(fullText,[/Nome\s*:?\s*(.*?)\s*(?=CPF\s*:|$)/i]);const cpf=formatCPF(extractBetweenLabels(nomeLine,"CPF","RG")||extractFirstMatch(fullText,[/CPF\s*:?\s*([\d.-]{11,14})/i]));const rg="";const dataNasc = formatDate(

  extractBetweenLabels(dataNascLine, "Data Nasc") ||

  extractAfterLabelInLine(dataNascLine, "Data Nasc") ||

  extractFirstMatch(fullText, [

    /Data\s*Nasc\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i,

  ])

);const cargoRaw =

  extractBetweenLabels(cargoLine, "Cargo", "Setor") ||

  extractBetweenLabels(cargoLine, "Cargo", "Função") ||

  extractBetweenLabels(cargoLine, "Cargo", "PCD") ||

  extractBetweenLabels(cargoLine, "Cargo", "Data de Emissão") ||

  extractFirstMatch(fullText, [

    /Cargo\s*:?\s*(.*?)\s*(?=PCD\s*:|RG\s*:|Data de Emiss[aã]o|$)/i,

  ]);

const cargo = cargoRaw

  .replace(/\bPCD\s*:?\s*SIM\b/gi, "")

  .replace(/\bPCD\s*:?\s*N[ÃA]O\b/gi, "")

  .trim();const dataExame=formatDate(extractBetweenLabels(emissaoLine,"Data de Emissão")||extractFirstMatch(fullText,[/Data de Emiss[aã]o\s*:?\s*(\d{2}\/\d{2}\/\d{4})/i]));const examesProcedimentosRaw=extractExamesProcedimentosBlock(fullText);const examesComplementares=sanitizeExamesComplementares(examesProcedimentosRaw);return{nome,cpf,dataNasc,cargo,empregador,rg,cnpj,dataExame,examesComplementares,examesProcedimentosRaw,extractedText:fullText};}
