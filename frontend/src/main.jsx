import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://kukufm-assignment-api.onrender.com' : '');
const demoA = "Maya entered the hospital with a blood-stained letter. She told her brother Arjun their father was alive and hid evidence in the mansion. Arjun owns the silver key. Maya promised to return before midnight.";
const demoB = "The next morning Maya arrives at the police station. Arjun says their father died years ago and the silver key was stolen. Maya asks the detective to find the letter.";

function App() {
  const [view, setView] = useState('home');
  const [episodes, setEpisodes] = useState([]);
  const [prevId, setPrevId] = useState('');
  const [nextId, setNextId] = useState('');
  const [show, setShow] = useState('KukuFM episode dataset');
  const [a, setA] = useState(demoA);
  const [b, setB] = useState(demoB);
  const [out, setOut] = useState(null);
  const [series, setSeries] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loadingEpisodes, setLoadingEpisodes] = useState(true);
  const [err, setErr] = useState('');
  const [mode, setMode] = useState('dataset');
  const [activeProblem, setActiveProblem] = useState('PS3');
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/episodes`)
      .then(r => { if (!r.ok) throw new Error('Could not load episode library'); return r.json(); })
      .then(data => {
        setEpisodes(data.episodes || []);
        if (data.episodes?.length > 1) { setPrevId(data.episodes[0].id); setNextId(data.episodes[1].id); }
      })
      .catch(e => setErr(`Episode library unavailable: ${e.message}. Check that the backend is deployed.`))
      .finally(() => setLoadingEpisodes(false));
  }, []);

  async function requestAnalysis(endpoint, body, label) {
    setBusy(true); setErr(''); setOut(null); setSeries(null);
    const started = Date.now();
    try {
      const r = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
      });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json(); setOut(data);
      setRuns(old => [{ problem: label, input: label === 'PS3' ? 'episode comparison' : 'input', status: 'Success', time: Math.max(1, Math.round((Date.now()-started)/1000))+'s', id: Date.now() }, ...old].slice(0,5));
    } catch (e) { setErr(`Analysis failed: ${e.message}`); }
    finally { setBusy(false); }
  }

  async function compareDataset() {
    if (!prevId || !nextId || prevId === nextId) { setErr('Choose two different episodes to compare.'); return; }
    const prev = episodes.find(x => x.id === prevId), next = episodes.find(x => x.id === nextId);
    await requestAnalysis('/api/analyze-episodes', { show_name: show, previous_episode_id: prevId, next_episode_id: nextId }, 'PS3');
  }
  async function compareManual() {
    await requestAnalysis('/api/analyze', { show_name: show, previous_episode: a, next_episode: b }, 'PS3');
  }
  async function analyzeSeries() {
    setBusy(true); setErr(''); setOut(null); setSeries(null);
    try {
      const r = await fetch(`${API_BASE}/api/analyze-series`);
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json(); setSeries(data);
      setRuns(old => [{problem:'PS3 · Series scan',input:'episode library',status:'Success',time:'—',id:Date.now()},...old].slice(0,5));
    } catch(e) { setErr(`Series analysis failed: ${e.message}`); }
    finally { setBusy(false); }
  }
  const nav = [['home','⌂','Home'],['problems','▦','Problems'],['results','▥','Results'],['docs','▤','Docs']];
  const problems = [
    {id:'PS1', title:'Content Understanding & Tagging', desc:'Analyze audio or text and generate useful tags, categories, and metadata.', icon:'♫', tags:['Audio / Text','Auto tagging','Categories']},
    {id:'PS2', title:'Personalized Recommendation', desc:'Recommend relevant shows and episodes using listener interests and history.', icon:'◉', tags:['User profile','Recommendation engine','Top-N results']},
    {id:'PS3', title:'StoryBridge — Microdrama Episode Continuity', desc:'Check whether an episode continues a story by analyzing plot, characters, and context.', icon:'▣', tags:['Episode input','Continuity check','Confidence signals']}
  ];

  return <div className="app-shell">
    <header className="topbar">
      <button className="brand" onClick={() => setView('home')} aria-label="KukuFM Assignment home"><span className="brand-mark">✣</span><span>Kuku<span>FM</span></span><small>ASSIGNMENT</small></button>
      <nav className="topnav">{nav.map(([id,icon,label])=><button key={id} className={view===id?'nav-active':''} onClick={()=>setView(id)}><span>{icon}</span>{label}</button>)}</nav>
      <div className="top-actions"><a className="github-icon" href="https://github.com/teambugbusters00/kuku-assignment-" target="_blank" rel="noreferrer" aria-label="GitHub repository">◉</a><a className="deploy-btn" href="https://kukufm-assignment-frontend-kwao.onrender.com" target="_blank" rel="noreferrer">↗ Deploy on Render</a><span className="profile-dot">V</span></div>
    </header>

    <main className="dashboard">
      {view==='home' || view==='problems' ? <>
        <section className="hero-banner">
          <div className="hero-copy"><small className="eyebrow">KUKUFM ASSIGNMENT</small><h1>AI-Powered Audio<br/>Intelligence Suite</h1><p>Three problem statements. One unified platform — analyze, recommend, and ensure story continuity for audio entertainment.</p><div className="hero-tags"><span>▷ Audio AI</span><span>✧ NLP</span><span>▱ Recommendation</span></div></div>
          <div className="hero-art" aria-hidden="true"><div className="soundwave">{Array.from({length:25},(_,i)=><i key={i} style={{height:(14+(Math.abs(Math.sin(i*.73))*75))+'px'}}/>)}</div><div className="headphone"><div className="ear left"></div><div className="ear right"></div><div className="headband"></div><div className="phone"><div className="phone-brand">KukuFM</div><div className="album-art"><span>♫</span></div><div className="phone-line"></div><div className="phone-controls">◂　●　▸</div></div></div><div className="book-stack"><span></span><span></span><span></span></div></div>
        </section>
        <div className="section-title"><div><h2>Problem Statements</h2><span className="title-underline"></span></div><div className="filters"><button className={activeProblem==='ALL'?'selected':''} onClick={()=>setActiveProblem('ALL')}>All (3)</button>{['PS1','PS2','PS3'].map(x=><button key={x} className={activeProblem===x?'selected':''} onClick={()=>setActiveProblem(x)}>{x}</button>)}</div></div>
        <section className="problem-cards">{problems.filter(p=>activeProblem==='ALL'||p.id===activeProblem).map(p=><article className="problem-card" key={p.id}><div className={'card-art '+p.id.toLowerCase()}><span>{p.icon}</span></div><div className="card-main"><span className="problem-badge">{p.id}</span><h3>{p.title}</h3><p>{p.desc}</p></div><div className="fake-player"><button aria-label="Preview audio" onClick={()=>setErr('Audio preview is not connected to a source file yet.')}>▶</button><div className="waveform">{Array.from({length:42},(_,i)=><i key={i} style={{height:(5+Math.abs(Math.sin(i*1.3))*24)+'px'}}/>)}</div><small>Audio preview</small></div><div className="card-tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div><div className="card-actions"><button className="view-details" onClick={()=>{setActiveProblem(p.id);setView('problems')}}>View Details ›</button><button className="run-btn" onClick={()=>{setActiveProblem(p.id);setView('problems');if(p.id==='PS3')setTimeout(()=>document.getElementById('ps3-workspace')?.scrollIntoView({behavior:'smooth'}),100)}}>▶ Run {p.id}</button></div>{p.id!=='PS3'&&<small className="module-note">Module placeholder · Needs original PS prompt</small>}</article>)}</section>
        <section className="lower-grid"><div className="recent-panel"><div className="panel-heading"><h3>Recent Runs</h3><button onClick={()=>setView('results')}>View All ›</button></div>{runs.length? <div className="table-wrap"><table><thead><tr><th>#</th><th>Problem</th><th>Input</th><th>Status</th><th>Time</th></tr></thead><tbody>{runs.map((r,i)=><tr key={r.id}><td>{i+1}</td><td>{r.problem}</td><td>{r.input}</td><td><span className="success-pill">✓ {r.status}</span></td><td>{r.time}</td></tr>)}</tbody></table></div>:<div className="empty-runs"><span>◷</span><b>No runs yet</b><p>Run a problem statement to see execution history here.</p></div>}</div>
          <div className="status-panel"><h3>Project Status</h3><div className="ci-status"><span>✓</span><div><b>CI/CD Passed</b><small>GitHub Actions · Build · Tests</small></div><a href="https://github.com/teambugbusters00/kuku-assignment-/actions/runs/42474486140" target="_blank" rel="noreferrer">View Run ↗</a></div><a className="status-row" href="https://github.com/teambugbusters00/kuku-assignment-" target="_blank" rel="noreferrer"><span>◉</span><b>GitHub Repository</b><small>teambugbusters00/kuku-assignment-</small>↗</a><a className="status-row" href="https://kukufm-assignment-frontend-kwao.onrender.com" target="_blank" rel="noreferrer"><span>◉</span><b>Frontend (Render)</b><small>Live frontend link</small>↗</a><a className="status-row" href="https://kukufm-assignment-api.onrender.com" target="_blank" rel="noreferrer"><span>▤</span><b>Backend API</b><small>API endpoint</small>↗</a></div></section>
      </> : view==='results' ? <section className="content-page"><h1>Execution Results</h1><p>Run a problem from the Home page to populate this list.</p>{out&&<ResultPanel out={out}/>}{series&&<pre>{JSON.stringify(series,null,2)}</pre>}</section> : view==='docs' ? <section className="content-page"><h1>Documentation</h1><p>Unified KukuFM assignment workspace. PS3 StoryBridge continuity analysis is available; PS1 and PS2 require their assignment-specific implementation.</p><a href="https://github.com/teambugbusters00/kuku-assignment-/blob/main/solution_doc.md" target="_blank" rel="noreferrer">Open solution documentation ↗</a></section> : null}

      {view==='problems' && <section className="workspace" id="ps3-workspace"><div className="workspace-header"><div><small>PS3 / STORYBRIDGE</small><h2>Episode continuity review</h2><p>Compare two episodes or scan the complete series. Results are editorial signals, not final verdicts.</p></div><button className="outline-btn" onClick={()=>setView('home')}>← Dashboard</button></div>
        <div className="mode-tabs"><button className={mode==='dataset'?'active':''} onClick={()=>setMode('dataset')}>Episode library</button><button className={mode==='manual'?'active':''} onClick={()=>setMode('manual')}>Paste text manually</button></div>
        {mode==='dataset'?<><div className="dataset-head"><div><h4>Original KukuFM scripts</h4><p>{loadingEpisodes?'Loading episode files…':episodes.length+' episode files detected'}</p></div><button className="outline-btn" disabled={busy||loadingEpisodes||episodes.length<2} onClick={analyzeSeries}>{busy?'Analyzing…':'Analyze entire series ↗'}</button></div><label>Show / project name<input value={show} onChange={e=>setShow(e.target.value)}/></label><div className="grid"><label>Previous episode<select value={prevId} onChange={e=>setPrevId(e.target.value)}>{episodes.map(ep=><option key={ep.id} value={ep.id}>{String(ep.number).padStart(2,'0')} · {ep.name}</option>)}</select></label><label>Next episode<select value={nextId} onChange={e=>setNextId(e.target.value)}>{episodes.map(ep=><option key={ep.id} value={ep.id}>{String(ep.number).padStart(2,'0')} · {ep.name}</option>)}</select></label></div><button className="run-btn" disabled={busy||loadingEpisodes||episodes.length<2} onClick={compareDataset}>{busy?'Reviewing…':'Compare selected episodes →'}</button></>:<><label>Show / project name<input value={show} onChange={e=>setShow(e.target.value)}/></label><div className="grid"><label>Previous episode<textarea value={a} onChange={e=>setA(e.target.value)}/></label><label>Next episode<textarea value={b} onChange={e=>setB(e.target.value)}/></label></div><button className="run-btn" disabled={busy} onClick={compareManual}>{busy?'Reviewing…':'Run manual continuity review →'}</button></>}
        {err&&<p className="error">{err}</p>}{out&&<ResultPanel out={out}/>}{series&&<div className="result-card"><h3>Full series scan · {series.total_flags} flags</h3><p>{series.note}</p>{series.pairs.map((pair,i)=><details key={i}><summary>{pair.previous} → {pair.next} ({pair.flags} flags)</summary>{pair.findings.map((f,j)=><article key={j}><b>{f.severity} · {f.title}</b><p>{f.evidence}</p></article>)}</details>)}</div>}
      </section>}
      <footer className="footer"><span>✣ KukuFM Assignment</span><span>Built for audio intelligence · Human review stays in the loop</span></footer>
    </main>
  </div>;
}
function ResultPanel({out}) { return <div className="result-card"><div className="panel-heading"><h3>Analysis report</h3><span className="success-pill">{out.summary?.flags??out.findings?.length??0} flags</span></div><div className="summary-grid"><div><small>Recurring names</small><p>{out.summary?.recurring_names?.join(', ')||'None detected'}</p></div><div><small>New names</small><p>{out.summary?.new_names?.join(', ')||'None detected'}</p></div></div>{out.findings?.map((f,i)=><article key={i}><small>{f.severity} · {f.category}</small><h4>{f.title}</h4><p>{f.evidence}</p><div className="recommend"><b>Suggested editor action</b><p>{f.recommendation}</p></div></article>)}{out.review_checklist?.length>0&&<><h4>Human review checklist</h4>{out.review_checklist.map((x,i)=><label className="check" key={i}><input type="checkbox"/>{x}</label></>)}<details><summary>Limitations</summary><ul>{out.limitations?.map((x,i)=><li key={i}>{x}</li>)}</ul></details><button className="outline-btn" onClick={()=>navigator.clipboard?.writeText(JSON.stringify(out,null,2))}>Copy report JSON</button></div>}
createRoot(document.getElementById('root')).render(<App/>);
