import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://kukufm-assignment-api.onrender.com' : '');

const demoA = "Maya entered the hospital with a blood-stained letter. She told her brother Arjun their father was alive and hid evidence in the mansion. Arjun owns the silver key. Maya promised to return before midnight.";
const demoB = "The next morning Maya arrives at the police station. Arjun says their father died years ago and the silver key was stolen. Maya asks the detective to find the letter.";

function App() {
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

  useEffect(() => {
    fetch(`${API_BASE}/api/episodes`)
      .then(r => { if (!r.ok) throw new Error('Could not load episode library'); return r.json(); })
      .then(data => {
        setEpisodes(data.episodes || []);
        if (data.episodes?.length > 1) {
          setPrevId(data.episodes[0].id);
          setNextId(data.episodes[1].id);
        }
      })
      .catch(e => setErr(`Episode library unavailable: ${e.message}. Check that the backend is deployed.`))
      .finally(() => setLoadingEpisodes(false));
  }, []);

  const selectedPrev = useMemo(() => episodes.find(x => x.id === prevId), [episodes, prevId]);
  const selectedNext = useMemo(() => episodes.find(x => x.id === nextId), [episodes, nextId]);

  async function compareDataset() {
    if (!prevId || !nextId || prevId === nextId) {
      setErr('Choose two different episodes to compare.');
      return;
    }
    setBusy(true); setErr(''); setOut(null); setSeries(null);
    try {
      const r = await fetch(`${API_BASE}/api/analyze-episodes`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_name: show, previous_episode_id: prevId, next_episode_id: nextId })
      });
      if (!r.ok) throw new Error(await r.text());
      setOut(await r.json());
    } catch (e) { setErr(`Analysis failed: ${e.message}`); }
    finally { setBusy(false); }
  }

  async function analyzeSeries() {
    setBusy(true); setErr(''); setOut(null); setSeries(null);
    try {
      const r = await fetch(`${API_BASE}/api/analyze-series`);
      if (!r.ok) throw new Error(await r.text());
      setSeries(await r.json());
    } catch (e) { setErr(`Series analysis failed: ${e.message}`); }
    finally { setBusy(false); }
  }

  async function compareManual() {
    setBusy(true); setErr(''); setOut(null); setSeries(null);
    try {
      const r = await fetch(`${API_BASE}/api/analyze`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ show_name: show, previous_episode: a, next_episode: b })
      });
      if (!r.ok) throw new Error(await r.text());
      setOut(await r.json());
    } catch (e) { setErr(`Analysis failed: ${e.message}`); }
    finally { setBusy(false); }
  }

  function loadSelectedText() {
    setErr('');
    setOut(null);
    if (!selectedPrev || !selectedNext) return;
    setA(selectedPrev.preview || '');
    setB(selectedNext.preview || '');
  }

  return <main>
    <section className="problem-hub">
      <div className="problem-hub-copy"><small>KUKUFM ASSIGNMENT · UNIFIED WORKSPACE</small><h2>One project. Three problem tracks.</h2><p>Switch between problem statements without leaving the app. StoryBridge continuity review is currently implemented under PS3.</p></div>
      <div className="problem-switcher" role="tablist" aria-label="Problem statement selector">
        {['PS1', 'PS2', 'PS3'].map(ps => <button key={ps} role="tab" aria-selected={activeProblem === ps} className={activeProblem === ps ? 'active' : ''} onClick={() => setActiveProblem(ps)}>{ps}</button>)}
      </div>
      {activeProblem === 'PS3' ? <div className="problem-status active-status"><b>PS3 · StoryBridge</b><span>Available · Episode continuity checker</span></div> : <div className="problem-status pending-status"><b>{activeProblem} · Module slot</b><span>Assignment-specific workflow not implemented yet; no fabricated results are shown.</span></div>}
    </section>
    {activeProblem === 'PS3' ? <>
    <header>
      <div className="logo">SB</div>
      <div><small>EDITOR TOOLKIT / STORY CONTINUITY</small><h1>StoryBridge</h1></div>
      <span className="pill">50-episode dataset · Human review</span>
    </header>

    <section className="hero">
      <small>YOUR SCRIPT LIBRARY, READY TO REVIEW</small>
      <h2>Keep every episode <em>connected.</em></h2>
      <p>StoryBridge reads the episode files in your GitHub project and surfaces continuity signals across the series. Every flag is an editorial prompt—not a verdict.</p>
      <div className="stats">
        <div><strong>{episodes.length || '—'}</strong><span>Episodes loaded</span></div>
        <div><strong>{Math.max(episodes.length - 1, 0)}</strong><span>Adjacent pairs</span></div>
        <div><strong>Rule-based</strong><span>Transparent baseline</span></div>
      </div>
    </section>

    <section className="panel">
      <div className="head"><div><small>01 / WORKSPACE</small><h3>Choose your review mode</h3></div></div>
      <div className="mode-tabs">
        <button className={mode === 'dataset' ? 'active' : ''} onClick={() => setMode('dataset')}>Episode library</button>
        <button className={mode === 'manual' ? 'active' : ''} onClick={() => setMode('manual')}>Paste text manually</button>
      </div>

      {mode === 'dataset' ? <>
        <div className="dataset-head">
          <div><h4>Original KukuFM scripts</h4><p className="muted">{loadingEpisodes ? 'Loading episode files from backend…' : `${episodes.length} episode files detected`}</p></div>
          <button className="secondary" disabled={busy || loadingEpisodes || episodes.length < 2} onClick={analyzeSeries}>{busy ? 'Analyzing…' : 'Analyze entire series ↗'}</button>
        </div>
        <label>Show / project name<input value={show} onChange={e => setShow(e.target.value)} /></label>
        <div className="grid">
          <label>Previous episode
            <select value={prevId} onChange={e => setPrevId(e.target.value)} disabled={loadingEpisodes}>
              {episodes.map(ep => <option key={ep.id} value={ep.id}>{String(ep.number).padStart(2, '0')} · {ep.name}</option>)}
            </select>
            {selectedPrev && <span className="file-meta">{selectedPrev.characters.toLocaleString()} characters · {selectedPrev.id}</span>}
          </label>
          <label>Next episode
            <select value={nextId} onChange={e => setNextId(e.target.value)} disabled={loadingEpisodes}>
              {episodes.map(ep => <option key={ep.id} value={ep.id}>{String(ep.number).padStart(2, '0')} · {ep.name}</option>)}
            </select>
            {selectedNext && <span className="file-meta">{selectedNext.characters.toLocaleString()} characters · {selectedNext.id}</span>}
          </label>
        </div>
        <div className="actions">
          <button className="run" disabled={busy || loadingEpisodes || episodes.length < 2} onClick={compareDataset}>{busy ? 'Reviewing…' : 'Compare selected episodes →'}</button>
          <button className="secondary" onClick={loadSelectedText} disabled={!selectedPrev || !selectedNext}>Load excerpts into manual editor</button>
        </div>
        <p className="note">Episode files are read from <code>original_assignment_files/</code> on the backend. Select any two files; the series scan checks adjacent pairs in filename order.</p>
      </> : <>
        <label>Show / project name<input value={show} onChange={e => setShow(e.target.value)} /></label>
        <div className="grid">
          <label>Previous episode<textarea value={a} onChange={e => setA(e.target.value)} /></label>
          <label>Next episode<textarea value={b} onChange={e => setB(e.target.value)} /></label>
        </div>
        <button className="run" disabled={busy || a.length < 20 || b.length < 20} onClick={compareManual}>{busy ? 'Reviewing…' : 'Run manual continuity review →'}</button>
        <p className="note">Use content you own or have permission to process. The manual editor does not modify the original script files.</p>
      </>}
      {err && <p className="error">{err}</p>}
    </section>

    {out && <section className="panel">
      <div className="head"><div><small>02 / EPISODE PAIR REPORT</small><h3>{out.source_episodes ? 'Selected script comparison' : 'Manual text comparison'}</h3></div><span className="pill">{out.summary.flags} flags</span></div>
      {out.source_episodes && <p className="muted">{out.source_episodes[0]} <span className="arrow">→</span> {out.source_episodes[1]}</p>}
      <div className="summary-grid">
        <div><small>Recurring names</small><p>{out.summary.recurring_names.join(', ') || 'None detected'}</p></div>
        <div><small>New names in next episode</small><p>{out.summary.new_names.join(', ') || 'None detected'}</p></div>
      </div>
      {out.findings.map((f, i) => <article key={i}>
        <small className={f.severity}>{f.severity} · {f.category}</small><h4>{f.title}</h4><p>{f.evidence}</p>
        <div className="recommend"><b>Editor action</b>{f.recommendation}</div>
      </article>)}
      <h4>Human review checklist</h4>
      {out.review_checklist.map((x, i) => <label className="check" key={i}><input type="checkbox"/>{x}</label>)}
      <details><summary>Limitations</summary><ul>{out.limitations.map((x, i) => <li key={i}>{x}</li>)}</ul></details>
      <button className="secondary" onClick={() => navigator.clipboard?.writeText(JSON.stringify(out, null, 2))}>Copy report JSON</button>
    </section>}

    {series && <section className="panel">
      <div className="head"><div><small>02 / FULL SERIES REPORT</small><h3>Series continuity scan</h3></div><span className="pill">{series.total_flags} flags</span></div>
      <div className="summary-grid">
        <div><small>Episodes scanned</small><p>{series.episode_count}</p></div>
        <div><small>Adjacent pairs</small><p>{series.pair_count}</p></div>
        <div><small>Flags across pairs</small><p>{series.total_flags}</p></div>
      </div>
      <p className="note">{series.note}</p>
      {series.pairs.map((pair, i) => <details className="pair" key={i}>
        <summary><span>{String(i + 1).padStart(2, '0')} · {pair.previous.replace('.txt','')}</span><span className="pair-count">{pair.flags} flags</span></summary>
        <p className="muted">Next: {pair.next}</p>
        {pair.findings.map((f, j) => <article key={j}><small className={f.severity}>{f.severity} · {f.category}</small><h4>{f.title}</h4><p>{f.evidence}</p><div className="recommend">{f.recommendation}</div></article>)}
      </details>)}
      <button className="secondary" onClick={() => navigator.clipboard?.writeText(JSON.stringify(series, null, 2))}>Copy full-series JSON</button>
    </section>}

    <footer>StoryBridge · KukuFM unified workspace <span>Human-in-the-loop by design</span></footer>
    </> : <section className="panel problem-placeholder"><small>{activeProblem} / MODULE</small><h3>{activeProblem} workspace</h3><p>This track is connected to the unified project shell. Its exact assignment-specific inputs, processing logic, and output format still need the original PS prompt.</p><ul><li>Dedicated input validation</li><li>Problem-specific processing</li><li>Raw output export</li><li>Shared report UI</li></ul><p className="note">This is a module placeholder, not a completed PS solution.</p></section>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App/>);
