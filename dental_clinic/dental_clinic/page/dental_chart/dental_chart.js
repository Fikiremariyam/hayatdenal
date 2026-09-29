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
#dc-root .dc-pt-fullname { font-size:15px;font-weight:700;color:var(--text); }
#dc-root .dc-doc-name   { min-width:180px; }
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
#dc-root .tp-cell-input   { width:100%;border:1px solid transparent;background:transparent;font-family:inherit;font-size:12px;color:var(--text);padding:2px 4px;border-radius:4px;outline:none; }
#dc-root .tp-cell-input:hover, #dc-root .tp-cell-input:focus { border-color:var(--border2);background:var(--panel2); }
/* stat boxes */
#dc-root .stat-grid     { display:grid;grid-template-columns:1fr 1fr;gap:5px; }
#dc-root .stat-box      { background:var(--panel2);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center; }
#dc-root .stat-val      { font-size:18px;font-weight:700;font-family:'DM Mono',monospace;line-height:1; }
#dc-root .stat-lbl      { font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted2); }
/* BPE / BEWE sextant grids */
#dc-root .dc-perio-row   { display:flex;gap:12px;flex-wrap:wrap; }
#dc-root .dc-perio-block { flex:1;min-width:260px;background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--shadow); }
#dc-root .dc-perio-grid  { display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:1px;background:var(--border); }
#dc-root .dc-perio-cell  { background:var(--panel);padding:9px 6px;display:flex;flex-direction:column;align-items:center;gap:5px; }
#dc-root .dc-perio-cell-lbl { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted2);text-align:center; }
#dc-root .dc-perio-input    { border:1.5px solid var(--border);border-radius:6px;padding:3px 4px;font-family:'DM Mono',monospace;font-size:14px;font-weight:700;color:var(--text);background:var(--panel2);outline:none;cursor:text;width:36px;height:26px;text-align:center; }
#dc-root .dc-perio-input:focus{ border-color:var(--accent);background:#fff; }
/* notes row */
#dc-root .notes-row {   display: flex;    gap: 12px;}

#dc-root .notes-card {flex: 1;    background: var(--panel);    border: 1px solid var(--border);border-radius: 10px;    padding: 12px;}
#dc-root .notes-card-disclaimer { background:#fffaf0;border-color:#f0d9a8; }
#dc-root .notes-card-disclaimer .notes-lbl { color:#b8860b; }
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
    <div class="dc-pt-fullname" id="dc-pt-fullname">—</div> 

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

      <!-- BPE / BEWE -->
      <div class="dc-perio-row">
        <div class="dc-perio-block">
          <div class="arch-bar">
            <div class="arch-title">BPE — Basic Periodontal Exam</div>
            <div style="font-size:10px;color:var(--muted2);margin-left:auto">0–4, or *</div>
          </div>
          <div class="dc-perio-grid" id="dc-bpe-grid"></div>
        </div>
        <div class="dc-perio-block">
          <div class="arch-bar">
            <div class="arch-title">BEWE — Basic Erosive Wear Exam</div>
            <div style="font-size:10px;color:var(--muted2);margin-left:auto">0–3 per sextant</div>
          </div>
          <div class="dc-perio-grid" id="dc-bewe-grid"></div>
        </div>
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

/* Runs every time the page is opened (Frappe caches pages, so on_page_load
   only runs the first time). Picks up the patient sent from the Patient form. */
frappe.pages['dental-chart'].on_page_show = function () {
    if (window._dc) window._dc.applyRouteOptions();
};


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: ToothState
   Holds all clinical data for a single tooth.
─────────────────────────────────────────────────────────────────────────────*/
class ToothState {

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

    addCondition(cond) {
        this.conditions = this.conditions.filter(
            c => !(c.type === cond.type && c.surface === cond.surface)
        );
        if (!cond.uid) cond.uid = 'cond_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        this.conditions.push(cond);
    }

    removeCondition(index) {
        this.conditions.splice(index, 1);
    }

    reset() {
        this.conditions  = [];
        this.mobility    = '0';
        this.furcation   = '—';
        this.sensitivity = 'None';
        this.notes       = '';
    }

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
   Manages the patient link control, the provider (logged-in user) and banner.
─────────────────────────────────────────────────────────────────────────────*/
class PatientInfo {

    constructor() {
        this.id       = null;
        this.fullName = '—';
        this.dob      = '—';
        this.provider = frappe.session.user;
        this._onChangeCb = null;

        /* Patient link control */
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

        /* Provider = the logged-in user who creates the chart (read-only) */
        this.provider_ctrl = frappe.ui.form.make_control({
            parent: $('.dc-doc-name'),
            df: {
                fieldtype : 'Link',
                options   : 'User',
                label     : 'Provider',
                fieldname : 'provider',
                read_only : 1,
            },
            render_input: true,
        });
        this.setProvider(frappe.session.user);
    }

    /** Currently linked patient ID (Frappe name). */
    get value() {
        return this._ctrl.get_value() || null;
    }

    /** Currently shown provider (User ID). */
    get providerValue() {
        return this.provider_ctrl.get_value() || this.provider || null;
    }

    onChange(cb) {
        this._onChangeCb = cb;
    }

    setValue(patientId) {
        this._ctrl.set_value(patientId);
    }

    /** Show a user as the provider (value = user ID, display = full name). */
    setProvider(userId) {
        if (!userId) return;
        this.provider = userId;
        this.provider_ctrl.set_value(userId);
        const fullName = frappe.user.full_name ? frappe.user.full_name(userId) : userId;
        this._showTitle(this.provider_ctrl, 'User', userId, fullName);
    }

    async load(patientId) {
        if (!patientId) return;
        try {
            const doc     = await frappe.db.get_doc('Patient', patientId);
            this.id       = doc.name;
            this.fullName = doc.patient_name || patientId;
            this.dob      = doc.dob ? frappe.datetime.str_to_user(doc.dob) : '—';

            /* Show patient_name in the link input while keeping the ID as its value */
            this._showTitle(this._ctrl, 'Patient', doc.name, this.fullName);

            _set('dc-pt-fullname', this.fullName);
        } catch (err) {
            console.warn('[DentalChart] PatientInfo.load failed:', err);
            _set('dc-pt-fullname', patientId);
        }
    }

    /** Display a record's title in a Link control; the stored value stays the ID. */
    _showTitle(ctrl, doctype, name, title) {
        if (!name || !title) return;
        if (frappe.utils.add_link_title) {
            frappe.utils.add_link_title(doctype, name, title);
        }
        if (ctrl.set_formatted_input) {
            ctrl.set_formatted_input(name);
        }
    }
}


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: ToothSVG  (static helpers only)
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

    static resolve(conditions) {
        const types = conditions.map(c => c.type);
        for (const key of ToothSVG.FILL_PRIORITY) {
            if (types.includes(key)) return ToothSVG.COLORS[key];
        }
        return types.length ? ToothSVG.COLORS.healthy : ToothSVG.COLORS.none;
    }

    static render(toothMeta, isUpper, conditions) {
        return ToothSVG._grid(conditions);
    }

    static _grid(conditions) {
        const SZ   = 44;
        const HALF = SZ / 2;
        const OSZ  = 16;
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
}


/* ───────────────────────────────────────────────────────────────────────────
   CLASS: DentalChart  – main controller
─────────────────────────────────────────────────────────────────────────────*/
class DentalChart {

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

    static MIDLINE_AFTER = {
        permanent: ['11', '41'],
        primary  : ['51', '81'],
    };

    static STATUS_COLORS = {
        'Planned'   : '#f39c12',
        'Approved'  : '#3498db',
        'To Bill'   : '#8e44ad',
        'Billed'    : '#16a085',
        'Completed' : '#27ae60',
    };

    static SEXTANT_LABELS = [
        'Upper Right', 'Upper Anterior', 'Upper Left',
        'Lower Right', 'Lower Anterior', 'Lower Left',
    ];

    /* ── constructor ────────────────────────────────────────────────────── */
    constructor() {
        this.summarySelectedIds = new Set();

        this.teethSets = { permanent: {}, primary: {} };
        [...DentalChart.UPPER_META, ...DentalChart.LOWER_META]
            .forEach(m => { this.teethSets.permanent[m.fdi] = new ToothState(m); });
        [...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD]
            .forEach(m => { this.teethSets.primary[m.fdi] = new ToothState(m); });

        this.toothStatusCatalog = [];
        this.selStatus = null;
        this.obsSearchTerm = '';

        this.selFDI  = null;
        this.useFDI  = true;

        this.patient = new PatientInfo();

        this.savedChartName = null;
        this.chartStatus = 'Planned';

        this.bpe  = {1:'',2:'',3:'',4:'',5:'',6:''};
        this.bewe = {1:'',2:'',3:'',4:'',5:'',6:''};

        this._tip = document.getElementById('dc-tip');
    }

    get allMeta() {
        return [
            ...DentalChart.UPPER_META,       ...DentalChart.LOWER_META,
            ...DentalChart.UPPER_META_CHILD, ...DentalChart.LOWER_META_CHILD,
        ];
    }
    get teeth() { return { ...this.teethSets.permanent, ...this.teethSets.primary }; }


    /* ── init ───────────────────────────────────────────────────────────── */
    init() {
        _set('dc-pt-date', frappe.datetime.str_to_user(frappe.datetime.get_today()));

        /* Patient picked manually in the link field */
        this.patient.onChange(async (patientId) => {
            await this._openPatient(patientId);
        });

        this._loadToothStatuses();
        this._bindObservationSearch();
        this._bindNumberingToggle();
        this._bindTooltip();
        this._bindChartStatus();
        this._renderChartStatus();

        this.render();

        /* Patient passed from the Patient form (or ?patient= in the URL) */
        this.applyRouteOptions();
    }

    /* ── PATIENT PASSED FROM THE PATIENT FORM ─────────────────────────── */
    applyRouteOptions() {
        let patientId = null;

        if (frappe.route_options && frappe.route_options.patient) {
            patientId = frappe.route_options.patient;
            frappe.route_options = null;
        } else {
            const params = frappe.utils.get_query_params();
            if (params.patient) patientId = params.patient;
        }

        if (!patientId) return;
        if (patientId === this.patient.value && this.patient.id === patientId) return;   // already open

        this.patient.setValue(patientId);
        this._openPatient(patientId);
    }

    /** Switch the page to a patient: fresh chart, then load their latest saved chart. */
    async _openPatient(patientId) {
        this.clear();
        _set('dc-pt-fullname', 'Loading…');
        await this.patient.load(patientId);
        await this._loadLatestChart(patientId);
    }

    async _loadLatestChart(patientId) {
        try {
            const list = await frappe.db.get_list('Dental charting_', {
                filters : { patient: patientId },
                fields  : ['name', 'chart_date'],
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

    async _loadChartByName(chartName) {
        try {
            const doc = await frappe.db.get_doc('Dental charting_', chartName);

            this._resetAllTeeth();
            this.summarySelectedIds = new Set();

            if (!this.toothStatusCatalog.length) {
                await this._loadToothStatuses();
            }

            const clinicalEl = document.getElementById('dc-notes-clinical');
            if (clinicalEl) clinicalEl.value = doc.clinical_notes || '';

            const disclaimerEl = document.getElementById('dc-notes-disclaimer');
            if (disclaimerEl) disclaimerEl.value = doc.disclaimer || '';

            /* Provider = the user who created this chart */
            this.patient.setProvider(doc.owner || doc.provider || frappe.session.user);

            (doc.condition_summary || []).forEach(row => {
                const state = this.teethSets.permanent[row.fdi] || this.teethSets.primary[row.fdi];
                if (state) state.loadFromDocRow(row, this.toothStatusCatalog);
            });

            for (let n = 1; n <= 6; n++) {
                this.bpe[n]  = doc['bpe' + n]  || '';
                this.bewe[n] = doc['bewe' + n] || '';
            }

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

    async loadChartHistory() {
        const patientId = this.patient.value;
        if (!patientId) {
            frappe.msgprint({ title: 'No Patient', message: 'Select a patient first.', indicator: 'orange' });
            return;
        }

        try {
            const list = await frappe.db.get_list('Dental charting_', {
                filters : { patient: patientId },
                fields  : ['name', 'chart_date', 'owner'],
                order_by: 'chart_date desc',
                limit   : 20,
            });

            if (!list || !list.length) {
                frappe.msgprint({ title: 'No Charts Found', message: 'No saved charts for this patient.', indicator: 'orange' });
                return;
            }

            const d = new frappe.ui.Dialog({
                title : 'Select a Chart to Load',
                fields: [{ fieldtype: 'HTML', fieldname: 'chart_list_html' }],
            });

            const rows = list.map(c => {
                const by = frappe.user.full_name ? frappe.user.full_name(c.owner) : c.owner;
                return `<div class="hist-item" data-name="${c.name}" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border:1px solid #e2e6ea;border-radius:6px;margin-bottom:5px;cursor:pointer;font-size:12px;transition:background .13s;"
                     onmouseover="this.style.background='#e8f0fe'" onmouseout="this.style.background=''">
                  <span style="font-family:'DM Mono',monospace;font-weight:600">${c.name}</span>
                  <span style="color:#6b7a8d">${frappe.datetime.str_to_user(c.chart_date)}</span>
                  <span style="color:#9aa3af;font-size:11px">by ${by}</span>
                </div>`;
            }).join('');

            d.fields_dict.chart_list_html.$wrapper.html(
                `<div style="max-height:340px;overflow-y:auto">${rows}</div>`
            );

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
       SAVE
    ══════════════════════════════════════════════════════════════════════*/

    async save() {
        const patientId = this.patient.value;

        if (!patientId) {
            frappe.msgprint({
                title    : 'No Patient Selected',
                message  : 'Search for and select a patient before saving.',
                indicator: 'orange',
            });
            return;
        }

        const conditionRows = [];
        this.allMeta.forEach(meta => {
            const state = this.teethSets.permanent[meta.fdi] || this.teethSets.primary[meta.fdi];
            if (!state) return;

            if (!state.conditions.length) {
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

        const providerVal    = this.patient.providerValue || frappe.session.user;
        const clinicalNotes  = (document.getElementById('dc-notes-clinical')   || {}).value || '';
        const disclaimerText = (document.getElementById('dc-notes-disclaimer') || {}).value || '';

        const perioFields = {};
        for (let n = 1; n <= 6; n++) {
            perioFields['bpe'  + n] = this.bpe[n]  || '';
            perioFields['bewe' + n] = this.bewe[n] || '';
        }

        try {
            if (this.savedChartName) {
                /* UPDATE — round-trip the full existing doc so no other fields are lost */
                const existing = await frappe.db.get_doc('Dental charting_', this.savedChartName);
                existing.patient           = patientId;
                existing.chart_date        = frappe.datetime.get_today();
                existing.provider          = providerVal;
                existing.status            = this.chartStatus;
                existing.clinical_notes    = clinicalNotes;
                existing.disclaimer        = disclaimerText;
                existing.condition_summary = conditionRows;
                Object.assign(existing, perioFields);

                frappe.call({
                    method  : 'frappe.client.save',
                    args    : { doc: existing },
                    callback: (r) => {
                        if (r.message) {
                            _set('dc-pt-badge', r.message.name);
                            frappe.show_alert({ message: `Updated: ${r.message.name}`, indicator: 'green' });
                        }
                    },
                    error: (r) => console.error('[DentalChart] save (update) failed:', r),
                });
            } else {
                /* CREATE */
                frappe.call({
                    method  : 'frappe.client.insert',
                    args    : {
                        doc: {
                            doctype          : 'Dental charting_',
                            patient          : patientId,
                            chart_date       : frappe.datetime.get_today(),
                            provider         : providerVal,
                            status           : this.chartStatus,
                            clinical_notes   : clinicalNotes,
                            disclaimer       : disclaimerText,
                            condition_summary: conditionRows,
                            ...perioFields,
                        },
                    },
                    callback: (r) => {
                        if (r.message) {
                            this.savedChartName = r.message.name;
                            _set('dc-pt-badge', r.message.name);
                            frappe.show_alert({ message: `Saved: ${r.message.name}`, indicator: 'green' });
                        }
                    },
                    error: (r) => console.error('[DentalChart] save (insert) failed:', r),
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
        this.summarySelectedIds = new Set();
        this.chartStatus        = 'Planned';
        this.bpe  = {1:'',2:'',3:'',4:'',5:'',6:''};
        this.bewe = {1:'',2:'',3:'',4:'',5:'',6:''};

        const clinicalEl = document.getElementById('dc-notes-clinical');
        if (clinicalEl) clinicalEl.value = '';
        const disclaimerEl = document.getElementById('dc-notes-disclaimer');
        if (disclaimerEl) disclaimerEl.value = '';

        /* New chart → provider is whoever is logged in */
        this.patient.setProvider(frappe.session.user);

        _set('dc-pt-badge', 'New Chart');
        this._renderChartStatus();
        this.render();
    }

    export() {
        const payload = {
            chart   : this.savedChartName,
            patient : this.patient.value,
            provider: this.patient.providerValue,
            exported: new Date().toISOString(),
            state   : {},
            bpe     : { ...this.bpe },
            bewe    : { ...this.bewe },
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
        this._renderArch(DentalChart.UPPER_META,       'dc-upper-row',       true,  'permanent');
        this._renderArch(DentalChart.LOWER_META,       'dc-lower-row',       false, 'permanent');
        this._renderArch(DentalChart.UPPER_META_CHILD, 'dc-upper-row-child', true,  'primary');
        this._renderArch(DentalChart.LOWER_META_CHILD, 'dc-lower-row-child', false, 'primary');
        this._renderStats();
        this._renderPerioGrids();
        this._renderSummary();
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

        el.addEventListener('click',       ()  => this._selectTooth(meta.fdi));
        el.addEventListener('mouseenter',  (e) => this._showTip(e, meta));
        el.addEventListener('mouseleave',  ()  => this._hideTip());

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

    _renderPerioGrids() {
        this._buildPerioGrid('dc-bpe-grid',  this.bpe,  4, '*');
        this._buildPerioGrid('dc-bewe-grid', this.bewe, 3, null);
    }

    _buildPerioGrid(containerId, dataObj, maxScore, extraOption) {
        const grid = document.getElementById(containerId);
        if (!grid) return;

        const allowed = Array.from({ length: maxScore + 1 }, (_, k) => String(k));
        if (extraOption) allowed.push(extraOption);

        grid.innerHTML = DentalChart.SEXTANT_LABELS.map((lbl, i) => {
            const n   = i + 1;
            const val = dataObj[n] || '';
            return `<div class="dc-perio-cell">
                        <span class="dc-perio-cell-lbl">${lbl}</span>
                        <input type="text" inputmode="text" maxlength="1" autocomplete="off"
                               class="dc-perio-input" data-n="${n}" value="${val}">
                    </div>`;
        }).join('');

        grid.querySelectorAll('.dc-perio-input').forEach(input => {
            const n = input.dataset.n;

            input.addEventListener('input', (e) => {
                let v = (e.target.value || '').trim().toUpperCase();
                if (v && !allowed.includes(v)) v = dataObj[n] || '';
                e.target.value = v;
                dataObj[n] = v;
            });

            input.addEventListener('focus', (e) => e.target.select());
        });
    }

    _renderSummary() {
        const wrap = document.getElementById('dc-summary-wrap');
        if (!wrap) return;

        const toothOptions   = this.allMeta.map(m => m.fdi);
        const surfaceOptions = ['All', 'M', 'O', 'D', 'B', 'L'];

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
                this._renderSummary();
            });
        });
    }

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

    _moveConditionTooth(uid, newFdi) {
        const found = this._findConditionByUid(uid);
        if (!found || found.fdi === newFdi) return;
        const newState = this.teeth[newFdi];
        if (!newState) return;
        found.state.conditions = found.state.conditions.filter(c => c.uid !== uid);
        newState.conditions.push(found.cond);
        this.render();
    }

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
        this._applyStatusToTooth(this.selFDI, 'All');
    }

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

    async _loadToothStatuses() {
        const wrap = document.getElementById('dc-obs-list');
        if (wrap) wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">Loading observations…</div>`;

        try {
            this.toothStatusCatalog = await frappe.db.get_list('Tooth Status', {
                fields            : ['name', 'status_name', 'color'],
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
   Shared DOM util
─────────────────────────────────────────────────────────────────────────────*/
function _set(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}