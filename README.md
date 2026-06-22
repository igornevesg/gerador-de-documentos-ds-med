# Ficha Audiológica em PDF — Versão 2

Projeto em **Next.js + pdf-lib + pdfjs-dist** para:

1. **Importar um PDF de ASO**
2. **Extrair automaticamente os dados do cabeçalho da 1ª página**
3. **Preencher o formulário**
4. **Gerar a ficha audiológica em PDF**

---

## Campos extraídos do PDF do ASO
- **Nome** ← `Nome:`
- **CPF** ← `CPF:`
- **Data de nascimento** ← `Data Nasc:`
- **Cargo** ← `Cargo:`
- **Empregador** ← `Razão Social:`
- **RG** ← `RG:`
- **CNPJ** ← `CNPJ:`
- **Data do exame** ← `Data de Emissão:`

> Se o campo RG vier em branco no ASO, o sistema deixa em branco sem problema.

---

## Como rodar

### 1) Instalar dependências
```bash
npm install
```

### 2) Copiar o PDF da ficha
Coloque sua ficha audiológica em:

```bash
/public/ficha-modelo.pdf
```

### 3) Rodar localmente
```bash
npm run dev
```

### 4) Abrir no navegador
```bash
http://localhost:3000
```

---

## Como usar
1. Clique em **Importar PDF do ASO**
2. Escolha o PDF do ASO
3. O sistema tentará preencher automaticamente o formulário
4. Revise os campos
5. Clique em **Gerar PDF**

---

## Se o PDF do ASO não importar
Há dois cenários:

### Cenário 1 — PDF com texto selecionável
A versão atual deve funcionar bem.

### Cenário 2 — PDF escaneado / imagem
A versão atual pode falhar, porque ela ainda **não usa OCR**.  
Se isso acontecer, o próximo passo é integrar OCR.

---

## Ajuste do posicionamento da ficha
Se algum texto da ficha final ficar fora do lugar, ajuste as coordenadas em:

```bash
src/lib/generateFichaPdf.ts
```

no objeto `FIELD_MAP`.

---

## Worker do pdf.js
Esta versão usa `pdfjs-dist` e espera o arquivo:

```bash
/public/pdf.worker.min.mjs
```

### Como obter
Depois de instalar as dependências, copie o worker do pacote para a pasta `public`:

#### Windows PowerShell
```powershell
Copy-Item .\node_modules\pdfjs-dist\build\pdf.worker.min.mjs .\public\pdf.worker.min.mjs
```

#### Mac / Linux
```bash
cp ./node_modules/pdfjs-dist/build/pdf.worker.min.mjs ./public/pdf.worker.min.mjs
```

Se preferir, você também pode automatizar isso depois com um script no `package.json`.
