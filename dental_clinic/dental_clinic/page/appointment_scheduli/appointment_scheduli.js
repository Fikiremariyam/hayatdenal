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

    var current_practitioner = null;

    // practitioner_schedule_windows shapes:
    //   null            -> not fetched yet / lookup failed -> fail OPEN (don't restrict, use default 8-5 grid)
    //   {}               -> practitioner has no "Practitioner Schedules" rows at all -> fail OPEN
    //   { Monday:[{from,to,service_unit,schedule}], ... } -> explicit windows, days not listed = not working
    var practitioner_schedule_windows = null;

    // Leave data for the currently-loaded date range, keyed by date. Reused by the
    // booking dialog's availability check without a second round trip.
    var last_leaves_by_date = {};

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
            .cal-allday-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-allday-lbl { padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-right: 1px solid var(--border-color); }
            .cal-allday-cell { padding: 3px 4px; border-right: 1px solid var(--border-color); min-height: 26px; }
            .cal-allday-cell:last-child { border-right: none; }
            .cal-allday-block { background: #B5D4F4; color: #0C447C; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500; }
            .cal-leave-block { background: #E5E7EB; color: #374151; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500; cursor: pointer; border: 1px dashed #9CA3AF; margin-bottom: 2px; }
            .cal-body-row { display: grid; }
            .cal-time-col { background: var(--card-bg); border-right: 1px solid var(--border-color); }
            .cal-time-slot { height: 52px; padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-bottom: 1px solid var(--border-color); }
            .cal-day-col { border-right: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-day-col:last-child { border-right: none; }
            .cal-day-col.today { background: #E6F1FB; }
            /* Practitioner is not working this day at all */
            .cal-day-col.cal-day-unavailable { background: #F1E4D3; }
            .cal-day-col.cal-day-unavailable.today { background: #ECD9BE; }
            .cal-day-slot { height: 52px; border-bottom: 1px solid var(--border-color); padding: 2px 4px; cursor: pointer; transition: background .1s; }
            .cal-day-slot:hover { background: var(--subtle-bg); }
            /* Non-bookable slot: either the whole day is off, or this slot falls outside the schedule window */
            .cal-day-slot.cal-slot-off { cursor: not-allowed; background: rgba(139,94,52,0.10); }
            .cal-day-slot.cal-slot-off:hover { background: rgba(139,94,52,0.10); }
            .cal-appt { border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-bottom: 2px; }
            .cal-appt.Open, .cal-appt.Scheduled { background: #B5D4F4; color: #0C447C; }
            .cal-appt.Closed { background: #9FE1CB; color: #085041; }
            .cal-appt.Cancelled { background: #F7C1C1; color: #791F1F; }
            .cal-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 13px; }
            .cal-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 9998; display: flex; align-items: center; justify-content: center; }
            .cal-modal { background: var(--card-bg); border-radius: 14px; padding: 28px; width: 440px; max-width: 95vw; z-index: 9999; }
            .cal-modal h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--text-color); }
            .cal-modal-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
            .cal-modal-row .k { color: var(--text-muted); }
            .cal-modal-row .v { font-weight: 500; color: var(--text-color); }
            .cal-modal-actions { margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end; }
            .btn-cal-primary { background: #1a2340; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
            .btn-cal-ghost { background: var(--subtle-bg); color: var(--text-color); border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
            .cal-avail-box { font-size: 12px; padding: 8px 10px; border-radius: 6px; }
            .cal-avail-ok { background: #E3F5EE; color: #085041; }
            .cal-avail-bad { background: #FBE7E7; color: #791F1F; }
            .cal-avail-checking { color: var(--text-muted); }
        `;
        document.head.appendChild(style);
    }

    // ── Page skeleton ──────────────────────────────────────────
    // Note: Service Unit filter removed. Practitioner filter is now required.
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
                    <span class="cal-filter-lbl">Practitioner <span class="cal-filter-required-lbl">(required)</span></span>
                    <div id="wrap-practitioner" class="cal-filter-link-wrap"></div>
                </div>
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
                <button class="cal-nav-btn" id="btn-mark-unavailable"
                    style="margin-left:auto" disabled>
                    Mark Not Available
                </button>
                <button class="cal-nav-btn" id="btn-new-appt"
                    style="background:#1a2340;color:#fff;border-color:#1a2340;" disabled>
                    + New Appointment
                </button>
            </div>

            <div class="cal-wrap" id="cal-wrap">
                <div class="cal-empty">Select a Healthcare Practitioner above to view their schedule.</div>
            </div>
        </div>
    `);

    // ── Build Frappe Link field for Practitioner (Service Unit filter removed) ──
    var practitioner_field = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            fieldname: 'practitioner_filter',
            options:   'Healthcare Practitioner',
            placeholder: 'Select a practitioner…'
        },
        parent: document.getElementById('wrap-practitioner'),
        render_input: true
    });
    practitioner_field.refresh();
    practitioner_field.$input.on('change', function() {
        on_practitioner_changed();
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
        practitioner_field.set_value('');
        on_practitioner_changed();
    });

    // ── Day / Week view toggle (previously had no click handlers at all) ──
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
        var prac = practitioner_field.get_value();
        if (!prac) {
            frappe.msgprint({ message: 'Please select a Healthcare Practitioner first.', indicator: 'orange' });
            return;
        }
        if (is_on_leave(from_date)) {
            frappe.msgprint({
                title: 'Not Available',
                message: prac + ' is on approved leave on ' + frappe.datetime.str_to_user(from_date) + '. Pick a different day instead.',
                indicator: 'orange'
            });
            return;
        }
        if (!is_day_working(from_date)) {
            frappe.msgprint({
                title: 'Not Available',
                message: prac + ' is not scheduled to work on ' + frappe.datetime.str_to_user(from_date) + '. Pick a working day instead.',
                indicator: 'orange'
            });
            return;
        }
        open_booking_dialog({
            appointment_date: from_date,
            practitioner: prac
        });
    });

    // ── Mark Not Available button ───────────────────────────────
    document.getElementById('btn-mark-unavailable').addEventListener('click', function() {
        var prac = practitioner_field.get_value();
        if (!prac) {
            frappe.msgprint({ message: 'Please select a Healthcare Practitioner first.', indicator: 'orange' });
            return;
        }
        open_leave_dialog({
            from_date: from_date,
            to_date: to_date,
            practitioner: prac
        });
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

    var WEEKDAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    function get_weekday_name(d) {
        var parts = d.split('-');
        var dt = new Date(parts[0], parts[1]-1, parts[2]);
        return WEEKDAY_NAMES[dt.getDay()];
    }

    function time_str_to_minutes(t) {
        if (!t) return 0;
        var parts = t.split(':');
        return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || 0, 10);
    }

    // 24-hour "HH:MM" label — matches the exact time stored on the schedule.
    function format_time_label(mins) {
        var h24 = Math.floor(mins / 60) % 24;
        var m   = ((mins % 60) + 60) % 60;
        return (h24 < 10 ? '0' + h24 : h24) + ':' + (m < 10 ? '0' + m : m);
    }

    // ── Dynamic time-slot grid, driven by the practitioner's schedule ──
    // Rows are generated directly from each schedule window's own from/to time —
    // NOT stepped uniformly from one global start — so a slot only ever exists
    // where it exactly fits inside a real working window. A practitioner with
    // different hours on different days (e.g. 9:00–12:00 one day, 8:15–11:00
    // another) previously shared one 30-min ladder anchored to the earliest
    // start, which could misalign with other days' windows and wrongly mark
    // real slots as "outside working hours". Generating per-window avoids that.
    var SLOT_MINUTES = 30;
    var TIME_SLOTS = [];         // display labels, e.g. "09:00"
    var TIME_SLOT_MINUTES = [];  // parallel array of minutes-from-midnight for each row

    function build_time_slots(windows) {
        var minute_set = {};
        if (windows) {
            Object.keys(windows).forEach(function(day) {
                windows[day].forEach(function(w) {
                    var s = time_str_to_minutes(w.from);
                    var e = time_str_to_minutes(w.to);
                    for (var m = s; m + SLOT_MINUTES <= e; m += SLOT_MINUTES) {
                        minute_set[m] = true;
                    }
                });
            });
        }
        var minutes = Object.keys(minute_set).map(Number).sort(function(a, b) { return a - b; });
        if (!minutes.length) {
            // No schedule to derive rows from — default 8:00–17:00 ladder (only
            // ever shown while no practitioner is selected, since a practitioner
            // with zero real windows renders the "Slots not assigned" message
            // instead of this grid).
            minutes = [];
            for (var mm = 8 * 60; mm < 17 * 60 + 30; mm += SLOT_MINUTES) minutes.push(mm);
        }
        TIME_SLOT_MINUTES = minutes;
        TIME_SLOTS = minutes.map(format_time_label);
    }
    build_time_slots(null); // populate the default grid up-front

    // Exact match only — an appointment time that doesn't land on a generated
    // row (e.g. booked outside the current schedule by other means) falls back
    // to the all-day row, same as before.
    function time_to_slot(time_str) {
        if (!time_str) return -1;
        return TIME_SLOT_MINUTES.indexOf(time_str_to_minutes(time_str));
    }

    function slot_to_time(slot_index) {
        var total_mins = TIME_SLOT_MINUTES[slot_index];
        if (total_mins === undefined) total_mins = 0;
        var h = Math.floor(total_mins / 60), m = total_mins % 60;
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':00';
    }

    function total_window_count() {
        if (!practitioner_schedule_windows) return 0;
        var total = 0;
        Object.keys(practitioner_schedule_windows).forEach(function(k) {
            total += practitioner_schedule_windows[k].length;
        });
        return total;
    }

    // The schedule window (if any) that contains this date + time — carries the
    // Service Unit that's linked to that schedule row on the Healthcare Practitioner.
    function find_window(date, time_str) {
        if (!practitioner_schedule_windows) return null;
        var day_windows = practitioner_schedule_windows[get_weekday_name(date)] || [];
        var mins = time_str_to_minutes(time_str);
        var match = null;
        day_windows.forEach(function(w) {
            var s = time_str_to_minutes(w.from), e = time_str_to_minutes(w.to);
            if (mins >= s && mins < e) match = w;
        });
        return match;
    }

    // Is the practitioner scheduled to work AT ALL on this date? (day-level, for
    // the brown/non-bookable column treatment). Fails CLOSED: if we don't have a
    // real, non-empty schedule for this practitioner, the day is not bookable —
    // we never guess "available" when the schedule is unknown or empty.
    function is_day_working(date) {
        if (!practitioner_schedule_windows) return false;
        if (total_window_count() === 0) return false;
        var day_windows = practitioner_schedule_windows[get_weekday_name(date)] || [];
        return day_windows.length > 0;
    }

    // Is this specific date/time (+ duration) fully inside one of the practitioner's
    // schedule windows for that weekday? Same fail-closed rule as is_day_working.
    function is_slot_bookable(date, time_str, duration) {
        if (!practitioner_schedule_windows) return false;
        if (total_window_count() === 0) return false;
        var day_windows = practitioner_schedule_windows[get_weekday_name(date)] || [];
        if (!day_windows.length) return false;
        var start = time_str_to_minutes(time_str);
        var end   = start + (duration || SLOT_MINUTES);
        return day_windows.some(function(w) {
            var s = time_str_to_minutes(w.from), e = time_str_to_minutes(w.to);
            return start >= s && end <= e;
        });
    }

    // Is the practitioner on approved leave on this date? Backed by whatever leave
    // data was fetched for the currently-loaded date range (see last_leaves_by_date).
    function is_on_leave(date) {
        return !!(last_leaves_by_date[date] && last_leaves_by_date[date].length);
    }

    // Combined day-level bookability: scheduled to work AND not on leave. This is
    // what actually drives the brown/non-bookable column treatment in the grid.
    function is_day_bookable(date) {
        return is_day_working(date) && !is_on_leave(date);
    }

    // ── Practitioner selection gate ───────────────────────────────
    function show_gate_message() {
        document.getElementById('cal-wrap').innerHTML =
            '<div class="cal-empty">Select a Healthcare Practitioner above to view their schedule.</div>';
        document.getElementById('cal-stats').innerHTML = '';
        document.getElementById('cal-range-lbl').textContent = '';
        document.getElementById('btn-new-appt').disabled = true;
        document.getElementById('btn-mark-unavailable').disabled = true;
    }

    function on_practitioner_changed() {
        var val = practitioner_field.get_value();
        current_practitioner = val || null;
        practitioner_schedule_windows = null;

        if (!val) {
            show_gate_message();
            return;
        }

        document.getElementById('btn-mark-unavailable').disabled = false;
        document.getElementById('btn-new-appt').disabled = true; // re-enabled once we know slots exist

        fetch_practitioner_schedule(val, function(windows) {
            // ignore stale responses if the user switched practitioners meanwhile
            if (practitioner_field.get_value() !== val) return;
            practitioner_schedule_windows = windows;
            build_time_slots(windows);
            load_schedule();
        });
    }

    // Reads Healthcare Practitioner -> "Practitioner Schedules" child table (each row
    // links a Practitioner Schedule + a Service Unit) -> Practitioner Schedule's
    // time_slots child table (day / from_time / to_time) to build:
    //   { "Monday": [ {from, to, service_unit, schedule}, ... ], ... }
    // NOTE: exact fieldnames can differ slightly across ERPNext Healthcare versions —
    // this reads `practitioner_schedules` rows with `schedule` + `service_unit`
    // fields, per the "Practitioner Schedules" table on Healthcare Practitioner.
    function fetch_practitioner_schedule(practitioner, callback) {
        frappe.call({
            method: 'frappe.client.get',
            args: { doctype: 'Healthcare Practitioner', name: practitioner },
            callback: function(r) {
                var doc  = r.message;
                var rows = (doc && doc.practitioner_schedules) || [];
                if (!rows.length) { callback({}); return; }

                var windows = {};
                var schedule_cache = {};
                var remaining = rows.length;

                function done() {
                    remaining--;
                    if (remaining === 0) callback(windows);
                }

                function add_slots(sdoc, service_unit, schedule_name) {
                    var slots = (sdoc && sdoc.time_slots) || [];
                    slots.forEach(function(ts) {
                        if (!ts.day || !ts.from_time || !ts.to_time) return;
                        if (!windows[ts.day]) windows[ts.day] = [];
                        windows[ts.day].push({
                            from: ts.from_time,
                            to: ts.to_time,
                            service_unit: service_unit,
                            schedule: schedule_name
                        });
                    });
                }

                rows.forEach(function(row) {
                    var schedule_name = row.schedule || row.practitioner_schedule;
                    var service_unit  = row.service_unit || row.healthcare_service_unit || '';
                    if (!schedule_name) { done(); return; }

                    if (schedule_cache[schedule_name]) {
                        add_slots(schedule_cache[schedule_name], service_unit, schedule_name);
                        done();
                        return;
                    }

                    frappe.call({
                        method: 'frappe.client.get',
                        args: { doctype: 'Practitioner Schedule', name: schedule_name },
                        callback: function(sr) {
                            schedule_cache[schedule_name] = sr.message;
                            add_slots(sr.message, service_unit, schedule_name);
                            done();
                        },
                        error: function() { done(); }
                    });
                });
            },
            error: function() {
                // Couldn't read the practitioner's schedule — fail open (don't block booking).
                callback(null);
            }
        });
    }

    // ── Load data ──────────────────────────────────────────────
    function load_schedule() {
        var wrap  = document.getElementById('cal-wrap');
        var stats = document.getElementById('cal-stats');
        var lbl   = document.getElementById('cal-range-lbl');

        var pf = practitioner_field.get_value();
        if (!pf) {
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

        var filters = [
            ['appointment_date', '>=', f],
            ['appointment_date', '<=', t],
            ['practitioner', '=', pf]
        ];

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Patient Appointment',
                fields: [
                    'name','status','appointment_type','appointment_for',
                    'practitioner','practitioner_name','department',
                    'service_unit','appointment_date','appointment_time',
                    'patient','patient_name','company','duration'
                ],
                filters: filters,
                limit_page_length: 500,
                order_by: 'appointment_date asc, appointment_time asc'
            },
            callback: function(r) {
                var appts = r.message || [];
                render_stats(appts, stats);
                fetch_leaves(f, t, pf, function(leaves_by_date) {
                    last_leaves_by_date = leaves_by_date || {};

                    // Couldn't determine the schedule at all (lookup failed) — don't
                    // guess either way, say so and offer a retry.
                    if (!practitioner_schedule_windows) {
                        wrap.innerHTML =
                            '<div class="cal-empty">Couldn\'t load this practitioner\'s schedule.'
                            + '<br><button class="cal-nav-btn" id="btn-retry-schedule" style="margin-top:10px">Retry</button></div>';
                        document.getElementById('btn-new-appt').disabled = true;
                        var retry_btn = document.getElementById('btn-retry-schedule');
                        if (retry_btn) retry_btn.addEventListener('click', on_practitioner_changed);
                        return;
                    }

                    // Explicit "no schedule at all" case — the Practitioner Schedules
                    // table on this practitioner is empty (or resolves to zero slots).
                    if (total_window_count() === 0) {
                        wrap.innerHTML =
                            '<div class="cal-empty">Slots not assigned.<br>'
                            + 'This practitioner has no Practitioner Schedule set up under '
                            + '"Practitioner Schedules" on their Healthcare Practitioner record, '
                            + 'so no bookable time slots can be shown.</div>';
                        document.getElementById('btn-new-appt').disabled = true;
                        return;
                    }

                    document.getElementById('btn-new-appt').disabled = false;
                    render_calendar(appts, wrap, f, t, leaves_by_date);
                });
            }
        });
    }

    // ── Fetch practitioner unavailability via Leave Application ──
    // Practitioners must be linked to an Employee (Healthcare Practitioner → Employee field)
    // for their leave to show up here.
    function fetch_leaves(f, t, practitioner_filter, callback) {
        var prac_filters = [['employee', 'is', 'set']];
        if (practitioner_filter) prac_filters.push(['name', '=', practitioner_filter]);

        frappe.call({
            method: 'frappe.client.get_list',
            args: {
                doctype: 'Healthcare Practitioner',
                fields: ['name', 'practitioner_name', 'employee'],
                filters: prac_filters,
                limit_page_length: 500
            },
            callback: function(pr) {
                var practitioners = pr.message || [];
                if (!practitioners.length) { callback({}); return; }

                var emp_to_prac = {};
                var employees = practitioners.map(function(p) {
                    emp_to_prac[p.employee] = p;
                    return p.employee;
                });

                frappe.call({
                    method: 'frappe.client.get_list',
                    args: {
                        doctype: 'Leave Application',
                        fields: [
                            'name', 'employee', 'employee_name', 'leave_type',
                            'from_date', 'to_date', 'half_day', 'description', 'status'
                        ],
                        filters: [
                            ['employee', 'in', employees],
                            ['status', '=', 'Approved'],
                            ['from_date', '<=', t],
                            ['to_date', '>=', f]
                        ],
                        limit_page_length: 500
                    },
                    callback: function(lr) {
                        var leaves = lr.message || [];
                        var leaves_by_date = {};
                        leaves.forEach(function(lv) {
                            var start = lv.from_date > f ? lv.from_date : f;
                            var end   = lv.to_date   < t ? lv.to_date   : t;
                            var d = start;
                            while (d <= end) {
                                if (!leaves_by_date[d]) leaves_by_date[d] = [];
                                var prac = emp_to_prac[lv.employee] || {};
                                leaves_by_date[d].push({
                                    name: lv.name,
                                    practitioner_name: prac.practitioner_name || lv.employee_name,
                                    leave_type: lv.leave_type,
                                    description: lv.description,
                                    half_day: lv.half_day
                                });
                                d = frappe.datetime.add_days(d, 1);
                            }
                        });
                        callback(leaves_by_date);
                    }
                });
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
    function render_calendar(appts, wrap, f, t, leaves_by_date) {
        leaves_by_date = leaves_by_date || {};
        var dates    = get_week_dates(f, t);
        var today    = frappe.datetime.get_today();
        var grid_tpl = '60px ' + dates.map(function() { return '1fr'; }).join(' ');

        if (!appts.length) {
            // still render an empty grid so the user can click a slot to book
            appts = [];
        }

        // Per-date / per-slot bookability, computed once for this render and reused
        // by both the markup and the click handlers below. A day is bookable only if
        // the practitioner is scheduled to work AND not on approved leave.
        var day_working = {};
        var slot_ok = {};
        dates.forEach(function(d) {
            day_working[d] = is_day_bookable(d);
            slot_ok[d] = TIME_SLOTS.map(function(_, si) {
                return day_working[d] && is_slot_bookable(d, slot_to_time(si), SLOT_MINUTES);
            });
        });

        var by_date = {};
        var allday  = {};
        appts.forEach(function(a) {
            var d    = a.appointment_date;
            var slot = time_to_slot(a.appointment_time);
            if (slot < 0 || slot >= TIME_SLOTS.length) {
                if (!allday[d]) allday[d] = [];
                allday[d].push(a);
            } else {
                if (!by_date[d]) by_date[d] = {};
                if (!by_date[d][slot]) by_date[d][slot] = [];
                by_date[d][slot].push(a);
            }
        });

        var html = '<div class="cal-grid">';

        html += '<div class="cal-head-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-head-cell"></div>';
        dates.forEach(function(d) {
            var off_label = day_working[d] ? '' : (is_on_leave(d) ? 'on leave' : 'not working');
            html += '<div class="cal-head-cell' + (d === today ? ' today' : '') + '">'
                + fmt_date_header(d)
                + (off_label ? '<span class="cal-head-off">' + off_label + '</span>' : '')
                + '</div>';
        });
        html += '</div>';

        html += '<div class="cal-allday-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-allday-lbl">all-day</div>';
        dates.forEach(function(d) {
            html += '<div class="cal-allday-cell">';
            if (leaves_by_date[d]) {
                leaves_by_date[d].forEach(function(lv) {
                    html += '<div class="cal-leave-block" data-leave="' + lv.name + '" title="'
                        + (lv.description || lv.leave_type || '') + '">'
                        + '🚫 ' + lv.practitioner_name
                        + (lv.leave_type ? ' \u2022 ' + lv.leave_type : '')
                        + (lv.half_day ? ' (half day)' : '')
                        + '</div>';
                });
            }
            if (allday[d]) {
                allday[d].forEach(function(a) {
                    html += '<div class="cal-allday-block">'
                        + (a.patient_name || a.patient || '—')
                        + (a.service_unit ? ' \u2022 ' + a.service_unit : '')
                        + '</div>';
                });
            }
            html += '</div>';
        });
        html += '</div>';

        html += '<div class="cal-body-row" style="display:grid;grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-time-col">';
        TIME_SLOTS.forEach(function(ts) {
            html += '<div class="cal-time-slot">' + ts + '</div>';
        });
        html += '</div>';

        dates.forEach(function(d) {
            html += '<div class="cal-day-col' + (d === today ? ' today' : '') + (day_working[d] ? '' : ' cal-day-unavailable') + '">';
            TIME_SLOTS.forEach(function(ts, si) {
                var bookable = slot_ok[d][si];
                html += '<div class="cal-day-slot' + (bookable ? '' : ' cal-slot-off') + '" data-date="' + d + '" data-slot="' + si + '">';
                if (by_date[d] && by_date[d][si]) {
                    by_date[d][si].forEach(function(a) {
                        var status_class = (a.status || 'Open').replace(' ', '');
                        html += '<div class="cal-appt ' + status_class + '" data-name="' + a.name + '">'
                            + (a.appointment_time ? a.appointment_time.substring(0,5) + ' ' : '')
                            + (a.patient_name || a.patient || '—')
                            + '</div>';
                    });
                }
                html += '</div>';
            });
            html += '</div>';
        });

        html += '</div></div>';
        wrap.innerHTML = html;

        // Click an existing appointment → view details
        wrap.querySelectorAll('.cal-appt[data-name]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                var a = appts.find(function(x) { return x.name === el.dataset.name; });
                if (a) show_modal(a);
            });
        });

        // Click a "not available" block → open the Leave Application record
        wrap.querySelectorAll('.cal-leave-block[data-leave]').forEach(function(el) {
            el.addEventListener('click', function(e) {
                e.stopPropagation();
                frappe.set_route('Form', 'Leave Application', el.dataset.leave);
            });
        });

        // Click an empty slot → book a new appointment prefilled with that date/time,
        // unless the practitioner isn't scheduled to work that slot.
        wrap.querySelectorAll('.cal-day-slot').forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (e.target.closest('.cal-appt')) return; // handled above
                var d  = el.dataset.date;
                var si = parseInt(el.dataset.slot, 10);

                if (!slot_ok[d][si]) {
                    var prac_label = practitioner_field.get_value() || 'This practitioner';
                    var msg;
                    if (is_on_leave(d)) {
                        msg = prac_label + ' is on approved leave on ' + frappe.datetime.str_to_user(d) + '.';
                    } else if (!is_day_working(d)) {
                        msg = prac_label + ' is not scheduled to work on ' + frappe.datetime.str_to_user(d) + '.';
                    } else {
                        msg = 'That time is outside ' + prac_label + "'s working hours on " + frappe.datetime.str_to_user(d) + '.';
                    }
                    frappe.msgprint({ title: 'Not Available', message: msg, indicator: 'orange' });
                    return;
                }

                var win = find_window(d, slot_to_time(si));
                open_booking_dialog({
                    appointment_date: d,
                    appointment_time: slot_to_time(si),
                    practitioner: practitioner_field.get_value(),
                    service_unit: win ? win.service_unit : ''
                });
            });
        });
    }

    // ── Availability check (mirrors the standard Patient Appointment booking flow) ──
    // Healthcare's own `get_availability_data(date, appointment)` is designed to be
    // called against an existing/in-progress Patient Appointment document (that's
    // where it pulls the practitioner from), so it isn't usable for a pre-insert
    // check against a bare practitioner + date/time. Instead this reproduces the
    // same checks the standard doctype's validation does: the practitioner's
    // schedule window, approved leave, and clashes with existing appointments —
    // all run BEFORE the record is inserted, so a bad slot never reaches insert.
    function check_slot_availability(practitioner, date, time_str, duration, callback) {
        if (!is_slot_bookable(date, time_str, duration)) {
            callback(false, (practitioner || 'This practitioner') + ' is not scheduled to work this slot on ' + frappe.datetime.str_to_user(date) + '.');
            return;
        }
        if (practitioner === current_practitioner && last_leaves_by_date[date] && last_leaves_by_date[date].length) {
            callback(false, (practitioner || 'The practitioner') + ' is on approved leave on ' + frappe.datetime.str_to_user(date) + '.');
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
            error: function() { callback(true, 'Could not fully verify with the server — double-check before confirming.'); }
        });
    }

    // ── Booking dialog ───────────────────────────────────────────
    function open_booking_dialog(prefill) {
        prefill = prefill || {};

        var dialog = new frappe.ui.Dialog({
            title: 'Book Appointment',
            fields: [
                {
                    fieldtype: 'Link', fieldname: 'patient', label: 'Patient',
                    options: 'Patient', reqd: 1
                },
                {
                    // Tied to the practitioner selected in the calendar filter, since
                    // that's whose schedule/availability we've already loaded.
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
                    description: "Auto-filled from the practitioner's schedule for this day/time."
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
                    default: 15
                },
                { fieldtype: 'Section Break' },
                { fieldtype: 'HTML', fieldname: 'availability_status' }
            ],
            secondary_action_label: 'Check Availability',
            secondary_action: function() { run_availability_check(true); },
            primary_action_label: 'Book',
            primary_action: function(values) {
                // Check availability first — same idea as the standard Patient Appointment
                // doctype's own validation — instead of inserting straight away.
                run_availability_check(false, function(is_available) {
                    if (!is_available) return; // status message already shown; stay open
                    do_insert(values);
                });
            }
        });

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
                if (cb) cb(true); // let the dialog's own required-field validation handle it
                return;
            }

            dialog.fields_dict.availability_status.$wrapper.html(
                '<div class="cal-avail-checking">Checking availability…</div>'
            );

            check_slot_availability(prac, date, time, dur, function(is_available, message) {
                set_status(message, is_available);

                var win = find_window(date, time);
                if (win && win.service_unit) dialog.set_value('service_unit', win.service_unit);

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
                        company: frappe.defaults.get_default('company')
                    }
                },
                freeze: true,
                freeze_message: 'Booking appointment…',
                callback: function(r) {
                    if (r.message) {
                        frappe.show_alert({
                            message: 'Appointment ' + r.message.name + ' booked',
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

        // Re-check whenever the date or time changes, so the status shown never goes stale.
        ['appointment_date', 'appointment_time'].forEach(function(fn) {
            var f = dialog.fields_dict[fn];
            if (f && f.$input) f.$input.on('change', function() { run_availability_check(true); });
        });

        // If a practitioner is already selected (e.g. from the filter bar),
        // auto-pull their default department so front desk doesn't have to.
        if (prefill.practitioner) {
            frappe.db.get_value('Healthcare Practitioner', prefill.practitioner, 'department')
                .then(function(r) {
                    if (r && r.message && r.message.department) {
                        dialog.set_value('department', r.message.department);
                    }
                });
        }

        // Check the prefilled slot immediately so the user sees status right away.
        run_availability_check(true);
    }

    // ── Mark Not Available dialog (creates a Leave Application) ──
    function open_leave_dialog(prefill) {
        prefill = prefill || {};

        var dialog = new frappe.ui.Dialog({
            title: 'Mark Practitioner Not Available',
            fields: [
                {
                    fieldtype: 'Link', fieldname: 'practitioner', label: 'Practitioner',
                    options: 'Healthcare Practitioner', reqd: 1,
                    default: prefill.practitioner || '',
                    description: 'Practitioner must be linked to an Employee record to be marked unavailable.'
                },
                {
                    fieldtype: 'Link', fieldname: 'leave_type', label: 'Reason / Leave Type',
                    options: 'Leave Type', reqd: 1,
                    description: 'This will be set to Approved immediately, so the day is blocked on the calendar right away — even if the record can\'t be submitted (e.g. no leave balance allocated yet).'
                },
                { fieldtype: 'Column Break' },
                {
                    fieldtype: 'Date', fieldname: 'from_date', label: 'From Date',
                    reqd: 1, default: prefill.from_date || frappe.datetime.get_today()
                },
                {
                    fieldtype: 'Date', fieldname: 'to_date', label: 'To Date',
                    reqd: 1, default: prefill.to_date || prefill.from_date || frappe.datetime.get_today()
                },
                { fieldtype: 'Check', fieldname: 'half_day', label: 'Half Day' },
                { fieldtype: 'Section Break' },
                { fieldtype: 'Small Text', fieldname: 'description', label: 'Notes' }
            ],
            primary_action_label: 'Mark Unavailable',
            primary_action: function(values) {
                frappe.db.get_value('Healthcare Practitioner', values.practitioner, 'employee')
                    .then(function(r) {
                        var employee = r && r.message && r.message.employee;
                        if (!employee) {
                            frappe.msgprint({
                                title: 'No Employee Linked',
                                message: 'This practitioner is not linked to an Employee record, so a leave cannot be created for them. Link one in the Healthcare Practitioner master first.',
                                indicator: 'red'
                            });
                            return;
                        }

                        frappe.call({
                            method: 'frappe.client.insert',
                            args: {
                                doc: {
                                    doctype: 'Leave Application',
                                    employee: employee,
                                    leave_type: values.leave_type,
                                    from_date: values.from_date,
                                    to_date: values.to_date,
                                    half_day: values.half_day,
                                    description: values.description,
                                    // Set directly rather than relying on submit()/workflow to get
                                    // here — the calendar's leave lookup keys off this field, so
                                    // this is what actually blocks the day, independent of whether
                                    // the record can be submitted (e.g. no leave balance allocated).
                                    status: 'Approved'
                                }
                            },
                            freeze: true,
                            freeze_message: 'Marking unavailable…',
                            callback: function(ir) {
                                var leave_name = ir.message && ir.message.name;
                                if (!leave_name) return;

                                // The day is already blocked on the calendar now (status is
                                // Approved). Still try to submit so the record is fully official
                                // for HR/payroll purposes — but don't treat a submit failure as
                                // blocking, since the calendar doesn't depend on it.
                                frappe.call({
                                    method: 'frappe.client.submit',
                                    args: { doc: ir.message },
                                    callback: function() {
                                        frappe.show_alert({ message: 'Marked unavailable and approved (' + leave_name + ')', indicator: 'green' });
                                        dialog.hide();
                                        load_schedule();
                                    },
                                    error: function(r) {
                                        // Most commonly this is a Leave Type requiring a prior
                                        // allocation the employee doesn't have — typical for
                                        // unplanned sick days. Surface the real reason, but make
                                        // clear the calendar is already blocked either way.
                                        var reason = '';
                                        try {
                                            var sm = r && r._server_messages && JSON.parse(r._server_messages);
                                            if (sm && sm.length) {
                                                var first = JSON.parse(sm[0]);
                                                if (first && first.message) reason = first.message;
                                            }
                                        } catch (e) { /* fall through to generic message */ }

                                        frappe.msgprint({
                                            title: 'Day Blocked — Record Left as Draft',
                                            message: leave_name + ' is Approved and this day is now blocked on the calendar.'
                                                + '<br><br>It could not also be submitted'
                                                + (reason ? ':<br><br><i>' + frappe.utils.escape_html(reason) + '</i>' : '.')
                                                + '<br><br>This usually happens when the Leave Type needs a leave balance '
                                                + 'the employee hasn\'t been allocated. It\'ll stay a Draft record until '
                                                + 'HR either allocates leave, enables <b>"Allow Negative Balance"</b> on '
                                                + 'the Leave Type, or switches it to <b>Leave Without Pay</b>.',
                                            indicator: 'orange'
                                        });
                                        dialog.hide();
                                        load_schedule();
                                    }
                                });
                            }
                        });
                    });
            }
        });

        dialog.show();
    }

    // ── Detail modal ───────────────────────────────────────────
    function show_modal(a) {
        var bg = document.createElement('div');
        bg.className = 'cal-modal-bg';
        bg.innerHTML =
            '<div class="cal-modal">' +
            '<h3>' + (a.patient_name || a.patient) + '</h3>' +
            modal_row('ID',           '<a href="/app/patient-appointment/' + a.name + '" target="_blank">' + a.name + '</a>') +
            modal_row('Status',       a.status || '—') +
            modal_row('Date',         a.appointment_date || '—') +
            modal_row('Time',         a.appointment_time || '—') +
            modal_row('Type',         a.appointment_type || '—') +
            modal_row('For',          a.appointment_for  || '—') +
            modal_row('Practitioner', a.practitioner_name || a.practitioner || '—') +
            modal_row('Department',   a.department   || '—') +
            modal_row('Service Unit', a.service_unit || '—') +
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

    function modal_row(k, v) {
        return '<div class="cal-modal-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
    }

    // ── Initial state: wait for a practitioner to be picked ─────
    show_gate_message();
};
