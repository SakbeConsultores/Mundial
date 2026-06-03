import { useState, useEffect, useMemo } from "react";

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

// ─────────────────────────────────────────────
// GROUP STAGE MATCHES (ids 1–72)
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
  {id:26,group:"B",date:"2026-06-18",time:"15:00",home:"SUI",away:"BIH"},
  {id:27,group:"B",date:"2026-06-18",time:"18:00",home:"CAN",away:"QAT"},
  {id:28,group:"A",date:"2026-06-17",time:"21:00",home:"MEX",away:"KOR"},
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

// ─────────────────────────────────────────────
// KNOCKOUT FIXTURES
// Slots: "1A","2B" = pos in group; "3ABCDF" = best 3rd from those groups; "WNN"/"LNN" = winner/loser of match NN
// ─────────────────────────────────────────────
const R32_FIXTURE = [
  {id:73, date:"2026-06-27",time:"15:00", homeSlot:"2A", awaySlot:"2B"},
  {id:74, date:"2026-06-27",time:"16:30", homeSlot:"1E", awaySlot:"3ABCDF"},
  {id:75, date:"2026-06-27",time:"21:00", homeSlot:"1F", awaySlot:"2C"},
  {id:76, date:"2026-06-28",time:"13:00", homeSlot:"1C", awaySlot:"2F"},
  {id:77, date:"2026-06-28",time:"17:00", homeSlot:"1I", awaySlot:"3CDFGH"},
  {id:78, date:"2026-06-28",time:"13:00", homeSlot:"2E", awaySlot:"2I"},
  {id:79, date:"2026-06-28",time:"21:00", homeSlot:"1A", awaySlot:"3CEFHI"},
  {id:80, date:"2026-07-01",time:"12:00", homeSlot:"1L", awaySlot:"3EHIJK"},
  {id:81, date:"2026-07-01",time:"20:00", homeSlot:"1D", awaySlot:"3BEFIJ"},
  {id:82, date:"2026-07-01",time:"16:00", homeSlot:"1G", awaySlot:"3AEHIJ"},
  {id:83, date:"2026-07-02",time:"19:00", homeSlot:"2K", awaySlot:"2L"},
  {id:84, date:"2026-07-02",time:"15:00", homeSlot:"1H", awaySlot:"2J"},
  {id:85, date:"2026-07-02",time:"23:00", homeSlot:"1B", awaySlot:"3EFGIJ"},
  {id:86, date:"2026-07-03",time:"18:00", homeSlot:"1J", awaySlot:"2H"},
  {id:87, date:"2026-07-03",time:"21:30", homeSlot:"1K", awaySlot:"3DEIJL"},
  {id:88, date:"2026-07-03",time:"14:00", homeSlot:"2D", awaySlot:"2G"},
];

const R16_FIXTURE = [
  {id:89, date:"2026-07-06",time:"17:00", homeSlot:"W74", awaySlot:"W77"},
  {id:90, date:"2026-07-07",time:"13:00", homeSlot:"W73", awaySlot:"W75"},
  {id:91, date:"2026-07-07",time:"16:00", homeSlot:"W76", awaySlot:"W78"},
  {id:92, date:"2026-07-07",time:"20:00", homeSlot:"W79", awaySlot:"W80"},
  {id:93, date:"2026-07-08",time:"15:00", homeSlot:"W83", awaySlot:"W84"},
  {id:94, date:"2026-07-08",time:"20:00", homeSlot:"W81", awaySlot:"W82"},
  {id:95, date:"2026-07-09",time:"12:00", homeSlot:"W86", awaySlot:"W88"},
  {id:96, date:"2026-07-09",time:"16:00", homeSlot:"W85", awaySlot:"W87"},
];

const QF_FIXTURE = [
  {id:97, date:"2026-07-11",time:"16:00", homeSlot:"W89", awaySlot:"W90"},
  {id:98, date:"2026-07-11",time:"15:00", homeSlot:"W93", awaySlot:"W94"},
  {id:99, date:"2026-07-12",time:"17:00", homeSlot:"W91", awaySlot:"W92"},
  {id:100,date:"2026-07-12",time:"21:00", homeSlot:"W95", awaySlot:"W96"},
];

const SF_FIXTURE = [
  {id:101,date:"2026-07-14",time:"15:00", homeSlot:"W97", awaySlot:"W98"},
  {id:102,date:"2026-07-15",time:"15:00", homeSlot:"W99", awaySlot:"W100"},
];

const FINAL_FIXTURE = [
  {id:103,date:"2026-07-18",time:"17:00", homeSlot:"L101", awaySlot:"L102", label:"3er Lugar"},
  {id:104,date:"2026-07-19",time:"15:00", homeSlot:"W101", awaySlot:"W102", label:"🏆 Gran Final"},
];

const ALL_KO = [...R32_FIXTURE,...R16_FIXTURE,...QF_FIXTURE,...SF_FIXTURE,...FINAL_FIXTURE];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initResults() {
  const r = {};
  [...GROUP_MATCHES,...ALL_KO].forEach(m => { r[m.id]={homeGoals:"",awayGoals:""}; });
  return r;
}

function calcGroupStandings(groupTeams, matches, results) {
  const table = {};
  groupTeams.forEach(t => { table[t]={pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0}; });
  matches.forEach(m => {
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
  return Object.entries(table)
    .sort((a,b)=>b[1].pts-a[1].pts||b[1].dg-a[1].dg||b[1].gf-a[1].gf)
    .map(([code,stats])=>({code,...stats}));
}

function allStandings(results) {
  const out={};
  Object.entries(GROUPS).forEach(([g,teams])=>{
    out[g]=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results);
  });
  return out;
}

// Check if a group is "complete" (all 6 matches have results)
function groupComplete(g, results) {
  const matches = GROUP_MATCHES.filter(m=>m.group===g);
  return matches.every(m=>{
    const r=results[m.id];
    return r&&r.homeGoals!==""&&r.awayGoals!==""&&!isNaN(parseInt(r.homeGoals))&&!isNaN(parseInt(r.awayGoals));
  });
}

// Resolve a slot → team code, only when data is confirmed
// Returns null if not yet determined (group not complete, or prior KO match not played)
function resolveSlot(slot, standings, knockoutWinners, results) {
  // Direct group position: "1A","2B","3C"
  if (/^[123][A-L]$/.test(slot)) {
    const pos=parseInt(slot[0])-1, g=slot[1];
    if(!groupComplete(g,results)) return null;
    return standings[g]?.[pos]?.code||null;
  }
  // Best 3rd from group combo: "3ABCDF" (pick slot-specific best 3rd)
  if (/^3[A-L]{2,}$/.test(slot)) {
    const groups=slot.slice(1).split("");
    // All listed groups must be complete to determine best 3rd
    if(!groups.every(g=>groupComplete(g,results))) return null;
    const thirds = groups.map(g=>{
      const s=standings[g];
      if(!s||s.length<3) return null;
      return{code:s[2].code,group:g,...s[2]};
    }).filter(Boolean).sort((a,b)=>b.pts-a.pts||b.dg-a.dg||b.gf-a.gf||a.group.localeCompare(b.group));
    return thirds[0]?.code||null;
  }
  // Winner of KO match: "W73"
  if (/^W\d+$/.test(slot)) return knockoutWinners[parseInt(slot.slice(1))]?.winner||null;
  // Loser of KO match: "L101"
  if (/^L\d+$/.test(slot)) return knockoutWinners[parseInt(slot.slice(1))]?.loser||null;
  return null;
}

function computeKnockout(results, standings) {
  const kw={};
  ALL_KO.forEach(m=>{
    const r=results[m.id];
    if(!r||r.homeGoals===""||r.awayGoals==="") return;
    const hg=parseInt(r.homeGoals),ag=parseInt(r.awayGoals);
    if(isNaN(hg)||isNaN(ag)) return;
    const home=resolveSlot(m.homeSlot,standings,kw,results);
    const away=resolveSlot(m.awaySlot,standings,kw,results);
    if(!home||!away) return;
    kw[m.id]={winner:hg>=ag?home:away, loser:hg>=ag?away:home};
  });
  return kw;
}

// Human-readable slot label
function slotLabel(slot) {
  const map={
    "1A":"1° Grupo A","2A":"2° Grupo A","1B":"1° Grupo B","2B":"2° Grupo B",
    "1C":"1° Grupo C","2C":"2° Grupo C","1D":"1° Grupo D","2D":"2° Grupo D",
    "1E":"1° Grupo E","2E":"2° Grupo E","1F":"1° Grupo F","2F":"2° Grupo F",
    "1G":"1° Grupo G","2G":"2° Grupo G","1H":"1° Grupo H","2H":"2° Grupo H",
    "1I":"1° Grupo I","2I":"2° Grupo I","1J":"1° Grupo J","2J":"2° Grupo J",
    "1K":"1° Grupo K","2K":"2° Grupo K","1L":"1° Grupo L","2L":"2° Grupo L",
    "3ABCDF":"Mejor 3° (A/B/C/D/F)","3CDFGH":"Mejor 3° (C/D/F/G/H)",
    "3CEFHI":"Mejor 3° (C/E/F/H/I)","3EHIJK":"Mejor 3° (E/H/I/J/K)",
    "3BEFIJ":"Mejor 3° (B/E/F/I/J)","3AEHIJ":"Mejor 3° (A/E/H/I/J)",
    "3EFGIJ":"Mejor 3° (E/F/G/I/J)","3DEIJL":"Mejor 3° (D/E/I/J/L)",
  };
  if(map[slot]) return map[slot];
  if(/^W\d+$/.test(slot)) return `Ganador P${slot.slice(1)}`;
  if(/^L\d+$/.test(slot)) return `Perdedor P${slot.slice(1)}`;
  return slot;
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
  const [saved,setSaved]=useState(false);
  const [filterGroup,setFilterGroup]=useState("Todos");
  const [countdown,setCountdown]=useState("");

  useEffect(()=>{
    const target=new Date("2026-06-11T15:00:00-04:00");
    const tick=()=>{
      const diff=target-new Date();
      if(diff<=0){setCountdown("¡Comenzó! ⚽");return;}
      const d=Math.floor(diff/86400000),h=Math.floor((diff%86400000)/3600000),
            m=Math.floor((diff%3600000)/60000),s=Math.floor((diff%60000)/1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();const iv=setInterval(tick,1000);return()=>clearInterval(iv);
  },[]);

  useEffect(()=>{
    try{localStorage.setItem("fwc2026_v2",JSON.stringify(results));setSaved(true);const t=setTimeout(()=>setSaved(false),1200);return()=>clearTimeout(t);}catch{}
  },[results]);

  const setGoals=(id,side,val)=>setResults(p=>({...p,[id]:{...p[id],[side]:val}}));

  const reset=()=>{
    if(window.confirm("¿Borrar todos los resultados? No se puede deshacer.")){
      setResults(initResults());localStorage.removeItem("fwc2026_v2");
    }
  };

  const standings=useMemo(()=>allStandings(results),[results]);
  const knockoutWinners=useMemo(()=>computeKnockout(results,standings),[results,standings]);

  const filtered=filterGroup==="Todos"?GROUP_MATCHES:GROUP_MATCHES.filter(m=>m.group===filterGroup);

  const TABS=[["grupos","GRUPOS"],["partidos","PARTIDOS"],["posiciones","POSICIONES"],["bracket","BRACKET"]];

  return(
    <div style={{minHeight:"100vh",minHeight:"100dvh",background:"#0a0f1e",fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",color:"#e8eaf6",paddingBottom:80}}>

      {/* HEADER */}
      <header style={{background:"linear-gradient(135deg,#0d1b2a 0%,#1a1042 50%,#0d1b2a 100%)",borderBottom:"2px solid #c9a227",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1300,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{fontSize:32}}>🏆</div>
            <div>
              <div style={{fontSize:20,fontWeight:800,letterSpacing:2,color:"#c9a227",lineHeight:1}}>MUNDIAL 2026</div>
              <div style={{fontSize:10,letterSpacing:3,color:"#8899bb"}}>USA · CAN · MEX</div>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
            <div style={{fontSize:13,fontWeight:700,color:"#4fc3f7",fontVariantNumeric:"tabular-nums"}}>{countdown}</div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {saved&&<span style={{fontSize:10,color:"#4caf50"}}>✓ guardado</span>}
              <button onClick={reset} style={{background:"transparent",border:"1px solid #2a3a55",borderRadius:4,color:"#8899bb",padding:"3px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.color="#ef5350";e.currentTarget.style.borderColor="#ef5350";}}
                onMouseLeave={e=>{e.currentTarget.style.color="#8899bb";e.currentTarget.style.borderColor="#2a3a55";}}>
                RESET
              </button>
            </div>
          </div>
        </div>
        {/* NAV */}
        <nav style={{display:"flex",borderTop:"1px solid #1e2d4a",overflowX:"auto"}}>
          {TABS.map(([k,l])=>(
            <button key={k} onClick={()=>setTab(k)} style={{
              flex:1,padding:"10px 8px",border:"none",cursor:"pointer",whiteSpace:"nowrap",
              background:tab===k?"#c9a227":"transparent",
              color:tab===k?"#0a0f1e":"#8899bb",
              fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1,
              borderBottom:tab===k?"2px solid #c9a227":"2px solid transparent",
            }}>{l}</button>
          ))}
        </nav>
      </header>

      <main style={{maxWidth:1300,margin:"0 auto",padding:"16px 12px"}}>

        {/* ── GRUPOS ── */}
        {tab==="grupos"&&(
          <div>
            <SectionTitle>Grupos del Torneo</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {Object.entries(GROUPS).map(([g,teams])=>{
                const st=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results);
                const done=groupComplete(g,results);
                return(
                  <div key={g} style={{background:"#0f1a2e",border:"1px solid #1e2d4a",borderRadius:8,overflow:"hidden"}}>
                    <div style={{background:"#c9a227",color:"#0a0f1e",padding:"7px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:20,fontWeight:900,letterSpacing:1}}>GRUPO {g}</span>
                      {done&&<span style={{fontSize:10,fontWeight:700,background:"#0a0f1e",color:"#c9a227",padding:"2px 6px",borderRadius:3}}>COMPLETO</span>}
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid #1e2d4a",color:"#8899bb",fontSize:10}}>
                          <th style={{padding:"5px 12px",textAlign:"left"}}>EQUIPO</th>
                          <th style={{padding:"5px 6px",textAlign:"center"}}>PJ</th>
                          <th style={{padding:"5px 6px",textAlign:"center"}}>PTS</th>
                          <th style={{padding:"5px 6px",textAlign:"center"}}>DG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {st.map((row,i)=>(
                          <tr key={row.code} style={{borderBottom:"1px solid #0d1828",background:i<2?"rgba(201,162,39,0.07)":"transparent"}}>
                            <td style={{padding:"6px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:7}}>
                                <span style={{width:16,height:16,borderRadius:"50%",background:i===0?"#c9a227":i===1?"#4fc3f7":"#2a3a55",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:i<2?"#0a0f1e":"#8899bb",flexShrink:0}}>{i+1}</span>
                                <span style={{fontSize:16}}>{FLAGS[row.code]}</span>
                                <span style={{fontWeight:600,fontSize:13}}>{row.code}</span>
                              </div>
                            </td>
                            <td style={{padding:"6px",textAlign:"center",color:"#aab",fontSize:13}}>{row.pj}</td>
                            <td style={{padding:"6px",textAlign:"center",fontWeight:700,color:"#c9a227",fontSize:14}}>{row.pts}</td>
                            <td style={{padding:"6px",textAlign:"center",color:row.dg>0?"#4fc3f7":row.dg<0?"#ef5350":"#aab",fontSize:13}}>{row.dg>0?"+":""}{row.dg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
                style={{background:"#0f1a2e",color:"#e8eaf6",border:"1px solid #1e2d4a",borderRadius:4,padding:"6px 12px",fontFamily:"inherit",fontSize:13}}>
                <option value="Todos">Todos los grupos</option>
                {Object.keys(GROUPS).map(g=><option key={g} value={g}>Grupo {g}</option>)}
              </select>
            </div>
            {(()=>{
              const byDate={};
              filtered.forEach(m=>{if(!byDate[m.date])byDate[m.date]=[];byDate[m.date].push(m);});
              return Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date,ms])=>(
                <div key={date} style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,letterSpacing:2,color:"#c9a227",borderBottom:"1px solid #1e2d4a",paddingBottom:5,marginBottom:10}}>
                    {new Date(date+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long"}).toUpperCase()}
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
            <SectionTitle>Tabla de Posiciones</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:16}}>
              {Object.entries(GROUPS).map(([g,teams])=>{
                const st=calcGroupStandings(teams,GROUP_MATCHES.filter(m=>m.group===g),results);
                return(
                  <div key={g} style={{background:"#0f1a2e",border:"1px solid #1e2d4a",borderRadius:8,overflow:"hidden"}}>
                    <div style={{background:"#0d1828",padding:"8px 14px",borderBottom:"2px solid #c9a227",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:15,fontWeight:800,letterSpacing:2,color:"#c9a227"}}>GRUPO {g}</span>
                      <span style={{fontSize:10,color:"#8899bb"}}>{teams.join(" · ")}</span>
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,minWidth:320}}>
                        <thead>
                          <tr style={{borderBottom:"1px solid #1e2d4a",color:"#8899bb",fontSize:10}}>
                            {["#","EQUIPO","PJ","PG","PE","PP","GF","GC","DG","PTS"].map(h=>(
                              <th key={h} style={{padding:"6px 6px",textAlign:h==="EQUIPO"?"left":"center",whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {st.map((row,i)=>(
                            <tr key={row.code} style={{borderBottom:"1px solid #0d1828",background:i<2?"rgba(201,162,39,0.06)":"transparent"}}>
                              <td style={{padding:"7px 6px",textAlign:"center"}}>
                                <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:18,height:18,borderRadius:3,fontSize:10,fontWeight:700,background:i===0?"#c9a227":i===1?"rgba(79,195,247,.25)":"#1e2d4a",color:i===0?"#0a0f1e":i===1?"#4fc3f7":"#8899bb"}}>{i+1}</span>
                              </td>
                              <td style={{padding:"7px 6px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <span style={{fontSize:16}}>{FLAGS[row.code]}</span>
                                  <div>
                                    <div style={{fontWeight:700,fontSize:12}}>{row.code}</div>
                                    <div style={{fontSize:9,color:"#8899bb",lineHeight:1}}>{TEAM_NAMES[row.code]}</div>
                                  </div>
                                </div>
                              </td>
                              {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc].map((v,vi)=>(
                                <td key={vi} style={{padding:"7px 6px",textAlign:"center",color:"#ccc",fontSize:12}}>{v}</td>
                              ))}
                              <td style={{padding:"7px 6px",textAlign:"center",fontWeight:600,fontSize:12,color:row.dg>0?"#4fc3f7":row.dg<0?"#ef5350":"#aab"}}>{row.dg>0?"+":""}{row.dg}</td>
                              <td style={{padding:"7px 6px",textAlign:"center",fontWeight:800,fontSize:15,color:"#c9a227"}}>{row.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div style={{padding:"6px 12px",fontSize:10,color:"#4a6080",borderTop:"1px solid #1e2d4a"}}>🟡 Clasifican los 2 primeros + mejores 3°</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── BRACKET ── */}
        {tab==="bracket"&&(
          <BracketView standings={standings} knockoutWinners={knockoutWinners} results={results} onSet={setGoals} groupResults={results}/>
        )}

      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// BRACKET VIEW
// ─────────────────────────────────────────────
function BracketView({standings,knockoutWinners,results,onSet,groupResults}) {
  const [phase,setPhase]=useState("r32");
  const phases=[
    {key:"r32",  label:"Ronda de 32", matches:R32_FIXTURE},
    {key:"r16",  label:"Octavos",     matches:R16_FIXTURE},
    {key:"qf",   label:"Cuartos",     matches:QF_FIXTURE},
    {key:"sf",   label:"Semis",       matches:SF_FIXTURE},
    {key:"final",label:"Final",       matches:FINAL_FIXTURE},
  ];
  const current=phases.find(p=>p.key===phase);

  return(
    <div>
      <SectionTitle>Fase Eliminatoria</SectionTitle>
      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {phases.map(p=>(
          <button key={p.key} onClick={()=>setPhase(p.key)} style={{
            padding:"7px 14px",border:`1px solid ${phase===p.key?"#c9a227":"#1e2d4a"}`,borderRadius:4,cursor:"pointer",
            background:phase===p.key?"#c9a227":"#0f1a2e",
            color:phase===p.key?"#0a0f1e":"#8899bb",
            fontFamily:"inherit",fontSize:12,fontWeight:700,letterSpacing:1,
          }}>{p.label}</button>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {current.matches.map(m=>{
          const homeTeam=resolveSlot(m.homeSlot,standings,knockoutWinners,groupResults);
          const awayTeam=resolveSlot(m.awaySlot,standings,knockoutWinners,groupResults);
          return(
            <KOMatchCard key={m.id} match={m}
              homeTeam={homeTeam} awayTeam={awayTeam}
              result={results[m.id]} onSet={onSet}/>
          );
        })}
      </div>
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
  return(
    <div style={{background:"#0f1a2e",border:`1px solid ${played?"#c9a22755":"#1e2d4a"}`,borderRadius:8,padding:"10px 12px",boxShadow:played?"0 0 10px rgba(201,162,39,.1)":"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:10,color:"#8899bb"}}>
        <span>GRP {match.group} · {match.time} ET</span>
        <span style={{background:"#1e2d4a",borderRadius:3,padding:"1px 5px",color:played?"#4fc3f7":"#8899bb"}}>{played?"FIN":"PEN"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <TeamBlock code={match.home} win={hWin} align="right"/>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <ScoreInput value={result.homeGoals} onChange={v=>onSet(match.id,"homeGoals",v)} win={hWin} draw={draw} played={played}/>
          <span style={{fontSize:14,color:"#2a3a55",fontWeight:700}}>:</span>
          <ScoreInput value={result.awayGoals} onChange={v=>onSet(match.id,"awayGoals",v)} win={aWin} draw={draw} played={played}/>
        </div>
        <TeamBlock code={match.away} win={aWin} align="left"/>
      </div>
    </div>
  );
}

function KOMatchCard({match,homeTeam,awayTeam,result,onSet}) {
  const resolved=!!homeTeam&&!!awayTeam;
  const played=result.homeGoals!==""&&result.awayGoals!=="";
  const hg=parseInt(result.homeGoals),ag=parseInt(result.awayGoals);
  const hWin=played&&hg>ag,aWin=played&&ag>hg,draw=played&&hg===ag;

  return(
    <div style={{background:"#0f1a2e",border:`1px solid ${played?"#c9a22755":resolved?"#1e3d5a":"#1e2d4a"}`,borderRadius:8,padding:"10px 12px",opacity:resolved?1:0.6,boxShadow:played?"0 0 10px rgba(201,162,39,.1)":"none"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:7,fontSize:10,color:"#8899bb"}}>
        <span style={{color:"#c9a227",fontWeight:700}}>{match.label||`P${match.id}`} · {match.time} ET</span>
        <span style={{background:"#1e2d4a",borderRadius:3,padding:"1px 5px",color:played?"#4fc3f7":resolved?"#c9a227":"#556"}}>
          {played?"FIN":resolved?"LISTO":"POR DEF."}
        </span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <TeamBlock code={homeTeam} fallback={slotLabel(match.homeSlot)} win={hWin} align="right"/>
        <div style={{display:"flex",alignItems:"center",gap:3}}>
          <ScoreInput value={result.homeGoals} onChange={v=>onSet(match.id,"homeGoals",v)} win={hWin} draw={draw} played={played} disabled={!resolved}/>
          <span style={{fontSize:14,color:"#2a3a55",fontWeight:700}}>:</span>
          <ScoreInput value={result.awayGoals} onChange={v=>onSet(match.id,"awayGoals",v)} win={aWin} draw={draw} played={played} disabled={!resolved}/>
        </div>
        <TeamBlock code={awayTeam} fallback={slotLabel(match.awaySlot)} win={aWin} align="left"/>
      </div>
      {draw&&played&&(
        <div style={{textAlign:"center",marginTop:6,fontSize:10,color:"#f59e0b",background:"rgba(245,158,11,.08)",borderRadius:4,padding:"3px 6px"}}>
          Empate — pasa local por defecto (ajusta si hubo penales)
        </div>
      )}
    </div>
  );
}

function TeamBlock({code,fallback,win,align}) {
  const isRight=align==="right";
  return(
    <div style={{flex:1,textAlign:align,minWidth:0}}>
      <div style={{fontSize:20,lineHeight:1.1}}>{code?FLAGS[code]:"🏳️"}</div>
      <div style={{fontSize:12,fontWeight:win?700:500,color:win?"#c9a227":code?"#ccd":"#4a6080",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
        {code||fallback||"TBD"}
      </div>
      {code&&<div style={{fontSize:9,color:"#4a6080",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{TEAM_NAMES[code]}</div>}
    </div>
  );
}

function ScoreInput({value,onChange,win,draw,played,disabled}) {
  return(
    <input type="number" min="0" max="99" value={value} onChange={e=>onChange(e.target.value)} placeholder="-" disabled={disabled}
      style={{width:42,height:42,textAlign:"center",fontSize:20,fontWeight:800,
        background:win?"rgba(201,162,39,.15)":draw?"rgba(79,195,247,.1)":"#0a1020",
        border:`1px solid ${played?"#c9a22766":"#1e2d4a"}`,borderRadius:6,
        color:disabled?"#2a3a55":"#e8eaf6",fontFamily:"inherit",outline:"none",
        cursor:disabled?"not-allowed":"text",touchAction:"manipulation"}}
    />
  );
}

function SectionTitle({children,style={}}) {
  return(
    <h2 style={{fontSize:16,fontWeight:800,letterSpacing:2,color:"#e8eaf6",borderLeft:"3px solid #c9a227",paddingLeft:10,marginBottom:16,fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",...style}}>
      {children}
    </h2>
  );
}
