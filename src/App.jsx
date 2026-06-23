import { useState, useEffect, useMemo } from "react";

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
  {id:25,group:"A",date:"2026-06-17",time:"12:00",home:"CZE",away:"RSA"},
  {id:26,group:"B",date:"2026-06-17",time:"15:00",home:"SUI",away:"BIH"},
  {id:27,group:"B",date:"2026-06-18",time:"18:00",home:"CAN",away:"QAT"},
  {id:28,group:"A",date:"2026-06-17",time:"21:00",home:"MEX",away:"KOR"},
  {id:29,group:"C",date:"2026-06-19",time:"20:30",home:"BRA",away:"HAI"},
  {id:30,group:"C",date:"2026-06-19",time:"18:00",home:"SCO",away:"MAR"},
  {id:31,group:"D",date:"2026-06-20",time:"23:00",home:"TUR",away:"PAR"},
  {id:32,group:"D",date:"2026-06-20",time:"15:00",home:"USA",away:"AUS"},
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

function calcGroupStandings(groupTeams,matches,results) {
  const table={};
  groupTeams.forEach(t=>{table[t]={pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0};});
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
  return Object.entries(table).sort((a,b)=>b[1].pts-a[1].pts||b[1].dg-a[1].dg||b[1].gf-a[1].gf).map(([code,s])=>({code,...s}));
}

function allStandings(results) {
  const out={};
  Object.entries(GROUPS).forEach(([g,teams])=>{out[g]=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results);});
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
      const da=_discipline?.[a.code]?.pts??0, db=_discipline?.[b.code]?.pts??0;
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
    // Dynamic label: current position in group
    const posLabel=`${slot[0]}° Grupo ${g}`;
    return {code:st[pos].code, provisional, label:posLabel};
  }
  if(/^3[A-L]{2,}$/.test(slot)){
    const slotGroups = slot.slice(1).split("").sort().join("");
    const slotId = Object.entries(BEST_THIRD_SLOTS).find(([,groups])=>
      [...groups].sort().join("")===slotGroups
    )?.[0];
    if(!slotId) return null;
    const assigned = bestThirdsCache?.[parseInt(slotId)];
    if(!assigned) return null;
    const groups = BEST_THIRD_SLOTS[parseInt(slotId)];
    const provisional = !groups.every(g=>groupComplete(g,results));
    // Label shows the group combination
    const posLabel=`Mejor 3° (${groups.join("/")})`;
    return {code:assigned.code, provisional, label:posLabel};
  }
  if(/^W\d+$/.test(slot)){
    const w=kw[parseInt(slot.slice(1))];
    return w?{code:w.winner,provisional:false,label:`Gan. P${slot.slice(1)}`}:null;
  }
  if(/^L\d+$/.test(slot)){
    const w=kw[parseInt(slot.slice(1))];
    return w?{code:w.loser,provisional:false,label:`Per. P${slot.slice(1)}`}:null;
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
    const home=resolveSlot(m.homeSlot,standings,kw,results,bestThirds);
    const away=resolveSlot(m.awaySlot,standings,kw,results,bestThirds);
    if(!home||!away) return;
    kw[m.id]={winner:hg>=ag?home:away,loser:hg>=ag?away:home};
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
    if(b.pts!==a.pts) return b.pts-a.pts;
    if(b.dg!==a.dg) return b.dg-a.dg;
    if(b.gf!==a.gf) return b.gf-a.gf;
    if(a.group===b.group){
      const tied=teams.filter(t=>t.pts===a.pts&&t.dg===a.dg&&t.gf===a.gf&&t.group===a.group).map(t=>t.code);
      if(tied.length>=2&&tied.includes(a.code)&&tied.includes(b.code)){
        const hh=h2h(tied);
        const ha=hh[a.code],hb=hh[b.code];
        if(hb.pts!==ha.pts) return hb.pts-ha.pts;
        if(hb.dg!==ha.dg) return hb.dg-ha.dg;
        if(hb.gf!==ha.gf) return hb.gf-ha.gf;
      }
    }
    const da=discipline[a.code]?.pts??0,db=discipline[b.code]?.pts??0;
    if(da!==db) return da-db;
    const ra=FIFA_RANK[a.code]??99,rb=FIFA_RANK[b.code]??99;
    return ra-rb;
  });
}

function calcStats(results,discipline) {
  const allMatches=[...GROUP_MATCHES,...ALL_KO];
  let totalGoals=0,totalW=0,totalD=0,totalMatches=0;
  const byGroup={},byConf={};
  Object.keys(GROUPS).forEach(g=>{byGroup[g]={goals:0,w:0,d:0,played:0,ta:0,tr:0};});
  Object.keys(CONFEDERATIONS).forEach(c=>{byConf[c]={goals:0,w:0,d:0,played:0,ta:0,tr:0};});

  allMatches.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const goals=hg+ag;
    totalGoals+=goals; totalMatches++;
    if(hg>ag) totalW++; else if(hg===ag) totalD++;
    if(m.group){
      byGroup[m.group].goals+=goals; byGroup[m.group].played++;
      if(hg>ag||ag>hg) byGroup[m.group].w++; else byGroup[m.group].d++;
    }
    [m.home,m.away].forEach(code=>{
      const conf=TEAM_CONF[code];
      if(conf){byConf[conf].goals+=goals;}
    });
  });

  // Add discipline stats
  Object.entries(discipline||{}).forEach(([code,d])=>{
    const g=Object.entries(GROUPS).find(([,t])=>t.includes(code))?.[0];
    const conf=TEAM_CONF[code];
    if(g&&byGroup[g]){byGroup[g].ta+=(d.ta||0);byGroup[g].tr+=(d.tr||0);}
    if(conf&&byConf[conf]){byConf[conf].ta+=(d.ta||0);byConf[conf].tr+=(d.tr||0);}
  });

  const totalTA=Object.values(discipline||{}).reduce((s,d)=>s+(d.ta||0),0);
  const totalTR=Object.values(discipline||{}).reduce((s,d)=>s+(d.tr||0),0);

  return {totalGoals,totalMatches,totalW,totalD,totalTA,totalTR,byGroup,byConf};
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

  useEffect(()=>{
    try{localStorage.setItem("fwc2026_v2",JSON.stringify(results));setSaved(true);const t=setTimeout(()=>setSaved(false),1200);return()=>clearTimeout(t);}catch{}
  },[results]);

  useEffect(()=>{
    try{localStorage.setItem("fwc2026_discipline",JSON.stringify(discipline));}catch{}
  },[discipline]);

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

  const standings=useMemo(()=>allStandings(results),[results]);
  const bestThirds=useMemo(()=>assignBestThirds(standings,discipline),[standings,discipline]);
  const knockoutWinners=useMemo(()=>computeKnockout(results,standings,bestThirds),[results,standings,bestThirds]);
  const globalRanking=useMemo(()=>calcGlobalRanking(results,discipline),[results,discipline]);
  const stats=useMemo(()=>calcStats(results,discipline),[results,discipline]);
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
                const st=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results);
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
            <div style={{fontSize:11,color:C.textMute,marginBottom:12}}>
              Desempate: PTS → DG → GF → H2H PTS → H2H DG → H2H GF → Disciplina → Ranking FIFA
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
                    {globalRanking.map((row,i)=>(
                      <tr key={row.code} style={{borderBottom:`1px solid ${C.cardBorder}`,background:i<2?C.goldLight+"55":i<24?C.blueLight+"33":"transparent"}}>
                        <td style={{padding:"7px 8px",textAlign:"center"}}>
                          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:22,height:22,borderRadius:4,fontSize:11,fontWeight:700,background:i===0?C.gold:i<3?C.blueLight:"#f1f5f9",color:i===0?C.header:i<3?C.blue:C.textMute}}>{i+1}</span>
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
                    ))}
                  </tbody>
                </table>
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
          <StatsView stats={stats} results={results}/>
        )}

        {/* ── DISCIPLINA ── */}
        {tab==="disciplina"&&(
          <div>
            <SectionTitle>Tabla de Disciplina</SectionTitle>
            <div style={{fontSize:11,color:C.textMute,marginBottom:12}}>
              Actualiza diariamente · TA = Amarillas · TR = Rojas · PTS = Puntos FIFA · Criterio #7 en ranking global
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
                      .sort((a,b)=>(b.pts||0)-(a.pts||0)||(b.ta||0)-(a.ta||0))
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
                          <input type="number" min="0" value={discipline[row.code]?.pts??0}
                            onChange={e=>setDiscField(row.code,"pts",e.target.value)}
                            style={{width:52,height:32,textAlign:"center",fontSize:14,fontWeight:800,background:C.goldLight,border:`1px solid ${C.gold}`,borderRadius:5,color:C.gold,fontFamily:"inherit",outline:"none"}}/>
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
  const phases=[
    {key:"r32",label:"Dieciseisavos",matches:R32_FIXTURE},
    {key:"r16",label:"Octavos",matches:R16_FIXTURE},
    {key:"qf",label:"Cuartos",matches:QF_FIXTURE},
    {key:"sf",label:"Semis",matches:SF_FIXTURE},
    {key:"final",label:"Final",matches:FINAL_FIXTURE},
  ];
  const current=phases.find(p=>p.key===phase);
  return(
    <div>
      <SectionTitle>Fase Eliminatoria</SectionTitle>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {phases.map(p=>(
          <button key={p.key} onClick={()=>setPhase(p.key)} style={{
            padding:"7px 14px",border:`1px solid ${phase===p.key?C.gold:C.cardBorder}`,borderRadius:4,cursor:"pointer",
            background:phase===p.key?C.gold:C.card,
            color:phase===p.key?C.header:C.textSub,
            fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1,
            boxShadow:C.shadow,
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
    </div>
  );
}

// ─────────────────────────────────────────────
// STATS VIEW
// ─────────────────────────────────────────────
function StatsView({stats,results}) {
  const {totalGoals,totalMatches,totalW,totalD,totalTA,totalTR,byGroup,byConf}=stats;
  const avgGoals=totalMatches>0?(totalGoals/totalMatches).toFixed(2):0;
  const confColors={"CONMEBOL":"#0ea5e9","UEFA":"#3b82f6","CONCACAF":"#10b981","CAF":"#f59e0b","AFC":"#ef4444","OFC":"#8b5cf6"};

  // Bar chart helper
  const BarChart=({data,colorKey,label,valueKey="goals"})=>{
    const max=Math.max(...data.map(d=>d[valueKey]||0),1);
    return(
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {data.map(d=>(
          <div key={d.key} style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:80,fontSize:11,fontWeight:700,color:C.textSub,textAlign:"right",flexShrink:0}}>{d.key}</div>
            <div style={{flex:1,background:"#f1f5f9",borderRadius:4,height:20,overflow:"hidden"}}>
              <div style={{width:`${((d[valueKey]||0)/max)*100}%`,height:"100%",background:colorKey?confColors[d.key]||C.blue:C.blue,borderRadius:4,minWidth:d[valueKey]>0?4:0,transition:"width .3s"}}/>
            </div>
            <div style={{width:32,fontSize:12,fontWeight:700,color:C.text}}>{d[valueKey]||0}</div>
          </div>
        ))}
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
              {label:"Pendientes",value:Math.max(0,totalMatches-totalW-totalD),color:"#e2e8f0"},
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

function KOMatchCard({match,homeTeam,awayTeam,homeProv,awayProv,homeSlotLabel,awaySlotLabel,result,onSet}) {
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
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <TeamBlock code={homeTeam} fallback={homeSlotLabel} win={hWin} align="right" prov={homeProv} slotLabel={homeSlotLabel}/>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <ScoreInput value={result.homeGoals} onChange={v=>onSet(match.id,"homeGoals",v)} win={hWin} draw={draw} played={played} disabled={!resolved||provisional}/>
          <span style={{fontSize:14,color:C.textMute,fontWeight:700}}>:</span>
          <ScoreInput value={result.awayGoals} onChange={v=>onSet(match.id,"awayGoals",v)} win={aWin} draw={draw} played={played} disabled={!resolved||provisional}/>
        </div>
        <TeamBlock code={awayTeam} fallback={awaySlotLabel} win={aWin} align="left" prov={awayProv} slotLabel={awaySlotLabel}/>
      </div>
      {draw&&played&&(
        <div style={{textAlign:"center",marginTop:6,fontSize:10,color:"#92400e",background:"#fffbeb",borderRadius:4,padding:"3px 6px"}}>
          Empate — pasa local por defecto (ajusta si hubo penales)
        </div>
      )}
    </div>
  );
}

function TeamBlock({code,fallback,win,align,prov,slotLabel}) {
  return(
    <div style={{flex:1,textAlign:align,minWidth:0}}>
      <div style={{fontSize:20,lineHeight:1.1}}>{code?FLAGS[code]:"🏳️"}</div>
      <div style={{fontSize:12,fontWeight:win?700:500,color:win?C.gold:code?C.text:C.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {code||fallback||"TBD"}
      </div>
      {code&&<div style={{fontSize:9,color:C.textMute,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TEAM_NAMES[code]}</div>}
      {slotLabel&&code&&<div style={{fontSize:9,color:prov?"#92400e":C.blue,background:prov?"#fffbeb":C.blueLight,borderRadius:2,padding:"1px 4px",display:"inline-block",marginTop:2,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"100%"}}>{slotLabel}{prov?" · PROV.":""}</div>}
      {!code&&fallback&&<div style={{fontSize:9,color:C.textMute,marginTop:2}}>{fallback}</div>}
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
