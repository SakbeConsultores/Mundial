import { useState, useEffect, useMemo, useRef } from "react";

// ─────────────────────────────────────────────
// SINCRONIZACIÓN COMPARTIDA (Notion vía Cloudflare Worker)
// ─────────────────────────────────────────────
// Pega aquí la URL de tu Worker después de desplegarlo (ver SETUP-SYNC.md).
// Ejemplo: "https://mundial-sync.tu-usuario.workers.dev"
// Si la dejas vacía, la app sigue funcionando solo con datos locales (sin compartir).
const API_URL = "https://mundial-sync.gustavo-7cb.workers.dev";

// Lee el estado compartido desde el Worker.
async function apiGet() {
  const r = await fetch(API_URL, { cache: "no-store" });
  if (!r.ok) throw new Error("GET fallo");
  return r.json(); // { results, discipline }
}
// Envía cambios al Worker (solo las claves que mandemos).
async function apiPost(body) {
  const r = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("POST fallo");
  return r.json();
}
// Disciplina "vacía": una entrada por equipo con ceros.
function emptyDiscipline() {
  const d = {};
  Object.values(GROUPS).flat().forEach((t) => { d[t] = { ta: 0, tr: 0, pts: 0 }; });
  return d;
}
// ¿Hay datos reales capturados localmente? (para migrar la primera vez)
function hasLocalData(results, discipline) {
  const r = Object.values(results || {}).some((v) => v && (v.homeGoals !== "" || v.awayGoals !== ""));
  const d = Object.values(discipline || {}).some((v) => v && (v.ta || v.tr || v.pts));
  return r || d;
}

// Puntos de conducta (fair play) FIFA Art. 13, derivados de las tarjetas.
// Aproximación: amarilla = 1, roja = 4 (roja directa). Más puntos = peor; menos = mejor.
// Nota: con solo el conteo de amarillas/rojas NO se puede distinguir una roja directa (-4)
// de una roja por doble amarilla (-3) ni el combo amarilla+roja (-5), así que es aproximado.
function conductPts(d) {
  if (!d) return 0;
  return (d.ta || 0) * 1 + (d.tr || 0) * 4;
}

// ─────────────────────────────────────────────
// PALETA DÍA
// ─────────────────────────────────────────────
const C = {
  bg:       "#f0f4f8",
  card:     "#ffffff",
  cardBorder:"#e2e8f0",
  text:     "#0f172a",
  textSub:  "#475569",
  textMute: "#94a3b8",
  gold:     "#b8860b",
  goldLight:"#f5e6c0",
  blue:     "#365f8a",
  blueLight:"#dbeafe",
  header:   "#0f172a",
  headerText:"#f0f4f8",
  red:      "#dc2626",
  green:    "#16a34a",
  shadow:   "0 1px 4px rgba(0,0,0,.08)",
};

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const GROUPS = {
  A:["MEX","RSA","KOR","CZE"], B:["CAN","BIH","QAT","SUI"],
  C:["BRA","MAR","HAI","SCO"], D:["USA","PAR","AUS","TUR"],
  E:["GER","CUW","CIV","ECU"], F:["NED","JPN","SWE","TUN"],
  G:["BEL","EGY","IRN","NZL"], H:["ESP","CPV","KSA","URU"],
  I:["FRA","SEN","IRQ","NOR"], J:["ARG","ALG","AUT","JOR"],
  K:["POR","COD","UZB","COL"], L:["ENG","CRO","GHA","PAN"],
};

const TEAM_NAMES = {
  MEX:"México",RSA:"Sudáfrica",KOR:"Corea del Sur",CZE:"Chequia",
  CAN:"Canadá",BIH:"Bosnia-Herz.",QAT:"Qatar",SUI:"Suiza",
  BRA:"Brasil",MAR:"Marruecos",HAI:"Haití",SCO:"Escocia",
  USA:"EE.UU.",PAR:"Paraguay",AUS:"Australia",TUR:"Türkiye",
  GER:"Alemania",CUW:"Curazao",CIV:"Costa de Marfil",ECU:"Ecuador",
  NED:"Países Bajos",JPN:"Japón",SWE:"Suecia",TUN:"Túnez",
  BEL:"Bélgica",EGY:"Egipto",IRN:"Irán",NZL:"Nueva Zelanda",
  ESP:"España",CPV:"Cabo Verde",KSA:"Arabia Saudita",URU:"Uruguay",
  FRA:"Francia",SEN:"Senegal",IRQ:"Irak",NOR:"Noruega",
  ARG:"Argentina",ALG:"Argelia",AUT:"Austria",JOR:"Jordania",
  POR:"Portugal",COD:"Congo RD",UZB:"Uzbekistán",COL:"Colombia",
  ENG:"Inglaterra",CRO:"Croacia",GHA:"Ghana",PAN:"Panamá",
};

const FLAGS = {
  MEX:"🇲🇽",RSA:"🇿🇦",KOR:"🇰🇷",CZE:"🇨🇿",CAN:"🇨🇦",BIH:"🇧🇦",QAT:"🇶🇦",SUI:"🇨🇭",
  BRA:"🇧🇷",MAR:"🇲🇦",HAI:"🇭🇹",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",USA:"🇺🇸",PAR:"🇵🇾",AUS:"🇦🇺",TUR:"🇹🇷",
  GER:"🇩🇪",CUW:"🇨🇼",CIV:"🇨🇮",ECU:"🇪🇨",NED:"🇳🇱",JPN:"🇯🇵",SWE:"🇸🇪",TUN:"🇹🇳",
  BEL:"🇧🇪",EGY:"🇪🇬",IRN:"🇮🇷",NZL:"🇳🇿",ESP:"🇪🇸",CPV:"🇨🇻",KSA:"🇸🇦",URU:"🇺🇾",
  FRA:"🇫🇷",SEN:"🇸🇳",IRQ:"🇮🇶",NOR:"🇳🇴",ARG:"🇦🇷",ALG:"🇩🇿",AUT:"🇦🇹",JOR:"🇯🇴",
  POR:"🇵🇹",COD:"🇨🇩",UZB:"🇺🇿",COL:"🇨🇴",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",CRO:"🇭🇷",GHA:"🇬🇭",PAN:"🇵🇦",
};

const FIFA_RANK = {
  ARG:1,ESP:2,FRA:3,ENG:4,BRA:5,POR:6,NED:7,BEL:8,
  GER:9,CRO:10,MAR:11,COL:12,URU:13,MEX:14,USA:15,SUI:16,
  SEN:17,JPN:18,IRN:19,ECU:20,KOR:21,AUT:22,EGY:23,CAN:24,
  NOR:25,SWE:26,AUS:27,ALG:28,CZE:29,TUN:30,PAR:31,TUR:32,
  SCO:33,CIV:35,QAT:36,KSA:37,BIH:38,GHA:39,PAN:40,
  RSA:41,JOR:42,UZB:43,IRQ:44,COD:45,CPV:46,HAI:47,CUW:48,
  NZL:85, // Nueva Zelanda (OFC): ranking real FIFA; al ser el más alto, queda último en cualquier empate
};

const CONFEDERATIONS = {
  CONMEBOL:["ARG","BRA","URU","COL","ECU","PAR"],
  CONCACAF:["USA","MEX","CAN","PAN","HAI","CUW"],
  UEFA:["ESP","FRA","ENG","POR","NED","BEL","GER","CRO","SUI","AUT","SCO","NOR","SWE","CZE","BIH","TUR"],
  CAF:["MAR","SEN","EGY","GHA","CIV","ALG","RSA","COD","CPV"],
  AFC:["JPN","KOR","IRN","AUS","QAT","KSA","JOR","IRQ","UZB"],
  OFC:["NZL"],
};
const TEAM_CONF = {};
Object.entries(CONFEDERATIONS).forEach(([conf,teams])=>teams.forEach(t=>{TEAM_CONF[t]=conf;}));

// Marca del uniforme de cada selección (verificado: 48 equipos, una marca c/u).
// Reparto: Adidas 14 · Nike 12 · Puma 11 · resto 11.
const BRAND = {
  ARG:"Adidas",GER:"Adidas",ESP:"Adidas",BEL:"Adidas",JPN:"Adidas",MEX:"Adidas",SCO:"Adidas",RSA:"Adidas",COL:"Adidas",KSA:"Adidas",ALG:"Adidas",QAT:"Adidas",CUW:"Adidas",SWE:"Adidas",
  BRA:"Nike",FRA:"Nike",ENG:"Nike",NED:"Nike",USA:"Nike",URU:"Nike",CRO:"Nike",KOR:"Nike",CAN:"Nike",AUS:"Nike",TUR:"Nike",NOR:"Nike",
  POR:"Puma",MAR:"Puma",GHA:"Puma",SEN:"Puma",SUI:"Puma",CZE:"Puma",PAR:"Puma",CIV:"Puma",EGY:"Puma",NZL:"Puma",AUT:"Puma",
  BIH:"Kelme",JOR:"Kelme",TUN:"Kappa",PAN:"Reebok",CPV:"Capelli",COD:"Umbro",ECU:"Marathon",IRQ:"Jako",IRN:"Majid/Merooj",UZB:"7Saber",HAI:"Saeta",
};
// Orden fijo (por número de equipos) y colores de marca para las gráficas.
const BRAND_ORDER = ["Adidas","Nike","Puma","Kelme","Kappa","Reebok","Capelli","Umbro","Marathon","Jako","Majid/Merooj","7Saber","Saeta"];
const BRAND_COLORS = {Adidas:"#0f172a",Nike:"#ef4444",Puma:"#16a34a",Kelme:"#9333ea",Kappa:"#0ea5e9",Reebok:"#f59e0b",Capelli:"#14b8a6",Umbro:"#64748b",Marathon:"#db2777",Jako:"#84cc16","Majid/Merooj":"#a855f7","7Saber":"#f97316",Saeta:"#06b6d4",Otras:"#94a3b8"};

// Match → City
const MATCH_CITY = {
  1:"Ciudad de México",2:"Guadalajara",3:"Toronto",4:"Los Angeles",5:"Boston",
  6:"Vancouver",7:"NY/NJ",8:"San Francisco",9:"Filadelfia",10:"Houston",
  11:"Dallas",12:"Monterrey",13:"Miami",14:"Atlanta",15:"Los Angeles",
  16:"Seattle",17:"NY/NJ",18:"Boston",19:"Kansas City",20:"San Francisco",
  21:"Toronto",22:"Dallas",23:"Houston",24:"Ciudad de México",25:"Atlanta",
  26:"Los Angeles",27:"Vancouver",28:"Guadalajara",29:"Filadelfia",30:"Boston",
  31:"San Francisco",32:"Seattle",33:"Toronto",34:"Kansas City",35:"Houston",
  36:"Monterrey",37:"Miami",38:"Atlanta",39:"Los Angeles",40:"Vancouver",
  41:"NY/NJ",42:"Filadelfia",43:"Dallas",44:"San Francisco",45:"Boston",
  46:"Toronto",47:"Houston",48:"Guadalajara",49:"Miami",50:"Atlanta",
  51:"Vancouver",52:"Seattle",53:"Guadalajara",54:"Monterrey",55:"Filadelfia",
  56:"NY/NJ",57:"Dallas",58:"Kansas City",59:"Los Angeles",60:"San Francisco",
  61:"Boston",62:"Toronto",63:"Seattle",64:"Vancouver",65:"Houston",
  66:"Guadalajara",67:"NY/NJ",68:"Dallas",69:"Kansas City",70:"Dallas",
  71:"Miami",72:"Atlanta",73:"Los Angeles",74:"Boston",75:"Monterrey",
  76:"Houston",77:"NY/NJ",78:"Dallas",79:"Ciudad de México",80:"Atlanta",
  81:"San Francisco",82:"Seattle",83:"Toronto",84:"Los Angeles",85:"Vancouver",
  86:"Miami",87:"Kansas City",88:"Dallas",89:"Filadelfia",90:"Houston",
  91:"NY/NJ",92:"Ciudad de México",93:"Dallas",94:"Seattle",95:"Atlanta",
  96:"Vancouver",97:"Boston",98:"Los Angeles",99:"Miami",100:"Kansas City",
  101:"Dallas",102:"Atlanta",103:"Miami",104:"NY/NJ",
};

const GROUP_CITIES = {
  A:["Atlanta","Ciudad de México","Guadalajara","Monterrey"],
  B:["Los Angeles","San Francisco","Seattle","Toronto","Vancouver"],
  C:["Atlanta","Boston","Filadelfia","Miami","NY/NJ"],
  D:["Los Angeles","San Francisco","Seattle","Vancouver"],
  E:["Filadelfia","Houston","Kansas City","NY/NJ","Toronto"],
  F:["Dallas","Houston","Kansas City","Monterrey"],
  G:["Los Angeles","Seattle","Vancouver"],
  H:["Atlanta","Guadalajara","Houston","Miami"],
  I:["Boston","Filadelfia","NY/NJ","Toronto"],
  J:["Dallas","Kansas City","San Francisco"],
  K:["Atlanta","Ciudad de México","Guadalajara","Houston","Miami"],
  L:["Boston","Dallas","Filadelfia","NY/NJ","Toronto"],
};

// ─────────────────────────────────────────────
// GROUP STAGE MATCHES
// ─────────────────────────────────────────────
const GROUP_MATCHES = [
  {id:1,group:"A",date:"2026-06-11",time:"15:00",home:"MEX",away:"RSA"},
  {id:2,group:"A",date:"2026-06-11",time:"22:00",home:"KOR",away:"CZE"},
  {id:3,group:"B",date:"2026-06-12",time:"15:00",home:"CAN",away:"BIH"},
  {id:4,group:"D",date:"2026-06-12",time:"21:00",home:"USA",away:"PAR"},
  {id:5,group:"C",date:"2026-06-13",time:"21:00",home:"HAI",away:"SCO"},
  {id:6,group:"D",date:"2026-06-13",time:"00:00",home:"AUS",away:"TUR"},
  {id:7,group:"C",date:"2026-06-13",time:"18:00",home:"BRA",away:"MAR"},
  {id:8,group:"B",date:"2026-06-13",time:"15:00",home:"QAT",away:"SUI"},
  {id:9,group:"E",date:"2026-06-14",time:"19:00",home:"CIV",away:"ECU"},
  {id:10,group:"E",date:"2026-06-14",time:"13:00",home:"GER",away:"CUW"},
  {id:11,group:"F",date:"2026-06-14",time:"16:00",home:"NED",away:"JPN"},
  {id:12,group:"F",date:"2026-06-14",time:"22:00",home:"SWE",away:"TUN"},
  {id:13,group:"H",date:"2026-06-15",time:"18:00",home:"KSA",away:"URU"},
  {id:14,group:"H",date:"2026-06-15",time:"12:00",home:"ESP",away:"CPV"},
  {id:15,group:"G",date:"2026-06-15",time:"21:00",home:"IRN",away:"NZL"},
  {id:16,group:"G",date:"2026-06-15",time:"15:00",home:"BEL",away:"EGY"},
  {id:17,group:"I",date:"2026-06-16",time:"15:00",home:"FRA",away:"SEN"},
  {id:18,group:"I",date:"2026-06-16",time:"18:00",home:"IRQ",away:"NOR"},
  {id:19,group:"J",date:"2026-06-16",time:"21:00",home:"ARG",away:"ALG"},
  {id:20,group:"J",date:"2026-06-16",time:"00:00",home:"AUT",away:"JOR"},
  {id:21,group:"L",date:"2026-06-17",time:"19:00",home:"GHA",away:"PAN"},
  {id:22,group:"L",date:"2026-06-17",time:"16:00",home:"ENG",away:"CRO"},
  {id:23,group:"K",date:"2026-06-17",time:"13:00",home:"POR",away:"COD"},
  {id:24,group:"K",date:"2026-06-17",time:"22:00",home:"UZB",away:"COL"},
  {id:25,group:"A",date:"2026-06-18",time:"12:00",home:"CZE",away:"RSA"},
  {id:26,group:"B",date:"2026-06-18",time:"15:00",home:"SUI",away:"BIH"},
  {id:27,group:"B",date:"2026-06-18",time:"18:00",home:"CAN",away:"QAT"},
  {id:28,group:"A",date:"2026-06-18",time:"21:00",home:"MEX",away:"KOR"},
  {id:29,group:"C",date:"2026-06-19",time:"20:30",home:"BRA",away:"HAI"},
  {id:30,group:"C",date:"2026-06-19",time:"18:00",home:"SCO",away:"MAR"},
  {id:31,group:"D",date:"2026-06-19",time:"23:00",home:"TUR",away:"PAR"},
  {id:32,group:"D",date:"2026-06-19",time:"15:00",home:"USA",away:"AUS"},
  {id:33,group:"E",date:"2026-06-20",time:"16:00",home:"GER",away:"CIV"},
  {id:34,group:"E",date:"2026-06-20",time:"20:00",home:"ECU",away:"CUW"},
  {id:35,group:"F",date:"2026-06-20",time:"13:00",home:"NED",away:"SWE"},
  {id:36,group:"F",date:"2026-06-20",time:"00:00",home:"TUN",away:"JPN"},
  {id:37,group:"H",date:"2026-06-21",time:"18:00",home:"URU",away:"CPV"},
  {id:38,group:"H",date:"2026-06-21",time:"12:00",home:"ESP",away:"KSA"},
  {id:39,group:"G",date:"2026-06-21",time:"15:00",home:"BEL",away:"IRN"},
  {id:40,group:"G",date:"2026-06-21",time:"21:00",home:"NZL",away:"EGY"},
  {id:41,group:"I",date:"2026-06-22",time:"20:00",home:"NOR",away:"SEN"},
  {id:42,group:"I",date:"2026-06-22",time:"17:00",home:"FRA",away:"IRQ"},
  {id:43,group:"J",date:"2026-06-22",time:"13:00",home:"ARG",away:"AUT"},
  {id:44,group:"J",date:"2026-06-22",time:"23:00",home:"JOR",away:"ALG"},
  {id:45,group:"L",date:"2026-06-23",time:"16:00",home:"ENG",away:"GHA"},
  {id:46,group:"L",date:"2026-06-23",time:"19:00",home:"PAN",away:"CRO"},
  {id:47,group:"K",date:"2026-06-23",time:"13:00",home:"POR",away:"UZB"},
  {id:48,group:"K",date:"2026-06-23",time:"22:00",home:"COL",away:"COD"},
  {id:49,group:"C",date:"2026-06-24",time:"18:00",home:"SCO",away:"BRA"},
  {id:50,group:"C",date:"2026-06-24",time:"18:00",home:"MAR",away:"HAI"},
  {id:51,group:"B",date:"2026-06-24",time:"15:00",home:"SUI",away:"CAN"},
  {id:52,group:"B",date:"2026-06-24",time:"15:00",home:"BIH",away:"QAT"},
  {id:53,group:"A",date:"2026-06-24",time:"21:00",home:"CZE",away:"MEX"},
  {id:54,group:"A",date:"2026-06-24",time:"21:00",home:"RSA",away:"KOR"},
  {id:55,group:"E",date:"2026-06-25",time:"16:00",home:"CUW",away:"CIV"},
  {id:56,group:"E",date:"2026-06-25",time:"16:00",home:"ECU",away:"GER"},
  {id:57,group:"F",date:"2026-06-25",time:"19:00",home:"JPN",away:"SWE"},
  {id:58,group:"F",date:"2026-06-25",time:"19:00",home:"TUN",away:"NED"},
  {id:59,group:"D",date:"2026-06-25",time:"22:00",home:"TUR",away:"USA"},
  {id:60,group:"D",date:"2026-06-25",time:"22:00",home:"PAR",away:"AUS"},
  {id:61,group:"I",date:"2026-06-26",time:"15:00",home:"NOR",away:"FRA"},
  {id:62,group:"I",date:"2026-06-26",time:"15:00",home:"SEN",away:"IRQ"},
  {id:63,group:"G",date:"2026-06-26",time:"23:00",home:"EGY",away:"IRN"},
  {id:64,group:"G",date:"2026-06-26",time:"23:00",home:"NZL",away:"BEL"},
  {id:65,group:"H",date:"2026-06-26",time:"20:00",home:"CPV",away:"KSA"},
  {id:66,group:"H",date:"2026-06-26",time:"20:00",home:"URU",away:"ESP"},
  {id:67,group:"L",date:"2026-06-27",time:"17:00",home:"PAN",away:"ENG"},
  {id:68,group:"L",date:"2026-06-27",time:"17:00",home:"CRO",away:"GHA"},
  {id:69,group:"J",date:"2026-06-27",time:"22:00",home:"ALG",away:"AUT"},
  {id:70,group:"J",date:"2026-06-27",time:"22:00",home:"JOR",away:"ARG"},
  {id:71,group:"K",date:"2026-06-27",time:"19:30",home:"COL",away:"POR"},
  {id:72,group:"K",date:"2026-06-27",time:"19:30",home:"COD",away:"UZB"},
];

const R32_FIXTURE = [
  {id:73,date:"2026-06-29",time:"15:00",homeSlot:"2A",awaySlot:"2B"},
  {id:74,date:"2026-06-29",time:"16:30",homeSlot:"1E",awaySlot:"3ABCDF"},
  {id:75,date:"2026-06-29",time:"21:00",homeSlot:"1F",awaySlot:"2C"},
  {id:76,date:"2026-06-30",time:"13:00",homeSlot:"1C",awaySlot:"2F"},
  {id:77,date:"2026-06-30",time:"17:00",homeSlot:"1I",awaySlot:"3CDFGH"},
  {id:78,date:"2026-06-30",time:"13:00",homeSlot:"2E",awaySlot:"2I"},
  {id:79,date:"2026-06-30",time:"21:00",homeSlot:"1A",awaySlot:"3CEFHI"},
  {id:80,date:"2026-07-01",time:"12:00",homeSlot:"1L",awaySlot:"3EHIJK"},
  {id:81,date:"2026-07-01",time:"20:00",homeSlot:"1D",awaySlot:"3BEFIJ"},
  {id:82,date:"2026-07-01",time:"16:00",homeSlot:"1G",awaySlot:"3AEHIJ"},
  {id:83,date:"2026-07-02",time:"19:00",homeSlot:"2K",awaySlot:"2L"},
  {id:84,date:"2026-07-02",time:"15:00",homeSlot:"1H",awaySlot:"2J"},
  {id:85,date:"2026-07-02",time:"23:00",homeSlot:"1B",awaySlot:"3EFGIJ"},
  {id:86,date:"2026-07-03",time:"18:00",homeSlot:"1J",awaySlot:"2H"},
  {id:87,date:"2026-07-03",time:"21:30",homeSlot:"1K",awaySlot:"3DEIJL"},
  {id:88,date:"2026-07-03",time:"14:00",homeSlot:"2D",awaySlot:"2G"},
];
const R16_FIXTURE = [
  {id:89,date:"2026-07-06",time:"17:00",homeSlot:"W74",awaySlot:"W77"},
  {id:90,date:"2026-07-07",time:"13:00",homeSlot:"W73",awaySlot:"W75"},
  {id:91,date:"2026-07-07",time:"16:00",homeSlot:"W76",awaySlot:"W78"},
  {id:92,date:"2026-07-07",time:"20:00",homeSlot:"W79",awaySlot:"W80"},
  {id:93,date:"2026-07-08",time:"15:00",homeSlot:"W83",awaySlot:"W84"},
  {id:94,date:"2026-07-08",time:"20:00",homeSlot:"W81",awaySlot:"W82"},
  {id:95,date:"2026-07-09",time:"12:00",homeSlot:"W86",awaySlot:"W88"},
  {id:96,date:"2026-07-09",time:"16:00",homeSlot:"W85",awaySlot:"W87"},
];
const QF_FIXTURE = [
  {id:97,date:"2026-07-11",time:"16:00",homeSlot:"W89",awaySlot:"W90"},
  {id:98,date:"2026-07-11",time:"15:00",homeSlot:"W93",awaySlot:"W94"},
  {id:99,date:"2026-07-12",time:"17:00",homeSlot:"W91",awaySlot:"W92"},
  {id:100,date:"2026-07-12",time:"21:00",homeSlot:"W95",awaySlot:"W96"},
];
const SF_FIXTURE = [
  {id:101,date:"2026-07-14",time:"15:00",homeSlot:"W97",awaySlot:"W98"},
  {id:102,date:"2026-07-15",time:"15:00",homeSlot:"W99",awaySlot:"W100"},
];
const FINAL_FIXTURE = [
  {id:103,date:"2026-07-18",time:"17:00",homeSlot:"L101",awaySlot:"L102",label:"3er Lugar"},
  {id:104,date:"2026-07-19",time:"15:00",homeSlot:"W101",awaySlot:"W102",label:"🏆 Gran Final"},
];
const ALL_KO = [...R32_FIXTURE,...R16_FIXTURE,...QF_FIXTURE,...SF_FIXTURE,...FINAL_FIXTURE];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initResults() {
  const r={};
  [...GROUP_MATCHES,...ALL_KO].forEach(m=>{r[m.id]={homeGoals:"",awayGoals:""};});
  return r;
}

function formatDate(d) {
  if(!d) return "";
  return new Date(d+"T12:00:00").toLocaleDateString("es-MX",{weekday:"short",day:"numeric",month:"short"}).toUpperCase();
}

function convertTime(t) {
  const [h,m]=t.split(":").map(Number);
  const ecu=`${String((h-1+24)%24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  const cdmx=`${String((h-2+24)%24).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  return {est:t,ecu,cdmx};
}

function calcGroupStandings(groupTeams,matches,results,discipline={}) {
  const table={};
  groupTeams.forEach(t=>{table[t]={code:t,pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0};});
  matches.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const ht=table[m.home],at=table[m.away];
    if(!ht||!at) return;
    ht.pj++;at.pj++;ht.gf+=hg;ht.gc+=ag;ht.dg+=hg-ag;at.gf+=ag;at.gc+=hg;at.dg+=ag-hg;
    if(hg>ag){ht.pts+=3;ht.pg++;at.pp++;}
    else if(ag>hg){at.pts+=3;at.pg++;ht.pp++;}
    else{ht.pts++;at.pts++;ht.pe++;at.pe++;}
  });
  const teams=Object.values(table);
  // Enfrentamiento directo (head-to-head): solo cuenta los partidos entre los equipos empatados.
  function h2h(tiedCodes){
    const h={};tiedCodes.forEach(c=>{h[c]={pts:0,gf:0,gc:0,dg:0};});
    matches.forEach(m=>{
      if(!tiedCodes.includes(m.home)||!tiedCodes.includes(m.away)) return;
      const r=results[m.id];if(!r||r.homeGoals===""||r.awayGoals==="") return;
      const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);if(isNaN(hg)||isNaN(ag)) return;
      h[m.home].gf+=hg;h[m.home].gc+=ag;h[m.home].dg+=hg-ag;h[m.away].gf+=ag;h[m.away].gc+=hg;h[m.away].dg+=ag-hg;
      if(hg>ag)h[m.home].pts+=3;else if(ag>hg)h[m.away].pts+=3;else{h[m.home].pts++;h[m.away].pts++;}
    });
    return h;
  }
  // Cadena oficial de desempate — FIFA Artículo 13 (orden correcto):
  return teams.sort((a,b)=>{
    // 1) Puntos totales del grupo
    if(b.pts!==a.pts) return b.pts-a.pts;
    // Paso 1: entre los equipos empatados EN PUNTOS, primero el enfrentamiento directo.
    const tied=teams.filter(t=>t.pts===a.pts).map(t=>t.code);
    if(tied.length>=2&&tied.includes(a.code)&&tied.includes(b.code)){
      const hh=h2h(tied);const ha=hh[a.code],hb=hh[b.code];
      // 2) PTS directos  3) DG directa  4) GF directos
      if(hb.pts!==ha.pts) return hb.pts-ha.pts;
      if(hb.dg!==ha.dg) return hb.dg-ha.dg;
      if(hb.gf!==ha.gf) return hb.gf-ha.gf;
    }
    // Paso 2: diferencia de goles y goles a favor en TODO el grupo
    if(b.dg!==a.dg) return b.dg-a.dg;
    if(b.gf!==a.gf) return b.gf-a.gf;
    // Paso 2 f) Conducta / fair play: menos puntos de penalización es mejor
    const da=conductPts(discipline[a.code]),db=conductPts(discipline[b.code]);
    if(da!==db) return da-db;
    // Paso 3: Ranking FIFA (número más bajo = mejor)
    return (FIFA_RANK[a.code]??99)-(FIFA_RANK[b.code]??99);
  });
}

function allStandings(results,discipline={}) {
  const out={};
  Object.entries(GROUPS).forEach(([g,teams])=>{out[g]=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results,discipline);});
  return out;
}

function groupComplete(g,results) {
  return GROUP_MATCHES.filter(m=>m.group===g).every(m=>{
    const r=results[m.id];
    return r&&r.homeGoals!==""&&r.awayGoals!==""&&!isNaN(parseInt(r.homeGoals))&&!isNaN(parseInt(r.awayGoals));
  });
}

// FIFA R32 slots that receive best thirds
const BEST_THIRD_SLOTS = {
  74:["A","B","C","D","F"],
  77:["C","D","F","G","H"],
  79:["C","E","F","H","I"],
  80:["E","H","I","J","K"],
  81:["B","E","F","I","J"],
  82:["A","E","H","I","J"],
  85:["E","F","G","I","J"],
  87:["D","E","I","J","L"],
};

// Assign best thirds to slots in FIFA order: M74→M77→M79→M80→M81→M82→M85→M87
// Each slot gets the best available third from its eligible groups.
// Once a group's third is assigned, that group is excluded from remaining slots.
// Tiebreakers: PTS → DG → GF → Disciplina → Ranking FIFA
function assignBestThirds(standings, _discipline={}) {
  // Rank all 12 thirds by FIFA criteria
  const allThirds = Object.entries(standings)
    .filter(([,st])=>st.length>=3&&st[2].pj>0)
    .map(([g,st])=>({group:g,...st[2]}))
    .sort((a,b)=>{
      if(b.pts!==a.pts) return b.pts-a.pts;
      if(b.dg!==a.dg) return b.dg-a.dg;
      if(b.gf!==a.gf) return b.gf-a.gf;
      const da=conductPts(_discipline?.[a.code]), db=conductPts(_discipline?.[b.code]);
      if(da!==db) return da-db;
      return (FIFA_RANK[a.code]??99)-(FIFA_RANK[b.code]??99);
    });

  // Process slots in FIFA order
  const SLOT_ORDER = [74,77,79,80,81,82,85,87];
  const assignment = {};
  const usedGroups = new Set();

  SLOT_ORDER.forEach(sid=>{
    const eligibleGroups = BEST_THIRD_SLOTS[sid];
    // Find best ranked third whose group is eligible and not yet used
    const best = allThirds.find(t=>eligibleGroups.includes(t.group)&&!usedGroups.has(t.group));
    if(best){
      assignment[sid] = {code:best.code, group:best.group};
      usedGroups.add(best.group);
    }
  });

  return assignment;
}

// Returns {code, provisional} or null
function resolveSlotFull(slot,standings,kw,results,bestThirdsCache) {
  if(/^[123][A-L]$/.test(slot)){
    const pos=parseInt(slot[0])-1,g=slot[1];
    const st=standings[g];
    if(!st||!st[pos]||st[pos].pj===0) return null;
    const provisional=!groupComplete(g,results);
    return {code:st[pos].code, provisional};
  }
  if(/^3[A-L]{2,}$/.test(slot)){
    // Find which slot ID this corresponds to
    const slotGroups = slot.slice(1).split("").sort().join("");
    const slotId = Object.entries(BEST_THIRD_SLOTS).find(([,groups])=>
      [...groups].sort().join("")===slotGroups
    )?.[0];
    if(!slotId) return null;
    const assigned = bestThirdsCache?.[parseInt(slotId)];
    if(!assigned) return null;
    const groups = BEST_THIRD_SLOTS[parseInt(slotId)];
    const provisional = !groups.every(g=>groupComplete(g,results));
    return {code:assigned.code, provisional};
  }
  if(/^W\d+$/.test(slot)){
    const w=kw[parseInt(slot.slice(1))];
    return w?{code:w.winner,provisional:!!w.provisional}:null; // hereda provisional del cruce origen
  }
  if(/^L\d+$/.test(slot)){
    const w=kw[parseInt(slot.slice(1))];
    return w?{code:w.loser,provisional:!!w.provisional}:null;
  }
  return null;
}

// Backward compat
function resolveSlot(slot,standings,kw,results,bestThirdsCache) {
  const r=resolveSlotFull(slot,standings,kw,results,bestThirdsCache);
  return r?.code||null;
}

function computeKnockout(results,standings,bestThirds={}) {
  const kw={};
  ALL_KO.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const hRes=resolveSlotFull(m.homeSlot,standings,kw,results,bestThirds);
    const aRes=resolveSlotFull(m.awaySlot,standings,kw,results,bestThirds);
    if(!hRes||!aRes) return;
    const home=hRes.code,away=aRes.code;
    const provisional=hRes.provisional||aRes.provisional; // si algún equipo aún es provisional, el ganador también
    let winner,loser;
    if(hg>ag){winner=home;loser=away;}
    else if(ag>hg){winner=away;loser=home;}
    else{ // empate en eliminatoria: lo decide el ganador por penales (r.pen); por defecto, el local
      const pen=r.pen==="away"?away:home;
      winner=pen; loser=(pen===home?away:home);
    }
    kw[m.id]={winner,loser,provisional};
  });
  return kw;
}

function slotLabel(slot) {
  const map={"1A":"1° Gr.A","2A":"2° Gr.A","1B":"1° Gr.B","2B":"2° Gr.B","1C":"1° Gr.C","2C":"2° Gr.C","1D":"1° Gr.D","2D":"2° Gr.D","1E":"1° Gr.E","2E":"2° Gr.E","1F":"1° Gr.F","2F":"2° Gr.F","1G":"1° Gr.G","2G":"2° Gr.G","1H":"1° Gr.H","2H":"2° Gr.H","1I":"1° Gr.I","2I":"2° Gr.I","1J":"1° Gr.J","2J":"2° Gr.J","1K":"1° Gr.K","2K":"2° Gr.K","1L":"1° Gr.L","2L":"2° Gr.L","3ABCDF":"Mejor 3° A/B/C/D/F","3CDFGH":"Mejor 3° C/D/F/G/H","3CEFHI":"Mejor 3° C/E/F/H/I","3EHIJK":"Mejor 3° E/H/I/J/K","3BEFIJ":"Mejor 3° B/E/F/I/J","3AEHIJ":"Mejor 3° A/E/H/I/J","3EFGIJ":"Mejor 3° E/F/G/I/J","3DEIJL":"Mejor 3° D/E/I/J/L"};
  if(map[slot]) return map[slot];
  if(/^W\d+$/.test(slot)) return `Gan. P${slot.slice(1)}`;
  if(/^L\d+$/.test(slot)) return `Per. P${slot.slice(1)}`;
  return slot;
}

function calcGlobalRanking(results,discipline={}) {
  const stats={};
  Object.values(GROUPS).flat().forEach(t=>{stats[t]={code:t,pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0,group:""};});
  Object.entries(GROUPS).forEach(([g,teams])=>teams.forEach(t=>{stats[t].group=g;}));
  GROUP_MATCHES.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const ht=stats[m.home],at=stats[m.away];
    if(!ht||!at) return;
    ht.pj++;at.pj++;ht.gf+=hg;ht.gc+=ag;ht.dg+=hg-ag;at.gf+=ag;at.gc+=hg;at.dg+=ag-hg;
    if(hg>ag){ht.pts+=3;ht.pg++;at.pp++;}
    else if(ag>hg){at.pts+=3;at.pg++;ht.pp++;}
    else{ht.pts++;at.pts++;ht.pe++;at.pe++;}
  });
  const teams=Object.values(stats);
  function h2h(tiedCodes){
    const h={};tiedCodes.forEach(c=>{h[c]={pts:0,gf:0,gc:0,dg:0};});
    GROUP_MATCHES.forEach(m=>{
      if(!tiedCodes.includes(m.home)||!tiedCodes.includes(m.away)) return;
      const r=results[m.id];if(!r||r.homeGoals===""||r.awayGoals==="") return;
      const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);if(isNaN(hg)||isNaN(ag)) return;
      h[m.home].gf+=hg;h[m.home].gc+=ag;h[m.home].dg+=hg-ag;h[m.away].gf+=ag;h[m.away].gc+=hg;h[m.away].dg+=ag-hg;
      if(hg>ag)h[m.home].pts+=3;else if(ag>hg)h[m.away].pts+=3;else{h[m.home].pts++;h[m.away].pts++;}
    });
    return h;
  }
  return teams.sort((a,b)=>{
    // 1) Puntos totales
    if(b.pts!==a.pts) return b.pts-a.pts;
    // Mismo grupo y empatados en puntos: enfrentamiento directo PRIMERO (FIFA Art. 13).
    // (Entre grupos distintos no hay enfrentamiento directo, así que se salta este paso.)
    if(a.group===b.group){
      const tied=teams.filter(t=>t.group===a.group&&t.pts===a.pts).map(t=>t.code);
      if(tied.length>=2&&tied.includes(a.code)&&tied.includes(b.code)){
        const hh=h2h(tied);
        const ha=hh[a.code],hb=hh[b.code];
        if(hb.pts!==ha.pts) return hb.pts-ha.pts;
        if(hb.dg!==ha.dg) return hb.dg-ha.dg;
        if(hb.gf!==ha.gf) return hb.gf-ha.gf;
      }
    }
    // 2) Diferencia de goles y goles a favor en todo el grupo
    if(b.dg!==a.dg) return b.dg-a.dg;
    if(b.gf!==a.gf) return b.gf-a.gf;
    // 3) Conducta (fair play) y luego Ranking FIFA
    const da=conductPts(discipline[a.code]),db=conductPts(discipline[b.code]);
    if(da!==db) return da-db;
    return (FIFA_RANK[a.code]??99)-(FIFA_RANK[b.code]??99);
  });
}

function calcStats(results,discipline) {
  const allMatches=[...GROUP_MATCHES,...ALL_KO];
  let totalGoals=0,totalW=0,totalD=0,totalMatches=0;
  const byGroup={},byConf={},byBrand={};
  Object.keys(GROUPS).forEach(g=>{byGroup[g]={goals:0,w:0,d:0,played:0,ta:0,tr:0};});
  Object.keys(CONFEDERATIONS).forEach(c=>{byConf[c]={goals:0,w:0,d:0,played:0,ta:0,tr:0};});
  // Por marca: 'teams' es fijo (cuántas selecciones viste cada marca); el resto se acumula.
  BRAND_ORDER.forEach(b=>{byBrand[b]={teams:0,goals:0,w:0,d:0,played:0,ta:0,tr:0};});
  Object.values(BRAND).forEach(b=>{if(byBrand[b])byBrand[b].teams++;});

  allMatches.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const goals=hg+ag;
    totalGoals+=goals; totalMatches++;
    // Victoria = cualquier partido con ganador (local O visitante); el resto, empate.
    if(hg===ag) totalD++; else totalW++;
    if(m.group){
      byGroup[m.group].goals+=goals; byGroup[m.group].played++;
      if(hg>ag||ag>hg) byGroup[m.group].w++; else byGroup[m.group].d++;
    }
    // Por confederación: a cada equipo se le acreditan SOLO los goles que metió.
    const hConf=TEAM_CONF[m.home], aConf=TEAM_CONF[m.away];
    if(hConf&&byConf[hConf]){ byConf[hConf].goals+=hg; byConf[hConf].played++; }
    if(aConf&&byConf[aConf]){ byConf[aConf].goals+=ag; byConf[aConf].played++; }
    if(hg>ag){ if(hConf&&byConf[hConf])byConf[hConf].w++; }
    else if(ag>hg){ if(aConf&&byConf[aConf])byConf[aConf].w++; }
    else { if(hConf&&byConf[hConf])byConf[hConf].d++; if(aConf&&byConf[aConf])byConf[aConf].d++; }
    // Por marca: mismo criterio que confederación (goles propios, partidos, victorias/empates).
    const hBrand=BRAND[m.home], aBrand=BRAND[m.away];
    if(hBrand&&byBrand[hBrand]){ byBrand[hBrand].goals+=hg; byBrand[hBrand].played++; }
    if(aBrand&&byBrand[aBrand]){ byBrand[aBrand].goals+=ag; byBrand[aBrand].played++; }
    if(hg>ag){ if(hBrand&&byBrand[hBrand])byBrand[hBrand].w++; }
    else if(ag>hg){ if(aBrand&&byBrand[aBrand])byBrand[aBrand].w++; }
    else { if(hBrand&&byBrand[hBrand])byBrand[hBrand].d++; if(aBrand&&byBrand[aBrand])byBrand[aBrand].d++; }
  });

  // Add discipline stats
  Object.entries(discipline||{}).forEach(([code,d])=>{
    const g=Object.entries(GROUPS).find(([,t])=>t.includes(code))?.[0];
    const conf=TEAM_CONF[code];
    const brand=BRAND[code];
    if(g&&byGroup[g]){byGroup[g].ta+=(d.ta||0);byGroup[g].tr+=(d.tr||0);}
    if(conf&&byConf[conf]){byConf[conf].ta+=(d.ta||0);byConf[conf].tr+=(d.tr||0);}
    if(brand&&byBrand[brand]){byBrand[brand].ta+=(d.ta||0);byBrand[brand].tr+=(d.tr||0);}
  });

  const totalTA=Object.values(discipline||{}).reduce((s,d)=>s+(d.ta||0),0);
  const totalTR=Object.values(discipline||{}).reduce((s,d)=>s+(d.tr||0),0);

  return {totalGoals,totalMatches,totalW,totalD,totalTA,totalTR,byGroup,byConf,byBrand};
}

// ─────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────
export default function App() {
  const [tab,setTab]=useState("grupos");
  const [results,setResults]=useState(()=>{
    try{const s=localStorage.getItem("fwc2026_v2");if(s)return{...initResults(),...JSON.parse(s)};}catch{}
    return initResults();
  });
  const [discipline,setDiscipline]=useState(()=>{
    try{const s=localStorage.getItem("fwc2026_discipline");if(s)return JSON.parse(s);}catch{}
    const d={};Object.values(GROUPS).flat().forEach(t=>{d[t]={ta:0,tr:0,pts:0};});return d;
  });
  const [saved,setSaved]=useState(false);
  const [filterGroup,setFilterGroup]=useState("Todos");
  const [countdown,setCountdown]=useState("");

  // ── Sincronización compartida ──────────────────────────────
  const [sync,setSync]=useState(API_URL?"…":"local"); // estado visible: … | online | offline | local
  const hydrated=useRef(false);     // ya cargamos del servidor al menos una vez
  const lastEdit=useRef(0);          // momento de la última edición local (timestamp)
  const remoteResults=useRef(false); // marca: el próximo cambio de results vino del servidor
  const remoteDisc=useRef(false);    // marca: el próximo cambio de discipline vino del servidor
  const pending=useRef({});          // payload acumulado a enviar
  const postTimer=useRef(null);      // temporizador del debounce de envío

  // Envía al servidor agrupando cambios rápidos (debounce de 700 ms).
  const pushState=(payload)=>{
    if(!API_URL) return;             // sin Worker configurado: solo guardado local
    pending.current={...pending.current,...payload};
    clearTimeout(postTimer.current);
    postTimer.current=setTimeout(()=>{
      const body=pending.current; pending.current={};
      apiPost(body).then(()=>setSync("online")).catch(()=>setSync("offline"));
    },700);
  };

  useEffect(()=>{
    const target=new Date("2026-06-11T15:00:00-04:00");
    const tick=()=>{
      const diff=target-new Date();
      if(diff<=0){setCountdown("¡Comenzó! ⚽");return;}
      const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[]);

  // Guarda resultados en local SIEMPRE (caché offline) y los sube al servidor
  // solo si el cambio lo hizo el usuario (no si vino del propio servidor).
  useEffect(()=>{
    try{localStorage.setItem("fwc2026_v2",JSON.stringify(results));}catch{}
    if(remoteResults.current){remoteResults.current=false;return;} // cambio venido del servidor: no reenviar
    if(!hydrated.current) return;                                  // aún no sincronizamos al abrir
    lastEdit.current=Date.now();
    pushState({results});                                          // sube el marcador a Notion
    setSaved(true);const t=setTimeout(()=>setSaved(false),1200);return()=>clearTimeout(t);
  },[results]);

  // Igual para las tarjetas (discipline).
  useEffect(()=>{
    try{localStorage.setItem("fwc2026_discipline",JSON.stringify(discipline));}catch{}
    if(remoteDisc.current){remoteDisc.current=false;return;}
    if(!hydrated.current) return;
    lastEdit.current=Date.now();
    pushState({discipline});
  },[discipline]);

  // Carga el estado compartido al abrir y sondea cada 15 s para ver los cambios de otros.
  useEffect(()=>{
    if(!API_URL){hydrated.current=true;return;}   // sin Worker: la app queda en modo solo local
    let alive=true;
    const pull=async(initial=false)=>{
      try{
        const data=await apiGet();
        if(!alive) return;
        // No pisar una edición local muy reciente (ventana de 6 s) para no borrar lo que escribes.
        if(!initial && Date.now()-lastEdit.current<6000){setSync("online");return;}
        const sr=data.results||{}, sd=data.discipline||{};
        const serverEmpty=Object.keys(sr).length===0 && Object.keys(sd).length===0;
        if(initial && serverEmpty){
          // Primera vez y servidor vacío: si ya tenías datos locales, los subimos (migración).
          hydrated.current=true; setSync("online");
          if(hasLocalData(results,discipline)) pushState({results,discipline});
          return;
        }
        if(Object.keys(sr).length){ remoteResults.current=true; setResults({...initResults(),...sr}); }
        if(Object.keys(sd).length){ remoteDisc.current=true; setDiscipline({...emptyDiscipline(),...sd}); }
        hydrated.current=true; setSync("online");
      }catch{
        if(alive){ hydrated.current=true; setSync("offline"); } // sin conexión: seguimos con la caché local
      }
    };
    pull(true);
    const iv=setInterval(()=>pull(false),15000);
    const onVis=()=>{ if(document.visibilityState==="visible") pull(false); };
    document.addEventListener("visibilitychange",onVis);
    return ()=>{alive=false;clearInterval(iv);document.removeEventListener("visibilitychange",onVis);};
  },[]); // eslint-disable-line react-hooks/exhaustive-deps

  const setGoals=(id,side,val)=>setResults(p=>({...p,[id]:{...p[id],[side]:val}}));
  const setDiscField=(code,field,val)=>{
    const num=val===""?0:Math.max(0,parseInt(val)||0);
    setDiscipline(p=>({...p,[code]:{...p[code],[field]:num}}));
  };
  const reset=()=>{
    if(window.confirm("¿Borrar todos los resultados? No se puede deshacer.")){
      setResults(initResults());localStorage.removeItem("fwc2026_v2");
    }
  };

  const standings=useMemo(()=>allStandings(results,discipline),[results,discipline]);
  const bestThirds=useMemo(()=>assignBestThirds(standings,discipline),[standings,discipline]);
  const knockoutWinners=useMemo(()=>computeKnockout(results,standings,bestThirds),[results,standings,bestThirds]);
  const globalRanking=useMemo(()=>calcGlobalRanking(results,discipline),[results,discipline]);
  const stats=useMemo(()=>calcStats(results,discipline),[results,discipline]);
  // Clasificación REAL (misma fuente que el bracket): 1°/2° de cada grupo + 8 mejores terceros.
  // "directo" = 1° o 2° de grupo; "tercero" = mejor 3° seleccionado.
  const qualifiedInfo=useMemo(()=>{
    const info={};
    Object.values(standings).forEach(st=>{ if(st[0])info[st[0].code]="directo"; if(st[1])info[st[1].code]="directo"; });
    Object.values(bestThirds).forEach(b=>{ if(b&&b.code)info[b.code]="tercero"; });
    return info;
  },[standings,bestThirds]);
  const filtered=filterGroup==="Todos"?GROUP_MATCHES:GROUP_MATCHES.filter(m=>m.group===filterGroup);

  const TABS=[["grupos","GRUPOS"],["partidos","PARTIDOS"],["posiciones","POSICIONES"],["bracket","BRACKET"],["estadisticas","ESTADÍSTICAS"],["disciplina","DISCIPLINA"]];

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",color:C.text,paddingBottom:80}}>
      {/* HEADER */}
      <header style={{background:C.header,borderBottom:`3px solid ${C.gold}`,position:"-webkit-sticky",top:0,zIndex:100,position:"sticky"}}>
        <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:32}}>🏆</div>
            <div>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:2,color:C.gold,lineHeight:1}}>MUNDIAL 2026</div>
              <div style={{fontSize:10,letterSpacing:3,color:"#94a3b8"}}>USA · CAN · MEX</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            <div style={{fontSize:13,fontWeight:700,color:"#7dd3fc",fontVariantNumeric:"tabular-nums"}}>{countdown}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {/* Indicador de sincronización compartida */}
              <span style={{fontSize:10,color:sync==="online"?"#4ade80":sync==="offline"?"#f87171":sync==="local"?"#94a3b8":"#fbbf24"}}>
                {sync==="online"?"🟢 en línea":sync==="offline"?"🔴 sin conexión":sync==="local"?"📴 solo local":"⏳ sincronizando…"}
              </span>
              {saved&&<span style={{fontSize:10,color:"#4ade80"}}>✓ guardado</span>}
              <button onClick={reset} style={{background:"transparent",border:`1px solid #334155`,borderRadius:4,color:"#94a3b8",padding:"3px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.color="#f87171";e.currentTarget.style.borderColor="#f87171";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#94a3b8";e.currentTarget.style.borderColor="#334155";}}>
                RESET
              </button>
            </div>
          </div>
        </div>
        <nav style={{display:"flex",borderTop:"1px solid #1e293b",overflowX:"auto"}}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1,padding:"10px 8px",border:"none",cursor:"pointer",whiteSpace:"nowrap",
              background:tab===k?C.gold:"transparent",
              color:tab===k?C.header:"#94a3b8",
              fontFamily:"inherit",fontSize:11,fontWeight:700,letterSpacing:1,
              borderBottom:tab===k?`2px solid ${C.gold}`:"2px solid transparent",
            }}>{l}</button>
          ))}
        </nav>
      </header>

      <main style={{maxWidth:1300,margin:"0 auto",padding:"16px 12px"}}>

        {/* ── GRUPOS ── */}
        {tab==="grupos"&&(
          <div>
            <SectionTitle>Grupos del Torneo</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
              {Object.entries(GROUPS).map(([g,teams])=>{
                const st=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results,discipline);
                const done=groupComplete(g,results);
                return(
                  <div key={g} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,overflow:"hidden",boxShadow:C.shadow}}>
                    <div style={{background:C.header,padding:"8px 14px",borderBottom:`2px solid ${C.gold}`}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:16,fontWeight:800,letterSpacing:2,color:C.gold}}>GRUPO {g}</span>
                        {done&&<span style={{fontSize:10,fontWeight:700,background:C.gold,color:C.header,padding:"2px 6px",borderRadius:3}}>COMPLETO</span>}
                      </div>
                      <div style={{fontSize:9,color:"#94a3b8",marginTop:3}}>📍 {GROUP_CITIES[g]?.join(" · ")}</div>
                      <div style={{fontSize:10,color:"#64748b",marginTop:2}}>{teams.join(" · ")}</div>
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:320}}>
                        <thead>
                          <tr style={{borderBottom:`1px solid ${C.cardBorder}`,color:C.textMute,fontSize:10}}>
                            {["#","EQUIPO","PJ","PG","PE","PP","GF","GC","DG","PTS"].map(h=>(
                              <th key={h} style={{padding:"6px 6px",textAlign:h==="EQUIPO"?"left":"center",whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {st.map((row,i)=>(
                            <tr key={row.code} style={{borderBottom:`1px solid ${C.cardBorder}`,background:i<2?C.goldLight+"44":"transparent"}}>
                              <td style={{padding:"7px 6px",textAlign:"center"}}>
                                <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:3,fontSize:10,fontWeight:700,background:i===0?C.gold:i===1?C.blueLight:"#f1f5f9",color:i===0?C.header:i===1?C.blue:C.textMute}}>{i+1}</span>
                              </td>
                              <td style={{padding:"7px 6px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontSize:16}}>{FLAGS[row.code]}</span>
                                  <div>
                                    <div style={{fontWeight:700,fontSize:12,color:C.text}}>{row.code}</div>
                                    <div style={{fontSize:9,color:C.textMute}}>{TEAM_NAMES[row.code]}</div>
                                  </div>
                                </div>
                              </td>
                              {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc].map((v,vi)=>(
                                <td key={vi} style={{padding:"7px 6px",textAlign:"center",color:C.textSub,fontSize:12}}>{v}</td>
                              ))}
                              <td style={{padding:"7px 6px",textAlign:"center",fontWeight:600,fontSize:12,color:row.dg>0?C.blue:row.dg<0?C.red:C.textSub}}>{row.dg>0?"+":""}{row.dg}</td>
                              <td style={{padding:"7px 6px",textAlign:"center",fontWeight:800,fontSize:15,color:C.gold}}>{row.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{padding:"6px 12px",fontSize:10,color:C.textMute,borderTop:`1px solid ${C.cardBorder}`}}>🟡 Clasifican los 2 primeros + mejores 3°</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PARTIDOS ── */}
        {tab==="partidos"&&(
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:8}}>
              <SectionTitle style={{margin:0}}>Fase de Grupos</SectionTitle>
              <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)}
                style={{background:C.card,color:C.text,border:`1px solid ${C.cardBorder}`,borderRadius:4,padding:"6px 12px",fontFamily:"inherit",fontSize:13}}>
                <option value="Todos">Todos los grupos</option>
                {Object.keys(GROUPS).map(g=><option key={g} value={g}>Grupo {g}</option>)}
              </select>
            </div>
            {(()=>{
              const byDate={};
              filtered.forEach(m=>{if(!byDate[m.date])byDate[m.date]=[];byDate[m.date].push(m);});
              return Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,ms])=>(
                <div key={date} style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:C.gold,borderBottom:`1px solid ${C.cardBorder}`,paddingBottom:5,marginBottom:10}}>
                    {formatDate(date)}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:8}}>
                    {ms.map(m=><MatchCard key={m.id} match={m} result={results[m.id]} onSet={setGoals}/>)}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* ── POSICIONES ── */}
        {tab==="posiciones"&&(
          <div>
            <SectionTitle>Ranking Global — 48 Equipos</SectionTitle>
            <div style={{fontSize:11,color:C.textMute,marginBottom:6}}>
              Ranking de poder de los 48 equipos. Desempate (FIFA Art. 13): PTS → Enfrentamiento directo (PTS/DG/GF) → DG → GF → Conducta → Ranking FIFA
            </div>
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,overflow:"hidden",boxShadow:C.shadow}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:380}}>
                  <thead>
                    <tr style={{borderBottom:`2px solid ${C.gold}`,color:C.textMute,fontSize:10,background:"#f8fafc"}}>
                      {["#","EQUIPO","GRP","PJ","PG","PE","PP","GF","GC","DG","PTS"].map(h=>(
                        <th key={h} style={{padding:"8px 6px",textAlign:h==="EQUIPO"?"left":"center",whiteSpace:"nowrap",letterSpacing:1}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {globalRanking.map((row,i)=>{
                      // Color tiers:
                      // Gold: top 2 per group = top 24 if perfectly distributed, but we use actual group position
                      // Blue: potential best thirds (positions 3 in each group, best 8 qualify)
                      // We color by rank within group via standings
                      const groupPos = standings[row.group]?.findIndex(t=>t.code===row.code) ?? -1;
                      const rowBg = groupPos===0 ? C.goldLight+"66"
                                  : groupPos===1 ? C.blueLight+"55"
                                  : groupPos===2 ? "#f0fdf4"  // light green - potential best third
                                  : "transparent";
                      const leftBorder = groupPos===0 ? `3px solid ${C.gold}`
                                       : groupPos===1 ? `3px solid ${C.blue}`
                                       : groupPos===2 ? "3px solid #16a34a"
                                       : `3px solid transparent`;
                      return(
                      <tr key={row.code} style={{borderBottom:`1px solid ${C.cardBorder}`,background:rowBg,borderLeft:leftBorder}}>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>
                          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:4,fontSize:11,fontWeight:700,background:groupPos===0?C.gold:groupPos===1?C.blueLight:groupPos===2?"#dcfce7":"#f1f5f9",color:groupPos===0?C.header:groupPos===1?C.blue:groupPos===2?"#16a34a":C.textMute}}>{i+1}</span>
                        </td>
                        <td style={{padding:"7px 6px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{fontSize:16}}>{FLAGS[row.code]}</span>
                            <div>
                              <div style={{fontWeight:700,fontSize:12,color:C.text}}>{row.code}</div>
                              <div style={{fontSize:9,color:C.textMute}}>{TEAM_NAMES[row.code]}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontSize:11,color:C.textMute,fontWeight:700}}>{row.group}</td>
                        {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc].map((v,vi)=>(
                          <td key={vi} style={{padding:"7px 6px",textAlign:"center",color:C.textSub,fontSize:12}}>{v}</td>
                        ))}
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:600,fontSize:12,color:row.dg>0?C.blue:row.dg<0?C.red:C.textSub}}>{row.dg>0?"+":""}{row.dg}</td>
                        <td style={{padding:"7px 6px",textAlign:"center",fontWeight:800,fontSize:15,color:C.gold}}>{row.pts}</td>
                      </tr>
                    );})}
                  </tbody>
                </table>
              </div>
              <div style={{padding:"8px 14px",fontSize:10,color:C.textMute,borderTop:`1px solid ${C.cardBorder}`,display:"flex",gap:16,flexWrap:"wrap",alignItems:"center"}}>
                <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,background:C.gold,borderRadius:2,display:"inline-block"}}/>1° de grupo</span>
                <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,background:C.blue,borderRadius:2,display:"inline-block"}}/>2° de grupo</span>
                <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:10,height:10,background:"#16a34a",borderRadius:2,display:"inline-block"}}/>3° de grupo (posible clasificado)</span>
              </div>
            </div>
          </div>
        )}

        {/* ── BRACKET ── */}
        {tab==="bracket"&&(
          <BracketView standings={standings} knockoutWinners={knockoutWinners} results={results} onSet={setGoals} groupResults={results} bestThirds={bestThirds}/>
        )}

        {/* ── ESTADÍSTICAS ── */}
        {tab==="estadisticas"&&(
          <StatsView stats={stats} results={results} qualifiedInfo={qualifiedInfo}/>
        )}

        {/* ── DISCIPLINA ── */}
        {tab==="disciplina"&&(
          <div>
            <SectionTitle>Tabla de Disciplina</SectionTitle>
            <div style={{fontSize:11,color:C.textMute,marginBottom:12}}>
              Captura TA y TR · PTS = puntos de conducta FIFA, calculados solos (1 × amarilla + 4 × roja) · Criterio de desempate
            </div>
            <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,overflow:"hidden",boxShadow:C.shadow}}>
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13,minWidth:340}}>
                  <thead>
                    <tr style={{borderBottom:`2px solid ${C.gold}`,color:C.textMute,fontSize:11,background:"#f8fafc"}}>
                      <th style={{padding:"8px 10px",textAlign:"center",width:36}}>#</th>
                      <th style={{padding:"8px 10px",textAlign:"left"}}>EQUIPO</th>
                      <th style={{padding:"8px 10px",textAlign:"center",width:36}}>GRP</th>
                      <th style={{padding:"8px 10px",textAlign:"center",width:54}}>TA</th>
                      <th style={{padding:"8px 10px",textAlign:"center",width:54}}>TR</th>
                      <th style={{padding:"8px 10px",textAlign:"center",width:64}}>PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(GROUPS).flat()
                      .map(code=>({code,group:Object.entries(GROUPS).find(([,t])=>t.includes(code))[0],...(discipline[code]||{ta:0,tr:0,pts:0})}))
                      .sort((a,b)=>conductPts(b)-conductPts(a)||(b.tr||0)-(a.tr||0)||(b.ta||0)-(a.ta||0))
                      .map((row,i)=>(
                      <tr key={row.code} style={{borderBottom:`1px solid ${C.cardBorder}`,background:i%2===0?"transparent":"#f8fafc"}}>
                        <td style={{padding:"6px 10px",textAlign:"center",color:C.textMute,fontSize:11}}>{i+1}</td>
                        <td style={{padding:"6px 10px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <span style={{fontSize:18}}>{FLAGS[row.code]}</span>
                            <div>
                              <div style={{fontWeight:700,fontSize:13,color:C.text}}>{row.code}</div>
                              <div style={{fontSize:10,color:C.textMute}}>{TEAM_NAMES[row.code]}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"6px 10px",textAlign:"center",fontSize:11,color:C.textMute,fontWeight:700}}>{row.group}</td>
                        <td style={{padding:"6px 10px",textAlign:"center"}}>
                          <input type="number" min="0" value={discipline[row.code]?.ta??0}
                            onChange={e=>setDiscField(row.code,"ta",e.target.value)}
                            style={{width:44,height:32,textAlign:"center",fontSize:14,fontWeight:700,background:"#fffbeb",border:`1px solid #fcd34d`,borderRadius:5,color:"#92400e",fontFamily:"inherit",outline:"none"}}/>
                        </td>
                        <td style={{padding:"6px 10px",textAlign:"center"}}>
                          <input type="number" min="0" value={discipline[row.code]?.tr??0}
                            onChange={e=>setDiscField(row.code,"tr",e.target.value)}
                            style={{width:44,height:32,textAlign:"center",fontSize:14,fontWeight:700,background:"#fef2f2",border:`1px solid #fca5a5`,borderRadius:5,color:C.red,fontFamily:"inherit",outline:"none"}}/>
                        </td>
                        <td style={{padding:"6px 10px",textAlign:"center"}}>
                          {/* PTS calculado automáticamente desde TA/TR (no editable) */}
                          <span title="Calculado: 1 × amarilla + 4 × roja" style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:52,height:32,fontSize:14,fontWeight:800,background:C.goldLight,border:`1px solid ${C.gold}`,borderRadius:5,color:C.gold}}>{conductPts(discipline[row.code])}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{padding:"8px 14px",fontSize:10,color:C.textMute,borderTop:`1px solid ${C.cardBorder}`}}>
                💾 Guardado automático · Criterio #7 en Ranking Global
              </div>
            </div>
          </div>
        )}

      </main>

      <footer style={{textAlign:"center",padding:"20px",color:C.textMute,fontSize:11,letterSpacing:2,borderTop:`1px solid ${C.cardBorder}`,marginTop:40}}>
        FIFA WORLD CUP 2026™ · DASHBOARD SAKBÉ
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// BRACKET VIEW
// ─────────────────────────────────────────────
function BracketView({standings,knockoutWinners,results,onSet,groupResults,bestThirds}) {
  const [phase,setPhase]=useState("r32");
  const [view,setView]=useState("cards"); // "cards" | "tree"
  const phases=[
    {key:"r32",label:"Dieciseisavos",matches:R32_FIXTURE},
    {key:"r16",label:"Octavos",matches:R16_FIXTURE},
    {key:"qf",label:"Cuartos",matches:QF_FIXTURE},
    {key:"sf",label:"Semis",matches:SF_FIXTURE},
    {key:"final",label:"Final",matches:FINAL_FIXTURE},
  ];
  const current=phases.find(p=>p.key===phase);

  // Helper to get team info for tree
  const getTeam=(slot)=>resolveSlotFull(slot,standings,knockoutWinners,groupResults,bestThirds);

  return(
    <div>
      <SectionTitle>Fase Eliminatoria</SectionTitle>
      {/* View toggle */}
      <div style={{display:"flex",gap:6,marginBottom:16}}>
        <button onClick={()=>setView("cards")} style={{padding:"7px 16px",border:`1px solid ${view==="cards"?C.gold:C.cardBorder}`,borderRadius:4,cursor:"pointer",background:view==="cards"?C.gold:C.card,color:view==="cards"?C.header:C.textSub,fontFamily:"inherit",fontSize:12,fontWeight:700,boxShadow:C.shadow}}>
          ☰ Cards
        </button>
        <button onClick={()=>setView("tree")} style={{padding:"7px 16px",border:`1px solid ${view==="tree"?C.gold:C.cardBorder}`,borderRadius:4,cursor:"pointer",background:view==="tree"?C.gold:C.card,color:view==="tree"?C.header:C.textSub,fontFamily:"inherit",fontSize:12,fontWeight:700,boxShadow:C.shadow}}>
          🌳 Árbol
        </button>
      </div>

      {view==="cards"&&(<>
        <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
          {phases.map(p=>(
            <button key={p.key} onClick={()=>setPhase(p.key)} style={{
              padding:"7px 14px",border:`1px solid ${phase===p.key?C.gold:C.cardBorder}`,borderRadius:4,cursor:"pointer",
              background:phase===p.key?C.gold:C.card,color:phase===p.key?C.header:C.textSub,
              fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1,boxShadow:C.shadow,
            }}>{p.label}</button>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
          {current.matches.map(m=>{
            const homeRes=resolveSlotFull(m.homeSlot,standings,knockoutWinners,groupResults,bestThirds);
            const awayRes=resolveSlotFull(m.awaySlot,standings,knockoutWinners,groupResults,bestThirds);
            return <KOMatchCard key={m.id} match={m}
              homeTeam={homeRes?.code||null} homeProv={homeRes?.provisional||false}
              homeSlotLabel={homeRes?.label||slotLabel(m.homeSlot)}
              awayTeam={awayRes?.code||null} awayProv={awayRes?.provisional||false}
              awaySlotLabel={awayRes?.label||slotLabel(m.awaySlot)}
              result={results[m.id]} onSet={onSet}/>;
          })}
        </div>
      </>)}

      {view==="tree"&&(
        <BracketTree
          standings={standings} knockoutWinners={knockoutWinners}
          results={results} groupResults={groupResults} bestThirds={bestThirds}
          getTeam={getTeam}/>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// BRACKET TREE VIEW
// ─────────────────────────────────────────────
function BracketTree({standings,knockoutWinners,results,groupResults,bestThirds,getTeam}) {
  const allFixtures=[...R32_FIXTURE,...R16_FIXTURE,...QF_FIXTURE,...SF_FIXTURE,...FINAL_FIXTURE];
  const getMatch=(id)=>allFixtures.find(m=>m.id===id);

  const score=(id)=>{
    const res=results[id];
    if(!res||res.homeGoals===""||res.awayGoals==="") return null;
    return {h:parseInt(res.homeGoals),a:parseInt(res.awayGoals)};
  };

  // Heights
  const TEAM_H=44;   // height of one team row
  const VS_H=16;     // height of vs divider
  const MATCH_H=TEAM_H*2+VS_H; // total match card height = 104
  const GAP=24;      // gap between matches in same column
  const SLOT=MATCH_H+GAP; // slot height per match = 128

  // TeamRow
  const TeamRow=({slot,matchId,side,isRight})=>{
    const res=getTeam(slot);
    const code=res?.code||null;
    const prov=res?.provisional||false;
    const lbl=res?.label||slotLabel(slot);
    const sc=score(matchId);
    const played=!!sc;
    const isWin=played&&((side==="home"&&sc.h>sc.a)||(side==="away"&&sc.a>sc.h));
    const goals=sc?(side==="home"?sc.h:sc.a):null;
    return(
      <div style={{
        height:TEAM_H,display:"flex",alignItems:"center",gap:5,
        padding:"0 8px",
        background:isWin?C.goldLight:"#fff",
        borderBottom:`1px solid ${C.cardBorder}`,
      }}>
        {!isRight&&<>
          <span style={{fontSize:16,flexShrink:0}}>{code?FLAGS[code]:"🏳️"}</span>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:11,fontWeight:isWin?800:600,color:isWin?C.gold:code?C.text:C.textMute,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{code||"TBD"}</div>
            <div style={{fontSize:8,color:prov?"#92400e":C.textMute,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lbl}</div>
          </div>
          {goals!==null&&<span style={{fontSize:13,fontWeight:800,color:isWin?C.gold:C.textSub,flexShrink:0,minWidth:16,textAlign:"right"}}>{goals}</span>}
        </>}
        {isRight&&<>
          {goals!==null&&<span style={{fontSize:13,fontWeight:800,color:isWin?C.gold:C.textSub,flexShrink:0,minWidth:16,textAlign:"left"}}>{goals}</span>}
          <div style={{flex:1,minWidth:0,textAlign:"right"}}>
            <div style={{fontSize:11,fontWeight:isWin?800:600,color:isWin?C.gold:code?C.text:C.textMute,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{code||"TBD"}</div>
            <div style={{fontSize:8,color:prov?"#92400e":C.textMute,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{lbl}</div>
          </div>
          <span style={{fontSize:16,flexShrink:0}}>{code?FLAGS[code]:"🏳️"}</span>
        </>}
      </div>
    );
  };

  // Match card — positioned absolutely
  const MatchCard=({matchId,top,isRight,label})=>{
    const m=getMatch(matchId);
    if(!m) return null;
    const sc=score(matchId);
    return(
      <div style={{position:"absolute",top,left:0,right:0}}>
        {label&&<div style={{fontSize:8,color:C.textMute,fontWeight:700,letterSpacing:1,textAlign:"center",marginBottom:2}}>{label}</div>}
        <div style={{
          border:`1px solid ${sc?C.gold:C.cardBorder}`,borderRadius:6,overflow:"hidden",
          boxShadow:sc?"0 1px 6px rgba(184,134,11,.15)":C.shadow,
          background:C.card,
        }}>
          <TeamRow slot={m.homeSlot} matchId={matchId} side="home" isRight={isRight}/>
          <div style={{height:VS_H,display:"flex",alignItems:"center",justifyContent:"center",background:"#f8fafc",borderTop:`1px solid ${C.cardBorder}`,borderBottom:`1px solid ${C.cardBorder}`}}>
            <span style={{fontSize:9,color:sc?C.gold:C.textMute,fontWeight:700}}>{sc?`${sc.h} : ${sc.a}`:"vs"}</span>
          </div>
          <TeamRow slot={m.awaySlot} matchId={matchId} side="away" isRight={isRight}/>
        </div>
      </div>
    );
  };





  // Exact vertical positions (pre-calculated)
  const TOTAL_H = 1024;
  const W = 195;
  const CONN = 40;

  // Mitades REALES del cuadro (FIFA): la izquierda alimenta la SF1 (M101) y la derecha la SF2 (M102).
  // El orden de cada columna está hecho para que las llaves conecten los partidos correctos:
  //   89=W74/W77 · 90=W73/W75 · 93=W83/W84 · 94=W81/W82 → 97=W89/W90 · 98=W93/W94 → 101=W97/W98
  //   91=W76/W78 · 92=W79/W80 · 95=W86/W88 · 96=W85/W87 → 99=W91/W92 · 100=W95/W96 → 102=W99/W100
  const leftR32  = [74,77,73,75,83,84,81,82];
  const rightR32 = [76,78,79,80,86,88,85,87];
  const leftR16  = [89,90,93,94];
  const rightR16 = [91,92,95,96];
  const leftQF   = [97,98];
  const rightQF  = [99,100];
  const leftSF   = [101];
  const rightSF  = [102];

  // Pre-calculated tops for perfect alignment
  const R32_TOPS  = [0, 128, 256, 384, 512, 640, 768, 896];
  const R16_TOPS  = [64, 320, 576, 832];
  const QF_TOPS   = [192, 704];
  const SF_TOP    = 448;
  const FINAL_TOP = 344;
  const THIRD_TOP = 576;

  // SVG connector lines between two columns
  const Connectors=({fromTops, toTops, dir})=>{
    const lines=[];
    toTops.forEach((toTop,i)=>{
      const from1 = fromTops[2*i]   + MATCH_H/2;
      const from2 = fromTops[2*i+1] + MATCH_H/2;
      const toY   = toTop + MATCH_H/2;
      const x0=dir==="right"?W:0, x1=dir==="right"?CONN/2:CONN/2, x2=dir==="right"?CONN:0;
      lines.push(
        <g key={i}>
          <line x1={x0} y1={from1} x2={x1} y2={from1} stroke={C.cardBorder} strokeWidth={1.5}/>
          <line x1={x0} y1={from2} x2={x1} y2={from2} stroke={C.cardBorder} strokeWidth={1.5}/>
          <line x1={x1} y1={from1} x2={x1} y2={from2} stroke={C.cardBorder} strokeWidth={1.5}/>
          <line x1={x1} y1={toY}   x2={x2} y2={toY}   stroke={C.cardBorder} strokeWidth={1.5}/>
        </g>
      );
    });
    return(
      <div style={{flexShrink:0,width:CONN,position:"relative"}}>
        <svg width={CONN} height={TOTAL_H} style={{position:"absolute",top:34,left:0,overflow:"visible"}}>
          {lines}
        </svg>
      </div>
    );
  };

  // SF→Final connectors
  const SFConnectors=({sfTops, finalTop, dir})=>{
    const from1=sfTops[0]+MATCH_H/2;
    const toY=finalTop+MATCH_H/2;
    const x0=dir==="right"?W:0, x1=CONN/2, x2=dir==="right"?CONN:0;
    return(
      <div style={{flexShrink:0,width:CONN,position:"relative"}}>
        <svg width={CONN} height={TOTAL_H} style={{position:"absolute",top:34,left:0,overflow:"visible"}}>
          <line x1={x0} y1={from1} x2={x2} y2={from1} stroke={C.cardBorder} strokeWidth={1.5}/>
        </svg>
      </div>
    );
  };

  // Column with absolute-positioned match cards
  const AbsCol=({title,ids,tops,isRight})=>(
    <div style={{flexShrink:0,width:W}}>
      <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.gold,borderBottom:`2px solid ${C.gold}`,paddingBottom:4,marginBottom:8,textAlign:"center"}}>{title}</div>
      <div style={{position:"relative",height:TOTAL_H}}>
        {ids.map((id,i)=><MatchCard key={id} matchId={id} top={tops[i]} isRight={isRight}/>)}
      </div>
    </div>
  );

  return(
    <div style={{overflowX:"auto",paddingBottom:24,paddingTop:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:W*9+CONN*8+20}}>
        {/* LEFT */}
        <AbsCol title="DIECISEISAVOS" ids={leftR32}  tops={R32_TOPS} isRight={false}/>
        <Connectors fromTops={R32_TOPS} toTops={R16_TOPS} dir="right"/>
        <AbsCol title="OCTAVOS"       ids={leftR16}  tops={R16_TOPS} isRight={false}/>
        <Connectors fromTops={R16_TOPS} toTops={QF_TOPS} dir="right"/>
        <AbsCol title="CUARTOS"       ids={leftQF}   tops={QF_TOPS}  isRight={false}/>
        <Connectors fromTops={QF_TOPS} toTops={[SF_TOP]} dir="right"/>
        <AbsCol title="SEMIS"         ids={leftSF}   tops={[SF_TOP]} isRight={false}/>
        <SFConnectors sfTops={[SF_TOP]} finalTop={FINAL_TOP} dir="right"/>

        {/* CENTER */}
        <div style={{flexShrink:0,width:W}}>
          <div style={{fontSize:10,fontWeight:800,letterSpacing:2,color:C.gold,borderBottom:`2px solid ${C.gold}`,paddingBottom:4,marginBottom:8,textAlign:"center"}}>FINAL</div>
          <div style={{position:"relative",height:TOTAL_H}}>
            <MatchCard matchId={104} top={FINAL_TOP} label="🏆 GRAN FINAL"/>
            <MatchCard matchId={103} top={THIRD_TOP}  label="🥉 3er LUGAR"/>
          </div>
        </div>

        {/* RIGHT */}
        <SFConnectors sfTops={[SF_TOP]} finalTop={FINAL_TOP} dir="left"/>
        <AbsCol title="SEMIS"         ids={rightSF}  tops={[SF_TOP]} isRight={true}/>
        <Connectors fromTops={QF_TOPS} toTops={[SF_TOP]} dir="left"/>
        <AbsCol title="CUARTOS"       ids={rightQF}  tops={QF_TOPS}  isRight={true}/>
        <Connectors fromTops={R16_TOPS} toTops={QF_TOPS} dir="left"/>
        <AbsCol title="OCTAVOS"       ids={rightR16} tops={R16_TOPS} isRight={true}/>
        <Connectors fromTops={R32_TOPS} toTops={R16_TOPS} dir="left"/>
        <AbsCol title="DIECISEISAVOS" ids={rightR32} tops={R32_TOPS} isRight={true}/>
      </div>
      <div style={{fontSize:10,color:C.textMute,marginTop:8,textAlign:"center"}}>
        ← Desplaza horizontalmente para ver el bracket completo →
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// STATS VIEW
// ─────────────────────────────────────────────
function StatsView({stats,results,qualifiedInfo={}}) {
  const {totalGoals,totalMatches,totalW,totalD,totalTA,totalTR,byGroup,byConf,byBrand={}}=stats;
  const avgGoals=totalMatches>0?(totalGoals/totalMatches).toFixed(2):0;
  const confColors={"CONMEBOL":"#0ea5e9","UEFA":"#3b82f6","CONCACAF":"#10b981","CAF":"#f59e0b","AFC":"#ef4444","OFC":"#8b5cf6"};

  // Bar chart helper
  const BarChart=({data,colorKey,colors,label,valueKey="goals"})=>{
    const max=Math.max(...data.map(d=>d[valueKey]||0),1);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.map(d=>{
          const bg=colors?(colors[d.key]||C.blue):(colorKey?confColors[d.key]||C.blue:C.blue);
          return(
          <div key={d.key} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:90,fontSize:11,fontWeight:700,color:C.textSub,textAlign:"right",flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{d.key}</div>
            <div style={{flex:1,background:"#f1f5f9",borderRadius:4,height:20,overflow:"hidden"}}>
              <div style={{width:`${((d[valueKey]||0)/max)*100}%`,height:"100%",background:bg,borderRadius:4,minWidth:d[valueKey]>0?4:0,transition:"width .3s"}}/>
            </div>
            <div style={{width:36,fontSize:12,fontWeight:700,color:C.text,textAlign:"right"}}>{d[valueKey]||0}</div>
          </div>
          );
        })}
      </div>
    );
  };

  // Donut chart helper
  const DonutChart=({slices,size=120})=>{
    const total=slices.reduce((s,sl)=>s+sl.value,0);
    if(total===0) return <div style={{width:size,height:size,borderRadius:"50%",background:"#f1f5f9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:C.textMute}}>Sin datos</div>;
    let cumulative=0;
    const r=45,cx=60,cy=60,strokeW=18;
    const circumference=2*Math.PI*r;
    return(
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} viewBox="0 0 120 120">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={strokeW}/>
          {slices.map((sl,i)=>{
            const pct=sl.value/total;
            const offset=circumference*(1-pct);
            const rotation=cumulative*360-90;
            cumulative+=pct;
            return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={sl.color} strokeWidth={strokeW} strokeDasharray={circumference} strokeDashoffset={offset} transform={`rotate(${rotation} ${cx} ${cy})`} style={{transition:"stroke-dashoffset .3s"}}/>;
          })}
          <text x={cx} y={cy-6} textAnchor="middle" fontSize="16" fontWeight="800" fill={C.text}>{total}</text>
          <text x={cx} y={cy+10} textAnchor="middle" fontSize="9" fill={C.textMute}>TOTAL</text>
        </svg>
      </div>
    );
  };

  const groupData=Object.entries(byGroup).map(([k,v])=>({key:k,...v}));
  const confData=Object.entries(byConf).map(([k,v])=>({key:k,...v}));

  // ── Datos por MARCA de uniforme ──────────────────────────────
  const brandData=BRAND_ORDER.map(b=>({key:b,...(byBrand[b]||{teams:0,goals:0,w:0,d:0,played:0,ta:0,tr:0})}));
  // Reparto (cuántas selecciones por marca) y goles, ordenados de mayor a menor.
  const brandTeams=[...brandData].filter(d=>d.teams>0).sort((a,b)=>b.teams-a.teams);
  const brandGoals=[...brandData].sort((a,b)=>b.goals-a.goals);
  // Rendimiento: puntos promedio por equipo. Las marcas de 1 equipo se agrupan en "Otras".
  const big=brandData.filter(d=>d.teams>=2);
  const small=brandData.filter(d=>d.teams===1);
  const smallTeams=small.reduce((s,d)=>s+d.teams,0);
  const smallPts=small.reduce((s,d)=>s+d.w*3+d.d,0);
  const brandPerf=[...big.map(d=>({key:d.key,avg:d.teams?+((d.w*3+d.d)/d.teams).toFixed(2):0})),
    ...(smallTeams?[{key:"Otras",avg:+(smallPts/smallTeams).toFixed(2)}]:[])].sort((a,b)=>b.avg-a.avg);
  // Marcas entre los clasificados (1°/2° de grupo + mejores terceros).
  const qualBrand={};
  Object.keys(qualifiedInfo||{}).forEach(code=>{const b=BRAND[code];if(b)qualBrand[b]=(qualBrand[b]||0)+1;});
  const totalQual=Object.keys(qualifiedInfo||{}).length;
  const brandQual=BRAND_ORDER.map(b=>({key:b,q:qualBrand[b]||0})).filter(d=>d.q>0).sort((a,b)=>b.q-a.q);

  return(
    <div>
      <SectionTitle>Estadísticas del Torneo</SectionTitle>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:12,marginBottom:24}}>
        {[
          {label:"Goles totales",value:totalGoals,icon:"⚽",color:C.blue},
          {label:"Partidos jugados",value:totalMatches,icon:"🏟",color:C.gold},
          {label:"Promedio goles",value:avgGoals,icon:"📊",color:C.green},
          {label:"Victorias",value:totalW,icon:"🏆",color:"#16a34a"},
          {label:"Empates",value:totalD,icon:"🤝",color:"#9333ea"},
          {label:"Tarjetas amarillas",value:totalTA,icon:"🟨",color:"#d97706"},
          {label:"Tarjetas rojas",value:totalTR,icon:"🟥",color:C.red},
        ].map(kpi=>(
          <div key={kpi.label} style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"14px 12px",textAlign:"center",boxShadow:C.shadow}}>
            <div style={{fontSize:24}}>{kpi.icon}</div>
            <div style={{fontSize:28,fontWeight:900,color:kpi.color,lineHeight:1.1}}>{kpi.value}</div>
            <div style={{fontSize:10,color:C.textMute,marginTop:4,letterSpacing:.5}}>{kpi.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>

        {/* Goles por grupo - barras */}
        <Card title="⚽ Goles por Grupo">
          <BarChart data={groupData} valueKey="goals"/>
        </Card>

        {/* Goles por confederación - barras */}
        <Card title="⚽ Goles por Confederación">
          <BarChart data={confData} colorKey valueKey="goals"/>
          <Legend items={confData.map(d=>({label:d.key,color:confColors[d.key]||C.blue}))}/>
        </Card>

        {/* Resultados globales - donut */}
        <Card title="📊 Tipo de Resultado (Global)">
          <div style={{display:"flex",alignItems:"center",gap:20,justifyContent:"center",padding:"8px 0"}}>
            <DonutChart slices={[
              {label:"Victorias",value:totalW,color:C.green},
              {label:"Empates",value:totalD,color:"#9333ea"},
            ]}/>
            <Legend items={[
              {label:`Victorias: ${totalW}`,color:C.green},
              {label:`Empates: ${totalD}`,color:"#9333ea"},
            ]}/>
          </div>
        </Card>

        {/* Tarjetas - donut */}
        <Card title="🟨 Disciplina Global">
          <div style={{display:"flex",alignItems:"center",gap:20,justifyContent:"center",padding:"8px 0"}}>
            <DonutChart slices={[
              {label:"Amarillas",value:totalTA,color:"#d97706"},
              {label:"Rojas",value:totalTR,color:C.red},
            ]}/>
            <Legend items={[
              {label:`Amarillas: ${totalTA}`,color:"#d97706"},
              {label:`Rojas: ${totalTR}`,color:C.red},
            ]}/>
          </div>
        </Card>

        {/* Tarjetas por confederación - barras */}
        <Card title="🟨 Tarjetas Amarillas por Confederación">
          <BarChart data={confData} colorKey valueKey="ta"/>
          <Legend items={confData.map(d=>({label:d.key,color:confColors[d.key]||C.blue}))}/>
        </Card>

        {/* Tarjetas rojas por confederación */}
        <Card title="🟥 Tarjetas Rojas por Confederación">
          <BarChart data={confData} colorKey valueKey="tr"/>
          <Legend items={confData.map(d=>({label:d.key,color:confColors[d.key]||C.blue}))}/>
        </Card>

        {/* ── MARCAS DE UNIFORME ── */}
        <Card title="👕 Reparto de Marcas (48 selecciones)">
          <BarChart data={brandTeams} colors={BRAND_COLORS} valueKey="teams"/>
        </Card>

        <Card title="👕 Goles por Marca">
          <BarChart data={brandGoals} colors={BRAND_COLORS} valueKey="goals"/>
        </Card>

        <Card title="👕 Rendimiento por Marca (pts promedio/equipo)">
          <div style={{fontSize:10,color:C.textMute,marginBottom:8}}>Marcas de 1 selección agrupadas como "Otras".</div>
          <BarChart data={brandPerf} colors={BRAND_COLORS} valueKey="avg"/>
        </Card>

        <Card title="👕 Marcas entre Clasificados">
          <div style={{fontSize:10,color:C.textMute,marginBottom:8}}>{totalQual} de 32 clasificados (1°/2° de grupo + mejores 3°).</div>
          {brandQual.length>0
            ? <BarChart data={brandQual} colors={BRAND_COLORS} valueKey="q"/>
            : <div style={{fontSize:12,color:C.textMute,padding:"8px 0"}}>Aún no hay equipos clasificados.</div>}
        </Card>

      </div>
    </div>
  );
}

function Card({title,children}) {
  return(
    <div style={{background:C.card,border:`1px solid ${C.cardBorder}`,borderRadius:8,padding:"14px 16px",boxShadow:C.shadow}}>
      <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12,borderBottom:`1px solid ${C.cardBorder}`,paddingBottom:8}}>{title}</div>
      {children}
    </div>
  );
}

function Legend({items}) {
  return(
    <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
      {items.map(item=>(
        <div key={item.label} style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:C.textSub}}>
          <span style={{width:10,height:10,borderRadius:2,background:item.color,flexShrink:0}}/>
          {item.label}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// MATCH CARDS
// ─────────────────────────────────────────────
function MatchCard({match,result,onSet}) {
  const played=result.homeGoals!==""&&result.awayGoals!=="";
  const hg=parseInt(result.homeGoals),ag=parseInt(result.awayGoals);
  const hWin=played&&hg>ag,aWin=played&&ag>hg,draw=played&&hg===ag;
  const t=convertTime(match.time);
  return(
    <div style={{background:C.card,border:`1px solid ${played?C.gold+"88":C.cardBorder}`,borderRadius:8,padding:"10px 12px",boxShadow:C.shadow}}>
      <div style={{marginBottom:7}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textMute}}>
          <span>GRP {match.group} · <span style={{color:C.blue}}>📍{MATCH_CITY[match.id]}</span></span>
          <span style={{background:played?"#dcfce7":C.cardBorder+"99",borderRadius:3,padding:"1px 5px",color:played?C.green:C.textMute,fontWeight:600}}>{played?"FIN":"PEN"}</span>
        </div>
        <div style={{fontSize:10,marginTop:2}}>
          <span style={{color:C.text,fontWeight:700}}>{t.est} EST</span>
          <span style={{margin:"0 4px",color:C.textMute}}>·</span>
          <span style={{color:C.textSub}}>{t.ecu} ECU</span>
          <span style={{margin:"0 4px",color:C.textMute}}>·</span>
          <span style={{color:C.textSub}}>{t.cdmx} CDMX</span>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <TeamBlock code={match.home} win={hWin} align="right"/>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <ScoreInput value={result.homeGoals} onChange={v=>onSet(match.id,"homeGoals",v)} win={hWin} draw={draw} played={played}/>
          <span style={{fontSize:14,color:C.textMute,fontWeight:700}}>:</span>
          <ScoreInput value={result.awayGoals} onChange={v=>onSet(match.id,"awayGoals",v)} win={aWin} draw={draw} played={played}/>
        </div>
        <TeamBlock code={match.away} win={aWin} align="left"/>
      </div>
    </div>
  );
}

function KOMatchCard({match,homeTeam,awayTeam,homeProv,awayProv,result,onSet}) {
  const resolved=!!homeTeam&&!!awayTeam;
  const provisional=(homeProv||awayProv)&&resolved;
  const played=result.homeGoals!==""&&result.awayGoals!=="";
  const hg=parseInt(result.homeGoals),ag=parseInt(result.awayGoals);
  const hWin=played&&hg>ag,aWin=played&&ag>hg,draw=played&&hg===ag;
  const t=convertTime(match.time);
  return(
    <div style={{background:resolved?C.card:"#f8fafc",border:`1px solid ${played?C.gold+"88":provisional?"#f59e0b66":resolved?C.blue+"44":C.cardBorder}`,borderRadius:8,padding:"10px 12px",opacity:resolved?1:0.6,boxShadow:C.shadow}}>
      <div style={{marginBottom:7}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
          <div>
            <span style={{color:C.gold,fontWeight:700}}>{match.label||`P${match.id}`}</span>
            <span style={{color:C.textMute,marginLeft:5}}>📍{MATCH_CITY[match.id]}</span>
          </div>
          <span style={{background:played?"#dcfce7":provisional?"#fffbeb":resolved?C.blueLight:"#f1f5f9",borderRadius:3,padding:"1px 5px",color:played?C.green:provisional?"#92400e":resolved?C.blue:C.textMute,fontWeight:600,fontSize:10}}>
            {played?"FIN":provisional?"PROV.":resolved?"LISTO":"POR DEF."}
          </span>
        </div>
        <div style={{fontSize:10,marginTop:2}}>
          <span style={{color:C.text,fontWeight:700}}>{formatDate(match.date)}</span>
          <span style={{margin:"0 4px",color:C.textMute}}>·</span>
          <span style={{color:C.text,fontWeight:700}}>{t.est} EST</span>
          <span style={{margin:"0 4px",color:C.textMute}}>·</span>
          <span style={{color:C.textSub}}>{t.ecu} ECU</span>
          <span style={{margin:"0 4px",color:C.textMute}}>·</span>
          <span style={{color:C.textSub}}>{t.cdmx} CDMX</span>
        </div>
        {/* Emparejamiento oficial del cruce (siempre visible para verificar el fixing) */}
        <div style={{fontSize:10,marginTop:3,color:C.blue,fontWeight:600}}>
          {slotLabel(match.homeSlot)} <span style={{color:C.textMute,fontWeight:400}}>vs</span> {slotLabel(match.awaySlot)}
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <TeamBlock code={homeTeam} fallback={slotLabel(match.homeSlot)} win={hWin} align="right" prov={homeProv}/>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <ScoreInput value={result.homeGoals} onChange={v=>onSet(match.id,"homeGoals",v)} win={hWin} draw={draw} played={played} disabled={!resolved||provisional}/>
          <span style={{fontSize:14,color:C.textMute,fontWeight:700}}>:</span>
          <ScoreInput value={result.awayGoals} onChange={v=>onSet(match.id,"awayGoals",v)} win={aWin} draw={draw} played={played} disabled={!resolved||provisional}/>
        </div>
        <TeamBlock code={awayTeam} fallback={slotLabel(match.awaySlot)} win={aWin} align="left" prov={awayProv}/>
      </div>
      {draw&&played&&(
        <div style={{marginTop:6,fontSize:10,background:"#fffbeb",borderRadius:4,padding:"4px 6px"}}>
          <div style={{textAlign:"center",color:"#92400e",marginBottom:4,fontWeight:700}}>Empate — ¿quién ganó por penales?</div>
          <div style={{display:"flex",gap:6,justifyContent:"center"}}>
            {[["home",homeTeam],["away",awayTeam]].map(([side,code])=>{
              const sel=(result.pen||"home")===side; // por defecto, el local
              return(
                <button key={side} onClick={()=>onSet(match.id,"pen",side)} disabled={provisional} style={{
                  flex:1,maxWidth:120,padding:"4px 6px",borderRadius:4,cursor:provisional?"not-allowed":"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,
                  border:`1px solid ${sel?C.gold:C.cardBorder}`,background:sel?C.goldLight:C.card,color:sel?C.header:C.textSub
                }}>{sel?"✓ ":""}{code} (pen)</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TeamBlock({code,fallback,win,align,prov}) {
  return(
    <div style={{flex:1,textAlign:align,minWidth:0}}>
      <div style={{fontSize:20,lineHeight:1.1}}>{code?FLAGS[code]:"🏳️"}</div>
      <div style={{fontSize:12,fontWeight:win?700:500,color:win?C.gold:code?C.text:C.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {code||fallback||"TBD"}
      </div>
      {code&&<div style={{fontSize:9,color:C.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TEAM_NAMES[code]}</div>}
      {prov&&code&&<div style={{fontSize:8,fontWeight:700,color:"#92400e",background:"#fffbeb",borderRadius:2,padding:"1px 3px",display:"inline-block",marginTop:1}}>PROV.</div>}
    </div>
  );
}

function ScoreInput({value,onChange,win,draw,played,disabled}) {
  return(
    <input type="number" min="0" max="99" value={value} onChange={e=>onChange(e.target.value)} placeholder="-" disabled={disabled}
      style={{width:42,height:42,textAlign:"center",fontSize:20,fontWeight:800,
        background:win?C.goldLight:draw?C.blueLight:"#f8fafc",
        border:`1px solid ${played?C.gold+"88":C.cardBorder}`,borderRadius:6,
        color:disabled?C.textMute:C.text,fontFamily:"inherit",outline:"none",
        cursor:disabled?"not-allowed":"text",touchAction:"manipulation",WebkitAppearance:"none"}}
    />
  );
}

function SectionTitle({children,style={}}) {
  return(
    <h2 style={{fontSize:16,fontWeight:800,letterSpacing:2,color:C.text,borderLeft:`3px solid ${C.gold}`,paddingLeft:10,marginBottom:16,fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",...style}}>
      {children}
    </h2>
  );
}
