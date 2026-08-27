/**
 * perio_exam.js  —  ERPNext 15 · Dental Chart Page
 * (Single-exam entry tool — modeled on "Appendix D. Dental sheet")
 *
 * ── HOW TO USE ────────────────────────────────────────────────────────────
 * 1. Desk → Search "Page" → New Page (or reuse an existing one)
 *      Page Name : perio_exam
 *      Title     : Periodontal Examination
 * 2. Click the "Script" tab
 * 3. SELECT ALL existing code and DELETE it
 * 4. PASTE the entire contents of this file
 * 5. Click Save
 * 6. Navigate to /app/perio-exam            → blank new exam
 *    or /app/perio-exam?patient=PT-00001    → new exam pre-loaded for a patient
 *    or /app/perio-exam?name=DPE-00007      → open an existing exam for editing
 *
 * ── DocType required: "Dental Perio Exam" ───────────────────────────────
 *   Parent fields:
 *     patient (Link: Patient), exam_date (Date), assessed_by (Data),
 *     total_teeth_present (Int), total_teeth_lost (Int),
 *     periodontitis (Select: Present\nAbsent),
 *     severity (Select: \nMild\nModerate\nSevere),
 *     other_findings (Small Text), recommendation (Small Text),
 *     missing_teeth (Data — comma separated tooth numbers)
 *   Child table "perio_measurements" (doctype "Dental Perio Exam Measurement"):
 *     tooth_number (Int), surface (Select: Buccal\nPalatal\nLingual),
 *     recession (Int), pocket_depth (Int), mobility (Int)
 *
 * ── Tooth numbering ──────────────────────────────────────────────────────
 *   Universal Numbering System (1–32), read left→right exactly as the
 *   paper sheet is laid out (R side of chart first, L side last):
 *     Upper arch : 1  (upper right 3rd molar)  → 16 (upper left 3rd molar)
 *     Lower arch : 32 (lower right 3rd molar)  → 17 (lower left 3rd molar)
 *   The Buccal/Palatal rows share the upper-arch columns; the
 *   Lingual/Buccal rows share the lower-arch columns — exactly as in the
 *   reference sheet, where each surface view lines up over the same tooth.
 */

frappe.pages["perio_exam"].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Periodontal Examination",
        single_column: true,
    });

    // ── Inject CSS
    //─────────────────────────────────────────────────────────
    frappe.dom.set_style(`
.pe-root {
padding: 16px;
font-family: -apple-system, "Segoe UI", Arial, sans-serif;
font-size: 13px;
color: #222;
max-width: 1180px;
}
.pe-card {
background: #fff;
border: 1px solid #d0dce8;
border-radius: 6px;
padding: 16px 18px;
margin-bottom: 16px;
}
.pe-title {
font-size: 15px;
font-weight: 700;
color: #1B4F8A;
margin-bottom: 2px;
}
.pe-subtitle {
font-size: 11px;
color: #888;
margin-bottom: 14px;
}
/* Header grid */
.pe-header-grid {
display: grid;
grid-template-columns: repeat(4, 1fr);
gap: 12px 16px;
}
.pe-field {
display: flex;
flex-direction: column;
gap: 4px;
}
.pe-field.pe-span2 { grid-column: span 2; }
.pe-field.pe-span4 { grid-column: span 4; }
.pe-label {
font-size: 10.5px;
font-weight: 600;
color: #555;
text-transform: uppercase;
letter-spacing: 0.4px;
}
.pe-input, .pe-select, .pe-textarea {
border: 1px solid #d1d8dd;
border-radius: 4px;
font-size: 13px;
padding: 6px 8px;
background: #fff;
color: #222;
}
.pe-input:disabled, .pe-input[readonly] { background: #f4f6f8; color: #667; }
.pe-textarea { resize: vertical; min-height: 42px; font-family: inherit; }
.pe-radio-row { display: flex; gap: 16px; align-items: center; height: 30px; }
.pe-radio-row label { display: flex; align-items: center; gap: 5px; font-size: 12.5px; cursor: pointer; }
.pe-patient-input, .pe-exam-picker { min-height: 30px; }
/* Section (one surface row) */
.pe-section {
margin-bottom: 4px;
}
.pe-section-head {
display: flex;
align-items: baseline;
gap: 8px;
margin-bottom: 6px;
}
.pe-section-name {
font-size: 12px;
font-weight: 700;
letter-spacing: 0.6px;
text-transform: uppercase;
color: #1B4F8A;
}
.pe-section-rl {
font-size: 10px;
color: #999;
}
.pe-diagram-wrap { overflow-x: auto; margin-bottom: 4px; }
.pe-diagram-wrap svg { display: block; }
.pe-tooth-shape { stroke: #b8c4d0; stroke-width: 1; cursor: pointer; }
.pe-tooth-shape:hover { stroke: #1B4F8A; stroke-width: 1.6; }
.pe-tooth-shape.missing { fill: #e9ecef; stroke: #cbd3db; stroke-dasharray: 2,2; }
.pe-tooth-num { font-size: 8px; font-weight: 700; fill: #555; text-anchor: middle; pointer-events: none; }
.pe-tooth-x { font-size: 12px; font-weight: 700; fill: #b33; text-anchor: middle; pointer-events: none; }
/* Data grid */
.pe-grid-wrap { overflow-x: auto; margin-bottom: 18px; }
.pe-grid {
border-collapse: collapse;
font-size: 11px;
}
.pe-grid th, .pe-grid td {
border: 1px solid #e3e9f0;
padding: 0;
text-align: center;
}
.pe-grid thead th {
background: #eef2f7;
color: #555;
font-size: 9px;
font-weight: 700;
padding: 4px 2px;
}
.pe-grid thead th:first-child { min-width: 84px; text-align: left; padding-left: 6px; }
.pe-grid tbody th {
background: #f5f7fa;
color: #555;
font-size: 10px;
font-weight: 600;
text-align: left;
padding: 4px 6px;
white-space: nowrap;
}
.pe-grid td { width: 30px; }
.pe-cell-input {
width: 28px;
height: 24px;
border: none;
text-align: center;
font-size: 11px;
font-weight: 700;
background: transparent;
color: #222;
}
.pe-cell-input:focus { outline: 2px solid #1B4F8A; outline-offset: -2px; background: #eef4fb; }
.pe-cell-input:disabled { background: #f0f2f5; color: #ccc; }
.pe-cell-input.pd-h { color: #1a7a1a; }
.pe-cell-input.pd-w { color: #b8860b; }
.pe-cell-input.pd-d { color: #cc0000; }
/* Actions */
.pe-actions {
display: flex;
gap: 10px;
justify-content: flex-end;
align-items: center;
margin-top: 4px;
}
.pe-btn {
height: 34px;
padding: 0 22px;
border: none;
border-radius: 4px;
font-size: 13px;
font-weight: 600;
cursor: pointer;
letter-spacing: 0.3px;
}
.pe-btn-primary { background: #1B4F8A; color: #fff; }
.pe-btn-primary:hover { background: #163d6e; }
.pe-btn-primary:disabled { background: #a0adb8; cursor: not-allowed; }
.pe-btn-secondary { background: #eef2f7; color: #444; }
.pe-btn-secondary:hover { background: #e2e8f0; }
.pe-save-msg { font-size: 11.5px; color: #0E7C7B; margin-right: auto; }
.pe-legend {
display: flex; flex-wrap: wrap; gap: 14px;
padding: 2px 2px 0; font-size: 10.5px; color: #666;
}
.pe-legend-item { display: flex; align-items: center; gap: 5px; }
.pe-swatch { display: inline-block; width: 9px; height: 9px; border-radius: 2px; }
`);

    // ── Constants
    //───────────────────────────────────────────────────────────
    const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1); // 1..16
    const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32..17
    function pdBand(v) {
        if (!v || v <= 0) return "";
        if (v <= 3) return "pd-h";
        if (v <= 5) return "pd-w";
        return "pd-d";
    }

    // ── State
    //──────────────────────────────────────────────────────────────
    let selectedPatient = frappe.utils.get_url_arg("patient") || null;
    let existingExamName = frappe.utils.get_url_arg("name") || null;
    let missingTeeth = new Set(); // universal tooth numbers currently marked missing

    // ── Mount HTML template
    //──────────────────────────────────────────────────────
    page.main.html(`
    <div class="pe-root">

<!-- ── Patient / exam picker ─────────────────────────────── -->
<div class="pe-card">
<div class="pe-header-grid">
<div class="pe-field pe-span2">
<label class="pe-label">Patient</label>
<div class="pe-patient-input"></div>
</div>
<div class="pe-field pe-span2">
<label class="pe-label">Load Existing Exam</label>
<select id="pe-exam-picker" class="pe-select pe-exam-picker">
<option value="">— New exam —</option>
</select>
</div>
</div>
</div>

<!-- ── Appendix D style header ──────────────────────────────── -->
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
<input id="pe-assessed-by" type="text" class="pe-input" placeholder="Practitioner name" />
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

<!-- ── Charting card ─────────────────────────────────────────── -->
<div class="pe-card">

<div class="pe-section" id="pe-section-buccal-upper">
<div class="pe-section-head">
<span class="pe-section-name">Buccal</span>
<span class="pe-section-rl">(upper arch — click a tooth to mark it missing)</span>
</div>
<div id="pe-diagram-upper" class="pe-diagram-wrap"></div>
<div class="pe-grid-wrap">
<table class="pe-grid" id="pe-grid-buccal-upper"></table>
</div>
</div>

<div class="pe-section" id="pe-section-palatal">
<div class="pe-section-head">
<span class="pe-section-name">Palatal</span>
<span class="pe-section-rl">(upper arch)</span>
</div>
<div class="pe-grid-wrap">
<table class="pe-grid" id="pe-grid-palatal"></table>
</div>
</div>

<div class="pe-section" id="pe-section-lingual">
<div class="pe-section-head">
<span class="pe-section-name">Lingual</span>
<span class="pe-section-rl">(lower arch — click a tooth to mark it missing)</span>
</div>
<div id="pe-diagram-lower" class="pe-diagram-wrap"></div>
<div class="pe-grid-wrap">
<table class="pe-grid" id="pe-grid-lingual"></table>
</div>
</div>

<div class="pe-section" id="pe-section-buccal-lower">
<div class="pe-section-head">
<span class="pe-section-name">Buccal</span>
<span class="pe-section-rl">(lower arch)</span>
</div>
<div class="pe-grid-wrap">
<table class="pe-grid" id="pe-grid-buccal-lower"></table>
</div>
</div>

<div class="pe-legend">
<div class="pe-legend-item"><span class="pe-swatch" style="background:#1a7a1a;"></span>PD 1–3mm — Healthy</div>
<div class="pe-legend-item"><span class="pe-swatch" style="background:#b8860b;"></span>PD 4–5mm — Monitor</div>
<div class="pe-legend-item"><span class="pe-swatch" style="background:#cc0000;"></span>PD ≥ 6mm — Disease</div>
<div class="pe-legend-item"><span class="pe-swatch" style="background:#e9ecef;border:1px dashed #cbd3db;"></span>Missing tooth</div>
</div>

</div>

<!-- ── Save bar ──────────────────────────────────────────────── -->
<div class="pe-actions">
<span id="pe-save-msg" class="pe-save-msg"></span>
<button id="pe-clear-btn" class="pe-btn pe-btn-secondary">Clear Form</button>
<button id="pe-save-btn" class="pe-btn pe-btn-primary">Save Exam</button>
</div>

</div>
`);

    // ── Default exam date = today
    //────────────────────────────────────────
    $("#pe-exam-date").val(frappe.datetime.get_today());

    // ── Patient Link control
    //───────────────────────────────────────────────
    const patientCtrl = frappe.ui.form.make_control({
        parent: $(".pe-patient-input"),
        df: {
            fieldtype: "Link",
            options: "Patient",
            label: "Patient",
            fieldname: "patient",
            placeholder: "Search patient name or ID...",
        },
        render_input: true,
    });
    if (selectedPatient) patientCtrl.set_value(selectedPatient);
    patientCtrl.$input.on("change", function () {
        const val = patientCtrl.get_value();
        if (val && val !== selectedPatient) {
            selectedPatient = val;
            existingExamName = null;
            fetchExamPicker(selectedPatient);
        }
    });

    // ── Severity row enabled only when Periodontitis = Present ─────────────
    function refreshSeverityState() {
        const present = $('input[name="pe-periodontitis"]:checked').val() === "Present";
        $("#pe-severity-row input").prop("disabled", !present);
        if (!present) $("#pe-severity-row input").prop("checked", false);
    }
    $(document).on("change", 'input[name="pe-periodontitis"]', refreshSeverityState);
    refreshSeverityState();

    // ── Build one grid (Recession / Pocket Depth [/ Mobility]) ──────────────
    function buildGrid(elId, teeth, surface, includeMobility) {
        const rowsDef = [
            { key: "recession", label: "Recession (mm)" },
            { key: "pocket_depth", label: "Pocket Depth (mm)" },
        ];
        if (includeMobility) rowsDef.push({ key: "mobility", label: "Mobility (0–3)" });

        let html = `<thead><tr><th>Tooth #</th>`;
        teeth.forEach((tn) => (html += `<th>${tn}</th>`));
        html += `</tr></thead><tbody>`;
        rowsDef.forEach((r) => {
            html += `<tr><th>${r.label}</th>`;
            teeth.forEach((tn) => {
                const max = r.key === "mobility" ? 3 : 20;
                html += `<td><input type="number" min="0" max="${max}" step="1"
class="pe-cell-input" data-field="${r.key}" data-surface="${surface}" data-tooth="${tn}" /></td>`;
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

    // ── Live PD colour + delegated pocket-depth colouring ──────────────────
    $(document).on("input", '.pe-cell-input[data-field="pocket_depth"]', function () {
        const v = parseInt($(this).val()) || 0;
        $(this).removeClass("pd-h pd-w pd-d");
        const band = pdBand(v);
        if (band) $(this).addClass(band);
    });

    // ── Tooth diagrams (Buccal-upper controls upper missing set,
    //     Buccal-lower controls lower missing set) ──────────────────────────
    function toothCellSVG(tn, x, y, w, h) {
        const isMissing = missingTeeth.has(tn);
        const cls = "pe-tooth-shape" + (isMissing ? " missing" : "");
        let s = `<g class="pe-tooth-click" data-tooth="${tn}" style="cursor:pointer;">`;
        s += `<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${isMissing ? "#e9ecef" : "#fff"
            }"></rect>`;
        s += `<text class="pe-tooth-num" x="${x + w / 2}" y="${y - 3}">${tn}</text>`;
        if (isMissing) {
            s += `<text class="pe-tooth-x" x="${x + w / 2}" y="${y + h / 2 + 4}">✕</text>`;
        }
        s += `</g>`;
        return s;
    }
    function renderArchDiagram(elId, teeth) {
        const toothW = 28,
            toothH = 30,
            gap = 3,
            padX = 8,
            padY = 12;
        const rowW = teeth.length * toothW + (teeth.length - 1) * gap;
        const svgW = rowW + padX * 2;
        const svgH = padY + toothH + 4;
        let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">`;
        let x = padX;
        teeth.forEach((tn) => {
            svg += toothCellSVG(tn, x, padY, toothW, toothH);
            x += toothW + gap;
        });
        svg += `</svg>`;
        $(`#${elId}`).html(svg);
    }
    function renderDiagrams() {
        renderArchDiagram("pe-diagram-upper", UPPER_TEETH);
        renderArchDiagram("pe-diagram-lower", LOWER_TEETH);
        applyMissingStateToGrids();
        refreshTeethCounts();
    }
    $(document).on("click", ".pe-tooth-click", function () {
        const tn = parseInt($(this).data("tooth"));
        if (missingTeeth.has(tn)) missingTeeth.delete(tn);
        else missingTeeth.add(tn);
        renderDiagrams();
    });

    // ── Disable inputs for missing teeth across all grids, update counts ──
    function applyMissingStateToGrids() {
        $(".pe-cell-input").each(function () {
            const tn = parseInt($(this).data("tooth"));
            const disabled = missingTeeth.has(tn);
            $(this).prop("disabled", disabled);
            if (disabled) $(this).val("").removeClass("pd-h pd-w pd-d");
        });
    }
    function refreshTeethCounts() {
        const lost = missingTeeth.size;
        const present = 32 - lost;
        $("#pe-teeth-present").val(present);
        $("#pe-teeth-lost").val(lost);
    }
    renderDiagrams();

    // ── Load existing exams for the patient picker ──────────────────────────
    function fetchExamPicker(patient) {
        $("#pe-exam-picker").html('<option value="">Loading...</option>').prop("disabled", true);
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Dental Perio Exam",
                filters: [["patient", "=", patient]],
                fields: ["name", "exam_date", "assessed_by"],
                order_by: "exam_date desc",
                limit: 50,
            },
            callback: function (r) {
                const exams = r.message || [];
                $("#pe-exam-picker")
                    .empty()
                    .append('<option value="">— New exam —</option>')
                    .prop("disabled", false);
                exams.forEach((e) => {
                    const label = `${frappe.datetime.str_to_user(e.exam_date)}${e.assessed_by ? " · " + e.assessed_by : ""
                        }`;
                    $("#pe-exam-picker").append(`<option value="${e.name}">${label}</option>`);
                });
                if (existingExamName && exams.find((e) => e.name === existingExamName)) {
                    $("#pe-exam-picker").val(existingExamName);
                    loadExam(existingExamName);
                }
            },
            error: function () {
                $("#pe-exam-picker")
                    .empty()
                    .append('<option value="">— New exam —</option>')
                    .prop("disabled", false);
                frappe.msgprint({
                    title: "DocType Not Found",
                    message:
                        "Could not query 'Dental Perio Exam'. Ensure the Custom DocType exists and permissions are set.",
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

    // ── Reset form to a blank new exam (keeps selected patient) ────────────
    function resetFormFields() {
        existingExamName = null;
        missingTeeth = new Set();
        $("#pe-exam-date").val(frappe.datetime.get_today());
        $("#pe-assessed-by").val("");
        $('input[name="pe-periodontitis"][value="Absent"]').prop("checked", true);
        $('input[name="pe-severity"]').prop("checked", false);
        refreshSeverityState();
        $("#pe-other-findings").val("");
        $("#pe-recommendation").val("");
        $(".pe-cell-input").val("").prop("disabled", false).removeClass("pd-h pd-w pd-d");
        renderDiagrams();
        $("#pe-save-msg").text("");
    }
    $("#pe-clear-btn").on("click", function () {
        frappe.confirm(
            "Clear all entered data on this form? This does not delete a saved record.",
            resetFormFields,
        );
    });

    // ── Load an existing exam's data into the form ──────────────────────────
    function loadExam(name) {
        frappe.call({
            method: "frappe.client.get",
            args: { doctype: "Dental Perio Exam", name: name },
            callback: function (r) {
                const doc = r.message;
                if (!doc) return;
                existingExamName = doc.name;
                $("#pe-exam-date").val(doc.exam_date || frappe.datetime.get_today());
                $("#pe-assessed-by").val(doc.assessed_by || "");
                $(`input[name="pe-periodontitis"][value="${doc.periodontitis || "Absent"}"]`).prop(
                    "checked",
                    true,
                );
                refreshSeverityState();
                if (doc.severity) {
                    $(`input[name="pe-severity"][value="${doc.severity}"]`).prop("checked", true);
                }
                $("#pe-other-findings").val(doc.other_findings || "");
                $("#pe-recommendation").val(doc.recommendation || "");

                missingTeeth = new Set(
                    (doc.missing_teeth || "")
                        .split(",")
                        .map((s) => parseInt(s.trim()))
                        .filter((n) => n),
                );

                $(".pe-cell-input").val("").removeClass("pd-h pd-w pd-d");
                (doc.perio_measurements || []).forEach((row) => {
                    ["recession", "pocket_depth", "mobility"].forEach((field) => {
                        if (row[field] === undefined || row[field] === null) return;
                        const $input = $(
                            `.pe-cell-input[data-field="${field}"][data-surface="${row.surface}"][data-tooth="${row.tooth_number}"]`,
                        );
                        if ($input.length) {
                            $input.val(row[field]);
                            if (field === "pocket_depth") {
                                const band = pdBand(parseInt(row[field]));
                                if (band) $input.addClass(band);
                            }
                        }
                    });
                });
                renderDiagrams(); // also re-applies missing-state disabling
                $("#pe-save-msg").text(`Loaded exam ${doc.name}`);
            },
            error: function () {
                frappe.msgprint({
                    title: "Load Error",
                    message: "Could not load the selected exam. Check permissions.",
                    indicator: "red",
                });
            },
        });
    }

    // ── Collect form data into a Dental Perio Exam doc payload ─────────────
    function collectPayload() {
        const measurements = [];

        function collectSurface(surface, teeth, includeMobility) {
            teeth.forEach((tn) => {
                if (missingTeeth.has(tn)) return; // skip missing teeth entirely
                const rec = $(
                    `.pe-cell-input[data-field="recession"][data-surface="${surface}"][data-tooth="${tn}"]`,
                ).val();
                const pd = $(
                    `.pe-cell-input[data-field="pocket_depth"][data-surface="${surface}"][data-tooth="${tn}"]`,
                ).val();
                const mob = includeMobility
                    ? $(
                        `.pe-cell-input[data-field="mobility"][data-surface="${surface}"][data-tooth="${tn}"]`,
                    ).val()
                    : "";
                if (rec === "" && pd === "" && mob === "") return; // nothing entered
                measurements.push({
                    tooth_number: tn,
                    surface: surface,
                    recession: rec === "" ? null : parseInt(rec),
                    pocket_depth: pd === "" ? null : parseInt(pd),
                    mobility: mob === "" ? null : parseInt(mob),
                });
            });
        }
        collectSurface("Buccal", UPPER_TEETH, true);
        collectSurface("Palatal", UPPER_TEETH, false);
        collectSurface("Lingual", LOWER_TEETH, false);
        collectSurface("Buccal", LOWER_TEETH, true);

        const doc = {
            doctype: "Dental Perio Exam",
            patient: selectedPatient,
            exam_date: $("#pe-exam-date").val(),
            assessed_by: $("#pe-assessed-by").val(),
            total_teeth_present: parseInt($("#pe-teeth-present").val()) || 0,
            total_teeth_lost: parseInt($("#pe-teeth-lost").val()) || 0,
            periodontitis: $('input[name="pe-periodontitis"]:checked').val() || "Absent",
            severity: $('input[name="pe-severity"]:checked').val() || "",
            other_findings: $("#pe-other-findings").val(),
            recommendation: $("#pe-recommendation").val(),
            missing_teeth: Array.from(missingTeeth).sort((a, b) => a - b).join(","),
            perio_measurements: measurements,
        };
        if (existingExamName) doc.name = existingExamName;
        return doc;
    }

    // ── Save (insert or update) ──────────────────────────────────────────
    $("#pe-save-btn").on("click", function () {
        if (!selectedPatient) {
            frappe.msgprint({
                title: "No Patient",
                message: "Please select a patient before saving.",
                indicator: "orange",
            });
            return;
        }
        if (!$("#pe-exam-date").val()) {
            frappe.msgprint({
                title: "No Exam Date",
                message: "Please set the exam date.",
                indicator: "orange",
            });
            return;
        }
        const payload = collectPayload();
        $("#pe-save-btn").prop("disabled", true).text("Saving...");
        $("#pe-save-msg").text("");

        const method = existingExamName ? "frappe.client.save" : "frappe.client.insert";
        const args = existingExamName ? { doc: payload } : { doc: payload };

        frappe
            .call({ method, args })
            .then((r) => {
                $("#pe-save-btn").prop("disabled", false).text("Save Exam");
                const doc = r.message;
                if (!doc) {
                    frappe.msgprint({
                        title: "Save Error",
                        message: "The exam could not be saved. Check DocType permissions and fields.",
                        indicator: "red",
                    });
                    return;
                }
                existingExamName = doc.name;
                $("#pe-save-msg").text(`Saved · ${doc.name}`);
                frappe.show_alert({ message: `Perio exam saved (${doc.name})`, indicator: "green" });
                fetchExamPicker(selectedPatient);
            })
            .catch(() => {
                $("#pe-save-btn").prop("disabled", false).text("Save Exam");
                frappe.msgprint({
                    title: "Error",
                    message: "An unexpected error occurred while saving.",
                    indicator: "red",
                });
            });
    });

    // ── Initial load ─────────────────────────────────────────────────────
    if (selectedPatient) fetchExamPicker(selectedPatient);
};