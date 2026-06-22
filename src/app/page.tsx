"use client";

import { useRef, useState } from "react";
import { saveAs } from "file-saver";
import { FichaData, generateFichaPdf } from "@/lib/generateFichaPdf";
import { extractAsoDataFromPdf } from "@/lib/parseAsoPdf";

const initialState: FichaData = {
  nome: "",
  cpf: "",
  dataNasc: "",
  cargo: "",
  empregador: "",
  rg: "",
  cnpj: "",
  dataExame: "",
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatCPF(value: string) {
  const v = onlyDigits(value).slice(0, 11);
  return v
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatCNPJ(value: string) {
  const v = onlyDigits(value).slice(0, 14);
  return v
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function formatDate(value: string) {
  const v = onlyDigits(value).slice(0, 8);
  if (v.length <= 2) return v;
  if (v.length <= 4) return v.replace(/(\d{2})(\d+)/, "$1/$2");
  return v.replace(/(\d{2})(\d{2})(\d+)/, "$1/$2/$3");
}

export default function HomePage() {
  const [form, setForm] = useState<FichaData>(initialState);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string>("");
  const [importError, setImportError] = useState<string>("");
  const [showDebugText, setShowDebugText] = useState(false);
  const [debugText, setDebugText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof FichaData, value: string) => {
    let next = value;
    if (field === "cpf") next = formatCPF(value);
    if (field === "cnpj") next = formatCNPJ(value);
    if (field === "dataNasc" || field === "dataExame") next = formatDate(value);

    setForm((prev) => ({ ...prev, [field]: next }));
  };

  const clearForm = () => {
    setForm(initialState);
    setImportStatus("");
    setImportError("");
    setDebugText("");
  };

  const onImportClick = () => fileInputRef.current?.click();

  const onImportPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStatus("");
    setImportError("");

    try {
      const extracted = await extractAsoDataFromPdf(file);

      setForm((prev) => ({
        ...prev,
        nome: extracted.nome || prev.nome,
        cpf: extracted.cpf || prev.cpf,
        dataNasc: extracted.dataNasc || prev.dataNasc,
        cargo: extracted.cargo || prev.cargo,
        empregador: extracted.empregador || prev.empregador,
        rg: extracted.rg || prev.rg,
        cnpj: extracted.cnpj || prev.cnpj,
        dataExame: extracted.dataExame || prev.dataExame,
      }));

      setDebugText(extracted.extractedText || "");

      const filled = [
        extracted.nome && "Nome",
        extracted.cpf && "CPF",
        extracted.dataNasc && "Data nasc",
        extracted.cargo && "Cargo",
        extracted.empregador && "Empregador",
        extracted.rg !== undefined && "RG",
        extracted.cnpj && "CNPJ",
        extracted.dataExame && "Data do exame",
      ].filter(Boolean);

      if (filled.length === 0) {
        setImportError(
          "Não consegui localizar os campos no PDF enviado. Se quiser, me mande um exemplo desse PDF depois para eu reforçar o parser."
        );
      } else {
        setImportStatus(`PDF importado. Campos preenchidos: ${filled.join(", ")}.`);
      }
    } catch (error) {
      console.error(error);
      setImportError(
        "Não foi possível ler esse PDF. Se ele for um PDF escaneado ou sem texto selecionável, será preciso adicionar OCR numa próxima versão."
      );
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const pdfBytes = await generateFichaPdf(form);
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const safeName = (form.nome || "paciente")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      saveAs(blob, `ficha_audiologica_${safeName || "paciente"}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar o PDF. Confira se o arquivo ficha-modelo.pdf está em /public.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div className="card">
        <h1>Ficha Audiológica</h1>
        <p className="subtitle">
          Você pode <strong>preencher manualmente</strong> ou <strong>importar o PDF do ASO</strong> para preencher o formulário automaticamente.
        </p>

        <div className="actions" style={{ marginTop: 0, marginBottom: 20 }}>
          <button className="ghost" type="button" onClick={onImportClick} disabled={importing}>
            {importing ? "Importando PDF..." : "Importar PDF do ASO"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={onImportPdf}
            style={{ display: "none" }}
          />
        </div>

        <p className="small">
          Regras do importador: <strong>Nome</strong> ← Nome, <strong>CPF</strong> ← CPF, <strong>Data Nasc</strong> ← Data Nasc,
          <strong> Cargo</strong> ← Cargo, <strong>Empregador</strong> ← Razão Social, <strong>CNPJ</strong> ← CNPJ,
          <strong> RG</strong> ← RG, <strong>Data do exame</strong> ← Data de Emissão.
        </p>

        {importStatus && <div className="success">{importStatus}</div>}
        {importError && <div className="warning">{importError}</div>}

        <form onSubmit={onSubmit}>
          <div className="grid" style={{ marginTop: 20 }}>
            <div className="field full">
              <label htmlFor="nome">Nome</label>
              <input
                id="nome"
                value={form.nome}
                onChange={(e) => update("nome", e.target.value)}
                placeholder="Nome completo do paciente"
              />
            </div>

            <div className="field">
              <label htmlFor="cpf">CPF</label>
              <input
                id="cpf"
                value={form.cpf}
                onChange={(e) => update("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="field">
              <label htmlFor="dataNasc">Data de nascimento</label>
              <input
                id="dataNasc"
                value={form.dataNasc}
                onChange={(e) => update("dataNasc", e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>

            <div className="field">
              <label htmlFor="cargo">Cargo</label>
              <input
                id="cargo"
                value={form.cargo}
                onChange={(e) => update("cargo", e.target.value)}
                placeholder="Cargo do paciente"
              />
            </div>

            <div className="field">
              <label htmlFor="rg">RG</label>
              <input
                id="rg"
                value={form.rg}
                onChange={(e) => update("rg", e.target.value)}
                placeholder="RG"
              />
            </div>

            <div className="field full">
              <label htmlFor="empregador">Empregador</label>
              <input
                id="empregador"
                value={form.empregador}
                onChange={(e) => update("empregador", e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>

            <div className="field">
              <label htmlFor="cnpj">CNPJ</label>
              <input
                id="cnpj"
                value={form.cnpj}
                onChange={(e) => update("cnpj", e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div className="field">
              <label htmlFor="dataExame">Data do exame</label>
              <input
                id="dataExame"
                value={form.dataExame}
                onChange={(e) => update("dataExame", e.target.value)}
                placeholder="dd/mm/aaaa"
              />
            </div>
          </div>

          <div className="actions">
            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Gerando..." : "Gerar PDF"}
            </button>
            <button className="secondary" type="button" onClick={clearForm}>
              Limpar
            </button>
            <button
              className="secondary"
              type="button"
              onClick={() => setShowDebugText((v) => !v)}
            >
              {showDebugText ? "Ocultar texto extraído" : "Mostrar texto extraído"}
            </button>
          </div>
        </form>

        <div className="note">
          <strong>Importante:</strong> coloque o PDF da ficha audiológica em{" "}
          <span className="code">/public/ficha-modelo.pdf</span>. Se algum campo do
          cabeçalho ficar fora do lugar, ajuste as coordenadas no arquivo{" "}
          <span className="code">src/lib/generateFichaPdf.ts</span>.
        </div>

        {showDebugText && (
          <div className="note" style={{ whiteSpace: "pre-wrap", marginTop: 14 }}>
            <strong>Texto extraído da 1ª página do PDF importado:</strong>
            {"\n\n"}
            {debugText || "Nenhum texto extraído ainda."}
          </div>
        )}
      </div>
    </main>
  );
}
