frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Daily Appointment Schedule',
        single_column: true
    });

    // ── State ──────────────────────────────────────────────────
    var view_mode = 'week'; // 'day' | 'week'
    var from_date = frappe.datetime.get_today();
    var to_date   = frappe.datetime.add_days(from_date, 6); // matches default "week" view

    // Selected practitioners (multi-select). Each: { id, name }
    var selected = [];

    // One colour per selected practitioner, so their appointments are told apart.
    var PALETTE = [
        { bg: '#B5D4F4', fg: '#0C447C', bd: '#185FA5' }, // blue
        { bg: '#F9D3B4', fg: '#7A3E0C', bd: '#D9772B' }, // orange
        { bg: '#C8E6C9', fg: '#1B5E20', bd: '#43A047' }, // green
        { bg: '#E1BEE7', fg: '#4A148C', bd: '#8E24AA' }, // purple
        { bg: '#FFF3B0', fg: '#665200', bd: '#D4AC0D' }, // yellow
        { bg: '#F8BBD0', fg: '#880E4F', bd: '#D81B60' }, // pink
        { bg: '#B2EBF2', fg: '#006064', bd: '#00ACC1' }, // cyan
        { bg: '#CFD8DC', fg: '#263238', bd: '#607D8B' }, // grey
        { bg: '#DCEDC8', fg: '#33691E', bd: '#7CB342' }, // lime
        { bg: '#FFCDD2', fg: '#B71C1C', bd: '#E53935' }  // red
    ];
    var color_idx_by_prac = {};

    // Duty Assignment data per practitioner, filled by fetch_practitioner_duty():
    //   duty_cache[practitioner] = null  -> lookup failed -> fail CLOSED
    //   duty_cache[practitioner] = {}    -> no Duty Assignment rows at all -> fail CLOSED
    //   duty_cache[practitioner] = { "YYYY-MM-DD": { branch, day_name }, ... }
    //       An empty `branch` means Clinical Management explicitly marked the
    //       practitioner not available that date (row exists, but not bookable).
    var duty_cache = {};

    // Used to ignore stale responses when the user changes filters mid-load.
    var active_load_key = '';

    // The appointments the calendar is currently drawing. The slot picker also
    // treats these as booked, so it can never offer a time that is visibly taken.
    var loaded_appts = [];

    // ── Styles ─────────────────────────────────────────────────
    if (!document.getElementById('cal-sched-styles')) {
        var style = document.createElement('style');
        style.id = 'cal-sched-styles';
        style.textContent = `
            .cal-page { background: var(--bg-color); padding: 0; }
            .cal-filter-bar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
            .cal-filter-group { display: flex; align-items: center; gap: 6px; }
            .cal-filter-lbl { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
            .cal-filter-input { font-size: 12px; padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-color); }
            .cal-filter-sep { width: 1px; height: 24px; background: var(--border-color); margin: 0 4px; }
            .cal-filter-link-wrap { min-width: 220px; }
            .cal-filter-link-wrap .form-group { margin: 0 !important; }
            .cal-filter-link-wrap .control-label { display: none !important; }
            .cal-filter-link-wrap .form-control { font-size: 12px !important; padding: 5px 8px !important; border: 1px solid var(--border-color) !important; border-radius: 6px !important; height: 30px !important; }
            .cal-filter-required-lbl { font-size: 11px; color: #854F0B; }
            .cal-chips { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
            .cal-chip { display: inline-flex; align-items: center; gap: 6px; padding: 3px 6px 3px 8px; border-radius: 999px; border: 1px solid; font-size: 12px; font-weight: 500; }
            .cal-chip-dot { width: 8px; height: 8px; border-radius: 50%; }
            .cal-chip-x { cursor: pointer; font-size: 15px; line-height: 1; opacity: .7; padding: 0 2px; }
            .cal-chip-x:hover { opacity: 1; }
            .cal-notice { padding: 8px 16px; font-size: 12px; background: #FFF8E1; color: #7A5B00; border-bottom: 1px solid var(--border-color); }
            .cal-stat-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; padding: 12px 16px; background: var(--subtle-bg); border-bottom: 1px solid var(--border-color); }
            .cal-stat { background: var(--card-bg); border-radius: 8px; padding: 10px 14px; border: 1px solid var(--border-color); }
            .cal-stat-num { font-size: 24px; font-weight: 600; }
            .cal-stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
            .cal-stat.s-total .cal-stat-num { color: #185FA5; }
            .cal-stat.s-open  .cal-stat-num { color: #854F0B; }
            .cal-stat.s-done  .cal-stat-num { color: #085041; }
            .cal-stat.s-cancel .cal-stat-num { color: #791F1F; }
            .cal-nav-bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); }
            .cal-nav-btn { padding: 5px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-color); cursor: pointer; font-size: 13px; }
            .cal-nav-btn:disabled { opacity: .45; cursor: not-allowed; }
            .cal-range-lbl { flex: 1; text-align: center; font-size: 14px; font-weight: 600; color: var(--text-color); }
            .cal-range-note { font-weight: 400; font-size: 11px; color: var(--text-muted); }
            .cal-view-btns { display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
            .cal-view-btn { padding: 5px 12px; border: none; background: var(--card-bg); color: var(--text-muted); cursor: pointer; font-size: 12px; }
            .cal-view-btn.active { background: var(--subtle-bg); color: var(--text-color); font-weight: 500; }
            .cal-wrap { overflow-x: auto; }
            .cal-grid { min-width: 800px; }
            .cal-head-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-head-cell { padding: 8px 10px; font-size: 12px; font-weight: 500; color: var(--text-muted); text-align: center; border-right: 1px solid var(--border-color); }
            .cal-head-cell:last-child { border-right: none; }
            .cal-head-cell.today { color: #185FA5; font-weight: 600; }
            .cal-head-off { display: block; font-size: 10px; font-weight: 600; color: #8B5E34; }
            .cal-head-dots { display: block; margin-top: 3px; line-height: 1; min-height: 8px; }
            .cal-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin: 0 1px; }
            .cal-allday-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-allday-lbl { padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-right: 1px solid var(--border-color); }
            .cal-allday-cell { padding: 3px 4px; border-right: 1px solid var(--border-color); min-height: 26px; }
            .cal-allday-cell:last-child { border-right: none; }
            .cal-allday-block { border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500; margin-bottom: 2px; }
            .cal-body-row { display: grid; }
            .cal-time-col { background: var(--card-bg); border-right: 1px solid var(--border-color); }
            .cal-time-slot { height: 52px; padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-bottom: 1px solid var(--border-color); }
            /* position:relative makes this the anchor for .cal-appt-layer below */
            .cal-day-col { border-right: 1px solid var(--border-color); background: var(--card-bg); position: relative; }
            .cal-day-col:last-child { border-right: none; }
            .cal-day-col { display: flex; }
            .cal-day-col.today { background: #E6F1FB; }
            /* One lane per selected practitioner inside each day column */
            .cal-lane { flex: 1 1 0; min-width: 0; position: relative; border-right: 1px dashed var(--border-color); }
            .cal-lane:last-child { border-right: none; }
            /* That practitioner is not working this day */
            .cal-lane.cal-lane-off { background: #F1E4D3; }
            .cal-day-col.today .cal-lane.cal-lane-off { background: #ECD9BE; }
            .cal-day-slot { height: 52px; border-bottom: 1px solid var(--border-color); padding: 2px 4px; cursor: pointer; transition: background .1s; }
            .cal-day-slot:hover { background: var(--subtle-bg); }
            .cal-day-slot.cal-slot-off, .cal-day-slot.cal-slot-off:hover { cursor: not-allowed; background: transparent; }
            .cal-lane-head-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-lane-head-spacer { border-right: 1px solid var(--border-color); }
            .cal-lane-head-group { display: flex; border-right: 1px solid var(--border-color); }
            .cal-lane-head-group:last-child { border-right: none; }
            .cal-lane-head { flex: 1 1 0; min-width: 0; padding: 3px 4px; font-size: 10px; font-weight: 600; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
            .cal-lane-head.off { opacity: .4; }
            .cal-appt-time { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            /* Practitioner checkbox dropdown */
            .cal-prac-dd { position: relative; }
            .cal-prac-panel { position: absolute; top: calc(100% + 4px); left: 0; z-index: 1050; width: 300px; background: var(--card-bg); border: 1px solid var(--border-color); border-radius: 8px; box-shadow: 0 6px 20px rgba(0,0,0,.15); padding: 8px; }
            .cal-prac-search { width: 100%; box-sizing: border-box; margin-bottom: 6px; }
            .cal-prac-list { max-height: 300px; overflow-y: auto; }
            .cal-prac-row { display: flex; align-items: center; gap: 8px; padding: 5px 6px; margin: 0; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: normal; }
            .cal-prac-row:hover { background: var(--subtle-bg); }
            .cal-prac-row input { margin: 0; flex: none; }
            .cal-prac-swatch { width: 10px; height: 10px; border-radius: 50%; border: 1px solid var(--border-color); flex: none; }
            .cal-prac-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-color); }
            .cal-prac-dept { font-size: 10px; color: var(--text-muted); white-space: nowrap; }
            .cal-prac-msg { padding: 14px 6px; text-align: center; font-size: 12px; color: var(--text-muted); }
            .cal-prac-foot { display: flex; justify-content: space-between; align-items: center; padding: 6px 6px 0; margin-top: 6px; border-top: 1px solid var(--border-color); font-size: 11px; color: var(--text-muted); }
            /* Appointments are drawn in an overlay on top of the slot grid so each block
               can be sized to its real duration. The layer itself ignores clicks so empty
               space still falls through to the slot underneath (which opens the booker). */
            .cal-appt-layer { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; }
            .cal-appt { position: absolute; box-sizing: border-box; border-radius: 4px; padding: 2px 6px; font-size: 11px; line-height: 14px; cursor: pointer; overflow: hidden; pointer-events: auto; box-shadow: inset 0 0 0 1px rgba(255,255,255,.55); }
            .cal-appt-time { display: block; font-weight: 600; }
            .cal-appt-name, .cal-appt-meta { display: block; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
            .cal-appt-meta { opacity: .75; }
            .cal-appt.is-short { padding: 1px 6px; white-space: nowrap; }
            .cal-appt.is-short .cal-appt-time, .cal-appt.is-short .cal-appt-name { display: inline; }
            .cal-appt.is-short .cal-appt-name { margin-left: 4px; }
            .cal-appt.clipped-top { border-top: 2px dotted rgba(0,0,0,.3); border-top-left-radius: 0; border-top-right-radius: 0; }
            .cal-appt.clipped-bottom { border-bottom: 2px dotted rgba(0,0,0,.3); border-bottom-left-radius: 0; border-bottom-right-radius: 0; }
            /* Colour now identifies the doctor; status is shown by these instead. */
            .cal-appt.Cancelled { opacity: .55; }
            .cal-appt.Cancelled .cal-appt-name { text-decoration: line-through; }
            .cal-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 13px; }
            .cal-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 9998; display: flex; align-items: center; justify-content: center; }
            .cal-modal { background: var(--card-bg); border-radius: 14px; padding: 28px; width: 440px; max-width: 95vw; z-index: 9999; }
            .cal-modal h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--text-color); }
            .cal-modal-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
            .cal-modal-row .k { color: var(--text-muted); }
            .cal-modal-row .v { font-weight: 500; color: var(--text-color); }
            .cal-modal-desc { padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
            .cal-modal-desc .k { color: var(--text-muted); margin-bottom: 4px; }
            .cal-modal-desc .v { font-weight: 500; color: var(--text-color); white-space: pre-wrap; word-break: break-word; max-height: 160px; overflow-y: auto; }
            .cal-modal-actions { margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end; }
            .btn-cal-primary { background: #1a2340; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
            .btn-cal-ghost { background: var(--subtle-bg); color: var(--text-color); border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
            .cal-avail-box { font-size: 12px; padding: 8px 10px; border-radius: 6px; }
            .cal-avail-ok { background: #E3F5EE; color: #085041; }
            .cal-avail-bad { background: #FBE7E7; color: #791F1F; }
            .cal-avail-checking { color: var(--text-muted); }
            .cal-slot-pick { min-width: 64px; }
            .cal-slot-pick:hover { background: var(--subtle-bg); }
        `;
        document.head.appendChild(style);
    }

    // ── Page skeleton ──────────────────────────────────────────
    $(wrapper).find('.layout-main-section').html(`
        <div class="cal-page">
            <div class="cal-filter-bar">
                <div class="cal-filter-group">
                    <span class="cal-filter-lbl">From</span>
                    <input type="date" class="cal-filter-input" id="filter-from" value="${from_date}">
                </div>
                <div class="cal-filter-group">
                    <span class="cal-filter-lbl">To</span>
                    <input type="date" class="cal-filter-input" id="filter-to" value="${to_date}">
                </div>
                <div class="cal-filter-sep"></div>
                <div class="cal-filter-group">
                    <span class="cal-filter-lbl">Practitioners</span>
                    <div class="cal-prac-dd" id="prac-dd">
                        <button type="button" class="cal-nav-btn" id="prac-dd-btn">Select practitioners &#9662;</button>
                        <div class="cal-prac-panel" id="prac-panel" style="display:none">
                            <input type="text" class="cal-filter-input cal-prac-search" id="prac-search" placeholder="Search practitioners…" autocomplete="off">
                            <div class="cal-prac-list" id="prac-list"></div>
                            <div class="cal-prac-foot">
                                <span id="prac-count">0 selected</span>
                                <a href="#" id="prac-clear-sel">Clear selection</a>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="cal-chips" id="prac-chips"></div>
                <button class="cal-nav-btn" id="btn-apply"
                    style="background:#1a2340;color:#fff;border-color:#1a2340;margin-left:4px">
                    Apply
                </button>
                <button class="cal-nav-btn" id="btn-clear">Clear</button>
            </div>

            <div class="cal-stat-bar" id="cal-stats"></div>

            <div class="cal-nav-bar">
                <button class="cal-nav-btn" id="cal-prev">&#8249;</button>
                <button class="cal-nav-btn" id="cal-next">&#8250;</button>
                <button class="cal-nav-btn" id="cal-today">today</button>
                <span class="cal-range-lbl" id="cal-range-lbl"></span>
                <div class="cal-view-btns">
                    <button class="cal-view-btn" id="view-day">day</button>
                    <button class="cal-view-btn active" id="view-week">week</button>
                </div>
                <button class="cal-nav-btn" id="btn-new-appt"
                    style="margin-left:auto;background:#1a2340;color:#fff;border-color:#1a2340;" disabled>
                    + New Appointment
                </button>
            </div>

            <div class="cal-wrap" id="cal-wrap">
                <div class="cal-empty">Select one or more Healthcare Practitioners above to view their schedules.</div>
            </div>
        </div>
    `);

    // ── Practitioner picker: dropdown with one checkbox per practitioner ──
    var all_practitioners = null;   // [{id, name, department}] once loaded
    var prac_list_error = false;
    var reload_timer = null;

    function selected_ids() { return selected.map(function(p) { return p.id; }); }

    function name_of(id) {
        var p = selected.find(function(x) { return x.id === id; });
        return (p && p.name) || id;
    }

    function color_for(id) {
        var i = color_idx_by_prac[id];
        return PALETTE[(i === undefined ? 0 : i) % PALETTE.length];
    }

    function assign_color(id) {
        var used = {};
        Object.keys(color_idx_by_prac).forEach(function(k) { used[color_idx_by_prac[k]] = true; });
        var i = 0;
        while (used[i] && i < PALETTE.length) i++;
        color_idx_by_prac[id] = i % PALETTE.length;
    }

    function by_name(a, b) { return String(a.name).localeCompare(String(b.name)); }

    // Loads every (non-disabled) Healthcare Practitioner for the checkbox list.
    function load_practitioner_list() {
        all_practitioners = null;
        prac_list_error = false;
        render_prac_list();

        function done(rows) {
            all_practitioners = (rows || [])
                .filter(function(r) { return r.status !== 'Disabled'; })
                .map(function(r) {
                    return { id: r.name, name: r.practitioner_name || r.name, department: r.department || '' };
                })
                .sort(by_name);
            render_prac_list();
        }
        function fail() { prac_list_error = true; render_prac_list(); }

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Healthcare Practitioner',
                fields: ['name', 'practitioner_name', 'department', 'status'],
                limit_page_length: 1000,
                order_by: 'practitioner_name asc'
            },
            silent: true,
            callback: function(r) { done(r.message); },
            error: function() {
                // `status` may not exist on every version — retry without it.
                frappe.call({
                    method: 'frappe.client.get_list',
                    args: {
                        doctype: 'Healthcare Practitioner',
                        fields: ['name', 'practitioner_name', 'department'],
                        limit_page_length: 1000,
                        order_by: 'practitioner_name asc'
                    },
                    callback: function(r) { done(r.message); },
                    error: fail
                });
            }
        });
    }

    function render_prac_list() {
        var box = document.getElementById('prac-list');
        if (!box) return;
        var cnt = document.getElementById('prac-count');
        if (cnt) cnt.textContent = selected.length + ' selected';

        if (prac_list_error) {
            box.innerHTML = '<div class="cal-prac-msg">Couldn\'t load practitioners. <a href="#" id="prac-retry">Retry</a></div>';
            return;
        }
        if (all_practitioners === null) {
            box.innerHTML = '<div class="cal-prac-msg">Loading…</div>';
            return;
        }

        var q = ((document.getElementById('prac-search') || {}).value || '').trim().toLowerCase();
        var rows = all_practitioners.filter(function(p) {
            return !q || (p.name + ' ' + p.id + ' ' + p.department).toLowerCase().indexOf(q) !== -1;
        });
        if (!rows.length) {
            box.innerHTML = '<div class="cal-prac-msg">No practitioners found.</div>';
            return;
        }

        var sel = {};
        selected.forEach(function(p) { sel[p.id] = true; });
        var scroll = box.scrollTop;
        box.innerHTML = rows.map(function(p) {
            var on = !!sel[p.id];
            return '<label class="cal-prac-row">'
                + '<input type="checkbox" class="cal-prac-cb" data-id="' + esc(p.id) + '"' + (on ? ' checked' : '') + '>'
                + '<span class="cal-prac-swatch"' + (on ? ' style="background:' + color_for(p.id).bd + ';border-color:' + color_for(p.id).bd + '"' : '') + '></span>'
                + '<span class="cal-prac-name">' + esc(p.name) + '</span>'
                + (p.department ? '<span class="cal-prac-dept">' + esc(p.department) + '</span>' : '')
                + '</label>';
        }).join('');
        box.scrollTop = scroll;
    }

    // Tick / untick one practitioner. Returns false if the tick was refused (limit).
    function set_practitioner(id, on) {
        var exists = selected.some(function(p) { return p.id === id; });
        if (on && !exists) {
            if (selected.length >= PALETTE.length) {
                frappe.msgprint({
                    message: 'You can compare up to ' + PALETTE.length + ' practitioners at once.',
                    indicator: 'orange'
                });
                return false;
            }
            var rec = (all_practitioners || []).find(function(p) { return p.id === id; });
            selected.push({ id: id, name: rec ? rec.name : id });
            assign_color(id);
            selected.sort(by_name); // lane order = alphabetical
        } else if (!on && exists) {
            selected = selected.filter(function(p) { return p.id !== id; });
            delete color_idx_by_prac[id];
        }
        on_selection_changed();
        return true;
    }

    function clear_selection() {
        selected = [];
        color_idx_by_prac = {};
        on_selection_changed();
    }

    function render_chips() {
        var box = document.getElementById('prac-chips');
        box.innerHTML = selected.map(function(p) {
            var c = color_for(p.id);
            return '<span class="cal-chip" style="background:' + c.bg + ';color:' + c.fg + ';border-color:' + c.bd + '">'
                + '<span class="cal-chip-dot" style="background:' + c.bd + '"></span>'
                + esc(p.name)
                + '<span class="cal-chip-x" data-id="' + esc(p.id) + '" title="Remove">&times;</span>'
                + '</span>';
        }).join('');
    }

    function update_dd_label() {
        var btn = document.getElementById('prac-dd-btn');
        btn.innerHTML = (selected.length ? selected.length + ' selected' : 'Select practitioners') + ' &#9662;';
    }

    function on_selection_changed() {
        render_chips();
        update_dd_label();
        render_prac_list();
        clearTimeout(reload_timer);
        if (!selected.length) {
            show_gate_message();
            return;
        }
        document.getElementById('btn-new-appt').disabled = true; // re-enabled once duty data is known
        // Small delay so ticking several boxes in a row triggers only one reload.
        reload_timer = setTimeout(load_schedule, 300);
    }

    // ── Dropdown open/close + events ──
    var prac_panel = document.getElementById('prac-panel');

    function toggle_prac_panel(open) {
        var show = (open === undefined) ? prac_panel.style.display === 'none' : open;
        prac_panel.style.display = show ? 'block' : 'none';
        if (show) {
            render_prac_list();
            var s = document.getElementById('prac-search');
            if (s) s.focus();
        }
    }

    document.getElementById('prac-dd-btn').addEventListener('click', function(e) {
        e.stopPropagation();
        toggle_prac_panel();
    });
    document.getElementById('prac-search').addEventListener('input', render_prac_list);
    document.getElementById('prac-clear-sel').addEventListener('click', function(e) {
        e.preventDefault();
        clear_selection();
    });
    document.getElementById('prac-list').addEventListener('change', function(e) {
        var cb = e.target.closest('.cal-prac-cb');
        if (!cb) return;
        if (!set_practitioner(cb.getAttribute('data-id'), cb.checked)) cb.checked = false;
    });
    document.getElementById('prac-list').addEventListener('click', function(e) {
        if (e.target.id === 'prac-retry') {
            e.preventDefault();
            load_practitioner_list();
        }
    });
    // Click outside / Esc closes the dropdown.
    document.addEventListener('click', function(e) {
        if (prac_panel.style.display === 'none') return;
        if (!e.target.isConnected) return; // target was re-rendered during the click
        if (e.target.closest('#prac-dd')) return;
        toggle_prac_panel(false);
    });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && prac_panel.style.display !== 'none') toggle_prac_panel(false);
    });

    // Chips: click × to remove a practitioner.
    document.getElementById('prac-chips').addEventListener('click', function(e) {
        var x = e.target.closest('.cal-chip-x');
        if (!x) return;
        set_practitioner(x.getAttribute('data-id'), false);
    });

    // ── Wire date inputs ───────────────────────────────────────
    document.getElementById('filter-from').addEventListener('change', function() {
        from_date = this.value || frappe.datetime.get_today();
        if (view_mode === 'day') {
            to_date = from_date;
            document.getElementById('filter-to').value = to_date;
        }
        load_schedule();
    });
    document.getElementById('filter-to').addEventListener('change', function() {
        to_date = this.value || from_date;
        load_schedule();
    });
    document.getElementById('btn-apply').addEventListener('click', function() {
        from_date = document.getElementById('filter-from').value || from_date;
        to_date   = document.getElementById('filter-to').value   || to_date;
        load_schedule();
    });
    document.getElementById('btn-clear').addEventListener('click', function() {
        from_date = frappe.datetime.get_today();
        to_date   = (view_mode === 'day') ? from_date : frappe.datetime.add_days(from_date, 6);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        clear_selection();
    });

    // ── Day / Week view toggle ───────────────────────────────────
    document.getElementById('view-day').addEventListener('click', function() {
        if (view_mode === 'day') return;
        view_mode = 'day';
        to_date = from_date;
        document.getElementById('filter-to').value = to_date;
        document.getElementById('view-day').classList.add('active');
        document.getElementById('view-week').classList.remove('active');
        load_schedule();
    });
    document.getElementById('view-week').addEventListener('click', function() {
        if (view_mode === 'week') return;
        view_mode = 'week';
        to_date = frappe.datetime.add_days(from_date, 6);
        document.getElementById('filter-to').value = to_date;
        document.getElementById('view-week').classList.add('active');
        document.getElementById('view-day').classList.remove('active');
        load_schedule();
    });

    // ── New Appointment button (no slot context) ────────────────
    document.getElementById('btn-new-appt').addEventListener('click', function() {
        var ids = selected_ids();
        if (!ids.length) {
            frappe.msgprint({ message: 'Please select at least one Healthcare Practitioner first.', indicator: 'orange' });
            return;
        }
        // Prefer a selected practitioner who is actually working on the start date.
        var pick = ids.filter(function(id) { return is_day_working(id, from_date); })[0] || ids[0];
        open_slot_picker(from_date, pick);
    });

    // ── Nav buttons (step size depends on day/week view) ─────────
    document.getElementById('cal-prev').onclick = function() {
        var step = (view_mode === 'day') ? 1 : 7;
        from_date = frappe.datetime.add_days(from_date, -step);
        to_date   = (view_mode === 'day') ? from_date : frappe.datetime.add_days(to_date, -step);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        load_schedule();
    };
    document.getElementById('cal-next').onclick = function() {
        var step = (view_mode === 'day') ? 1 : 7;
        from_date = frappe.datetime.add_days(from_date, step);
        to_date   = (view_mode === 'day') ? from_date : frappe.datetime.add_days(to_date, step);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        load_schedule();
    };
    document.getElementById('cal-today').onclick = function() {
        from_date = frappe.datetime.get_today();
        to_date   = (view_mode === 'day') ? from_date : frappe.datetime.add_days(from_date, 6);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        load_schedule();
    };

    // ── Date / time helpers ────────────────────────────────────
    function get_week_dates(start, end) {
        var dates = [];
        var d = start;
        while (d <= end) { dates.push(d); d = frappe.datetime.add_days(d, 1); }
        return dates;
    }

    function fmt_date_header(d) {
        var parts = d.split('-');
        var dt = new Date(parts[0], parts[1]-1, parts[2]);
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        return days[dt.getDay()] + ' ' + (dt.getMonth()+1) + '/' + dt.getDate();
    }

    function time_str_to_minutes(t) {
        if (!t) return 0;
        var parts = t.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || 0, 10);
    }

    // 24-hour "HH:MM" label.
    function format_time_label(mins) {
        var h24 = Math.floor(mins / 60) % 24;
        var m   = ((mins % 60) + 60) % 60;
        return (h24 < 10 ? '0' + h24 : h24) + ':' + (m < 10 ? '0' + m : m);
    }

    function esc(v) {
        return frappe.utils.escape_html(v === null || v === undefined ? '' : String(v));
    }

    // ── Time-slot grid ───────────────────────────────────────────
    // Duty Assignment only tells us WHICH dates a practitioner is on duty, not
    // what hours they work, so the displayed grid is a fixed 8:00–17:30 ladder
    // and bookability is decided per practitioner per day (see is_day_working).
    var SLOT_MINUTES = 30;
    var TIME_SLOTS = [];
    var TIME_SLOT_MINUTES = [];

    function build_time_slots() {
        var minutes = [];
        for (var mm = 8 * 60; mm < 17 * 60 + 30; mm += SLOT_MINUTES) minutes.push(mm);
        TIME_SLOT_MINUTES = minutes;
        TIME_SLOTS = minutes.map(format_time_label);
    }
    build_time_slots();

    // ── Appointment block geometry ───────────────────────────────
    var SLOT_HEIGHT_PX   = 52;
    var PX_PER_MINUTE    = SLOT_HEIGHT_PX / SLOT_MINUTES;
    var MIN_APPT_PX      = 18;
    var SHORT_APPT_PX    = 32;
    var TALL_APPT_PX     = 48;
    var DEFAULT_DURATION = 15;

    function grid_start_minutes() { return TIME_SLOT_MINUTES[0]; }
    function grid_end_minutes()   { return TIME_SLOT_MINUTES[TIME_SLOT_MINUTES.length - 1] + SLOT_MINUTES; }

    function appt_duration(a) {
        var d = parseInt(a.duration, 10);
        return (d && d > 0) ? d : DEFAULT_DURATION;
    }

    function appt_geometry(a) {
        if (!a.appointment_time) return null;

        var start = time_str_to_minutes(a.appointment_time);
        var end   = start + appt_duration(a);
        var gs    = grid_start_minutes();
        var ge    = grid_end_minutes();
        if (end <= gs || start >= ge) return null;

        var total_px  = (ge - gs) * PX_PER_MINUTE;
        var vis_start = Math.max(start, gs);
        var vis_end   = Math.min(end, ge);
        var top       = (vis_start - gs) * PX_PER_MINUTE;
        var height    = Math.max((vis_end - vis_start) * PX_PER_MINUTE, MIN_APPT_PX);
        if (top + height > total_px) top = Math.max(0, total_px - height);

        return {
            start: start,
            end: end,
            top: top,
            height: height,
            clipped_top: start < gs,
            clipped_bottom: end > ge
        };
    }

    // Side-by-side layout for appointments whose spans overlap (different doctors
    // at the same time, or a double booking), so none is hidden behind another.
    function layout_overlaps(items) {
        items.sort(function(x, y) {
            return (x.geo.start - y.geo.start)
                || (x.geo.end - y.geo.end)
                || String(x.a.practitioner || '').localeCompare(String(y.a.practitioner || ''));
        });

        var cluster = [], col_ends = [], cluster_end = null;

        function close_cluster() {
            var cols = col_ends.length || 1;
            cluster.forEach(function(it) { it.cols = cols; });
            cluster = []; col_ends = []; cluster_end = null;
        }

        items.forEach(function(it) {
            if (cluster_end !== null && it.geo.start >= cluster_end) close_cluster();
            var col = 0;
            while (col < col_ends.length && col_ends[col] > it.geo.start) col++;
            col_ends[col] = it.geo.end;
            it.col = col;
            cluster.push(it);
            cluster_end = (cluster_end === null) ? it.geo.end : Math.max(cluster_end, it.geo.end);
        });
        close_cluster();

        return items;
    }

    function appt_range_label(geo) {
        return format_time_label(geo.start) + ' \u2013 ' + format_time_label(geo.end);
    }

    // ── Duty helpers (all per practitioner) ──────────────────────
    function get_duty_for(practitioner, date) {
        return (duty_cache[practitioner] && duty_cache[practitioner][date]) || null;
    }

    // Is this practitioner scheduled to work on this date? Fails CLOSED: unknown
    // duty data, no row for the date, or an empty Branch => not bookable.
    function is_day_working(practitioner, date) {
        var rec = get_duty_for(practitioner, date);
        return !!(rec && rec.branch);
    }

    // Which of the currently selected practitioners work on this date.
    function working_practitioners(date) {
        return selected_ids().filter(function(id) { return is_day_working(id, date); });
    }

    function is_slot_bookable(practitioner, date, time_str, duration) {
        return is_day_working(practitioner, date);
    }

    // Reads every Duty Assignment for the practitioner -> its
    // "branch_schedule_assignment" child rows (date / day_name / branch) and
    // caches { "YYYY-MM-DD": { branch, day_name } } in duty_cache[practitioner].
    // All dates are kept (not just the visible range) so the booking dialog can
    // still validate if the user picks a date outside the calendar's range.
    function fetch_practitioner_duty(practitioner, callback) {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Duty Assignment',
                fields: ['name'],
                filters: [['healthcare_practitioner', '=', practitioner]],
                limit_page_length: 500
            },
            callback: function(r) {
                var rows = r.message || [];
                var duty_by_date = {};
                if (!rows.length) {
                    duty_cache[practitioner] = duty_by_date;
                    callback(duty_by_date);
                    return;
                }

                var remaining = rows.length;
                function done() {
                    remaining--;
                    if (remaining === 0) {
                        duty_cache[practitioner] = duty_by_date;
                        callback(duty_by_date);
                    }
                }

                rows.forEach(function(row) {
                    frappe.call({
                        method: 'frappe.client.get',
                        args: { doctype: 'Duty Assignment', name: row.name },
                        callback: function(dr) {
                            var doc = dr.message;
                            var children = (doc && doc.branch_schedule_assignment) || [];
                            children.forEach(function(c) {
                                if (!c.date) return;
                                duty_by_date[c.date] = {
                                    branch: c.branch || '',
                                    day_name: c.day_name || ''
                                };
                            });
                            done();
                        },
                        error: function() { done(); }
                    });
                });
            },
            error: function() {
                duty_cache[practitioner] = null; // fail closed
                callback(null);
            }
        });
    }

    function fetch_duty_for_many(ids, callback) {
        var remaining = ids.length;
        if (!remaining) { callback(); return; }
        ids.forEach(function(id) {
            fetch_practitioner_duty(id, function() {
                remaining--;
                if (remaining === 0) callback();
            });
        });
    }

    // ── Real availability from Healthcare's scheduling engine ────
    // Signature confirmed on healthcare 15.1.20:
    //   get_availability_data(date, practitioner, appointment)
    // Returns null on failure (fail closed), [] if fully booked, or
    // [{mins, time_str, duration, service_unit}, …] ascending.
    function fetch_schedule_slots(practitioner, date, callback) {
        frappe.db.get_value('Healthcare Practitioner', practitioner, 'department').then(function(dep_r) {
            var department = (dep_r && dep_r.message && dep_r.message.department) || '';

            var appointment_doc = {
                doctype: 'Patient Appointment',
                practitioner: practitioner,
                department: department,
                appointment_date: date
            };

            var call_args = { date: date, practitioner: practitioner, appointment: JSON.stringify(appointment_doc) };
            console.log('get_availability_data call args', call_args);

            frappe.call({
                method: 'healthcare.healthcare.doctype.patient_appointment.patient_appointment.get_availability_data',
                args: call_args,
                callback: function(r) {
                    console.log('get_availability_data response for', practitioner, date, r.message);
                    var slots = parse_availability_response(r.message);
                    if (!slots.length) { callback(slots); return; }

                    // Healthcare returns ALL of the schedule's slots and leaves it to its
                    // own client to grey out booked ones, so drop here any slot that
                    // overlaps one of this practitioner's existing appointments.
                    fetch_booked_intervals(practitioner, date, function(fresh) {
                        if (fresh === null) { callback(null); return; } // can't verify -> fail closed
                        // Fresh server query + whatever the calendar is drawing right now.
                        var booked = fresh.concat(local_booked_intervals(practitioner, date));
                        var free = slots.filter(function(s) {
                            return !overlaps_any(s.mins, Number(s.duration) || DEFAULT_DURATION, booked);
                        });
                        console.log('slot filter', { practitioner: practitioner, date: date,
                            booked: booked, slots_before: slots.length, slots_after: free.length });
                        callback(free);
                    });
                },
                error: function(r) {
                    console.log('get_availability_data error', r);
                    callback(null);
                }
            });
        });
    }

    // ── Booked-slot helpers ──────────────────────────────────────
    // Turns appointment rows into [{start, end}] minute intervals (cancelled ones ignored).
    function appts_to_intervals(list) {
        return (list || [])
            .filter(function(a) { return a && a.appointment_time && a.status !== 'Cancelled'; })
            .map(function(a) {
                var s = time_str_to_minutes(a.appointment_time);
                return { start: s, end: s + appt_duration(a) };
            });
    }

    function overlaps_any(start, duration, intervals) {
        var end = start + duration;
        return intervals.some(function(b) { return start < b.end && b.start < end; });
    }

    // Booked intervals taken from the appointments already loaded for the calendar.
    function local_booked_intervals(practitioner, date) {
        return appts_to_intervals((loaded_appts || []).filter(function(a) {
            return a.practitioner === practitioner && a.appointment_date === date;
        }));
    }

    // The practitioner's non-cancelled appointments on a date, as intervals.
    // Calls back with null if it couldn't be loaded (caller fails closed).
    function fetch_booked_intervals(practitioner, date, cb) {
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Patient Appointment',
                fields: ['name', 'appointment_time', 'duration', 'status'],
                filters: [
                    ['practitioner', '=', practitioner],
                    ['appointment_date', '=', date],
                    ['status', '!=', 'Cancelled']
                ],
                limit_page_length: 500
            },
            callback: function(r) { cb(appts_to_intervals(r.message)); },
            error: function() { cb(null); }
        });
    }

    function parse_availability_response(msg) {
        if (!msg) return [];
        var groups = Array.isArray(msg) ? msg : (msg.slot_details || msg.slots || []);
        if (!Array.isArray(groups)) return [];

        var out = [];
        groups.forEach(function(g) {
            var service_unit = g.service_unit || g.slot_name || '';
            var group_duration = g.duration || null;
            var avail = g.avail_slot || g.available_slots || g.slots || [];
            if (!Array.isArray(avail)) return;

            // Appointments Healthcare attaches to this schedule/service unit
            // (covers bookings made by other practitioners in the same room).
            var group_booked = appts_to_intervals(g.appointments);

            avail.forEach(function(s) {
                var from = (typeof s === 'string') ? s : (s.from_time || s.time || s.from);
                if (!from) return;
                var to = (typeof s === 'object') ? (s.to_time || s.to) : null;
                var mins = time_str_to_minutes(from);
                var dur = group_duration || (s.duration) || (to ? (time_str_to_minutes(to) - mins) : 15);
                if (overlaps_any(mins, Number(dur) || DEFAULT_DURATION, group_booked)) return; // already booked -> hide
                var time_str = from.length === 5 ? (from + ':00') : from;
                out.push({ mins: mins, time_str: time_str, duration: dur, service_unit: service_unit });
            });
        });

        out.sort(function(a, b) { return a.mins - b.mins; });
        return out;
    }

    // ── Practitioner selection gate ───────────────────────────────
    function show_gate_message() {
        active_load_key = '';
        document.getElementById('cal-wrap').innerHTML =
            '<div class="cal-empty">Select one or more Healthcare Practitioners above to view their schedules.</div>';
        document.getElementById('cal-stats').innerHTML = '';
        document.getElementById('cal-range-lbl').textContent = '';
        document.getElementById('btn-new-appt').disabled = true;
    }

    // ── Load data ──────────────────────────────────────────────
    function load_schedule() {
        var wrap  = document.getElementById('cal-wrap');
        var stats = document.getElementById('cal-stats');
        var lbl   = document.getElementById('cal-range-lbl');

        var ids = selected_ids();
        if (!ids.length) {
            show_gate_message();
            return;
        }

        wrap.innerHTML  = '<div class="cal-empty">Loading…</div>';
        stats.innerHTML = '';

        var f = from_date, t = to_date;
        if (lbl) {
            lbl.textContent = frappe.datetime.str_to_user(f)
                + (f !== t ? ' \u2013 ' + frappe.datetime.str_to_user(t) : '');
        }

        var key = ids.join('|') + '#' + f + '#' + t;
        active_load_key = key;

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Patient Appointment',
                fields: [
                    'name','status','appointment_type','appointment_for',
                    'practitioner','practitioner_name','department',
                    'service_unit','appointment_date','appointment_time',
                    'patient','patient_name','company','duration','custom_appt_description'
                ],
                filters: [
                    ['appointment_date', '>=', f],
                    ['appointment_date', '<=', t],
                    ['practitioner', 'in', ids]
                ],
                limit_page_length: 1000,
                order_by: 'appointment_date asc, appointment_time asc'
            },
            callback: function(r) {
                if (active_load_key !== key) return; // stale
                var appts = r.message || [];
                loaded_appts = appts;
                render_stats(appts, stats);

                fetch_duty_for_many(ids, function() {
                    if (active_load_key !== key) return; // stale

                    var dates = get_week_dates(f, t);
                    var failed = [];     // duty lookup failed
                    var no_duty = [];    // no Duty Assignment row in the visible range

                    ids.forEach(function(id) {
                        var m = duty_cache[id];
                        if (m === null || m === undefined) { failed.push(id); return; }
                        var has = dates.some(function(d) { return !!m[d]; });
                        if (!has) no_duty.push(id);
                    });

                    if (failed.length === ids.length) {
                        wrap.innerHTML =
                            '<div class="cal-empty">Couldn\'t load the duty assignment for the selected practitioners.'
                            + '<br><button class="cal-nav-btn" id="btn-retry-schedule" style="margin-top:10px">Retry</button></div>';
                        document.getElementById('btn-new-appt').disabled = true;
                        var retry_btn = document.getElementById('btn-retry-schedule');
                        if (retry_btn) retry_btn.addEventListener('click', load_schedule);
                        return;
                    }

                    var notice = '';
                    if (no_duty.length) {
                        notice += 'No Duty Assignment for the selected date(s), so not bookable: '
                            + no_duty.map(function(id) { return esc(name_of(id)); }).join(', ') + '. ';
                    }
                    if (failed.length) {
                        notice += 'Couldn\'t load duty assignment for: '
                            + failed.map(function(id) { return esc(name_of(id)); }).join(', ') + '.';
                    }

                    document.getElementById('btn-new-appt').disabled = false;
                    render_calendar(appts, wrap, f, t, notice);
                });
            },
            error: function() {
                if (active_load_key !== key) return;
                wrap.innerHTML = '<div class="cal-empty">Couldn\'t load appointments.'
                    + '<br><button class="cal-nav-btn" id="btn-retry-schedule" style="margin-top:10px">Retry</button></div>';
                var retry_btn = document.getElementById('btn-retry-schedule');
                if (retry_btn) retry_btn.addEventListener('click', load_schedule);
            }
        });
    }

    // ── Stats bar ──────────────────────────────────────────────
    function render_stats(appts, wrap) {
        var total     = appts.length;
        var open      = appts.filter(function(a) { return a.status === 'Open' || a.status === 'Scheduled'; }).length;
        var closed    = appts.filter(function(a) { return a.status === 'Closed'; }).length;
        var cancelled = appts.filter(function(a) { return a.status === 'Cancelled'; }).length;
        wrap.innerHTML =
            '<div class="cal-stat s-total"><div class="cal-stat-num">' + total     + '</div><div class="cal-stat-lbl">Total</div></div>' +
            '<div class="cal-stat s-open"><div class="cal-stat-num">'  + open      + '</div><div class="cal-stat-lbl">Upcoming</div></div>' +
            '<div class="cal-stat s-done"><div class="cal-stat-num">'  + closed    + '</div><div class="cal-stat-lbl">Completed</div></div>' +
            '<div class="cal-stat s-cancel"><div class="cal-stat-num">'+ cancelled + '</div><div class="cal-stat-lbl">Cancelled</div></div>';
    }

    // ── Calendar grid ──────────────────────────────────────────
    // Each day is split into one LANE per selected practitioner (alphabetical).
    // Clicking a slot in a lane books THAT practitioner. A lane is shaded brown
    // on days when that practitioner is not working (per Duty Assignment).
    var LANE_MIN_PX = 90;

    function render_calendar(appts, wrap, f, t, notice) {
        var dates    = get_week_dates(f, t);
        var today    = frappe.datetime.get_today();
        var ids      = selected_ids();
        var lanes    = Math.max(ids.length, 1);
        var grid_tpl = '60px ' + dates.map(function() { return 'minmax(0,1fr)'; }).join(' ');
        var min_w    = 60 + dates.length * Math.max(lanes * LANE_MIN_PX, 110);

        // working[practitioner][date] -> is that doctor on duty that day
        var working = {};
        ids.forEach(function(id) {
            working[id] = {};
            dates.forEach(function(d) { working[id][d] = is_day_working(id, d); });
        });

        // Appointments bucketed per lane ("date|practitioner"); those completely
        // outside the 08:00–17:30 window go in the all-day row.
        var by_lane = {};
        var allday  = {};
        appts.forEach(function(a) {
            var d   = a.appointment_date;
            var geo = appt_geometry(a);
            if (!geo) {
                if (!allday[d]) allday[d] = [];
                allday[d].push(a);
                return;
            }
            var k = d + '|' + a.practitioner;
            if (!by_lane[k]) by_lane[k] = [];
            by_lane[k].push({ a: a, geo: geo });
        });
        // Overlap layout now only matters inside one lane (double bookings).
        Object.keys(by_lane).forEach(function(k) { layout_overlaps(by_lane[k]); });

        var html = '';
        if (notice) html += '<div class="cal-notice">' + notice + '</div>';
        html += '<div class="cal-grid" style="min-width:' + min_w + 'px">';

        // Day header
        html += '<div class="cal-head-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-head-cell"></div>';
        dates.forEach(function(d) {
            var anyone = ids.some(function(id) { return working[id][d]; });
            html += '<div class="cal-head-cell' + (d === today ? ' today' : '') + '">'
                + fmt_date_header(d)
                + (anyone ? '' : '<span class="cal-head-off">not working</span>')
                + '</div>';
        });
        html += '</div>';

        // Doctor sub-header: one coloured label per lane
        html += '<div class="cal-lane-head-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-lane-head-spacer"></div>';
        dates.forEach(function(d) {
            html += '<div class="cal-lane-head-group">';
            ids.forEach(function(id) {
                var c   = color_for(id);
                var off = !working[id][d];
                html += '<div class="cal-lane-head' + (off ? ' off' : '') + '"'
                    + ' style="background:' + c.bg + ';color:' + c.fg + ';border-bottom:2px solid ' + c.bd + '"'
                    + ' title="' + esc(name_of(id) + (off ? ' \u2014 not working' : '')) + '">'
                    + esc(name_of(id)) + '</div>';
            });
            html += '</div>';
        });
        html += '</div>';

        // All-day row (appointments outside the displayed window)
        html += '<div class="cal-allday-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-allday-lbl">all-day</div>';
        dates.forEach(function(d) {
            html += '<div class="cal-allday-cell">';
            if (allday[d]) {
                allday[d].forEach(function(a) {
                    var c = color_for(a.practitioner);
                    var t_lbl = a.appointment_time
                        ? format_time_label(time_str_to_minutes(a.appointment_time)) + ' \u00b7 '
                        : '';
                    var who = a.patient_name || a.patient || '';
                    html += '<div class="cal-allday-block" style="background:' + c.bg + ';color:' + c.fg + ';border-left:3px solid ' + c.bd + '"'
                        + ' title="' + esc(t_lbl + who + ' \u2022 ' + (a.practitioner_name || a.practitioner || '')) + '">'
                        + esc(t_lbl)
                        + esc(a.patient_name || a.patient || '\u2014')
                        + (a.service_unit ? ' \u2022 ' + esc(a.service_unit) : '')
                        + '</div>';
                });
            }
            html += '</div>';
        });
        html += '</div>';

        // Body: time ruler + one column per day, each split into lanes
        html += '<div class="cal-body-row" style="display:grid;grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-time-col">';
        TIME_SLOTS.forEach(function(ts) {
            html += '<div class="cal-time-slot">' + ts + '</div>';
        });
        html += '</div>';

        dates.forEach(function(d) {
            html += '<div class="cal-day-col' + (d === today ? ' today' : '') + '">';

            ids.forEach(function(id) {
                var ok = working[id][d];
                html += '<div class="cal-lane' + (ok ? '' : ' cal-lane-off') + '">';

                TIME_SLOTS.forEach(function(ts, si) {
                    html += '<div class="cal-day-slot' + (ok ? '' : ' cal-slot-off') + '"'
                        + ' data-date="' + d + '" data-prac="' + esc(id) + '" data-slot="' + si + '"></div>';
                });

                html += '<div class="cal-appt-layer">';
                (by_lane[d + '|' + id] || []).forEach(function(it) {
                    var a     = it.a;
                    var geo   = it.geo;
                    var cols  = it.cols || 1;
                    var col   = it.col || 0;
                    var w     = 100 / cols;
                    var who   = a.patient_name || a.patient || '\u2014';
                    var doc   = a.practitioner_name || a.practitioner || '';
                    var range = appt_range_label(geo);
                    var mins  = appt_duration(a);
                    var c     = color_for(a.practitioner);
                    var meta  = a.appointment_type || a.service_unit || '';
                    var status_class = (a.status || 'Open').replace(' ', '');
                    var tick = (a.status === 'Closed') ? ' \u2713' : '';

                    html += '<div class="cal-appt ' + status_class
                        + (geo.height < SHORT_APPT_PX ? ' is-short' : '')
                        + (geo.clipped_top ? ' clipped-top' : '')
                        + (geo.clipped_bottom ? ' clipped-bottom' : '')
                        + '" data-name="' + esc(a.name) + '"'
                        + ' data-top="' + geo.top.toFixed(2) + '" data-height="' + geo.height.toFixed(2) + '"'
                        + ' title="' + esc(who + ' \u2022 ' + doc + ' \u2022 ' + range + ' (' + mins + ' min)'
                            + (a.appointment_type ? ' \u2022 ' + a.appointment_type : '')
                            + (a.status ? ' \u2022 ' + a.status : '')) + '"'
                        + ' style="top:' + geo.top.toFixed(1) + 'px;'
                        + 'height:' + geo.height.toFixed(1) + 'px;'
                        + 'left:calc(' + (col * w).toFixed(4) + '% + 2px);'
                        + 'width:calc(' + w.toFixed(4) + '% - 4px);'
                        + 'background:' + c.bg + ';color:' + c.fg + ';border-left:3px solid ' + c.bd + ';">'
                        + '<span class="cal-appt-time">' + range + tick + '</span>'
                        + '<span class="cal-appt-name">' + esc(who) + '</span>'
                        + (geo.height >= TALL_APPT_PX && meta
                            ? '<span class="cal-appt-meta">' + esc(meta) + '</span>' : '')
                        + '</div>';
                });
                html += '</div>'; // appt layer

                html += '</div>'; // lane
            });

            html += '</div>'; // day col
        });

        html += '</div></div>';
        wrap.innerHTML = html;

        // Rescale blocks if a theme changes the real slot height.
        var probe = wrap.querySelector('.cal-day-slot');
        if (probe) {
            var real_h = probe.getBoundingClientRect().height;
            if (real_h && Math.abs(real_h - SLOT_HEIGHT_PX) > 0.5) {
                var scale = real_h / SLOT_HEIGHT_PX;
                wrap.querySelectorAll('.cal-appt[data-top]').forEach(function(el) {
                    el.style.top    = (parseFloat(el.dataset.top) * scale).toFixed(1) + 'px';
                    el.style.height = (parseFloat(el.dataset.height) * scale).toFixed(1) + 'px';
                });
            }
        }

        // Click an existing appointment → view details
        wrap.querySelectorAll('.cal-appt[data-name]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var a = appts.find(function(x) { return x.name === el.dataset.name; });
                if (a) show_modal(a);
            });
        });

        // Click an empty slot → availability dialog for the practitioner of that lane
        wrap.querySelectorAll('.cal-day-slot').forEach(function(el) {
            el.addEventListener('click', function() {
                var d    = el.dataset.date;
                var prac = el.dataset.prac;

                if (!is_day_working(prac, d)) {
                    frappe.msgprint({
                        title: 'Not Available',
                        message: name_of(prac) + ' is not scheduled to work on ' + frappe.datetime.str_to_user(d) + '.',
                        indicator: 'orange'
                    });
                    return;
                }

                open_slot_picker(d, prac);
            });
        });
    }

    // ── Availability dialog: Practitioner + Date + "Check Availability" ──────
    function open_slot_picker(date, practitioner) {
        var picker = new frappe.ui.Dialog({
            title: 'Check Availability',
            fields: [
                {
                    fieldtype: 'Link', fieldname: 'practitioner', label: 'Healthcare Practitioner',
                    options: 'Healthcare Practitioner', reqd: 1,
                    default: practitioner || ''
                },
                { fieldtype: 'Column Break' },
                {
                    fieldtype: 'Date', fieldname: 'date', label: 'Date',
                    reqd: 1, default: date || frappe.datetime.get_today()
                },
                { fieldtype: 'Section Break' },
                { fieldtype: 'HTML', fieldname: 'slot_list' }
            ],
            primary_action_label: 'Check Availability',
            primary_action: function(values) {
                run_check(values.practitioner, values.date);
            }
        });

        picker.fields_dict.slot_list.$wrapper.html(
            '<div class="cal-empty" style="padding:16px 0;">Pick a practitioner and date, then click Check Availability.</div>'
        );
        picker.show();

        function run_check(prac, dt) {
            if (!prac || !dt) return;

            picker.fields_dict.slot_list.$wrapper.html('<div class="cal-avail-checking">Checking availability…</div>');

            // Fresh Duty Assignment lookup (also refreshes duty_cache for this
            // practitioner, which the booking dialog's checks rely on).
            fetch_practitioner_duty(prac, function(duty_by_date) {
                if (!duty_by_date) {
                    picker.fields_dict.slot_list.$wrapper.html(
                        '<div class="cal-avail-box cal-avail-bad">Couldn\'t load this practitioner\'s duty assignment. Please try again.</div>'
                    );
                    return;
                }
                var duty = duty_by_date[dt];
                if (!duty || !duty.branch) {
                    picker.fields_dict.slot_list.$wrapper.html(
                        '<div class="cal-avail-box cal-avail-bad">' + esc(prac) + ' is not scheduled to work on ' + frappe.datetime.str_to_user(dt) + '.</div>'
                    );
                    return;
                }

                fetch_schedule_slots(prac, dt, function(slots) {
                    if (slots === null) {
                        picker.fields_dict.slot_list.$wrapper.html(
                            '<div class="cal-avail-box cal-avail-bad">Couldn\'t load this practitioner\'s schedule for this date. Please try again.</div>'
                        );
                        return;
                    }
                    if (!slots.length) {
                        picker.fields_dict.slot_list.$wrapper.html(
                            '<div class="cal-avail-box cal-avail-bad">No open slots left for ' + esc(prac) + ' on ' + frappe.datetime.str_to_user(dt) + '.</div>'
                        );
                        return;
                    }

                    var by_unit = {};
                    var unit_order = [];
                    slots.forEach(function(s) {
                        var key = s.service_unit || '';
                        if (!by_unit[key]) { by_unit[key] = []; unit_order.push(key); }
                        by_unit[key].push(s);
                    });

                    var html = '';
                    unit_order.forEach(function(unit) {
                        if (unit_order.length > 1) {
                            html += '<div style="font-size:12px;font-weight:600;margin:10px 0 6px;color:var(--text-muted);">'
                                + esc(unit || 'Unassigned') + '</div>';
                        }
                        html += '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
                        by_unit[unit].forEach(function(s) {
                            html += '<button type="button" class="cal-nav-btn cal-slot-pick"'
                                + ' data-time="' + esc(s.time_str) + '" data-duration="' + esc(s.duration) + '" data-unit="' + esc(s.service_unit || '') + '">'
                                + format_time_label(s.mins) + '</button>';
                        });
                        html += '</div>';
                    });
                    picker.fields_dict.slot_list.$wrapper.html(html);

                    picker.fields_dict.slot_list.$wrapper.find('.cal-slot-pick').on('click', function() {
                        var time_str = $(this).data('time');
                        var slot_duration = parseInt($(this).data('duration'), 10) || 15;
                        var slot_unit = $(this).data('unit');
                        picker.hide();
                        open_booking_dialog({
                            appointment_date: dt,
                            appointment_time: time_str,
                            practitioner: prac,
                            duration: slot_duration,
                            service_unit: slot_unit || duty.branch
                        });
                    });
                });
            });
        }
    }

    // ── Pre-insert availability check ────────────────────────────
    // Duty Assignment for that practitioner/date (from duty_cache) plus clashes
    // with that practitioner's existing appointments.
    function check_slot_availability(practitioner, date, time_str, duration, callback) {
        if (!is_slot_bookable(practitioner, date, time_str, duration)) {
            callback(false, (practitioner || 'This practitioner') + ' is not scheduled to work on ' + frappe.datetime.str_to_user(date) + '.');
            return;
        }
        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Patient Appointment',
                fields: ['name', 'appointment_time', 'duration'],
                filters: [
                    ['practitioner', '=', practitioner],
                    ['appointment_date', '=', date],
                    ['status', '!=', 'Cancelled']
                ],
                limit_page_length: 200
            },
            callback: function(r) {
                var existing = r.message || [];
                var req_start = time_str_to_minutes(time_str);
                var req_end   = req_start + (duration || 15);
                var clash = existing.find(function(a) {
                    var s = time_str_to_minutes(a.appointment_time);
                    var e = s + (a.duration || 15);
                    return req_start < e && s < req_end;
                });
                if (clash) callback(false, 'That time overlaps an existing appointment (' + clash.name + ').');
                else callback(true, 'Slot is available.');
            },
            error: function() { callback(false, 'Could not verify availability with the server. Please try again before booking.'); }
        });
    }

    // ── Booking dialog ───────────────────────────────────────────
    function open_booking_dialog(prefill) {
        prefill = prefill || {};
        var dialog = null;

        var dialog_def = {
            title: 'Book Appointment',
            fields: [
                {
                    fieldtype: 'Link', fieldname: 'patient', label: 'Patient',
                    options: 'Patient', reqd: 1
                },
                {
                    // Filled automatically when a patient is chosen.
                    fieldtype: 'Data', fieldname: 'patient_name', label: 'Patient Name',
                    read_only: 1
                },
                {
                    fieldtype: 'Link', fieldname: 'practitioner', label: 'Practitioner',
                    options: 'Healthcare Practitioner', reqd: 1,
                    default: prefill.practitioner || '',
                    read_only: prefill.practitioner ? 1 : 0
                },
                { fieldtype: 'Column Break' },
                {
                    fieldtype: 'Date', fieldname: 'appointment_date', label: 'Date',
                    reqd: 1, default: prefill.appointment_date || frappe.datetime.get_today()
                },
                {
                    fieldtype: 'Time', fieldname: 'appointment_time', label: 'Time',
                    reqd: 1, default: prefill.appointment_time || '09:00:00'
                },
                { fieldtype: 'Section Break' },
                {
                    fieldtype: 'Link', fieldname: 'service_unit', label: 'Service Unit',
                    options: 'Healthcare Service Unit',
                    default: prefill.service_unit || '',
                    description: "Auto-filled from the practitioner's Duty Assignment Branch for this date."
                },
                {
                    fieldtype: 'Link', fieldname: 'department', label: 'Department',
                    options: 'Medical Department'
                },
                { fieldtype: 'Column Break' },
                {
                    fieldtype: 'Link', fieldname: 'appointment_type', label: 'Appointment Type',
                    options: 'Appointment Type'
                },
                {
                    fieldtype: 'Int', fieldname: 'duration', label: 'Duration (mins)',
                    default: prefill.duration || 15
                },
                { fieldtype: 'Section Break' },
                {
                    fieldtype: 'Small Text', fieldname: 'custom_appt_description', label: 'Description',
                    reqd: 1
                },
                { fieldtype: 'HTML', fieldname: 'availability_status' }
            ],
            secondary_action_label: 'Check Availability',
            secondary_action: function() { run_availability_check(true); },
            primary_action_label: 'Book',
            primary_action: function(values) {
                // Mandatory — also reject a description that is only spaces.
                if (!(values.custom_appt_description || '').trim()) {
                    frappe.msgprint({ message: 'Please enter a description for the appointment.', indicator: 'orange' });
                    return;
                }
                run_availability_check(false, function(is_available) {
                    if (!is_available) return;
                    do_insert(values);
                });
            }
        };
        dialog = new frappe.ui.Dialog(dialog_def);

        // Pull the patient's name whenever a patient is picked/changed/cleared.
        function sync_patient_name() {
            if (!dialog) return;
            var pid = dialog.get_value('patient');
            if (!pid) { dialog.set_value('patient_name', ''); return; }
            frappe.db.get_value('Patient', pid, 'patient_name').then(function(r) {
                if (dialog.get_value('patient') !== pid) return; // changed meanwhile
                dialog.set_value('patient_name', (r && r.message && r.message.patient_name) || '');
            });
        }

        function set_status(html, ok) {
            dialog.fields_dict.availability_status.$wrapper.html(
                '<div class="cal-avail-box ' + (ok ? 'cal-avail-ok' : 'cal-avail-bad') + '">' + frappe.utils.escape_html(html) + '</div>'
            );
        }

        function run_availability_check(silent_ok, cb) {
            var values = dialog.get_values(true) || {};
            var prac = values.practitioner || prefill.practitioner;
            var date = values.appointment_date;
            var time = values.appointment_time;
            var dur  = values.duration || 15;

            if (!prac || !date || !time) {
                if (cb) cb(true);
                return;
            }

            dialog.fields_dict.availability_status.$wrapper.html(
                '<div class="cal-avail-checking">Checking availability…</div>'
            );

            check_slot_availability(prac, date, time, dur, function(is_available, message) {
                set_status(message, is_available);

                var duty = get_duty_for(prac, date);
                if (duty && duty.branch) dialog.set_value('service_unit', duty.branch);

                if (cb) cb(is_available);
            });
        }

        function do_insert(values) {
            dialog.set_df_property('patient', 'read_only', 1);
            frappe.call({
                method: 'frappe.client.insert',
                args: {
                    doc: {
                        doctype: 'Patient Appointment',
                        patient: values.patient,
                        practitioner: values.practitioner,
                        appointment_date: values.appointment_date,
                        appointment_time: values.appointment_time,
                        duration: values.duration,
                        service_unit: values.service_unit,
                        department: values.department,
                        appointment_type: values.appointment_type,
                        custom_appt_description: values.custom_appt_description.trim(),
                        company: frappe.defaults.get_default('company')
                    }
                },
                freeze: true,
                freeze_message: 'Booking appointment…',
                callback: function(r) {
                    if (r.message) {
                        var who = values.patient_name ? ' for ' + values.patient_name : '';
                        frappe.show_alert({
                            message: 'Appointment ' + r.message.name + ' booked' + who,
                            indicator: 'green'
                        });
                        dialog.hide();
                        load_schedule();
                    }
                },
                error: function() {
                    dialog.set_df_property('patient', 'read_only', 0);
                }
            });
        }

        dialog.show();

        // Patient name follows the patient field.
        var patient_ctrl = dialog.fields_dict.patient;
        if (patient_ctrl && patient_ctrl.$input) {
            patient_ctrl.$input.on('change awesomplete-selectcomplete', sync_patient_name);
        }

        // Re-check whenever the date or time changes.
        ['appointment_date', 'appointment_time'].forEach(function(fn) {
            var f = dialog.fields_dict[fn];
            if (f && f.$input) f.$input.on('change', function() { run_availability_check(true); });
        });

        // Default department from the practitioner.
        if (prefill.practitioner) {
            frappe.db.get_value('Healthcare Practitioner', prefill.practitioner, 'department')
                .then(function(r) {
                    if (r && r.message && r.message.department) {
                        dialog.set_value('department', r.message.department);
                    }
                });
        }

        run_availability_check(true);
    }

    // ── Detail modal ───────────────────────────────────────────
    function show_modal(a) {
        var c = color_for(a.practitioner);
        var bg = document.createElement('div');
        bg.className = 'cal-modal-bg';
        bg.innerHTML =
            '<div class="cal-modal">' +
            '<h3 style="border-left:4px solid ' + c.bd + ';padding-left:10px;">' + esc(a.patient_name || a.patient) + '</h3>' +
            modal_row('ID',           '<a href="/app/patient-appointment/' + esc(a.name) + '" target="_blank">' + esc(a.name) + '</a>') +
            modal_row('Patient ID',   esc(a.patient || '—')) +
            modal_row('Status',       esc(a.status || '—')) +
            modal_row('Date',         esc(a.appointment_date || '—')) +
            modal_row('Time',         esc(fmt_modal_time(a))) +
            modal_row('Type',         esc(a.appointment_type || '—')) +
            modal_row('For',          esc(a.appointment_for  || '—')) +
            modal_row('Practitioner', esc(a.practitioner_name || a.practitioner || '—')) +
            modal_row('Department',   esc(a.department   || '—')) +
            modal_row('Service Unit', esc(a.service_unit || '—')) +
            '<div class="cal-modal-desc"><div class="k">Description</div>'
                + '<div class="v">' + esc(a.custom_appt_description || '—') + '</div></div>' +
            '<div class="cal-modal-actions">' +
            '<button class="btn-cal-ghost" id="mc">Close</button>' +
            '<button class="btn-cal-primary" id="mo">Open Record</button>' +
            '</div></div>';
        document.body.appendChild(bg);
        bg.querySelector('#mc').onclick = function() { bg.remove(); };
        bg.querySelector('#mo').onclick = function() {
            frappe.set_route('Form', 'Patient Appointment', a.name);
            bg.remove();
        };
        bg.addEventListener('click', function(e) { if (e.target === bg) bg.remove(); });
    }

    function fmt_modal_time(a) {
        if (!a.appointment_time) return '\u2014';
        var start = time_str_to_minutes(a.appointment_time);
        var mins  = appt_duration(a);
        return format_time_label(start) + ' \u2013 ' + format_time_label(start + mins)
            + ' (' + mins + ' min)';
    }

    function modal_row(k, v) {
        return '<div class="cal-modal-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
    }

    // ── Initial state: wait for practitioners to be picked ─────
    render_chips();
    update_dd_label();
    show_gate_message();
    load_practitioner_list();
};