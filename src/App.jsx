import { useState, useEffect, useMemo } from "react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const GROUPS = {
  A: ["MEX","RSA","KOR","CZE"],
  B: ["CAN","BIH","QAT","SUI"],
  C: ["BRA","MAR","HAI","SCO"],
  D: ["USA","PAR","AUS","TUR"],
  E: ["GER","CUW","CIV","ECU"],
  F: ["NED","JPN","SWE","TUN"],
  G: ["BEL","EGY","IRN","NZL"],
  H: ["ESP","CPV","KSA","URU"],
  I: ["FRA","SEN","IRQ","NOR"],
  J: ["ARG","ALG","AUT","JOR"],
  K: ["POR","COD","UZB","COL"],
  L: ["ENG","CRO","GHA","PAN"],
};

const TEAM_NAMES = {
  MEX:"México", RSA:"Sudáfrica", KOR:"Corea del Sur", CZE:"Chequia",
  CAN:"Canadá", BIH:"Bosnia-Herz.", QAT:"Qatar", SUI:"Suiza",
  BRA:"Brasil", MAR:"Marruecos", HAI:"Haití", SCO:"Escocia",
  USA:"EE.UU.", PAR:"Paraguay", AUS:"Australia", TUR:"Türkiye",
  GER:"Alemania", CUW:"Curazao", CIV:"Costa de Marfil", ECU:"Ecuador",
  NED:"Países Bajos", JPN:"Japón", SWE:"Suecia", TUN:"Túnez",
  BEL:"Bélgica", EGY:"Egipto", IRN:"Irán", NZL:"Nueva Zelanda",
  ESP:"España", CPV:"Cabo Verde", KSA:"Arabia Saudita", URU:"Uruguay",
  FRA:"Francia", SEN:"Senegal", IRQ:"Irak", NOR:"Noruega",
  ARG:"Argentina", ALG:"Argelia", AUT:"Austria", JOR:"Jordania",
  POR:"Portugal", COD:"Congo RD", UZB:"Uzbekistán", COL:"Colombia",
  ENG:"Inglaterra", CRO:"Croacia", GHA:"Ghana", PAN:"Panamá",
};

const FLAGS = {
  MEX:"🇲🇽",RSA:"🇿🇦",KOR:"🇰🇷",CZE:"🇨🇿",CAN:"🇨🇦",BIH:"🇧🇦",QAT:"🇶🇦",SUI:"🇨🇭",
  BRA:"🇧🇷",MAR:"🇲🇦",HAI:"🇭🇹",SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",USA:"🇺🇸",PAR:"🇵🇾",AUS:"🇦🇺",TUR:"🇹🇷",
  GER:"🇩🇪",CUW:"🇨🇼",CIV:"🇨🇮",ECU:"🇪🇨",NED:"🇳🇱",JPN:"🇯🇵",SWE:"🇸🇪",TUN:"🇹🇳",
  BEL:"🇧🇪",EGY:"🇪🇬",IRN:"🇮🇷",NZL:"🇳🇿",ESP:"🇪🇸",CPV:"🇨🇻",KSA:"🇸🇦",URU:"🇺🇾",
  FRA:"🇫🇷",SEN:"🇸🇳",IRQ:"🇮🇶",NOR:"🇳🇴",ARG:"🇦🇷",ALG:"🇩🇿",AUT:"🇦🇹",JOR:"🇯🇴",
  POR:"🇵🇹",COD:"🇨🇩",UZB:"🇺🇿",COL:"🇨🇴",ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",CRO:"🇭🇷",GHA:"🇬🇭",PAN:"🇵🇦",
};

const MATCHES_RAW = [
  // Group Stage
  {id:1, phase:"Grupos", group:"A", date:"2026-06-11", time:"15:00", home:"MEX", away:"RSA"},
  {id:2, phase:"Grupos", group:"A", date:"2026-06-11", time:"22:00", home:"KOR", away:"CZE"},
  {id:3, phase:"Grupos", group:"B", date:"2026-06-11", time:"21:00", home:"CAN", away:"BIH"},
  {id:4, phase:"Grupos", group:"D", date:"2026-06-11", time:"21:00", home:"USA", away:"PAR"},
  {id:5, phase:"Grupos", group:"C", date:"2026-06-12", time:"21:00", home:"HAI", away:"SCO"},
  {id:6, phase:"Grupos", group:"A", date:"2026-06-12", time:"00:00", home:"AUS", away:"TUR"},
  {id:7, phase:"Grupos", group:"C", date:"2026-06-12", time:"18:00", home:"BRA", away:"MAR"},
  {id:8, phase:"Grupos", group:"B", date:"2026-06-12", time:"15:00", home:"QAT", away:"SUI"},
  {id:9, phase:"Grupos", group:"E", date:"2026-06-12", time:"19:00", home:"CIV", away:"ECU"},
  {id:10, phase:"Grupos", group:"E", date:"2026-06-13", time:"13:00", home:"GER", away:"CUW"},
  {id:11, phase:"Grupos", group:"F", date:"2026-06-13", time:"16:00", home:"NED", away:"JPN"},
  {id:12, phase:"Grupos", group:"H", date:"2026-06-13", time:"14:00", home:"ESP", away:"CPV"},
  {id:13, phase:"Grupos", group:"H", date:"2026-06-13", time:"18:00", home:"KSA", away:"URU"},
  {id:14, phase:"Grupos", group:"H", date:"2026-06-14", time:"12:00", home:"ESP", away:"CPV"},
  {id:15, phase:"Grupos", group:"G", date:"2026-06-14", time:"21:00", home:"IRN", away:"NZL"},
  {id:16, phase:"Grupos", group:"G", date:"2026-06-14", time:"15:00", home:"BEL", away:"EGY"},
  {id:17, phase:"Grupos", group:"I", date:"2026-06-15", time:"15:00", home:"FRA", away:"SEN"},
  {id:18, phase:"Grupos", group:"I", date:"2026-06-15", time:"18:00", home:"IRQ", away:"NOR"},
  {id:19, phase:"Grupos", group:"J", date:"2026-06-15", time:"21:00", home:"ARG", away:"ALG"},
  {id:20, phase:"Grupos", group:"J", date:"2026-06-16", time:"00:00", home:"AUT", away:"JOR"},
  {id:21, phase:"Grupos", group:"L", date:"2026-06-16", time:"19:00", home:"GHA", away:"PAN"},
  {id:22, phase:"Grupos", group:"L", date:"2026-06-16", time:"16:00", home:"ENG", away:"CRO"},
  {id:23, phase:"Grupos", group:"K", date:"2026-06-16", time:"13:00", home:"POR", away:"COD"},
  {id:24, phase:"Grupos", group:"K", date:"2026-06-17", time:"22:00", home:"UZB", away:"COL"},
  {id:25, phase:"Grupos", group:"A", date:"2026-06-17", time:"12:00", home:"CZE", away:"RSA"},
  {id:26, phase:"Grupos", group:"B", date:"2026-06-17", time:"15:00", home:"SUI", away:"BIH"},
  {id:27, phase:"Grupos", group:"B", date:"2026-06-17", time:"18:00", home:"CAN", away:"QAT"},
  {id:28, phase:"Grupos", group:"A", date:"2026-06-18", time:"21:00", home:"MEX", away:"KOR"},
  {id:29, phase:"Grupos", group:"C", date:"2026-06-18", time:"20:30", home:"BRA", away:"HAI"},
  {id:30, phase:"Grupos", group:"C", date:"2026-06-18", time:"18:00", home:"SCO", away:"MAR"},
  {id:31, phase:"Grupos", group:"D", date:"2026-06-19", time:"23:00", home:"TUR", away:"PAR"},
  {id:32, phase:"Grupos", group:"D", date:"2026-06-19", time:"15:00", home:"USA", away:"AUS"},
  {id:33, phase:"Grupos", group:"E", date:"2026-06-24", time:"16:00", home:"GER", away:"CIV"},
  {id:34, phase:"Grupos", group:"E", date:"2026-06-24", time:"20:00", home:"ECU", away:"CUW"},
  {id:35, phase:"Grupos", group:"F", date:"2026-06-24", time:"13:00", home:"NED", away:"SWE"},
  {id:36, phase:"Grupos", group:"F", date:"2026-06-24", time:"00:00", home:"TUN", away:"JPN"},
  {id:37, phase:"Grupos", group:"H", date:"2026-06-24", time:"18:00", home:"URU", away:"CPV"},
  {id:38, phase:"Grupos", group:"H", date:"2026-06-24", time:"12:00", home:"ESP", away:"KSA"},
  {id:39, phase:"Grupos", group:"G", date:"2026-06-24", time:"15:00", home:"BEL", away:"IRN"},
  {id:40, phase:"Grupos", group:"G", date:"2026-06-24", time:"21:00", home:"NZL", away:"EGY"},
  {id:41, phase:"Grupos", group:"I", date:"2026-06-24", time:"20:00", home:"NOR", away:"SEN"},
  {id:42, phase:"Grupos", group:"I", date:"2026-06-24", time:"17:00", home:"FRA", away:"IRQ"},
  {id:43, phase:"Grupos", group:"J", date:"2026-06-25", time:"13:00", home:"ARG", away:"AUT"},
  {id:44, phase:"Grupos", group:"J", date:"2026-06-25", time:"23:00", home:"JOR", away:"ALG"},
  {id:45, phase:"Grupos", group:"L", date:"2026-06-25", time:"16:00", home:"ENG", away:"GHA"},
  {id:46, phase:"Grupos", group:"L", date:"2026-06-25", time:"19:00", home:"PAN", away:"CRO"},
  {id:47, phase:"Grupos", group:"K", date:"2026-06-25", time:"13:00", home:"POR", away:"UZB"},
  {id:48, phase:"Grupos", group:"K", date:"2026-06-25", time:"22:00", home:"COL", away:"COD"},
  {id:49, phase:"Grupos", group:"C", date:"2026-06-25", time:"18:00", home:"SCO", away:"BRA"},
  {id:50, phase:"Grupos", group:"C", date:"2026-06-25", time:"18:00", home:"MAR", away:"HAI"},
  {id:51, phase:"Grupos", group:"B", date:"2026-06-25", time:"15:00", home:"SUI", away:"CAN"},
  {id:52, phase:"Grupos", group:"B", date:"2026-06-25", time:"15:00", home:"BIH", away:"QAT"},
  {id:53, phase:"Grupos", group:"A", date:"2026-06-25", time:"21:00", home:"CZE", away:"MEX"},
  {id:54, phase:"Grupos", group:"A", date:"2026-06-25", time:"21:00", home:"RSA", away:"KOR"},
  {id:55, phase:"Grupos", group:"E", date:"2026-06-29", time:"16:00", home:"CUW", away:"CIV"},
  {id:56, phase:"Grupos", group:"E", date:"2026-06-29", time:"16:00", home:"ECU", away:"GER"},
  {id:57, phase:"Grupos", group:"F", date:"2026-06-29", time:"19:00", home:"JPN", away:"SWE"},
  {id:58, phase:"Grupos", group:"F", date:"2026-06-29", time:"19:00", home:"TUN", away:"NED"},
  {id:59, phase:"Grupos", group:"D", date:"2026-06-29", time:"22:00", home:"TUR", away:"USA"},
  {id:60, phase:"Grupos", group:"D", date:"2026-06-29", time:"22:00", home:"PAR", away:"AUS"},
  {id:61, phase:"Grupos", group:"I", date:"2026-06-29", time:"15:00", home:"NOR", away:"FRA"},
  {id:62, phase:"Grupos", group:"I", date:"2026-06-29", time:"15:00", home:"SEN", away:"IRQ"},
  {id:63, phase:"Grupos", group:"G", date:"2026-06-29", time:"23:00", home:"EGY", away:"IRN"},
  {id:64, phase:"Grupos", group:"G", date:"2026-06-29", time:"23:00", home:"NZL", away:"BEL"},
  {id:65, phase:"Grupos", group:"H", date:"2026-06-29", time:"20:00", home:"CPV", away:"KSA"},
  {id:66, phase:"Grupos", group:"H", date:"2026-06-29", time:"20:00", home:"URU", away:"ESP"},
  {id:67, phase:"Grupos", group:"L", date:"2026-06-29", time:"17:00", home:"PAN", away:"ENG"},
  {id:68, phase:"Grupos", group:"L", date:"2026-06-29", time:"17:00", home:"CRO", away:"GHA"},
  {id:69, phase:"Grupos", group:"J", date:"2026-06-29", time:"22:00", home:"ALG", away:"AUT"},
  {id:70, phase:"Grupos", group:"J", date:"2026-06-29", time:"22:00", home:"JOR", away:"ARG"},
  {id:71, phase:"Grupos", group:"K", date:"2026-06-29", time:"19:30", home:"COL", away:"POR"},
  {id:72, phase:"Grupos", group:"K", date:"2026-06-29", time:"19:30", home:"COD", away:"UZB"},
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function initResults() {
  const r = {};
  MATCHES_RAW.forEach(m => { r[m.id] = { homeGoals:"", awayGoals:"" }; });
  return r;
}

function calcStandings(groupTeams, matches, results) {
  const table = {};
  groupTeams.forEach(t => { table[t] = {pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0,dg:0}; });

  matches.forEach(m => {
    const r = results[m.id];
    if (r.homeGoals === "" || r.awayGoals === "") return;
    const hg = parseInt(r.homeGoals);
    const ag = parseInt(r.awayGoals);
    if (isNaN(hg) || isNaN(ag)) return;
    const ht = table[m.home]; const at = table[m.away];
    if (!ht || !at) return;
    ht.pj++; at.pj++;
    ht.gf += hg; ht.gc += ag; ht.dg += hg-ag;
    at.gf += ag; at.gc += hg; at.dg += ag-hg;
    if (hg > ag) { ht.pts+=3; ht.pg++; at.pp++; }
    else if (ag > hg) { at.pts+=3; at.pg++; ht.pp++; }
    else { ht.pts++; at.pts++; ht.pe++; at.pe++; }
  });

  return Object.entries(table)
    .sort((a,b) => b[1].pts-a[1].pts || b[1].dg-a[1].dg || b[1].gf-a[1].gf)
    .map(([code, stats]) => ({code, ...stats}));
}

const PHASE_ORDER = ["Grupos","Ronda de 32","Octavos","Cuartos","Semifinal","3er Lugar","Final"];

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("grupos");
  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem("fwc2026_results");
      if (saved) {
        const parsed = JSON.parse(saved);
        // Merge saved with fresh init so new match IDs always exist
        return { ...initResults(), ...parsed };
      }
    } catch {}
    return initResults();
  });

  const [saveIndicator, setSaveIndicator] = useState(false);

  // Auto-save to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem("fwc2026_results", JSON.stringify(results));
      setSaveIndicator(true);
      const t = setTimeout(() => setSaveIndicator(false), 1200);
      return () => clearTimeout(t);
    } catch {}
  }, [results]);

  const resetResults = () => {
    if (window.confirm("¿Borrar todos los resultados registrados? Esta acción no se puede deshacer.")) {
      const fresh = initResults();
      setResults(fresh);
      localStorage.removeItem("fwc2026_results");
    }
  };
  const [filterGroup, setFilterGroup] = useState("Todos");
  const [countdown, setCountdown] = useState("");

  // Countdown to Jun 11 2026 15:00 ET
  useEffect(() => {
    const target = new Date("2026-06-11T15:00:00-04:00");
    const tick = () => {
      const diff = target - new Date();
      if (diff <= 0) { setCountdown("¡El torneo ha comenzado! ⚽"); return; }
      const d = Math.floor(diff/86400000);
      const h = Math.floor((diff%86400000)/3600000);
      const m = Math.floor((diff%3600000)/60000);
      const s = Math.floor((diff%60000)/1000);
      setCountdown(`${d}d ${h}h ${m}m ${s}s`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);

  const setGoals = (matchId, side, val) => {
    setResults(prev => ({
      ...prev,
      [matchId]: { ...prev[matchId], [side]: val }
    }));
  };

  const groupMatches = useMemo(() =>
    MATCHES_RAW.filter(m => m.phase === "Grupos"),
  []);

  const filtered = useMemo(() =>
    filterGroup === "Todos"
      ? groupMatches
      : groupMatches.filter(m => m.group === filterGroup),
  [filterGroup, groupMatches]);

  return (
    <div style={{
      minHeight:"100vh", background:"#0a0f1e",
      fontFamily:"'Barlow Condensed', 'Arial Narrow', sans-serif",
      color:"#e8eaf6"
    }}>
      {/* HEADER */}
      <header style={{
        background:"linear-gradient(135deg, #0d1b2a 0%, #1a1042 50%, #0d1b2a 100%)",
        borderBottom:"2px solid #c9a227",
        padding:"0 24px"
      }}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:42}}>🏆</div>
            <div>
              <div style={{fontSize:28,fontWeight:800,letterSpacing:3,color:"#c9a227",lineHeight:1}}>MUNDIAL 2026</div>
              <div style={{fontSize:12,letterSpacing:4,color:"#8899bb",marginTop:2}}>USA · CANADA · MEXICO</div>
            </div>
          </div>
          <div style={{textAlign:"right",display:"flex",flexDirection:"column",alignItems:"flex-end",gap:8}}>
            <div>
              <div style={{fontSize:11,color:"#8899bb",letterSpacing:2}}>INICIO EN</div>
              <div style={{fontSize:22,fontWeight:700,color:"#4fc3f7",fontVariantNumeric:"tabular-nums"}}>{countdown}</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {saveIndicator && (
                <span style={{fontSize:11,color:"#4caf50",letterSpacing:1}}>
                  ✓ GUARDADO
                </span>
              )}
              <button
                onClick={resetResults}
                style={{background:"transparent",border:"1px solid #2a3a55",borderRadius:4,color:"#8899bb",padding:"4px 10px",fontSize:11,letterSpacing:1,cursor:"pointer",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef5350";e.currentTarget.style.color="#ef5350";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#2a3a55";e.currentTarget.style.color="#8899bb";}}
              >RESETEAR</button>
            </div>
          </div>
        </div>
        {/* NAV */}
        <nav style={{display:"flex",gap:2,borderTop:"1px solid #1e2d4a"}}>
          {[["grupos","GRUPOS"],["partidos","PARTIDOS"],["posiciones","POSICIONES"]].map(([k,l]) => (
            <button key={k} onClick={()=>setTab(k)} style={{
              padding:"12px 24px",border:"none",cursor:"pointer",
              background: tab===k ? "#c9a227" : "transparent",
              color: tab===k ? "#0a0f1e" : "#8899bb",
              fontFamily:"inherit",fontSize:13,fontWeight:700,letterSpacing:2,
              borderBottom: tab===k ? "2px solid #c9a227" : "2px solid transparent",
              transition:"all .2s"
            }}>{l}</button>
          ))}
        </nav>
      </header>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"24px 16px"}}>

        {/* ── TAB: GRUPOS ── */}
        {tab === "grupos" && (
          <div>
            <SectionTitle>Grupos del Torneo</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:16}}>
              {Object.entries(GROUPS).map(([g, teams]) => {
                const gMatches = groupMatches.filter(m => m.group === g);
                const standing = calcStandings(teams, gMatches, results);
                return (
                  <div key={g} style={{
                    background:"#0f1a2e",border:"1px solid #1e2d4a",borderRadius:8,overflow:"hidden"
                  }}>
                    <div style={{
                      background:"#c9a227",color:"#0a0f1e",
                      padding:"8px 14px",display:"flex",alignItems:"center",gap:8
                    }}>
                      <span style={{fontSize:22,fontWeight:900,letterSpacing:1}}>GRUPO {g}</span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid #1e2d4a",color:"#8899bb",fontSize:11}}>
                          <th style={{padding:"6px 14px",textAlign:"left",fontWeight:600}}>EQUIPO</th>
                          <th style={{padding:"6px 6px",textAlign:"center"}}>PJ</th>
                          <th style={{padding:"6px 6px",textAlign:"center"}}>PTS</th>
                          <th style={{padding:"6px 6px",textAlign:"center"}}>DG</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standing.map((row, i) => (
                          <tr key={row.code} style={{
                            borderBottom:"1px solid #0d1828",
                            background: i < 2 ? "rgba(201,162,39,0.07)" : "transparent"
                          }}>
                            <td style={{padding:"7px 14px",display:"flex",alignItems:"center",gap:8}}>
                              <span style={{
                                width:18,height:18,borderRadius:"50%",
                                background: i===0?"#c9a227":i===1?"#4fc3f7":"#2a3a55",
                                display:"inline-flex",alignItems:"center",justifyContent:"center",
                                fontSize:10,fontWeight:700,color:i<2?"#0a0f1e":"#8899bb",flexShrink:0
                              }}>{i+1}</span>
                              <span style={{fontSize:15}}>{FLAGS[row.code]}</span>
                              <span style={{fontWeight:600,letterSpacing:.5}}>{row.code}</span>
                            </td>
                            <td style={{padding:"7px 6px",textAlign:"center",color:"#aab"}}>{row.pj}</td>
                            <td style={{padding:"7px 6px",textAlign:"center",fontWeight:700,color:"#c9a227"}}>{row.pts}</td>
                            <td style={{padding:"7px 6px",textAlign:"center",color: row.dg>0?"#4fc3f7":row.dg<0?"#ef5350":"#aab"}}>
                              {row.dg>0?"+":""}{row.dg}
                            </td>
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

        {/* ── TAB: PARTIDOS ── */}
        {tab === "partidos" && (
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <SectionTitle style={{margin:0}}>Resultados — Fase de Grupos</SectionTitle>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{fontSize:12,color:"#8899bb",letterSpacing:1}}>GRUPO:</span>
                <select value={filterGroup} onChange={e=>setFilterGroup(e.target.value)} style={{
                  background:"#0f1a2e",color:"#e8eaf6",border:"1px solid #1e2d4a",
                  borderRadius:4,padding:"6px 12px",fontFamily:"inherit",fontSize:13
                }}>
                  <option value="Todos">Todos</option>
                  {Object.keys(GROUPS).map(g => <option key={g} value={g}>Grupo {g}</option>)}
                </select>
              </div>
            </div>

            {/* Group by date */}
            {(() => {
              const byDate = {};
              filtered.forEach(m => {
                if (!byDate[m.date]) byDate[m.date] = [];
                byDate[m.date].push(m);
              });
              return Object.entries(byDate).sort(([a],[b])=>a.localeCompare(b)).map(([date, ms]) => (
                <div key={date} style={{marginBottom:24}}>
                  <div style={{
                    fontSize:12,fontWeight:700,letterSpacing:3,color:"#c9a227",
                    borderBottom:"1px solid #1e2d4a",paddingBottom:6,marginBottom:10
                  }}>
                    {new Date(date+"T12:00:00").toLocaleDateString("es-MX",{weekday:"long",day:"numeric",month:"long",year:"numeric"}).toUpperCase()}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:10}}>
                    {ms.map(m => <MatchCard key={m.id} match={m} result={results[m.id]} onSet={setGoals} />)}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* ── TAB: POSICIONES ── */}
        {tab === "posiciones" && (
          <div>
            <SectionTitle>Tabla de Posiciones por Grupo</SectionTitle>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(520px,1fr))",gap:20}}>
              {Object.entries(GROUPS).map(([g, teams]) => {
                const gMatches = groupMatches.filter(m => m.group === g);
                const standing = calcStandings(teams, gMatches, results);
                return (
                  <div key={g} style={{background:"#0f1a2e",border:"1px solid #1e2d4a",borderRadius:8,overflow:"hidden"}}>
                    <div style={{background:"#0d1828",padding:"10px 16px",borderBottom:"2px solid #c9a227",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span style={{fontSize:16,fontWeight:800,letterSpacing:2,color:"#c9a227"}}>GRUPO {g}</span>
                      <span style={{fontSize:11,color:"#8899bb"}}>{teams.join(" · ")}</span>
                    </div>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead>
                        <tr style={{borderBottom:"1px solid #1e2d4a",color:"#8899bb",fontSize:11,letterSpacing:1}}>
                          <th style={{padding:"8px 12px",textAlign:"left"}}>#</th>
                          <th style={{padding:"8px 12px",textAlign:"left"}}>EQUIPO</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>PJ</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>PG</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>PE</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>PP</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>GF</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>GC</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>DG</th>
                          <th style={{padding:"8px 8px",textAlign:"center"}}>PTS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {standing.map((row, i) => (
                          <tr key={row.code} style={{
                            borderBottom:"1px solid #0d1828",
                            background: i<2?"rgba(201,162,39,0.06)":"transparent"
                          }}>
                            <td style={{padding:"9px 12px"}}>
                              <span style={{
                                display:"inline-flex",alignItems:"center",justifyContent:"center",
                                width:22,height:22,borderRadius:4,fontSize:11,fontWeight:700,
                                background: i===0?"#c9a227":i===1?"rgba(79,195,247,.25)":"#1e2d4a",
                                color: i===0?"#0a0f1e":i===1?"#4fc3f7":"#8899bb"
                              }}>{i+1}</span>
                            </td>
                            <td style={{padding:"9px 12px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{fontSize:18}}>{FLAGS[row.code]}</span>
                                <div>
                                  <div style={{fontWeight:700,letterSpacing:.5}}>{row.code}</div>
                                  <div style={{fontSize:11,color:"#8899bb"}}>{TEAM_NAMES[row.code]}</div>
                                </div>
                              </div>
                            </td>
                            {[row.pj,row.pg,row.pe,row.pp,row.gf,row.gc].map((v,vi)=>(
                              <td key={vi} style={{padding:"9px 8px",textAlign:"center",color:"#ccc"}}>{v}</td>
                            ))}
                            <td style={{padding:"9px 8px",textAlign:"center",fontWeight:600,
                              color: row.dg>0?"#4fc3f7":row.dg<0?"#ef5350":"#aab"}}>
                              {row.dg>0?"+":""}{row.dg}
                            </td>
                            <td style={{padding:"9px 8px",textAlign:"center",fontWeight:800,fontSize:16,color:"#c9a227"}}>{row.pts}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{padding:"8px 12px",fontSize:11,color:"#4a6080",borderTop:"1px solid #1e2d4a"}}>
                      🟡 Clasifican a Ronda de 32 los 2 primeros de cada grupo + mejores terceros
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      <footer style={{textAlign:"center",padding:"24px",color:"#2a3a55",fontSize:11,letterSpacing:2,borderTop:"1px solid #0f1828",marginTop:40}}>
        FIFA WORLD CUP 2026™ · DASHBOARD SAKBÉ · DATOS SUJETOS A CAMBIOS
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────
function SectionTitle({children, style={}}) {
  return (
    <h2 style={{
      fontSize:18,fontWeight:800,letterSpacing:3,color:"#e8eaf6",
      borderLeft:"3px solid #c9a227",paddingLeft:12,marginBottom:20,
      fontFamily:"'Barlow Condensed','Arial Narrow',sans-serif",...style
    }}>{children}</h2>
  );
}

function MatchCard({match, result, onSet}) {
  const played = result.homeGoals !== "" && result.awayGoals !== "";
  const hg = parseInt(result.homeGoals);
  const ag = parseInt(result.awayGoals);

  const hWin = played && hg > ag;
  const aWin = played && ag > hg;
  const draw = played && hg === ag;

  return (
    <div style={{
      background:"#0f1a2e",border:`1px solid ${played?"#c9a22755":"#1e2d4a"}`,
      borderRadius:8,padding:"12px 16px",
      boxShadow: played?"0 0 12px rgba(201,162,39,.1)":"none"
    }}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,fontSize:11,color:"#8899bb"}}>
        <span>GRUPO {match.group} · {match.time} ET</span>
        <span style={{
          background:"#1e2d4a",borderRadius:3,padding:"2px 6px",
          color: played?"#4fc3f7":"#8899bb"
        }}>{played?"Finalizado":"Pendiente"}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        {/* HOME */}
        <div style={{flex:1,textAlign:"right"}}>
          <div style={{fontSize:20}}>{FLAGS[match.home]}</div>
          <div style={{fontSize:13,fontWeight: hWin?700:500,color: hWin?"#c9a227":"#ccd",letterSpacing:.5}}>{match.home}</div>
        </div>
        {/* SCORE */}
        <div style={{display:"flex",alignItems:"center",gap:4}}>
          <input
            type="number" min="0" max="99"
            value={result.homeGoals}
            onChange={e=>onSet(match.id,"homeGoals",e.target.value)}
            placeholder="-"
            style={{
              width:44,height:44,textAlign:"center",fontSize:22,fontWeight:800,
              background: hWin?"rgba(201,162,39,.15)":draw?"rgba(79,195,247,.1)":"#0a1020",
              border:`1px solid ${played?"#c9a22766":"#1e2d4a"}`,
              borderRadius:6,color:"#e8eaf6",fontFamily:"inherit",outline:"none"
            }}
          />
          <span style={{fontSize:16,color:"#2a3a55",fontWeight:700}}>:</span>
          <input
            type="number" min="0" max="99"
            value={result.awayGoals}
            onChange={e=>onSet(match.id,"awayGoals",e.target.value)}
            placeholder="-"
            style={{
              width:44,height:44,textAlign:"center",fontSize:22,fontWeight:800,
              background: aWin?"rgba(201,162,39,.15)":draw?"rgba(79,195,247,.1)":"#0a1020",
              border:`1px solid ${played?"#c9a22766":"#1e2d4a"}`,
              borderRadius:6,color:"#e8eaf6",fontFamily:"inherit",outline:"none"
            }}
          />
        </div>
        {/* AWAY */}
        <div style={{flex:1,textAlign:"left"}}>
          <div style={{fontSize:20}}>{FLAGS[match.away]}</div>
          <div style={{fontSize:13,fontWeight: aWin?700:500,color: aWin?"#c9a227":"#ccd",letterSpacing:.5}}>{match.away}</div>
        </div>
      </div>
    </div>
  );
}
