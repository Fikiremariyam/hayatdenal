/**
 * perio_comparison.js  —  ERPNext 15 · Dental Chart Page
 * (Tooth-diagram edition — adds a visual arch chart above each data table)
 *
 * ── HOW TO USE ────────────────────────────────────────────────────────────
 * 1. Desk → Search "Page" → open "perio_comparison"
 * 2. Click the "Script" tab
 * 3. SELECT ALL existing code and DELETE it
 * 4. PASTE the entire contents of this file
 * 5. Click Save
 * 6. Navigate to /app/perio-comparison  (or ?patient=PT-XXXXX)
 *
 * ── DocTypes required ────────────────────────────────────────────────────
 *   "Dental Chart"       — parent, Is Submittable ✓
 *   "Dental Chart Tooth" — child,  Is Child Table ✓
 *   "Dental Perio Exam"  — parent, with child table "perio_measurements"
 *      containing: tooth_number, sequence, pd_1/2/3, bop_1/2/3
 *
 * ── Tooth numbering assumed ──────────────────────────────────────────────
 *   Universal Numbering System (1–32).
 *   Upper arch: 1 (upper-right 3rd molar) → 16 (upper-left 3rd molar)
 *   Lower arch: 17 (lower-left 3rd molar) → 32 (lower-right 3rd molar)
 *   Tooth 1 sits directly above tooth 32, tooth 16 above tooth 17, so the
 *   diagram renders the lower row in reverse (32→17) to stay anatomically
 *   aligned under the upper row.
 *
 * ── Open with patient context ────────────────────────────────────────────
 *   /app/perio-comparison?patient=PT-00001
 *   (add a button to the Patient form via Client Script — see docs)
 */

frappe.pages["perio_comparison"].on_page_load = function (wrapper) {
    const page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Perio Exam Comparison",
        single_column: true,
    });

    // ── Inject CSS
    //─────────────────────────────────────────────────────────
    frappe.dom.set_style(`
.perio-comparison-root {
padding: 16px;
font-family: -apple-system, "Segoe UI", Arial, sans-serif;
font-size: 13px;
color: #222;
}
/* Controls */
.pc-controls {
background: #f4f8fc;
border: 1px solid #d0dce8;
border-radius: 6px;
padding: 12px 16px;
margin-bottom: 16px;
}
.pc-controls-inner {
display: flex;
align-items: flex-end;
gap: 16px;
flex-wrap: wrap;
}
.pc-field {
display: flex;
flex-direction: column;
gap: 4px;
min-width: 200px;
flex: 1;
}
.pc-label {
font-size: 11px;
font-weight: 600;
color: #555;
text-transform: uppercase;
letter-spacing: 0.4px;
}
.pc-select {
height: 32px;
padding: 0 8px;
border: 1px solid #d1d8dd;
border-radius: 4px;
font-size: 13px;
background: #fff;
cursor: pointer;
color: #222;
}
.pc-select:focus {
outline: none;
border-color: #1B4F8A;
box-shadow: 0 0 0 2px rgba(27,79,138,0.12);
}
.pc-btn {
height: 32px;
padding: 0 22px;
background: #1B4F8A;
color: #fff;
border: none;
border-radius: 4px;
font-size: 13px;
font-weight: 600;
cursor: pointer;
letter-spacing: 0.3px;
flex-shrink: 0;
transition: background 0.15s;
}
.pc-btn:hover { background: #163d6e; }
.pc-btn:active { background: #0f2c50; }
.pc-btn:disabled { background: #a0adb8; cursor: not-allowed; }
/* Loading */
.pc-loading {
display: flex;
align-items: center;
justify-content: center;
gap: 12px;
padding: 48px;
color: #888;
font-size: 14px;
}
.pc-spinner {
width: 22px; height: 22px;
border: 3px solid #d0dce8;
border-top-color: #1B4F8A;
border-radius: 50%;
animation: pc-spin 0.7s linear infinite;
}
@keyframes pc-spin { to { transform: rotate(360deg); } }
/* Empty state */
.pc-empty { text-align: center; padding: 64px 24px; }
.pc-empty-icon { font-size: 44px; margin-bottom: 14px; }
.pc-empty p { font-size: 14px; color: #888; line-height: 1.6; }
/* Split layout */
.pc-split {
display: flex;
align-items: stretch;
border: 1px solid #d0dce8;
border-radius: 6px;
overflow: hidden;
margin-bottom: 10px;
}
.pc-pane { flex: 1; min-width: 0; overflow-x: auto; }
/* Pane headers */
.pc-pane-header {
display: flex;
justify-content: space-between;
align-items: center;
padding: 9px 12px;
font-size: 11px;
font-weight: 700;
text-transform: uppercase;
letter-spacing: 0.6px;
}
.pc-header-left { background: #1B4F8A; color: #fff; }
.pc-header-right { background: #0E7C7B; color: #fff; }
.pc-pane-date { font-weight: 400; opacity: 0.9; }
/* Meta block */
.pc-pane-meta {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 2px;
padding: 8px 10px;
background: #f9fbfd;
border-bottom: 1px solid #e0e8f0;
font-size: 11px;
}
.pc-meta-cell label {
display: block;
font-size: 9px;
color: #999;
text-transform: uppercase;
letter-spacing: 0.4px;
}
.pc-meta-cell span { font-weight: 700; color: #222; }
/* ── Tooth diagram ──────────────────────────────────────────────────── */
.pc-diagram-wrap {
padding: 10px 10px 4px;
background: #fcfdfe;
border-bottom: 1px solid #e0e8f0;
overflow-x: auto;
}
.pc-diagram-wrap svg { display: block; margin: 0 auto; }
.pc-tooth-shape {
stroke: #b8c4d0;
stroke-width: 1;
cursor: default;
transition: opacity 0.1s;
}
.pc-tooth-shape:hover { opacity: 0.75; stroke: #1B4F8A; stroke-width: 1.6; }
.pc-tooth-num {
font-size: 8px;
font-weight: 700;
fill: #555;
text-anchor: middle;
pointer-events: none;
}
.pc-tooth-pd-label {
font-size: 8px;
font-weight: 700;
fill: #fff;
text-anchor: middle;
pointer-events: none;
}
.pc-tooth-bop {
fill: #cc0000;
stroke: #fff;
stroke-width: 0.6;
}
.pc-tooth-missing {
fill: #f0f2f5;
stroke: #d5dce4;
stroke-dasharray: 2,2;
}
/* Perio tables */
.pc-pane-table { padding: 0 8px 10px; }
.pc-tbl {
width: 100%;
border-collapse: collapse;
font-size: 11px;
table-layout: fixed;
}
.pc-tbl thead th {
background: #eef2f7;
color: #555;
font-size: 9px;
font-weight: 700;
text-align: center;
padding: 5px 2px;
border: 1px solid #dde5ef;
position: sticky;
top: 0;
z-index: 1;
}
.pc-tbl thead th:first-child {
text-align: left;
padding-left: 6px;
width: 80px;
}
.pc-tbl tbody td {
text-align: center;
padding: 3px 2px;
border: 1px solid #eef2f7;
font-weight: 700;
}
.pc-tbl tbody td:first-child {
text-align: left;
padding-left: 6px;
background: #f5f7fa;
color: #555;
font-size: 10px;
font-weight: 600;
}
.pc-tbl tbody tr:nth-child(even) td { background: #fafcff; }
.pc-tbl tbody tr:nth-child(even) td:first-child { background: #f0f3f8; }
/* PD colour classes — consistent with print format */
.pd-h { color: #1a7a1a; }
.pd-w { color: #FFBF00; }
.pd-d { color: #cc0000; }
.pd-e { color: #ccc; }
/* BOP dot */
.bop-dot {
display: inline-block;
width: 5px; height: 5px;
border-radius: 50%;
background: #cc0000;
vertical-align: middle;
margin-left: 2px;
}
/* Legend */
.pc-legend {
display: flex;
flex-wrap: wrap;
gap: 14px;
padding: 8px 4px 4px;
font-size: 11px;
color: #555;
}
.pc-legend-item { display: flex; align-items: center; gap: 5px; }
.pc-swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; }
`);

    // ── PD colour scale (shared by table cells + tooth diagram) ────────────
    const PD_COLORS = { h: "#1a7a1a", w: "#FFBF00", d: "#cc0000", e: "#dbe0e6" };
    function pdBand(v) {
        if (!v || v <= 0) return "e";
        if (v <= 3) return "h";
        if (v <= 5) return "w";
        return "d";
    }

    // ── Mount HTML template
    //──────────────────────────────────────────────────────
    page.main.html(`
    <div class="perio-comparison-root">
<!-- ── Control bar ──────────────────────────────────────── -->
<div class="pc-controls">
<div class="pc-controls-inner">
<div class="pc-field">
<label class="pc-label">Patient</label>
<div class="pc-patient-input"></div>
</div>
<div class="pc-field">
<label class="pc-label" for="pc-exam-left">Baseline Exam</label>
<select id="pc-exam-left" class="pc-select">
<option value="">— Select exam —</option>
</select>
</div>
<div class="pc-field">
<label class="pc-label" for="pc-exam-right">Current Exam</label>
<select id="pc-exam-right" class="pc-select">
<option value="">— Select exam —</option>
</select>
</div>
<button id="pc-compare-btn" class="pc-btn">Compare Exams</button>
</div>
</div>
<!-- ── Empty state ──────────────────────────────────────── -->
<div id="pc-empty" class="pc-empty">
<div class="pc-empty-icon">🦷</div>
<p>
Select a patient and two exam dates above, then click
<strong>Compare Exams</strong>.
</p>
</div>
<!-- ── Loading state ────────────────────────────────────── -->
<div id="pc-loading" class="pc-loading" style="display:none;">
<div class="pc-spinner"></div>
<span>Loading examination data...</span>
</div>
<!-- ── Split-screen layout ──────────────────────────────── -->
<div id="pc-split" class="pc-split" style="display:none;">
<!-- LEFT — Baseline -->
<div class="pc-pane">
<div class="pc-pane-header pc-header-left">
<span class="pc-pane-label">Baseline</span>
<span id="pc-date-left" class="pc-pane-date"></span>
</div>
<div id="pc-meta-left" class="pc-pane-meta"></div>
<div id="pc-diagram-left" class="pc-diagram-wrap"></div>
<div id="pc-table-left" class="pc-pane-table"></div>
</div>
<!-- CENTRE — Delta -->
<div class="pc-divider">
<div class="pc-divider-label">Δ</div>
<div id="pc-delta-col" class="pc-delta-col"></div>
</div>
<!-- RIGHT — Current -->
<div class="pc-pane">
<div class="pc-pane-header pc-header-right">
<span class="pc-pane-label">Current</span>
<span id="pc-date-right" class="pc-pane-date"></span>
</div>
<div id="pc-meta-right" class="pc-pane-meta"></div>
<div id="pc-diagram-right" class="pc-diagram-wrap"></div>
<div id="pc-table-right" class="pc-pane-table"></div>
</div>
</div>
<!-- ── Legend ───────────────────────────────────────────── -->
<div id="pc-legend" class="pc-legend" style="display:none;">
<div class="pc-legend-item">
<span class="pc-swatch" style="background:#1a7a1a;"></span>PD 1–3mm — Healthy
</div>
<div class="pc-legend-item">
<span class="pc-swatch" style="background:#FFBF00;"></span>PD 4–5mm — Monitor
</div>
<div class="pc-legend-item">
<span class="pc-swatch" style="background:#cc0000;"></span>PD ≥ 6mm — Disease
</div>
<div class="pc-legend-item">
<span style="display:inline-block;width:8px;height:8px;border-radius:50%;
background:#cc0000;margin-right:4px;"></span>Bleeding on Probing
</div>
<div class="pc-legend-item">
<span class="pc-swatch" style="background:#0E7C7B;"></span>Δ Improved (↓ max PD)
</div>
<div class="pc-legend-item">
<span class="pc-swatch" style="background:#cc0000;"></span>Δ Worsened (↑ max PD)
</div>
</div>
</div>
`);

    // ── State
    //──────────────────────────────────────────────────────────────
    let selectedPatient = null;

    // ── Patient Link control
    //───────────────────────────────────────────────
    const patientCtrl = frappe.ui.form.make_control({
        parent: $(".pc-patient-input"),
        df: {
            fieldtype: "Link",
            options: "Patient",
            label: "Patient",
            fieldname: "patient",
            placeholder: "Search patient name or ID...",
        },
        render_input: true,
    });
    patientCtrl.$input.on("change", function () {
        const val = patientCtrl.get_value();
        if (val && val !== selectedPatient) {
            selectedPatient = val;
            fetchExamList(selectedPatient);
        }
    });

    // ── Fetch all Perio Exams for patient ──────────────────────────────────
    function fetchExamList(patient) {
        ["#pc-exam-left", "#pc-exam-right"].forEach((id) => {
            $(id).html('<option value="">Loading...</option>').prop("disabled", true);
        });
        frappe.call({
            method: "frappe.client.get_list",
            args: {
                doctype: "Dental Perio Exam",
                filters: [["patient", "=", patient]],
                fields: [
                    "name",
                    "exam_date",
                    "bop_percentage",
                    "gingival_status",
                    "provider",
                ],
                order_by: "exam_date asc",
                limit: 100,
            },
            callback: function (r) {
                populateDropdowns(r.message || []);
            },
            error: function () {
                frappe.msgprint({
                    title: "DocType Not Found",
                    message:
                        "Could not query 'Perio Exam'. Ensure the Custom DocType exists and permissions are set.",
                    indicator: "red",
                });
            },
        });
    }

    // ── Populate exam dropdowns
    //────────────────────────────────────────────
    function populateDropdowns(exams) {
        ["#pc-exam-left", "#pc-exam-right"].forEach((id) => {
            $(id)
                .empty()
                .append('<option value="">— Select exam —</option>')
                .prop("disabled", false);
        });

        if (!exams.length) {
            frappe.msgprint({
                title: "No Exams Found",
                message: "This patient has no Perio Exam records.",
                indicator: "orange",
            });
            return;
        }
        exams.forEach((e) => {
            const dateStr = frappe.datetime.str_to_user(e.exam_date);
            const bopStr =
                e.bop_percentage != null
                    ? ` | BOP ${e.bop_percentage.toFixed(1)}%`
                    : "";
            const label = `${dateStr}${bopStr}`;
            ["#pc-exam-left", "#pc-exam-right"].forEach((id) => {
                $(id).append(`<option value="${e.name}">${label}</option>`);
            });
        });
        // Default: oldest left, newest right
        if (exams.length >= 2) {
            $("#pc-exam-left").val(exams[0].name);
            $("#pc-exam-right").val(exams[exams.length - 1].name);
        }
    }

    // ── Compare button ─────────────────────────────────────────────────────
    $("#pc-compare-btn").on("click", function () {
        const leftName = $("#pc-exam-left").val();
        const rightName = $("#pc-exam-right").val();
        if (!selectedPatient) {
            frappe.msgprint({
                title: "No Patient",
                message: "Please select a patient first.",
                indicator: "orange",
            });
            return;
        }
        if (!leftName || !rightName) {
            frappe.msgprint({
                title: "Select Both Exams",
                message: "Please select a Baseline and a Current exam.",
                indicator: "orange",
            });
            return;
        }
        if (leftName === rightName) {
            frappe.msgprint({
                title: "Same Exam",
                message: "Please select two different exam dates.",
                indicator: "orange",
            });
            return;
        }
        runComparison(leftName, rightName);
    });

    // ── Fetch and render both docs ──────────────────────────────────────────
    function runComparison(leftName, rightName) {
        $("#pc-empty").hide();
        $("#pc-split").hide();
        $("#pc-legend").hide();
        $("#pc-loading").show();
        $("#pc-compare-btn").prop("disabled", true).text("Loading...");
        Promise.all([
            frappe.call({
                method: "frappe.client.get",
                args: { doctype: "Dental Perio Exam", name: leftName },
            }),
            frappe.call({
                method: "frappe.client.get",
                args: { doctype: "Dental Perio Exam", name: rightName },
            }),
        ])
            .then(([lRes, rRes]) => {
                $("#pc-loading").hide();
                $("#pc-compare-btn").prop("disabled", false).text("Compare Exams");
                const leftDoc = lRes.message;
                const rightDoc = rRes.message;
                if (!leftDoc || !rightDoc) {
                    frappe.msgprint({
                        title: "Load Error",
                        message:
                            "Could not load one or both Perio Exam records. Check permissions.",
                        indicator: "red",
                    });
                    return;
                }
                renderPane("left", leftDoc);
                renderPane("right", rightDoc);
                renderDelta(leftDoc, rightDoc);
                $("#pc-split").show();
                $("#pc-legend").show();
            })
            .catch(() => {
                $("#pc-loading").hide();
                $("#pc-compare-btn").prop("disabled", false).text("Compare Exams");
                frappe.msgprint({
                    title: "Error",
                    message: "An unexpected error occurred.",
                    indicator: "red",
                });
            });
    }

    // ── Render one pane (diagram + table)
    //───────────────────────────────────
    function renderPane(side, doc) {
        $(`#pc-date-${side}`).text(frappe.datetime.str_to_user(doc.exam_date));
        $(`#pc-meta-${side}`).html(`
<div class="pc-meta-cell">
<label>Practitioner</label>
<span>${doc.provider || "—"}</span>
</div>
<div class="pc-meta-cell">
<label>BOP %</label>
<span>${doc.bop_percentage != null ? doc.bop_percentage.toFixed(1) + "%" : "—"
            }</span>
</div>
<div class="pc-meta-cell">
<label>Gingival Status</label>
<span>${doc.gingival_status || "—"}</span>
</div>
`);

        const rows = (doc.perio_measurements || [])
            .slice()
            .sort(
                (a, b) =>
                    (parseInt(a.tooth_number) || 0) - (parseInt(b.tooth_number) || 0),
            );

        // ── Tooth diagram ────────────────────────────────────────────────
        $(`#pc-diagram-${side}`).html(buildToothDiagramSVG(rows));

        // ── Data table ───────────────────────────────────────────────────
        let html = `
<table class="pc-tbl">
<thead>
<tr>
<th>Tooth</th>
<th>MB/ML</th>
<th>B/L</th>
<th>DB/DL</th>
</tr>
</thead>
<tbody>
`;
        rows.forEach((row) => {
            const seq = row.sequence || "Facial";
            const tooth_label = `${row.tooth_number}${seq ? ` <small style="color:#aaa">${seq[0]}</small>` : ""
                }`;
            html += `
<tr>
<td>${tooth_label}</td>
${pdCell(row.pd_1, row.bop_1)}
${pdCell(row.pd_2, row.bop_2)}
${pdCell(row.pd_3, row.bop_3)}
</tr>
`;
        });
        if (!rows.length) {
            html += `<tr><td colspan="4" style="text-align:center;color:#aaa;padding:18px;">
No measurements recorded.</td></tr>`;
        }
        html += `</tbody></table>`;
        $(`#pc-table-${side}`).html(html);
    }

    // ── Build the SVG tooth arch diagram for one exam
    //──────────────────────
    // Lays out Universal-numbered teeth 1–32 in two anatomically aligned
    // rows (upper 1→16 left-to-right, lower 32→17 left-to-right so each
    // tooth sits above/below its numbering partner). Each tooth is filled
    // by its worst (max) probing depth across the three recorded sites,
    // and gets a red dot if any site bled on probing.
    function buildToothDiagramSVG(rows) {
        const byTooth = {};
        rows.forEach((row) => {
            const tn = parseInt(row.tooth_number);
            if (!tn || tn < 1 || tn > 32) return;
            const sites = [row.pd_1, row.pd_2, row.pd_3].map((v) => parseInt(v) || 0);
            const valid = sites.filter((v) => v > 0);
            const max = valid.length ? Math.max(...valid) : 0;
            const bop = !!(row.bop_1 || row.bop_2 || row.bop_3);
            // If a tooth has multiple rows (e.g. facial + lingual sequence),
            // keep whichever is worse so the diagram shows the worst finding.
            if (!byTooth[tn] || max > byTooth[tn].max) {
                byTooth[tn] = { max, bop };
            } else if (bop) {
                byTooth[tn].bop = true;
            }
        });

        const upper = []; // 1..16
        for (let t = 1; t <= 16; t++) upper.push(t);
        const lower = []; // 32..17 (mirrors upper for anatomical alignment)
        for (let t = 32; t >= 17; t--) lower.push(t);

        const toothW = 28,
            toothH = 34,
            gap = 3,
            rowGap = 14,
            padX = 10,
            padY = 8,
            labelH = 11;
        const rowW = upper.length * toothW + (upper.length - 1) * gap;
        const svgW = rowW + padX * 2;
        const svgH = padY * 2 + labelH * 2 + toothH * 2 + rowGap;

        function toothCell(tn, x, y) {
            const data = byTooth[tn];
            const present = !!data;
            const band = present ? pdBand(data.max) : "e";
            const fill = present ? PD_COLORS[band] : "#f0f2f5";
            const textFill = present && band !== "h" ? "#fff" : (present ? "#fff" : "#bbb");
            const cls = present ? "pc-tooth-shape" : "pc-tooth-shape pc-tooth-missing";
            const title = present
                ? `Tooth ${tn} — max PD ${data.max}mm${data.bop ? " · BOP+" : ""}`
                : `Tooth ${tn} — no data`;
            let s = `<g>`;
            s += `<rect class="${cls}" x="${x}" y="${y}" width="${toothW}" height="${toothH}" rx="7" fill="${fill}"><title>${title}</title></rect>`;
            s += `<text class="pc-tooth-num" x="${x + toothW / 2}" y="${y - 3}">${tn}</text>`;
            if (present && data.max > 0) {
                s += `<text class="pc-tooth-pd-label" x="${x + toothW / 2}" y="${y + toothH / 2 + 3
                    }" fill="${textFill}">${data.max}</text>`;
            }
            if (present && data.bop) {
                s += `<circle class="pc-tooth-bop" cx="${x + toothW - 5}" cy="${y + 6}" r="3"><title>Bleeding on probing</title></circle>`;
            }
            s += `</g>`;
            return s;
        }

        let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" xmlns="http://www.w3.org/2000/svg">`;

        // Upper arch
        let x = padX;
        const upperY = padY + labelH;
        upper.forEach((tn) => {
            svg += toothCell(tn, x, upperY);
            x += toothW + gap;
        });

        // Lower arch
        x = padX;
        const lowerY = upperY + toothH + rowGap + labelH;
        lower.forEach((tn) => {
            svg += toothCell(tn, x, lowerY);
            x += toothW + gap;
        });

        // Midline divider between upper/lower arches
        svg += `<line x1="${padX}" y1="${upperY + toothH + rowGap / 2
            }" x2="${svgW - padX}" y2="${upperY + toothH + rowGap / 2
            }" stroke="#e0e8f0" stroke-width="1" stroke-dasharray="3,3" />`;

        svg += `</svg>`;
        return svg;
    }

    // ── Render delta column
    //────────────────────────────────────────────────
    // Uses MAX pocket depth per row — not average.
    function renderDelta(leftDoc, rightDoc) {
        function buildMap(doc) {
            const map = {};
            (doc.perio_measurements || []).forEach((row) => {
                const key = `${row.tooth_number}:${(row.sequence || "Facial")[0]}`;
                const sites = [row.pd_1, row.pd_2, row.pd_3].map(
                    (v) => parseInt(v) || 0,
                );
                const valid = sites.filter((v) => v > 0);
                map[key] = {
                    max: valid.length ? Math.max(...valid) : null,
                    sites: sites,
                };
            });
            return map;
        }
        const leftMap = buildMap(leftDoc);
        const rightMap = buildMap(rightDoc);
        const allKeys = [
            ...new Set([...Object.keys(leftMap), ...Object.keys(rightMap)]),
        ].sort((a, b) => {
            const [tn] = a.split(":");
            const [tn2] = b.split(":");
            return parseInt(tn) - parseInt(tn2);
        });
        // Spacers to align with pane header, meta, diagram, and table header
        let html = "";
        html += `<div class="pc-delta-cell d-neutral"
style="min-height:38px;background:#f5f7f9;border-bottom:1px solid
#e0e8f0;"></div>`;
        html += `<div class="pc-delta-cell d-neutral"
style="min-height:52px;background:#f9fbfd;border-bottom:1px solid
#e0e8f0;"></div>`;
        // Diagram row height must roughly match buildToothDiagramSVG's svgH
        html += `<div class="pc-delta-cell d-neutral"
style="min-height:130px;background:#fcfdfe;border-bottom:1px solid
#e0e8f0;"></div>`;
        html += `<div class="pc-delta-cell d-neutral"
style="min-height:26px;background:#eef2f7;font-size:9px;color:#888;
border-bottom:1px solid #dde5ef;">Δ max</div>`;
        allKeys.forEach((key) => {
            const l = leftMap[key];
            const r = rightMap[key];
            if (!l && r) {
                html += `<div class="pc-delta-cell d-new" title="New tooth in current
exam">NEW</div>`;
                return;
            }
            if (l && !r) {
                html += `<div class="pc-delta-cell d-gone" title="Not recorded in current
exam">N/R</div>`;
                return;
            }
            if (l.max == null || r.max == null) {
                html += `<div class="pc-delta-cell d-neutral">—</div>`;
                return;
            }
            const diff = r.max - l.max;
            // Per-site tooltip for forensic review on hover
            const siteLabels = ["MB/ML", "B/L", "DB/DL"];
            const tooltip = siteLabels
                .map((lbl, i) => {
                    const sL = l.sites[i] || 0;
                    const sR = r.sites[i] || 0;
                    const d = sR - sL;
                    return `${lbl}: ${sL}→${sR} ${d < 0 ? "↓" : d > 0 ? "↑" : "="}`;
                })
                .join(" | ");
            let cls, label;
            if (diff < 0) {
                cls = "d-better";
                label = `↓${Math.abs(diff)}`;
            } else if (diff > 0) {
                cls = "d-worse";
                label = `↑${diff}`;
            } else {
                cls = "d-neutral";
                label = "=";
            }
            html += `<div class="pc-delta-cell ${cls}" title="${tooltip}">${label}</div>`;
        });
        $("#pc-delta-col").html(html);
    }

    // ── Helper: single PD cell
    //─────────────────────────────────────────────
    function pdCell(val, bop) {
        const v = parseInt(val) || 0;
        const cls = v === 0 ? "pd-e" : v <= 3 ? "pd-h" : v <= 5 ? "pd-w" : "pd-d";
        const dot = bop ? `<span class="bop-dot"></span>` : "";
        return `<td class="${cls}" title="${v ? v + "mm" : "no reading"}">${v || "—"}${dot}</td>`;
    }
};