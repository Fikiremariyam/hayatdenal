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
   page.add_inner_button("Create Sales Invoice", () => window._dc?.createSalesInvoice(), "Create");
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
#dc-root .dc-pt-badge   { background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:.04em; }
#dc-root .dc-status-select { margin-left:auto;border:none;border-radius:20px;padding:4px 26px 4px 12px;font-size:11px;font-weight:700;letter-spacing:.02em;cursor:pointer;outline:none;font-family:inherit;appearance:none;-webkit-appearance:none;background-repeat:no-repeat;background-position:right 10px center;background-size:9px;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'><path d='M1 1l4 4 4-4' stroke='%23ffffff' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/></svg>"); }
/* sidebar */
#dc-root .pal-section   { padding:11px 12px 7px; }
#dc-root .pal-label     { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2);margin-bottom:7px;display:block; }
#dc-root .pal-sep       { height:1px;background:var(--border);margin:3px 12px 6px; }
#dc-root .pal-btn       { display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;border-radius:7px;border:1.5px solid transparent;background:var(--panel2);cursor:pointer;font-size:12px;font-weight:500;color:var(--text);transition:all .13s;margin-bottom:3px;text-align:left;font-family:inherit; }
#dc-root .pal-btn:hover { border-color:var(--border2);background:#fff; }
#dc-root .pal-btn.active{ border-color:currentColor; }
#dc-root .pal-dot       { width:11px;height:11px;border-radius:3px;flex-shrink:0; }
#dc-root .obs-search    { width:100%;box-sizing:border-box;border:1.5px solid var(--border);border-radius:7px;padding:6px 9px;font-size:12px;font-family:inherit;color:var(--text);background:var(--panel2);outline:none;margin-bottom:7px;transition:border-color .13s; }
#dc-root .obs-search:focus{ border-color:var(--accent); }
#dc-root .obs-list      { max-height:220px;overflow-y:auto;padding-right:2px; }
#dc-root .surf-grid     { display:grid;grid-template-columns:1fr 1fr 1fr;gap:4px;padding:0 12px 10px; }
#dc-root .surf-btn      { padding:5px 2px;border-radius:5px;border:1.5px solid var(--border);background:var(--panel2);font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--muted);cursor:pointer;text-align:center;transition:all .13s; }
#dc-root .surf-btn:hover{ border-color:var(--border2);color:var(--text); }
#dc-root .surf-btn.active{ border-color:var(--accent);color:var(--accent);background:var(--accent-light); }
/* arch */
#dc-root .arch-block    { background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--shadow); }
#dc-root .arch-bar      { background:var(--panel2);border-bottom:1px solid var(--border);padding:7px 14px;display:flex;align-items:center;gap:10px; }
#dc-root .arch-title    { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-family:'DM Mono',monospace; }
#dc-root .dentition-section-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin:4px 2px -2px; }
#dc-root .arch-legend   { display:flex;gap:10px;margin-left:auto; }
#dc-root .al-item       { display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted); }
#dc-root .al-dot        { width:7px;height:7px;border-radius:2px; }
#dc-root .midline-marker{ height:44px;width:2px;background:var(--text);opacity:.55;border-radius:0;margin:0;flex-shrink:0;align-self:flex-end; }
#dc-root .lower-row .midline-marker{ align-self:flex-start; }
#dc-root .grid-side-label{ display:flex;align-items:center;justify-content:center;width:22px;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:var(--muted);flex-shrink:0; }
#dc-root .teeth-row     { display:flex;align-items:flex-end;justify-content:center;padding:14px 6px 7px;gap:0;overflow-x:auto; }
#dc-root .lower-row     { align-items:flex-start; }
/* tooth cell */
#dc-root .tooth-cell    { display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:2px 0 0;border-radius:0;transition:background .12s;position:relative;min-width:44px; }
#dc-root .tooth-cell:hover{ background:rgba(26,110,245,.06); }
#dc-root .tooth-cell.selected{ background:var(--accent-light);outline:2px solid var(--accent);outline-offset:-1px;z-index:1; }
#dc-root .tooth-num-fdi { font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--muted);margin-bottom:2px;line-height:1; }
#dc-root .tooth-num-uni { font-family:'DM Mono',monospace;font-size:8px;color:var(--muted2);margin-bottom:2px;line-height:1; }
#dc-root .lower-row .tooth-num-fdi{ order:3;margin-bottom:0;margin-top:2px; }
#dc-root .lower-row .tooth-num-uni{ order:4; }
#dc-root .tooth-svg-wrap{ position:relative; }
#dc-root .tooth-svg-wrap svg{ display:block; }
#dc-root .tooth-svg-wrap svg [data-surface]{ cursor:pointer; transition:opacity .1s; }
#dc-root .tooth-svg-wrap svg [data-surface]:hover{ opacity:.65; }
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
#dc-root .tp-row-rm       { color:var(--muted2);font-size:13px;line-height:1;opacity:.6;cursor:pointer;transition:opacity .12s; }
#dc-root .tp-row-rm:hover { opacity:1; }
#dc-root .tp-status-sel   { border:1px solid var(--border);background:var(--panel2);font-family:'DM Mono',monospace;font-size:10px;color:var(--text);padding:2px 5px;border-radius:4px;outline:none;cursor:pointer;width:100%; }
#dc-root .tp-toolbar      { display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:10px; }
#dc-root .tp-selall-wrap  { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);margin-right:auto;cursor:pointer; }
#dc-root .tp-selall-wrap input, #dc-root .tp-row-chk { cursor:pointer; }
#dc-root .tp-add-btn      { padding:3px 10px;border-radius:6px;border:1.5px solid var(--accent);background:var(--accent-light);color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;transition:all .13s; }
#dc-root .tp-add-btn:hover:not(:disabled){ background:var(--accent);color:#fff; }
#dc-root .tp-add-btn:disabled { opacity:.35;cursor:not-allowed; }
#dc-root .tp-dup-btn      { border-color:var(--border2);background:var(--panel2);color:var(--text); }
#dc-root .tp-dup-btn:hover:not(:disabled){ border-color:var(--accent);color:var(--accent);background:var(--accent-light); }
#dc-root .tp-del-btn      { border-color:#f5c2c2;background:#fdeeee;color:var(--c-decay); }
#dc-root .tp-del-btn:hover:not(:disabled){ background:var(--c-decay);color:#fff;border-color:var(--c-decay); }
#dc-root .tp-chk-cell     { width:26px;text-align:center; }
#dc-root .tp-idx-cell     { width:26px;text-align:center;color:var(--muted2);font-family:'DM Mono',monospace;font-size:11px; }
#dc-root .tp-svc-ctrl .control-input-wrapper { width:100%; }
#dc-root .tp-svc-ctrl input { font-size:12px !important;padding:3px 6px !important;height:auto !important;border-color:transparent !important;background:transparent !important; }
#dc-root .tp-svc-ctrl input:hover, #dc-root .tp-svc-ctrl input:focus { border-color:var(--border2) !important;background:var(--panel2) !important; }
#dc-root .tp-cell-input   { width:100%;border:1px solid transparent;background:transparent;font-family:inherit;font-size:12px;color:var(--text);padding:2px 4px;border-radius:4px;outline:none; }
#dc-root .tp-cell-input:hover, #dc-root .tp-cell-input:focus { border-color:var(--border2);background:var(--panel2); }
#dc-root .tp-cell-input.tp-price { font-family:'DM Mono',monospace; }
#dc-root .tp-tooth-edit, #dc-root .tp-surf-edit { font-family:'DM Mono',monospace;cursor:pointer; }
#dc-root .tp-date-edit    { font-family:'DM Mono',monospace;font-size:11px; }
/* stat boxes */
#dc-root .stat-grid     { display:grid;grid-template-columns:1fr 1fr;gap:5px; }
#dc-root .stat-box      { background:var(--panel2);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center; }
#dc-root .stat-val      { font-size:18px;font-weight:700;font-family:'DM Mono',monospace;line-height:1; }
#dc-root .stat-lbl      { font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted2); }
/* notes row */
#dc-root .notes-row {   display: flex;    gap: 12px;}

#dc-root .notes-card {flex: 1;    background: var(--panel);    border: 1px solid var(--border);border-radius: 10px;    padding: 12px;}
#dc-root .notes-card-disclaimer { background:#fffaf0;border-color:#f0d9a8; }
#dc-root .notes-card-disclaimer .notes-lbl { color:#b8860b; }
#dc-root .sig-link { color:var(--accent);cursor:pointer;text-decoration:underline;text-decoration-style:dotted;transition:opacity .13s; }
#dc-root .sig-link:hover { opacity:.75; }
#dc-root .notes-lbl     { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:7px;display:block; }
/* signature row */
#dc-root .sig-row       { background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:12px;color:var(--muted); }
#dc-root .sig-row b     { color:var(--text); }
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
    #dc-root .dc-palette,#dc-root .dc-statusbar,#dc-root .dc-pt-bar{ display:none!important; }
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
      <div>Date: <b id="dc-pt-date"></b></div>
    </div>

    <select class="dc-status-select" id="dc-chart-status">
      <option value="Planned">Planned</option>
      <option value="Approved">Approved</option>
      <option value="To Bill">To Bill</option>
      <option value="Billed">Billed</option>
      <option value="Completed">Completed</option>
    </select>

    <div class="dc-pt-badge" id="dc-pt-badge">New Chart</div>
  
    </div>


  <div class="dc-body">

    <!-- LEFT PALETTE -->
    <div class="dc-palette">

      <div class="pal-section">
        <div class="pal-label">Observations</div>
        <input type="text" id="dc-obs-search" class="obs-search" placeholder="Search observations…">
        <div id="dc-obs-list" class="obs-list"></div>
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
          <div class="stat-box"><div class="stat-val" style="color:var(--accent)"    id="dc-st-fl">0</div><div class="stat-lbl">Flagged</div></div>
        </div>
      </div>

    </div><!-- /palette -->

    <!-- MAIN -->
    <div class="dc-main">

      <div class="dentition-section-label">Permanent Dentition</div>

      <!-- UPPER ARCH -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 18–28</div>
          <div class="arch-legend">
            <div class="al-item"><div class="al-dot" style="background:var(--c-decay)"></div>Decay</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-fracture)"></div>Fracture</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-missing)"></div>Missing</div>
            <div class="al-item"><div class="al-dot" style="background:var(--c-implant)"></div>Implant</div>
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

      <div class="dentition-section-label">Primary (Child) Dentition</div>

      <!-- UPPER ARCH (CHILD) -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 55–65</div>
        </div>
        <div class="teeth-row" id="dc-upper-row-child"></div>
      </div>
      <!-- LOWER ARCH (CHILD) -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 85–75</div>
        </div>
        <div class="teeth-row lower-row" id="dc-lower-row-child"></div>
      </div>

      <!-- SUMMARY TABLE -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Condition Summary</div>
          <div style="font-size:10px;color:var(--muted2);margin-left:auto">Edit directly, or add/remove rows below</div>
        </div>
        <div style="padding:10px 14px;overflow-x:auto" id="dc-summary-wrap">
          <div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">
            Click any tooth and apply a condition to begin charting
          </div>
        </div>
      </div>

      <!-- TREATMENT PLAN TABLE -->
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Treatment Plan</div>
          <div style="font-size:10px;color:var(--muted2);margin-left:auto">Add, edit and remove items directly in the table below</div>
        </div>
        <div style="padding:10px 14px;overflow-x:auto" id="dc-tp-wrap"></div>
      </div>

      <!-- NOTES -->
      <div class="notes-row">
        <div class="notes-card">
          <span class="notes-lbl">Clinical Notes</span>
          <textarea class="dp-textarea" id="dc-notes-clinical" rows="3" placeholder="Clinical observations, exam findings…"></textarea>
        </div>
      </div>

      <!-- DISCLAIMER -->
      <div class="notes-row">
        <div class="notes-card notes-card-disclaimer">
          <span class="notes-lbl">Disclaimer</span>
          <textarea class="dp-textarea" id="dc-notes-disclaimer" rows="2" placeholder="Doctor's disclaimer for this chart…"></textarea>
        </div>
      </div>

      <!-- SIGNATURE -->
      <div class="sig-row">
        patient Conscent  &nbsp; <b id="dc-pt-signature" class="sig-link">—</b>
      </div>

    </div>
    <!-- /main -->

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
     * @param {{type:string, label:string, color:string, surface:string}} cond
     */
    addCondition(cond) {
        this.conditions = this.conditions.filter(
            c => !(c.type === cond.type && c.surface === cond.surface)
        );
        if (!cond.uid) cond.uid = 'cond_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        this.conditions.push(cond);
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
     * Populate from a "Condition summary child table" row.
     * @param {Object} row  – one item from doc.condition_summary
     *        Fields: fdi, name1, condition, surface, notes
     * @param {Array}  [catalog] – the Tooth Status catalog, used to recover the
     *        original color for a saved condition label when possible.
     */
    loadFromDocRow(row, catalog = []) {
        const label = row.condition || '';
        if (label && label.toLowerCase() !== 'healthy') {
            const match = catalog.find(s => (s.status_name || s.name) === label);
            this.addCondition({
                type   : match ? match.name : label,
                label  : label,
                color  : match ? (match.color || '#999999') : '#999999',
                surface: row.surface || 'All',
            });
        }
        if (row.notes) this.notes = row.notes;
    }

    /** Serialize to a "Condition summary child table" row object. */
    toDocRow() {
        return {
            doctype  : 'Condition summary child table',
            fdi      : this.fdi,
            name1    : this.name,
            condition: this.conditions[0] ? (this.conditions[0].label || this.conditions[0].type) : 'Healthy',
            surface  : this.conditions[0] ? this.conditions[0].surface : 'All',
            notes    : this.notes || '',
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

        /* Provider (Healthcare Practitioner) link control — bare input, no label */
        this.provider_ctrl = frappe.ui.form.make_control({
            parent: $('.dc-doc-name'),
            df: {
                fieldtype  : 'Link',
                options    : 'Healthcare Practitioner',
                fieldname  : 'provider',
                placeholder: 'Search provider name or ID…',
            },
            only_input  : true,
            render_input: true,
        });

        this.provider_ctrl.$input.on('change', () => {
            const providerVal = this.provider_ctrl.get_value();
            if (providerVal) {
                this.provider = providerVal;
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
        } catch (err) {
            console.warn('[DentalChart] PatientInfo.load failed:', err);
        }
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
        return ToothSVG._grid(conditions);
    }

    /**
     * Dentally-style surface-grid tooth: a plain square divided into
     * 4 outer triangles (Buccal/Facial, Distal, Lingual/Palatal, Mesial)
     * around a small center square (Occlusal/Incisal). Every tooth —
     * molar or incisor — renders as the same uniform square so the
     * whole arch reads as one continuous grid, matching a classic
     * odontogram / surface-chart layout.
     */
    static _grid(conditions) {
        const SZ   = 44;
        const HALF = SZ / 2;
        const OSZ  = 16;                 // center occlusal square size
        const OOFF = (SZ - OSZ) / 2;

        const isMissing = conditions.some(c => (c.label || c.type || '').toLowerCase() === 'missing');

        const colorFor = (surfaceKey) => {
            const match = conditions.find(c => c.surface === surfaceKey || c.surface === 'All');
            return match ? (match.color || '#999999') : null;
        };

        const region = (surfaceKey, tag, geom) => {
            const color = colorFor(surfaceKey);
            const fill        = color || '#ffffff';
            const fillOpacity = color ? '0.30' : '1';
            const stroke      = color || '#c8cfd8';
            return `<${tag} data-surface="${surfaceKey}" ${geom} fill="${fill}" fill-opacity="${fillOpacity}" stroke="${stroke}" stroke-width="1"/>`;
        };

        const gridLines = isMissing ? '' : `
            ${region('B', 'polygon', `points="0,0 ${SZ},0 ${HALF},${HALF}"`)}
            ${region('D', 'polygon', `points="${SZ},0 ${SZ},${SZ} ${HALF},${HALF}"`)}
            ${region('L', 'polygon', `points="${SZ},${SZ} 0,${SZ} ${HALF},${HALF}"`)}
            ${region('M', 'polygon', `points="0,${SZ} 0,0 ${HALF},${HALF}"`)}
            ${region('O', 'rect', `x="${OOFF}" y="${OOFF}" width="${OSZ}" height="${OSZ}"`)}`;

        const missMarks = isMissing
            ? `<rect data-surface="All" x="0" y="0" width="${SZ}" height="${SZ}" fill="#f3f4f6"/>
               <line x1="4" y1="4" x2="${SZ-4}" y2="${SZ-4}" stroke="#b0bec5" stroke-width="2" stroke-linecap="round" pointer-events="none"/>
               <line x1="${SZ-4}" y1="4" x2="4" y2="${SZ-4}" stroke="#b0bec5" stroke-width="2" stroke-linecap="round" pointer-events="none"/>`
            : '';

        return `<svg viewBox="0 0 ${SZ} ${SZ}" width="40" height="40" xmlns="http://www.w3.org/2000/svg" style="display:block">
                  ${gridLines}
                  ${missMarks}
                  <rect x="0" y="0" width="${SZ}" height="${SZ}" fill="none" stroke="var(--border2)" stroke-width="1" pointer-events="none"/>
                </svg>`;
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

    /* Primary / deciduous (child) dentition — FDI 51–65, 71–85, Universal letters A–T */
    static UPPER_META_CHILD = [
        {fdi:'55',uni:'A',name:'Upper Right 2nd Primary Molar', type:'molar'},
        {fdi:'54',uni:'B',name:'Upper Right 1st Primary Molar', type:'molar'},
        {fdi:'53',uni:'C',name:'Upper Right Primary Canine',    type:'canine'},
        {fdi:'52',uni:'D',name:'Upper Right Primary Lateral',   type:'incisor'},
        {fdi:'51',uni:'E',name:'Upper Right Primary Central',   type:'incisor'},
        {fdi:'61',uni:'F',name:'Upper Left Primary Central',    type:'incisor'},
        {fdi:'62',uni:'G',name:'Upper Left Primary Lateral',    type:'incisor'},
        {fdi:'63',uni:'H',name:'Upper Left Primary Canine',     type:'canine'},
        {fdi:'64',uni:'I',name:'Upper Left 1st Primary Molar',  type:'molar'},
        {fdi:'65',uni:'J',name:'Upper Left 2nd Primary Molar',  type:'molar'},
    ];

    static LOWER_META_CHILD = [
        {fdi:'85',uni:'T',name:'Lower Right 2nd Primary Molar', type:'molar'},
        {fdi:'84',uni:'S',name:'Lower Right 1st Primary Molar', type:'molar'},
        {fdi:'83',uni:'R',name:'Lower Right Primary Canine',    type:'canine'},
        {fdi:'82',uni:'Q',name:'Lower Right Primary Lateral',   type:'incisor'},
        {fdi:'81',uni:'P',name:'Lower Right Primary Central',   type:'incisor'},
        {fdi:'71',uni:'O',name:'Lower Left Primary Central',    type:'incisor'},
        {fdi:'72',uni:'N',name:'Lower Left Primary Lateral',    type:'incisor'},
        {fdi:'73',uni:'M',name:'Lower Left Primary Canine',     type:'canine'},
        {fdi:'74',uni:'L',name:'Lower Left 1st Primary Molar',  type:'molar'},
        {fdi:'75',uni:'K',name:'Lower Left 2nd Primary Molar',  type:'molar'},
    ];

    /* Which tooth the midline divider goes after, per dentition */
    static MIDLINE_AFTER = {
        permanent: ['11', '41'],
        primary  : ['51', '81'],
    };

    /* Colors for the overall chart status pill in the top bar */
    static STATUS_COLORS = {
        'Planned'   : '#f39c12',
        'Approved'  : '#3498db',
        'To Bill'   : '#8e44ad',
        'Billed'    : '#16a085',
        'Completed' : '#27ae60',
    };


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
        /* Treatment plan items: [{ id, fdi, toothLabel, service, serviceId, price, surface, status, date }] */
        this.treatmentPlan  = [];
        /* Row ids currently checked in the treatment plan grid (for bulk delete/duplicate) */
        this.selectedIds    = new Set();
        /* Condition (uid) currently checked in the Condition Summary grid */
        this.summarySelectedIds = new Set();

        /* Both dentitions are always kept and always shown side by side */
        this.teethSets = { permanent: {}, primary: {} };
        [...DentalChart.UPPER_META, ...DentalChart.LOWER_META]
            .forEach(m => { this.teethSets.permanent[m.fdi] = new ToothState(m); });
        [...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD]
            .forEach(m => { this.teethSets.primary[m.fdi] = new ToothState(m); });

        /* Observations catalog, fetched from the "Tooth Status" doctype */
        this.toothStatusCatalog = [];
        /* Currently selected observation: { id, label, color, isHealthy } */
        this.selStatus = null;
        /* Live search filter for the observations list */
        this.obsSearchTerm = '';

        /* UI state */
        this.selFDI  = null;
        this.selSurf = 'all';
        this.useFDI  = true;

        /* Patient sub-component */
        this.patient = new PatientInfo();

        /* Saved chart name (after first save) */
        this.savedChartName = null;

        /* Overall chart status shown in the top bar */
        this.chartStatus = 'Planned';

        /* Tooltip element (already in HTML) */
        this._tip = document.getElementById('dc-tip');
    }

    /** All permanent + primary teeth combined — both dentitions are always shown together. */
    get allMeta() {
        return [
            ...DentalChart.UPPER_META,       ...DentalChart.LOWER_META,
            ...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD,
        ];
    }
    /** ToothState dict across both dentitions, keyed by FDI (codes never collide between the two). */
    get teeth() { return { ...this.teethSets.permanent, ...this.teethSets.primary }; }


    /* ── init ───────────────────────────────────────────────────────────── */
    init() {
        /* Date */
        _set('dc-pt-date', frappe.datetime.str_to_user(frappe.datetime.get_today()));

        /* Patient link – load patient info and latest chart on change */
        this.patient.onChange(async (patientId) => {
            await this.patient.load(patientId);
            this.savedChartName = null;
            this.chartStatus    = 'Planned';
            _set('dc-pt-badge', 'New Chart');
            this._renderChartStatus();
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

        /* Bind all palette and surface events */
        this._loadToothStatuses();
        this._bindObservationSearch();
        this._bindSurfaceEvents();
        this._bindNumberingToggle();
        this._bindTooltip();
        this._bindChartStatus();
        this._renderChartStatus();
        this._bindSignatureLink();

        /* Initial render */
        this.render();
    }

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
                fields  : ['name', 'chart_date', 'provider', 'clinical_notes'],
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

            /* Reset first so stale data is cleared (both dentitions) */
            this._resetAllTeeth();
            this.treatmentPlan     = [];
            this.selectedIds       = new Set();
            this.summarySelectedIds = new Set();

            /* Make sure the observation catalog is available so saved condition
               labels can be matched back to their original color. */
            if (!this.toothStatusCatalog.length) {
                await this._loadToothStatuses();
            }

            /* Restore notes */
            const clinicalEl = document.getElementById('dc-notes-clinical');
            if (clinicalEl) clinicalEl.value = doc.clinical_notes || '';

            const disclaimerEl = document.getElementById('dc-notes-disclaimer');
            if (disclaimerEl) disclaimerEl.value = doc.disclaimer || '';   // ← adjust fieldname here if your doctype differs

            /* Restore treatment plan — a real child table (fieldname: treatment_plan)
               Fields: tooth_fdi, service, surface, price, status, date */
            const fullMeta = [
                ...DentalChart.UPPER_META,       ...DentalChart.LOWER_META,
                ...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD,
            ];
            this.treatmentPlan = await Promise.all((doc.treatment_plan || []).map(async row => {
                const fdi  = row.tooth_fdi || '00';
                const meta = fullMeta.find(m => m.fdi === fdi);

                /* Only the Link id (an Item code) is stored — fetch its label for display */
                let serviceLabel = row.service || '';
                if (row.service) {
                    try {
                        const res = await frappe.db.get_value('Item', row.service, 'item_name');
                        serviceLabel = (res && res.message && res.message.item_name) || row.service;
                    } catch (e) {
                        console.warn('[DentalChart] Could not resolve item label for', row.service, e);
                    }
                }

                return {
                    id        : 'tp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    fdi       : fdi,
                    toothLabel: fdi === '00' ? 'General (non-tooth-specific)' : (meta ? meta.name : fdi),
                    service   : serviceLabel,
                    serviceId : row.service || null,
                    price     : parseFloat(row.price) || 0,
                    surface   : row.surface || 'All',
                    status    : row.status || 'Planned',
                    date      : row.date || frappe.datetime.get_today(),
                };
            }));

            /* Restore provider into link control and banner */
            if (doc.provider) {
                this.patient.setProvider(doc.provider);
            }

            /* Restore per-tooth conditions — a real child table (fieldname: condition_summary).
               Fields: fdi, name1, condition, surface, notes.
               Look across both dentition sets since permanent/primary FDI codes never overlap. */
            (doc.condition_summary || []).forEach(row => {
                const state = this.teethSets.permanent[row.fdi] || this.teethSets.primary[row.fdi];
                if (state) state.loadFromDocRow(row, this.toothStatusCatalog);
            });

            /* Track the loaded chart name and status */
            this.savedChartName = doc.name;
            this.chartStatus    = doc.status && DentalChart.STATUS_COLORS[doc.status] ? doc.status : 'Planned';
            _set('dc-pt-badge', doc.name);
            this._renderChartStatus();

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

    async save() {
        const patientId = this.patient.value || frappe.utils.get_query_params().patient;

        if (!patientId) {
            frappe.msgprint({
                title    : 'No Patient Selected',
                message  : 'Search for and select a patient before saving.',
                indicator: 'orange',
            });
            return;
        }

        /* Build "Condition summary" child-table rows – one row per condition
           per tooth, across BOTH dentitions (permanent + primary), since FDI
           codes never collide between the two sets.
           Fields: fdi, name1, condition, surface, notes */
        const conditionRows = [];
        const fullMeta = [
            ...DentalChart.UPPER_META,       ...DentalChart.LOWER_META,
            ...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD,
        ];

        fullMeta.forEach(meta => {
            const state = this.teethSets.permanent[meta.fdi] || this.teethSets.primary[meta.fdi];
            if (!state) return;

            if (!state.conditions.length) {
                /* Save healthy teeth too so the chart is complete */
                conditionRows.push({
                    doctype  : 'Condition summary child table',
                    fdi      : state.fdi,
                    name1    : state.name,
                    condition: 'Healthy',
                    surface  : 'All',
                    notes    : state.notes || '',
                });
            } else {
                state.conditions.forEach(c => {
                    conditionRows.push({
                        doctype  : 'Condition summary child table',
                        fdi      : state.fdi,
                        name1    : state.name,
                        condition: c.label || c.type,
                        surface  : c.surface,
                        notes    : state.notes || '',
                    });
                });
            }
        });

        /* Build "Treatment plan" child-table rows.
           Fields: tooth_fdi, service, surface, price, status, date */
        const treatmentPlanRows = this.treatmentPlan.map(t => ({
            doctype  : 'Treatment plan',
            tooth_fdi: t.fdi,
            service  : t.serviceId || undefined,
            surface  : t.surface,
            price    : t.price,
            status   : t.status,
            date     : t.date,
        }));

        const providerVal    = this.patient.providerValue || this.patient.provider || '';
        const clinicalNotes  = (document.getElementById('dc-notes-clinical')   || {}).value || '';
        const disclaimerText = (document.getElementById('dc-notes-disclaimer') || {}).value || '';

        try {
            if (this.savedChartName) {
                /* ── UPDATE existing chart ──────────────────────────────────────
                   frappe.client.save needs the FULL document — saving a partial
                   object here was the bug: fields we don't manage (or even ones
                   we do, on some Frappe versions) would get wiped out instead of
                   updated. Fetch the real doc first, mutate it, then save it whole.
                ────────────────────────────────────────────────────────────────*/
                const existing = await frappe.db.get_doc('Dental charting', this.savedChartName);
                existing.patient           = patientId;
                existing.chart_date        = frappe.datetime.get_today();
                existing.provider          = providerVal;
                existing.status            = this.chartStatus;
                existing.clinical_notes    = clinicalNotes;
                existing.disclaimer        = disclaimerText;   // ← adjust fieldname here if your doctype differs
                existing.treatment_plan    = treatmentPlanRows;
                existing.condition_summary = conditionRows;

                frappe.call({
                    method  : 'frappe.client.save',
                    args    : { doc: existing },
                    callback: (r) => {
                        if (r.message) {
                            _set('dc-pt-badge', r.message.name);
                            frappe.show_alert({ message: `Updated: ${r.message.name}`, indicator: 'green' });
                        }
                    },
                    error: (r) => {
                        console.error('[DentalChart] save (update) failed:', r);
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
                            doctype          : 'Dental charting',
                            patient          : patientId,
                            chart_date       : frappe.datetime.get_today(),
                            provider         : providerVal,
                            status           : this.chartStatus,
                            clinical_notes   : clinicalNotes,
                            disclaimer       : disclaimerText,   // ← adjust fieldname here if your doctype differs
                            treatment_plan   : treatmentPlanRows,
                            condition_summary: conditionRows,
                        },
                    },
                    callback: (r) => {
                        if (r.message) {
                            this.savedChartName = r.message.name;
                            _set('dc-pt-badge', r.message.name);
                            frappe.show_alert({ message: `Saved: ${r.message.name}`, indicator: 'green' });
                        }
                    },
                    error: (r) => {
                        console.error('[DentalChart] save (insert) failed:', r);
                    },
                });
            }
        } catch (err) {
            console.error('[DentalChart] save failed:', err);
            frappe.msgprint({ title: 'Save Error', message: String(err), indicator: 'red' });
        }
    }

    /* ══════════════════════════════════════════════════════════════════════
       CLEAR / EXPORT
    ══════════════════════════════════════════════════════════════════════*/

    clear() {
        this._resetAllTeeth();
        this.selFDI             = null;
        this.savedChartName     = null;
        this.treatmentPlan      = [];
        this.selectedIds        = new Set();
        this.summarySelectedIds = new Set();
        this.chartStatus        = 'Planned';
        _set('dc-pt-badge', 'New Chart');
        this._renderChartStatus();
        this.render();
    }

    export() {
        const payload = {
            chart        : this.savedChartName,
            patient      : this.patient.value,
            exported     : new Date().toISOString(),
            treatmentPlan: this.treatmentPlan,
            state        : {},
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

    /**
     * Build a new, unsaved Sales Invoice prefilled with one line per
     * treatment plan item (service, tooth/surface as description, price).
     * Opens the standard Sales Invoice form so the person can review and
     * save it themselves — rather than inserting blind, which could fail
     * on mandatory fields we can't predict (tax templates, price lists,
     * cost centers, etc).
     */
    async createSalesInvoice() {
        const patientId = this.patient.value || frappe.utils.get_query_params().patient;

        if (!patientId) {
            frappe.msgprint({ title: 'No Patient Selected', message: 'Select a patient before creating an invoice.', indicator: 'orange' });
            return;
        }

        const completedItems = this.treatmentPlan.filter(t => t.status === 'Completed');

        if (!this.treatmentPlan.length) {
            frappe.msgprint({ title: 'Treatment Plan Empty', message: 'Add at least one item to the treatment plan first.', indicator: 'orange' });
            return;
        }
        if (!completedItems.length) {
            frappe.msgprint({
                title    : 'No Completed Items',
                message  : 'Only items marked "Completed" in the treatment plan are billed. Mark the relevant rows as Completed first.',
                indicator: 'orange',
            });
            return;
        }

        /* Patients are often linked to a Customer record for billing — use it if present */
        let customerId = null;
        try {
            const res = await frappe.db.get_value('Patient', patientId, 'customer');
            customerId = res && res.message ? res.message.customer : null;
        } catch (err) {
            console.warn('[DentalChart] Could not resolve a linked customer for patient', patientId, err);
        }

        const planItems = completedItems;

        /* The Service field is now a direct Link to Item, so t.serviceId is
           already a real Item code — but double-check existence anyway as a
           safety net (e.g. against any stale data saved before this Item
           link was introduced). Setting an item_code that doesn't exist as
           a real Item crashes ERPNext's price-list lookup, so we never want
           to hand over an unverified code. */
        const itemExistsCache = {};
        for (const t of planItems) {
            if (!t.serviceId || Object.prototype.hasOwnProperty.call(itemExistsCache, t.serviceId)) continue;
            try {
                itemExistsCache[t.serviceId] = !!(await frappe.db.exists('Item', t.serviceId));
            } catch (err) {
                console.warn('[DentalChart] Could not verify Item', t.serviceId, err);
                itemExistsCache[t.serviceId] = false;
            }
        }

        let anyMissingItemCode = false;

        frappe.new_doc('Sales Invoice', {}, (doc) => {
            if (customerId) doc.customer = customerId;

            planItems.forEach(t => {
                const row = frappe.model.add_child(doc, 'Sales Invoice Item', 'items');
                const validItemCode = t.serviceId && itemExistsCache[t.serviceId];

                if (validItemCode) {
                    row.item_code = t.serviceId;
                } else {
                    anyMissingItemCode = true;
                }

                row.item_name   = t.service || 'Service';
                row.description = 'Tooth ' + (t.fdi === '00' ? 'General' : t.fdi)
                    + (t.surface && t.surface !== 'All' ? ` · Surface ${t.surface}` : '')
                    + (t.status ? ` · ${t.status}` : '');
                row.qty  = 1;
                row.rate = t.price || 0;
            });
        });

        if (anyMissingItemCode) {
            frappe.msgprint({
                title    : 'Select Items Manually',
                message  : 'One or more treatment plan rows aren\'t linked to a valid Item, so those rows were left without an Item Code. Please pick the correct Item for those rows before saving — leaving an invalid code in place can crash the price list lookup.',
                indicator: 'orange',
            });
        } else {
            frappe.show_alert({ message: `Draft Sales Invoice created from ${planItems.length} completed item(s) — review and save.`, indicator: 'blue' });
        }
    }

    /**
     * Clicking the "patient signature" label opens a Consent Form for the
     * current patient — either an existing one, or a fresh unsaved draft
     * prefilled with the patient.
     * ← Assumes a doctype named "Patient Consent Form" with a `patient`
     *   Link field; adjust CONSENT_FORM_DOCTYPE below if yours differs.
     */
    _bindSignatureLink() {
        const el = document.getElementById('dc-pt-signature');
        if (!el) return;
        el.addEventListener('click', async () => {
            const patientId = this.patient.value || frappe.utils.get_query_params().patient;
            if (!patientId) {
                frappe.msgprint({ title: 'No Patient Selected', message: 'Select a patient first.', indicator: 'orange' });
                return;
            }

            const CONSENT_FORM_DOCTYPE = 'Consent form';   // ← adjust if your doctype is named differently

            try {
                const existing = await frappe.db.get_list(CONSENT_FORM_DOCTYPE, {
                    filters : { patient: patientId },
                    fields  : ['name'],
                    order_by: 'creation desc',
                    limit   : 1,
                });
                if (existing && existing.length) {
                    frappe.set_route('Form', CONSENT_FORM_DOCTYPE, existing[0].name);
                } else {
                    frappe.new_doc(CONSENT_FORM_DOCTYPE, { patient: patientId });
                }
            } catch (err) {
                console.error('[DentalChart] Could not open consent form:', err);
                frappe.msgprint({
                    title    : 'Consent Form Not Found',
                    message  : `Check that a "${CONSENT_FORM_DOCTYPE}" doctype exists in this system.`,
                    indicator: 'red',
                });
            }
        });
    }

    /* ══════════════════════════════════════════════════════════════════════
       RENDER
    ══════════════════════════════════════════════════════════════════════*/

    render() {
        this._renderArch(DentalChart.UPPER_META,       'dc-upper-row',       true,  'permanent');
        this._renderArch(DentalChart.LOWER_META,       'dc-lower-row',       false, 'permanent');
        this._renderArch(DentalChart.UPPER_META_CHILD, 'dc-upper-row-child', true,  'primary');
        this._renderArch(DentalChart.LOWER_META_CHILD, 'dc-lower-row-child', false, 'primary');
        this._renderStats();
        this._renderSummary();
        this._renderTreatmentPlan();
    }

    _renderArch(metaList, containerId, isUpper, dentitionKey) {
        const row = document.getElementById(containerId);
        if (!row) return;
        row.innerHTML = '';

        const rLabel = document.createElement('div');
        rLabel.className   = 'grid-side-label';
        rLabel.textContent = 'R';
        row.appendChild(rLabel);

        metaList.forEach(meta => {
            row.appendChild(this._buildToothCell(meta, isUpper));
            /* Midline marker after the last tooth of the right side (varies by dentition) */
            if (DentalChart.MIDLINE_AFTER[dentitionKey].includes(meta.fdi)) {
                const ml = document.createElement('div');
                ml.className = 'midline-marker';
                ml.title     = 'Midline';
                row.appendChild(ml);
            }
        });

        const lLabel = document.createElement('div');
        lLabel.className   = 'grid-side-label';
        lLabel.textContent = 'L';
        row.appendChild(lLabel);
    }

    _buildToothCell(meta, isUpper) {
        const state  = this.teeth[meta.fdi];
        const isUp   = isUpper;
        const num    = this.useFDI ? meta.fdi : meta.uni;
        const alt    = this.useFDI ? `U:${meta.uni}` : `FDI:${meta.fdi}`;
        const sel    = this.selFDI === meta.fdi;

        /* Badge (first condition's initial, colored to match) */
        const fc    = state.conditions[0];
        const badge = fc
            ? `<div class="tooth-badge" style="background:${fc.color || '#999'};${isUp ? '' : 'bottom:-4px;top:auto'}">${(fc.label || fc.type || '?').charAt(0).toUpperCase()}</div>`
            : '';

        const el       = document.createElement('div');
        el.className   = `tooth-cell${sel ? ' selected' : ''}`;
        el.id          = `dct-${meta.fdi}`;

        const numH  = `<div class="tooth-num-fdi">${num}</div><div class="tooth-num-uni">${alt}</div>`;
        const svgH  = `<div class="tooth-svg-wrap">${ToothSVG.render(meta, isUp, state.conditions)}${badge}</div>`;
        el.innerHTML = isUp ? (numH + svgH) : (svgH + numH);

        /* Whole-cell click just selects the tooth (used as the default
           tooth for new treatment plan rows, and for the tooltip). */
        el.addEventListener('click',       ()  => this._selectTooth(meta.fdi));
        el.addEventListener('mouseenter',  (e) => this._showTip(e, meta));
        el.addEventListener('mouseleave',  ()  => this._hideTip());

        /* Each surface region of the tooth diagram is individually
           clickable: clicking a side applies the currently selected
           observation to exactly that surface, right on the diagram. */
        el.querySelectorAll('[data-surface]').forEach(region => {
            region.addEventListener('click', (e) => {
                e.stopPropagation();
                this._applyToSurface(meta.fdi, region.dataset.surface);
            });
        });

        return el;
    }

    _renderStats() {
        let healthy = 0, flagged = 0;
        this.allMeta.forEach(meta => {
            if (this.teeth[meta.fdi].conditions.length) flagged++;
            else healthy++;
        });
        _set('dc-st-h',  healthy);
        _set('dc-st-fl', flagged);
    }

    _renderSummary() {
        const wrap = document.getElementById('dc-summary-wrap');
        if (!wrap) return;

        const toothOptions   = this.allMeta.map(m => m.fdi);
        const surfaceOptions = ['All', 'M', 'O', 'D', 'B', 'L'];

        /* Flatten every condition across the current dentition into rows */
        const flat = [];
        this.allMeta.forEach(meta => {
            this.teeth[meta.fdi].conditions.forEach(c => {
                flat.push({ fdi: meta.fdi, toothLabel: meta.name, cond: c });
            });
        });

        const nSel = this.summarySelectedIds.size;
        const allChecked = flat.length > 0 && nSel === flat.length;

        const rows = flat.map((r, idx) => `
            <tr>
                <td class="tp-chk-cell"><input type="checkbox" class="cs-row-chk" data-uid="${r.cond.uid}" ${this.summarySelectedIds.has(r.cond.uid) ? 'checked' : ''}></td>
                <td class="tp-idx-cell">${idx + 1}</td>
                <td>
                    <select class="tp-cell-input cs-tooth-edit" data-uid="${r.cond.uid}">
                        ${toothOptions.map(fdi => `<option value="${fdi}" ${fdi === r.fdi ? 'selected' : ''}>${fdi}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="tp-cell-input cs-obs-edit" data-uid="${r.cond.uid}">
                        <option value="">— Select —</option>
                        ${this.toothStatusCatalog.map(s => `<option value="${s.name}" ${s.name === r.cond.type ? 'selected' : ''}>${s.status_name || s.name}</option>`).join('')}
                    </select>
                </td>
                <td>
                    <select class="tp-cell-input cs-surf-edit" data-uid="${r.cond.uid}">
                        ${surfaceOptions.map(s => `<option ${s === r.cond.surface ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td><input type="text" class="tp-cell-input cs-notes-edit" data-fdi="${r.fdi}" value="${(this.teeth[r.fdi].notes || '').replace(/"/g, '&quot;')}" placeholder="Notes…"></td>
                <td><span class="tp-row-rm cs-row-rm" data-uid="${r.cond.uid}" title="Delete row">🗑</span></td>
            </tr>`).join('');

        wrap.innerHTML = `
            <div class="tp-toolbar">
                <label class="tp-selall-wrap">
                    <input type="checkbox" id="dc-cs-select-all" ${allChecked ? 'checked' : ''} ${flat.length ? '' : 'disabled'}>
                    <span>Select All</span>
                </label>
                <button class="tp-add-btn" id="dc-cs-add-row-btn">＋ Add Row</button>
                <button class="tp-add-btn tp-dup-btn" id="dc-cs-dup-btn" ${nSel ? '' : 'disabled'}>⧉ Duplicate${nSel ? ` (${nSel})` : ''}</button>
                <button class="tp-add-btn tp-del-btn" id="dc-cs-del-btn" ${nSel ? '' : 'disabled'}>🗑 Delete${nSel ? ` (${nSel})` : ''}</button>
            </div>
            ${flat.length ? `
            <table class="sum-tbl tp-grid">
                <thead>
                    <tr>
                        <th style="width:26px"></th>
                        <th style="width:26px">#</th>
                        <th style="width:70px">Tooth</th>
                        <th>Observation</th>
                        <th style="width:70px">Surface</th>
                        <th>Notes</th>
                        <th style="width:26px"></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>` : `<div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">No conditions recorded yet — click "＋ Add Row" to start</div>`}
        `;

        this._bindConditionSummaryEvents();
    }

    /** Find a condition (and its owning ToothState) by its uid, across the current dentition. */
    _findConditionByUid(uid) {
        for (const meta of this.allMeta) {
            const state = this.teeth[meta.fdi];
            const cond  = state.conditions.find(c => c.uid === uid);
            if (cond) return { state, cond, fdi: meta.fdi };
        }
        return null;
    }

    _bindConditionSummaryEvents() {
        const wrap = document.getElementById('dc-summary-wrap');
        if (!wrap) return;

        const addBtn = document.getElementById('dc-cs-add-row-btn');
        if (addBtn) addBtn.addEventListener('click', () => this._addBlankConditionRow());

        const dupBtn = document.getElementById('dc-cs-dup-btn');
        if (dupBtn) dupBtn.addEventListener('click', () => this._duplicateSelectedConditions());

        const delBtn = document.getElementById('dc-cs-del-btn');
        if (delBtn) delBtn.addEventListener('click', () => this._deleteSelectedConditions());

        const selAll = document.getElementById('dc-cs-select-all');
        if (selAll) selAll.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.allMeta.forEach(meta => this.teeth[meta.fdi].conditions.forEach(c => this.summarySelectedIds.add(c.uid)));
            } else {
                this.summarySelectedIds.clear();
            }
            this._renderSummary();
        });

        wrap.querySelectorAll('.cs-row-chk').forEach(el => {
            el.addEventListener('change', (e) => {
                if (e.target.checked) this.summarySelectedIds.add(el.dataset.uid);
                else this.summarySelectedIds.delete(el.dataset.uid);
                this._renderSummary();
            });
        });

        wrap.querySelectorAll('.cs-row-rm').forEach(el => {
            el.addEventListener('click', () => this._removeConditionByUid(el.dataset.uid));
        });

        wrap.querySelectorAll('.cs-tooth-edit').forEach(el => {
            el.addEventListener('change', (e) => this._moveConditionTooth(el.dataset.uid, e.target.value));
        });

        wrap.querySelectorAll('.cs-obs-edit').forEach(el => {
            el.addEventListener('change', (e) => this._setConditionObservation(el.dataset.uid, e.target.value));
        });

        wrap.querySelectorAll('.cs-surf-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const found = this._findConditionByUid(el.dataset.uid);
                if (found) { found.cond.surface = e.target.value; this.render(); }
            });
        });

        wrap.querySelectorAll('.cs-notes-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const state = this.teeth[el.dataset.fdi];
                if (state) state.notes = e.target.value;
                this._renderSummary();   // other rows for the same tooth show the same notes value
            });
        });
    }

    /** "+ Add Row" — a blank, unassigned observation waiting to be picked. */
    _addBlankConditionRow() {
        const fdi = this.selFDI || (this.allMeta[0] && this.allMeta[0].fdi);
        if (!fdi) return;
        this.teeth[fdi].addCondition({ type: '', label: '— Select —', color: '#c8cfd8', surface: 'All' });
        this.render();
    }

    _removeConditionByUid(uid) {
        const found = this._findConditionByUid(uid);
        if (!found) return;
        found.state.conditions = found.state.conditions.filter(c => c.uid !== uid);
        this.summarySelectedIds.delete(uid);
        this.render();
    }

    _duplicateSelectedConditions() {
        if (!this.summarySelectedIds.size) return;
        this.summarySelectedIds.forEach(uid => {
            const found = this._findConditionByUid(uid);
            if (found) {
                /* Push directly (bypassing addCondition's type+surface dedup) so the copy isn't collapsed back into the original */
                found.state.conditions.push({
                    ...found.cond,
                    uid: 'cond_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
                });
            }
        });
        this.summarySelectedIds = new Set();
        this.render();
    }

    _deleteSelectedConditions() {
        if (!this.summarySelectedIds.size) return;
        this.allMeta.forEach(meta => {
            const state = this.teeth[meta.fdi];
            state.conditions = state.conditions.filter(c => !this.summarySelectedIds.has(c.uid));
        });
        this.summarySelectedIds = new Set();
        this.render();
    }

    /** Move a condition from its current tooth to a different one, keeping its uid/status/surface. */
    _moveConditionTooth(uid, newFdi) {
        const found = this._findConditionByUid(uid);
        if (!found || found.fdi === newFdi) return;
        const newState = this.teeth[newFdi];
        if (!newState) return;
        found.state.conditions = found.state.conditions.filter(c => c.uid !== uid);
        newState.conditions.push(found.cond);
        this.render();
    }

    /** Change which observation a Condition Summary row represents. Picking "Healthy" removes the row. */
    _setConditionObservation(uid, statusId) {
        const found = this._findConditionByUid(uid);
        if (!found) return;

        if (!statusId) {
            found.cond.type  = '';
            found.cond.label = '— Select —';
            found.cond.color = '#c8cfd8';
            this.render();
            return;
        }

        const doc = this.toothStatusCatalog.find(s => s.name === statusId);
        if (!doc) return;
        const label = doc.status_name || doc.name;

        if (label.trim().toLowerCase() === 'healthy') {
            this._removeConditionByUid(uid);
            return;
        }

        found.cond.type  = doc.name;
        found.cond.label = label;
        found.cond.color = doc.color || '#999999';
        this.render();
    }

    /* ══════════════════════════════════════════════════════════════════════
       TOOTH SELECTION
    ══════════════════════════════════════════════════════════════════════*/

    _selectTooth(fdi) {
        this.selFDI = fdi;
        this.render();
    }

    /* ══════════════════════════════════════════════════════════════════════
       TREATMENT PLAN
    ══════════════════════════════════════════════════════════════════════*/

    _renderTreatmentPlan() {
        const wrap = document.getElementById('dc-tp-wrap');
        if (!wrap) return;

        const toothOptions = [
            { value: '00', label: '00 — General' },
            ...this.allMeta.map(m => ({ value: m.fdi, label: m.fdi })),
        ];
        const surfaceOptions = ['All', 'M', 'O', 'D', 'B', 'L'];
        const total = this.treatmentPlan.reduce((sum, t) => sum + (t.price || 0), 0);
        const nSel  = this.selectedIds.size;
        const allChecked = this.treatmentPlan.length > 0 && nSel === this.treatmentPlan.length;

        const rows = this.treatmentPlan.map((t, idx) => `
            <tr>
                <td class="tp-chk-cell"><input type="checkbox" class="tp-row-chk" data-id="${t.id}" ${this.selectedIds.has(t.id) ? 'checked' : ''}></td>
                <td class="tp-idx-cell">${idx + 1}</td>
                <td>
                    <select class="tp-cell-input tp-tooth-edit" data-id="${t.id}" title="${(t.toothLabel || '').replace(/"/g, '&quot;')}">
                        ${toothOptions.map(o => `<option value="${o.value}" ${o.value === t.fdi ? 'selected' : ''}>${o.label}</option>`).join('')}
                    </select>
                </td>
                <td><div class="tp-svc-ctrl" id="tp-svc-ctrl-${t.id}"></div></td>
                <td>
                    <select class="tp-cell-input tp-surf-edit" data-id="${t.id}">
                        ${surfaceOptions.map(s => `<option ${s === t.surface ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" step="0.01" class="tp-cell-input tp-price tp-price-edit" data-id="${t.id}" value="${t.price || 0}"></td>
                <td>
                    <select class="tp-status-sel" data-id="${t.id}">
                        <option ${t.status === 'Planned'     ? 'selected' : ''}>Planned</option>
                        <option ${t.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option ${t.status === 'Completed'   ? 'selected' : ''}>Completed</option>
                    </select>
                </td>
                <td><input type="date" class="tp-cell-input tp-date-edit" data-id="${t.id}" value="${t.date || ''}"></td>
                <td><span class="tp-row-rm" data-id="${t.id}" title="Delete row">🗑</span></td>
            </tr>`).join('');

        wrap.innerHTML = `
            <div class="tp-toolbar">
                <label class="tp-selall-wrap">
                    <input type="checkbox" id="dc-tp-select-all" ${allChecked ? 'checked' : ''} ${this.treatmentPlan.length ? '' : 'disabled'}>
                    <span>Select All</span>
                </label>
                <button class="tp-add-btn" id="dc-tp-add-row-btn">＋ Add Row</button>
                <button class="tp-add-btn tp-dup-btn" id="dc-tp-dup-btn" ${nSel ? '' : 'disabled'}>⧉ Duplicate${nSel ? ` (${nSel})` : ''}</button>
                <button class="tp-add-btn tp-del-btn" id="dc-tp-del-btn" ${nSel ? '' : 'disabled'}>🗑 Delete${nSel ? ` (${nSel})` : ''}</button>
            </div>
            ${this.treatmentPlan.length ? `
            <table class="sum-tbl tp-grid">
                <thead>
                    <tr>
                        <th style="width:26px"></th>
                        <th style="width:26px">#</th>
                        <th style="width:70px">Tooth</th>
                        <th>Service</th>
                        <th style="width:70px">Surface</th>
                        <th style="width:90px">Price</th>
                        <th style="width:110px">Status</th>
                        <th style="width:130px">Date</th>
                        <th style="width:26px"></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="5" style="text-align:right;font-weight:600;border-top:2px solid var(--border)">Total</td>
                        <td style="font-family:'DM Mono',monospace;font-weight:700;border-top:2px solid var(--border)">${this._fmtCurrency(total)}</td>
                        <td colspan="3" style="border-top:2px solid var(--border)"></td>
                    </tr>
                </tfoot>
            </table>` : `<div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">No treatment planned yet — click "＋ Add Row" to start</div>`}
        `;

        this._bindTreatmentPlanEvents();
        this._mountServiceLinkControls();
    }

    /** Wires up every control inside the freshly-rendered treatment plan grid. */
    _bindTreatmentPlanEvents() {
        const wrap = document.getElementById('dc-tp-wrap');
        if (!wrap) return;

        /* Toolbar */
        const addBtn = document.getElementById('dc-tp-add-row-btn');
        if (addBtn) addBtn.addEventListener('click', () => this._addBlankRow());

        const dupBtn = document.getElementById('dc-tp-dup-btn');
        if (dupBtn) dupBtn.addEventListener('click', () => this._duplicateSelected());

        const delBtn = document.getElementById('dc-tp-del-btn');
        if (delBtn) delBtn.addEventListener('click', () => this._deleteSelected());

        const selAll = document.getElementById('dc-tp-select-all');
        if (selAll) selAll.addEventListener('change', (e) => {
            if (e.target.checked) this.treatmentPlan.forEach(t => this.selectedIds.add(t.id));
            else this.selectedIds.clear();
            this._renderTreatmentPlan();
        });

        /* Row checkboxes */
        wrap.querySelectorAll('.tp-row-chk').forEach(el => {
            el.addEventListener('change', (e) => {
                if (e.target.checked) this.selectedIds.add(el.dataset.id);
                else this.selectedIds.delete(el.dataset.id);
                this._renderTreatmentPlan();
            });
        });

        /* Row delete */
        wrap.querySelectorAll('.tp-row-rm').forEach(el => {
            el.addEventListener('click', () => this._removeTreatmentItem(el.dataset.id));
        });

        /* Inline edits */
        wrap.querySelectorAll('.tp-tooth-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const item = this.treatmentPlan.find(t => t.id === el.dataset.id);
                if (!item) return;
                item.fdi = e.target.value;
                if (item.fdi === '00') {
                    item.toothLabel = 'General (non-tooth-specific)';
                } else {
                    const fullMeta = [
                        ...DentalChart.UPPER_META,       ...DentalChart.LOWER_META,
                        ...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD,
                    ];
                    const meta = fullMeta.find(m => m.fdi === item.fdi);
                    item.toothLabel = meta ? meta.name : item.fdi;
                }
            });
        });
        wrap.querySelectorAll('.tp-surf-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const item = this.treatmentPlan.find(t => t.id === el.dataset.id);
                if (item) item.surface = e.target.value;
            });
        });
        wrap.querySelectorAll('.tp-status-sel').forEach(el => {
            el.addEventListener('change', (e) => {
                const item = this.treatmentPlan.find(t => t.id === el.dataset.id);
                if (item) item.status = e.target.value;
            });
        });
        wrap.querySelectorAll('.tp-date-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const item = this.treatmentPlan.find(t => t.id === el.dataset.id);
                if (item) item.date = e.target.value;
            });
        });
        wrap.querySelectorAll('.tp-price-edit').forEach(el => {
            el.addEventListener('change', (e) => {
                const item = this.treatmentPlan.find(t => t.id === el.dataset.id);
                if (item) item.price = parseFloat(e.target.value) || 0;
                this._renderTreatmentPlan();   // refresh the total
            });
        });
    }

    /**
     * Mounts a real Frappe Link control (options: 'Item') into every row's
     * Service cell. Linking straight to the Item doctype — instead of a
     * separate "Treatment Service" doctype — guarantees whatever gets
     * picked here is a real, invoiceable Item, so Create Sales Invoice can
     * never hand ERPNext a nonexistent item_code again.
     */
    _mountServiceLinkControls() {
        this.treatmentPlan.forEach(t => {
            const container = document.getElementById(`tp-svc-ctrl-${t.id}`);
            if (!container) return;

            const handleChange = async (ctrl) => {
                const val = ctrl.get_value();
                if (!val) {
                    if (t.serviceId !== null) { t.serviceId = null; this._renderTreatmentPlan(); }
                    return;
                }
                if (val === t.serviceId) return;   // guard against re-fetch loops from programmatic set_value

                try {
                    const doc = await frappe.db.get_doc('Item', val);
                    console.log('[DentalChart] Item doc for', val, '→', doc);

                    const label    = doc.item_name || val;
                    const priceRaw = doc.standard_rate !== undefined ? doc.standard_rate : 0;

                    t.serviceId = val;             // this is now a real Item code
                    t.service   = label;
                    t.price     = parseFloat(priceRaw) || 0;
                } catch (err) {
                    console.error('[DentalChart] Failed to fetch Item', val, err);
                    t.serviceId = val;
                    t.service   = val;
                }
                this._renderTreatmentPlan();
            };

            const ctrl = frappe.ui.form.make_control({
                parent: $(container),
                df: {
                    fieldtype  : 'Link',
                    options    : 'Item',
                    fieldname  : 'item',
                    placeholder: 'Search item…',
                    get_query  : () => ({ filters: { disabled: 0 } }),
                    onchange   : () => handleChange(ctrl),
                },
                render_input: true,
            });
            ctrl.refresh();
            if (t.serviceId) ctrl.set_value(t.serviceId);

            /* Backup binding — some Frappe versions only fire this, not df.onchange */
            ctrl.$input.on('change', () => handleChange(ctrl));
        });
    }

    /** Create a new, empty, fully-editable row — the ERPNext-grid "Add Row" pattern. */
    _addBlankRow() {
        const fdi  = this.selFDI || (this.allMeta[0] && this.allMeta[0].fdi) || '';
        const meta = this.allMeta.find(m => m.fdi === fdi);
        this.treatmentPlan.push({
            id        : 'tp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            fdi       : fdi,
            toothLabel: meta ? meta.name : fdi,
            service   : '',
            serviceId : null,
            price     : 0,
            surface   : this.selSurf === 'all' ? 'All' : this.selSurf.toUpperCase(),
            status    : 'Planned',
            date      : frappe.datetime.get_today(),
        });
        this._renderTreatmentPlan();
    }

    /** Duplicate every selected row, inserting the copy right after its source. */
    _duplicateSelected() {
        if (!this.selectedIds.size) return;
        const next = [];
        this.treatmentPlan.forEach(t => {
            next.push(t);
            if (this.selectedIds.has(t.id)) {
                next.push({
                    ...t,
                    id: 'tp_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                });
            }
        });
        this.treatmentPlan = next;
        this.selectedIds   = new Set();
        this._renderTreatmentPlan();
    }

    /** Bulk-delete every checked row. */
    _deleteSelected() {
        if (!this.selectedIds.size) return;
        this.treatmentPlan = this.treatmentPlan.filter(t => !this.selectedIds.has(t.id));
        this.selectedIds   = new Set();
        this._renderTreatmentPlan();
    }

    /** Remove a single treatment plan row and re-render the grid. */
    _removeTreatmentItem(id) {
        this.treatmentPlan = this.treatmentPlan.filter(t => t.id !== id);
        this.selectedIds.delete(id);
        this._renderTreatmentPlan();
    }

    /* Small currency formatter — uses frappe's if available, else a plain fallback */
    _fmtCurrency(val) {
        const n = parseFloat(val) || 0;
        try {
            return format_currency(n);           // Frappe global helper
        } catch (e) {
            return n.toFixed(2);
        }
    }


    /**
     * Apply (or clear) the currently selected observation on one tooth/surface.
     * Shared by the palette "apply to selected tooth" flow and by clicking
     * a surface region directly on the tooth diagram. Applying the exact
     * same observation to the exact same surface a second time toggles it
     * back off, rolling back the change.
     */
    _applyStatusToTooth(fdi, surface) {
        if (!this.selStatus) return;
        const state = this.teeth[fdi];
        if (!state) return;

        if (this.selStatus.isHealthy) {
            if (surface === 'All') {
                state.conditions = [];
            } else {
                state.conditions = state.conditions.filter(c => c.surface !== surface && c.surface !== 'All');
            }
        } else {
            const alreadyApplied = state.conditions.some(
                c => c.type === this.selStatus.id && c.surface === surface
            );
            if (alreadyApplied) {
                /* Toggle off — clicking the same observation again rolls it back */
                state.conditions = state.conditions.filter(
                    c => !(c.type === this.selStatus.id && c.surface === surface)
                );
            } else {
                state.addCondition({
                    type   : this.selStatus.id,
                    label  : this.selStatus.label,
                    color  : this.selStatus.color,
                    surface: surface,
                });
            }
        }
        this.render();
    }

    _applyCondition() {
        if (!this.selFDI) {
            frappe.msgprint({ title: 'No Tooth Selected', message: 'Click a tooth first.', indicator: 'orange' });
            return;
        }
        if (!this.selStatus) {
            frappe.msgprint({ title: 'No Observation Selected', message: 'Pick an observation from the left panel first.', indicator: 'orange' });
            return;
        }
        const surf = this.selSurf === 'all' ? 'All' : this.selSurf.toUpperCase();
        this._applyStatusToTooth(this.selFDI, surf);
    }

    /** Clicking directly on a tooth surface applies the selected observation right there. */
    _applyToSurface(fdi, surface) {
        this.selFDI = fdi;
        if (!this.selStatus) {
            frappe.msgprint({ title: 'No Observation Selected', message: 'Pick an observation from the left panel first, then click a surface.', indicator: 'orange' });
            this.render();
            return;
        }
        this._applyStatusToTooth(fdi, surface);
    }

    /* ══════════════════════════════════════════════════════════════════════
       EVENT BINDING
    ══════════════════════════════════════════════════════════════════════*/

    /**
     * Fetch the observation catalog from the "Tooth Status" doctype and
     * render it as a clickable, color-coded list in the left palette.
     */
    async _loadToothStatuses() {
        const wrap = document.getElementById('dc-obs-list');
        if (wrap) wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">Loading observations…</div>`;

        try {
            this.toothStatusCatalog = await frappe.db.get_list('Tooth Status', {
                fields            : ['name', 'status_name', 'color'],   // ← adjust fieldnames here if needed
                limit_page_length : 0,
                order_by          : 'status_name asc',
            });
        } catch (err) {
            console.error('[DentalChart] Failed to load Tooth Status list:', err);
            this.toothStatusCatalog = [];
            frappe.msgprint({
                title: 'Could not load observations',
                message: 'Check that the "Tooth Status" doctype exists and is readable.',
                indicator: 'red',
            });
        }

        /* Sort alphabetically client-side too, as a safety net */
        this.toothStatusCatalog.sort((a, b) =>
            (a.status_name || a.name).localeCompare(b.status_name || b.name)
        );

        this._renderObservationList();
    }

    _bindObservationSearch() {
        const input = document.getElementById('dc-obs-search');
        if (!input) return;
        input.addEventListener('input', (e) => {
            this.obsSearchTerm = e.target.value || '';
            this._renderObservationList();
        });
    }

    _renderObservationList() {
        const wrap = document.getElementById('dc-obs-list');
        if (!wrap) return;

        const term = (this.obsSearchTerm || '').trim().toLowerCase();
        const filtered = term
            ? this.toothStatusCatalog.filter(s => (s.status_name || s.name).toLowerCase().includes(term))
            : this.toothStatusCatalog;

        if (!this.toothStatusCatalog.length) {
            wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">No observations found</div>`;
            return;
        }
        if (!filtered.length) {
            wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">No matches</div>`;
            return;
        }

        wrap.innerHTML = filtered.map(s => {
            const label  = s.status_name || s.name;
            const color  = s.color || '#999999';
            const active = this.selStatus && this.selStatus.id === s.name;
            return `<button class="pal-btn obs-btn${active ? ' active' : ''}" data-id="${s.name}" style="color:${color}">
                        <span class="pal-dot" style="background:${color}"></span>${label}
                    </button>`;
        }).join('');

        wrap.querySelectorAll('.obs-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const doc = this.toothStatusCatalog.find(s => s.name === btn.dataset.id);
                if (!doc) return;
                const label = doc.status_name || doc.name;
                this.selStatus = {
                    id       : doc.name,
                    label    : label,
                    color    : doc.color || '#999999',
                    isHealthy: label.trim().toLowerCase() === 'healthy',
                };
                this._renderObservationList();
                if (this.selFDI) this._applyCondition();
            });
        });
    }

    _bindChartStatus() {
        const sel = document.getElementById('dc-chart-status');
        if (!sel) return;
        sel.addEventListener('change', (e) => {
            this.chartStatus = e.target.value;
            this._renderChartStatus();
        });
    }

    _renderChartStatus() {
        const sel = document.getElementById('dc-chart-status');
        if (!sel) return;
        sel.value = this.chartStatus;
        const color = DentalChart.STATUS_COLORS[this.chartStatus] || '#6b7a8d';
        sel.style.background = color;
        sel.style.color      = '#fff';
    }

    _bindSurfaceEvents() {
        document.querySelectorAll('#dc-root .surf-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#dc-root .surf-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selSurf = btn.dataset.surf;
            });
        });
    }

    _bindNumberingToggle() {
        const btn = document.getElementById('dc-num-toggle');
        if (!btn) return;
        btn.addEventListener('click', () => {
            this.useFDI = !this.useFDI;
            btn.innerHTML = `<span style="font-size:13px">🔢</span>${this.useFDI ? 'FDI / Universal' : 'Universal / FDI'}`;
            this.render();
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
            ? conds.map(c => `${c.label || c.type} (${c.surface})`).join(', ')
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
        Object.values(this.teethSets.permanent).forEach(t => t.reset());
        Object.values(this.teethSets.primary).forEach(t => t.reset());
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   Shared DOM util (mirrors original _dcSet)
─────────────────────────────────────────────────────────────────────────────*/
function _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}