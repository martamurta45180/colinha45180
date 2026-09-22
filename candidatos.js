// ==========================================================================
// DADOS: candidatos de exemplo (FICTÍCIOS). Troque pelos seus.
// Estrutura: cargo -> número -> { nome, partido, foto }
// "foto" é opcional: deixe "" para não mostrar foto, ou use o caminho
// de uma imagem, por exemplo "fotos/joao.jpg".
// ==========================================================================

const CARGOS = [
  { id: "federal",   label: "Deputado federal",  digitos: 4 },
  { id: "estadual",  label: "Deputado estadual", digitos: 5 },
  { id: "senador1",  label: "Senador (1º voto)", digitos: 3, cargo: "senador" },
  { id: "senador2",  label: "Senador (2º voto)", digitos: 3, cargo: "senador" },
  { id: "governador",label: "Governador",        digitos: 2 },
  { id: "presidente",label: "Presidente",        digitos: 2 },
];

const CANDIDATOS = {
  federal: {
    "1234": { nome: "Ana Exemplo",   partido: "PARTIDO A", foto: "" },
    "5678": { nome: "Bruno Modelo",  partido: "PARTIDO B", foto: "" },
  },
  estadual: {
    "12345": { nome: "Carla Teste",  partido: "PARTIDO A", foto: "" },
    "56789": { nome: "Diego Amostra",partido: "PARTIDO B", foto: "" },
  },
  senador: {
    "123": { nome: "Elisa Fictícia", partido: "PARTIDO A", foto: "" },
    "456": { nome: "Fábio Demo",     partido: "PARTIDO C", foto: "" },
  },
  governador: {
    "12": { nome: "Gabriela Exemplo", partido: "PARTIDO A", foto: "" },
    "45": { nome: "Henrique Modelo",  partido: "PARTIDO C", foto: "" },
  },
  presidente: {
    "13": { nome: "Iara Teste",  partido: "PARTIDO A", foto: "" },
    "22": { nome: "João Amostra",partido: "PARTIDO B", foto: "" },
  },
};