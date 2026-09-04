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

    // practitioner_duty_by_date shapes:
    //   null            -> not fetched yet / lookup failed -> fail CLOSED (nothing is bookable
    //                       until we successfully know the practitioner's duty assignments)
    //   {}               -> practitioner has no Duty Assignment rows at all in the loaded
    //                       date range -> fail CLOSED (calendar shows "no duty assignment")
    //   { "YYYY-MM-DD": { branch, day_name }, ... } -> one entry per date we found in the
    //                       loaded range. An empty `branch` means Clinical Management has
    //                       explicitly marked the practitioner not available that date —
    //                       it still counts as "we have data for this date", just not bookable.
    var practitioner_duty_by_date = null;

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
            /* Non-bookable slot: the whole day is not a working day per Duty Assignment */
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
            .cal-slot-pick { min-width: 64px; }
            .cal-slot-pick:hover { background: var(--subtle-bg); }
        `;
        document.head.appendChild(style);
    }

    // ── Page skeleton ──────────────────────────────────────────
    // Note: Service Unit filter removed. Practitioner filter is now required.
    // Note: "Mark Not Available" button removed — availability now comes purely
    // from Duty Assignment (see fetch_practitioner_duty below).
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
                <button class="cal-nav-btn" id="btn-new-appt"
                    style="margin-left:auto;background:#1a2340;color:#fff;border-color:#1a2340;" disabled>
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
    // Instead of assuming from_date/09:00 is free, pull the day's actual
    // available slots and make the user pick one — this is what feeds the
    // booking dialog, so nothing gets pre-filled with a time that's already taken.
    document.getElementById('btn-new-appt').addEventListener('click', function() {
        var prac = practitioner_field.get_value();
        if (!prac) {
            frappe.msgprint({ message: 'Please select a Healthcare Practitioner first.', indicator: 'orange' });
            return;
        }
        open_slot_picker(from_date, prac);
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

    // ── Time-slot grid ───────────────────────────────────────────
    // Duty Assignment only tells us WHICH dates a practitioner is on duty (via
    // the branch_schedule_assignment child table), not what hours they work —
    // there's no from/to time on that child table. So the displayed grid is
    // always this fixed 8:00–17:30 / 30-min ladder; bookability is decided at
    // the whole-day level (see is_day_working), not per time slot on the grid.
    // Actual per-slot availability (accounting for already-booked appointments)
    // is computed on demand by fetch_available_slots() when the user goes to book.
    var SLOT_MINUTES = 30;
    var TIME_SLOTS = [];         // display labels, e.g. "09:00"
    var TIME_SLOT_MINUTES = [];  // parallel array of minutes-from-midnight for each row

    function build_time_slots() {
        var minutes = [];
        for (var mm = 8 * 60; mm < 17 * 60 + 30; mm += SLOT_MINUTES) minutes.push(mm);
        TIME_SLOT_MINUTES = minutes;
        TIME_SLOTS = minutes.map(format_time_label);
    }
    build_time_slots();

    // Floor bucket, not exact match — practitioners can have different
    // appointment durations (some under 30 min), so a real appointment time
    // won't always land exactly on a 30-min tick (e.g. a 15-min-duration
    // doctor's 09:15 slot). This places it in the row it visually falls
    // under (09:00) instead of dumping it into the all-day row. Only times
    // before the grid starts (8:00) fall back to all-day.
    function time_to_slot(time_str) {
        if (!time_str) return -1;
        var mins = time_str_to_minutes(time_str);
        var idx = -1;
        for (var i = 0; i < TIME_SLOT_MINUTES.length; i++) {
            if (TIME_SLOT_MINUTES[i] <= mins) idx = i; else break;
        }
        return idx;
    }

    function slot_to_time(slot_index) {
        var total_mins = TIME_SLOT_MINUTES[slot_index];
        if (total_mins === undefined) total_mins = 0;
        var h = Math.floor(total_mins / 60), m = total_mins % 60;
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':00';
    }

    // The Duty Assignment entry (if any) for this date — carries the Branch
    // the practitioner is assigned to work that day.
    function get_duty_for_date(date) {
        return (practitioner_duty_by_date && practitioner_duty_by_date[date]) || null;
    }

    // Is the practitioner scheduled to work AT ALL on this date? Fails CLOSED:
    // if we don't have duty data loaded, there's no Duty Assignment row for this
    // date, or the row's Branch is empty (that's how Clinical Management marks a
    // practitioner not available that day), the day is not bookable. We never
    // guess "available" when the duty data is unknown, missing, or blank.
    function is_day_working(date) {
        if (!practitioner_duty_by_date) return false;
        var rec = practitioner_duty_by_date[date];
        return !!(rec && rec.branch);
    }

    // No time-of-day granularity exists in Duty Assignment, so a slot is
    // bookable exactly when its day is.
    function is_slot_bookable(date, time_str, duration) {
        return is_day_working(date);
    }

    // Day-level bookability that drives the brown/non-bookable column treatment.
    function is_day_bookable(date) {
        return is_day_working(date);
    }

    // Pull the practitioner's actual free slots for a date, at whatever
    // appointment duration this booking needs — durations aren't fixed at
    // 30 min and differ from doctor to doctor (can be shorter), so the slot
    // spacing itself is driven by `duration`, not a hardcoded constant.
    // Bounds still come from the 8:00–17:30 working window; drops the whole
    // day if it's not a working day per Duty Assignment; then removes any
    // candidate slot that would overlap an existing non-cancelled
    // appointment (which may itself have a different duration). Returns:
    //   null        -> couldn't verify against the server (network/API error) —
    //                  fail CLOSED, caller should not offer any slot as bookable.
    //   []          -> day not working, or working but fully booked at this duration.
    //   [minutes,…] -> free slot start times (minutes from midnight), ascending.
    function fetch_available_slots(practitioner, date, duration, callback) {
        duration = parseInt(duration, 10);
        if (!duration || duration <= 0) duration = 15;
        if (!is_day_working(date)) { callback([]); return; }

        var day_start = TIME_SLOT_MINUTES[0];
        var day_end   = TIME_SLOT_MINUTES[TIME_SLOT_MINUTES.length - 1] + SLOT_MINUTES; // 17:30

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
                var busy = existing.map(function(a) {
                    var s = time_str_to_minutes(a.appointment_time);
                    return { start: s, end: s + (a.duration || 15) };
                });
                var free = [];
                for (var mins = day_start; mins + duration <= day_end; mins += duration) {
                    var slot_end = mins + duration;
                    var clash = busy.some(function(b) { return mins < b.end && b.start < slot_end; });
                    if (!clash) free.push(mins);
                }
                callback(free);
            },
            error: function() { callback(null); } // couldn't verify — fail closed, never guess "free"
        });
    }

    // ── Practitioner selection gate ───────────────────────────────
    function show_gate_message() {
        document.getElementById('cal-wrap').innerHTML =
            '<div class="cal-empty">Select a Healthcare Practitioner above to view their schedule.</div>';
        document.getElementById('cal-stats').innerHTML = '';
        document.getElementById('cal-range-lbl').textContent = '';
        document.getElementById('btn-new-appt').disabled = true;
    }

    function on_practitioner_changed() {
        var val = practitioner_field.get_value();
        current_practitioner = val || null;
        practitioner_duty_by_date = null;

        if (!val) {
            show_gate_message();
            return;
        }

        document.getElementById('btn-new-appt').disabled = true; // re-enabled once we know duty data
        load_schedule();
    }

    // Reads Duty Assignment doctype filtered by healthcare_practitioner -> each
    // matching document's "branch_schedule_assignment" child table (Duty Child
    // Table: date / day_name / branch) -> keeps only rows whose date falls in
    // the currently loaded range, building:
    //   { "YYYY-MM-DD": { branch, day_name }, ... }
    // Clinical Management leaves `branch` empty on a row to mark the
    // practitioner not available that date — that row still lands in the map,
    // just with an empty branch (see is_day_working).
    function fetch_practitioner_duty(practitioner, from_date, to_date, callback) {
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
                if (!rows.length) { callback({}); return; }

                var duty_by_date = {};
                var remaining = rows.length;

                function done() {
                    remaining--;
                    if (remaining === 0) callback(duty_by_date);
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
                                if (c.date < from_date || c.date > to_date) return;
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
                // Couldn't read the practitioner's duty assignments — fail closed
                // (never guess "available").
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

                fetch_practitioner_duty(pf, f, t, function(duty_by_date) {
                    // ignore stale responses if the user switched practitioner/dates meanwhile
                    if (practitioner_field.get_value() !== pf || from_date !== f || to_date !== t) return;

                    practitioner_duty_by_date = duty_by_date;

                    // Couldn't determine duty data at all (lookup failed) — don't
                    // guess either way, say so and offer a retry.
                    if (!practitioner_duty_by_date) {
                        wrap.innerHTML =
                            '<div class="cal-empty">Couldn\'t load this practitioner\'s duty assignment.'
                            + '<br><button class="cal-nav-btn" id="btn-retry-schedule" style="margin-top:10px">Retry</button></div>';
                        document.getElementById('btn-new-appt').disabled = true;
                        var retry_btn = document.getElementById('btn-retry-schedule');
                        if (retry_btn) retry_btn.addEventListener('click', load_schedule);
                        return;
                    }

                    // No Duty Assignment rows found for this practitioner within
                    // the selected date range.
                    if (!Object.keys(practitioner_duty_by_date).length) {
                        wrap.innerHTML =
                            '<div class="cal-empty">No Duty Assignment found for this practitioner in the selected date range.<br>'
                            + 'Add a Duty Assignment (with a Branch set for each working date) to make them bookable.</div>';
                        document.getElementById('btn-new-appt').disabled = true;
                        return;
                    }

                    document.getElementById('btn-new-appt').disabled = false;
                    render_calendar(appts, wrap, f, t);
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
    function render_calendar(appts, wrap, f, t) {
        var dates    = get_week_dates(f, t);
        var today    = frappe.datetime.get_today();
        var grid_tpl = '60px ' + dates.map(function() { return '1fr'; }).join(' ');

        if (!appts.length) {
            // still render an empty grid so the user can click a slot to book
            appts = [];
        }

        // Per-date bookability, computed once for this render and reused by both
        // the markup and the click handlers below. Comes straight from Duty
        // Assignment: working that date + non-empty Branch = bookable.
        var day_working = {};
        dates.forEach(function(d) { day_working[d] = is_day_bookable(d); });

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
            var off_label = day_working[d] ? '' : 'not working';
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
                var bookable = day_working[d];
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

        // Click an empty slot → instead of assuming that exact 30-min row is
        // free (it might already be taken, or the practitioner's real working
        // hours that day might be narrower than the display grid), pull the
        // day's actual open slots and let the user pick one. This is what was
        // letting people book times that were already spoken for.
        wrap.querySelectorAll('.cal-day-slot').forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (e.target.closest('.cal-appt')) return; // handled above
                var d = el.dataset.date;

                if (!day_working[d]) {
                    var prac_label = practitioner_field.get_value() || 'This practitioner';
                    frappe.msgprint({
                        title: 'Not Available',
                        message: prac_label + ' is not scheduled to work on ' + frappe.datetime.str_to_user(d) + '.',
                        indicator: 'orange'
                    });
                    return;
                }

                open_slot_picker(d, practitioner_field.get_value());
            });
        });
    }

    // ── Slot picker: shows only the times that are actually free ─────────
    // Fetches available slots for the date (day-open check + clash check
    // against existing non-cancelled appointments) and renders them as
    // clickable buttons. Only a slot the user explicitly picks from this
    // list is passed on to the booking dialog — nothing is auto-filled.
    function open_slot_picker(date, practitioner) {
        if (!practitioner) {
            frappe.msgprint({ message: 'Please select a Healthcare Practitioner first.', indicator: 'orange' });
            return;
        }
        if (!is_day_working(date)) {
            frappe.msgprint({
                title: 'Not Available',
                message: practitioner + ' is not scheduled to work on ' + frappe.datetime.str_to_user(date) + '.',
                indicator: 'orange'
            });
            return;
        }

        var picker = new frappe.ui.Dialog({
            title: 'Select an Available Time — ' + frappe.datetime.str_to_user(date),
            fields: [
                {
                    fieldtype: 'Int', fieldname: 'duration', label: 'Duration (mins)',
                    default: 15,
                    description: 'How long this appointment needs — slots below are spaced to match.'
                },
                { fieldtype: 'HTML', fieldname: 'slot_list' }
            ]
        });
        picker.show();

        function render_slots() {
            var duration = picker.get_value('duration') || 15;
            picker.fields_dict.slot_list.$wrapper.html('<div class="cal-avail-checking">Loading available slots…</div>');

            fetch_available_slots(practitioner, date, duration, function(slots) {
                // Bail if the duration was changed again while this call was in flight.
                if (duration !== (picker.get_value('duration') || 15)) return;

                if (slots === null) {
                    picker.fields_dict.slot_list.$wrapper.html(
                        '<div class="cal-avail-box cal-avail-bad">Couldn\'t load availability for this date. Please close this and try again.</div>'
                    );
                    return;
                }
                if (!slots.length) {
                    picker.fields_dict.slot_list.$wrapper.html(
                        '<div class="cal-avail-box cal-avail-bad">No open ' + duration + '-min slots left for ' + practitioner + ' on ' + frappe.datetime.str_to_user(date) + '.</div>'
                    );
                    return;
                }

                var html = '<div style="display:flex;flex-wrap:wrap;gap:8px;">';
                slots.forEach(function(mins) {
                    html += '<button type="button" class="cal-nav-btn cal-slot-pick" data-mins="' + mins + '">'
                        + format_time_label(mins) + '</button>';
                });
                html += '</div>';
                picker.fields_dict.slot_list.$wrapper.html(html);

                picker.fields_dict.slot_list.$wrapper.find('.cal-slot-pick').on('click', function() {
                    var mins = parseInt($(this).data('mins'), 10);
                    var time_str = format_time_label(mins) + ':00';
                    var duty = get_duty_for_date(date);
                    picker.hide();
                    open_booking_dialog({
                        appointment_date: date,
                        appointment_time: time_str,
                        practitioner: practitioner,
                        duration: duration,
                        service_unit: duty ? duty.branch : ''
                    });
                });
            });
        }

        var dur_field = picker.fields_dict.duration;
        if (dur_field && dur_field.$input) dur_field.$input.on('change', render_slots);

        render_slots();
    }

    // ── Availability check (mirrors the standard Patient Appointment booking flow) ──
    // Healthcare's own `get_availability_data(date, appointment)` is designed to be
    // called against an existing/in-progress Patient Appointment document (that's
    // where it pulls the practitioner from), so it isn't usable for a pre-insert
    // check against a bare practitioner + date/time. Instead this reproduces the
    // checks that matter here: the practitioner's Duty Assignment for that date,
    // and clashes with existing appointments — both run BEFORE the record is
    // inserted, so a bad slot never reaches insert. This runs again right before
    // Book even though the slot picker already only offered free times, because
    // time can pass (or another booking can land) between picking a slot and
    // clicking Book.
    function check_slot_availability(practitioner, date, time_str, duration, callback) {
        if (!is_slot_bookable(date, time_str, duration)) {
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

        var dialog = new frappe.ui.Dialog({
            title: 'Book Appointment',
            fields: [
                {
                    fieldtype: 'Link', fieldname: 'patient', label: 'Patient',
                    options: 'Patient', reqd: 1
                },
                {
                    // Tied to the practitioner selected in the calendar filter, since
                    // that's whose duty assignment/availability we've already loaded.
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
                    // Comes from the slot picker (an actually-free slot at the time it
                    // was fetched), but stays editable — if the user changes it, the
                    // change listener below re-runs the availability check, and Book
                    // re-validates one more time right before insert.
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
                { fieldtype: 'HTML', fieldname: 'availability_status' }
            ],
            secondary_action_label: 'Check Availability',
            secondary_action: function() { run_availability_check(true); },
            primary_action_label: 'Book',
            primary_action: function(values) {
                // Final check right before insert — the slot picker already only
                // offered open times, but this guards against staleness (another
                // booking landing in the meantime) or a manually-edited time.
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

                var duty = get_duty_for_date(date);
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