# Gerador de Documentos DS Med — refatorado para múltiplos templates

## Como executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Documentos cadastrados

- Ficha Audiológica: preenche Nome, CPF, Data Nasc, Cargo, Empregador, RG, CNPJ e Data do exame.
- Solicitação de Exames Complementares: preenche Nome, CPF, Data Nasc, RG, Data do exame e Exames complementares. Não imprime Cargo nem CNPJ.
- Solicitação de RX: preenche Nome, CPF, Data Nasc, RG, Data do exame e Raio-X solicitados. Não imprime Cargo nem CNPJ.

## Estrutura principal

- `src/lib/types/patient.ts`
- `src/lib/types/document.ts`
- `src/lib/pdf/core/fillPdfTemplate.ts`
- `src/lib/pdf/templates/`
- `src/components/`
- `src/app/page.tsx`

## Ajuste de coordenadas

- Ficha Audiológica: `src/lib/pdf/templates/shared/headerAudiologica.ts`
- Solicitações: `src/lib/pdf/templates/shared/headerSolicitacoes.ts`
- Campos específicos: `solicitacaoExamesComplementares.ts` e `solicitacaoRx.ts`

Regra: aumentar `x` move para direita; aumentar `y` move para cima.

## Solicitação de Raio-X: clínica e médico solicitante

Quando a Solicitação de RX for selecionada, o formulário apresenta o nome e o CRM
do médico solicitante (sugeridos a partir da assinatura do examinador na primeira
página do ASO, quando identificados), e a escolha entre Clínica Ressonar e Clínica Imed.
Essas informações são impressas no próprio modelo da Solicitação de RX.

- **Clínica Ressonar** — Av. Nossa Senhora de Fátima 847 - Maracanã
- **Clínica Imed** — Av. Coronel Prates 361 - Centro

Antes de gerar RX, confirme nome e CRM do solicitante, pois o médico que assina o ASO
pode não ser o mesmo que solicita o exame. O preenchimento é sempre editável.

Os demais documentos permanecem com os mesmos layouts e coordenadas.
