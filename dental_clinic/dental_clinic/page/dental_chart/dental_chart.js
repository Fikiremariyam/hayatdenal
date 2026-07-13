frappe.pages['dental-chart'].on_page_load =  function (wrapper) {

    /* ── 1. PAGE CHROME ─────────────────────────────────────────────────── */
    const page = frappe.ui.make_app_page({
        parent      : wrapper,
        title       : "Dental Chart",
        single_column: true,
    });


   page.set_primary_action("Save Chart",  () => window._dc?.save(),   "save");
   page.add_inner_button("Export JSON",   () => window._dc?.export());
   page.add_inner_button("Load History",  () => window._dc?.loadChartHistory());
   page.add_inner_button("Clear Chart",   () => {
       frappe.confirm("Clear all charting data for this session?", () => {
           window._dc?.clear();
           frappe.show_alert({ message: "Chart cleared", indicator: "orange" });
       });
   });
    /* ── 2. CSS ─────────────────────────────────────────────────────────── */
    frappe.dom.set_style(`
#dc-root {
    --bg:#f0f2f5; --panel:#ffffff; --panel2:#f8f9fb;
    --border:#e2e6ea; --border2:#c8cfd8;
    --text:#1a2332; --muted:#6b7a8d; --muted2:#9aa3af;
    --accent:#1a6ef5; --accent-light:#e8f0fe;
    --c-decay:#e74c3c;   --c-crown:#f39c12;
    --c-rct:#8e44ad;     --c-missing:#95a5a6;
    --c-implant:#27ae60; --c-filling:#3498db;
    --c-fracture:#e67e22;--c-bridge:#16a085;
    --c-healthy:#27ae60;
    --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06);
    font-family:'DM Sans',-apple-system,'Segoe UI',sans-serif;
    font-size:13px; color:var(--text);
}
/* layout */
#dc-root .dc-body       { display:flex; min-height:calc(100vh - 160px); }
#dc-root .dc-palette    { width:192px;min-width:192px;background:var(--panel);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto; }
#dc-root .dc-main       { flex:1;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:14px; }
#dc-root .dc-detail     { width:216px;min-width:216px;background:var(--panel);border-left:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto; }
/* patient bar */
#dc-root .dc-pt-bar     { background:var(--panel);border-bottom:1px solid var(--border);padding:9px 16px;display:flex;align-items:center;gap:18px;flex-wrap:wrap; }
#dc-root .dc-pt-name    { font-size:15px;font-weight:700; }
#dc-root .dc-pt-meta    { display:flex;gap:14px;flex-wrap:wrap;font-size:11px;color:var(--muted); }
#dc-root .dc-pt-meta b  { color:var(--text);font-weight:600; }
#dc-root .dc-pt-badge   { margin-left:auto;background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:.04em; }
/* sidebar */
#dc-root .pal-section   { padding:11px 12px 7px; }
#dc-root .pal-label     { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2);margin-bottom:7px;display:block; }
#dc-root .pal-sep       { height:1px;background:var(--border);margin:3px 12px 6px; }
#dc-root .pal-btn       { display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;border-radius:7px;border:1.5px solid transparent;background:var(--panel2);cursor:pointer;font-size:12px;font-weight:500;color:var(--text);transition:all .13s;margin-bottom:3px;text-align:left;font-family:inherit; }
#dc-root .pal-btn:hover { border-color:var(--border2);background:#fff; }
#dc-root .pal-btn.active{ border-color:currentColor; }
#dc-root .pal-dot       { width:11px;height:11px;border-radius:3px;flex-shrink:0; }
#dc-root .surf-grid     { display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:0 12px 10px; }
#dc-root .surf-btn      { padding:5px 2px;border-radius:5px;border:1.5px solid var(--border);background:var(--panel2);font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--muted);cursor:pointer;text-align:center;transition:all .13s; }
#dc-root .surf-btn:hover{ border-color:var(--border2);color:var(--text); }
#dc-root .surf-btn.active{ border-color:var(--accent);color:var(--accent);background:var(--accent-light); }
/* arch */
#dc-root .arch-block    { background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--shadow); }
#dc-root .arch-bar      { background:var(--panel2);border-bottom:1px solid var(--border);padding:7px 14px;display:flex;align-items:center;gap:10px; }
#dc-root .arch-title    { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-family:'DM Mono',monospace; }
#dc-root .arch-legend   { display:flex;gap:10px;margin-left:auto; }
#dc-root .al-item       { display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted); }
#dc-root .al-dot        { width:7px;height:7px;border-radius:2px; }
#dc-root .midline-marker{ height:18px;width:2px;background:var(--border2);border-radius:1px;margin:0 2px;flex-shrink:0; }
#dc-root .teeth-row     { display:flex;align-items:flex-end;justify-content:center;padding:14px 10px 7px;gap:2px;overflow-x:auto; }
#dc-root .lower-row     { align-items:flex-start; }
/* tooth cell */
#dc-root .tooth-cell    { display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:2px;border-radius:8px;transition:background .12s;position:relative;min-width:46px; }
#dc-root .tooth-cell:hover{ background:rgba(26,110,245,.06); }
#dc-root .tooth-cell.selected{ background:var(--accent-light);outline:2px solid var(--accent);outline-offset:1px; }
#dc-root .tooth-num-fdi { font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--muted);margin-bottom:2px;line-height:1; }
#dc-root .tooth-num-uni { font-family:'DM Mono',monospace;font-size:8px;color:var(--muted2);margin-bottom:2px;line-height:1; }
#dc-root .lower-row .tooth-num-fdi{ order:3;margin-bottom:0;margin-top:2px; }
#dc-root .lower-row .tooth-num-uni{ order:4; }
#dc-root .tooth-svg-wrap{ position:relative; }
#dc-root .tooth-svg-wrap svg{ display:block; }
#dc-root .tooth-badge   { position:absolute;top:-4px;right:-4px;width:13px;height:13px;border-radius:50%;border:1.5px solid #fff;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;z-index:2; }
#dc-root .surface-row   { display:flex;gap:2px;margin-top:3px; }
#dc-root .surf-dot      { width:7px;height:7px;border-radius:2px;border:1px solid var(--border);background:var(--panel2); }
/* detail panel */
#dc-root .dp-header     { padding:12px 14px 9px;border-bottom:1px solid var(--border);background:var(--panel2); }
#dc-root .dp-title      { font-size:13px;font-weight:700; }
#dc-root .dp-sub        { font-size:11px;color:var(--muted);margin-top:1px; }
#dc-root .dp-section    { padding:10px 14px;border-bottom:1px solid var(--border); }
#dc-root .dp-label      { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2);margin-bottom:7px;display:block; }
#dc-root .dp-row        { display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:12px; }
#dc-root .surf-map      { display:grid;grid-template-columns:1fr 1fr 1fr;grid-template-rows:1fr 1fr 1fr;gap:3px;width:70px;margin:0 auto; }
#dc-root .sm-cell       { height:20px;border-radius:3px;border:1px solid var(--border);background:var(--panel2);cursor:pointer;transition:all .12s;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:600;color:var(--muted2); }
#dc-root .sm-cell:hover { border-color:var(--border2);background:var(--border); }
#dc-root .sm-cell.active{ background:var(--accent-light);border-color:var(--accent);color:var(--accent); }
#dc-root .cond-tag      { display:flex;align-items:center;gap:6px;padding:5px 8px;border-radius:6px;margin-bottom:3px;font-size:11px;font-weight:500; }
#dc-root .cond-tag:hover{ background:var(--panel2); }
#dc-root .ct-dot        { width:8px;height:8px;border-radius:2px;flex-shrink:0; }
#dc-root .ct-rm         { margin-left:auto;color:var(--muted2);font-size:14px;line-height:1;opacity:.6;cursor:pointer;transition:opacity .12s; }
#dc-root .ct-rm:hover   { opacity:1;color:var(--c-decay); }
#dc-root .dp-select     { border:1px solid var(--border);background:var(--panel2);font-family:'DM Mono',monospace;font-size:11px;color:var(--text);padding:3px 6px;border-radius:4px;outline:none;cursor:pointer; }
#dc-root .dp-textarea   { width:100%;border:1.5px solid var(--border);border-radius:6px;padding:7px 10px;font-family:inherit;font-size:12px;color:var(--text);background:var(--panel2);outline:none;resize:none;transition:border-color .15s; }
#dc-root .dp-textarea:focus{ border-color:var(--accent); }
#dc-root .apply-btn     { width:100%;padding:8px;background:var(--accent);color:#fff;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:background .13s; }
#dc-root .apply-btn:hover{ background:#1558d6; }
/* summary table */
#dc-root .sum-tbl       { width:100%;border-collapse:collapse;font-size:12px; }
#dc-root .sum-tbl th    { background:var(--panel2);padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:600;border-bottom:1px solid var(--border); }
#dc-root .sum-tbl td    { padding:6px 10px;border-bottom:1px solid var(--border); }
#dc-root .sum-tbl tr:last-child td{ border-bottom:none; }
#dc-root .sum-tbl tr:hover td{ background:var(--panel2); }
/* stat boxes */
#dc-root .stat-grid     { display:grid;grid-template-columns:1fr 1fr;gap:5px; }
#dc-root .stat-box      { background:var(--panel2);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center; }
#dc-root .stat-val      { font-size:18px;font-weight:700;font-family:'DM Mono',monospace;line-height:1; }
#dc-root .stat-lbl      { font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted2); }
/* notes row */
#dc-root .notes-row {   display: flex;    gap: 12px;}

#dc-root .notes-card {flex: 1;    background: var(--panel);    border: 1px solid var(--border);border-radius: 10px;    padding: 12px;}
#dc-root .notes-lbl     { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:7px;display:block; }
/* status bar */
#dc-root .dc-statusbar  { background:var(--panel);border-top:1px solid var(--border);padding:4px 14px;display:flex;align-items:center;gap:16px;font-size:11px;color:var(--muted);flex-wrap:wrap; }
#dc-root .sb-chip       { display:flex;align-items:center;gap:5px;font-family:'DM Mono',monospace;font-size:10px; }
#dc-root .sb-dot        { width:7px;height:7px;border-radius:50%; }
#dc-root .sb-mode       { margin-left:auto;font-size:10px;font-family:'DM Mono',monospace;color:var(--muted2); }
/* tooltip */
#dc-tip { position:fixed;background:#1a2332;color:#fff;font-size:11px;padding:5px 10px;border-radius:6px;pointer-events:none;opacity:0;transition:opacity .12s;z-index:9999;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.2); }
/* scrollbar */
#dc-root ::-webkit-scrollbar{ width:5px;height:5px; }
#dc-root ::-webkit-scrollbar-track{ background:transparent; }
#dc-root ::-webkit-scrollbar-thumb{ background:var(--border2);border-radius:3px; }
@media print{
    #dc-root .dc-palette,#dc-root .dc-detail,#dc-root .dc-statusbar,#dc-root .dc-pt-bar{ display:none!important; }
    #dc-root .dc-main{ padding:0; }
}
    `);

    /* ── 3. HTML ─────────────────────────────────────────────────────────── */
    page.main.html(`
<div id="dc-tip"></div>
<div id="dc-root">

  <!-- PATIENT BANNER -->
  <div class="dc-pt-bar">
    <div class="dc-pt-name" id="dc-pt-name"></div>

    <div class="dc-doc-name" id="dc-doc-name"> </div>

    <div class="dc-pt-meta">
      <div>perio exam: <b id="dc-pt-dob">—</b></div>
      <div>Provider: <b id="dc-pt-prov">—</b></div>
      <div>Date: <b id="dc-pt-date"></b></div>
    </div>

    <div class="dc-pt-badge" id="dc-pt-badge">New Chart</div>
  
    </div>


  <div class="dc-body">

    <!-- LEFT PALETTE -->
    <div class="dc-palette">

      <div class="pal-section">
        <div class="pal-label">Tooth Status</div>
        <button class="pal-btn active" data-cond="healthy"  style="color:var(--c-healthy)"><span class="pal-dot" style="background:var(--c-healthy)"></span>Healthy</button>
        <button class="pal-btn"        data-cond="missing"  style="color:var(--c-missing)"><span class="pal-dot" style="background:var(--c-missing)"></span>Missing</button>
        <button class="pal-btn"        data-cond="implant"  style="color:var(--c-implant)"><span class="pal-dot" style="background:var(--c-implant)"></span>Implant</button>
        <button class="pal-btn"        data-cond="bridge"   style="color:var(--c-bridge)"><span class="pal-dot" style="background:var(--c-bridge)"></span>Bridge Pontic</button>
      </div>
      <div class="pal-sep">

      </div>

      <div class="pal-section">
        <div class="pal-label">Restorations</div>
        <button class="pal-btn" data-cond="crown"   style="color:var(--c-crown)"><span class="pal-dot" style="background:var(--c-crown)"></span>Crown</button>
        <button class="pal-btn" data-cond="filling" style="color:var(--c-filling)"><span class="pal-dot" style="background:var(--c-filling)"></span>Filling</button>
        <button class="pal-btn" data-cond="rct"     style="color:var(--c-rct)"><span class="pal-dot" style="background:var(--c-rct)"></span>Root Canal (RCT)</button>
        <button class="pal-btn" data-cond="veneer"  style="color:#00bcd4"><span class="pal-dot" style="background:#00bcd4"></span>Veneer</button>
      </div>
      <div class="pal-sep"></div>

      <div class="pal-section">
        <div class="pal-label">Pathology</div>
        <button class="pal-btn" data-cond="decay"    style="color:var(--c-decay)"><span class="pal-dot" style="background:var(--c-decay)"></span>Decay / Caries</button>
        <button class="pal-btn" data-cond="fracture" style="color:var(--c-fracture)"><span class="pal-dot" style="background:var(--c-fracture)"></span>Fracture</button>
        <button class="pal-btn" data-cond="mobility" style="color:#e91e63"><span class="pal-dot" style="background:#e91e63"></span>Mobility</button>
        <button class="pal-btn" data-cond="abscess"  style="color:#ff5722"><span class="pal-dot" style="background:#ff5722"></span>Abscess</button>
      </div>
      <div class="pal-sep"></div>

      <div class="pal-section"><div class="pal-label">Surface</div>
    
    </div>
      <div class="surf-grid">
        <button class="surf-btn active" data-surf="all">All</button>
        <button class="surf-btn" data-surf="M">M</button>
        <button class="surf-btn" data-surf="O">O/I</button>
        <button class="surf-btn" data-surf="D">D</button>
        <button class="surf-btn" data-surf="B">B/F</button>
        <button class="surf-btn" data-surf="L">L/P</button>
      </div>
      <div class="pal-sep"></div>

      <div class="pal-section">
        <div class="pal-label">Numbering</div>
        <button class="pal-btn" id="dc-num-toggle" style="font-family:'DM Mono',monospace;font-size:11px">
          <span style="font-size:13px">🔢</span>FDI / Universal
        </button>
      </div>
      <div class="pal-sep"></div>

      <div class="pal-section">
        <div class="pal-label">Summary</div>
        <div class="stat-grid">
          <div class="stat-box"><div class="stat-val" style="color:var(--c-healthy)" id="dc-st-h">0</div><div class="stat-lbl">Healthy</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--c-decay)"   id="dc-st-d">0</div><div class="stat-lbl">Decay</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--c-missing)" id="dc-st-m">0</div><div class="stat-lbl">Missing</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--c-crown)"   id="dc-st-cr">0</div><div class="stat-lbl">Crown</div></div>
        </div>
      </div>

    </div><!-- /palette -->

    <!-- MAIN -->
    <div class="dc-main">

      <!-- UPPER ARCH -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 18–28</div>
          <div class="arch-legend">
            <div class="al-item"><div class="al-dot" style="background:var(--c-decay)"></div>Decay</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-crown)"></div>Crown</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-filling)"></div>Filling</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-missing)"></div>Missing</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-rct)"></div>RCT</div>
          </div>
        </div>
        <div class="teeth-row" id="dc-upper-row"></div>
      </div>
      <!-- LOWER ARCH -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 48–38</div>
        </div>
        <div class="teeth-row lower-row" id="dc-lower-row"></div>
      </div>
      <!-- SUMMARY TABLE -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Condition Summary</div>
          <div style="font-size:10px;color:var(--muted2);margin-left:auto">All recorded conditions · both arches</div>
        </div>
        <div style="padding:10px 14px;overflow-x:auto" id="dc-summary-wrap">
          <div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">
            Click any tooth and apply a condition to begin charting
          </div>
        </div>
      </div>
         <!-- NOTES -->
      <div class="notes-row">
        <div class="notes-card">
          <span class="notes-lbl">Clinical Notes</span>
          <textarea class="dp-textarea" id="dc-notes-clinical" rows="3" placeholder="Clinical observations, exam findings…"></textarea>
        </div>
        </div>
    </div>
    <!-- /main -->

    <!-- RIGHT DETAIL PANEL -->
    <div class="dc-detail">

      <div class="dp-header">
        <div class="dp-title" id="dc-dp-title">No tooth selected</div>
        <div class="dp-sub"   id="dc-dp-sub">Click a tooth to view details</div>
      </div>

      <div class="dp-section">
        <div class="dp-label">Surface Map</div>
        <div class="surf-map">
          <div></div>
          <div class="sm-cell" data-s="O">O</div>
          <div></div>
          <div class="sm-cell" data-s="M">M</div>
          <div style="height:20px;border-radius:3px;border:1px solid var(--border);background:var(--panel2)"></div>
          <div class="sm-cell" data-s="D">D</div>
          <div></div>
          <div class="sm-cell" data-s="L">L</div>
          <div></div>
        </div>
        <div style="text-align:center;margin-top:8px">
          <button class="apply-btn" id="dc-apply-btn">Apply &amp; Record</button>
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-label">Conditions</div>
        <div id="dc-dp-conds">
          <div style="font-size:11px;color:var(--muted2);text-align:center;padding:8px 0">None recorded</div>
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-label">Measurements</div>
        <div class="dp-row">
          <span style="color:var(--muted)">Mobility</span>
          <select id="dc-dp-mob" class="dp-select"><option>0</option><option>I</option><option>II</option><option>III</option></select>
        </div>
        <div class="dp-row">
          <span style="color:var(--muted)">Furcation</span>
          <select id="dc-dp-furc" class="dp-select"><option>—</option><option>I</option><option>II</option><option>III</option></select>
        </div>
        <div class="dp-row">
          <span style="color:var(--muted)">Sensitivity</span>
          <select id="dc-dp-sens" class="dp-select"><option>None</option><option>Cold</option><option>Heat</option><option>Both</option></select>
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-label">Treatment plan </div>
        <textarea class="dp-textarea" id="dc-dp-notes" rows="4" placeholder="Observations for this tooth…"></textarea>
      </div>


    <!-- STATUS BAR -->
    <div class="dc-statusbar">
        <div class="sb-chip"><div class="sb-dot" style="background:var(--c-healthy)"></div><span id="dc-sb-h">0</span> healthy</div>
        <div class="sb-chip"><div class="sb-dot" style="background:var(--c-decay)"></div><span id="dc-sb-d">0</span> decay</div>
        <div class="sb-chip"><div class="sb-dot" style="background:var(--c-missing)"></div><span id="dc-sb-m">0</span> missing</div>
        <div class="sb-chip"><div class="sb-dot" style="background:var(--c-crown)"></div><span id="dc-sb-cr">0</span> crown</div>
        <div class="sb-chip"><div class="sb-dot" style="background:var(--c-rct)"></div><span id="dc-sb-rct">0</span> rct</div>
        <div class="sb-mode">Mode: <span id="dc-sb-mode">Healthy</span> · Surface: <span id="dc-sb-surf">All</span></div>
    </div>
    </div><!-- /detail -->


  </div><!-- /body -->

</div>
<!-- /dc-root -->
    `);

    /* ── 4. BOOT ─────────────────────────────────────────────────────────── */
   
   frappe.after_ajax(() => {
       window._dc = new DentalChart();
       window._dc.init();
   });
};


/* ═══════════════════════════════════════════════════════════════════════════
   DENTAL CHART ENGINE  –  Drop-in replacement for _dcInit()
   ► No HTML or CSS changes required
   ► Replace everything below the frappe.after_ajax(() => _dcInit()); line
     with: frappe.after_ajax(() => { window._dc = new DentalChart(); window._dc.init(); });
   ► Also replace _dcSave / _dcClear / _dcExport toolbar references with:
     page.set_primary_action("Save Chart", () => window._dc.save(), "save");
     page.add_inner_button("Export JSON", () => window._dc.export());
     page.add_inner_button("Clear Chart", () => { frappe.confirm(..., () => window._dc.clear()); });
   ═══════════════════════════════════════════════════════════════════════════*/


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: ToothState
   Holds all clinical data for a single tooth.
─────────────────────────────────────────────────────────────────────────────*/
class ToothState {

    /**
     * @param {{ fdi:string, uni:string, name:string, type:string }} meta
     */
    constructor(meta) {
        this.fdi         = meta.fdi;
        this.uni         = meta.uni;
        this.name        = meta.name;
        this.type        = meta.type;       // 'molar' | 'premolar' | 'canine' | 'incisor'
        this.conditions  = [];              // [{ type:string, surface:string }]
        this.mobility    = '0';
        this.furcation   = '—';
        this.sensitivity = 'None';
        this.notes       = '';
    }

    /**
     * Add a condition, deduplicating on type+surface.
     * @param {string} type
     * @param {string} surface
     */
    addCondition(type, surface) {
        this.conditions = this.conditions.filter(
            c => !(c.type === type && c.surface === surface)
        );
        this.conditions.push({ type, surface });
    }

    /** Remove a condition by index. */
    removeCondition(index) {
        this.conditions.splice(index, 1);
    }

    /** Reset tooth to blank state. */
    reset() {
        this.conditions  = [];
        this.mobility    = '0';
        this.furcation   = '—';
        this.sensitivity = 'None';
        this.notes       = '';
    }

    /**
     * Populate from a Dental Chart Tooth child-table row (fetched from DocType).
     * @param {Object} row  – one item from doc.tooth_conditions
     */
    loadFromDocRow(row) {
        const type = (row.condition || '').toLowerCase();
        if (type && type !== 'healthy') {
            this.addCondition(type, row.surface || 'All');
        }
        if (row.mobility    && row.mobility    !== '0') this.mobility    = row.mobility;
        if (row.furcation   && row.furcation   !== '—') this.furcation   = row.furcation;
        if (row.sensitivity && row.sensitivity !== 'None') this.sensitivity = row.sensitivity;
        if (row.notes) this.notes = row.notes;
    }

    /** Serialize to a Dental Chart Tooth child-table row object. */
    toDocRow(arch) {
        return {
            doctype          : 'Dental Chart Tooth',
            tooth_fdi        : this.fdi,
            tooth_universal  : this.uni,
            tooth_name_label : this.name,
            arch,
            condition        : this.conditions[0]
                ? this.conditions[0].type.charAt(0).toUpperCase() + this.conditions[0].type.slice(1)
                : 'Healthy',
            surface          : this.conditions[0] ? this.conditions[0].surface : 'All',
            mobility         : this.mobility,
            furcation        : this.furcation,
            sensitivity      : this.sensitivity,
            notes            : this.notes || '',
        };
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: PatientInfo
   Manages the patient link control and banner rendering.
─────────────────────────────────────────────────────────────────────────────*/
class PatientInfo {

    constructor() {
        this.id       = null;
        this.fullName = '—';
        this.dob      = '—';
        this.provider = '—';
        this._onChangeCb         = null;
        this._onProviderChangeCb = null;

        /* Mount the Frappe Link control into .dc-pt-name */
        this._ctrl = frappe.ui.form.make_control({
            parent: $('.dc-pt-name'),
            df: {
                fieldtype  : 'Link',
                options    : 'Patient',
                label      : 'Patient',
                fieldname  : 'patient',
                placeholder: 'Search patient name or ID…',
            },
            render_input: true,
        });

        this._ctrl.$input.on('change', () => {
            const val = this._ctrl.get_value();
            if (val && this._onChangeCb) this._onChangeCb(val);
        });

        /* Provider (Healthcare Practitioner) link control */
        this.provider_ctrl = frappe.ui.form.make_control({
            parent: $('.dc-doc-name'),
            df: {
                fieldtype  : 'Link',
                options    : 'Healthcare Practitioner',
                label      : 'Provider',
                fieldname  : 'provider',
                placeholder: 'Search provider name or ID…',
            },
            render_input: true,
        });

        this.provider_ctrl.$input.on('change', () => {
            const providerVal = this.provider_ctrl.get_value();
            if (providerVal) {
                this.provider = providerVal;
                _set('dc-pt-prov', providerVal);
                if (this._onProviderChangeCb) this._onProviderChangeCb(providerVal);
            }
        });
    }

    /** Currently linked patient ID (Frappe name). */
    get value() {
        return this._ctrl.get_value() || null;
    }

    /** Currently selected provider ID. */
    get providerValue() {
        return this.provider_ctrl.get_value() || null;
    }

    /** Set a callback that fires whenever the patient changes. */
    onChange(cb) {
        this._onChangeCb = cb;
    }

    /** Set a callback that fires whenever the provider changes. */
    onProviderChange(cb) {
        this._onProviderChangeCb = cb;
    }

    /**
     * Pre-fill the link control with a known patient ID (e.g. from URL param).
     * @param {string} patientId
     */
    setValue(patientId) {
        this._ctrl.set_value(patientId);
    }

    /**
     * Pre-fill the provider link control with a known provider ID.
     * @param {string} providerId
     */
    setProvider(providerId) {
        if (!providerId) return;
        this.provider = providerId;
        this.provider_ctrl.set_value(providerId);
        _set('dc-pt-prov', providerId);
    }

    /**
     * Fetch patient doc from Frappe and update banner fields.
     * @param {string} patientId
     */
    async load(patientId) {
        if (!patientId) return;
        try {
            const doc     = await frappe.db.get_doc('Patient', patientId);
            this.id       = doc.name;
            this.fullName = doc.patient_name || patientId;
            this.dob      = doc.dob ? frappe.datetime.str_to_user(doc.dob) : '—';
            this._renderBanner();
        } catch (err) {
            console.warn('[DentalChart] PatientInfo.load failed:', err);
        }
    }

    _renderBanner() {
        _set('dc-pt-dob',  this.dob);
        _set('dc-pt-prov', this.provider);
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: ToothSVG  (static helpers only)
   Generates inline SVG markup for each tooth morphology.
─────────────────────────────────────────────────────────────────────────────*/
class ToothSVG {

    static FILL_PRIORITY = [
        'missing','abscess','decay','fracture',
        'crown','rct','filling','veneer','implant','bridge',
    ];

    static COLORS = {
        none    : { f:'#dce4ee', s:'#b0bec5' },
        missing : { f:'#e8ecef', s:'#b0bec5' },
        abscess : { f:'#ffd6cc', s:'#ff5722' },
        decay   : { f:'#ffd6d6', s:'#e74c3c' },
        fracture: { f:'#fde8d0', s:'#e67e22' },
        crown   : { f:'#fff3cc', s:'#f39c12' },
        rct     : { f:'#ead6f5', s:'#8e44ad' },
        filling : { f:'#d6eaff', s:'#3498db' },
        veneer  : { f:'#d6f5f5', s:'#00bcd4' },
        implant : { f:'#d6f5e0', s:'#27ae60' },
        bridge  : { f:'#d6f0ec', s:'#16a085' },
        healthy : { f:'#e8f5e9', s:'#27ae60' },
    };

    /** Pick fill/stroke from active conditions array. */
    static resolve(conditions) {
        const types = conditions.map(c => c.type);
        for (const key of ToothSVG.FILL_PRIORITY) {
            if (types.includes(key)) return ToothSVG.COLORS[key];
        }
        return types.length ? ToothSVG.COLORS.healthy : ToothSVG.COLORS.none;
    }

    /** Entry point: dispatch to the correct morphology renderer. */
    static render(toothMeta, isUpper, conditions) {
        switch (toothMeta.type) {
            case 'molar':    return ToothSVG._molar(conditions, isUpper);
            case 'premolar': return ToothSVG._premolar(conditions, isUpper);
            case 'canine':   return ToothSVG._canine(conditions, isUpper);
            default:         return ToothSVG._incisor(conditions, isUpper);
        }
    }

    /* cross lines for missing teeth */
    static _missCross(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
        return `<line x1="${x1a}" y1="${y1a}" x2="${x2a}" y2="${y2a}" stroke="#95a5a6" stroke-width="2" stroke-linecap="round" opacity=".5"/>
                <line x1="${x1b}" y1="${y1b}" x2="${x2b}" y2="${y2b}" stroke="#95a5a6" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
    }

    static _molar(conditions, up) {
        const { f, s } = ToothSVG.resolve(conditions);
        const t = conditions.map(c => c.type);
        const miss = t.includes('missing');
        const op   = miss ? .3 : 1;
        let ex = '';
        if (t.includes('rct')) ex += up
            ? `<line x1="16" y1="28" x2="12" y2="50" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="24" y1="30" x2="24" y2="52" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="32" y1="28" x2="36" y2="50" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`
            : `<line x1="16" y1="28" x2="12" y2="6"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="24" y1="26" x2="24" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="32" y1="28" x2="36" y2="6"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`;
        if (t.includes('fracture'))
            ex += `<path d="M20,${up?8:24} L22,${up?14:30} L18,${up?18:34} L22,${up?24:40}" stroke="#e67e22" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
        if (t.includes('implant'))
            ex += `<rect x="21" y="${up?36:4}" width="6" height="16" rx="2" fill="#27ae60" opacity=".7"/>
                   <line x1="20" y1="${up?40:12}" x2="28" y2="${up?40:12}" stroke="#1a7a48" stroke-width="1"/>
                   <line x1="20" y1="${up?44:16}" x2="28" y2="${up?44:16}" stroke="#1a7a48" stroke-width="1"/>`;
        const crown = up
            ? `<rect x="6" y="4" width="36" height="28" rx="7" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <circle cx="14" cy="10" r="4" fill="${s}" opacity=".25"/><circle cx="28" cy="10" r="4" fill="${s}" opacity=".25"/>
               <circle cx="14" cy="24" r="4" fill="${s}" opacity=".25"/><circle cx="28" cy="24" r="4" fill="${s}" opacity=".25"/>
               <path d="M14,10 Q21,17 28,10 M14,24 Q21,17 28,24" stroke="${s}" stroke-width=".8" fill="none" opacity=".5"/>`
            : `<rect x="6" y="24" width="36" height="28" rx="7" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <circle cx="14" cy="30" r="4" fill="${s}" opacity=".25"/><circle cx="28" cy="30" r="4" fill="${s}" opacity=".25"/>
               <circle cx="14" cy="44" r="4" fill="${s}" opacity=".25"/><circle cx="28" cy="44" r="4" fill="${s}" opacity=".25"/>
               <path d="M14,30 Q21,37 28,30 M14,44 Q21,37 28,44" stroke="${s}" stroke-width=".8" fill="none" opacity=".5"/>`;
        const roots = up
            ? `<path d="M10,32 Q8,44 8,52"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
               <path d="M24,32 Q24,44 24,54" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
               <path d="M38,32 Q40,44 40,52" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
            : `<path d="M14,24 Q12,12 10,4" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
               <path d="M34,24 Q36,12 38,4" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
        return `<svg viewBox="0 0 48 56" width="42" height="48" xmlns="http://www.w3.org/2000/svg" style="display:block">
                  <g opacity="${op}">${crown}${roots}${ex}</g>
                  ${miss ? ToothSVG._missCross(8,8,40,48,40,8,8,48) : ''}
                </svg>`;
    }

    static _premolar(conditions, up) {
        const { f, s } = ToothSVG.resolve(conditions);
        const t = conditions.map(c => c.type);
        const miss = t.includes('missing');
        const op   = miss ? .3 : 1;
        let ex = '';
        if (t.includes('rct')) ex += up
            ? `<line x1="18" y1="28" x2="14" y2="48" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="26" y1="28" x2="30" y2="48" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`
            : `<line x1="18" y1="22" x2="14" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="26" y1="22" x2="30" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`;
        if (t.includes('fracture'))
            ex += `<path d="M22,${up?8:24} L24,${up?16:32} L20,${up?20:36}" stroke="#e67e22" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
        const crown = up
            ? `<path d="M8,6 Q8,4 22,4 Q36,4 36,6 L36,28 Q36,32 22,32 Q8,32 8,28 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <circle cx="15" cy="14" r="4" fill="${s}" opacity=".2"/><circle cx="29" cy="14" r="4" fill="${s}" opacity=".2"/>
               <line x1="22" y1="8" x2="22" y2="28" stroke="${s}" stroke-width=".8" opacity=".4"/>`
            : `<path d="M8,20 Q8,24 22,24 Q36,24 36,20 L36,46 Q36,50 22,50 Q8,50 8,46 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <circle cx="15" cy="36" r="4" fill="${s}" opacity=".2"/><circle cx="29" cy="36" r="4" fill="${s}" opacity=".2"/>
               <line x1="22" y1="24" x2="22" y2="46" stroke="${s}" stroke-width=".8" opacity=".4"/>`;
        const roots = up
            ? `<path d="M10,32 Q8,42 10,50"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
               <path d="M34,32 Q36,42 34,50"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
            : `<path d="M14,20 Q12,10 10,2"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>
               <path d="M30,20 Q32,10 34,2"   stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
        return `<svg viewBox="0 0 44 52" width="38" height="46" xmlns="http://www.w3.org/2000/svg" style="display:block">
                  <g opacity="${op}">${crown}${roots}${ex}</g>
                  ${miss ? ToothSVG._missCross(6,6,38,46,38,6,6,46) : ''}
                </svg>`;
    }

    static _canine(conditions, up) {
        const { f, s } = ToothSVG.resolve(conditions);
        const miss = conditions.some(c => c.type === 'missing');
        const op   = miss ? .3 : 1;
        const crown = up
            ? `<path d="M6,8 Q6,4 19,4 Q32,4 32,8 L32,28 Q32,32 19,32 Q6,32 6,28 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <path d="M13,4 Q19,0 25,4" stroke="${s}" stroke-width="1.5" fill="none"/>
               <line x1="19" y1="4" x2="19" y2="28" stroke="${s}" stroke-width=".8" opacity=".4"/>`
            : `<path d="M6,24 Q6,28 19,28 Q32,28 32,24 L32,48 Q32,52 19,52 Q6,52 6,48 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               <path d="M13,52 Q19,56 25,52" stroke="${s}" stroke-width="1.5" fill="none"/>`;
        const roots = up
            ? `<path d="M19,32 Q17,44 17,54" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
            : `<path d="M19,24 Q17,12 17,2"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
        return `<svg viewBox="0 0 38 56" width="32" height="48" xmlns="http://www.w3.org/2000/svg" style="display:block">
                  <g opacity="${op}">${crown}${roots}</g>
                  ${miss ? ToothSVG._missCross(4,4,34,52,34,4,4,52) : ''}
                </svg>`;
    }

    static _incisor(conditions, up) {
        const { f, s } = ToothSVG.resolve(conditions);
        const t    = conditions.map(c => c.type);
        const miss = t.includes('missing');
        const op   = miss ? .3 : 1;
        const ven  = t.includes('veneer');
        const crown = up
            ? `<path d="M5,8 Q5,4 17,4 Q29,4 29,8 L29,28 Q29,32 17,32 Q5,32 5,28 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               ${ven ? `<path d="M5,8 Q5,4 17,4 Q29,4 29,8 L29,18" stroke="#00bcd4" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>` : ''}
               <line x1="17" y1="4" x2="17" y2="28" stroke="${s}" stroke-width=".6" opacity=".3"/>`
            : `<path d="M5,20 Q5,24 17,24 Q29,24 29,20 L29,44 Q29,48 17,48 Q5,48 5,44 Z" fill="${f}" stroke="${s}" stroke-width="1.5"/>
               ${ven ? `<path d="M5,44 Q5,48 17,48 Q29,48 29,44 L29,34" stroke="#00bcd4" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>` : ''}`;
        const roots = up
            ? `<path d="M17,32 Q15,42 15,50" stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`
            : `<path d="M17,20 Q15,10 15,2"  stroke="${s}" stroke-width="2.5" stroke-linecap="round" fill="none"/>`;
        return `<svg viewBox="0 0 34 52" width="28" height="46" xmlns="http://www.w3.org/2000/svg" style="display:block">
                  <g opacity="${op}">${crown}${roots}</g>
                  ${miss ? ToothSVG._missCross(4,4,30,48,30,4,4,48) : ''}
                </svg>`;
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: DentalChart  – main controller
   Owns all state, UI events, save/load/clear/export.
─────────────────────────────────────────────────────────────────────────────*/
class DentalChart {

    /* ── tooth catalogue (static) ───────────────────────────────────────── */
    static UPPER_META = [
        {fdi:'18',uni:'1', name:'Upper Right 3rd Molar',    type:'molar'},
        {fdi:'17',uni:'2', name:'Upper Right 2nd Molar',    type:'molar'},
        {fdi:'16',uni:'3', name:'Upper Right 1st Molar',    type:'molar'},
        {fdi:'15',uni:'4', name:'Upper Right 2nd Premolar', type:'premolar'},
        {fdi:'14',uni:'5', name:'Upper Right 1st Premolar', type:'premolar'},
        {fdi:'13',uni:'6', name:'Upper Right Canine',       type:'canine'},
        {fdi:'12',uni:'7', name:'Upper Right Lateral',      type:'incisor'},
        {fdi:'11',uni:'8', name:'Upper Right Central',      type:'incisor'},
        {fdi:'21',uni:'9', name:'Upper Left Central',       type:'incisor'},
        {fdi:'22',uni:'10',name:'Upper Left Lateral',       type:'incisor'},
        {fdi:'23',uni:'11',name:'Upper Left Canine',        type:'canine'},
        {fdi:'24',uni:'12',name:'Upper Left 1st Premolar',  type:'premolar'},
        {fdi:'25',uni:'13',name:'Upper Left 2nd Premolar',  type:'premolar'},
        {fdi:'26',uni:'14',name:'Upper Left 1st Molar',     type:'molar'},
        {fdi:'27',uni:'15',name:'Upper Left 2nd Molar',     type:'molar'},
        {fdi:'28',uni:'16',name:'Upper Left 3rd Molar',     type:'molar'},
    ];

    static LOWER_META = [
        {fdi:'48',uni:'32',name:'Lower Right 3rd Molar',    type:'molar'},
        {fdi:'47',uni:'31',name:'Lower Right 2nd Molar',    type:'molar'},
        {fdi:'46',uni:'30',name:'Lower Right 1st Molar',    type:'molar'},
        {fdi:'45',uni:'29',name:'Lower Right 2nd Premolar', type:'premolar'},
        {fdi:'44',uni:'28',name:'Lower Right 1st Premolar', type:'premolar'},
        {fdi:'43',uni:'27',name:'Lower Right Canine',       type:'canine'},
        {fdi:'42',uni:'26',name:'Lower Right Lateral',      type:'incisor'},
        {fdi:'41',uni:'25',name:'Lower Right Central',      type:'incisor'},
        {fdi:'31',uni:'24',name:'Lower Left Central',       type:'incisor'},
        {fdi:'32',uni:'23',name:'Lower Left Lateral',       type:'incisor'},
        {fdi:'33',uni:'22',name:'Lower Left Canine',        type:'canine'},
        {fdi:'34',uni:'21',name:'Lower Left 1st Premolar',  type:'premolar'},
        {fdi:'35',uni:'20',name:'Lower Left 2nd Premolar',  type:'premolar'},
        {fdi:'36',uni:'19',name:'Lower Left 1st Molar',     type:'molar'},
        {fdi:'37',uni:'18',name:'Lower Left 2nd Molar',     type:'molar'},
        {fdi:'38',uni:'17',name:'Lower Left 3rd Molar',     type:'molar'},
    ];

    static COL = {
        healthy:'#27ae60', missing:'#95a5a6', implant:'#27ae60',
        bridge :'#16a085', crown  :'#f39c12', filling:'#3498db',
        rct    :'#8e44ad', veneer :'#00bcd4', decay  :'#e74c3c',
        fracture:'#e67e22',mobility:'#e91e63',abscess:'#ff5722',
    };

    static LBL = {
        healthy:'Healthy', missing:'Missing',  implant:'Implant',
        bridge :'Bridge',  crown  :'Crown',    filling:'Filling',
        rct    :'RCT',     veneer :'Veneer',   decay  :'Decay',
        fracture:'Fracture',mobility:'Mobility',abscess:'Abscess',
    };

    /* ── constructor ────────────────────────────────────────────────────── */
    constructor() {
        this.upperMeta = DentalChart.UPPER_META;
        this.lowerMeta = DentalChart.LOWER_META;
        this.allMeta   = [...this.upperMeta, ...this.lowerMeta];

        /* keyed by FDI string → ToothState */
        this.teeth = {};
        this.allMeta.forEach(m => { this.teeth[m.fdi] = new ToothState(m); });

        /* UI state */
        this.selFDI  = null;
        this.selCond = 'healthy';
        this.selSurf = 'all';
        this.useFDI  = true;

        /* Patient sub-component */
        this.patient = new PatientInfo();

        /* Saved chart name (after first save) */
        this.savedChartName = null;

        /* Tooltip element (already in HTML) */
        this._tip = document.getElementById('dc-tip');
    }

    /* ── init ───────────────────────────────────────────────────────────── */
    init() {
        /* Date */
        _set('dc-pt-date', frappe.datetime.str_to_user(frappe.datetime.get_today()));

        /* Patient link – load patient info and latest chart on change */
        this.patient.onChange(async (patientId) => {
            await this.patient.load(patientId);
            this.savedChartName = null;
            _set('dc-pt-badge', 'New Chart');
            await this._loadLatestChart(patientId);
        });

        /* Provider link – banner is updated live inside PatientInfo constructor */
        this.patient.onProviderChange((_providerId) => {
            /* hook available for future side-effects */
        });

        /* Pre-fill patient from URL param if present */
        const params = frappe.utils.get_query_params();
        if (params.patient) {
            this.patient.setValue(params.patient);
            this.patient.load(params.patient);
            /* Also try to load the most recent chart for this patient */
            this._loadLatestChart(params.patient);
        }

        /* Bind all palette, surface, and detail panel events */
        this._bindPaletteEvents();
        this._bindSurfaceEvents();
        this._bindSurfaceMapEvents();
        this._bindApplyButton();
        this._bindNumberingToggle();
        this._bindTooltip();

        /* Initial render */
        this.render();
    }

    /* ══════════════════════════════════════════════════════════════════════
       DOCTYPE  ──  FETCH (Load from Dental Chart)
    ══════════════════════════════════════════════════════════════════════*/

    /**
     * Load the most recent Dental Chart doc for a patient and populate state.
     * @param {string} patientId
     */
    async _loadLatestChart(patientId) {
        frappe.show_alert({
            message  : 'Loading latest chart…',
            indicator: 'blue',
        });
        try {
            /* Get list of charts for this patient, newest first */
            const list = await frappe.db.get_list('Dental charting', {
                filters : { patient: patientId },
                fields  : ['name', 'chart_date', 'provider', 'clinical_notes', 'treatment_plan'],
                order_by: 'chart_date desc',
                limit   : 1,
            });

            if (!list || !list.length) return;

            const latest = list[0];
            frappe.show_alert({
                message  : `Loading chart: ${latest.name} (${frappe.datetime.str_to_user(latest.chart_date)})`,
                indicator: 'blue',
            });

            await this._loadChartByName(latest.name);

        } catch (err) {
            console.warn('[DentalChart] _loadLatestChart failed:', err);
        }
    }

    /**
     * Fetch a specific Dental Chart doc by name and hydrate all tooth states.
     * @param {string} chartName  e.g. "DCH-00001"
     */
    async _loadChartByName(chartName) {
        try {
            const doc = await frappe.db.get_doc('Dental charting', chartName);

            /* Reset first so stale data is cleared */
            this._resetAllTeeth();

            /* Restore notes */
            const clinicalEl  = document.getElementById('dc-notes-clinical');
            const treatmentEl = document.getElementById('dc-notes-treatment');
            if (clinicalEl)  clinicalEl.value  = doc.clinical_notes  || '';
            if (treatmentEl) treatmentEl.value = doc.treatment_plan  || '';

            /* Restore provider into link control and banner */
            if (doc.provider) {
                this.patient.setProvider(doc.provider);
            }

            /* Restore per-tooth conditions from child table */
            (doc.tooth_conditions || []).forEach(row => {
                const state = this.teeth[row.tooth_fdi];
                if (state) state.loadFromDocRow(row);
            });

            /* Track the loaded chart name */
            this.savedChartName = doc.name;
            _set('dc-pt-badge', doc.name);

            this.render();
            frappe.show_alert({ message: `Chart loaded: ${doc.name}`, indicator: 'green' });

        } catch (err) {
            console.error('[DentalChart] _loadChartByName failed:', err);
            frappe.msgprint({ title: 'Load Error', message: String(err), indicator: 'red' });
        }
    }

    /**
     * Show a dialog listing all saved charts for the current patient
     * so the user can pick one to load.
     */
    async loadChartHistory() {
        const patientId = this.patient.value;
        if (!patientId) {
            frappe.msgprint({ title: 'No Patient', message: 'Select a patient first.', indicator: 'orange' });
            return;
        }

        try {
            const list = await frappe.db.get_list('Dental charting', {
                filters : { patient: patientId },
                fields  : ['name', 'chart_date', 'provider'],
                order_by: 'chart_date desc',
                limit   : 20,
            });

            if (!list || !list.length) {
                frappe.msgprint({ title: 'No Charts Found', message: 'No saved charts for this patient.', indicator: 'orange' });
                return;
            }

            const d = new frappe.ui.Dialog({
                title : 'Select a Chart to Load',
                fields: [{
                    fieldtype: 'HTML',
                    fieldname: 'chart_list_html',
                }],
            });

            const rows = list.map(c =>
                `<div class="hist-item" data-name="${c.name}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #e2e6ea;border-radius:6px;margin-bottom:5px;cursor:pointer;font-size:12px;transition:background .13s;" 
                     onmouseover="this.style.background='#e8f0fe'" onmouseout="this.style.background=''">
                  <span style="font-family:'DM Mono',monospace;font-weight:600">${c.name}</span>
                  <span style="color:#6b7a8d">${frappe.datetime.str_to_user(c.chart_date)}</span>
                  <span style="color:#9aa3af;font-size:11px">by ${c.provider}</span>
                </div>`
            ).join('');

            d.fields_dict.chart_list_html.$wrapper.html(
                `<div style="max-height:340px;overflow-y:auto">${rows}</div>`
            );

            /* Click to load */
            d.fields_dict.chart_list_html.$wrapper.on('click', '.hist-item', async (e) => {
                const name = $(e.currentTarget).data('name');
                d.hide();
                await this._loadChartByName(name);
            });

            d.show();

        } catch (err) {
            console.error('[DentalChart] loadChartHistory failed:', err);
        }
    }

    /* ══════════════════════════════════════════════════════════════════════
       DOCTYPE  ──  SAVE (Insert new chart OR update existing chart)
    ══════════════════════════════════════════════════════════════════════*/

    save() {
        const patientId = this.patient.value || frappe.utils.get_query_params().patient;

        if (!patientId) {
            frappe.msgprint({
                title    : 'No Patient Selected',
                message  : 'Search for and select a patient before saving.',
                indicator: 'orange',
            });
            return;
        }

        /* Build child-table rows – one row per condition per tooth */
        const rows = [];
        this.allMeta.forEach(meta => {
            const state = this.teeth[meta.fdi];
            const arch  = this.upperMeta.includes(meta) ? 'Upper' : 'Lower';

            if (!state.conditions.length) {
                /* Save healthy teeth too so the chart is complete */
                rows.push({
                    doctype          : 'Dental Chart Tooth',
                    tooth_fdi        : state.fdi,
                    tooth_universal  : state.uni,
                    tooth_name_label : state.name,
                    arch,
                    condition        : 'Healthy',
                    surface          : 'All',
                    mobility         : state.mobility,
                    furcation        : state.furcation,
                    sensitivity      : state.sensitivity,
                    notes            : state.notes || '',
                });
            } else {
                state.conditions.forEach(c => {
                    rows.push({
                        doctype          : 'Dental Chart Tooth',
                        tooth_fdi        : state.fdi,
                        tooth_universal  : state.uni,
                        tooth_name_label : state.name,
                        arch,
                        condition        : c.type.charAt(0).toUpperCase() + c.type.slice(1),
                        surface          : c.surface,
                        mobility         : state.mobility,
                        furcation        : state.furcation,
                        sensitivity      : state.sensitivity,
                        notes            : state.notes || '',
                    });
                });
            }
        });

        const providerVal   = this.patient.providerValue || this.patient.provider || '';
        const clinicalNotes = (document.getElementById('dc-notes-clinical')  || {}).value || '';
        const treatmentPlan = (document.getElementById('dc-notes-treatment') || {}).value || '';

        if (this.savedChartName) {
            /* ── UPDATE existing chart ──────────────────────────────────────
               frappe.client.save expects a full doc object including name.
            ────────────────────────────────────────────────────────────────*/
            frappe.call({
                method  : 'frappe.client.save',
                args    : {
                    doc: {
                        doctype         : 'Dental charting',
                        name            : this.savedChartName,
                        patient         : patientId,
                        chart_date      : frappe.datetime.get_today(),
                        provider        : providerVal,
                        clinical_notes  : clinicalNotes,
                        treatment_plan  : treatmentPlan,
                        tooth_conditions: rows,
                    },
                },
                callback: (r) => {
                    if (r.message) {
                        _set('dc-pt-badge', r.message.name);
                        frappe.show_alert({ message: `Updated: ${r.message.name}`, indicator: 'green' });
                    }
                },
            });
        } else {
            /* ── CREATE new chart ───────────────────────────────────────────
               Insert a fresh Dental charting document.
            ────────────────────────────────────────────────────────────────*/
            frappe.call({
                method  : 'frappe.client.insert',
                args    : {
                    doc: {
                        doctype         : 'Dental charting',
                        patient         : patientId,
                        chart_date      : frappe.datetime.get_today(),
                        provider        : providerVal,
                        clinical_notes  : clinicalNotes,
                        treatment_plan  : treatmentPlan,
                        tooth_conditions: rows,
                    },
                },
                callback: (r) => {
                    if (r.message) {
                        this.savedChartName = r.message.name;
                        _set('dc-pt-badge', r.message.name);
                        frappe.show_alert({ message: `Saved: ${r.message.name}`, indicator: 'green' });
                    }
                },
            });
        }
    }

    /* ══════════════════════════════════════════════════════════════════════
       CLEAR / EXPORT
    ══════════════════════════════════════════════════════════════════════*/

    clear() {
        this._resetAllTeeth();
        this.selFDI         = null;
        this.savedChartName = null;
        _set('dc-pt-badge', 'New Chart');
        this.render();
        _set('dc-dp-title', 'No tooth selected');
        _set('dc-dp-sub',   'Click a tooth to view details');
        const ce = document.getElementById('dc-dp-conds');
        if (ce) ce.innerHTML = '<div style="font-size:11px;color:var(--muted2);text-align:center;padding:8px 0">None recorded</div>';
    }

    export() {
        const payload = {
            chart   : this.savedChartName,
            patient : this.patient.value,
            exported: new Date().toISOString(),
            state   : {},
        };
        this.allMeta.forEach(m => {
            const s = this.teeth[m.fdi];
            payload.state[m.fdi] = {
                conditions : s.conditions,
                mobility   : s.mobility,
                furcation  : s.furcation,
                sensitivity: s.sensitivity,
                notes      : s.notes,
            };
        });
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        Object.assign(document.createElement('a'), {
            href    : url,
            download: `dental_chart_${this.patient.value || 'unknown'}.json`,
        }).click();
        URL.revokeObjectURL(url);
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════*/

    render() {
        this._renderArch(this.upperMeta, 'dc-upper-row', true);
        this._renderArch(this.lowerMeta, 'dc-lower-row', false);
        this._renderStats();
        this._renderSummary();
    }

    _renderArch(metaList, containerId, isUpper) {
        const row = document.getElementById(containerId);
        if (!row) return;
        row.innerHTML = '';
        metaList.forEach(meta => {
            row.appendChild(this._buildToothCell(meta, isUpper));
            /* Midline marker after teeth 11 (upper) and 41 (lower) */
            if (['11', '41'].includes(meta.fdi)) {
                const ml = document.createElement('div');
                ml.className = 'midline-marker';
                ml.title     = 'Midline';
                row.appendChild(ml);
            }
        });
    }

    _buildToothCell(meta, isUpper) {
        const state  = this.teeth[meta.fdi];
        const isUp   = isUpper;
        const num    = this.useFDI ? meta.fdi : meta.uni;
        const alt    = this.useFDI ? `U:${meta.uni}` : `FDI:${meta.fdi}`;
        const sel    = this.selFDI === meta.fdi;

        /* Surface dots */
        const dots = ['M','O','D','B','L'].map(sr => {
            const match = state.conditions.find(c => c.surface === sr || c.surface === 'All');
            const col   = match ? DentalChart.COL[match.type] || '#999' : '';
            return `<div class="surf-dot" style="${col ? `background:${col};border-color:${col}` : ''}"></div>`;
        }).join('');

        /* Badge (first condition abbreviation) */
        const fc  = state.conditions[0];
        const bmap= { missing:'✕', rct:'R', crown:'C', implant:'I', decay:'D', filling:'F' };
        const bt  = fc ? (bmap[fc.type] || '') : '';
        const bc  = fc ? DentalChart.COL[fc.type] : '';
        const badge = bt && bc
            ? `<div class="tooth-badge" style="background:${bc};${isUp ? '' : 'bottom:-4px;top:auto'}">${bt}</div>`
            : '';

        const el       = document.createElement('div');
        el.className   = `tooth-cell${sel ? ' selected' : ''}`;
        el.id          = `dct-${meta.fdi}`;

        const numH  = `<div class="tooth-num-fdi">${num}</div><div class="tooth-num-uni">${alt}</div>`;
        const svgH  = `<div class="tooth-svg-wrap">${ToothSVG.render(meta, isUp, state.conditions)}${badge}</div>`;
        const dotH  = `<div class="surface-row">${dots}</div>`;
        el.innerHTML = isUp ? (numH + svgH + dotH) : (dotH + svgH + numH);

        el.addEventListener('click',       ()  => this._selectTooth(meta.fdi));
        el.addEventListener('mouseenter',  (e) => this._showTip(e, meta));
        el.addEventListener('mouseleave',  ()  => this._hideTip());

        return el;
    }

    _renderStats() {
        let h = 0, d = 0, m = 0, cr = 0, rct = 0;
        this.allMeta.forEach(meta => {
            const types = this.teeth[meta.fdi].conditions.map(c => c.type);
            if (!types.length) { h++; return; }
            if (types.includes('missing'))  m++;
            if (types.includes('decay'))    d++;
            if (types.includes('crown'))    cr++;
            if (types.includes('rct'))      rct++;
            if (!types.some(tp => ['missing','decay','crown','rct','filling','fracture','abscess'].includes(tp))) h++;
        });
        _set('dc-st-h',  h);   _set('dc-sb-h',   h);
        _set('dc-st-d',  d);   _set('dc-sb-d',   d);
        _set('dc-st-m',  m);   _set('dc-sb-m',   m);
        _set('dc-st-cr', cr);  _set('dc-sb-cr',  cr);
        _set('dc-sb-rct', rct);
    }

    _renderSummary() {
        const wrap = document.getElementById('dc-summary-wrap');
        if (!wrap) return;
        const rows = [];
        this.allMeta.forEach(meta => {
            this.teeth[meta.fdi].conditions.forEach(c => {
                rows.push(`<tr>
                    <td style="font-family:'DM Mono',monospace;font-weight:600">${meta.fdi}</td>
                    <td style="color:var(--muted)">${meta.name}</td>
                    <td><span style="display:inline-flex;align-items:center;gap:5px">
                        <span style="width:8px;height:8px;border-radius:2px;background:${DentalChart.COL[c.type]||'#999'};display:inline-block"></span>
                        <strong>${DentalChart.LBL[c.type]||c.type}</strong></span></td>
                    <td style="font-family:'DM Mono',monospace;color:var(--muted)">${c.surface}</td>
                    <td style="color:var(--muted)">${this.teeth[meta.fdi].notes || '—'}</td>
                </tr>`);
            });
        });
        wrap.innerHTML = rows.length
            ? `<table class="sum-tbl">
                 <thead><tr><th>FDI</th><th>Name</th><th>Condition</th><th>Surface</th><th>Notes</th></tr></thead>
                 <tbody>${rows.join('')}</tbody>
               </table>`
            : `<div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">No conditions recorded yet</div>`;
    }

    /* ══════════════════════════════════════════════════════════════════════
       DETAIL PANEL
    ══════════════════════════════════════════════════════════════════════*/

    _selectTooth(fdi) {
        this.selFDI = fdi;
        this.render();
        this._renderDetailPanel(fdi);
    }

    _renderDetailPanel(fdi) {
        const meta  = this.allMeta.find(t => t.fdi === fdi);
        if (!meta) return;
        const state = this.teeth[fdi];

        _set('dc-dp-title', `Tooth ${meta.fdi} (U:${meta.uni})`);
        _set('dc-dp-sub',   meta.name);

        /* Conditions list */
        const ce = document.getElementById('dc-dp-conds');
        ce.innerHTML = state.conditions.length
            ? state.conditions.map((c, i) => `
                <div class="cond-tag">
                    <div class="ct-dot" style="background:${DentalChart.COL[c.type]||'#999'}"></div>
                    <span>${DentalChart.LBL[c.type]||c.type}</span>
                    <span style="font-size:10px;color:var(--muted2);font-family:'DM Mono',monospace;margin-left:4px">${c.surface}</span>
                    <span class="ct-rm" data-fdi="${fdi}" data-i="${i}">×</span>
                </div>`).join('')
            : '<div style="font-size:11px;color:var(--muted2);text-align:center;padding:8px 0">None recorded</div>';

        ce.querySelectorAll('.ct-rm').forEach(el => {
            el.addEventListener('click', () => {
                this.teeth[el.dataset.fdi].removeCondition(+el.dataset.i);
                this.render();
                this._renderDetailPanel(el.dataset.fdi);
            });
        });

        /* Measurement selects */
        const bind = (id, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.value    = state[key];
            el.onchange = e => { state[key] = e.target.value; };
        };
        bind('dc-dp-mob',  'mobility');
        bind('dc-dp-furc', 'furcation');
        bind('dc-dp-sens', 'sensitivity');

        /* Tooth notes */
        const notesEl = document.getElementById('dc-dp-notes');
        if (notesEl) {
            notesEl.value  = state.notes || '';
            notesEl.oninput = e => { state.notes = e.target.value; };
        }
    }

    /* ══════════════════════════════════════════════════════════════════════
       APPLY CONDITION
    ══════════════════════════════════════════════════════════════════════*/

    _applyCondition() {
        if (!this.selFDI) {
            frappe.msgprint({ title: 'No Tooth Selected', message: 'Click a tooth first.', indicator: 'orange' });
            return;
        }
        const surf  = this.selSurf === 'all' ? 'All' : this.selSurf.toUpperCase();
        const state = this.teeth[this.selFDI];

        if (this.selCond === 'healthy') {
            state.conditions = [];
        } else {
            state.addCondition(this.selCond, surf);
        }
        this.render();
        this._renderDetailPanel(this.selFDI);
    }

    /* ══════════════════════════════════════════════════════════════════════
       EVENT BINDING
    ══════════════════════════════════════════════════════════════════════*/

    _bindPaletteEvents() {
        document.querySelectorAll('#dc-root .pal-btn[data-cond]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#dc-root .pal-btn[data-cond]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selCond = btn.dataset.cond;
                _set('dc-sb-mode', DentalChart.LBL[this.selCond] || this.selCond);
                if (this.selFDI) this._applyCondition();
            });
        });
    }

    _bindSurfaceEvents() {
        document.querySelectorAll('#dc-root .surf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#dc-root .surf-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selSurf = btn.dataset.surf;
                _set('dc-sb-surf', this.selSurf === 'all' ? 'All' : this.selSurf.toUpperCase());
            });
        });
    }

    _bindSurfaceMapEvents() {
        document.querySelectorAll('#dc-root .sm-cell').forEach(c => {
            c.addEventListener('click', () => c.classList.toggle('active'));
        });
    }

    _bindApplyButton() {
        const btn = document.getElementById('dc-apply-btn');
        if (btn) btn.addEventListener('click', () => this._applyCondition());
    }

    _bindNumberingToggle() {
        const btn = document.getElementById('dc-num-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            this.useFDI = !this.useFDI;
            btn.innerHTML = `<span style="font-size:13px">🔢</span>${this.useFDI ? 'FDI / Universal' : 'Universal / FDI'}`;
            this.render();
            if (this.selFDI) this._renderDetailPanel(this.selFDI);
        });
    }

    _bindTooltip() {
        document.addEventListener('mousemove', e => {
            if (this._tip && this._tip.style.opacity === '1') {
                this._tip.style.left = (e.clientX + 14) + 'px';
                this._tip.style.top  = (e.clientY - 8)  + 'px';
            }
        });
    }

    /* ══════════════════════════════════════════════════════════════════════
       TOOLTIP
    ══════════════════════════════════════════════════════════════════════*/

    _showTip(e, meta) {
        const conds = this.teeth[meta.fdi].conditions;
        const str   = conds.length
            ? conds.map(c => `${DentalChart.LBL[c.type]} (${c.surface})`).join(', ')
            : 'Healthy';
        this._tip.innerHTML  = `<b>${meta.fdi}</b> · ${meta.name}<br><span style="color:#9ca3af;font-size:10px">${str}</span>`;
        this._tip.style.opacity = '1';
        this._tip.style.left = (e.clientX + 14) + 'px';
        this._tip.style.top  = (e.clientY - 8)  + 'px';
    }

    _hideTip() {
        this._tip.style.opacity = '0';
    }

    /* ══════════════════════════════════════════════════════════════════════
       HELPERS
    ══════════════════════════════════════════════════════════════════════*/

    _resetAllTeeth() {
        this.allMeta.forEach(m => this.teeth[m.fdi].reset());
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   Shared DOM util (mirrors original _dcSet)
─────────────────────────────────────────────────────────────────────────────*/
function _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}