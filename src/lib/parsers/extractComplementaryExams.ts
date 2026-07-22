export function sanitizeExamesComplementares(raw: string) {
  return raw
    .replace(/\bData\s*:\s*\d{2}\/\d{2}\/\d{4}\b/gi, "")
    .replace(/\(\d{2}\/\d{2}\/\d{4}\)/g, "")
    .replace(/\bAVALIAÇÃO CLÍNICA\b/gi, "")
    .replace(/\bAVALIACAO CLINICA\b/gi, "")
    .replace(/\bAUDIOMETRIA\b/gi, "")
    .replace(/\bRAIO\s*X\s*TORAX\b/gi, "")
    .replace(/\bRAIO\s*X\s*TÓRAX\b/gi, "")
    .replace(/\bRX\s*TORAX\b/gi, "")
    .replace(/\bRX\s*TÓRAX\b/gi, "")
    // Cada código inicia um novo exame.
    .replace(/\b\d{3,5}\s*-\s*/g, "\n")
    // Remove números isolados restantes.
    .replace(/\b\d+\b/g, "")
    .replace(/[;|]/g, "\n")
    .replace(/\s*,\s*/g, "\n")
    .split("\n")
    .map((item) =>
      item
        .replace(/^[-•\s]+/, "")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)
    .filter(
      (item, index, items) =>
        items.findIndex(
          (candidate) => candidate.toLowerCase() === item.toLowerCase()
        ) === index
    )
    .join("\n")
    .trim();
}

export function extractExamesProcedimentosBlock(text: string) {
  const normalized = text.replace(/\r/g, "\n");

  const patterns = [
    // Modelo novo do ASO.
    /Rela[cç][aã]o\s+dos\s+exames\s+complementares\s+realizados\s+e\s+suas\s+datas\s*:?\s*([\s\S]*?)(?=\n\s*(?:Aptid[oõ]es\s+Especiais|Conclus[aã]o|Recibo|$))/i,
    // Modelo antigo: Prontuário Clínico.
    /EXAMES\s+E\s+PROCEDIMENTOS\s*:?\s*([\s\S]*?)(?=\n\s*(?:CONCLUS|OBSERVA|RECOMENDA|MÉDICO|MEDICO|ASSINATURA|RESULTADO|PARECER|$))/i,
    /EXAMES\s*\/\s*PROCEDIMENTOS\s*:?\s*([\s\S]*?)(?=\n\s*(?:CONCLUS|OBSERVA|RECOMENDA|MÉDICO|MEDICO|ASSINATURA|RESULTADO|PARECER|$))/i,
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  return "";
}
