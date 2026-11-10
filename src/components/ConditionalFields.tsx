import type { PatientData, ClinicaRx } from "@/lib/types/patient";

type Props = {
  patient: PatientData;
  onChange: (field: keyof PatientData, value: string) => void;
  selectedDocuments: string[];
};

export function ConditionalFields({ patient, onChange, selectedDocuments }: Props) {
  const needsExames = selectedDocuments.includes("solicitacao-exames-complementares");
  const needsRx = selectedDocuments.includes("solicitacao-rx");
  const needsAudiologica = selectedDocuments.includes("ficha-audiologica");
  if (!needsAudiologica && !needsExames && !needsRx) return null;

  return (
    <div className="section">
      <h2>Campos adicionais</h2>
      <div className="grid">
        {needsAudiologica && (
          <div className="field full">
            <label htmlFor="anamneseAudiologica">Ficha Audiológica: anamnese</label>
            <select id="anamneseAudiologica" value={patient.anamneseAudiologica}
              onChange={(e) => onChange("anamneseAudiologica", e.target.value)}>
              <option value="sem">Sem Anamnese</option>
              <option value="com">Com Anamnese</option>
            </select>
          </div>
        )}
        {needsExames && (
          <div className="field full">
            <label htmlFor="examesComplementares">Exames complementares</label>
            <textarea
              id="examesComplementares"
              value={patient.examesComplementares}
              onChange={(e) => onChange("examesComplementares", e.target.value)}
              rows={6}
              placeholder="Digite os exames complementares ou importe do ASO"
            />
            <span className="small">
              Ao importar o ASO, o sistema tenta preencher este campo automaticamente, sem avaliação clínica, audiometria, RX de tórax ou datas.
            </span>
          </div>
        )}
        {needsRx && (
          <>
            <div className="field full">
              <label htmlFor="raioXSolicitado">Raio-X a serem realizados</label>
              <textarea
                id="raioXSolicitado"
                value={patient.raioXSolicitado}
                onChange={(e) => onChange("raioXSolicitado", e.target.value)}
                rows={5}
                placeholder="Ex.: RX coluna lombar, RX ombro direito..."
              />
            </div>
            <div className="field">
              <label htmlFor="medicoSolicitanteNome">Nome do médico solicitante</label>
              <input
                id="medicoSolicitanteNome"
                value={patient.medicoSolicitanteNome}
                onChange={(e) => onChange("medicoSolicitanteNome", e.target.value)}
                placeholder="Preenchido pelo ASO ou manualmente"
              />
            </div>
            <div className="field">
              <label htmlFor="medicoSolicitanteCrm">CRM do médico solicitante</label>
              <input
                id="medicoSolicitanteCrm"
                value={patient.medicoSolicitanteCrm}
                onChange={(e) => onChange("medicoSolicitanteCrm", e.target.value)}
                placeholder="Ex.: CRM-MG 112128"
              />
            </div>
            <fieldset className="field full" style={{ border: 0, padding: 0, margin: 0 }}>
              <legend style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
                Qual Clínica será realizada o exame?
              </legend>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {([
                  ["ressonar", "Clínica Ressonar"],
                  ["imed", "Clínica Imed"],
                ] as const).map(([value, label]) => (
                  <label key={value} style={{ display: "flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
                    <input
                      type="radio"
                      name="clinicaRx"
                      style={{ width: "auto" }}
                      checked={patient.clinicaRx === value}
                      onChange={() => onChange("clinicaRx", value as ClinicaRx)}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}
      </div>
    </div>
  );
}
