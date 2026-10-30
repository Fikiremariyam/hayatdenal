frappe.pages['dt_treatment_plan'].on_page_load = function (wrapper) {

	/* ── 1. PAGE CHROME ─────────────────────────────────────────────────── */
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Dental Treatment Plan",
		single_column: true,
	});

	// Toolbar buttons (shown up front, not in the ⋯ menu)
	page.set_primary_action(__("Save"), () => window._dtp?.save(), "save");
	page.set_secondary_action(__("New Treatment Plan"), () => window._dtp?.reset(), "add");
	if (typeof page.add_button === "function") {
		page.add_button(__("Load History"), () => window._dtp?.loadPlanHistory(), { icon: "list" });
	} else {
		page.add_inner_button(__("Load History"), () => window._dtp?.loadPlanHistory());
	}

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
#dtp-root .dtp-pt-bar     { background:var(--panel);border-bottom:1px solid var(--border);padding:12px 18px;display:flex;align-items:center;gap:16px;flex-wrap:wrap; }
#dtp-root .dtp-pt-name    { font-size:15px;font-weight:700;min-width:200px; }
#dtp-root .dtp-provider   { min-width:200px; }
#dtp-root .dtp-plan-type  { border:1.5px solid var(--border);border-radius:6px;padding:5px 8px;font-size:12px;font-family:inherit;background:var(--panel2); }
#dtp-root .dtp-plan-date-wrap { min-width:130px; }
#dtp-root .dtp-field-lbl  { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted2);margin-bottom:2px;display:block; }

/* Document title block (top right) */
#dtp-root .dtp-doc-head     { margin-left:auto;display:flex;flex-direction:column;align-items:flex-end;gap:4px;padding:2px 0 2px 18px;border-left:1px solid var(--border); }
#dtp-root .dtp-doc-kicker   { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.14em;color:var(--muted2); }
#dtp-root .dtp-doc-row      { display:flex;align-items:center;gap:10px; }
#dtp-root .dtp-doc-name     { font-size:21px;font-weight:700;letter-spacing:-.01em;line-height:1.15;color:var(--text);font-family:'DM Mono',ui-monospace,monospace; }
#dtp-root .dtp-doc-name.is-new { font-family:inherit;color:var(--muted); }
#dtp-root .dtp-doc-status   { display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;white-space:nowrap; }
#dtp-root .dtp-doc-status::before { content:'';width:7px;height:7px;border-radius:50%;background:currentColor; }
#dtp-root .dtp-doc-status.is-new   { background:#fff4e5;color:#c0610a; }
#dtp-root .dtp-doc-status.is-saved { background:#e7f6ee;color:#1e8449; }

#dtp-root .pal-section   { padding:11px 12px 7px; }
#dtp-root .pal-label     { font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--muted2);margin-bottom:7px;display:block; }
#dtp-root .pal-dot       { width:11px;height:11px;border-radius:3px;flex-shrink:0; }
#dtp-root .pal-rate      { margin-left:auto;font-size:10px;color:var(--muted2);font-family:'DM Mono',monospace; }
#dtp-root .pal-selected  { display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;background:var(--accent-light);border:1.5px solid var(--accent);font-size:12px;font-weight:600; }
#dtp-root .pal-selected .pal-rate { color:var(--accent); }
#dtp-root .pal-selected-clear { margin-left:auto;cursor:pointer;color:var(--muted);font-size:14px;line-height:1;padding:0 2px; }
#dtp-root .pal-selected-clear:hover { color:#e74c3c; }
#dtp-root .pal-empty-hint { font-size:11px;color:var(--muted2);padding:4px 2px;line-height:1.4; }
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
#dtp-root .tooth-num-main{ font-family:'DM Mono',monospace;font-size:11px;font-weight:600;color:var(--muted);margin-bottom:3px;line-height:1; }
#dtp-root .lower-row .tooth-num-main{ margin-bottom:0;margin-top:3px; }
#dtp-root .tooth-svg-wrap{ position:relative; }
#dtp-root .tooth-svg-wrap svg{ display:block; }
#dtp-root .tooth-badge   { position:absolute;top:-4px;right:-4px;width:13px;height:13px;border-radius:50%;border:1.5px solid #fff;font-size:7px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;z-index:2; }
#dtp-root .sum-tbl       { width:100%;border-collapse:collapse;font-size:12px; }
#dtp-root .sum-tbl th    { background:var(--panel2);padding:6px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);font-weight:600;border-bottom:1px solid var(--border); }
#dtp-root .sum-tbl td    { padding:6px 10px;border-bottom:1px solid var(--border); }
#dtp-root .sum-tbl tr:last-child td{ border-bottom:none; }
#dtp-root .sum-tbl tr:hover td{ background:var(--panel2); }
#dtp-root .sum-tbl tfoot td{ border-bottom:none;border-top:1.5px solid var(--border2);font-weight:700;background:var(--panel2); }
#dtp-root .sum-tbl tr.tp-invoiced td{ background:#f3fbf6; }
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
#dtp-root .tp-cell-input:disabled { color:var(--muted);cursor:not-allowed; }
#dtp-root .tp-status-Pending   { color:#e67e22;font-weight:600; }
#dtp-root .tp-status-Completed { color:#27ae60;font-weight:600; }
#dtp-root .tp-inv-link     { display:block;font-size:10px;font-family:'DM Mono',monospace;color:var(--accent);margin-top:2px;padding-left:4px; }
#dtp-root .notes-card    { background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:12px; }
#dtp-root .notes-lbl     { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin-bottom:7px;display:block; }
#dtp-root .dp-textarea   { width:100%;border:1.5px solid var(--border);border-radius:6px;padding:7px 10px;font-family:inherit;font-size:12px;color:var(--text);background:var(--panel2);outline:none;resize:none; }
#dtp-root .dp-textarea:focus{ border-color:var(--accent); }
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

    <div class="dtp-doc-head">
      <div class="dtp-doc-kicker">Treatment Plan</div>
      <div class="dtp-doc-row">
        <div class="dtp-doc-name is-new" id="dtp-doc-name">New Treatment Plan</div>
        <span class="dtp-doc-status is-new" id="dtp-doc-status">Not Saved</span>
      </div>
    </div>
  </div>

  <div class="dtp-body">

    <div class="dtp-palette">
      <div class="pal-section">
        <div class="pal-label">Treatment Items</div>
        <div id="dtp-item-search-link" style="margin-bottom:7px;"></div>
        <div id="dtp-item-selected"></div>
      </div>
    </div>

    <div class="dtp-main">

      <div class="dentition-section-label">Permanent Dentition</div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary</div>
          <div style="font-size:10px;color:var(--muted2)">UR8 → UR1 · UL1 → UL8</div>
        </div>
        <div class="teeth-row" id="dtp-upper-row"></div>
      </div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular</div>
          <div style="font-size:10px;color:var(--muted2)">LR8 → LR1 · LL1 → LL8</div>
        </div>
        <div class="teeth-row lower-row" id="dtp-lower-row"></div>
      </div>

      <div class="dentition-section-label">Primary (Child) Dentition</div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Upper — Maxillary (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">UR5 → UR1 · UL1 → UL5</div>
        </div>
        <div class="teeth-row" id="dtp-upper-row-child"></div>
      </div>
      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Lower — Mandibular (Primary)</div>
          <div style="font-size:10px;color:var(--muted2)">LR5 → LR1 · LL1 → LL5</div>
        </div>
        <div class="teeth-row lower-row" id="dtp-lower-row-child"></div>
      </div>

      <div class="arch-block">
        <div class="arch-bar">
          <div class="arch-title">Dental Treatment Plan Procedure</div>
          <div style="font-size:10px;color:var(--muted2);margin-left:auto">Edit directly, or add/remove rows below · sorted by visit</div>
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

      <div class="totals-stack">
        <div class="total-card">
          <div class="total-card-lbl">Total Fee</div>
          <div class="total-card-val" id="dtp-total-fee">0</div>
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

// Runs every time the page is opened (Frappe caches pages, so on_page_load
// only runs the first time). Picks up the patient sent from the Patient form.
frappe.pages['dt_treatment_plan'].on_page_show = function () {
	if (window._dtp) window._dtp.applyRouteOptions();
};


/* ═══════════════════════════════════════════════════════════════════════════
   Visit / Status choices.
   Visits are loaded at start-up from the "visit" field on the child doctype:
     • Select field → its options (in the order defined there)
     • Link field   → every record of the linked doctype
   The list below is only a fallback if that lookup fails.
   ═══════════════════════════════════════════════════════════════════════════*/
let dtpVisitOptions = ['Visit 1', 'Visit 2', 'Visit 3'];
const DTP_STATUS_OPTIONS = ['Pending', 'Completed'];

function dtpDefaultVisit() {
	return dtpVisitOptions[0] || 'Visit 1';
}

// Sort key for a visit: its position in the visit list; unknown visits go last.
function dtpVisitIndex(v) {
	const i = dtpVisitOptions.indexOf(v);
	return i === -1 ? dtpVisitOptions.length : i;
}

function dtpEsc(v) {
	return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}


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


/* ───────────────────────────────────────────────────────────────────────────
   ToothState — holds every planned procedure row for one tooth.
─────────────────────────────────────────────────────────────────────────────*/
class DtpToothState {
	constructor(meta) {
		this.fdi  = meta.fdi;
		this.code = meta.code;
		this.name = meta.name;
		this.type = meta.type;
		this.rows = [];   // [{ uid, type(item code), label, color, category, visit, status, sales_invoice, note, fee }]
	}

	// dedupe=true: clicking the same item on a tooth replaces it (palette behaviour).
	// dedupe=false: used when loading saved rows, so the same procedure can exist
	// on the same tooth for different visits.
	addRow(row, dedupe = true) {
		if (dedupe) this.rows = this.rows.filter(r => r.type !== row.type || r.sales_invoice);
		if (!row.uid) row.uid = 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
		if (!row.visit)  row.visit = dtpDefaultVisit();
		if (!row.status) row.status = 'Pending';
		if (row.sales_invoice === undefined) row.sales_invoice = '';
		if (row.note === undefined)          row.note = '';
		if (row.fee === undefined)           row.fee = 0;
		this.rows.push(row);
	}

	reset() { this.rows = []; }

	loadFromDocRow(row, catalog = []) {
		const code = row.procedure || '';
		const match = code ? catalog.find(s => s.name === code) : null;
		this.addRow({
			type         : code,
			label        : !code ? '— Select —' : (match ? (match.status_name || match.name) : code),
			color        : !code ? '#c8cfd8' : (match ? match.color : dtpHashColor(code)),
			category     : !code ? 'procedure' : (match ? match.category : dtpClassifyProcedure(code)),
			visit        : row.visit || dtpDefaultVisit(),
			status       : row.status || 'Pending',
			sales_invoice: row.sales_invoice || '',
			note         : row.note || '',
			fee          : flt(row.fee),
		}, false);
	}

	toDocRow(r) {
		return {
			doctype      : 'Dental Treatment Plan Procedure',
			fdi          : this.fdi,      // FDI number is still stored so old plans keep loading
			name1        : this.name,
			procedure    : r.type,
			visit        : r.visit || dtpDefaultVisit(),
			status       : r.status || 'Pending',
			sales_invoice: r.sales_invoice || '',   // kept so the server never invoices a row twice
			note         : r.note || '',
			fee          : flt(r.fee),
		};
	}

	toDocRows() {
		return this.rows.map(r => this.toDocRow(r));
	}
}


/* ───────────────────────────────────────────────────────────────────────────
   ToothSVG — full anatomical morphology (unchanged).
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
   Display order (dentist's view, patient's right on the left of the screen):
                   UR8 … UR1 | UL1 … UL8   (top)
                   LR8 … LR1 | LL1 … LL8   (bottom)
   Primary teeth use the same style: UR5 … UR1 | UL1 … UL5.
   FDI numbers are kept internally so saved data stays compatible.
─────────────────────────────────────────────────────────────────────────────*/
class DentalTreatmentPlanChart {

	static UPPER_META = [
		{fdi:'18',code:'UR8',name:'Upper Right 3rd Molar',    type:'molar'},
		{fdi:'17',code:'UR7',name:'Upper Right 2nd Molar',    type:'molar'},
		{fdi:'16',code:'UR6',name:'Upper Right 1st Molar',    type:'molar'},
		{fdi:'15',code:'UR5',name:'Upper Right 2nd Premolar', type:'premolar'},
		{fdi:'14',code:'UR4',name:'Upper Right 1st Premolar', type:'premolar'},
		{fdi:'13',code:'UR3',name:'Upper Right Canine',       type:'canine'},
		{fdi:'12',code:'UR2',name:'Upper Right Lateral',      type:'incisor'},
		{fdi:'11',code:'UR1',name:'Upper Right Central',      type:'incisor'},
		{fdi:'21',code:'UL1',name:'Upper Left Central',       type:'incisor'},
		{fdi:'22',code:'UL2',name:'Upper Left Lateral',       type:'incisor'},
		{fdi:'23',code:'UL3',name:'Upper Left Canine',        type:'canine'},
		{fdi:'24',code:'UL4',name:'Upper Left 1st Premolar',  type:'premolar'},
		{fdi:'25',code:'UL5',name:'Upper Left 2nd Premolar',  type:'premolar'},
		{fdi:'26',code:'UL6',name:'Upper Left 1st Molar',     type:'molar'},
		{fdi:'27',code:'UL7',name:'Upper Left 2nd Molar',     type:'molar'},
		{fdi:'28',code:'UL8',name:'Upper Left 3rd Molar',     type:'molar'},
	];

	static LOWER_META = [
		{fdi:'48',code:'LR8',name:'Lower Right 3rd Molar',    type:'molar'},
		{fdi:'47',code:'LR7',name:'Lower Right 2nd Molar',    type:'molar'},
		{fdi:'46',code:'LR6',name:'Lower Right 1st Molar',    type:'molar'},
		{fdi:'45',code:'LR5',name:'Lower Right 2nd Premolar', type:'premolar'},
		{fdi:'44',code:'LR4',name:'Lower Right 1st Premolar', type:'premolar'},
		{fdi:'43',code:'LR3',name:'Lower Right Canine',       type:'canine'},
		{fdi:'42',code:'LR2',name:'Lower Right Lateral',      type:'incisor'},
		{fdi:'41',code:'LR1',name:'Lower Right Central',      type:'incisor'},
		{fdi:'31',code:'LL1',name:'Lower Left Central',       type:'incisor'},
		{fdi:'32',code:'LL2',name:'Lower Left Lateral',       type:'incisor'},
		{fdi:'33',code:'LL3',name:'Lower Left Canine',        type:'canine'},
		{fdi:'34',code:'LL4',name:'Lower Left 1st Premolar',  type:'premolar'},
		{fdi:'35',code:'LL5',name:'Lower Left 2nd Premolar',  type:'premolar'},
		{fdi:'36',code:'LL6',name:'Lower Left 1st Molar',     type:'molar'},
		{fdi:'37',code:'LL7',name:'Lower Left 2nd Molar',     type:'molar'},
		{fdi:'38',code:'LL8',name:'Lower Left 3rd Molar',     type:'molar'},
	];

	static UPPER_META_CHILD = [
		{fdi:'55',code:'UR5',name:'Upper Right 2nd Primary Molar', type:'molar',   primary:true},
		{fdi:'54',code:'UR4',name:'Upper Right 1st Primary Molar', type:'molar',   primary:true},
		{fdi:'53',code:'UR3',name:'Upper Right Primary Canine',    type:'canine',  primary:true},
		{fdi:'52',code:'UR2',name:'Upper Right Primary Lateral',   type:'incisor', primary:true},
		{fdi:'51',code:'UR1',name:'Upper Right Primary Central',   type:'incisor', primary:true},
		{fdi:'61',code:'UL1',name:'Upper Left Primary Central',    type:'incisor', primary:true},
		{fdi:'62',code:'UL2',name:'Upper Left Primary Lateral',    type:'incisor', primary:true},
		{fdi:'63',code:'UL3',name:'Upper Left Primary Canine',     type:'canine',  primary:true},
		{fdi:'64',code:'UL4',name:'Upper Left 1st Primary Molar',  type:'molar',   primary:true},
		{fdi:'65',code:'UL5',name:'Upper Left 2nd Primary Molar',  type:'molar',   primary:true},
	];

	static LOWER_META_CHILD = [
		{fdi:'85',code:'LR5',name:'Lower Right 2nd Primary Molar', type:'molar',   primary:true},
		{fdi:'84',code:'LR4',name:'Lower Right 1st Primary Molar', type:'molar',   primary:true},
		{fdi:'83',code:'LR3',name:'Lower Right Primary Canine',    type:'canine',  primary:true},
		{fdi:'82',code:'LR2',name:'Lower Right Primary Lateral',   type:'incisor', primary:true},
		{fdi:'81',code:'LR1',name:'Lower Right Primary Central',   type:'incisor', primary:true},
		{fdi:'71',code:'LL1',name:'Lower Left Primary Central',    type:'incisor', primary:true},
		{fdi:'72',code:'LL2',name:'Lower Left Primary Lateral',    type:'incisor', primary:true},
		{fdi:'73',code:'LL3',name:'Lower Left Primary Canine',     type:'canine',  primary:true},
		{fdi:'74',code:'LL4',name:'Lower Left 1st Primary Molar',  type:'molar',   primary:true},
		{fdi:'75',code:'LL5',name:'Lower Left 2nd Primary Molar',  type:'molar',   primary:true},
	];

	// Midline is drawn after the last right-side tooth (UR1 / LR1)
	static MIDLINE_AFTER = { permanent: ['11', '41'], primary: ['51', '81'] };

	static allMetaStatic() {
		return [
			...DentalTreatmentPlanChart.UPPER_META,       ...DentalTreatmentPlanChart.LOWER_META,
			...DentalTreatmentPlanChart.UPPER_META_CHILD, ...DentalTreatmentPlanChart.LOWER_META_CHILD,
		];
	}

	// FDI → display label (e.g. '18' → 'UR8', '55' → 'UR5 (Primary)')
	static codeFor(fdi) {
		const m = DentalTreatmentPlanChart.allMetaStatic().find(x => x.fdi === String(fdi));
		if (!m) return fdi || '-';
		return m.primary ? `${m.code} (Primary)` : m.code;
	}

	// Work out which tooth a saved child row belongs to.
	// 1) fdi field — accepts "18", 18 or "18.0" (Data / Int / Float fields)
	// 2) name1 field — the tooth name, e.g. "Upper Right 3rd Molar"
	static fdiForRow(row) {
		const all = DentalTreatmentPlanChart.allMetaStatic();
		if (row.fdi !== undefined && row.fdi !== null && row.fdi !== '') {
			const f = String(parseInt(row.fdi, 10));
			if (all.some(m => m.fdi === f)) return f;
		}
		if (row.name1) {
			const n = String(row.name1).trim().toLowerCase();
			const m = all.find(x => x.name.toLowerCase() === n);
			if (m) return m.fdi;
		}
		return null;
	}

	constructor() {
		this.frm_doctype = 'Dental Treatment Plan';
		this.child_doctype = 'Dental Treatment Plan Procedure';
		// Fieldname of the child table on the parent. Detected from the doctype
		// in _detectTableField(); this is only the fallback.
		this.tableField = 'dental_treatment_plan_procedure';
		this.docname = null;

		this.selectedRowIds = new Set();

		this.teethSets = { permanent: {}, primary: {} };
		[...DentalTreatmentPlanChart.UPPER_META, ...DentalTreatmentPlanChart.LOWER_META]
			.forEach(m => { this.teethSets.permanent[m.fdi] = new DtpToothState(m); });
		[...DentalTreatmentPlanChart.UPPER_META_CHILD, ...DentalTreatmentPlanChart.LOWER_META_CHILD]
			.forEach(m => { this.teethSets.primary[m.fdi] = new DtpToothState(m); });

		// Small cache of Items already looked up — not a full catalog.
		this.itemCatalog = [];
		this.selItem = null;

		this.selFDI = null;

		this._tip = document.getElementById('dtp-tip');
	}

	get allMeta() { return DentalTreatmentPlanChart.allMetaStatic(); }
	get teeth() { return { ...this.teethSets.permanent, ...this.teethSets.primary }; }

	/* ── init ──────────────────────────────────────────────────────────── */
	init() {
		this.patient_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-pt-name'),
			df: { fieldtype: 'Link', options: 'Patient', label: 'Patient', fieldname: 'patient', placeholder: 'Search patient…', reqd: 1 },
			render_input: true,
		});

		// Provider = the logged-in user who creates the plan (read-only)
		this.provider_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-provider'),
			df: { fieldtype: 'Link', options: 'User', label: 'Provider', fieldname: 'provider', read_only: 1 },
			render_input: true,
		});
		this.provider_ctrl.set_value(frappe.session.user);

		this.plan_date_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-plan-date'),
			df: { fieldtype: 'Date', label: 'Plan Date', fieldname: 'plan_date' },
			render_input: true,
		});
		this.plan_date_ctrl.set_value(frappe.datetime.get_today());

		this.item_search_ctrl = frappe.ui.form.make_control({
			parent: $('#dtp-item-search-link'),
			df: {
				fieldtype: 'Link',
				options: 'Item',
				fieldname: 'item_search',
				placeholder: __('Search or create an item…'),
				onchange: () => this._onItemSearchSelected(),
			},
			only_input: true,
			render_input: true,
		});

		this._bindTooltip();
		this._renderSelectedItem();
		this._setDocTitle(null);

		this.render();
		this.applyRouteOptions();
		this._loadVisitOptions();
		this._detectTableField();
	}

	/* ── CHILD TABLE FIELDNAME ────────────────────────────────────────── */
	// Finds the Table field on the parent whose options = the child doctype.
	// If the hard-coded name is wrong, rows are silently dropped on save and
	// never come back on load — so we always read it from the doctype.
	async _detectTableField() {
		try {
			await this._loadMeta(this.frm_doctype);
			const fields = (frappe.get_meta(this.frm_doctype) || {}).fields || [];
			const tf = fields.find(df => ['Table', 'Table MultiSelect'].includes(df.fieldtype) && df.options === this.child_doctype);
			if (tf) this.tableField = tf.fieldname;
			else console.warn(`[DentalTreatmentPlan] No Table field for ${this.child_doctype} on ${this.frm_doctype}`);
		} catch (err) {
			console.warn('[DentalTreatmentPlan] Could not detect child table field:', err);
		}
		return this.tableField;
	}

	/* ── VISIT OPTIONS (from the child doctype's "visit" field) ───────── */
	async _loadVisitOptions() {
		try {
			await this._loadMeta(this.child_doctype);
			const df = frappe.meta.get_docfield(this.child_doctype, 'visit');
			if (!df) return;

			let opts = [];
			if (df.fieldtype === 'Select') {
				opts = (df.options || '').split('\n').map(s => s.trim()).filter(Boolean);
			} else if (df.fieldtype === 'Link' && df.options) {
				const list = await frappe.db.get_list(df.options, { fields: ['name'], limit: 1000 });
				opts = (list || []).map(x => x.name)
					.sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
			}

			if (opts.length) {
				dtpVisitOptions = opts;
				this.render();
			}
		} catch (err) {
			console.warn('[DentalTreatmentPlan] Could not load visit options, using defaults:', err);
		}
	}

	/* ── DOCUMENT TITLE (top right) ───────────────────────────────────── */
	_setDocTitle(name) {
		const nameEl = document.getElementById('dtp-doc-name');
		const statEl = document.getElementById('dtp-doc-status');
		if (!nameEl || !statEl) return;
		if (name) {
			nameEl.textContent = name;
			nameEl.classList.remove('is-new');
			statEl.textContent = 'Saved';
			statEl.className = 'dtp-doc-status is-saved';
		} else {
			nameEl.textContent = 'New Treatment Plan';
			nameEl.classList.add('is-new');
			statEl.textContent = 'Not Saved';
			statEl.className = 'dtp-doc-status is-new';
		}
	}

	/* ── PATIENT PASSED FROM THE PATIENT FORM ─────────────────────────── */
	applyRouteOptions() {
		const opts = frappe.route_options;
		if (!opts || !opts.patient) return;
		frappe.route_options = null;

		// Different patient than the one on screen → start a fresh plan
		if (this.patient_ctrl.get_value() !== opts.patient) {
			this.reset();
		}
		this.patient_ctrl.set_value(opts.patient);
	}

	/* ── SELECTED ITEM (left palette) ─────────────────────────────────── */
	async _onItemSearchSelected() {
		const val = this.item_search_ctrl.get_value();
		if (!val) return;

		let doc = this.itemCatalog.find(s => s.name === val);
		if (!doc) {
			try {
				const r = await frappe.db.get_value('Item', val, ['item_name', 'standard_rate']);
				doc = this._cacheItem({
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
		this._renderSelectedItem();
		if (this.selFDI) this._applySelectedItem();

		this.item_search_ctrl.set_value('');
	}

	_cacheItem(item) {
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
		return doc;
	}

	_renderSelectedItem() {
		const wrap = document.getElementById('dtp-item-selected');
		if (!wrap) return;

		if (!this.selItem) {
			wrap.innerHTML = `<div class="pal-empty-hint">Search above and pick an item, then click a tooth to apply it.</div>`;
			return;
		}

		wrap.innerHTML = `
            <div class="pal-selected" style="color:${this.selItem.color}">
                <span class="pal-dot" style="background:${this.selItem.color}"></span>
                <span>${dtpEsc(this.selItem.label)}</span>
                ${this.selItem.rate ? `<span class="pal-rate">${format_currency(this.selItem.rate)}</span>` : ''}
                <span class="pal-selected-clear" id="dtp-clear-selected-item" title="Clear selection">✕</span>
            </div>`;

		const clearBtn = document.getElementById('dtp-clear-selected-item');
		if (clearBtn) clearBtn.addEventListener('click', () => {
			this.selItem = null;
			this._renderSelectedItem();
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
			frappe.msgprint({ title: 'No Item Selected', message: 'Search and pick a treatment item on the left first.', indicator: 'orange' });
			return;
		}
		const state = this.teeth[this.selFDI];
		if (!state) return;

		const existing = state.rows.filter(r => r.type === this.selItem.id);
		const removable = existing.filter(r => !r.sales_invoice);
		if (removable.length) {
			// Toggle off (only rows that haven't been invoiced)
			state.rows = state.rows.filter(r => !(r.type === this.selItem.id && !r.sales_invoice));
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
		this._renderTable();
		this.recalculateTotals();
	}

	_renderArch(metaList, containerId, isUpper, dentitionKey) {
		const row = document.getElementById(containerId);
		if (!row) return;
		row.innerHTML = '';

		// Right quadrant is drawn first, so "R" sits on the left side
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
		const sel = this.selFDI === meta.fdi;

		const fc = state.rows[0];
		const badge = fc
			? `<div class="tooth-badge" style="background:${fc.color || '#1a6ef5'};${isUpper ? '' : 'bottom:-4px;top:auto'}">${dtpEsc((fc.label || fc.type || '?').charAt(0).toUpperCase())}</div>`
			: '';

		const el = document.createElement('div');
		el.className = `tooth-cell${sel ? ' selected' : ''}`;
		el.id = `dtpt-${meta.fdi}`;

		const numH = `<div class="tooth-num-main">${meta.code}</div>`;
		const svgH = `<div class="tooth-svg-wrap">${DtpToothSVG.render(meta, isUpper, state.rows)}${badge}</div>`;
		el.innerHTML = isUpper ? (numH + svgH) : (svgH + numH);

		el.addEventListener('click', () => this._selectTooth(meta.fdi));
		el.addEventListener('mouseenter', (e) => this._showTip(e, meta));
		el.addEventListener('mouseleave', () => this._hideTip());

		return el;
	}

	_showTip(e, meta) {
		const rows = this.teeth[meta.fdi].rows;
		const str = rows.length
			? rows.map(r => `${dtpEsc(r.label || r.type)} (${dtpEsc(r.visit)} · ${r.status})${r.fee ? ' · ' + format_currency(r.fee) : ''}`).join(', ')
			: 'No procedure planned';
		this._tip.innerHTML = `<b>${meta.code}</b> · ${meta.name}<br><span style="color:#9ca3af;font-size:10px">${str}</span>`;
		this._tip.style.opacity = '1';
		this._tip.style.left = (e.clientX + 14) + 'px';
		this._tip.style.top = (e.clientY - 8) + 'px';
	}
	_hideTip() { this._tip.style.opacity = '0'; }

	_bindTooltip() {
		document.addEventListener('mousemove', e => {
			if (this._tip && this._tip.style.opacity === '1') {
				this._tip.style.left = (e.clientX + 14) + 'px';
				this._tip.style.top = (e.clientY - 8) + 'px';
			}
		});
	}

	/* ── ROWS, SORTED BY VISIT ────────────────────────────────────────── */
	// All procedure rows as one list, ordered by visit (in the order of the
	// visit options), then by tooth position, then by the order they were added.
	_flatRows() {
		const flat = [];
		this.allMeta.forEach(meta => {
			this.teeth[meta.fdi].rows.forEach(r => flat.push({ fdi: meta.fdi, row: r, ord: flat.length }));
		});
		flat.sort((a, b) =>
			(dtpVisitIndex(a.row.visit) - dtpVisitIndex(b.row.visit))
			|| String(a.row.visit || '').localeCompare(String(b.row.visit || ''), undefined, { numeric: true })
			|| (a.ord - b.ord));
		return flat;
	}

	_toothOptionsHtml(selectedFdi) {
		const opt = m => `<option value="${m.fdi}" ${m.fdi === selectedFdi ? 'selected' : ''}>${m.code}</option>`;
		const perm = [...DentalTreatmentPlanChart.UPPER_META, ...DentalTreatmentPlanChart.LOWER_META].map(opt).join('');
		const prim = [...DentalTreatmentPlanChart.UPPER_META_CHILD, ...DentalTreatmentPlanChart.LOWER_META_CHILD].map(opt).join('');
		return `<optgroup label="Permanent">${perm}</optgroup><optgroup label="Primary">${prim}</optgroup>`;
	}

	_visitOptionsHtml(current) {
		const list = [...dtpVisitOptions];
		if (current && !list.includes(current)) list.push(current);   // never lose a saved value
		return list.map(v => `<option value="${dtpEsc(v)}" ${v === current ? 'selected' : ''}>${dtpEsc(v)}</option>`).join('');
	}

	/* ── DENTAL TREATMENT PLAN PROCEDURE TABLE ────────────────────────── */
	_renderTable() {
		const wrap = document.getElementById('dtp-summary-wrap');
		if (!wrap) return;

		const flat = this._flatRows();

		const nSel = this.selectedRowIds.size;
		const allChecked = flat.length > 0 && nSel === flat.length;
		const totalFee = flat.reduce((sum, r) => sum + flt(r.row.fee), 0);

		const rows = flat.map((r, idx) => {
			const inv  = r.row.sales_invoice;
			const lock = inv ? 'disabled' : '';
			const status = r.row.status || 'Pending';
			return `
            <tr class="${inv ? 'tp-invoiced' : ''}">
                <td class="tp-chk-cell"><input type="checkbox" class="dtp-row-chk" data-uid="${r.row.uid}" ${this.selectedRowIds.has(r.row.uid) ? 'checked' : ''}></td>
                <td class="tp-idx-cell">${idx + 1}</td>
                <td>
                    <select class="tp-cell-input dtp-tooth-edit" data-uid="${r.row.uid}" ${lock}>
                        ${this._toothOptionsHtml(r.fdi)}
                    </select>
                </td>
                <td><div class="dtp-item-cell" data-uid="${r.row.uid}"></div></td>
                <td>
                    <select class="tp-cell-input dtp-visit-edit" data-uid="${r.row.uid}" ${lock}>
                        ${this._visitOptionsHtml(r.row.visit)}
                    </select>
                </td>
                <td><input type="text" class="tp-cell-input dtp-note-edit" data-uid="${r.row.uid}" value="${dtpEsc(r.row.note)}" placeholder="Note…"></td>
                <td><input type="number" step="0.01" class="tp-cell-input dtp-fee-edit" data-uid="${r.row.uid}" value="${flt(r.row.fee)}" style="text-align:right" ${lock}></td>
                <td>
                    <select class="tp-cell-input dtp-status-edit tp-status-${status}" data-uid="${r.row.uid}" ${lock}>
                        ${DTP_STATUS_OPTIONS.map(s => `<option value="${s}" ${s === status ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                    ${inv ? `<a class="tp-inv-link" href="/app/sales-invoice/${encodeURIComponent(inv)}" target="_blank" title="Open invoice">${dtpEsc(inv)}</a>` : ''}
                </td>
                <td>${inv ? '' : `<span class="tp-row-rm dtp-row-rm" data-uid="${r.row.uid}" title="Delete row">🗑</span>`}</td>
            </tr>`;
		}).join('');

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
                        <th style="width:80px">Tooth</th>
                        <th>Procedure</th>
                        <th style="width:110px">Visit</th>
                        <th style="width:200px">Note</th>
                        <th style="width:90px">Fee</th>
                        <th style="width:110px">Status</th>
                        <th style="width:26px"></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
                <tfoot>
                    <tr>
                        <td colspan="6" style="text-align:right">Total</td>
                        <td>${format_currency(totalFee)}</td>
                        <td colspan="2"></td>
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

		// Changing the visit re-renders, which re-sorts the table by visit
		wrap.querySelectorAll('.dtp-visit-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.visit = e.target.value; this.render(); }
			});
		});

		wrap.querySelectorAll('.dtp-status-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.status = e.target.value; this.render(); }
			});
		});

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
			if (found && found.row.sales_invoice) {
				ctrl.$input.prop('disabled', true);
				return;
			}
			ctrl.$input.on('change', () => {
				const val = ctrl.get_value();
				this._setRowItem(uid, val);
			});
		});

		// Note is stored on every keystroke without re-render (keeps focus).
		wrap.querySelectorAll('.dtp-note-edit').forEach(el => {
			el.addEventListener('input', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) found.row.note = e.target.value;
			});
		});

		wrap.querySelectorAll('.dtp-fee-edit').forEach(el => {
			el.addEventListener('change', (e) => {
				const found = this._findRowByUid(el.dataset.uid);
				if (found) { found.row.fee = flt(e.target.value); this.render(); }
			});
		});
	}

	_addBlankRow() {
		const fdi = this.selFDI || (this.allMeta[0] && this.allMeta[0].fdi);
		if (!fdi) return;
		this.teeth[fdi].addRow({ type: '', label: '— Select —', color: '#c8cfd8', category: 'procedure' }, false);
		this.render();
	}

	_removeRowByUid(uid) {
		const found = this._findRowByUid(uid);
		if (!found) return;
		if (found.row.sales_invoice) {
			frappe.msgprint({ title: 'Already Invoiced', message: `This row is billed on ${found.row.sales_invoice} and can't be deleted.`, indicator: 'orange' });
			return;
		}
		found.state.rows = found.state.rows.filter(r => r.uid !== uid);
		this.selectedRowIds.delete(uid);
		this.render();
	}

	_duplicateSelected() {
		if (!this.selectedRowIds.size) return;
		this.selectedRowIds.forEach(uid => {
			const found = this._findRowByUid(uid);
			if (found) {
				found.state.rows.push({
					...found.row,
					uid: 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
					status: 'Pending',
					sales_invoice: '',
				});
			}
		});
		this.selectedRowIds = new Set();
		this.render();
	}

	_deleteSelected() {
		if (!this.selectedRowIds.size) return;
		let skipped = 0;
		this.allMeta.forEach(meta => {
			const state = this.teeth[meta.fdi];
			state.rows = state.rows.filter(r => {
				if (!this.selectedRowIds.has(r.uid)) return true;
				if (r.sales_invoice) { skipped++; return true; }
				return false;
			});
		});
		this.selectedRowIds = new Set();
		this.render();
		if (skipped) {
			frappe.show_alert({ message: `${skipped} invoiced row(s) were kept`, indicator: 'orange' });
		}
	}

	_moveRowTooth(uid, newFdi) {
		const found = this._findRowByUid(uid);
		if (!found || found.fdi === newFdi || found.row.sales_invoice) return;
		const newState = this.teeth[newFdi];
		if (!newState) return;
		found.state.rows = found.state.rows.filter(r => r.uid !== uid);
		newState.rows.push(found.row);
		this.render();
	}

	async _setRowItem(uid, itemCode) {
		const found = this._findRowByUid(uid);
		if (!found || found.row.sales_invoice) return;

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
			try {
				const r = await frappe.db.get_value('Item', itemCode, ['item_name', 'standard_rate']);
				doc = this._cacheItem({
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
		let totalFee = 0;
		this.allMeta.forEach(meta => {
			this.teeth[meta.fdi].rows.forEach(r => { totalFee += flt(r.fee); });
		});
		this._totalFee = totalFee;
		_dtpSet('dtp-total-fee', format_currency(totalFee));
	}

	/* ── SAVE ──────────────────────────────────────────────────────────── */
	// Everything happens here in the browser:
	//   1. check the child table has the visit / status / sales_invoice fields
	//   2. save the plan (rows saved in visit order)
	//   3. if there are new Completed rows → create a Sales Invoice for the
	//      patient's customer, stamp its number on those rows, save again
	async save() {
		if (this._saving) return;

		const patientId = this.patient_ctrl.get_value();
		if (!patientId) {
			frappe.msgprint({ title: 'No Patient Selected', message: 'Search for and select a patient before saving.', indicator: 'orange' });
			return;
		}

		const procedureRows = this._flatRows().map(f => this.teeth[f.fdi].toDocRow(f.row));

		if (procedureRows.some(r => !r.procedure && r.status === 'Completed')) {
			frappe.msgprint({ title: 'Missing Procedure', message: 'A row marked Completed has no procedure item selected.', indicator: 'orange' });
			return;
		}

		this.recalculateTotals();
		await this._detectTableField();
		const fieldValues = {
			patient: patientId,
			provider: this.provider_ctrl.get_value() || frappe.session.user,
			plan_type: document.getElementById('dtp-plan-type').value,
			plan_date: this.plan_date_ctrl.get_value(),
			[this.tableField]: procedureRows,
			plan_note: document.getElementById('dtp-plan-note').value,
			total_fee: flt(this._totalFee),
		};

		this._saving = true;
		frappe.dom.freeze(__('Saving...'));

		try {
			// 1. Make sure the child table can store visit / status / invoice
			const missing = await this._missingChildFields();
			if (missing.length) {
				frappe.msgprint({
					title: 'Fields Missing',
					indicator: 'red',
					message: `Add these fields to <b>${this.child_doctype}</b> first, then reload this page:<br><br>`
						+ missing.map(f => `• <code>${f}</code>`).join('<br>'),
				});
				return;
			}

			// 2. Save the plan
			let savedDoc;
			try {
				savedDoc = await this._savePlan(fieldValues);
			} catch (err) {
				this._showError('Save Error', err);
				return;
			}
			this._applyDoc(savedDoc);
			frappe.show_alert({ message: `Saved: ${savedDoc.name}`, indicator: 'green' });

			// 3. Invoice any new Completed rows
			try {
				await this._invoiceCompletedRows(savedDoc);
			} catch (err) {
				this._showError('Invoice Not Created', err,
					'The plan was saved. The completed rows will be invoiced the next time you save.');
			}
		} finally {
			frappe.dom.unfreeze();
			this._saving = false;
		}
	}

	async _savePlan(fieldValues) {
		let r;
		if (this.docname) {
			// UPDATE — round-trip the full existing doc so no other fields are lost
			const existing = await frappe.db.get_doc(this.frm_doctype, this.docname);
			Object.assign(existing, fieldValues);
			r = await frappe.call({ method: 'frappe.client.save', args: { doc: existing } });
		} else {
			// INSERT
			r = await frappe.call({
				method: 'frappe.client.insert',
				args: { doc: Object.assign({ doctype: this.frm_doctype }, fieldValues) },
			});
		}
		if (!r || !r.message) throw new Error('The server did not return the saved plan.');
		return r.message;
	}

	async _invoiceCompletedRows(doc) {
		const rows = (doc[this.tableField] || [])
			.filter(r => r.status === 'Completed' && !r.sales_invoice && r.procedure);
		if (!rows.length) return;

		// Customer linked to the patient
		const res = await frappe.db.get_value('Patient', doc.patient, 'customer');
		const customer = res && res.message && res.message.customer;
		if (!customer) {
			throw new Error(`Patient ${doc.patient} has no linked Customer. Open the patient, set the Customer field (or use "Create Customer"), then save the plan again.`);
		}

		await this._loadMeta('Sales Invoice');
		const today = frappe.datetime.get_today();

		const si = {
			doctype: 'Sales Invoice',
			customer: customer,
			posting_date: today,
			due_date: today,
			remarks: `Auto-created from Dental Treatment Plan ${doc.name}`,
			items: rows.map(r => {
				let desc = `Tooth ${DentalTreatmentPlanChart.codeFor(r.fdi)} · ${r.visit || ''}`;
				if (r.note) desc += ` · ${r.note}`;
				return {
					item_code: r.procedure,
					qty: 1,
					rate: flt(r.fee) || 0,
					description: desc,
				};
			}),
		};
		if (frappe.meta.has_field('Sales Invoice', 'patient')) si.patient = doc.patient;

		const inv = await frappe.call({ method: 'frappe.client.insert', args: { doc: si } });
		if (!inv || !inv.message) throw new Error('The server did not return the new invoice.');
		const invName = inv.message.name;

		// Stamp the invoice on the rows so they are never billed twice
		rows.forEach(r => { r.sales_invoice = invName; });
		const r2 = await frappe.call({ method: 'frappe.client.save', args: { doc: doc } });
		if (r2 && r2.message) this._applyDoc(r2.message);

		frappe.msgprint({
			title: 'Invoice Created',
			indicator: 'green',
			message: `Sales Invoice <a href="/app/sales-invoice/${encodeURIComponent(invName)}">${invName}</a> was created as a draft for ${rows.length} completed procedure(s).`,
		});
	}

	async _missingChildFields() {
		await this._loadMeta(this.child_doctype);
		// "fdi" (or at least "name1") is needed so rows can be put back on the right tooth
		const missing = ['fdi', 'visit', 'status', 'sales_invoice']
			.filter(f => !frappe.meta.has_field(this.child_doctype, f));
		if (missing.includes('fdi') && frappe.meta.has_field(this.child_doctype, 'name1')) {
			return missing.filter(f => f !== 'fdi');
		}
		return missing;
	}

	_loadMeta(doctype) {
		return new Promise(resolve => frappe.model.with_doctype(doctype, () => resolve()));
	}

	_showError(title, err, extra = '') {
		console.error(`[DentalTreatmentPlan] ${title}:`, err);
		// Server exceptions are already shown by Frappe's own dialog; only show
		// our own message for plain JavaScript errors.
		if (err instanceof Error) {
			frappe.msgprint({
				title: title,
				indicator: 'red',
				message: frappe.utils.escape_html(err.message) + (extra ? `<br><br>${extra}` : ''),
			});
		} else if (extra) {
			frappe.show_alert({ message: extra, indicator: 'orange' }, 8);
		}
	}

	/* ── NEW / LOAD HISTORY ────────────────────────────────────────────── */
	reset() {
		this.docname = null;
		this.selFDI = null;
		this.selItem = null;
		this.selectedRowIds = new Set();
		this._resetAllTeeth();
		this.patient_ctrl.set_value('');
		this.provider_ctrl.set_value(frappe.session.user);
		document.getElementById('dtp-plan-type').value = 'Active';
		this.plan_date_ctrl.set_value(frappe.datetime.get_today());
		document.getElementById('dtp-plan-note').value = '';
		this._setDocTitle(null);
		this._renderSelectedItem();
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
					`<div class="dtp-hist-item" data-name="${dtpEsc(p.name)}" style="display:flex;align-items:center;gap:12px;padding:8px 10px;border:1px solid #e2e6ea;border-radius:6px;margin-bottom:5px;cursor:pointer;font-size:12px;">
                        <span style="font-family:'DM Mono',monospace;font-weight:600">${dtpEsc(p.name)}</span>
                        <span>${dtpEsc(p.patient || '')}</span>
                        <span style="color:#6b7a8d">${frappe.datetime.str_to_user(p.plan_date)}</span>
                        <span style="color:#9aa3af;font-size:11px">${dtpEsc(p.plan_type || '')}</span>
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

	async _loadPlanByName(name) {
		await this._detectTableField();
		frappe.call({
			method: 'frappe.client.get',
			args: { doctype: this.frm_doctype, name: name },
			callback: (r) => {
				if (!r.message) return;
				if (this._applyDoc(r.message)) {
					frappe.show_alert({ message: `Loaded ${r.message.name}`, indicator: 'green' });
				}
			},
		});
	}

	// Puts a saved Dental Treatment Plan doc on screen. Returns true on success.
	_applyDoc(doc) {
		try {
			this._resetAllTeeth();
			this.selectedRowIds = new Set();
			this.selItem = null;

			this.docname = doc.name;
			this.patient_ctrl.set_value(doc.patient || '');
			// Show the user who created the plan
			this.provider_ctrl.set_value(doc.owner || doc.provider || '');
			document.getElementById('dtp-plan-type').value = doc.plan_type || 'Active';
			this.plan_date_ctrl.set_value(doc.plan_date || '');
			document.getElementById('dtp-plan-note').value = doc.plan_note || '';

			const childRows = doc[this.tableField] || [];
			const unmatched = [];
			childRows.forEach(row => {
				const fdi = DentalTreatmentPlanChart.fdiForRow(row);
				const state = fdi && (this.teethSets.permanent[fdi] || this.teethSets.primary[fdi]);
				if (state) state.loadFromDocRow(row, this.itemCatalog);
				else unmatched.push(row);
			});
			if (unmatched.length) {
				console.warn('[DentalTreatmentPlan] Rows with no matching tooth:', unmatched);
				frappe.show_alert({
					message: `${unmatched.length} procedure row(s) could not be matched to a tooth — check the "fdi" field on ${this.child_doctype}.`,
					indicator: 'orange',
				}, 10);
			}

			this._setDocTitle(doc.name);
			this._renderSelectedItem();
			this.render();
			return true;
		} catch (err) {
			console.error('[DentalTreatmentPlan] _applyDoc failed partway through:', err);
			frappe.msgprint({ title: 'Load Error', message: String(err), indicator: 'red' });
			return false;
		}
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