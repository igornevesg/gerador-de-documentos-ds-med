import { PdfFieldConfig } from "@/lib/types/document";
export const headerSolicitacoesFields: PdfFieldConfig[] = [
  // Cargo e CNPJ não são preenchidos nesses formulários.
  { key:"nome", x:72, y:866, size:11, maxWidth:360 },
  { key:"cpf", x:442, y:766, size:11, maxWidth:170 },
  { key:"dataNasc", x:479, y:747, size:11, maxWidth:150 },
  { key: "cargo", x: 80, y: 728, size: 11, maxWidth: 330 },
  { key: "dataExame", x: 477, y: 728, size: 11, maxWidth: 140 },
];
