

// frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
//     var page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Daily Appointment Schedule',
//         single_column: true
//     });

//     var from_date = frappe.datetime.get_today();
//     var to_date   = frappe.datetime.get_today();

//     // ── Styles ─────────────────────────────────────────────────
//     if (!document.getElementById('cal-sched-styles')) {
//         var style = document.createElement('style');
//         style.id = 'cal-sched-styles';
//         style.textContent = `
//             .cal-page { background: var(--bg-color); padding: 0; }
//             .cal-filter-bar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); flex-wrap: wrap; }
//             .cal-filter-group { display: flex; align-items: center; gap: 6px; }
//             .cal-filter-lbl { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
//             .cal-filter-input { font-size: 12px; padding: 5px 8px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-color); }
//             .cal-filter-sep { width: 1px; height: 24px; background: var(--border-color); margin: 0 4px; }
//             .cal-stat-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; padding: 12px 16px; background: var(--subtle-bg); border-bottom: 1px solid var(--border-color); }
//             .cal-stat { background: var(--card-bg); border-radius: 8px; padding: 10px 14px; border: 1px solid var(--border-color); }
//             .cal-stat-num { font-size: 24px; font-weight: 600; }
//             .cal-stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
//             .cal-stat.s-total .cal-stat-num { color: #185FA5; }
//             .cal-stat.s-open  .cal-stat-num { color: #854F0B; }
//             .cal-stat.s-done  .cal-stat-num { color: #085041; }
//             .cal-stat.s-cancel .cal-stat-num { color: #791F1F; }
//             .cal-nav-bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); }
//             .cal-nav-btn { padding: 5px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-color); cursor: pointer; font-size: 13px; }
//             .cal-range-lbl { flex: 1; text-align: center; font-size: 14px; font-weight: 600; color: var(--text-color); }
//             .cal-view-btns { display: flex; border: 1px solid var(--border-color); border-radius: 6px; overflow: hidden; }
//             .cal-view-btn { padding: 5px 12px; border: none; background: var(--card-bg); color: var(--text-muted); cursor: pointer; font-size: 12px; }
//             .cal-view-btn.active { background: var(--subtle-bg); color: var(--text-color); font-weight: 500; }
//             .cal-wrap { overflow-x: auto; }
//             .cal-grid { min-width: 800px; }
//             .cal-head-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
//             .cal-head-cell { padding: 8px 10px; font-size: 12px; font-weight: 500; color: var(--text-muted); text-align: center; border-right: 1px solid var(--border-color); }
//             .cal-head-cell:last-child { border-right: none; }
//             .cal-head-cell.today { color: #185FA5; font-weight: 600; }
//             .cal-allday-row { display: grid; border-bottom: 1px solid var(--border-color); background: var(--card-bg); }
//             .cal-allday-lbl { padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-right: 1px solid var(--border-color); }
//             .cal-allday-cell { padding: 3px 4px; border-right: 1px solid var(--border-color); min-height: 26px; }
//             .cal-allday-cell:last-child { border-right: none; }
//             .cal-allday-block { background: #B5D4F4; color: #0C447C; border-radius: 4px; padding: 2px 6px; font-size: 10px; font-weight: 500; }
//             .cal-body-row { display: grid; }
//             .cal-time-col { background: var(--card-bg); border-right: 1px solid var(--border-color); }
//             .cal-time-slot { height: 52px; padding: 4px 8px; font-size: 10px; color: var(--text-muted); text-align: right; border-bottom: 1px solid var(--border-color); }
//             .cal-day-col { border-right: 1px solid var(--border-color); background: var(--card-bg); }
//             .cal-day-col:last-child { border-right: none; }
//             .cal-day-col.today { background: #E6F1FB; }
//             .cal-day-slot { height: 52px; border-bottom: 1px solid var(--border-color); padding: 2px 4px; }
//             .cal-appt { border-radius: 4px; padding: 2px 6px; font-size: 11px; cursor: pointer; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-bottom: 2px; }
//             .cal-appt.Open, .cal-appt.Scheduled { background: #B5D4F4; color: #0C447C; }
//             .cal-appt.Closed { background: #9FE1CB; color: #085041; }
//             .cal-appt.Cancelled { background: #F7C1C1; color: #791F1F; }
//             .cal-empty { text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 13px; }
//             .cal-modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 9998; display: flex; align-items: center; justify-content: center; }
//             .cal-modal { background: var(--card-bg); border-radius: 14px; padding: 28px; width: 440px; max-width: 95vw; z-index: 9999; }
//             .cal-modal h3 { font-size: 18px; font-weight: 600; margin-bottom: 16px; color: var(--text-color); }
//             .cal-modal-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 13px; }
//             .cal-modal-row .k { color: var(--text-muted); }
//             .cal-modal-row .v { font-weight: 500; color: var(--text-color); }
//             .cal-modal-actions { margin-top: 20px; display: flex; gap: 8px; justify-content: flex-end; }
//             .btn-cal-primary { background: #1a2340; color: #fff; border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
//             .btn-cal-ghost { background: var(--subtle-bg); color: var(--text-color); border: none; border-radius: 8px; padding: 8px 18px; font-size: 13px; cursor: pointer; }
//         `;
//         document.head.appendChild(style);
//     }

//     // ── Page skeleton with filters INSIDE the page ─────────────
//     $(wrapper).find('.layout-main-section').html(`
//         <div class="cal-page">

//             <div class="cal-filter-bar">
//                 <div class="cal-filter-group">
//                     <span class="cal-filter-lbl">From</span>
//                     <input type="date" class="cal-filter-input" id="filter-from" value="${from_date}">
//                 </div>
//                 <div class="cal-filter-group">
//                     <span class="cal-filter-lbl">To</span>
//                     <input type="date" class="cal-filter-input" id="filter-to" value="${to_date}">
//                 </div>
//                 <div class="cal-filter-sep"></div>
//                 <div class="cal-filter-group">
//                     <span class="cal-filter-lbl">Service Unit</span>
//                     <input type="text" class="cal-filter-input" id="filter-service-unit"
//                         placeholder="All service units" style="width:180px">
//                 </div>
//                 <div class="cal-filter-group">
//                     <span class="cal-filter-lbl">Practitioner</span>
//                     <input type="text" class="cal-filter-input" id="filter-practitioner"
//                         placeholder="All practitioners" style="width:180px">
//                 </div>
//                 <button class="cal-nav-btn" id="btn-apply"
//                     style="background:#1a2340;color:#fff;border-color:#1a2340;margin-left:4px">
//                     Apply
//                 </button>
//                 <button class="cal-nav-btn" id="btn-clear">Clear</button>
//             </div>

//             <div class="cal-stat-bar" id="cal-stats"></div>

//             <div class="cal-nav-bar">
//                 <button class="cal-nav-btn" id="cal-prev">&#8249;</button>
//                 <button class="cal-nav-btn" id="cal-next">&#8250;</button>
//                 <button class="cal-nav-btn" id="cal-today">today</button>
//                 <span class="cal-range-lbl" id="cal-range-lbl"></span>
//                 <div class="cal-view-btns">
//                     <button class="cal-view-btn" id="view-day">day</button>
//                     <button class="cal-view-btn active" id="view-week">week</button>
//                 </div>
//             </div>

//             <div class="cal-wrap" id="cal-wrap">
//                 <div class="cal-empty">Loading…</div>
//             </div>
//         </div>
//     `);

//     // ── Wire filter inputs ─────────────────────────────────────
//     document.getElementById('filter-from').addEventListener('change', function() {
//         from_date = this.value || frappe.datetime.get_today();
//         load_schedule();
//     });
//     document.getElementById('filter-to').addEventListener('change', function() {
//         to_date = this.value || frappe.datetime.get_today();
//         load_schedule();
//     });
//     document.getElementById('btn-apply').addEventListener('click', function() {
//         from_date = document.getElementById('filter-from').value || from_date;
//         to_date   = document.getElementById('filter-to').value   || to_date;
//         load_schedule();
//     });
//     document.getElementById('btn-clear').addEventListener('click', function() {
//         from_date = frappe.datetime.get_today();
//         to_date   = frappe.datetime.get_today();
//         document.getElementById('filter-from').value = from_date;
//         document.getElementById('filter-to').value   = to_date;
//         document.getElementById('filter-service-unit').value = '';
//         document.getElementById('filter-practitioner').value = '';
//         load_schedule();
//     });

//     // ── Nav buttons ────────────────────────────────────────────
//     document.getElementById('cal-prev').onclick = function() {
//         from_date = frappe.datetime.add_days(from_date, -7);
//         to_date   = frappe.datetime.add_days(to_date,   -7);
//         document.getElementById('filter-from').value = from_date;
//         document.getElementById('filter-to').value   = to_date;
//         load_schedule();
//     };
//     document.getElementById('cal-next').onclick = function() {
//         from_date = frappe.datetime.add_days(from_date, 7);
//         to_date   = frappe.datetime.add_days(to_date,   7);
//         document.getElementById('filter-from').value = from_date;
//         document.getElementById('filter-to').value   = to_date;
//         load_schedule();
//     };
//     document.getElementById('cal-today').onclick = function() {
//         from_date = frappe.datetime.get_today();
//         to_date   = frappe.datetime.get_today();
//         document.getElementById('filter-from').value = from_date;
//         document.getElementById('filter-to').value   = to_date;
//         load_schedule();
//     };

//     // ── Helpers ────────────────────────────────────────────────
//     function get_week_dates(start, end) {
//         var dates = [];
//         var d = start;
//         while (d <= end) { dates.push(d); d = frappe.datetime.add_days(d, 1); }
//         return dates;
//     }

//     function fmt_date_header(d) {
//         var parts = d.split('-');
//         var dt = new Date(parts[0], parts[1]-1, parts[2]);
//         var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
//         return days[dt.getDay()] + ' ' + (dt.getMonth()+1) + '/' + dt.getDate();
//     }

//     var TIME_SLOTS = [
//         '8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
//         '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM',
//         '2:00 PM','2:30 PM','3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM'
//     ];

//     function time_to_slot(time_str) {
//         if (!time_str) return -1;
//         var parts = time_str.split(':');
//         var h = parseInt(parts[0]);
//         var m = parseInt(parts[1] || 0);
//         var total_mins = h * 60 + m;
//         var start_mins = 8 * 60;
//         return Math.floor((total_mins - start_mins) / 30);
//     }

//     // ── Load data ──────────────────────────────────────────────
//     function load_schedule() {
//         var wrap  = document.getElementById('cal-wrap');
//         var stats = document.getElementById('cal-stats');
//         var lbl   = document.getElementById('cal-range-lbl');

//         wrap.innerHTML  = '<div class="cal-empty">Loading…</div>';
//         stats.innerHTML = '';

//         var f = from_date, t = to_date;
//         if (lbl) {
//             lbl.textContent = frappe.datetime.str_to_user(f)
//                 + (f !== t ? ' \u2013 ' + frappe.datetime.str_to_user(t) : '');
//         }

//         var filters = [
//             ['appointment_date', '>=', f],
//             ['appointment_date', '<=', t]
//         ];

//         var pf = (document.getElementById('filter-practitioner').value || '').trim();
//         var sf = (document.getElementById('filter-service-unit').value || '').trim();
//         if (pf) filters.push(['practitioner_name', 'like', '%' + pf + '%']);
//         if (sf) filters.push(['service_unit', 'like', '%' + sf + '%']);

//         frappe.call({
//             method: 'frappe.client.get_list',
//             args: {
//                 doctype: 'Patient Appointment',
//                 fields: [
//                     'name','status','appointment_type','appointment_for',
//                     'practitioner','practitioner_name','department',
//                     'service_unit','appointment_date','appointment_time',
//                     'patient','patient_name','company'
//                 ],
//                 filters: filters,
//                 limit_page_length: 500,
//                 order_by: 'appointment_date asc, appointment_time asc'
//             },
//             callback: function(r) {
//                 var appts = r.message || [];
//                 render_stats(appts, stats);
//                 render_calendar(appts, wrap, f, t);
//             }
//         });
//     }

//     // ── Stats bar ──────────────────────────────────────────────
//     function render_stats(appts, wrap) {
//         var total     = appts.length;
//         var open      = appts.filter(function(a) { return a.status === 'Open' || a.status === 'Scheduled'; }).length;
//         var closed    = appts.filter(function(a) { return a.status === 'Closed'; }).length;
//         var cancelled = appts.filter(function(a) { return a.status === 'Cancelled'; }).length;
//         wrap.innerHTML =
//             '<div class="cal-stat s-total"><div class="cal-stat-num">' + total    + '</div><div class="cal-stat-lbl">Total</div></div>' +
//             '<div class="cal-stat s-open"><div class="cal-stat-num">'  + open     + '</div><div class="cal-stat-lbl">Upcoming</div></div>' +
//             '<div class="cal-stat s-done"><div class="cal-stat-num">'  + closed   + '</div><div class="cal-stat-lbl">Completed</div></div>' +
//             '<div class="cal-stat s-cancel"><div class="cal-stat-num">'+ cancelled+ '</div><div class="cal-stat-lbl">Cancelled</div></div>';
//     }

//     // ── Calendar grid ──────────────────────────────────────────
//     function render_calendar(appts, wrap, f, t) {
//         var dates    = get_week_dates(f, t);
//         var today    = frappe.datetime.get_today();
//         var grid_tpl = '60px ' + dates.map(function() { return '1fr'; }).join(' ');

//         if (!appts.length) {
//             wrap.innerHTML = '<div class="cal-empty">No appointments found for this period.</div>';
//             return;
//         }

//         var by_date = {};
//         var allday  = {};
//         appts.forEach(function(a) {
//             var d    = a.appointment_date;
//             var slot = time_to_slot(a.appointment_time);
//             if (slot < 0 || slot >= TIME_SLOTS.length) {
//                 if (!allday[d]) allday[d] = [];
//                 allday[d].push(a);
//             } else {
//                 if (!by_date[d]) by_date[d] = {};
//                 if (!by_date[d][slot]) by_date[d][slot] = [];
//                 by_date[d][slot].push(a);
//             }
//         });

//         var html = '<div class="cal-grid">';

//         // Header
//         html += '<div class="cal-head-row" style="grid-template-columns:' + grid_tpl + '">';
//         html += '<div class="cal-head-cell"></div>';
//         dates.forEach(function(d) {
//             html += '<div class="cal-head-cell' + (d === today ? ' today' : '') + '">'
//                 + fmt_date_header(d) + '</div>';
//         });
//         html += '</div>';

//         // All-day row
//         html += '<div class="cal-allday-row" style="grid-template-columns:' + grid_tpl + '">';
//         html += '<div class="cal-allday-lbl">all-day</div>';
//         dates.forEach(function(d) {
//             html += '<div class="cal-allday-cell">';
//             if (allday[d]) {
//                 allday[d].forEach(function(a) {
//                     html += '<div class="cal-allday-block">'
//                         + (a.patient_name || a.patient || '—')
//                         + (a.service_unit ? ' \u2022 ' + a.service_unit : '')
//                         + '</div>';
//                 });
//             }
//             html += '</div>';
//         });
//         html += '</div>';

//         // Body grid
//         html += '<div class="cal-body-row" style="display:grid;grid-template-columns:' + grid_tpl + '">';
//         html += '<div class="cal-time-col">';
//         TIME_SLOTS.forEach(function(ts) {
//             html += '<div class="cal-time-slot">' + ts + '</div>';
//         });
//         html += '</div>';

//         dates.forEach(function(d) {
//             html += '<div class="cal-day-col' + (d === today ? ' today' : '') + '">';
//             TIME_SLOTS.forEach(function(ts, si) {
//                 html += '<div class="cal-day-slot">';
//                 if (by_date[d] && by_date[d][si]) {
//                     by_date[d][si].forEach(function(a) {
//                         var status_class = (a.status || 'Open').replace(' ', '');
//                         html += '<div class="cal-appt ' + status_class + '" data-name="' + a.name + '">'
//                             + (a.appointment_time ? a.appointment_time.substring(0,5) + ' ' : '')
//                             + (a.patient_name || a.patient || '—')
//                             + '</div>';
//                     });
//                 }
//                 html += '</div>';
//             });
//             html += '</div>';
//         });

//         html += '</div></div>';
//         wrap.innerHTML = html;

//         wrap.querySelectorAll('.cal-appt[data-name]').forEach(function(el) {
//             el.addEventListener('click', function() {
//                 var a = appts.find(function(x) { return x.name === el.dataset.name; });
//                 if (a) show_modal(a);
//             });
//         });
//     }

//     // ── Detail modal ───────────────────────────────────────────
//     function show_modal(a) {
//         var bg = document.createElement('div');
//         bg.className = 'cal-modal-bg';
//         bg.innerHTML =
//             '<div class="cal-modal">' +
//             '<h3>' + (a.patient_name || a.patient) + '</h3>' +
//             modal_row('ID',           '<a href="/app/patient-appointment/' + a.name + '" target="_blank">' + a.name + '</a>') +
//             modal_row('Status',       a.status || '—') +
//             modal_row('Date',         a.appointment_date || '—') +
//             modal_row('Time',         a.appointment_time || '—') +
//             modal_row('Type',         a.appointment_type || '—') +
//             modal_row('For',          a.appointment_for  || '—') +
//             modal_row('Practitioner', a.practitioner_name || a.practitioner || '—') +
//             modal_row('Department',   a.department   || '—') +
//             modal_row('Service Unit', a.service_unit || '—') +
//             '<div class="cal-modal-actions">' +
//             '<button class="btn-cal-ghost" id="mc">Close</button>' +
//             '<button class="btn-cal-primary" id="mo">Open Record</button>' +
//             '</div></div>';
//         document.body.appendChild(bg);
//         bg.querySelector('#mc').onclick = function() { bg.remove(); };
//         bg.querySelector('#mo').onclick = function() {
//             frappe.set_route('Form', 'Patient Appointment', a.name);
//             bg.remove();
//         };
//         bg.addEventListener('click', function(e) { if (e.target === bg) bg.remove(); });
//     }

//     function modal_row(k, v) {
//         return '<div class="cal-modal-row"><span class="k">' + k + '</span><span class="v">' + v + '</span></div>';
//     }

//     // ── Initial load ───────────────────────────────────────────
//     load_schedule();
// };


frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Daily Appointment Schedule',
        single_column: true
    });

    var from_date = frappe.datetime.get_today();
    var to_date   = frappe.datetime.get_today();

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
            .cal-filter-link-wrap { min-width: 200px; }
            .cal-filter-link-wrap .form-group { margin: 0 !important; }
            .cal-filter-link-wrap .control-label { display: none !important; }
            .cal-filter-link-wrap .form-control { font-size: 12px !important; padding: 5px 8px !important; border: 1px solid var(--border-color) !important; border-radius: 6px !important; height: 30px !important; }
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
            .cal-day-slot { height: 52px; border-bottom: 1px solid var(--border-color); padding: 2px 4px; }
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
                    <span class="cal-filter-lbl">Service Unit</span>
                    <div id="wrap-service-unit" class="cal-filter-link-wrap"></div>
                </div>
                <div class="cal-filter-group">
                    <span class="cal-filter-lbl">Practitioner</span>
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
            </div>

            <div class="cal-wrap" id="cal-wrap">
                <div class="cal-empty">Loading…</div>
            </div>
        </div>
    `);

    // ── Build Frappe Link fields for Service Unit and Practitioner ──
    var service_unit_field = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            fieldname: 'service_unit_filter',
            options:   'Healthcare Service Unit',
            placeholder: 'All service units'
        },
        parent: document.getElementById('wrap-service-unit'),
        render_input: true
    });
    service_unit_field.refresh();
    service_unit_field.$input.on('change', function() { load_schedule(); });

    var practitioner_field = frappe.ui.form.make_control({
        df: {
            fieldtype: 'Link',
            fieldname: 'practitioner_filter',
            options:   'Healthcare Practitioner',
            placeholder: 'All practitioners'
        },
        parent: document.getElementById('wrap-practitioner'),
        render_input: true
    });
    practitioner_field.refresh();
    practitioner_field.$input.on('change', function() { load_schedule(); });

    // ── Wire date inputs ───────────────────────────────────────
    document.getElementById('filter-from').addEventListener('change', function() {
        from_date = this.value || frappe.datetime.get_today();
        load_schedule();
    });
    document.getElementById('filter-to').addEventListener('change', function() {
        to_date = this.value || frappe.datetime.get_today();
        load_schedule();
    });
    document.getElementById('btn-apply').addEventListener('click', function() {
        from_date = document.getElementById('filter-from').value || from_date;
        to_date   = document.getElementById('filter-to').value   || to_date;
        load_schedule();
    });
    document.getElementById('btn-clear').addEventListener('click', function() {
        from_date = frappe.datetime.get_today();
        to_date   = frappe.datetime.get_today();
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        service_unit_field.set_value('');
        practitioner_field.set_value('');
        load_schedule();
    });

    // ── Nav buttons ────────────────────────────────────────────
    document.getElementById('cal-prev').onclick = function() {
        from_date = frappe.datetime.add_days(from_date, -7);
        to_date   = frappe.datetime.add_days(to_date,   -7);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        load_schedule();
    };
    document.getElementById('cal-next').onclick = function() {
        from_date = frappe.datetime.add_days(from_date, 7);
        to_date   = frappe.datetime.add_days(to_date,   7);
        document.getElementById('filter-from').value = from_date;
        document.getElementById('filter-to').value   = to_date;
        load_schedule();
    };
    document.getElementById('cal-today').onclick = function() {
        from_date = frappe.datetime.get_today();
        to_date   = frappe.datetime.get_today();
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

    // ── Load data ──────────────────────────────────────────────
    function load_schedule() {
        var wrap  = document.getElementById('cal-wrap');
        var stats = document.getElementById('cal-stats');
        var lbl   = document.getElementById('cal-range-lbl');

        wrap.innerHTML  = '<div class="cal-empty">Loading…</div>';
        stats.innerHTML = '';

        var f = from_date, t = to_date;
        if (lbl) {
            lbl.textContent = frappe.datetime.str_to_user(f)
                + (f !== t ? ' \u2013 ' + frappe.datetime.str_to_user(t) : '');
        }

        var filters = [
            ['appointment_date', '>=', f],
            ['appointment_date', '<=', t]
        ];

        // ── Read values from Frappe Link fields ────────────────
        var pf = practitioner_field.get_value();
        var sf = service_unit_field.get_value();
        if (pf) filters.push(['practitioner', '=', pf]);
        if (sf) filters.push(['service_unit', '=', sf]);

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
                render_calendar(appts, wrap, f, t);
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
            wrap.innerHTML = '<div class="cal-empty">No appointments found for this period.</div>';
            return;
        }

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
                + fmt_date_header(d) + '</div>';
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
            html += '<div class="cal-day-col' + (d === today ? ' today' : '') + '">';
            TIME_SLOTS.forEach(function(ts, si) {
                html += '<div class="cal-day-slot">';
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

        wrap.querySelectorAll('.cal-appt[data-name]').forEach(function(el) {
            el.addEventListener('click', function() {
                var a = appts.find(function(x) { return x.name === el.dataset.name; });
                if (a) show_modal(a);
            });
        });
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

    // ── Initial load ───────────────────────────────────────────
    load_schedule();
};