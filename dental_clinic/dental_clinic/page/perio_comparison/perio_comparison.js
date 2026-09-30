frappe.pages["perio_comparison"].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Periodontal Examination",
        single_column: true,
    });

    // ── Fieldnames on "Dental Perio Exam" (change here if yours differ) ────
    const F = {
        practitioner: "practitioner",          // Link → Healthcare Practitioner
        surface_chart: "surface_chart",        // Long Text (JSON of the 4-surface charts)
        plaque_score: "plaque_score",          // Percent
        plaque_fraction: "plaque_fraction",    // Data  e.g. "38/112"
        bleeding_score: "bleeding_score",      // Percent
        bleeding_fraction: "bleeding_fraction",// Data
    };

    // ── Inject CSS ─────────────────────────────────────────────────────────
    frappe.dom.set_style(`
.pe-root { padding: 16px; font-family: -apple-system, "Segoe UI", Arial, sans-serif; font-size: 13px; color: #222; max-width: 1180px; }
.pe-card { background: #fff; border: 1px solid #d0dce8; border-radius: 6px; padding: 16px 18px; margin-bottom: 16px; }
.pe-title { font-size: 15px; font-weight: 700; color: #1B4F8A; margin-bottom: 2px; }
.pe-subtitle { font-size: 11px; color: #888; margin-bottom: 14px; }
.pe-header-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px 16px; }
.pe-field { display: flex; flex-direction: column; gap: 4px; }
.pe-field.pe-span2 { grid-column: span 2; }
.pe-field.pe-span4 { grid-column: span 4; }
.pe-label { font-size: 10.5px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: 0.4px; }
.pe-input, .pe-select, .pe-textarea { border: 1px solid #d1d8dd; border-radius: 4px; font-size: 13px; padding: 6px 8px; background: #fff; color: #222; }
.pe-input:disabled, .pe-input[readonly] { background: #f4f6f8; color: #667; }
.pe-textarea { resize: vertical; min-height: 42px; font-family: inherit; }
.pe-radio-row { display: flex; gap: 16px; align-items: center; height: 30px; }
.pe-radio-row label { display: flex; align-items: center; gap: 5px; font-size: 12.5px; cursor: pointer; }
.pe-patient-input, .pe-practitioner-input, .pe-exam-picker { min-height: 30px; }
.pe-patient-input .form-group, .pe-practitioner-input .form-group { margin-bottom: 0; }

/* View toggle */
.pe-tabs { display: flex; gap: 6px; background: #eef2f7; padding: 5px; border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.pe-tab { border: none; background: transparent; padding: 8px 16px; border-radius: 6px; font-weight: 600; font-size: 12.5px; color: #555; cursor: pointer; transition: all .15s; }
.pe-tab:hover { background: #e2e8f0; color: #1B4F8A; }
.pe-tab.active { background: #1B4F8A; color: #fff; box-shadow: 0 2px 6px rgba(27,79,138,.3); }
.pe-view { display: none; }
.pe-view.active { display: block; }

/* Section (one surface row) */
.pe-section { margin-bottom: 4px; }
.pe-section-head { display: flex; align-items: baseline; gap: 8px; margin-bottom: 6px; }
.pe-section-name { font-size: 12px; font-weight: 700; letter-spacing: 0.6px; text-transform: uppercase; color: #1B4F8A; }
.pe-section-rl { font-size: 10px; color: #999; }
.pe-diagram-wrap { overflow-x: auto; margin-bottom: 4px; }
.pe-diagram-wrap svg { display: block; }
.pe-tooth-shape { stroke: #b8c4d0; stroke-width: 1; cursor: pointer; }
.pe-tooth-shape:hover { stroke: #1B4F8A; stroke-width: 1.6; }
.pe-tooth-shape.missing { fill: #e9ecef; stroke: #cbd3db; stroke-dasharray: 2,2; }
.pe-tooth-num { font-size: 8px; font-weight: 700; fill: #555; text-anchor: middle; pointer-events: none; }
.pe-tooth-x { font-size: 12px; font-weight: 700; fill: #b33; text-anchor: middle; pointer-events: none; }

/* Data grid */
.pe-grid-wrap { overflow-x: auto; margin-bottom: 18px; }
.pe-grid { border-collapse: collapse; font-size: 11px; table-layout: fixed; width: max-content; }
.pe-grid th, .pe-grid td { border: 1px solid #e3e9f0; padding: 0; text-align: center; }
.pe-grid thead th { background: #eef2f7; color: #555; font-size: 9px; font-weight: 700; padding: 4px 2px; }
.pe-grid thead th:first-child { min-width: 0; text-align: left; padding-left: 6px; }
.pe-site-label { background: #f5f7fa !important; color: #a7b1bb !important; font-size: 7.5px !important; font-weight: 700 !important; padding: 2px 0 !important; }
.pe-row-group { background: #eef2f7; color: #1B4F8A; font-size: 10px; font-weight: 700; text-align: left; padding: 4px 6px; white-space: nowrap; vertical-align: middle; min-width: 78px; }
.pe-row-unit { display: block; font-size: 8.5px; font-weight: 500; color: #888; text-transform: none; letter-spacing: 0; }
.pe-row-site { background: #f5f7fa; color: #999; font-size: 9px; font-weight: 600; text-align: center; padding: 4px 2px; width: 18px; }
.pe-grid tbody th { background: #f5f7fa; color: #555; font-size: 10px; font-weight: 600; text-align: left; padding: 4px 6px; white-space: nowrap; }
.pe-grid td { padding: 0; overflow: hidden; }
.pe-cell-input { display: block; width: 100%; height: 38px; box-sizing: border-box; border: none; text-align: center; font-size: 13px; font-weight: 700; background: transparent; color: #222; }
.pe-cell-input:focus { outline: 2px solid #1B4F8A; outline-offset: -2px; background: #eef4fb; }
.pe-cell-input:disabled { background: #f0f2f5; color: #ccc; }
.pe-tooth-start { border-left: 2px solid #9fb3c8 !important; }
.pe-cell-td.pe-tooth-alt { background: #f6f9fc; }
.pe-cell-td.pe-tooth-alt .pe-cell-input { background: transparent; }
th.pe-tooth-alt { background: #e3eaf2 !important; }
.pe-cell-input::-webkit-outer-spin-button, .pe-cell-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.pe-cell-input[type="number"] { -moz-appearance: textfield; appearance: textfield; }
.pe-cell-input.pd-h { color: #1a7a1a; }
.pe-cell-input.pd-w { color: #b8860b; }
.pe-cell-input.pd-d { color: #cc0000; }
.pe-bool-toggle { display: flex; align-items: center; justify-content: center; gap: 5px; height: 38px; cursor: pointer; font-size: 10px; font-weight: 700; color: #99a3ad; user-select: none; }
.pe-bool-toggle.is-yes { color: #cc0000; }
.pe-bool-input { cursor: pointer; width: 13px; height: 13px; accent-color: #1B4F8A; }
.pe-bool-input:disabled { cursor: not-allowed; }

/* 4-surface triangular charts */
.pe-sc-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 10px; }
.pe-sc-hint { font-size: 11px; color: #888; }
.pe-sc-actions { margin-left: auto; display: flex; gap: 6px; }
.pe-sc-wrap { overflow-x: auto; padding: 4px 0 2px; }
.pe-sc-arch { display: flex; justify-content: center; align-items: flex-end; gap: 2px; width: max-content; margin: 0 auto; }
.pe-sc-arch.lower { align-items: flex-start; }
.pe-sc-arch-lbl { font-size: 9px; font-weight: 700; color: #99a3ad; text-transform: uppercase; letter-spacing: .5px; text-align: center; margin: 6px 0 3px; }
.pe-sc-tooth { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.pe-sc-arch.lower .pe-sc-tooth { flex-direction: column-reverse; }
.pe-sc-num { font-size: 8.5px; font-weight: 700; color: #555; cursor: pointer; padding: 1px 3px; border-radius: 3px; }
.pe-sc-num:hover { background: #eef2f7; color: #1B4F8A; }
.pe-sc-tooth svg { display: block; }
.pe-sc-surf { cursor: pointer; stroke: #b8c4d0; stroke-width: 1; transition: opacity .1s; }
.pe-sc-surf:hover { opacity: .7; stroke: #1B4F8A; stroke-width: 1.5; }
.pe-sc-txt { font-size: 9px; font-weight: 700; text-anchor: middle; pointer-events: none; fill: #222; }
.pe-sc-mid { width: 2px; align-self: stretch; background: #1B4F8A; opacity: .35; margin: 0 5px; }
.pe-sc-divider { height: 1px; background: #e3e9f0; margin: 8px 0; }

/* Score cards */
.pe-score-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.pe-score { flex: 1; min-width: 150px; border-radius: 8px; padding: 10px 14px; color: #fff; box-shadow: 0 3px 10px rgba(0,0,0,.1); }
.pe-score-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; opacity: .92; }
.pe-score-big { font-size: 24px; font-weight: 800; line-height: 1.15; }
.pe-score-sub { font-size: 11px; opacity: .95; }

/* Value palette */
.pe-palette { display: flex; gap: 4px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
.pe-palette-lbl { font-size: 10.5px; font-weight: 600; color: #555; text-transform: uppercase; letter-spacing: .4px; margin-right: 4px; }
.pe-pal-btn { min-width: 30px; height: 28px; border: 1.5px solid #d1d8dd; background: #fff; border-radius: 5px; font-weight: 700; font-size: 12px; cursor: pointer; color: #333; }
.pe-pal-btn:hover { border-color: #1B4F8A; }
.pe-pal-btn.active { border-color: #1B4F8A; background: #1B4F8A; color: #fff; }
.pe-mini-btn { height: 28px; padding: 0 10px; border: 1px solid #d1d8dd; background: #fff; border-radius: 5px; font-size: 11.5px; font-weight: 600; cursor: pointer; color: #444; }
.pe-mini-btn:hover { border-color: #1B4F8A; color: #1B4F8A; }

/* Actions */
.pe-actions { display: flex; gap: 10px; justify-content: flex-end; align-items: center; margin-top: 4px; }
.pe-btn { height: 34px; padding: 0 22px; border: none; border-radius: 4px; font-size: 13px; font-weight: 600; cursor: pointer; letter-spacing: 0.3px; }
.pe-btn-primary { background: #1B4F8A; color: #fff; }
.pe-btn-primary:hover { background: #163d6e; }
.pe-btn-primary:disabled { background: #a0adb8; cursor: not-allowed; }
.pe-btn-secondary { background: #eef2f7; color: #444; }
.pe-btn-secondary:hover { background: #e2e8f0; }
.pe-save-msg { font-size: 11.5px; color: #0E7C7B; margin-right: auto; }
.pe-legend { display: flex; flex-wrap: wrap; gap: 14px; padding: 2px 2px 0; font-size: 10.5px; color: #666; }
.pe-legend-item { display: flex; align-items: center; gap: 5px; }
.pe-swatch { display: inline-block; width: 9px; height: 9px; border-radius: 2px; }
`);

    // ── Constants ──────────────────────────────────────────────────────────
    const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1);   // 1..16
    const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i);  // 32..17
    const ALL_TEETH = [...UPPER_TEETH, ...LOWER_TEETH];
    const SITES = [1, 2, 3];
    const SITE_LABELS = { 1: "M", 2: "B", 3: "D" };
    const SURFACES = ["B", "L", "M", "D"];   // 4 surfaces per tooth

    function quadrantLabel(tn) {
        if (tn >= 1 && tn <= 8) return "UR" + (9 - tn);
        if (tn >= 9 && tn <= 16) return "UL" + (tn - 8);
        if (tn >= 17 && tn <= 24) return "LL" + (25 - tn);
        if (tn >= 25 && tn <= 32) return "LR" + (tn - 24);
        return String(tn);
    }
    function pdBand(v) {
        if (!v || v <= 0) return "";
        if (v <= 3) return "pd-h";
        if (v <= 5) return "pd-w";
        return "pd-d";
    }
    function fullName(user) {
        if (!user) return "";
        return (frappe.user && frappe.user.full_name) ? frappe.user.full_name(user) : user;
    }
    function emptySurfaceData() {
        return { plaque: {}, bleeding: {}, pd: {}, rec: {} };
    }

    // ── State ──────────────────────────────────────────────────────────────
    let selectedPatient = frappe.utils.get_url_arg("patient") || null;
    let existingExamName = frappe.utils.get_url_arg("name") || null;
    let missingTeeth = new Set();
    let surfaceData = emptySurfaceData();
    let assessedByUser = frappe.session.user;           // user who creates the exam
    let selectedVal = { pd: 3, rec: 1 };                 // value brush for PD / recession
    let currentView = "chart";

    // ── Mount HTML template ────────────────────────────────────────────────
    page.main.html(`
<div class="pe-root">

  <!-- Patient / practitioner / exam picker -->
  <div class="pe-card">
    <div class="pe-header-grid">
      <div class="pe-field pe-span2">
        <label class="pe-label">Patient</label>
        <div class="pe-patient-input"></div>
      </div>
      <div class="pe-field">
        <label class="pe-label">Practitioner</label>
        <div class="pe-practitioner-input"></div>
      </div>
      <div class="pe-field">
        <label class="pe-label">Load Existing Exam</label>
        <select id="pe-exam-picker" class="pe-select pe-exam-picker">
          <option value="">— New exam —</option>
        </select>
      </div>
    </div>
  </div>

  <!-- View toggle -->
  <div class="pe-tabs">
    <button class="pe-tab active" data-view="chart">📋 Perio Chart</button>
    <button class="pe-tab" data-view="plaque">🦠 Plaque &amp; Bleeding</button>
    <button class="pe-tab" data-view="pocket">📏 Pocket Depth &amp; Recession</button>
  </div>

  <!-- Exam header -->
  <div class="pe-card">
    <div class="pe-title">Periodontal Examination</div>
    <div class="pe-subtitle">Appendix D · Dental sheet</div>
    <div class="pe-header-grid">
      <div class="pe-field">
        <label class="pe-label">Exam Date</label>
        <input id="pe-exam-date" type="date" class="pe-input" />
      </div>
      <div class="pe-field">
        <label class="pe-label">Total Teeth Present</label>
        <input id="pe-teeth-present" type="text" class="pe-input" readonly />
      </div>
      <div class="pe-field">
        <label class="pe-label">Total Teeth Lost</label>
        <input id="pe-teeth-lost" type="text" class="pe-input" readonly />
      </div>
      <div class="pe-field">
        <label class="pe-label">Assessed By</label>
        <input id="pe-assessed-by" type="text" class="pe-input" readonly />
      </div>

      <div class="pe-field pe-span2">
        <label class="pe-label">Periodontitis</label>
        <div class="pe-radio-row">
          <label><input type="radio" name="pe-periodontitis" value="Present"> Present</label>
          <label><input type="radio" name="pe-periodontitis" value="Absent" checked> Absent</label>
        </div>
      </div>
      <div class="pe-field pe-span2">
        <label class="pe-label">Severity of Periodontitis</label>
        <div class="pe-radio-row" id="pe-severity-row">
          <label><input type="radio" name="pe-severity" value="Mild"> Mild</label>
          <label><input type="radio" name="pe-severity" value="Moderate"> Moderate</label>
          <label><input type="radio" name="pe-severity" value="Severe"> Severe</label>
        </div>
      </div>

      <div class="pe-field pe-span4">
        <label class="pe-label">Other Findings</label>
        <textarea id="pe-other-findings" class="pe-textarea"></textarea>
      </div>
      <div class="pe-field pe-span4">
        <label class="pe-label">Recommendation</label>
        <textarea id="pe-recommendation" class="pe-textarea"></textarea>
      </div>
    </div>
  </div>

  <!-- ═════════ VIEW 1: PERIO CHART (grids) ═════════ -->
  <div class="pe-view active" data-view="chart">
    <div class="pe-card">

      <div class="pe-section">
        <div class="pe-section-head">
          <span class="pe-section-name">Buccal</span>
          <span class="pe-section-rl">(upper arch — click a tooth to mark it missing · M / B / D columns per tooth)</span>
        </div>
        <div id="pe-diagram-buccal-upper" class="pe-diagram-wrap"></div>
        <div class="pe-grid-wrap"><table class="pe-grid" id="pe-grid-buccal-upper"></table></div>
      </div>

      <div class="pe-section">
        <div class="pe-section-head">
          <span class="pe-section-name">Palatal</span>
          <span class="pe-section-rl">(upper arch — click a tooth to mark it missing · M / B / D columns per tooth)</span>
        </div>
        <div id="pe-diagram-palatal" class="pe-diagram-wrap"></div>
        <div class="pe-grid-wrap"><table class="pe-grid" id="pe-grid-palatal"></table></div>
      </div>

      <div class="pe-section">
        <div class="pe-section-head">
          <span class="pe-section-name">Lingual</span>
          <span class="pe-section-rl">(lower arch — click a tooth to mark it missing · M / B / D columns per tooth)</span>
        </div>
        <div id="pe-diagram-lingual" class="pe-diagram-wrap"></div>
        <div class="pe-grid-wrap"><table class="pe-grid" id="pe-grid-lingual"></table></div>
      </div>

      <div class="pe-section">
        <div class="pe-section-head">
          <span class="pe-section-name">Buccal</span>
          <span class="pe-section-rl">(lower arch — click a tooth to mark it missing · M / B / D columns per tooth)</span>
        </div>
        <div id="pe-diagram-buccal-lower" class="pe-diagram-wrap"></div>
        <div class="pe-grid-wrap"><table class="pe-grid" id="pe-grid-buccal-lower"></table></div>
      </div>

      <div class="pe-legend">
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#1a7a1a;"></span>PD 1–3mm — Healthy</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#b8860b;"></span>PD 4–5mm — Monitor</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#cc0000;"></span>PD ≥ 6mm — Disease</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#e9ecef;border:1px dashed #cbd3db;"></span>Missing tooth</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#ccc;"></span>M / B / D = Mesial / Buccal-Mid / Distal site</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#ccc;"></span>Furcation / Plaque / Bleeding / Pus = Yes-No per tooth (Buccal only)</div>
      </div>
    </div>
  </div>

  <!-- ═════════ VIEW 2: PLAQUE & BLEEDING ═════════ -->
  <div class="pe-view" data-view="plaque">
    <div class="pe-card">
      <div class="pe-sc-head">
        <span class="pe-section-name">🟡 Plaque</span>
        <span class="pe-sc-hint">Click a surface to mark plaque · click a tooth number to mark it missing</span>
        <div class="pe-sc-actions">
          <button class="pe-mini-btn pe-sc-all" data-ds="plaque">Mark all</button>
          <button class="pe-mini-btn pe-sc-clear" data-ds="plaque">Clear</button>
        </div>
      </div>
      <div class="pe-score-row" id="pe-score-plaque"></div>
      <div id="pe-sc-plaque" class="pe-sc-wrap"></div>
    </div>

    <div class="pe-card">
      <div class="pe-sc-head">
        <span class="pe-section-name">🔴 Bleeding</span>
        <span class="pe-sc-hint">Click a surface to mark bleeding on probing</span>
        <div class="pe-sc-actions">
          <button class="pe-mini-btn pe-sc-all" data-ds="bleeding">Mark all</button>
          <button class="pe-mini-btn pe-sc-clear" data-ds="bleeding">Clear</button>
        </div>
      </div>
      <div class="pe-score-row" id="pe-score-bleeding"></div>
      <div id="pe-sc-bleeding" class="pe-sc-wrap"></div>
    </div>
  </div>

  <!-- ═════════ VIEW 3: POCKET DEPTH & RECESSION ═════════ -->
  <div class="pe-view" data-view="pocket">
    <div class="pe-card">
      <div class="pe-sc-head">
        <span class="pe-section-name">📏 Pocket Depth (mm)</span>
        <span class="pe-sc-hint">Pick a value, then click surfaces · click the same value again to remove it</span>
        <div class="pe-sc-actions">
          <button class="pe-mini-btn pe-sc-clear" data-ds="pd">Clear</button>
        </div>
      </div>
      <div class="pe-palette" id="pe-pal-pd"></div>
      <div class="pe-score-row" id="pe-score-pd"></div>
      <div id="pe-sc-pd" class="pe-sc-wrap"></div>
      <div class="pe-legend" style="margin-top:10px">
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#c8f0c8;"></span>1–3 mm</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#ffe29a;"></span>4–5 mm</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#ffb3b3;"></span>≥ 6 mm</div>
      </div>
    </div>

    <div class="pe-card">
      <div class="pe-sc-head">
        <span class="pe-section-name">📉 Recession (mm)</span>
        <span class="pe-sc-hint">Pick a value, then click surfaces · click the same value again to remove it</span>
        <div class="pe-sc-actions">
          <button class="pe-mini-btn pe-sc-clear" data-ds="rec">Clear</button>
        </div>
      </div>
      <div class="pe-palette" id="pe-pal-rec"></div>
      <div class="pe-score-row" id="pe-score-rec"></div>
      <div id="pe-sc-rec" class="pe-sc-wrap"></div>
      <div class="pe-legend" style="margin-top:10px">
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#eef2f7;"></span>0 mm</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#cfe3ff;"></span>1–2 mm</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#8fbaf5;"></span>3–4 mm</div>
        <div class="pe-legend-item"><span class="pe-swatch" style="background:#4a86d8;"></span>≥ 5 mm</div>
      </div>
    </div>
  </div>

  <!-- Save bar -->
  <div class="pe-actions">
    <span id="pe-save-msg" class="pe-save-msg"></span>
    <button id="pe-clear-btn" class="pe-btn pe-btn-secondary">Clear Form</button>
    <button id="pe-save-btn" class="pe-btn pe-btn-primary">Save Exam</button>
  </div>

</div>
`);

    $("#pe-exam-date").val(frappe.datetime.get_today());

    // ── Link controls ──────────────────────────────────────────────────────
    const patientCtrl = frappe.ui.form.make_control({
        parent: $(".pe-patient-input"),
        df: {
            fieldtype: "Link",
            options: "Patient",
            fieldname: "patient",
            placeholder: "Search patient name or ID...",
        },
        only_input: true,
        render_input: true,
    });

    const practitionerCtrl = frappe.ui.form.make_control({
        parent: $(".pe-practitioner-input"),
        df: {
            fieldtype: "Link",
            options: "Healthcare Practitioner",
            fieldname: "practitioner",
            placeholder: "Search practitioner...",
        },
        only_input: true,
        render_input: true,
    });

    function showLinkTitle(ctrl, doctype, name, title) {
        if (!name || !title) return;
        if (frappe.utils.add_link_title) frappe.utils.add_link_title(doctype, name, title);
        if (ctrl.set_formatted_input) ctrl.set_formatted_input(name);
    }
    async function showPatientName(patientId) {
        if (!patientId) return;
        try {
            const r = await frappe.db.get_value("Patient", patientId, "patient_name");
            showLinkTitle(patientCtrl, "Patient", patientId, r && r.message && r.message.patient_name);
        } catch (e) { console.warn("[Perio] could not fetch patient_name:", e); }
    }
    async function setPractitioner(id) {
        await Promise.resolve(practitionerCtrl.set_value(id || ""));
        if (!id) return;
        try {
            const r = await frappe.db.get_value("Healthcare Practitioner", id, "practitioner_name");
            showLinkTitle(practitionerCtrl, "Healthcare Practitioner", id, r && r.message && r.message.practitioner_name);
        } catch (e) { /* keep ID */ }
    }
    /** Default practitioner = the Healthcare Practitioner linked to the logged-in user (if any). */
    async function prefillPractitioner() {
        if (practitionerCtrl.get_value()) return;
        try {
            const r = await frappe.db.get_value("Healthcare Practitioner", { user_id: frappe.session.user }, "name");
            const id = r && r.message && r.message.name;
            if (id) await setPractitioner(id);
        } catch (e) { /* no linked practitioner */ }
    }
    practitionerCtrl.$input.on("change", function () {
        const v = practitionerCtrl.get_value();
        if (v) setPractitioner(v);
    });

    function renderAssessedBy() {
        $("#pe-assessed-by").val(fullName(assessedByUser));
    }

    patientCtrl.$input.on("change", function () {
        const val = patientCtrl.get_value();
        if (val && val !== selectedPatient) openPatient(val, false);
    });

    /** Switch the page to a patient: blank new exam + their exam list. */
    function openPatient(patientId, setInput = true) {
        selectedPatient = patientId;
        const p = setInput ? Promise.resolve(patientCtrl.set_value(patientId)) : Promise.resolve();
        p.then(() => showPatientName(patientId));
        resetFormFields();
        fetchExamPicker(patientId);
    }

    /** Patient sent from the Patient form via frappe.route_options. */
    function applyRouteOptions() {
        const opts = frappe.route_options;
        if (!opts || !opts.patient) return;
        frappe.route_options = null;
        if (opts.patient !== selectedPatient) openPatient(opts.patient);
    }
    window._pe = { applyRouteOptions };

    // ── Severity enabled only when Periodontitis = Present ────────────────
    function refreshSeverityState() {
        const present = $('input[name="pe-periodontitis"]:checked').val() === "Present";
        $("#pe-severity-row input").prop("disabled", !present);
        if (!present) $("#pe-severity-row input").prop("checked", false);
    }
    $(document).on("change", 'input[name="pe-periodontitis"]', refreshSeverityState);
    refreshSeverityState();

    // ── View toggle ────────────────────────────────────────────────────────
    $(document).on("click", ".pe-tab", function () {
        currentView = $(this).data("view");
        $(".pe-tab").removeClass("active");
        $(this).addClass("active");
        $(".pe-view").removeClass("active");
        $(`.pe-view[data-view="${currentView}"]`).addClass("active");
    });

    // ══════════════════════════════════════════════════════════════════════
    //  VIEW 1 — GRID CHART
    // ══════════════════════════════════════════════════════════════════════
    const RECESSION_ROWS = 2;
    const POCKET_DEPTH_ROWS = 4;
    const MOBILITY_ROWS = 2;
    const BOOL_ROWS = [
        { field: "furcation", label: "Furcation" },
        { field: "plaque", label: "Plaque" },
        { field: "bleeding", label: "Bleeding" },
        { field: "pus", label: "Pus" },
    ];

    function buildGrid(elId, teeth, surface, includeMobility) {
        const groups = [
            { field: "recession", type: "Recession", unit: "mm", rows: RECESSION_ROWS, max: 20 },
            { field: "pocket_depth", type: "Pocket Depth", unit: "mm", rows: POCKET_DEPTH_ROWS, max: 20 },
        ];
        if (includeMobility) {
            groups.push({ field: "mobility", type: "Mobility", unit: "0–3", rows: MOBILITY_ROWS, max: 3 });
        }
        const boolGroups = includeMobility ? BOOL_ROWS : [];

        let colgroup = `<colgroup><col style="width:80px"><col style="width:22px">`;
        teeth.forEach(() => SITES.forEach(() => (colgroup += `<col style="width:34px">`)));
        colgroup += `</colgroup>`;

        let html = `${colgroup}<thead><tr><th colspan="2" rowspan="2">Tooth</th>`;
        teeth.forEach((tn, idx) => {
            const alt = idx % 2 === 1 ? " pe-tooth-alt" : "";
            html += `<th class="pe-tooth-start${alt}" colspan="3">${quadrantLabel(tn)}</th>`;
        });
        html += `</tr><tr>`;
        teeth.forEach((tn, idx) => {
            const alt = idx % 2 === 1 ? " pe-tooth-alt" : "";
            SITES.forEach((s, sIdx) => {
                const start = sIdx === 0 ? " pe-tooth-start" : "";
                html += `<th class="pe-site-label${start}${alt}">${SITE_LABELS[s]}</th>`;
            });
        });
        html += `</tr></thead><tbody>`;

        groups.forEach((g) => {
            for (let i = 1; i <= g.rows; i++) {
                html += `<tr>`;
                if (i === 1) html += `<th class="pe-row-group" rowspan="${g.rows}">${g.type}<span class="pe-row-unit">(${g.unit})</span></th>`;
                html += `<th class="pe-row-site">${i}</th>`;
                teeth.forEach((tn, idx) => {
                    const alt = idx % 2 === 1 ? " pe-tooth-alt" : "";
                    SITES.forEach((s, sIdx) => {
                        const start = sIdx === 0 ? " pe-tooth-start" : "";
                        html += `<td class="pe-cell-td${start}${alt}"><input type="number" min="0" max="${g.max}" step="1"
class="pe-cell-input" data-field="${g.field}-${i}" data-site="${s}" data-surface="${surface}" data-tooth="${tn}" /></td>`;
                    });
                });
                html += `</tr>`;
            }
        });

        boolGroups.forEach((g) => {
            html += `<tr><th class="pe-row-group">${g.label}</th><th class="pe-row-site"></th>`;
            teeth.forEach((tn, idx) => {
                const alt = idx % 2 === 1 ? " pe-tooth-alt" : "";
                html += `<td class="pe-cell-td pe-tooth-start${alt}" colspan="3">
<label class="pe-bool-toggle">
<input type="checkbox" class="pe-bool-input" data-field="${g.field}" data-surface="${surface}" data-tooth="${tn}" />
<span class="pe-bool-text">No</span>
</label></td>`;
            });
            html += `</tr>`;
        });

        html += `</tbody>`;
        $(`#${elId}`).html(html);
    }
    buildGrid("pe-grid-buccal-upper", UPPER_TEETH, "Buccal", true);
    buildGrid("pe-grid-palatal", UPPER_TEETH, "Palatal", false);
    buildGrid("pe-grid-lingual", LOWER_TEETH, "Lingual", false);
    buildGrid("pe-grid-buccal-lower", LOWER_TEETH, "Buccal", true);

    $(document).on("input", '.pe-cell-input[data-field^="pocket_depth-"]', function () {
        const v = parseInt($(this).val()) || 0;
        $(this).removeClass("pd-h pd-w pd-d");
        const band = pdBand(v);
        if (band) $(this).addClass(band);
    });

    $(document).on("change", ".pe-bool-input", function () {
        const checked = $(this).prop("checked");
        $(this).siblings(".pe-bool-text").text(checked ? "Yes" : "No");
        $(this).closest(".pe-bool-toggle").toggleClass("is-yes", checked);
    });

    // ── Tooth outline diagrams (grid view) ─────────────────────────────────
    function toothShapePath(x, y, w, h) {
        const cx = x + w / 2;
        return `M ${x} ${y + h * 0.32}
C ${x} ${y} ${x + w} ${y} ${x + w} ${y + h * 0.32}
C ${x + w} ${y + h * 0.58} ${cx + w * 0.3} ${y + h * 0.68} ${cx + w * 0.22} ${y + h * 0.8}
C ${cx + w * 0.16} ${y + h * 0.92} ${cx + w * 0.08} ${y + h} ${cx} ${y + h}
C ${cx - w * 0.08} ${y + h} ${cx - w * 0.16} ${y + h * 0.92} ${cx - w * 0.22} ${y + h * 0.8}
C ${cx - w * 0.3} ${y + h * 0.68} ${x} ${y + h * 0.58} ${x} ${y + h * 0.32}
Z`;
    }
    function toothCellSVG(tn, x, y, w, h) {
        const isMissing = missingTeeth.has(tn);
        const cls = "pe-tooth-shape" + (isMissing ? " missing" : "");
        let s = `<g class="pe-tooth-click" data-tooth="${tn}" style="cursor:pointer;">`;
        s += `<path class="${cls}" d="${toothShapePath(x, y, w, h)}" fill="${isMissing ? "#e9ecef" : "#fff"}"></path>`;
        s += `<text class="pe-tooth-num" x="${x + w / 2}" y="${y - 3}">${quadrantLabel(tn)}</text>`;
        if (isMissing) s += `<text class="pe-tooth-x" x="${x + w / 2}" y="${y + h / 2 + 4}">✕</text>`;
        s += `</g>`;
        return s;
    }
    function renderArchDiagram(elId, teeth) {
        const toothW = 30, toothH = 30, gap = 3, padX = 8, padY = 12;
        const svgW = teeth.length * toothW + (teeth.length - 1) * gap + padX * 2;
        const svgH = padY + toothH + 4;
        let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">`;
        let x = padX;
        teeth.forEach((tn) => { svg += toothCellSVG(tn, x, padY, toothW, toothH); x += toothW + gap; });
        svg += `</svg>`;
        $(`#${elId}`).html(svg);
    }

    function toggleMissing(tn) {
        if (missingTeeth.has(tn)) missingTeeth.delete(tn);
        else missingTeeth.add(tn);
        renderDiagrams();
    }
    $(document).on("click", ".pe-tooth-click", function () { toggleMissing(parseInt($(this).data("tooth"))); });
    $(document).on("click", ".pe-sc-num", function () { toggleMissing(parseInt($(this).data("tooth"))); });

    function applyMissingStateToGrids() {
        $(".pe-cell-input").each(function () {
            const disabled = missingTeeth.has(parseInt($(this).data("tooth")));
            $(this).prop("disabled", disabled);
            if (disabled) $(this).val("").removeClass("pd-h pd-w pd-d");
        });
        $(".pe-bool-input").each(function () {
            const disabled = missingTeeth.has(parseInt($(this).data("tooth")));
            $(this).prop("disabled", disabled);
            if (disabled) {
                $(this).prop("checked", false);
                $(this).siblings(".pe-bool-text").text("No");
                $(this).closest(".pe-bool-toggle").removeClass("is-yes");
            }
        });
    }
    function refreshTeethCounts() {
        $("#pe-teeth-present").val(32 - missingTeeth.size);
        $("#pe-teeth-lost").val(missingTeeth.size);
    }

    /** Re-draw everything that depends on missing teeth. */
    function renderDiagrams() {
        renderArchDiagram("pe-diagram-buccal-upper", UPPER_TEETH);
        renderArchDiagram("pe-diagram-palatal", UPPER_TEETH);
        renderArchDiagram("pe-diagram-lingual", LOWER_TEETH);
        renderArchDiagram("pe-diagram-buccal-lower", LOWER_TEETH);
        applyMissingStateToGrids();
        refreshTeethCounts();
        renderSurfaceCharts();
    }

    // ══════════════════════════════════════════════════════════════════════
    //  VIEWS 2 & 3 — 4-SURFACE TRIANGULAR CHARTS
    //  Each tooth = square split into 4 triangles:
    //    Upper arch: top = Buccal, bottom = Palatal
    //    Lower arch: top = Lingual, bottom = Buccal
    //    Mesial always faces the midline, Distal faces away.
    // ══════════════════════════════════════════════════════════════════════
    function getSurf(ds, tn, surf) {
        const t = surfaceData[ds][tn];
        return t ? t[surf] : undefined;
    }
    function setSurf(ds, tn, surf, val) {
        if (!surfaceData[ds][tn]) surfaceData[ds][tn] = {};
        if (val === null || val === undefined) delete surfaceData[ds][tn][surf];
        else surfaceData[ds][tn][surf] = val;
        if (!Object.keys(surfaceData[ds][tn]).length) delete surfaceData[ds][tn];
    }
    function surfName(surf, isUpper) {
        return { B: "Buccal", L: isUpper ? "Palatal" : "Lingual", M: "Mesial", D: "Distal" }[surf];
    }
    function fillFor(ds, v) {
        const has = v !== undefined && v !== null;
        if (ds === "plaque") return has ? "#f5c518" : "#fff";
        if (ds === "bleeding") return has ? "#e53935" : "#fff";
        if (ds === "pd") {
            if (!has) return "#fff";
            if (v <= 3) return "#c8f0c8";
            if (v <= 5) return "#ffe29a";
            return "#ffb3b3";
        }
        if (ds === "rec") {
            if (!has) return "#fff";
            if (v === 0) return "#eef2f7";
            if (v <= 2) return "#cfe3ff";
            if (v <= 4) return "#8fbaf5";
            return "#4a86d8";
        }
        return "#fff";
    }

    function surfaceToothSVG(tn, ds, isUpper) {
        const SZ = 40, C = 20;
        if (missingTeeth.has(tn)) {
            return `<svg viewBox="0 0 ${SZ} ${SZ}" width="${SZ}" height="${SZ}" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" y="0.5" width="${SZ - 1}" height="${SZ - 1}" fill="#e9ecef" stroke="#cbd3db" stroke-dasharray="2,2"/>
                <line x1="6" y1="6" x2="${SZ - 6}" y2="${SZ - 6}" stroke="#b33" stroke-width="2" stroke-linecap="round" opacity=".6"/>
                <line x1="${SZ - 6}" y1="6" x2="6" y2="${SZ - 6}" stroke="#b33" stroke-width="2" stroke-linecap="round" opacity=".6"/>
                <title>${quadrantLabel(tn)} · Missing</title>
            </svg>`;
        }
        const viewerLeft = tn <= 8 || tn >= 25;   // UR / LR teeth sit on the viewer's left
        const pos = {
            top: isUpper ? "B" : "L",
            bottom: isUpper ? "L" : "B",
            right: viewerLeft ? "M" : "D",
            left: viewerLeft ? "D" : "M",
        };
        const polys = {
            top: `0,0 ${SZ},0 ${C},${C}`,
            right: `${SZ},0 ${SZ},${SZ} ${C},${C}`,
            bottom: `${SZ},${SZ} 0,${SZ} ${C},${C}`,
            left: `0,${SZ} 0,0 ${C},${C}`,
        };
        const txt = { top: [C, 11], right: [33, C + 3], bottom: [C, 36], left: [7, C + 3] };
        const numeric = ds === "pd" || ds === "rec";

        let inner = "";
        ["top", "right", "bottom", "left"].forEach((p) => {
            const surf = pos[p];
            const v = getSurf(ds, tn, surf);
            const has = v !== undefined && v !== null;
            inner += `<polygon class="pe-sc-surf" data-ds="${ds}" data-tooth="${tn}" data-surf="${surf}"
                points="${polys[p]}" fill="${fillFor(ds, v)}">
                <title>${quadrantLabel(tn)} · ${surfName(surf, isUpper)}${has ? (numeric ? ": " + v + " mm" : ": Yes") : ""}</title>
            </polygon>`;
            if (numeric && has) inner += `<text class="pe-sc-txt" x="${txt[p][0]}" y="${txt[p][1]}">${v}</text>`;
        });

        return `<svg viewBox="0 0 ${SZ} ${SZ}" width="${SZ}" height="${SZ}" xmlns="http://www.w3.org/2000/svg">
            ${inner}
            <rect x="0.5" y="0.5" width="${SZ - 1}" height="${SZ - 1}" fill="none" stroke="#9fb3c8" stroke-width="1" pointer-events="none"/>
        </svg>`;
    }

    function archCells(teeth, ds, isUpper) {
        return teeth.map((tn, i) =>
            (i === 8 ? `<div class="pe-sc-mid"></div>` : "") +
            `<div class="pe-sc-tooth">
                <div class="pe-sc-num" data-tooth="${tn}" title="Click to mark missing / present">${quadrantLabel(tn)}</div>
                ${surfaceToothSVG(tn, ds, isUpper)}
            </div>`
        ).join("");
    }

    function surfaceChartHTML(ds) {
        return `
            <div class="pe-sc-arch-lbl">Upper arch · Buccal ↑ · Palatal ↓</div>
            <div class="pe-sc-arch">${archCells(UPPER_TEETH, ds, true)}</div>
            <div class="pe-sc-divider"></div>
            <div class="pe-sc-arch lower">${archCells(LOWER_TEETH, ds, false)}</div>
            <div class="pe-sc-arch-lbl">Lower arch · Lingual ↑ · Buccal ↓</div>`;
    }

    // ── Stats ──────────────────────────────────────────────────────────────
    function presentTeeth() {
        return ALL_TEETH.filter((t) => !missingTeeth.has(t));
    }
    function pct(n, d) {
        return d ? Math.round((n / d) * 1000) / 10 : 0;
    }
    function flagStats(ds) {
        const teeth = presentTeeth();
        let surfaces = 0, teethWith = 0;
        teeth.forEach((tn) => {
            const n = Object.keys(surfaceData[ds][tn] || {}).length;
            surfaces += n;
            if (n) teethWith++;
        });
        const total = teeth.length * 4;
        return { surfaces, total, pct: pct(surfaces, total), teethWith, teethTotal: teeth.length, teethPct: pct(teethWith, teeth.length) };
    }
    function valueStats(ds) {
        const teeth = presentTeeth();
        const vals = [];
        teeth.forEach((tn) => Object.values(surfaceData[ds][tn] || {}).forEach((v) => vals.push(v)));
        const total = teeth.length * 4;
        const recorded = vals.length;
        const mean = recorded ? Math.round((vals.reduce((a, b) => a + b, 0) / recorded) * 10) / 10 : 0;
        return {
            vals, total, recorded, mean,
            max: recorded ? Math.max(...vals) : 0,
            ge4: vals.filter((v) => v >= 4).length,
            ge6: vals.filter((v) => v >= 6).length,
            pos: vals.filter((v) => v > 0).length,
        };
    }

    const GRAD = {
        green: ["#16a34a", "#22c55e"],
        amber: ["#d97706", "#f59e0b"],
        red: ["#dc2626", "#f43f5e"],
        blue: ["#1B4F8A", "#3b82f6"],
        slate: ["#475569", "#64748b"],
    };
    function levelColor(p) {
        if (p <= 20) return GRAD.green;
        if (p <= 40) return GRAD.amber;
        return GRAD.red;
    }
    function scoreCard(label, big, sub, colors) {
        return `<div class="pe-score" style="background:linear-gradient(135deg, ${colors[0]}, ${colors[1]})">
            <div class="pe-score-lbl">${label}</div>
            <div class="pe-score-big">${big}</div>
            <div class="pe-score-sub">${sub}</div>
        </div>`;
    }

    function renderScores() {
        ["plaque", "bleeding"].forEach((ds) => {
            const s = flagStats(ds);
            const name = ds === "plaque" ? "Plaque" : "Bleeding";
            $(`#pe-score-${ds}`).html(
                scoreCard(`${name} Score`, `${s.pct}%`, `${s.surfaces} / ${s.total} surfaces`, levelColor(s.pct)) +
                scoreCard(`Teeth with ${name.toLowerCase()}`, `${s.teethWith} / ${s.teethTotal}`, `${s.teethPct}% of present teeth`, levelColor(s.teethPct)) +
                scoreCard("Present teeth", `${s.teethTotal}`, `${s.total} surfaces charted (4 per tooth)`, GRAD.slate)
            );
        });

        const pd = valueStats("pd");
        const pd4 = pct(pd.ge4, pd.recorded), pd6 = pct(pd.ge6, pd.recorded);
        $("#pe-score-pd").html(
            scoreCard("Mean pocket depth", `${pd.mean} mm`, `${pd.recorded} / ${pd.total} surfaces recorded`, GRAD.blue) +
            scoreCard("Sites ≥ 4 mm", `${pd.ge4} / ${pd.recorded}`, `${pd4}% of recorded sites`, levelColor(pd4)) +
            scoreCard("Sites ≥ 6 mm", `${pd.ge6} / ${pd.recorded}`, `${pd6}% of recorded sites`, pd.ge6 ? GRAD.red : GRAD.green)
        );

        const rc = valueStats("rec");
        const rcp = pct(rc.pos, rc.recorded);
        $("#pe-score-rec").html(
            scoreCard("Mean recession", `${rc.mean} mm`, `${rc.recorded} / ${rc.total} surfaces recorded`, GRAD.blue) +
            scoreCard("Sites with recession", `${rc.pos} / ${rc.recorded}`, `${rcp}% of recorded sites`, levelColor(rcp)) +
            scoreCard("Max recession", `${rc.max} mm`, "deepest recorded site", rc.max >= 5 ? GRAD.red : rc.max >= 3 ? GRAD.amber : GRAD.green)
        );
    }

    function renderPalettes() {
        const build = (ds, values, label) => {
            let html = `<span class="pe-palette-lbl">${label}</span>`;
            values.forEach((v) => {
                html += `<button class="pe-pal-btn${selectedVal[ds] === v ? " active" : ""}" data-ds="${ds}" data-val="${v}">${v}</button>`;
            });
            html += `<button class="pe-pal-btn${selectedVal[ds] === "clear" ? " active" : ""}" data-ds="${ds}" data-val="clear" title="Eraser">✕</button>`;
            $(`#pe-pal-${ds}`).html(html);
        };
        build("pd", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "Value (mm)");
        build("rec", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "Value (mm)");
    }

    function renderSurfaceCharts() {
        ["plaque", "bleeding", "pd", "rec"].forEach((ds) => $(`#pe-sc-${ds}`).html(surfaceChartHTML(ds)));
        renderScores();
        renderPalettes();
    }

    /** Keep the per-tooth Plaque / Bleeding Yes-No in the grid in sync with the surface chart. */
    function syncBool(ds, tn) {
        if (ds !== "plaque" && ds !== "bleeding") return;
        const any = Object.keys(surfaceData[ds][tn] || {}).length > 0;
        const $cb = $(`.pe-bool-input[data-field="${ds}"][data-tooth="${tn}"]`);
        if ($cb.length && !$cb.prop("disabled")) $cb.prop("checked", any).trigger("change");
    }

    // Surface click
    $(document).on("click", ".pe-sc-surf", function () {
        const ds = String($(this).attr("data-ds"));
        const tn = parseInt($(this).attr("data-tooth"));
        const surf = String($(this).attr("data-surf"));
        const cur = getSurf(ds, tn, surf);

        if (ds === "plaque" || ds === "bleeding") {
            setSurf(ds, tn, surf, cur ? null : 1);
            syncBool(ds, tn);
        } else {
            const sel = selectedVal[ds];
            if (sel === "clear" || cur === sel) setSurf(ds, tn, surf, null);
            else setSurf(ds, tn, surf, sel);
        }
        renderSurfaceCharts();
    });

    // Palette pick
    $(document).on("click", ".pe-pal-btn", function () {
        const ds = String($(this).attr("data-ds"));
        const v = $(this).attr("data-val");
        selectedVal[ds] = v === "clear" ? "clear" : parseInt(v);
        renderPalettes();
    });

    // Mark all / Clear
    $(document).on("click", ".pe-sc-all", function () {
        const ds = String($(this).attr("data-ds"));
        presentTeeth().forEach((tn) => {
            SURFACES.forEach((s) => setSurf(ds, tn, s, 1));
            syncBool(ds, tn);
        });
        renderSurfaceCharts();
    });
    $(document).on("click", ".pe-sc-clear", function () {
        const ds = String($(this).attr("data-ds"));
        surfaceData[ds] = {};
        ALL_TEETH.forEach((tn) => syncBool(ds, tn));
        renderSurfaceCharts();
    });

    /** Surface data without missing teeth — what gets saved. */
    function cleanSurfaceData() {
        const out = emptySurfaceData();
        Object.keys(out).forEach((ds) => {
            Object.keys(surfaceData[ds]).forEach((tn) => {
                if (!missingTeeth.has(parseInt(tn))) out[ds][tn] = { ...surfaceData[ds][tn] };
            });
        });
        return out;
    }

    renderDiagrams();

    // ══════════════════════════════════════════════════════════════════════
    //  LOAD / RESET / SAVE
    // ══════════════════════════════════════════════════════════════════════
    function fetchExamPicker(patient) {
        $("#pe-exam-picker").html('<option value="">Loading...</option>').prop("disabled", true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Dental Perio Exam",
                filters: [["patient", "=", patient]],
                fields: ["name", "exam_date", "assessed_by", "owner"],
                order_by: "exam_date desc",
                limit: 50,
            },
            callback: function (r) {
                const exams = r.message || [];
                $("#pe-exam-picker").empty().append('<option value="">— New exam —</option>').prop("disabled", false);
                exams.forEach((e) => {
                    const by = fullName(e.assessed_by || e.owner);
                    const label = `${frappe.datetime.str_to_user(e.exam_date)}${by ? " · " + by : ""}`;
                    $("#pe-exam-picker").append(`<option value="${e.name}">${label}</option>`);
                });
                if (existingExamName && exams.find((e) => e.name === existingExamName)) {
                    $("#pe-exam-picker").val(existingExamName);
                    loadExam(existingExamName);
                }
            },
            error: function () {
                $("#pe-exam-picker").empty().append('<option value="">— New exam —</option>').prop("disabled", false);
                frappe.msgprint({
                    title: "DocType Not Found",
                    message: "Could not query 'Dental Perio Exam'. Ensure the Custom DocType exists and permissions are set.",
                    indicator: "red",
                });
            },
        });
    }
    $(document).on("change", "#pe-exam-picker", function () {
        const name = $(this).val();
        existingExamName = name || null;
        if (name) loadExam(name);
        else resetFormFields();
    });

    function resetFormFields() {
        existingExamName = null;
        missingTeeth = new Set();
        surfaceData = emptySurfaceData();
        assessedByUser = frappe.session.user;
        renderAssessedBy();
        practitionerCtrl.set_value("");
        prefillPractitioner();
        $("#pe-exam-date").val(frappe.datetime.get_today());
        $('input[name="pe-periodontitis"][value="Absent"]').prop("checked", true);
        $('input[name="pe-severity"]').prop("checked", false);
        refreshSeverityState();
        $("#pe-other-findings").val("");
        $("#pe-recommendation").val("");
        $(".pe-cell-input").val("").prop("disabled", false).removeClass("pd-h pd-w pd-d");
        $(".pe-bool-input").prop("checked", false).prop("disabled", false);
        $(".pe-bool-text").text("No");
        $(".pe-bool-toggle").removeClass("is-yes");
        renderDiagrams();
        $("#pe-save-msg").text("");
    }
    $("#pe-clear-btn").on("click", function () {
        frappe.confirm("Clear all entered data on this form? This does not delete a saved record.", resetFormFields);
    });

    function loadExam(name) {
        frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Dental Perio Exam", name: name },
            callback: function (r) {
                const doc = r.message;
                if (!doc) return;
                existingExamName = doc.name;

                // Assessed by = the user who created the exam
                assessedByUser = doc.owner || doc.assessed_by || frappe.session.user;
                renderAssessedBy();
                setPractitioner(doc[F.practitioner] || "");

                $("#pe-exam-date").val(doc.exam_date || frappe.datetime.get_today());
                $(`input[name="pe-periodontitis"][value="${doc.periodontitis || "Absent"}"]`).prop("checked", true);
                refreshSeverityState();
                if (doc.severity) $(`input[name="pe-severity"][value="${doc.severity}"]`).prop("checked", true);
                $("#pe-other-findings").val(doc.other_findings || "");
                $("#pe-recommendation").val(doc.recommendation || "");

                missingTeeth = new Set(
                    (doc.missing_teeth || "").split(",").map((s) => parseInt(s.trim())).filter((n) => n),
                );

                // 4-surface charts
                surfaceData = emptySurfaceData();
                if (doc[F.surface_chart]) {
                    try {
                        const parsed = JSON.parse(doc[F.surface_chart]);
                        Object.keys(surfaceData).forEach((ds) => { if (parsed[ds]) surfaceData[ds] = parsed[ds]; });
                    } catch (e) { console.warn("[Perio] could not parse surface chart:", e); }
                }

                // Grid values
                $(".pe-cell-input").val("").removeClass("pd-h pd-w pd-d");
                $(".pe-bool-input").prop("checked", false);
                $(".pe-bool-text").text("No");
                $(".pe-bool-toggle").removeClass("is-yes");
                (doc.perio_measurements || []).forEach((row) => {
                    const fieldMap = [];
                    for (let i = 1; i <= RECESSION_ROWS; i++) SITES.forEach((s) => fieldMap.push([`recession_${i}_s${s}`, `recession-${i}`, s, false]));
                    for (let i = 1; i <= POCKET_DEPTH_ROWS; i++) SITES.forEach((s) => fieldMap.push([`pocket_depth_${i}_s${s}`, `pocket_depth-${i}`, s, true]));
                    for (let i = 1; i <= MOBILITY_ROWS; i++) SITES.forEach((s) => fieldMap.push([`mobility_${i}_s${s}`, `mobility-${i}`, s, false]));
                    fieldMap.forEach(([docField, uiField, site, colour]) => {
                        if (row[docField] === undefined || row[docField] === null) return;
                        const $input = $(`.pe-cell-input[data-field="${uiField}"][data-site="${site}"][data-surface="${row.surface}"][data-tooth="${row.tooth_number}"]`);
                        if ($input.length) {
                            $input.val(row[docField]);
                            if (colour) {
                                const band = pdBand(parseInt(row[docField]));
                                if (band) $input.addClass(band);
                            }
                        }
                    });
                    BOOL_ROWS.forEach(({ field }) => {
                        if (row[field] === undefined || row[field] === null) return;
                        const $cb = $(`.pe-bool-input[data-field="${field}"][data-surface="${row.surface}"][data-tooth="${row.tooth_number}"]`);
                        if ($cb.length) $cb.prop("checked", !!parseInt(row[field])).trigger("change");
                    });
                });

                renderDiagrams();
                $("#pe-save-msg").text(`Loaded exam ${doc.name}`);
            },
            error: function () {
                frappe.msgprint({ title: "Load Error", message: "Could not load the selected exam. Check permissions.", indicator: "red" });
            },
        });
    }

    function collectPayload() {
        const measurements = [];

        function collectSurface(surface, teeth, includeMobility) {
            teeth.forEach((tn) => {
                if (missingTeeth.has(tn)) return;
                const getVal = (field, site) => {
                    const v = $(`.pe-cell-input[data-field="${field}"][data-site="${site}"][data-surface="${surface}"][data-tooth="${tn}"]`).val();
                    return v === "" || v === undefined ? null : parseInt(v);
                };
                const row = { tooth_number: tn, surface: surface };
                for (let i = 1; i <= RECESSION_ROWS; i++) SITES.forEach((s) => (row[`recession_${i}_s${s}`] = getVal(`recession-${i}`, s)));
                for (let i = 1; i <= POCKET_DEPTH_ROWS; i++) SITES.forEach((s) => (row[`pocket_depth_${i}_s${s}`] = getVal(`pocket_depth-${i}`, s)));
                if (includeMobility) {
                    for (let i = 1; i <= MOBILITY_ROWS; i++) SITES.forEach((s) => (row[`mobility_${i}_s${s}`] = getVal(`mobility-${i}`, s)));
                    BOOL_ROWS.forEach(({ field }) => {
                        row[field] = $(`.pe-bool-input[data-field="${field}"][data-surface="${surface}"][data-tooth="${tn}"]`).prop("checked") ? 1 : 0;
                    });
                }
                const boolNames = BOOL_ROWS.map((b) => b.field);
                const hasAny = Object.keys(row).some((k) => {
                    if (k === "tooth_number" || k === "surface") return false;
                    if (boolNames.includes(k)) return row[k] === 1;
                    return row[k] !== null;
                });
                if (hasAny) measurements.push(row);
            });
        }
        collectSurface("Buccal", UPPER_TEETH, true);
        collectSurface("Palatal", UPPER_TEETH, false);
        collectSurface("Lingual", LOWER_TEETH, false);
        collectSurface("Buccal", LOWER_TEETH, true);

        const plaque = flagStats("plaque");
        const bleeding = flagStats("bleeding");

        const doc = {
            patient: selectedPatient,
            exam_date: $("#pe-exam-date").val(),
            assessed_by: assessedByUser,
            total_teeth_present: parseInt($("#pe-teeth-present").val()) || 0,
            total_teeth_lost: parseInt($("#pe-teeth-lost").val()) || 0,
            periodontitis: $('input[name="pe-periodontitis"]:checked').val() || "Absent",
            severity: $('input[name="pe-severity"]:checked').val() || "",
            other_findings: $("#pe-other-findings").val(),
            recommendation: $("#pe-recommendation").val(),
            missing_teeth: Array.from(missingTeeth).sort((a, b) => a - b).join(","),
            perio_measurements: measurements,
        };
        doc[F.practitioner] = practitionerCtrl.get_value() || "";
        doc[F.surface_chart] = JSON.stringify(cleanSurfaceData());
        doc[F.plaque_score] = plaque.pct;
        doc[F.plaque_fraction] = `${plaque.surfaces}/${plaque.total}`;
        doc[F.bleeding_score] = bleeding.pct;
        doc[F.bleeding_fraction] = `${bleeding.surfaces}/${bleeding.total}`;
        return doc;
    }

    $("#pe-save-btn").on("click", async function () {
        if (!selectedPatient) {
            frappe.msgprint({ title: "No Patient", message: "Please select a patient before saving.", indicator: "orange" });
            return;
        }
        if (!$("#pe-exam-date").val()) {
            frappe.msgprint({ title: "No Exam Date", message: "Please set the exam date.", indicator: "orange" });
            return;
        }
        const payload = collectPayload();
        $("#pe-save-btn").prop("disabled", true).text("Saving...");
        $("#pe-save-msg").text("");

        try {
            let r;
            if (existingExamName) {
                // UPDATE — round-trip the full doc so nothing else gets wiped
                const existing = await frappe.db.get_doc("Dental Perio Exam", existingExamName);
                Object.assign(existing, payload);
                r = await frappe.call({ method: "frappe.client.save", args: { doc: existing } });
            } else {
                r = await frappe.call({
                    method: "frappe.client.insert",
                    args: { doc: Object.assign({ doctype: "Dental Perio Exam" }, payload) },
                });
            }

            const doc = r && r.message;
            if (!doc) throw new Error("No document returned");
            existingExamName = doc.name;
            $("#pe-save-msg").text(`Saved · ${doc.name}`);
            frappe.show_alert({ message: `Perio exam saved (${doc.name})`, indicator: "green" });
            fetchExamPicker(selectedPatient);
        } catch (err) {
            console.error("[Perio] save failed:", err);
            frappe.msgprint({
                title: "Save Error",
                message: "The exam could not be saved. Check DocType permissions and fields.",
                indicator: "red",
            });
        } finally {
            $("#pe-save-btn").prop("disabled", false).text("Save Exam");
        }
    });

    // ── Initial load ───────────────────────────────────────────────────────
    renderAssessedBy();
    prefillPractitioner();
    if (selectedPatient) {
        Promise.resolve(patientCtrl.set_value(selectedPatient)).then(() => showPatientName(selectedPatient));
        fetchExamPicker(selectedPatient);
    }
    applyRouteOptions();
};

// Runs every time the page is opened (Frappe caches pages, so on_page_load
// only runs the first time). Picks up the patient sent from the Patient form.
frappe.pages["perio_comparison"].on_page_show = function () {
    if (window._pe) window._pe.applyRouteOptions();
};