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

    // Practitioner is now required before the calendar loads at all.
    var current_practitioner   = null;
    // null            = not fetched yet / unknown -> don't block booking
    // {}              = practitioner has no schedule configured -> don't block booking
    // {Monday:true..} = explicit working days -> block booking on days not present
    var practitioner_schedule_days = null;

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
            .cal-view-btns { display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
            .cal-view-btn { padding: 5px 12px; border: none; background: var(--card-bg); color: var(--text-muted); cursor: pointer; font-size: 12px; }
            .cal-view-btn.active { background: var(--subtle-bg); color: var(--text-color); font-weight: 500; }
            .cal-wrap { overflow-x: auto; }
            .cal-grid { min-width: 800px; }
            .cal-head-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
            .cal-head-cell { padding: 8px 10px; font-size: 12px; font-weight: 500; color: var(--text-muted); text-align: center; border-right: 1px solid var(--border-color); }
            .cal-head-cell:last-child { border-right: none; }
            .cal-head-cell.today { color: #185FA5; font-weight: 600; }
            .cal-head-off { display: block; font-size: 10px; font-weight: 400; color: #9CA3AF; }
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
            .cal-day-col.cal-day-unavailable { background: repeating-linear-gradient(45deg, var(--subtle-bg), var(--subtle-bg) 8px, var(--card-bg) 8px, var(--card-bg) 16px); }
            .cal-day-slot { height: 52px; border-bottom: 1px solid var(--border-color); padding: 2px 4px; cursor: pointer; transition: background .1s; }
            .cal-day-slot:hover { background: var(--subtle-bg); }
            .cal-day-slot.cal-slot-off { cursor: not-allowed; }
            .cal-day-slot.cal-slot-off:hover { background: none; }
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
        if (!is_practitioner_available(from_date)) {
            frappe.msgprint({
                title: 'Not Available',
                message: (practitioner_field.get_value() || 'This practitioner') + ' is not scheduled to work on ' + frappe.datetime.str_to_user(from_date) + '. Pick a working day instead.',
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

    // ── Helpers ────────────────────────────────────────────────
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

    // Fail-open: if we don't know the schedule (not fetched, or practitioner has
    // no schedule configured at all) we don't block booking. If the practitioner
    // DOES have a schedule and the day isn't in it, booking is blocked.
    function is_practitioner_available(d) {
        if (!practitioner_schedule_days) return true;
        if (!Object.keys(practitioner_schedule_days).length) return true;
        return !!practitioner_schedule_days[get_weekday_name(d)];
    }

    var TIME_SLOTS = [
        '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
        '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
        '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'
    ];

    function time_to_slot(time_str) {
        if (!time_str) return -1;
        var parts = time_str.split(':');
        var h = parseInt(parts[0]);
        var m = parseInt(parts[1] || 0);
        var total_mins = h * 60 + m;
        var start_mins = 8 * 60;
        return Math.floor((total_mins - start_mins) / 30);
    }

    // Inverse of time_to_slot — turns a grid slot index back into "HH:MM:00"
    function slot_to_time(slot_index) {
        var total_mins = 8 * 60 + (slot_index * 30);
        var h = Math.floor(total_mins / 60);
        var m = total_mins % 60;
        return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m) + ':00';
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
        practitioner_schedule_days = null;

        if (!val) {
            show_gate_message();
            return;
        }

        document.getElementById('btn-new-appt').disabled = false;
        document.getElementById('btn-mark-unavailable').disabled = false;

        fetch_practitioner_schedule(val, function(days) {
            // ignore stale responses if the user switched practitioners meanwhile
            if (practitioner_field.get_value() !== val) return;
            practitioner_schedule_days = days;
            load_schedule();
        });
    }

    // Reads Healthcare Practitioner -> practitioner_schedules (child table) ->
    // Practitioner Schedule -> time_slots (child table, "day" field) to build
    // a { "Monday": true, ... } map of days the practitioner works.
    // NOTE: field/child-doctype names can differ slightly across ERPNext
    // Healthcare versions — adjust here if your site errors on this call.
    function fetch_practitioner_schedule(practitioner, callback) {
        frappe.call({
            method: 'frappe.client.get',
            args: { doctype: 'Healthcare Practitioner', name: practitioner },
            callback: function(r) {
                var doc = r.message;
                var rows = (doc && doc.practitioner_schedules) || [];
                var schedule_names = [];
                rows.forEach(function(row) {
                    var s = row.schedule || row.practitioner_schedule;
                    if (s && schedule_names.indexOf(s) === -1) schedule_names.push(s);
                });

                if (!schedule_names.length) { callback({}); return; }

                var days = {};
                var remaining = schedule_names.length;
                schedule_names.forEach(function(sname) {
                    frappe.call({
                        method: 'frappe.client.get',
                        args: { doctype: 'Practitioner Schedule', name: sname },
                        callback: function(sr) {
                            var sdoc = sr.message;
                            var slots = (sdoc && sdoc.time_slots) || [];
                            slots.forEach(function(ts) {
                                if (ts.day) days[ts.day] = true;
                            });
                            remaining--;
                            if (remaining === 0) callback(days);
                        },
                        error: function() {
                            remaining--;
                            if (remaining === 0) callback(days);
                        }
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
                    'patient','patient_name','company'
                ],
                filters: filters,
                limit_page_length: 500,
                order_by: 'appointment_date asc, appointment_time asc'
            },
            callback: function(r) {
                var appts = r.message || [];
                render_stats(appts, stats);
                fetch_leaves(f, t, pf, function(leaves_by_date) {
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

        // Precompute per-date availability once for this render.
        var day_available = {};
        dates.forEach(function(d) { day_available[d] = is_practitioner_available(d); });

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
            html += '<div class="cal-head-cell' + (d === today ? ' today' : '') + '">'
                + fmt_date_header(d)
                + (day_available[d] ? '' : '<span class="cal-head-off">not working</span>')
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
            var unavailable = !day_available[d];
            html += '<div class="cal-day-col' + (d === today ? ' today' : '') + (unavailable ? ' cal-day-unavailable' : '') + '">';
            TIME_SLOTS.forEach(function(ts, si) {
                html += '<div class="cal-day-slot' + (unavailable ? ' cal-slot-off' : '') + '" data-date="' + d + '" data-slot="' + si + '">';
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
        // unless the practitioner isn't scheduled to work that day.
        wrap.querySelectorAll('.cal-day-slot').forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (e.target.closest('.cal-appt')) return; // handled above
                var d  = el.dataset.date;
                var si = parseInt(el.dataset.slot, 10);

                if (!day_available[d]) {
                    frappe.msgprint({
                        title: 'Not Available',
                        message: (practitioner_field.get_value() || 'This practitioner') + ' is not scheduled to work on ' + frappe.datetime.str_to_user(d) + '.',
                        indicator: 'orange'
                    });
                    return;
                }

                open_booking_dialog({
                    appointment_date: d,
                    appointment_time: slot_to_time(si),
                    practitioner: practitioner_field.get_value()
                });
            });
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
                    options: 'Healthcare Service Unit'
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
                }
            ],
            primary_action_label: 'Book',
            primary_action: function(values) {
                // Defense-in-depth: re-check the practitioner's schedule right before
                // insert, in case the date was changed inside the dialog.
                if (values.practitioner === current_practitioner && !is_practitioner_available(values.appointment_date)) {
                    frappe.msgprint({
                        title: 'Not Available',
                        message: (values.practitioner || 'This practitioner') + ' is not scheduled to work on ' + frappe.datetime.str_to_user(values.appointment_date) + '. Please choose a working day.',
                        indicator: 'red'
                    });
                    return;
                }

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
        });

        dialog.show();

        // Live warning if the user changes the date to a day the practitioner
        // doesn't work (only meaningful when tied to the loaded practitioner).
        if (dialog.fields_dict.appointment_date && dialog.fields_dict.appointment_date.$input) {
            dialog.fields_dict.appointment_date.$input.on('change', function() {
                var d = dialog.get_value('appointment_date');
                var prac = dialog.get_value('practitioner');
                if (d && prac === current_practitioner && !is_practitioner_available(d)) {
                    dialog.set_df_property('appointment_date', 'description',
                        '⚠ ' + (prac || 'This practitioner') + ' is not scheduled to work on this day.');
                } else {
                    dialog.set_df_property('appointment_date', 'description', '');
                }
            });
        }

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
                    options: 'Leave Type', reqd: 1
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
                                    description: values.description
                                }
                            },
                            freeze: true,
                            freeze_message: 'Marking unavailable…',
                            callback: function(ir) {
                                var leave_name = ir.message && ir.message.name;
                                if (!leave_name) return;
                                // Attempt to submit so it takes effect immediately.
                                // If the company requires leave approval, this may fail —
                                // that's fine, it's saved as a pending request either way.
                                frappe.call({
                                    method: 'frappe.client.submit',
                                    args: { doc: ir.message },
                                    callback: function() {
                                        frappe.show_alert({ message: 'Marked unavailable (' + leave_name + ')', indicator: 'green' });
                                        dialog.hide();
                                        load_schedule();
                                    },
                                    error: function() {
                                        frappe.show_alert({ message: leave_name + ' saved, pending approval', indicator: 'orange' });
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