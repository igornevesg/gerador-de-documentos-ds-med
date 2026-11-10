export type ClinicaRx = "ressonar" | "imed" | "";

export type PatientData = {
  anamneseAudiologica: "sem" | "com";
  nome: string;
  cpf: string;
  dataNasc: string;
  cargo: string;
  empregador: string;
  cnpj: string;
  dataExame: string;
  examesComplementares: string;
  raioXSolicitado: string;
  medicoSolicitanteNome: string;
  medicoSolicitanteCrm: string;
  clinicaRx: ClinicaRx;
};

export const initialPatientData: PatientData = {
  anamneseAudiologica: "sem",
  nome: "",
  cpf: "",
  dataNasc: "",
  cargo: "",
  empregador: "",
  cnpj: "",
  dataExame: "",
  examesComplementares: "",
  raioXSolicitado: "",
  medicoSolicitanteNome: "",
  medicoSolicitanteCrm: "",
  clinicaRx: "",
};
