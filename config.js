// ==========================================================================
// CONFIGURAÇÃO: é aqui que você ajusta a colinha.
// ==========================================================================

// Arquivos CSV do TSE.
//  - O do seu estado traz deputados, senadores e governador.
//  - O BRASIL traz todos os estados, então usamos ele SÓ para presidente
//    (cargos: ["1"]). Assim nenhum candidato de outro estado aparece.
const CSV_PATHS = [
  { arquivo: "consulta_cand_2026_MG.csv" },
  { arquivo: "consulta_cand_2026_BRASIL.csv", cargos: ["1"] },
];

// Como o TSE exporta o CSV (normalmente ";" e ISO-8859-1)
const CSV_DELIMITADOR = ";";
const CSV_CODIFICACAO = "iso-8859-1";

// Pasta com as fotos. Nome esperado: F<UF><SQ_CANDIDATO>_div.jpg
const FOTOS_PATH = "fotos";

// Cargos que aparecem na colinha, na ordem da tela.
//  id      -> nome interno (único)
//  label   -> texto mostrado
//  codigo  -> CD_CARGO do TSE (1 presidente, 3 governador, 5 senador,
//             6 deputado federal, 7 deputado estadual)
//  digitos -> quantos dígitos tem o número
//  fixo    -> (opcional) número já preenchido
//  travado -> (opcional) true = o usuário não consegue editar
const CARGOS = [
  { id: "federal",    label: "Deputado federal",  codigo: "6", digitos: 4, fixo: "2275", travado: true},
  { id: "estadual",   label: "Deputado estadual", codigo: "7", digitos: 5, fixo: "45180", travado: true },
  { id: "senador1",   label: "Senador (1º voto)", codigo: "5", digitos: 3, fixo: "456", travado:true },
  { id: "senador2",   label: "Senador (2º voto)", codigo: "5", digitos: 3 },
  { id: "governador", label: "Governador",        codigo: "3", digitos: 2 },
  { id: "presidente", label: "Presidente",        codigo: "1", digitos: 2 },
];