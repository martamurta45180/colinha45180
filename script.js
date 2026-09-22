// ==========================================================================
// LÓGICA: lê o CSV do TSE, indexa por cargo + número e liga aos campos.
// Para ajustar cargos, arquivos e caminhos, mexa só no config.js.
// ==========================================================================

const CHAVE_STORAGE = "colinha-2026";
const FOTO_VAZIA = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

let INDEX = {}; // INDEX[codigoCargo][numero] = { nome, partido, foto }

// -- Números digitados ficam salvos só neste aparelho ------------------------
function lerSalvo() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_STORAGE)) || {};
  } catch (e) {
    return {};
  }
}

function gravar(id, numero) {
  try {
    const dados = lerSalvo();
    dados[id] = numero;
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(dados));
  } catch (e) { /* sem armazenamento: segue sem salvar */ }
}

// -- 1. Carrega e indexa o CSV -----------------------------------------------
async function carregarArquivo(entrada) {
  // Aceita "arquivo.csv" ou { arquivo: "arquivo.csv", cargos: ["1"] }
  const item = typeof entrada === "string" ? { arquivo: entrada } : entrada;
  const caminho = item.arquivo;
  const resposta = await fetch(caminho);
  if (!resposta.ok) throw new Error(`Não achei ${caminho} (erro ${resposta.status})`);

  // Decodifica na codificação certa, senão "JOSÉ" vira "JOS?"
  const buffer = await resposta.arrayBuffer();
  const texto = new TextDecoder(CSV_CODIFICACAO).decode(buffer);

  const resultado = Papa.parse(texto, {
    header: true,
    delimiter: CSV_DELIMITADOR,
    skipEmptyLines: true,
  });

  resultado.data.forEach((linha) => {
    const cargo = String(linha.CD_CARGO || "").trim();
    const numero = String(linha.NR_CANDIDATO || "").trim();
    if (!cargo || !numero) return;
    // Se o arquivo tiver uma lista de cargos, ignora todos os outros
    if (item.cargos && !item.cargos.includes(cargo)) return;

    const uf = String(linha.SG_UF || "").trim();
    const sq = String(linha.SQ_CANDIDATO || "").trim();

    if (!INDEX[cargo]) INDEX[cargo] = {};
    INDEX[cargo][numero] = {
      nome: linha.NM_URNA_CANDIDATO || linha.NM_CANDIDATO || "",
      partido: linha.SG_PARTIDO || "",
      foto: `${FOTOS_PATH}/fcand2026${uf}/F${uf}${sq}_div.jpg`,
    };
  });
}

async function carregarCandidatos() {
  await Promise.all(CSV_PATHS.map(carregarArquivo));
}

// -- 2. Monta a tela -----------------------------------------------------------
function montarInterface() {
  const container = document.getElementById("cargos");
  container.innerHTML = "";
  const salvo = lerSalvo();

  CARGOS.forEach((cfg) => {
    const bloco = document.createElement("div");
    bloco.className = "cargo";
    bloco.id = `cargo-${cfg.id}`;
    bloco.innerHTML = `
      <img class="foto" id="foto-${cfg.id}" src="${FOTO_VAZIA}" alt="">
      <div class="info">
        <div class="cargo-nome">${cfg.label}</div>
        <div class="cand-nome" id="nome-${cfg.id}"></div>
        <div class="cand-partido" id="partido-${cfg.id}"></div>
        <div class="dica" id="dica-${cfg.id}">Digite ${cfg.digitos} dígitos</div>
      </div>
      <div class="digitos" id="digitos-${cfg.id}"></div>
    `;
    container.appendChild(bloco);

    const caixa = bloco.querySelector(".digitos");
    const inicial = (cfg.fixo || salvo[cfg.id] || "").split("");

    for (let i = 0; i < cfg.digitos; i++) {
      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "numeric";
      input.maxLength = 1;
      input.placeholder = " ";
      input.className = "digito";
      input.setAttribute("aria-label", `${cfg.label}, dígito ${i + 1}`);
      input.value = inicial[i] || "";
      if (cfg.travado) {
        input.readOnly = true;
        input.tabIndex = -1;
      }
      caixa.appendChild(input);
    }

    if (!cfg.travado) ligarEventos(cfg);
    atualizar(cfg);
  });
}

// -- 3. Navegação entre as caixinhas ------------------------------------------
function ligarEventos(cfg) {
  const inputs = [...document.querySelectorAll(`#digitos-${cfg.id} .digito`)];

  inputs.forEach((input, i) => {
    input.addEventListener("input", () => {
      input.value = input.value.replace(/\D/g, "");
      if (input.value && i < inputs.length - 1) inputs[i + 1].focus();
      atualizar(cfg);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && !input.value && i > 0) inputs[i - 1].focus();
    });

    input.addEventListener("paste", (e) => {
      e.preventDefault();
      const texto = (e.clipboardData.getData("text") || "").replace(/\D/g, "");
      inputs.forEach((campo, j) => (campo.value = texto[j] || ""));
      atualizar(cfg);
    });
  });
}

// -- 4. Busca o candidato e atualiza o cargo ------------------------------------
function atualizar(cfg) {
  const inputs = [...document.querySelectorAll(`#digitos-${cfg.id} .digito`)];
  const numero = inputs.map((i) => i.value).join("");
  if (!cfg.travado) gravar(cfg.id, numero);

  const bloco = document.getElementById(`cargo-${cfg.id}`);
  const nome = document.getElementById(`nome-${cfg.id}`);
  const partido = document.getElementById(`partido-${cfg.id}`);
  const foto = document.getElementById(`foto-${cfg.id}`);
  const dica = document.getElementById(`dica-${cfg.id}`);

  const completo = numero.length === cfg.digitos;
  const cand = completo ? (INDEX[cfg.codigo] || {})[numero] : null;

  if (cand) {
    nome.textContent = cand.nome;
    partido.textContent = cand.partido;
    foto.onerror = () => { foto.onerror = null; foto.src = FOTO_VAZIA; };
    foto.src = cand.foto;
    dica.textContent = "";
    bloco.classList.add("preenchido");
  } else {
    nome.textContent = "";
    partido.textContent = "";
    foto.src = FOTO_VAZIA;
    dica.textContent = completo ? "Número não encontrado" : `Digite ${cfg.digitos} dígitos`;
    bloco.classList.remove("preenchido");
  }
}

// -- 5. Botões ------------------------------------------------------------------
function ligarBotoes() {
  document.getElementById("btn-limpar").addEventListener("click", () => {
    CARGOS.forEach((cfg) => {
      if (cfg.travado) return;
      document.querySelectorAll(`#digitos-${cfg.id} .digito`).forEach((i) => (i.value = ""));
      atualizar(cfg);
    });
  });

  document.getElementById("btn-salvar").addEventListener("click", async () => {
    const cartao = document.getElementById("colinha-card");
    const canvas = await html2canvas(cartao, { scale: 2, useCORS: true });

    canvas.toBlob(async (blob) => {
      const arquivo = new File([blob], "colinha-2026.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        try {
          await navigator.share({ files: [arquivo], title: "Minha colinha" });
          return;
        } catch (e) { /* cancelou: cai no download */ }
      }
      const link = document.createElement("a");
      link.download = "colinha-2026.png";
      link.href = URL.createObjectURL(blob);
      link.click();
    }, "image/png");
  });
}

// -- Início ---------------------------------------------------------------------
carregarCandidatos()
  .then(montarInterface)
  .then(ligarBotoes)
  .catch((erro) => {
    console.error("Erro ao carregar os candidatos:", erro);
    document.getElementById("cargos").innerHTML =
      "<p class='dica'>Não consegui carregar o CSV. Abra pelo Live Server (não com dois cliques) e confira o nome do arquivo, o separador e a codificação no config.js.</p>";
  });