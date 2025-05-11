import { Course, Prerequisite, CurriculumData } from '../types/curriculum';

// Dados das disciplinas do curso
export const coursesData: Course[] = [
  // 1º Período
  { id: "port", name: "Língua Portuguesa", period: 1, row: 1, hours: "54h", type: "NB", credits: 4 },
  { id: "geom", name: "Geometria Analítica", period: 1, row: 2, hours: "54h", type: "NB", credits: 4 },
  { id: "calc1", name: "Cálculo Diferencial e Integral I", period: 1, row: 3, hours: "81h", type: "NB", credits: 6 },
  { id: "algo", name: "Algoritmos e Técnicas de Programação", period: 1, row: 4, hours: "54h", type: "NB", credits: 4 },
  { id: "topo1", name: "Topografia: Planimetria", period: 1, row: 8, hours: "81h", type: "NP", credits: 6 },
  { id: "desenho", name: "Desenho Topográfico", period: 1, row: 9, hours: "81h", type: "NB", credits: 6 },
  
  // 2º Período
  { id: "fis1", name: "Física: Mecânica", period: 2, row: 1, hours: "54h", type: "NB", credits: 4 },
  { id: "lab1", name: "Laboratório de Mecânica", period: 2, row: 2, hours: "27h", type: "NB", credits: 2 },
  { id: "calc2", name: "Cálculo Diferencial e Integral II", period: 2, row: 3, hours: "81h", type: "NB", credits: 6 },
  { id: "alg", name: "Álgebra Linear", period: 2, row: 4, hours: "54h", type: "NB", credits: 4 },
  { id: "mat", name: "Ciência dos Materiais", period: 2, row: 6, hours: "27h", type: "NB", credits: 2 },                
  { id: "topo2", name: "Topografia: Levantamentos Planialtimétricos", period: 2, row: 8, hours: "81h", type: "NP", credits: 6 },
  { id: "desenho2", name: "Desenho Topográfico Digital", period: 2, row: 9, hours: "54h", type: "NB", credits: 4 },
  
  // 3º Período
  { id: "fis2", name: "Física: Fluidos, ondas e calor", period: 3, row: 1, hours: "54h", type: "NB", credits: 4 },
  { id: "lab2", name: "Laboratório de fluidos, ondas e calor", period: 3, row: 2, hours: "27h", type: "NB", credits: 2 },
  { id: "calc3", name: "Cálculo Diferencial e Integral III", period: 3, row: 3, hours: "54h", type: "NB", credits: 4 },
  { id: "cart1", name: "Cartografia Matemática", period: 3, row: 4, hours: "81h", type: "NP", credits: 6 },
  { id: "geo", name: "Geologia e Geomorfologia", period: 3, row: 5, hours: "54h", type: "NB", credits: 4 },
  { id: "est", name: "Estatística e Probabilidade", period: 3, row: 6, hours: "54h", type: "NB", credits: 4 },
  { id: "topo3", name: "Topografia: Levantamentos Especiais", period: 3, row: 8, hours: "81h", type: "NP", credits: 6 },
  
  // 4º Período
  { id: "fis3", name: "Física: Eletromagnetismo", period: 4, row: 1, hours: "54h", type: "NB", credits: 4 },
  { id: "lab3", name: "Laboratório de Eletromagnetismo", period: 4, row: 2, hours: "27h", type: "NB", credits: 2 },
  { id: "mec", name: "Mecânica Geral", period: 4, row: 3, hours: "54h", type: "NB", credits: 4 },
  { id: "cart2", name: "Cartografia Temática e Computacional", period: 4, row: 4, hours: "81h", type: "NP", credits: 6 },
  { id: "solo", name: "Ciência do Solo", period: 4, row: 5, hours: "54h", type: "NB", credits: 4 },
  { id: "aj1", name: "Ajustamento de Observações I", period: 4, row: 6, hours: "54h", type: "NE", credits: 4 },                
  { id: "calc4", name: "Cálculo Numérico", period: 4, row: 7, hours: "54h", type: "NP", credits: 4 },
  { id: "pesq", name: "Introdução à Pesquisa e Metodologia Científica", period: 4, row: 8, hours: "27h", type: "NB", credits: 2 },
  
  // 5º Período
  { id: "trans", name: "Fenômeno do Transporte", period: 5, row: 1, hours: "54h", type: "NB", credits: 4 },
  { id: "astro", name: "Astronomia Geodésica", period: 5, row: 2, hours: "27h", type: "NE", credits: 2 },
  { id: "banco", name: "Banco de Dados Geográfico", period: 5, row: 3, hours: "54h", type: "NP", credits: 4 },
  { id: "geoest", name: "Geoestatística", period: 5, row: 4, hours: "54h", type: "NE", credits: 4 },
  { id: "sens1", name: "Sensoriamento Remoto I", period: 5, row: 5, hours: "54h", type: "NP", credits: 4 },
  { id: "aj2", name: "Ajustamento de Observações II", period: 5, row: 6, hours: "54h", type: "NE", credits: 4 },                
  { id: "dir", name: "Direito Agrário", period: 5, row: 7, hours: "54h", type: "NE", credits: 4 },
  { id: "adm", name: "Introdução à Administração", period: 5, row: 8, hours: "27h", type: "NB", credits: 2 },
  { id: "eco", name: "Introdução à Economia", period: 5, row: 9, hours: "27h", type: "NB", credits: 2 },
  
  // 6º Período
  { id: "res", name: "Introdução à Resistência dos Materiais", period: 6, row: 1, hours: "27h", type: "NB", credits: 2 },
  { id: "geo1", name: "Geodésia Geométrica", period: 6, row: 2, hours: "54h", type: "NP", credits: 4 },
  { id: "meio", name: "Meio Ambiente e Saneamento Básico", period: 6, row: 3, hours: "54h", type: "NP", credits: 4 },
  { id: "leg", name: "Legislação de Terras", period: 6, row: 6, hours: "54h", type: "NE", credits: 4 },
  { id: "aval", name: "Avaliação de Terras", period: 6, row: 7, hours: "54h", type: "NE", credits: 4 },
  { id: "trans2", name: "Transportes", period: 6, row: 8, hours: "27h", type: "NE", credits: 2 },
  { id: "quim", name: "Química Geral", period: 6, row: 9, hours: "54h", type: "NB", credits: 4 },

  // 7º Período
  { id: "geo2", name: "Geodésia Física", period: 7, row: 2, hours: "54h", type: "NP", credits: 4 },
  { id: "sig1", name: "Sistema de Informação Geográfica I", period: 7, row: 3, hours: "54h", type: "NP", credits: 4 },
  { id: "hidro", name: "Hidrologia", period: 7, row: 4, hours: "54h", type: "NE", credits: 4 },
  { id: "proc1", name: "Processamento Digital de Imagens I", period: 7, row: 5, hours: "81h", type: "NP", credits: 6 },
  { id: "mod", name: "Modelagem Numérica de Terreno", period: 7, row: 6, hours: "27h", type: "NE", credits: 2 },
  { id: "proj", name: "Projeto Geométrico de Estradas", period: 7, row: 8, hours: "81h", type: "NE", credits: 6 },
  { id: "div", name: "Divisão e Demarcação de Terras", period: 7, row: 9, hours: "54h", type: "NE", credits: 4 },

  // 8º Período
  { id: "geo3", name: "Geodésia Espacial", period: 8, row: 2, hours: "81h", type: "NP", credits: 6 },
  { id: "sig2", name: "Sistema de Informação Geográfica II", period: 8, row: 3, hours: "54h", type: "NP", credits: 4 },
  { id: "cad1", name: "Cadastro Territorial Urbano", period: 8, row: 4, hours: "54h", type: "NE", credits: 4 },
  { id: "proc2", name: "Processamento Digital de Imagens II", period: 8, row: 5, hours: "81h", type: "NP", credits: 6 },
  { id: "foto1", name: "Fotogrametria I", period: 8, row: 6, hours: "81h", type: "NP", credits: 6 },
  { id: "legcart", name: "Legislação Cartográfica", period: 8, row: 7, hours: "27h", type: "NE", credits: 2 },
  
  // 9º Período
  { id: "elet", name: "Eletricidade Aplicada à Geomática", period: 9, row: 1, hours: "27h", type: "NB", credits: 2 },
  { id: "opt1", name: "Optativa 1", period: 9, row: 2, hours: "54h", type: "NA", credits: 4 },
  { id: "cad2", name: "Cadastro Territorial Rural", period: 9, row: 4, hours: "54h", type: "NE", credits: 4 },
  { id: "foto2", name: "Fotogrametria II", period: 9, row: 6, hours: "81h", type: "NP", credits: 6 },
  { id: "proj2", name: "Elaboração do Projeto Final do Curso", period: 9, row: 7, hours: "27h", type: "NE", credits: 2 },
  { id: "lev", name: "Levantamentos Especiais", period: 9, row: 8, hours: "81h", type: "NP", credits: 6 },
  { id: "urb", name: "Urbanismo", period: 9, row: 9, hours: "54h", type: "NE", credits: 4 },
  
  // 10º Período
  { id: "opt2", name: "Optativa 2", period: 10, row: 1, hours: "54h", type: "NA", credits: 4 },
  { id: "conf", name: "Conforto, Higiene e Segurança do Trabalho", period: 10, row: 2, hours: "54h", type: "NE", credits: 4 },
  { id: "geo4", name: "Geoprocessamento Aplicado", period: 10, row: 3, hours: "54h", type: "NE", credits: 4 },
  { id: "soc", name: "Sociologia do Trabalho, Tecnologia e Cultura", period: 10, row: 4, hours: "27h", type: "NE", credits: 2 },
  { id: "top", name: "Tópicos Especiais de Imageamento", period: 10, row: 6, hours: "54h", type: "NE", credits: 4 },
  { id: "tcc", name: "Trabalho de Conclusão de Curso", period: 10, row: 7, hours: "81h", type: "NE", credits: 6 },
  { id: "proj3", name: "Projeto de Loteamento", period: 10, row: 9, hours: "54h", type: "NE", credits: 4 },
];

// Pré-requisitos entre disciplinas
export const prerequisitesData: Prerequisite[] = [
  { from: "calc1", to: "calc2" },
  { from: "calc2", to: "calc3" },
  { from: "fis1", to: "fis2" },
  { from: "fis2", to: "fis3" },
  { from: "topo1", to: "topo2" },
  { from: "topo2", to: "topo3" },
  { from: "lab1", to: "lab2" },
  { from: "lab2", to: "lab3" },
  { from: "desenho", to: "desenho2" },
  { from: "aj1", to: "aj2" },
  { from: "astro", to: "geo3" },
  { from: "geo1", to: "geo2" },
  { from: "geo2", to: "geo3" },
  { from: "proc1", to: "proc2" },
  { from: "foto1", to: "foto2" },
  { from: "cad1", to: "cad2" },
  { from: "cart1", to: "cart2" },
  { from: "fis3", to: "elet" },
  { from: "topo3", to: "lev" },
  { from: "fis2", to: "geo2" },
  { from: "banco", to: "sig1" },
  { from: "banco", to: "cad1" },
  { from: "est", to: "geoest" },
];

// Dados padrão para o currículo
export const defaultCurriculumData = {
  courses: coursesData,
  prerequisites: prerequisitesData,
  completedCourses: [] // Array vazio inicial para cursos completados
}; 