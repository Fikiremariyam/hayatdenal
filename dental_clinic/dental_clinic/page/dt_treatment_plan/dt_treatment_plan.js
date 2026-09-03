frappe.pages['dt_treatment_plan'].on_page_load = function (wrapper) {

	/* ── 1. PAGE CHROME ─────────────────────────────────────────────────── */
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Dental Treatment Plan",
		single_column: true,
	});

	page.set_primary_action("Save", () => window._dtp?.save(), "save");
	page.add_menu_item("New Plan", () => window._dtp?.reset());
	page.add_menu_item("Load History", () => window._dtp?.loadPlanHistory());
	page.add_menu_item("Recalculate Totals", () => window._dtp?.recalculateTotals());

	/* ── 2. CSS ─────────────────────────────────────────────────────────── */
	frappe.dom.set_style(`
#dtp-root {
    --panel:#ffffff; --panel2:#f8f9fb;
    --border:#e2e6ea; --border2:#c8cfd8;
    --text:#1a2332; --muted:#6b7a8d; --muted2:#9aa3af;
    --accent:#1a6ef5; --accent-light:#e8f0fe;
    --shadow:0 1px 3px rgba(0,0,0,.08),0 4px 16px rgba(0,0,0,.06);
    font-family:'DM Sans',-apple-system,'Segoe UI',sans-serif;
    font-size:13px; color:var(--text);
}
#dtp-root .dtp-body       { display:flex; min-height:calc(100vh - 160px); }
#dtp-root .dtp-palette    { width:192px;min-width:192px;background:var(--panel);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow-y:auto; }
#dtp-root .dtp-main       { flex:1;overflow:auto;padding:18px 20px;display:flex;flex-direction:column;gap:14px; }
#dtp-root .dtp-pt-bar     { background:var(--panel);border-bottom:1px solid var(--border);padding:9px 16px;display:flex;align-items:center;gap:16px;flex-wrap:wrap; }
#dtp-root .dtp-pt-name    { font-size:15px;font-weight:700;min-width:200px; }
#dtp-root .dtp-provider   { min-width:200px; }
#dtp-root .dtp-badge      { background:var(--accent-light);color:var(--accent);font-size:10px;font-weight:600;padding:3px 10px;border-radius:20px;letter-spacing:.04em; }
#dtp-root .dtp-plan-type  { border:1.5px solid var(--border);border-radius:6px;padding:5px 8px;font-size:12px;font-family:inherit;background:var(--panel2); }
#dtp-root .dtp-plan-date-wrap { min-width:130px; }
#dtp-root .dtp-field-lbl  { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);margin-bottom:2px;display:block; }
#dtp-root .pal-section   { padding:11px 12px 7px; }
#dtp-root .pal-label     { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2);margin-bottom:7px;display:block; }
#dtp-root .pal-sep       { height:1px;background:var(--border);margin:3px 12px 6px; }
#dtp-root .pal-btn       { display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;border-radius:7px;border:1.5px solid transparent;background:var(--panel2);cursor:pointer;font-size:12px;font-weight:500;color:var(--text);transition:all .13s;margin-bottom:3px;text-align:left;font-family:inherit; }
#dtp-root .pal-btn:hover { border-color:var(--border2);background:#fff; }
#dtp-root .pal-btn.active{ border-color:currentColor; }
#dtp-root .pal-dot       { width:11px;height:11px;border-radius:3px;flex-shrink:0; }
#dtp-root .pal-rate      { margin-left:auto;font-size:10px;color:var(--muted2);font-family:'DM Mono',monospace; }
#dtp-root .obs-search    { width:100%;box-sizing:border-box;border:1.5px solid var(--border);border-radius:7px;padding:6px 9px;font-size:12px;font-family:inherit;color:var(--text);background:var(--panel2);outline:none;margin-bottom:7px; }
#dtp-root .obs-search:focus{ border-color:var(--accent); }
#dtp-root .obs-list      { max-height:220px;overflow-y:auto;padding-right:2px; }
#dtp-root .arch-block    { background:var(--panel);border:1px solid var(--border);border-radius:10px;overflow:hidden;box-shadow:var(--shadow); }
#dtp-root .arch-bar      { background:var(--panel2);border-bottom:1px solid var(--border);padding:7px 14px;display:flex;align-items:center;gap:10px; }
#dtp-root .arch-title    { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-family:'DM Mono',monospace; }
#dtp-root .dentition-section-label { font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--accent);margin:4px 2px -2px; }
#dtp-root .midline-marker{ height:44px;width:2px;background:var(--text);opacity:.55;margin:0;flex-shrink:0;align-self:flex-end; }
#dtp-root .lower-row .midline-marker{ align-self:flex-start; }
#dtp-root .grid-side-label{ display:flex;align-items:center;justify-content:center;width:22px;font-family:'DM Mono',monospace;font-size:13px;font-weight:700;color:var(--muted);flex-shrink:0; }
#dtp-root .teeth-row     { display:flex;align-items:flex-end;justify-content:center;padding:14px 6px 7px;gap:0;overflow-x:auto; }
#dtp-root .lower-row     { align-items:flex-start; }
#dtp-root .tooth-cell    { display:flex;flex-direction:column;align-items:center;cursor:pointer;padding:2px 4px 0;border-radius:8px;transition:background .12s;position:relative; }
#dtp-root .tooth-cell:hover{ background:rgba(26,110,245,.06); }
#dtp-root .tooth-cell.selected{ background:var(--accent-light);outline:2px solid var(--accent);outline-offset:-1px;z-index:1; }
#dtp-root .tooth-num-fdi { font-family:'DM Mono',monospace;font-size:10px;font-weight:500;color:var(--muted);margin-bottom:2px;line-height:1; }
#dtp-root .tooth-num-uni { font-family:'DM Mono',monospace;font-size:8px;color:var(--muted2);margin-bottom:2px;line-height:1; }
#dtp-root .lower-row .tooth-num-fdi{ order:3;margin-bottom:0;margin-top:2px; }
#dtp-root .lower-row .tooth-num-uni{ order:4; }
#dtp-root .tooth-svg-wrap{ position:relative; }
#dtp-root .tooth-svg-wrap svg{ display:block; }
#dtp-root .tooth-badge   { position:absolute;top:-4px;right:-4px;width:13px;height:13px;border-radius:50%;border:1.5px solid #fff;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;z-index:2; }
#dtp-root .sum-tbl       { width:100%;border-collapse:collapse;font-size:12px; }
#dtp-root .sum-tbl th    { background:var(--panel2);padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:600;border-bottom:1px solid var(--border); }
#dtp-root .sum-tbl td    { padding:6px 10px;border-bottom:1px solid var(--border); }
#dtp-root .sum-tbl tr:last-child td{ border-bottom:none; }
#dtp-root .sum-tbl tr:hover td{ background:var(--panel2); }
#dtp-root .sum-tbl tfoot td{ border-bottom:none;border-top:1.5px solid var(--border2);font-weight:700;background:var(--panel2); }
#dtp-root .tp-row-rm       { color:var(--muted2);font-size:13px;line-height:1;opacity:.6;cursor:pointer; }
#dtp-root .tp-row-rm:hover { opacity:1; }
#dtp-root .tp-toolbar      { display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding-bottom:10px; }
#dtp-root .tp-selall-wrap  { display:flex;align-items:center;gap:5px;font-size:11px;color:var(--muted);margin-right:auto;cursor:pointer; }
#dtp-root .tp-add-btn      { padding:3px 10px;border-radius:6px;border:1.5px solid var(--accent);background:var(--accent-light);color:var(--accent);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit; }
#dtp-root .tp-add-btn:hover:not(:disabled){ background:var(--accent);color:#fff; }
#dtp-root .tp-add-btn:disabled { opacity:.35;cursor:not-allowed; }
#dtp-root .tp-dup-btn      { border-color:var(--border2);background:var(--panel2);color:var(--text); }
#dtp-root .tp-dup-btn:hover:not(:disabled){ border-color:var(--accent);color:var(--accent);background:var(--accent-light); }
#dtp-root .tp-del-btn      { border-color:#f5c2c2;background:#fdeeee;color:#e74c3c; }
#dtp-root .tp-del-btn:hover:not(:disabled){ background:#e74c3c;color:#fff;border-color:#e74c3c; }
#dtp-root .tp-chk-cell     { width:26px;text-align:center; }
#dtp-root .tp-idx-cell     { width:26px;text-align:center;color:var(--muted2);font-family:'DM Mono',monospace;font-size:11px; }
#dtp-root .tp-cell-input   { width:100%;border:1px solid transparent;background:transparent;font-family:inherit;font-size:12px;color:var(--text);padding:2px 4px;border-radius:4px;outline:none; }
#dtp-root .tp-cell-input:hover, #dtp-root .tp-cell-input:focus { border-color:var(--border2);background:var(--panel2); }
#dtp-root .stat-grid     { display:grid;grid-template-columns:1fr 1fr;gap:5px; }
#dtp-root .stat-box      { background:var(--panel2);border:1px solid var(--border);border-radius:7px;padding:7px;text-align:center; }
#dtp-root .stat-val      { font-size:18px;font-weight:700;font-family:'DM Mono',monospace;line-height:1; }
#dtp-root .stat-lbl      { font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted2); }
#dtp-root .notes-card    { background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px; }
#dtp-root .notes-lbl     { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:7px;display:block; }
#dtp-root .dp-textarea   { width:100%;border:1.5px solid var(--border);border-radius:6px;padding:7px 10px;font-family:inherit;font-size:12px;color:var(--text);background:var(--panel2);outline:none;resize:none; }
#dtp-root .dp-textarea:focus{ border-color:var(--accent); }
#dtp-root .totals-sig-row { display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start; }
#dtp-root .totals-stack   { display:flex;flex-direction:column;gap:10px; }
#dtp-root .total-card     { background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:10px 12px; }
#dtp-root .total-card-lbl { font-size:12px;color:var(--muted); }
#dtp-root .total-card-val { font-size:18px;font-weight:600;font-family:'DM Mono',monospace; }
#dtp-tip { position:fixed;background:#1a2332;color:#fff;font-size:11px;padding:5px 10px;border-radius:6px;pointer-events:none;opacity:0;transition:opacity .12s;z-index:9999;white-space:nowrap;box-shadow:0 4px 12px rgba(0,0,0,.2); }
#dtp-root ::-webkit-scrollbar{ width:5px;height:5px; }
#dtp-root ::-webkit-scrollbar-thumb{ background:var(--border2);border-radius:3px; }
	`);

	/* ── 3. HTML ─────────────────────────────────────────────────────────── */
	page.main.html(`
<div id="dtp-tip"></div>
<div id="dtp-root">

  <div class="dtp-pt-bar">
    <div class="dtp-pt-name" id="dtp-pt-name"></div>
    <div class="dtp-provider" id="dtp-provider"></div>
    <div>
      <span class="dtp-field-lbl">Plan Type</span>
      <select class="dtp-plan-type" id="dtp-plan-type">
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Saved">Saved</option>
      </select>
    </div>
    <div class="dtp-plan-date-wrap" id="dtp-plan-date"></div>
    <div class="dtp-badge" id="dtp-badge" style="margin-left:auto;">New Plan</div>
  </div>

  <div class="dtp-body">

    <div class="dtp-palette">
      <div class="pal-section">
        <div class="pal-label">Treatment Items</div>
        <div id="dtp-item-search-link" style="margin-bottom:7px;"></div>
        <div id="dtp-item-list" class="obs-list"></div>
      </div>
      <div class="pal-sep"></div>
      <div class="pal-section">
        <div class="pal-label">Numbering</div>
        <button class="pal-btn" id="dtp-num-toggle" style="font-family:'DM Mono',monospace;font-size:11px">
          <span style="font-size:13px">🔢</span>FDI / Universal
        </button>
      </div>
      <div class="pal-sep"></div>
      <div class="pal-section">
        <div class="pal-label">Summary</div>
        <div class="stat-grid">
          <div class="stat-box"><div class="stat-val" style="color:#27ae60" id="dtp-st-h">0</div><div class="stat-lbl">No treatment</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--accent)" id="dtp-st-fl">0</div><div class="stat-lbl">Planned</div></div>
        </div>
      </div>
    </div>

    <div class="dtp-main">

      <div class="dentition-section-label">Permanent Dentition</div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 18–28</div>
        </div>
        <div class="teeth-row" id="dtp-upper-row"></div>
      </div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 48–38</div>
        </div>
        <div class="teeth-row lower-row" id="dtp-lower-row"></div>
      </div>

      <div class="dentition-section-label">Primary (Child) Dentition</div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 55–65</div>
        </div>
        <div class="teeth-row" id="dtp-upper-row-child"></div>
      </div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">Right → Left · FDI 85–75</div>
        </div>
        <div class="teeth-row lower-row" id="dtp-lower-row-child"></div>
      </div>

      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Dental Treatment Plan Procedure</div>
          <div style="font-size:10px;color:var(--muted2);margin-left:auto">Edit directly, or add/remove rows below</div>
        </div>
        <div style="padding:10px 14px;overflow-x:auto" id="dtp-summary-wrap">
          <div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">
            Click a tooth, then pick a stock item from the left panel to begin
          </div>
        </div>
      </div>

      <div class="notes-card">
        <span class="notes-lbl">Plan Note</span>
        <textarea class="dp-textarea" id="dtp-plan-note" rows="3" placeholder="Notes about this treatment plan…"></textarea>
      </div>

      <div class="totals-sig-row">
        <div class="totals-stack">
          <div class="total-card">
            <div class="total-card-lbl">Total Insurance Estimate</div>
            <div class="total-card-val" id="dtp-total-ins">0</div>
          </div>
          <div class="total-card">
            <div class="total-card-lbl">Total Fee</div>
            <div class="total-card-val" id="dtp-total-fee">0</div>
          </div>
          <div class="total-card">
            <div class="total-card-lbl">Total Patient Portion</div>
            <div class="total-card-val" id="dtp-total-portion">0</div>
          </div>
        </div>
        <div>
          <span class="dtp-field-lbl">Signed Date</span>
          <div id="dtp-signed-date"></div>
        </div>
      </div>

    </div>
  </div>
</div>
	`);

	frappe.after_ajax(() => {
		window._dtp = new DentalTreatmentPlanChart();
		window._dtp.init();
	});
};


/* ═══════════════════════════════════════════════════════════════════════════
   Deterministic color + category guess for procedures pulled from Item.
   ═══════════════════════════════════════════════════════════════════════════*/
const DTP_COLOR_PALETTE = [
	'#1a6ef5', '#8e44ad', '#e67e22', '#16a085', '#e74c3c',
	'#3498db', '#27ae60', '#f39c12', '#00bcd4', '#d35400',
];

function dtpHashColor(str) {
	let hash = 0;
	for (let i = 0; i < (str || '').length; i++) {
		hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
	}
	return DTP_COLOR_PALETTE[hash % DTP_COLOR_PALETTE.length];
}

function dtpClassifyProcedure(label) {
	const s = (label || '').toLowerCase();
	if (/\b(missing|extract)/.test(s))               return 'missing';
	if (/\bimplant/.test(s))                          return 'implant';
	if (/\b(root canal|rct|endo)/.test(s))            return 'rct';
	if (/\bcrown/.test(s))                            return 'crown';
	if (/\bbridge/.test(s))                           return 'bridge';
	if (/\bveneer/.test(s))                           return 'veneer';
	if (/\b(filling|composite|restoration|amalgam)/.test(s)) return 'filling';
	if (/\bfracture/.test(s))                         return 'fracture';
	return 'procedure';
}

const DTP_TREATMENT_COLORS = {
	none     : { f:'#dce4ee', s:'#b0bec5' },
	missing  : { f:'#e8ecef', s:'#b0bec5' },
	crown    : { f:'#fff3cc', s:'#f39c12' },
	rct      : { f:'#ead6f5', s:'#8e44ad' },
	filling  : { f:'#d6eaff', s:'#3498db' },
	veneer   : { f:'#d6f5f5', s:'#00bcd4' },
	implant  : { f:'#d6f5e0', s:'#27ae60' },
	bridge   : { f:'#d6f0ec', s:'#16a085' },
	fracture : { f:'#fde8d0', s:'#e67e22' },
	procedure: { f:'#e8f0fe', s:'#1a6ef5' },
};

const DTP_TREATMENT_PRIORITY = [
	'missing', 'implant', 'rct', 'crown', 'bridge', 'veneer', 'filling', 'fracture', 'procedure',
];

const DTP_STATUS_OPTIONS = ['Active', 'Inactive', 'Saved / Signed', 'Pre-Authorisation'];


/* ───────────────────────────────────────────────────────────────────────────
   ToothState — holds every planned procedure row for one tooth.
─────────────────────────────────────────────────────────────────────────────*/
class DtpToothState {
	constructor(meta) {
		this.fdi  = meta.fdi;
		this.uni  = meta.uni;
		this.name = meta.name;
		this.type = meta.type;
		this.rows = [];   // [{ uid, type(item code), label, color, category, priority, status, fee, insurance_estimate, patient_portion }]
	}

	addRow(row) {
		this.rows = this.rows.filter(r => r.type !== row.type);
		if (!row.uid) row.uid = 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
		if (row.priority === undefined)           row.priority = '';
		if (row.status === undefined)             row.status = 'Active';
		if (row.fee === undefined)                row.fee = 0;
		if (row.insurance_estimate === undefined) row.insurance_estimate = '';
		if (row.patient_portion === undefined)    row.patient_portion = 0;
		this.rows.push(row);
	}

	reset() { this.rows = []; }

	loadFromDocRow(row, catalog = []) {
		const code = row.procedure || '';
		if (!code) return;
		const match = catalog.find(s => s.name === code);
		this.addRow({
			type              : code,
			label             : match ? (match.status_name || match.name) : code,
			color             : match ? match.color : dtpHashColor(code),
			category          : match ? match.category : dtpClassifyProcedure(code),
			priority          : row.priority || '',
			status            : row.status || 'Active',
			fee               : flt(row.fee),
			insurance_estimate: row.insurance_estimate || '',
			patient_portion   : flt(row.patient_portion),
		});
	}

	toDocRows() {
		return this.rows.map(r => ({
			doctype           : 'Dental Treatment Plan Procedure',
			fdi               : this.fdi,      // ← requires "fdi"/"name1" fields on the child doctype
			name1             : this.name,
			procedure         : r.type,
			priority          : r.priority || '',
			status            : r.status || 'Active',
			fee               : flt(r.fee),
			insurance_estimate: r.insurance_estimate || '',
			patient_portion   : flt(r.patient_portion),
		}));
	}
}


/* ───────────────────────────────────────────────────────────────────────────
   ToothSVG — full anatomical morphology (unchanged from the dental-chart page).
─────────────────────────────────────────────────────────────────────────────*/
class DtpToothSVG {

	static resolve(rows) {
		const cats = rows.map(r => r.category);
		for (const key of DTP_TREATMENT_PRIORITY) {
			if (cats.includes(key)) return DTP_TREATMENT_COLORS[key];
		}
		return DTP_TREATMENT_COLORS.none;
	}

	static render(toothMeta, isUpper, rows) {
		switch (toothMeta.type) {
			case 'molar':    return DtpToothSVG._molar(rows, isUpper);
			case 'premolar': return DtpToothSVG._premolar(rows, isUpper);
			case 'canine':   return DtpToothSVG._canine(rows, isUpper);
			default:         return DtpToothSVG._incisor(rows, isUpper);
		}
	}

	static _missCross(x1a, y1a, x2a, y2a, x1b, y1b, x2b, y2b) {
		return `<line x1="${x1a}" y1="${y1a}" x2="${x2a}" y2="${y2a}" stroke="#95a5a6" stroke-width="2" stroke-linecap="round" opacity=".5"/>
                <line x1="${x1b}" y1="${y1b}" x2="${x2b}" y2="${y2b}" stroke="#95a5a6" stroke-width="2" stroke-linecap="round" opacity=".5"/>`;
	}

	static _molar(rows, up) {
		const { f, s } = DtpToothSVG.resolve(rows);
		const cats = rows.map(r => r.category);
		const miss = cats.includes('missing');
		const op   = miss ? .3 : 1;
		let ex = '';
		if (cats.includes('rct')) ex += up
			? `<line x1="16" y1="28" x2="12" y2="50" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="24" y1="30" x2="24" y2="52" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="32" y1="28" x2="36" y2="50" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`
			: `<line x1="16" y1="28" x2="12" y2="6"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="24" y1="26" x2="24" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="32" y1="28" x2="36" y2="6"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`;
		if (cats.includes('fracture'))
			ex += `<path d="M20,${up?8:24} L22,${up?14:30} L18,${up?18:34} L22,${up?24:40}" stroke="#e67e22" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
		if (cats.includes('implant'))
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
                  ${miss ? DtpToothSVG._missCross(8,8,40,48,40,8,8,48) : ''}
                </svg>`;
	}

	static _premolar(rows, up) {
		const { f, s } = DtpToothSVG.resolve(rows);
		const cats = rows.map(r => r.category);
		const miss = cats.includes('missing');
		const op   = miss ? .3 : 1;
		let ex = '';
		if (cats.includes('rct')) ex += up
			? `<line x1="18" y1="28" x2="14" y2="48" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="26" y1="28" x2="30" y2="48" stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`
			: `<line x1="18" y1="22" x2="14" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>
               <line x1="26" y1="22" x2="30" y2="4"  stroke="#8e44ad" stroke-width="1.5" stroke-dasharray="2,1" opacity=".7"/>`;
		if (cats.includes('fracture'))
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
                  ${miss ? DtpToothSVG._missCross(6,6,38,46,38,6,6,46) : ''}
                </svg>`;
	}

	static _canine(rows, up) {
		const { f, s } = DtpToothSVG.resolve(rows);
		const miss = rows.some(r => r.category === 'missing');
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
                  ${miss ? DtpToothSVG._missCross(4,4,34,52,34,4,4,52) : ''}
                </svg>`;
	}

	static _incisor(rows, up) {
		const { f, s } = DtpToothSVG.resolve(rows);
		const cats = rows.map(r => r.category);
		const miss = cats.includes('missing');
		const op   = miss ? .3 : 1;
		const ven  = cats.includes('veneer');
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
                  ${miss ? DtpToothSVG._missCross(4,4,30,48,30,4,4,48) : ''}
                </svg>`;
	}
}


/* ───────────────────────────────────────────────────────────────────────────
   DentalTreatmentPlanChart — main controller
─────────────────────────────────────────────────────────────────────────────*/
class DentalTreatmentPlanChart {

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

	static MIDLINE_AFTER = { permanent: ['11', '41'], primary: ['51', '81'] };

	constructor() {
		this.frm_doctype = 'Dental Treatment Plan';
		this.child_doctype = 'Dental Treatment Plan Procedure';
		this.docname = null;

		this.selectedRowIds = new Set();

		this.teethSets = { permanent: {}, primary: {} };
		[...DentalTreatmentPlanChart.UPPER_META, ...DentalTreatmentPlanChart.LOWER_META]
			.forEach(m => { this.teethSets.permanent[m.fdi] = new DtpToothState(m); });
		[...DentalTreatmentPlanChart.UPPER_META_CHILD, ...DentalTreatmentPlanChart.LOWER_META_CHILD]
			.forEach(m => { this.teethSets.primary[m.fdi] = new DtpToothState(m); });

		// Item catalog — the ONLY thing fetched at page load.
		this.itemCatalog = [];
		this.selItem = null;
		this.itemSearchTerm = '';

		this.selFDI = null;
		this.useFDI = true;

		this._tip = document.getElementById('dtp-tip');
	}

	get allMeta() {
		return [
			...DentalTreatmentPlanChart.UPPER_META,       ...DentalTreatmentPlanChart.LOWER_META,
			...DentalTreatmentPlanChart.UPPER_META_CHILD, ...DentalTreatmentPlanChart.LOWER_META_CHILD,
		];
	}
	get teeth() { return { ...this.teethSets.permanent, ...this.teethSets.primary }; }

	/* ── init ──────────────────────────────────────────────────────────── */
	init() {
		this.patient_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-pt-name'),
			df: { fieldtype: 'Link', options: 'Patient', label: 'Patient', fieldname: 'patient', placeholder: 'Search patient…', reqd: 1 },
			render_input: true,
		});
		this.provider_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-provider'),
			df: { fieldtype: 'Link', options: 'Healthcare Practitioner', label: 'Provider', fieldname: 'provider', placeholder: 'Search provider…' },
			render_input: true,
		});
		this.plan_date_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-plan-date'),
			df: { fieldtype: 'Date', label: 'Plan Date', fieldname: 'plan_date' },
			render_input: true,
		});
		this.plan_date_ctrl.set_value(frappe.datetime.get_today());

		this.signed_date_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-signed-date'),
			df: { fieldtype: 'Date', fieldname: 'signed_date' },
			render_input: true,
		});

		this.item_search_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-item-search-link'),
			df: {
				fieldtype: 'Link',
				options: 'Item',
				fieldname: 'item_search',
				placeholder: __('Search or create an item…'),
			},
			only_input: true,
			render_input: true,
		});

		this._loadItemCatalog();
		this._bindItemSearchLink();
		this._bindNumberingToggle();
		this._bindTooltip();

		this.render();
	}

	/* ── ITEM CATALOG (left palette) — only network call at page load ───── */
	async _loadItemCatalog() {
		const wrap = document.getElementById('dtp-item-list');
		if (wrap) wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">Loading items…</div>`;

		try {
			const items = await frappe.db.get_list('Item', {
				filters          : { disabled: 0 /*, item_group: 'Dental Procedures' */ },
				fields           : ['name', 'item_name', 'standard_rate'],
				limit_page_length: 100000,   // explicit high number — 0 isn't reliably "no limit" through this API
				order_by         : 'item_name asc',
			});
			this.itemCatalog = items.map(item => {
				const category = dtpClassifyProcedure(item.item_name || item.name);
				return {
					name       : item.name,
					status_name: item.item_name || item.name,
					category   : category,
					color      : (DTP_TREATMENT_COLORS[category] && DTP_TREATMENT_COLORS[category].s) || dtpHashColor(item.name),
					rate       : flt(item.standard_rate),
				};
			});
		} catch (err) {
			console.error('[DentalTreatmentPlan] Failed to load Item list:', err);
			this.itemCatalog = [];
		}
		this.itemCatalog.sort((a, b) => (a.status_name || a.name).localeCompare(b.status_name || b.name));
		this._renderItemList();
	}

	/** Add (or update) one item in the cached catalog, keep it sorted, refresh the palette. */
	_addItemToCatalog(item) {
		const item_name = item.item_name || item.name;
		const category = dtpClassifyProcedure(item_name);
		const doc = {
			name: item.name,
			status_name: item_name,
			category: category,
			color: (DTP_TREATMENT_COLORS[category] && DTP_TREATMENT_COLORS[category].s) || dtpHashColor(item.name),
			rate: flt(item.standard_rate),
		};
		this.itemCatalog = this.itemCatalog.filter(s => s.name !== doc.name);
		this.itemCatalog.push(doc);
		this.itemCatalog.sort((a, b) => (a.status_name || a.name).localeCompare(b.status_name || b.name));
		this._renderItemList();
		return doc;
	}

	_bindItemSearchLink() {
		var me = this;
		// Live-filter the browsable list below as the user types...
		this.item_search_ctrl.$input.on('input', function (e) {
			me.itemSearchTerm = e.target.value || '';
			me._renderItemList();
		});
		// ...and when they actually pick (or create) an item, treat it
		// exactly like clicking a palette button: select it, and apply
		// immediately if a tooth is already selected.
		this.item_search_ctrl.$input.on('change', function () {
			me._onItemSearchSelected();
		});
	}

	async _onItemSearchSelected() {
		const val = this.item_search_ctrl.get_value();
		if (!val) return;

		let doc = this.itemCatalog.find(s => s.name === val);
		if (!doc) {
			// Not cached yet — just created via the Link field's "Create a
			// new Item" option, or otherwise not in the preloaded catalog.
			try {
				const r = await frappe.db.get_value('Item', val, ['item_name', 'standard_rate']);
				doc = this._addItemToCatalog({
					name: val,
					item_name: (r.message && r.message.item_name) || val,
					standard_rate: (r.message && r.message.standard_rate) || 0,
				});
			} catch (err) {
				console.error('[DentalTreatmentPlan] Could not fetch item:', err);
				return;
			}
		}

		this.selItem = { id: doc.name, label: doc.status_name || doc.name, color: doc.color, category: doc.category, rate: flt(doc.rate) };
		this._renderItemList();
		if (this.selFDI) this._applySelectedItem();

		// Clear the field so it's ready for the next search/pick.
		this.item_search_ctrl.set_value('');
		this.itemSearchTerm = '';
	}

	_renderItemList() {
		const wrap = document.getElementById('dtp-item-list');
		if (!wrap) return;
		const term = (this.itemSearchTerm || '').trim().toLowerCase();
		const filtered = term
			? this.itemCatalog.filter(s => (s.status_name || s.name).toLowerCase().includes(term))
			: this.itemCatalog;

		if (!this.itemCatalog.length) {
			wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">No items found</div>`;
			return;
		}
		if (!filtered.length) {
			wrap.innerHTML = `<div style="font-size:11px;color:var(--muted2);padding:6px 0">No matches</div>`;
			return;
		}

		wrap.innerHTML = filtered.map(s => {
			const active = this.selItem && this.selItem.id === s.name;
			return `<button class="pal-btn${active ? ' active' : ''}" data-id="${s.name}" style="color:${s.color}">
                        <span class="pal-dot" style="background:${s.color}"></span>${s.status_name || s.name}
                        <span class="pal-rate">${s.rate ? format_currency(s.rate) : ''}</span>
                    </button>`;
		}).join('');

		wrap.querySelectorAll('.pal-btn').forEach(btn => {
			btn.addEventListener('click', () => {
				const doc = this.itemCatalog.find(s => s.name === btn.dataset.id);
				if (!doc) return;
				this.selItem = { id: doc.name, label: doc.status_name || doc.name, color: doc.color, category: doc.category, rate: flt(doc.rate) };
				this._renderItemList();
				if (this.selFDI) this._applySelectedItem();
			});
		});
	}

	/* ── TOOTH SELECTION / APPLY ──────────────────────────────────────── */
	_selectTooth(fdi) {
		this.selFDI = fdi;
		if (this.selItem) this._applySelectedItem();
		else this.render();
	}

	_applySelectedItem() {
		if (!this.selFDI) {
			frappe.msgprint({ title: 'No Tooth Selected', message: 'Click a tooth first.', indicator: 'orange' });
			return;
		}
		if (!this.selItem) {
			frappe.msgprint({ title: 'No Item Selected', message: 'Pick a treatment item from the left panel first.', indicator: 'orange' });
			return;
		}
		const state = this.teeth[this.selFDI];
		if (!state) return;

		const already = state.rows.some(r => r.type === this.selItem.id);
		if (already) {
			state.rows = state.rows.filter(r => r.type !== this.selItem.id);
		} else {
			state.addRow({
				type: this.selItem.id, label: this.selItem.label, color: this.selItem.color,
				category: this.selItem.category, fee: flt(this.selItem.rate),
			});
		}
		this.render();
	}

	/* ── RENDER ────────────────────────────────────────────────────────── */
	render() {
		this._renderArch(DentalTreatmentPlanChart.UPPER_META,       'dtp-upper-row',       true,  'permanent');
		this._renderArch(DentalTreatmentPlanChart.LOWER_META,       'dtp-lower-row',       false, 'permanent');
		this._renderArch(DentalTreatmentPlanChart.UPPER_META_CHILD, 'dtp-upper-row-child', true,  'primary');
		this._renderArch(DentalTreatmentPlanChart.LOWER_META_CHILD, 'dtp-lower-row-child', false, 'primary');
		this._renderStats();
		this._renderTable();
		this.recalculateTotals();
	}

	_renderArch(metaList, containerId, isUpper, dentitionKey) {
		const row = document.getElementById(containerId);
		if (!row) return;
		row.innerHTML = '';

		const rLabel = document.createElement('div');
		rLabel.className = 'grid-side-label';
		rLabel.textContent = 'R';
		row.appendChild(rLabel);

		metaList.forEach(meta => {
			row.appendChild(this._buildToothCell(meta, isUpper));
			if (DentalTreatmentPlanChart.MIDLINE_AFTER[dentitionKey].includes(meta.fdi)) {
				const ml = document.createElement('div');
				ml.className = 'midline-marker';
				row.appendChild(ml);
			}
		});

		const lLabel = document.createElement('div');
		lLabel.className = 'grid-side-label';
		lLabel.textContent = 'L';
		row.appendChild(lLabel);
	}

	_buildToothCell(meta, isUpper) {
		const state = this.teeth[meta.fdi];
		const num = this.useFDI ? meta.fdi : meta.uni;
		const alt = this.useFDI ? `U:${meta.uni}` : `FDI:${meta.fdi}`;
		const sel = this.selFDI === meta.fdi;

		const fc = state.rows[0];
		const badge = fc
			? `<div class="tooth-badge" style="background:${fc.color || '#1a6ef5'};${isUpper ? '' : 'bottom:-4px;top:auto'}">${(fc.label || fc.type || '?').charAt(0).toUpperCase()}</div>`
			: '';

		const el = document.createElement('div');
		el.className = `tooth-cell${sel ? ' selected' : ''}`;
		el.id = `dtpt-${meta.fdi}`;

		const numH = `<div class="tooth-num-fdi">${num}</div><div class="tooth-num-uni">${alt}</div>`;
		const svgH = `<div class="tooth-svg-wrap">${DtpToothSVG.render(meta, isUpper, state.rows)}${badge}</div>`;
		el.innerHTML = isUpper ? (numH + svgH) : (svgH + numH);

		el.addEventListener('click', () => this._selectTooth(meta.fdi));
		el.addEventListener('mouseenter', (e) => this._showTip(e, meta));
		el.addEventListener('mouseleave', () => this._hideTip());

		return el;
	}

	_renderStats() {
		let none = 0, planned = 0;
		this.allMeta.forEach(meta => {
			if (this.teeth[meta.fdi].rows.length) planned++;
			else none++;
		});
		_dtpSet('dtp-st-h', none);
		_dtpSet('dtp-st-fl', planned);
	}

	_showTip(e, meta) {
		const rows = this.teeth[meta.fdi].rows;
		const str = rows.length
			? rows.map(r => `${r.label || r.type}${r.fee ? ' · ' + format_currency(r.fee) : ''}`).join(', ')
			: 'No procedure planned';
		this._tip.innerHTML = `<b>${meta.fdi}</b> · ${meta.name}<br><span style="color:#9ca3af;font-size:10px">${str}</span>`;
		this._tip.style.opacity = '1';
		this._tip.style.left = (e.clientX + 14) + 'px';
		this._tip.style.top = (e.clientY - 8) + 'px';
	}
	_hideTip() { this._tip.style.opacity = '0'; }

	_bindNumberingToggle() {
		const btn = document.getElementById('dtp-num-toggle');
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
				this._tip.style.top = (e.clientY - 8) + 'px';
			}
		});
	}

	/* ── DENTAL TREATMENT PLAN PROCEDURE TABLE ────────────────────────── */
	_renderTable() {
		const wrap = document.getElementById('dtp-summary-wrap');
		if (!wrap) return;

		const toothOptions = this.allMeta.map(m => m.fdi);
		const flat = [];
		this.allMeta.forEach(meta => {
			this.teeth[meta.fdi].rows.forEach(r => flat.push({ fdi: meta.fdi, row: r }));
		});

		const nSel = this.selectedRowIds.size;
		const allChecked = flat.length > 0 && nSel === flat.length;
		const totalFee = flat.reduce((sum, r) => sum + flt(r.row.fee), 0);
		const totalPortion = flat.reduce((sum, r) => sum + flt(r.row.patient_portion), 0);

		const rows = flat.map((r, idx) => `
            <tr>
                <td class="tp-chk-cell"><input type="checkbox" class="dtp-row-chk" data-uid="${r.row.uid}" ${this.selectedRowIds.has(r.row.uid) ? 'checked' : ''}></td>
                <td class="tp-idx-cell">${idx + 1}</td>
                <td>
                    <select class="tp-cell-input dtp-tooth-edit" data-uid="${r.row.uid}">
                        ${toothOptions.map(fdi => `<option value="${fdi}" ${fdi === r.fdi ? 'selected' : ''}>${fdi}</option>`).join('')}
                    </select>
                </td>
                <td><div class="dtp-item-cell" data-uid="${r.row.uid}"></div></td>
                <td><input type="text" class="tp-cell-input dtp-priority-edit" data-uid="${r.row.uid}" value="${(r.row.priority || '').replace(/"/g, '&quot;')}" placeholder="1"></td>
                <td>
                    <select class="tp-cell-input dtp-status-edit" data-uid="${r.row.uid}">
                        ${DTP_STATUS_OPTIONS.map(o => `<option ${o === r.row.status ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" step="0.01" class="tp-cell-input dtp-fee-edit" data-uid="${r.row.uid}" value="${flt(r.row.fee)}" style="text-align:right"></td>
                <td><input type="text" class="tp-cell-input dtp-ins-edit" data-uid="${r.row.uid}" value="${(r.row.insurance_estimate || '').replace(/"/g, '&quot;')}" placeholder="—" style="text-align:right"></td>
                <td><input type="number" step="0.01" class="tp-cell-input dtp-portion-edit" data-uid="${r.row.uid}" value="${flt(r.row.patient_portion)}" style="text-align:right"></td>
                <td><span class="tp-row-rm dtp-row-rm" data-uid="${r.row.uid}" title="Delete row">🗑</span></td>
            </tr>`).join('');

		wrap.innerHTML = `
            <div class="tp-toolbar">
                <label class="tp-selall-wrap">
                    <input type="checkbox" id="dtp-select-all" ${allChecked ? 'checked' : ''} ${flat.length ? '' : 'disabled'}>
                    <span>Select All</span>
                </label>
                <button class="tp-add-btn" id="dtp-add-row-btn">＋ Add Row</button>
                <button class="tp-add-btn tp-dup-btn" id="dtp-dup-btn" ${nSel ? '' : 'disabled'}>⧉ Duplicate${nSel ? ` (${nSel})` : ''}</button>
                <button class="tp-add-btn tp-del-btn" id="dtp-del-btn" ${nSel ? '' : 'disabled'}>🗑 Delete${nSel ? ` (${nSel})` : ''}</button>
            </div>
            ${flat.length ? `
            <table class="sum-tbl">
                <thead>
                    <tr>
                        <th style="width:26px"></th>
                        <th style="width:26px">#</th>
                        <th style="width:64px">Tooth</th>
                        <th>Procedure</th>
                        <th style="width:60px">Priority</th>
                        <th style="width:140px">Status</th>
                        <th style="width:80px">Fee</th>
                        <th style="width:90px">Ins. Est.</th>
                        <th style="width:100px">Patient Portion</th>
                        <th style="width:26px"></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="6" style="text-align:right">Totals</td>
                        <td>${format_currency(totalFee)}</td>
                        <td></td>
                        <td>${format_currency(totalPortion)}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>` : `<div style="padding:18px;text-align:center;font-size:12px;color:var(--muted2)">No procedures planned yet — click a tooth, pick a treatment item on the left, or use "＋ Add Row"</div>`}
        `;

		this._bindTableEvents();
	}

	_findRowByUid(uid) {
		for (const meta of this.allMeta) {
			const state = this.teeth[meta.fdi];
			const row = state.rows.find(r => r.uid === uid);
			if (row) return { state, row, fdi: meta.fdi };
		}
		return null;
	}

	_bindTableEvents() {
		const wrap = document.getElementById('dtp-summary-wrap');
		if (!wrap) return;

		const addBtn = document.getElementById('dtp-add-row-btn');
		if (addBtn) addBtn.addEventListener('click', () => this._addBlankRow());

		const dupBtn = document.getElementById('dtp-dup-btn');
		if (dupBtn) dupBtn.addEventListener('click', () => this._duplicateSelected());

		const delBtn = document.getElementById('dtp-del-btn');
		if (delBtn) delBtn.addEventListener('click', () => this._deleteSelected());

		const selAll = document.getElementById('dtp-select-all');
		if (selAll) selAll.addEventListener('change', (e) => {
			if (e.target.checked) {
				this.allMeta.forEach(meta => this.teeth[meta.fdi].rows.forEach(r => this.selectedRowIds.add(r.uid)));
			} else {
				this.selectedRowIds.clear();
			}
			this._renderTable();
		});

		wrap.querySelectorAll('.dtp-row-chk').forEach(el => {
			el.addEventListener('change', (e) => {
				if (e.target.checked) this.selectedRowIds.add(el.dataset.uid);
				else this.selectedRowIds.delete(el.dataset.uid);
				this._renderTable();
			});
		});

		wrap.querySelectorAll('.dtp-row-rm').forEach(el => {
			el.addEventListener('click', () => this._removeRowByUid(el.dataset.uid));
		});

		wrap.querySelectorAll('.dtp-tooth-edit').forEach(el => {
			el.addEventListener('change', (e) => this._moveRowTooth(el.dataset.uid, e.target.value));
		});

		// Real Link controls for the Procedure cell — gives search-as-you-type
		// against Item plus Frappe's built-in "Create a new Item" option when
		// nothing matches, which a plain <select> can't offer.
		wrap.querySelectorAll('.dtp-item-cell').forEach(cell => {
			const uid = cell.dataset.uid;
			const found = this._findRowByUid(uid);
			const ctrl = frappe.ui.form.make_control({
				parent: $(cell),
				df: {
					fieldtype: 'Link',
					options: 'Item',
					fieldname: 'procedure',
					placeholder: __('Select or create an item…'),
				},
				only_input: true,
				render_input: true,
			});
			if (found && found.row.type) ctrl.set_value(found.row.type);
			ctrl.$input.on('change', () => {
				const val = ctrl.get_value();
				this._setRowItem(uid, val);
			});
		});

		wrap.querySelectorAll('.dtp-priority-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.priority = e.target.value; this.render(); }
			});
		});

		wrap.querySelectorAll('.dtp-status-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.status = e.target.value; this.render(); }
			});
		});

		wrap.querySelectorAll('.dtp-fee-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.fee = flt(e.target.value); this.render(); }
			});
		});

		wrap.querySelectorAll('.dtp-ins-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.insurance_estimate = e.target.value; this.render(); }
			});
		});

		wrap.querySelectorAll('.dtp-portion-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.patient_portion = flt(e.target.value); this.render(); }
			});
		});
	}

	_addBlankRow() {
		const fdi = this.selFDI || (this.allMeta[0] && this.allMeta[0].fdi);
		if (!fdi) return;
		this.teeth[fdi].addRow({ type: '', label: '— Select —', color: '#c8cfd8', category: 'procedure' });
		this.render();
	}

	_removeRowByUid(uid) {
		const found = this._findRowByUid(uid);
		if (!found) return;
		found.state.rows = found.state.rows.filter(r => r.uid !== uid);
		this.selectedRowIds.delete(uid);
		this.render();
	}

	_duplicateSelected() {
		if (!this.selectedRowIds.size) return;
		this.selectedRowIds.forEach(uid => {
			const found = this._findRowByUid(uid);
			if (found) {
				found.state.rows.push({ ...found.row, uid: 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7) });
			}
		});
		this.selectedRowIds = new Set();
		this.render();
	}

	_deleteSelected() {
		if (!this.selectedRowIds.size) return;
		this.allMeta.forEach(meta => {
			const state = this.teeth[meta.fdi];
			state.rows = state.rows.filter(r => !this.selectedRowIds.has(r.uid));
		});
		this.selectedRowIds = new Set();
		this.render();
	}

	_moveRowTooth(uid, newFdi) {
		const found = this._findRowByUid(uid);
		if (!found || found.fdi === newFdi) return;
		const newState = this.teeth[newFdi];
		if (!newState) return;
		found.state.rows = found.state.rows.filter(r => r.uid !== uid);
		newState.rows.push(found.row);
		this.render();
	}

	async _setRowItem(uid, itemCode) {
		const found = this._findRowByUid(uid);
		if (!found) return;

		if (!itemCode) {
			found.row.type = '';
			found.row.label = '— Select —';
			found.row.color = '#c8cfd8';
			found.row.category = 'procedure';
			this.render();
			return;
		}

		let doc = this.itemCatalog.find(s => s.name === itemCode);

		if (!doc) {
			// Not in the cached catalog yet — most likely just created via
			// the Link field's "Create a new Item" option. Fetch it and add
			// it to the cache so the left palette picks it up too.
			try {
				const r = await frappe.db.get_value('Item', itemCode, ['item_name', 'standard_rate']);
				doc = this._addItemToCatalog({
					name: itemCode,
					item_name: (r.message && r.message.item_name) || itemCode,
					standard_rate: (r.message && r.message.standard_rate) || 0,
				});
			} catch (err) {
				console.error('[DentalTreatmentPlan] Could not fetch new item:', err);
				return;
			}
		}

		found.row.type = doc.name;
		found.row.label = doc.status_name || doc.name;
		found.row.color = doc.color;
		found.row.category = doc.category;
		found.row.fee = flt(doc.rate);
		this.render();
	}

	/* ── TOTALS ────────────────────────────────────────────────────────── */
	recalculateTotals() {
		let totalFee = 0, totalPortion = 0, totalIns = 0;
		this.allMeta.forEach(meta => {
			this.teeth[meta.fdi].rows.forEach(r => {
				totalFee += flt(r.fee);
				totalPortion += flt(r.patient_portion);
				totalIns += flt(r.insurance_estimate);
			});
		});
		_dtpSet('dtp-total-fee', format_currency(totalFee));
		_dtpSet('dtp-total-portion', format_currency(totalPortion));
		_dtpSet('dtp-total-ins', format_currency(totalIns));
	}

	/* ══════════════════════════════════════════════════════════════════
	   SAVE — first point Dental Treatment Plan Procedure is referenced.
	══════════════════════════════════════════════════════════════════*/
	save() {
		const patientId = this.patient_ctrl.get_value();
		if (!patientId) {
			frappe.msgprint({ title: 'No Patient Selected', message: 'Search for and select a patient before saving.', indicator: 'orange' });
			return;
		}

		const procedureRows = [];
		this.allMeta.forEach(meta => {
			const state = this.teeth[meta.fdi];
			if (state.rows.length) procedureRows.push(...state.toDocRows());
		});

		const doc = {
			doctype: this.frm_doctype,
			patient: patientId,
			provider: this.provider_ctrl.get_value(),
			plan_type: document.getElementById('dtp-plan-type').value,
			plan_date: this.plan_date_ctrl.get_value(),
			dental_treatment_plan_procedure: procedureRows,
			plan_note: document.getElementById('dtp-plan-note').value,
			total_insurance_estimate: this._parseCurrency(document.getElementById('dtp-total-ins').textContent),
			total_fee: this._parseCurrency(document.getElementById('dtp-total-fee').textContent),
			total_patient_portion: this._parseCurrency(document.getElementById('dtp-total-portion').textContent),
			signed_date: this.signed_date_ctrl.get_value(),
		};

		frappe.dom.freeze('Saving...');

		if (this.docname) {
			doc.name = this.docname;
			frappe.call({
				method: 'frappe.client.save',
				args: { doc: doc },
				callback: (r) => { frappe.dom.unfreeze(); if (r.message) this._afterSave(r.message); },
				error: () => frappe.dom.unfreeze(),
			});
		} else {
			frappe.call({
				method: 'frappe.client.insert',
				args: { doc: doc },
				callback: (r) => { frappe.dom.unfreeze(); if (r.message) this._afterSave(r.message); },
				error: () => frappe.dom.unfreeze(),
			});
		}
	}

	_parseCurrency(text) {
		return flt((text || '0').replace(/[^0-9.-]/g, ''));
	}

	_afterSave(doc) {
		this.docname = doc.name;
		_dtpSet('dtp-badge', doc.name);
		frappe.show_alert({ message: `Saved: ${doc.name}`, indicator: 'green' });
	}

	/* ══════════════════════════════════════════════════════════════════
	   NEW / LOAD HISTORY — second (and only other) point the child
	   doctype is referenced: frappe.client.get returns it as part of
	   the parent doc, server-side, only when the user asks for it.
	══════════════════════════════════════════════════════════════════*/
	reset() {
		this.docname = null;
		this.selFDI = null;
		this.selectedRowIds = new Set();
		this._resetAllTeeth();
		this.patient_ctrl.set_value('');
		this.provider_ctrl.set_value('');
		document.getElementById('dtp-plan-type').value = 'Active';
		this.plan_date_ctrl.set_value(frappe.datetime.get_today());
		document.getElementById('dtp-plan-note').value = '';
		this.signed_date_ctrl.set_value('');
		_dtpSet('dtp-badge', 'New Plan');
		this.render();
	}

	loadPlanHistory() {
		const patientId = this.patient_ctrl.get_value();
		const filters = patientId ? { patient: patientId } : {};

		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: this.frm_doctype,
				filters: filters,
				fields: ['name', 'patient', 'plan_date', 'plan_type', 'provider'],
				order_by: 'plan_date desc',
				limit_page_length: 20,
			},
			callback: (r) => {
				const list = r.message || [];
				if (!list.length) {
					frappe.msgprint({
						title: 'No Plans Found',
						message: patientId ? 'No saved treatment plans for this patient.' : 'No saved treatment plans yet.',
						indicator: 'orange',
					});
					return;
				}

				const d = new frappe.ui.Dialog({
					title: 'Select a Treatment Plan to Load',
					fields: [{ fieldtype: 'HTML', fieldname: 'plan_list_html' }],
				});

				const rows = list.map(p =>
					`<div class="dtp-hist-item" data-name="${p.name}" style="display:flex;align-items:center;gap:12px;padding:8px 10px;border:1px solid #e2e6ea;border-radius:6px;margin-bottom:5px;cursor:pointer;font-size:12px;">
                        <span style="font-family:'DM Mono',monospace;font-weight:600">${p.name}</span>
                        <span>${p.patient || ''}</span>
                        <span style="color:#6b7a8d">${frappe.datetime.str_to_user(p.plan_date)}</span>
                        <span style="color:#9aa3af;font-size:11px">${p.plan_type || ''}</span>
                    </div>`
				).join('');

				d.fields_dict.plan_list_html.$wrapper.html(`<div style="max-height:340px;overflow-y:auto">${rows}</div>`);

				d.fields_dict.plan_list_html.$wrapper.on('click', '.dtp-hist-item', (e) => {
					const name = $(e.currentTarget).data('name');
					d.hide();
					this._loadPlanByName(name);
				});

				d.show();
			},
		});
	}

	_loadPlanByName(name) {
		frappe.call({
			method: 'frappe.client.get',
			args: { doctype: this.frm_doctype, name: name },
			callback: (r) => {
				if (!r.message) return;
				const doc = r.message;

				try {
					this._resetAllTeeth();
					this.selectedRowIds = new Set();

					this.docname = doc.name;
					this.patient_ctrl.set_value(doc.patient || '');
					this.provider_ctrl.set_value(doc.provider || '');
					document.getElementById('dtp-plan-type').value = doc.plan_type || 'Active';
					this.plan_date_ctrl.set_value(doc.plan_date || '');
					document.getElementById('dtp-plan-note').value = doc.plan_note || '';
					this.signed_date_ctrl.set_value(doc.signed_date || '');

					(doc.dental_treatment_plan_procedure || []).forEach(row => {
						const state = this.teethSets.permanent[row.fdi] || this.teethSets.primary[row.fdi];
						if (state) state.loadFromDocRow(row, this.itemCatalog);
					});

					_dtpSet('dtp-badge', doc.name);
					this.render();
					frappe.show_alert({ message: `Loaded ${doc.name}`, indicator: 'green' });
				} catch (err) {
					console.error('[DentalTreatmentPlan] _loadPlanByName failed partway through:', err);
					frappe.msgprint({ title: 'Load Error', message: String(err), indicator: 'red' });
				}
			},
		});
	}

	_resetAllTeeth() {
		Object.values(this.teethSets.permanent).forEach(t => t.reset());
		Object.values(this.teethSets.primary).forEach(t => t.reset());
	}
}

function _dtpSet(id, val) {
	const el = document.getElementById(id);
	if (el) el.textContent = val;
}