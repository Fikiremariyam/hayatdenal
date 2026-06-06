// frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Daily Appointment Schedule',
// 		single_column: true
// 	});

// 	// ── Date picker in toolbar ──────────────────────────────────────────────
// 	let selected_date = frappe.datetime.get_today();

// 	page.add_field({
// 		fieldname: 'schedule_date',
// 		label: 'Date',
// 		fieldtype: 'Date',
// 		default: selected_date,
// 		change() {
// 			selected_date = this.get_value() || frappe.datetime.get_today();
// 			load_schedule(selected_date);
// 		}
// 	});

// 	page.add_field({
// 		fieldname: 'practitioner_filter',
// 		label: 'Practitioner',
// 		fieldtype: 'Link',
// 		options: 'Healthcare Practitioner',
// 		change() {
// 			load_schedule(selected_date);
// 		}
// 	});

// 	// ── Inject styles ────────────────────────────────────────────────────────
// 	if (!document.getElementById('appt-sched-styles')) {
// 		const style = document.createElement('style');
// 		style.id = 'appt-sched-styles';
// 		style.textContent = `
// 			@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

// 			.appt-page {
// 				font-family: 'DM Sans', sans-serif;
// 				padding: 24px;
// 				background: #f5f7fa;
// 				min-height: 100vh;
// 			}

// 			/* ── Summary bar ── */
// 			.appt-summary {
// 				display: flex;
// 				gap: 16px;
// 				margin-bottom: 28px;
// 				flex-wrap: wrap;
// 			}
// 			.appt-stat {
// 				background: #fff;
// 				border-radius: 14px;
// 				padding: 18px 24px;
// 				flex: 1;
// 				min-width: 140px;
// 				box-shadow: 0 1px 4px rgba(0,0,0,.07);
// 				border-left: 4px solid transparent;
// 			}
// 			.appt-stat.total  { border-color: #4f8ef7; }
// 			.appt-stat.open   { border-color: #f7a44f; }
// 			.appt-stat.done   { border-color: #52c794; }
// 			.appt-stat.cancel { border-color: #f26e6e; }
// 			.appt-stat .num {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 32px;
// 				line-height: 1;
// 				color: #1a1e2e;
// 			}
// 			.appt-stat .lbl {
// 				font-size: 12px;
// 				color: #8892a4;
// 				margin-top: 4px;
// 				text-transform: uppercase;
// 				letter-spacing: .06em;
// 			}

// 			/* ── Practitioner columns ── */
// 			.appt-columns {
// 				display: flex;
// 				gap: 18px;
// 				overflow-x: auto;
// 				padding-bottom: 12px;
// 			}
// 			.appt-col {
// 				background: #fff;
// 				border-radius: 16px;
// 				flex: 0 0 320px;
// 				box-shadow: 0 1px 6px rgba(0,0,0,.08);
// 				overflow: hidden;
// 			}
// 			.appt-col-header {
// 				padding: 16px 20px;
// 				background: linear-gradient(135deg, #1a2340 0%, #2c3a6e 100%);
// 				color: #fff;
// 			}
// 			.appt-col-header .pract-name {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 17px;
// 				font-weight: 600;
// 			}
// 			.appt-col-header .pract-dept {
// 				font-size: 12px;
// 				opacity: .7;
// 				margin-top: 2px;
// 			}
// 			.appt-col-header .pract-count {
// 				float: right;
// 				background: rgba(255,255,255,.18);
// 				border-radius: 20px;
// 				padding: 2px 10px;
// 				font-size: 12px;
// 				font-weight: 600;
// 				margin-top: 2px;
// 			}
// 			.appt-col-body {
// 				padding: 12px;
// 				max-height: 70vh;
// 				overflow-y: auto;
// 			}

// 			/* ── Appointment card ── */
// 			.appt-card {
// 				border-radius: 12px;
// 				padding: 14px 16px;
// 				margin-bottom: 10px;
// 				background: #f9fafc;
// 				border: 1px solid #eaecf2;
// 				cursor: pointer;
// 				transition: box-shadow .18s, transform .18s;
// 				position: relative;
// 			}
// 			.appt-card:hover {
// 				box-shadow: 0 4px 16px rgba(79,142,247,.15);
// 				transform: translateY(-1px);
// 			}
// 			.appt-card .status-dot {
// 				width: 9px; height: 9px;
// 				border-radius: 50%;
// 				display: inline-block;
// 				margin-right: 6px;
// 				vertical-align: middle;
// 			}
// 			.appt-card .appt-time {
// 				font-size: 12px;
// 				font-weight: 600;
// 				color: #4f8ef7;
// 				margin-bottom: 6px;
// 				display: flex;
// 				align-items: center;
// 			}
// 			.appt-card .appt-patient {
// 				font-size: 15px;
// 				font-weight: 600;
// 				color: #1a1e2e;
// 				margin-bottom: 2px;
// 			}
// 			.appt-card .appt-type {
// 				font-size: 12px;
// 				color: #8892a4;
// 				margin-bottom: 8px;
// 			}
// 			.appt-card .appt-meta {
// 				display: flex;
// 				gap: 8px;
// 				flex-wrap: wrap;
// 			}
// 			.appt-tag {
// 				font-size: 11px;
// 				padding: 2px 8px;
// 				border-radius: 20px;
// 				font-weight: 500;
// 				background: #eef2ff;
// 				color: #4f8ef7;
// 			}
// 			.appt-tag.hygiene { background: #e8f8f1; color: #27ae73; }
// 			.appt-tag.status-Open, .appt-tag.status-Scheduled { background: #fff4e6; color: #d97706; }
// 			.appt-tag.status-Closed { background: #e8f8f1; color: #27ae73; }
// 			.appt-tag.status-Cancelled { background: #fde8e8; color: #dc2626; }

// 			/* ── Empty / loading states ── */
// 			.appt-empty {
// 				text-align: center;
// 				padding: 40px 20px;
// 				color: #b0bac8;
// 				font-size: 13px;
// 			}
// 			.appt-empty svg { margin-bottom: 12px; opacity: .4; }
// 			.appt-loading {
// 				text-align: center;
// 				padding: 40px;
// 				color: #b0bac8;
// 			}

// 			/* ── Modal overlay ── */
// 			.appt-modal-backdrop {
// 				position: fixed; inset: 0;
// 				background: rgba(10,14,30,.45);
// 				z-index: 9998;
// 				display: flex; align-items: center; justify-content: center;
// 			}
// 			.appt-modal {
// 				background: #fff;
// 				border-radius: 20px;
// 				padding: 32px;
// 				width: 460px;
// 				max-width: 95vw;
// 				box-shadow: 0 20px 60px rgba(0,0,0,.18);
// 				z-index: 9999;
// 				animation: modalIn .22s ease;
// 			}
// 			@keyframes modalIn {
// 				from { opacity:0; transform:scale(.95) translateY(8px); }
// 				to   { opacity:1; transform:scale(1)  translateY(0);   }
// 			}
// 			.appt-modal h2 {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 22px;
// 				color: #1a1e2e;
// 				margin-bottom: 20px;
// 			}
// 			.appt-modal-row {
// 				display: flex;
// 				justify-content: space-between;
// 				padding: 10px 0;
// 				border-bottom: 1px solid #f0f2f7;
// 				font-size: 14px;
// 			}
// 			.appt-modal-row .key { color: #8892a4; }
// 			.appt-modal-row .val { font-weight: 600; color: #1a1e2e; }
// 			.appt-modal-actions {
// 				margin-top: 24px;
// 				display: flex;
// 				gap: 10px;
// 				justify-content: flex-end;
// 			}
// 			.btn-appt-primary {
// 				background: #1a2340; color: #fff;
// 				border: none; border-radius: 10px;
// 				padding: 9px 20px; font-size: 14px;
// 				cursor: pointer; font-family: 'DM Sans', sans-serif;
// 				transition: background .18s;
// 			}
// 			.btn-appt-primary:hover { background: #2c3a6e; }
// 			.btn-appt-ghost {
// 				background: #f0f2f7; color: #1a1e2e;
// 				border: none; border-radius: 10px;
// 				padding: 9px 20px; font-size: 14px;
// 				cursor: pointer; font-family: 'DM Sans', sans-serif;
// 			}
// 		`;
// 		document.head.appendChild(style);
// 	}

// 	// ── Build page skeleton ────────────────────────────────────────────────
// 	$(wrapper).find('.layout-main-section').html(`
// 		<div class="appt-page">
// 			<div class="appt-summary" id="appt-summary"></div>
// 			<div class="appt-columns" id="appt-columns">
// 				<div class="appt-loading">Loading schedule…</div>
// 			</div>
// 		</div>
// 	`);

// 	// ── Status helpers ──────────────────────────────────────────────────────
// 	const STATUS_COLOR = {
// 		'Open':      '#f7a44f',
// 		'Scheduled': '#f7a44f',
// 		'Closed':    '#52c794',
// 		'Cancelled': '#f26e6e',
// 	};

// 	function status_dot(status) {
// 		const c = STATUS_COLOR[status] || '#ccc';
// 		return `<span class="status-dot" style="background:${c}"></span>`;
// 	}

// 	// ── Load data ────────────────────────────────────────────────────────────
// 	function load_schedule(date) {
// 		const col_wrap  = document.getElementById('appt-columns');
// 		const sum_wrap  = document.getElementById('appt-summary');
// 		col_wrap.innerHTML = '<div class="appt-loading">Loading…</div>';
// 		sum_wrap.innerHTML = '';

// 		const filters = [['appointment_date', '=', date]];
// 		const practitioner_filter = page.fields_dict.practitioner_filter.get_value();
// 		if (practitioner_filter) {
// 			filters.push(['practitioner', '=', practitioner_filter]);
// 		}

// 		frappe.call({
// 			method: 'frappe.client.get_list',
// 			args: {
// 				doctype: 'Patient Appointment',
// 				fields: [
// 					'name', 'title', 'status', 'appointment_type',
// 					'appointment_for', 'practitioner', 'practitioner_name',
// 					'department', 'service_unit', 'appointment_date',
// 					'patient', 'patient_name', 'company'
// 				],
// 				filters: filters,
// 				limit_page_length: 200,
// 				order_by: 'appointment_date asc'
// 			},
// 			callback(r) {
// 				const appts = r.message || [];
// 				render_summary(appts, sum_wrap);
// 				render_columns(appts, col_wrap);
// 			}
// 		});
// 	}

// 	// ── Summary bar ─────────────────────────────────────────────────────────
// 	function render_summary(appts, wrap) {
// 		const total    = appts.length;
// 		const open     = appts.filter(a => ['Open','Scheduled'].includes(a.status)).length;
// 		const closed   = appts.filter(a => a.status === 'Closed').length;
// 		const cancelled= appts.filter(a => a.status === 'Cancelled').length;

// 		wrap.innerHTML = `
// 			<div class="appt-stat total">
// 				<div class="num">${total}</div>
// 				<div class="lbl">Total Appointments</div>
// 			</div>
// 			<div class="appt-stat open">
// 				<div class="num">${open}</div>
// 				<div class="lbl">Upcoming / Open</div>
// 			</div>
// 			<div class="appt-stat done">
// 				<div class="num">${closed}</div>
// 				<div class="lbl">Completed</div>
// 			</div>
// 			<div class="appt-stat cancel">
// 				<div class="num">${cancelled}</div>
// 				<div class="lbl">Cancelled</div>
// 			</div>
// 		`;
// 	}

// 	// ── Practitioner columns ─────────────────────────────────────────────────
// 	function render_columns(appts, wrap) {
// 		if (!appts.length) {
// 			wrap.innerHTML = `
// 				<div class="appt-empty">
// 					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
// 						<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
// 						<line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
// 					</svg>
// 					<p>No appointments found for this date.</p>
// 				</div>`;
// 			return;
// 		}

// 		// Group by practitioner
// 		const groups = {};
// 		appts.forEach(a => {
// 			const key = a.practitioner || 'Unassigned';
// 			if (!groups[key]) groups[key] = { name: a.practitioner_name || key, dept: a.department || '', appts: [] };
// 			groups[key].appts.push(a);
// 		});

// 		wrap.innerHTML = '';
// 		Object.values(groups).forEach(g => {
// 			const col = document.createElement('div');
// 			col.className = 'appt-col';
// 			col.innerHTML = `
// 				<div class="appt-col-header">
// 					<span class="pract-count">${g.appts.length}</span>
// 					<div class="pract-name">${g.name}</div>
// 					<div class="pract-dept">${g.dept}</div>
// 				</div>
// 				<div class="appt-col-body">
// 					${g.appts.map(a => card_html(a)).join('')}
// 				</div>
// 			`;
// 			// Attach click handlers
// 			col.querySelectorAll('.appt-card').forEach(card => {
// 				card.addEventListener('click', () => {
// 					const appt = appts.find(a => a.name === card.dataset.name);
// 					if (appt) show_detail(appt);
// 				});
// 			});
// 			wrap.appendChild(col);
// 		});
// 	}

// 	// ── Card HTML ────────────────────────────────────────────────────────────
// 	function card_html(a) {
// 		const is_hygiene = (a.appointment_type || '').toLowerCase().includes('hygien');
// 		const type_label = a.appointment_type || 'General';
// 		return `
// 			<div class="appt-card" data-name="${a.name}">
// 				<div class="appt-time">
// 					${status_dot(a.status)} ${a.appointment_date || ''}
// 				</div>
// 				<div class="appt-patient">${a.patient_name || a.patient || '—'}</div>
// 				<div class="appt-type">${type_label}</div>
// 				<div class="appt-meta">
// 					<span class="appt-tag status-${(a.status||'').replace(' ','-')}">${a.status || 'Unknown'}</span>
// 					${is_hygiene ? '<span class="appt-tag hygiene">🦷 Hygiene</span>' : ''}
// 					${a.service_unit ? `<span class="appt-tag">${a.service_unit}</span>` : ''}
// 					${a.appointment_for ? `<span class="appt-tag">${a.appointment_for}</span>` : ''}
// 				</div>
// 			</div>
// 		`;
// 	}

// 	// ── Detail modal ─────────────────────────────────────────────────────────
// 	function show_detail(a) {
// 		const backdrop = document.createElement('div');
// 		backdrop.className = 'appt-modal-backdrop';
// 		backdrop.innerHTML = `
// 			<div class="appt-modal">
// 				<h2>${a.patient_name || a.patient}</h2>
// 				${row('Appointment ID', `<a href="/app/patient-appointment/${a.name}" target="_blank">${a.name}</a>`)}
// 				${row('Status',          badge(a.status))}
// 				${row('Date',            a.appointment_date || '—')}
// 				${row('Type',            a.appointment_type || '—')}
// 				${row('Appointment For', a.appointment_for  || '—')}
// 				${row('Practitioner',    a.practitioner_name || a.practitioner || '—')}
// 				${row('Department',      a.department   || '—')}
// 				${row('Service Unit',    a.service_unit || '—')}
// 				${row('Company',         a.company      || '—')}
// 				<div class="appt-modal-actions">
// 					<button class="btn-appt-ghost" id="modal-close">Close</button>
// 					<button class="btn-appt-primary" id="modal-open">Open Record</button>
// 				</div>
// 			</div>
// 		`;
// 		document.body.appendChild(backdrop);
// 		backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
// 		backdrop.querySelector('#modal-open').onclick  = () => {
// 			frappe.set_route('Form', 'Patient Appointment', a.name);
// 			backdrop.remove();
// 		};
// 		backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
// 	}

// 	function row(key, val) {
// 		return `<div class="appt-modal-row"><span class="key">${key}</span><span class="val">${val}</span></div>`;
// 	}

// 	function badge(status) {
// 		const cls = `appt-tag status-${(status||'').replace(' ','-')}`;
// 		return `<span class="${cls}">${status}</span>`;
// 	}

// 	// ── Initial load ─────────────────────────────────────────────────────────
// 	load_schedule(selected_date);
// };

// frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Daily Appointment Schedule',
// 		single_column: true
// 	});

// 	// ── Date range pickers in toolbar ──────────────────────────────────────
// 	let from_date = frappe.datetime.get_today();
// 	let to_date   = frappe.datetime.get_today();

// 	page.add_field({
// 		fieldname: 'from_date',
// 		label: 'From Date',
// 		fieldtype: 'Date',
// 		default: from_date,
// 		change() {
// 			from_date = this.get_value() || frappe.datetime.get_today();
// 			load_schedule(from_date, to_date);
// 		}
// 	});

// 	page.add_field({
// 		fieldname: 'to_date',
// 		label: 'To Date',
// 		fieldtype: 'Date',
// 		default: to_date,
// 		change() {
// 			to_date = this.get_value() || frappe.datetime.get_today();
// 			load_schedule(from_date, to_date);
// 		}
// 	});

// 	page.add_field({
// 		fieldname: 'practitioner_filter',
// 		label: 'Practitioner',
// 		fieldtype: 'Link',
// 		options: 'Healthcare Practitioner',
// 		change() {
// 			load_schedule(from_date, to_date);
// 		}
// 	});

// 	// ── Inject styles ────────────────────────────────────────────────────────
// 	if (!document.getElementById('appt-sched-styles')) {
// 		const style = document.createElement('style');
// 		style.id = 'appt-sched-styles';
// 		style.textContent = `
// 			@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

// 			.appt-page {
// 				font-family: 'DM Sans', sans-serif;
// 				padding: 24px;
// 				background: #f5f7fa;
// 				min-height: 100vh;
// 			}

// 			/* ── Summary bar ── */
// 			.appt-summary {
// 				display: flex;
// 				gap: 16px;
// 				margin-bottom: 28px;
// 				flex-wrap: wrap;
// 			}
// 			.appt-stat {
// 				background: #fff;
// 				border-radius: 14px;
// 				padding: 18px 24px;
// 				flex: 1;
// 				min-width: 140px;
// 				box-shadow: 0 1px 4px rgba(0,0,0,.07);
// 				border-left: 4px solid transparent;
// 			}
// 			.appt-stat.total  { border-color: #4f8ef7; }
// 			.appt-stat.open   { border-color: #f7a44f; }
// 			.appt-stat.done   { border-color: #52c794; }
// 			.appt-stat.cancel { border-color: #f26e6e; }
// 			.appt-stat .num {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 32px;
// 				line-height: 1;
// 				color: #1a1e2e;
// 			}
// 			.appt-stat .lbl {
// 				font-size: 12px;
// 				color: #8892a4;
// 				margin-top: 4px;
// 				text-transform: uppercase;
// 				letter-spacing: .06em;
// 			}

// 			/* ── Practitioner columns ── */
// 			.appt-columns {
// 				display: flex;
// 				gap: 18px;
// 				overflow-x: auto;
// 				padding-bottom: 12px;
// 			}
// 			.appt-col {
// 				background: #fff;
// 				border-radius: 16px;
// 				flex: 0 0 320px;
// 				box-shadow: 0 1px 6px rgba(0,0,0,.08);
// 				overflow: hidden;
// 			}
// 			.appt-col-header {
// 				padding: 16px 20px;
// 				background: linear-gradient(135deg, #1a2340 0%, #2c3a6e 100%);
// 				color: #fff;
// 			}
// 			.appt-col-header .pract-name {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 17px;
// 				font-weight: 600;
// 			}
// 			.appt-col-header .pract-dept {
// 				font-size: 12px;
// 				opacity: .7;
// 				margin-top: 2px;
// 			}
// 			.appt-col-header .pract-count {
// 				float: right;
// 				background: rgba(255,255,255,.18);
// 				border-radius: 20px;
// 				padding: 2px 10px;
// 				font-size: 12px;
// 				font-weight: 600;
// 				margin-top: 2px;
// 			}
// 			.appt-col-body {
// 				padding: 12px;
// 				max-height: 70vh;
// 				overflow-y: auto;
// 			}

// 			/* ── Appointment card ── */
// 			.appt-card {
// 				border-radius: 12px;
// 				padding: 14px 16px;
// 				margin-bottom: 10px;
// 				background: #f9fafc;
// 				border: 1px solid #eaecf2;
// 				cursor: pointer;
// 				transition: box-shadow .18s, transform .18s;
// 				position: relative;
// 			}
// 			.appt-card:hover {
// 				box-shadow: 0 4px 16px rgba(79,142,247,.15);
// 				transform: translateY(-1px);
// 			}
// 			.appt-card .status-dot {
// 				width: 9px; height: 9px;
// 				border-radius: 50%;
// 				display: inline-block;
// 				margin-right: 6px;
// 				vertical-align: middle;
// 			}
// 			.appt-card .appt-time {
// 				font-size: 12px;
// 				font-weight: 600;
// 				color: #4f8ef7;
// 				margin-bottom: 6px;
// 				display: flex;
// 				align-items: center;
// 			}
// 			.appt-card .appt-patient {
// 				font-size: 15px;
// 				font-weight: 600;
// 				color: #1a1e2e;
// 				margin-bottom: 2px;
// 			}
// 			.appt-card .appt-type {
// 				font-size: 12px;
// 				color: #8892a4;
// 				margin-bottom: 8px;
// 			}
// 			.appt-card .appt-meta {
// 				display: flex;
// 				gap: 8px;
// 				flex-wrap: wrap;
// 			}
// 			.appt-tag {
// 				font-size: 11px;
// 				padding: 2px 8px;
// 				border-radius: 20px;
// 				font-weight: 500;
// 				background: #eef2ff;
// 				color: #4f8ef7;
// 			}
// 			.appt-tag.hygiene { background: #e8f8f1; color: #27ae73; }
// 			.appt-tag.status-Open, .appt-tag.status-Scheduled { background: #fff4e6; color: #d97706; }
// 			.appt-tag.status-Closed { background: #e8f8f1; color: #27ae73; }
// 			.appt-tag.status-Cancelled { background: #fde8e8; color: #dc2626; }

// 			/* ── Empty / loading states ── */
// 			.appt-empty {
// 				text-align: center;
// 				padding: 40px 20px;
// 				color: #b0bac8;
// 				font-size: 13px;
// 			}
// 			.appt-empty svg { margin-bottom: 12px; opacity: .4; }
// 			.appt-loading {
// 				text-align: center;
// 				padding: 40px;
// 				color: #b0bac8;
// 			}

// 			/* ── Modal overlay ── */
// 			.appt-modal-backdrop {
// 				position: fixed; inset: 0;
// 				background: rgba(10,14,30,.45);
// 				z-index: 9998;
// 				display: flex; align-items: center; justify-content: center;
// 			}
// 			.appt-modal {
// 				background: #fff;
// 				border-radius: 20px;
// 				padding: 32px;
// 				width: 460px;
// 				max-width: 95vw;
// 				box-shadow: 0 20px 60px rgba(0,0,0,.18);
// 				z-index: 9999;
// 				animation: modalIn .22s ease;
// 			}
// 			@keyframes modalIn {
// 				from { opacity:0; transform:scale(.95) translateY(8px); }
// 				to   { opacity:1; transform:scale(1)  translateY(0);   }
// 			}
// 			.appt-modal h2 {
// 				font-family: 'Playfair Display', serif;
// 				font-size: 22px;
// 				color: #1a1e2e;
// 				margin-bottom: 20px;
// 			}
// 			.appt-modal-row {
// 				display: flex;
// 				justify-content: space-between;
// 				padding: 10px 0;
// 				border-bottom: 1px solid #f0f2f7;
// 				font-size: 14px;
// 			}
// 			.appt-modal-row .key { color: #8892a4; }
// 			.appt-modal-row .val { font-weight: 600; color: #1a1e2e; }
// 			.appt-modal-actions {
// 				margin-top: 24px;
// 				display: flex;
// 				gap: 10px;
// 				justify-content: flex-end;
// 			}
// 			.btn-appt-primary {
// 				background: #1a2340; color: #fff;
// 				border: none; border-radius: 10px;
// 				padding: 9px 20px; font-size: 14px;
// 				cursor: pointer; font-family: 'DM Sans', sans-serif;
// 				transition: background .18s;
// 			}
// 			.btn-appt-primary:hover { background: #2c3a6e; }
// 			.btn-appt-ghost {
// 				background: #f0f2f7; color: #1a1e2e;
// 				border: none; border-radius: 10px;
// 				padding: 9px 20px; font-size: 14px;
// 				cursor: pointer; font-family: 'DM Sans', sans-serif;
// 			}
// 		`;
// 		document.head.appendChild(style);
// 	}

// 	// ── Build page skeleton ────────────────────────────────────────────────
// 	$(wrapper).find('.layout-main-section').html(`
// 		<div class="appt-page">
// 			<div class="appt-summary" id="appt-summary"></div>
// 			<div class="appt-columns" id="appt-columns">
// 				<div class="appt-loading">Loading schedule…</div>
// 			</div>
// 		</div>
// 	`);

// 	// ── Status helpers ──────────────────────────────────────────────────────
// 	const STATUS_COLOR = {
// 		'Open':      '#f7a44f',
// 		'Scheduled': '#f7a44f',
// 		'Closed':    '#52c794',
// 		'Cancelled': '#f26e6e',
// 	};

// 	function status_dot(status) {
// 		const c = STATUS_COLOR[status] || '#ccc';
// 		return `<span class="status-dot" style="background:${c}"></span>`;
// 	}

// 	// ── Load data ────────────────────────────────────────────────────────────
// 	function load_schedule(from_date, to_date) {
// 		const col_wrap  = document.getElementById('appt-columns');
// 		const sum_wrap  = document.getElementById('appt-summary');
// 		col_wrap.innerHTML = '<div class="appt-loading">Loading…</div>';
// 		sum_wrap.innerHTML = '';

// 		const filters = [
// 			['appointment_date', '>=', from_date],
// 			['appointment_date', '<=', to_date]
// 		];
// 		const practitioner_filter = page.fields_dict.practitioner_filter.get_value();
// 		if (practitioner_filter) {
// 			filters.push(['practitioner', '=', practitioner_filter]);
// 		}

// 		frappe.call({
// 			method: 'frappe.client.get_list',
// 			args: {
// 				doctype: 'Patient Appointment',
// 				fields: [
// 					'name', 'title', 'status', 'appointment_type',
// 					'appointment_for', 'practitioner', 'practitioner_name',
// 					'department', 'service_unit', 'appointment_date','appointment_time',
// 					'patient', 'patient_name', 'company'
// 				],
// 				filters: filters,
// 				limit_page_length: 200,
// 				order_by: 'appointment_date asc'
// 			},
// 			callback(r) {
// 				const appts = r.message || [];
// 				render_summary(appts, sum_wrap);
// 				render_columns(appts, col_wrap);
// 			}
// 		});
// 	}

// 	// ── Summary bar ─────────────────────────────────────────────────────────
// 	function render_summary(appts, wrap) {
// 		const total    = appts.length;
// 		const open     = appts.filter(a => ['Open','Scheduled'].includes(a.status)).length;
// 		const closed   = appts.filter(a => a.status === 'Closed').length;
// 		const cancelled= appts.filter(a => a.status === 'Cancelled').length;

// 		wrap.innerHTML = `
// 			<div class="appt-stat total">
// 				<div class="num">${total}</div>
// 				<div class="lbl">Total Appointments</div>
// 			</div>
// 			<div class="appt-stat open">
// 				<div class="num">${open}</div>
// 				<div class="lbl">Upcoming / Open</div>
// 			</div>
// 			<div class="appt-stat done">
// 				<div class="num">${closed}</div>
// 				<div class="lbl">Completed</div>
// 			</div>
// 			<div class="appt-stat cancel">
// 				<div class="num">${cancelled}</div>
// 				<div class="lbl">Cancelled</div>
// 			</div>
// 		`;
// 	}

// 	// ── Practitioner columns ─────────────────────────────────────────────────
// 	function render_columns(appts, wrap) {
// 		if (!appts.length) {
// 			wrap.innerHTML = `
// 				<div class="appt-empty">
// 					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
// 						<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
// 						<line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
// 					</svg>
// 					<p>No appointments found for this date.</p>
// 				</div>`;
// 			return;
// 		}

// 		// Group by practitioner
// 		const groups = {};
// 		appts.forEach(a => {
// 			const key = a.practitioner || 'Unassigned';
// 			if (!groups[key]) groups[key] = { name: a.practitioner_name || key, dept: a.department || '', appts: [] };
// 			groups[key].appts.push(a);
// 		});

// 		wrap.innerHTML = '';
// 		Object.values(groups).forEach(g => {
// 			const col = document.createElement('div');
// 			col.className = 'appt-col';
// 			col.innerHTML = `
// 				<div class="appt-col-header">
// 					<span class="pract-count">${g.appts.length}</span>
// 					<div class="pract-name">${g.name}</div>
// 					<div class="pract-dept">${g.dept}</div>
// 				</div>
// 				<div class="appt-col-body">
// 					${g.appts.map(a => card_html(a)).join('')}
// 				</div>
// 			`;
// 			// Attach click handlers
// 			col.querySelectorAll('.appt-card').forEach(card => {
// 				card.addEventListener('click', () => {
// 					const appt = appts.find(a => a.name === card.dataset.name);
// 					if (appt) show_detail(appt);
// 				});
// 			});
// 			wrap.appendChild(col);
// 		});
// 	}

// 	// ── Card HTML ────────────────────────────────────────────────────────────
// 	function card_html(a) {
// 		const is_hygiene = (a.appointment_type || '').toLowerCase().includes('hygien');
// 		const type_label = a.appointment_type || 'General';
// 		return `
// 			<div class="appt-card" data-name="${a.name}">
// 				<div class="appt-time">
// 					${status_dot(a.status)} ${a.appointment_date || ''}
// 				</div>
// 				<div class="appt-time">${a.appointment_time ||  '—'}</div>

// 				<div class="appt-patient">${a.patient_name || a.patient || '—'}</div>
// 				<div class="appt-type">${type_label}</div>
// 				<div class="appt-meta">
// 					<span class="appt-tag status-${(a.status||'').replace(' ','-')}">${a.status || 'Unknown'}</span>
// 					${is_hygiene ? '<span class="appt-tag hygiene">🦷 Hygiene</span>' : ''}
// 					${a.service_unit ? `<span class="appt-tag">${a.service_unit}</span>` : ''}
// 					${a.appointment_for ? `<span class="appt-tag">${a.appointment_for}</span>` : ''}
// 				</div>
// 			</div>
// 		`;
// 	}

// 	// ── Detail modal ─────────────────────────────────────────────────────────
// 	function show_detail(a) {
// 		const backdrop = document.createElement('div');
// 		backdrop.className = 'appt-modal-backdrop';
// 		backdrop.innerHTML = `
// 			<div class="appt-modal">
// 				<h2>${a.patient_name || a.patient}</h2>
// 				${row('Appointment ID', `<a href="/app/patient-appointment/${a.name}" target="_blank">${a.name}</a>`)}
// 				${row('Status',          badge(a.status))}
// 				${row('Date',            a.appointment_date || '—')}
// 				${row('Time',            a.appointment_time || '-')}
// 				${row('Type',            a.appointment_type || '—')}
// 				${row('Appointment For', a.appointment_for  || '—')}
// 				${row('Practitioner',    a.practitioner_name || a.practitioner || '—')}
// 				${row('Department',      a.department   || '—')}
// 				${row('Service Unit',    a.service_unit || '—')}
// 				${row('Company',         a.company      || '—')}
// 				<div class="appt-modal-actions">
// 					<button class="btn-appt-ghost" id="modal-close">Close</button>
// 					<button class="btn-appt-primary" id="modal-open">Open Record</button>
// 				</div>
// 			</div>
// 		`;
// 		document.body.appendChild(backdrop);
// 		backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
// 		backdrop.querySelector('#modal-open').onclick  = () => {
// 			frappe.set_route('Form', 'Patient Appointment', a.name);
// 			backdrop.remove();
// 		};
// 		backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
// 	}

// 	function row(key, val) {
// 		return `<div class="appt-modal-row"><span class="key">${key}</span><span class="val">${val}</span></div>`;
// 	}

// 	function badge(status) {
// 		const cls = `appt-tag status-${(status||'').replace(' ','-')}`;
// 		return `<span class="${cls}">${status}</span>`;
// 	}

// 	// ── Initial load ─────────────────────────────────────────────────────────
// 	load_schedule(from_date, to_date);
// };

frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Daily Appointment Schedule',
        single_column: true
    });

    var from_date = frappe.datetime.get_today();
    var to_date   = frappe.datetime.get_today();

    // ── Toolbar filters ────────────────────────────────────────
    page.add_field({
        fieldname: 'from_date', label: 'From Date', fieldtype: 'Date', default: from_date,
        change() { from_date = this.get_value() || frappe.datetime.get_today(); load_schedule(); }
    });
    page.add_field({
        fieldname: 'to_date', label: 'To Date', fieldtype: 'Date', default: to_date,
        change() { to_date = this.get_value() || frappe.datetime.get_today(); load_schedule(); }
    });
    page.add_field({
        fieldname: 'service_unit_filter', label: 'Service Unit',
        fieldtype: 'Link', options: 'Healthcare Service Unit',
        change() { load_schedule(); }
    });
    page.add_field({
        fieldname: 'practitioner_filter', label: 'Practitioner',
        fieldtype: 'Link', options: 'Healthcare Practitioner',
        change() { load_schedule(); }
    });

    // ── Styles ─────────────────────────────────────────────────
    if (!document.getElementById('cal-sched-styles')) {
        var style = document.createElement('style');
        style.id = 'cal-sched-styles';
        style.textContent = `
            .cal-page { background: var(--bg-color); padding: 0; }
            .cal-stat-bar { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; padding: 14px 20px; background: var(--subtle-bg); border-bottom: 1px solid var(--border-color); }
            .cal-stat { background: var(--card-bg); border-radius: 8px; padding: 10px 14px; border: 1px solid var(--border-color); }
            .cal-stat-num { font-size: 24px; font-weight: 600; }
            .cal-stat-lbl { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; margin-top: 2px; }
            .cal-stat.s-total .cal-stat-num { color: #185FA5; }
            .cal-stat.s-open  .cal-stat-num { color: #854F0B; }
            .cal-stat.s-done  .cal-stat-num { color: #085041; }
            .cal-stat.s-cancel .cal-stat-num { color: #791F1F; }
            .cal-nav-bar { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--card-bg); border-bottom: 1px solid var(--border-color); }
            .cal-nav-btn { padding: 5px 10px; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-color); cursor: pointer; font-size: 13px; }
            .cal-range-lbl { flex: 1; text-align: center; font-size: 15px; font-weight: 600; color: var(--text-color); }
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
            <div class="cal-stat-bar" id="cal-stats"></div>
            <div class="cal-nav-bar" id="cal-nav">
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

    // Nav button wiring
    document.getElementById('cal-prev').onclick = function() {
        from_date = frappe.datetime.add_days(from_date, -7);
        to_date   = frappe.datetime.add_days(to_date,   -7);
        page.fields_dict.from_date.set_value(from_date);
        page.fields_dict.to_date.set_value(to_date);
        load_schedule();
    };
    document.getElementById('cal-next').onclick = function() {
        from_date = frappe.datetime.add_days(from_date, 7);
        to_date   = frappe.datetime.add_days(to_date,   7);
        page.fields_dict.from_date.set_value(from_date);
        page.fields_dict.to_date.set_value(to_date);
        load_schedule();
    };
    document.getElementById('cal-today').onclick = function() {
        from_date = frappe.datetime.get_today();
        to_date   = frappe.datetime.get_today();
        page.fields_dict.from_date.set_value(from_date);
        page.fields_dict.to_date.set_value(to_date);
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
        var pf = page.fields_dict.practitioner_filter.get_value();
        var sf = page.fields_dict.service_unit_filter.get_value();
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
        var total    = appts.length;
        var open     = appts.filter(function(a) { return a.status === 'Open' || a.status === 'Scheduled'; }).length;
        var closed   = appts.filter(function(a) { return a.status === 'Closed'; }).length;
        var cancelled= appts.filter(function(a) { return a.status === 'Cancelled'; }).length;
        wrap.innerHTML =
            '<div class="cal-stat s-total"><div class="cal-stat-num">' + total + '</div><div class="cal-stat-lbl">Total</div></div>' +
            '<div class="cal-stat s-open"><div class="cal-stat-num">' + open + '</div><div class="cal-stat-lbl">Upcoming</div></div>' +
            '<div class="cal-stat s-done"><div class="cal-stat-num">' + closed + '</div><div class="cal-stat-lbl">Completed</div></div>' +
            '<div class="cal-stat s-cancel"><div class="cal-stat-num">' + cancelled + '</div><div class="cal-stat-lbl">Cancelled</div></div>';
    }

    // ── Calendar grid ──────────────────────────────────────────
    function render_calendar(appts, wrap, f, t) {
        var dates  = get_week_dates(f, t);
        var today  = frappe.datetime.get_today();
        var cols   = dates.length + 1;
        var grid_tpl = '60px ' + dates.map(function() { return '1fr'; }).join(' ');

        if (!appts.length) {
            wrap.innerHTML = '<div class="cal-empty">No appointments found for this period.</div>';
            return;
        }

        // Index appts by date + slot
        var by_date = {};
        var allday  = {};
        appts.forEach(function(a) {
            var d = a.appointment_date;
            if (!by_date[d]) by_date[d] = {};
            var slot = time_to_slot(a.appointment_time);
            if (slot < 0) {
                if (!allday[d]) allday[d] = [];
                allday[d].push(a);
            } else {
                if (!by_date[d][slot]) by_date[d][slot] = [];
                by_date[d][slot].push(a);
            }
        });

        var html = '<div class="cal-grid">';

        // Header row
        html += '<div class="cal-head-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-head-cell"></div>';
        dates.forEach(function(d) {
            html += '<div class="cal-head-cell' + (d === today ? ' today' : '') + '">'
                + fmt_date_header(d) + '</div>';
        });
        html += '</div>';

        // All-day row
        html += '<div class="cal-allday-row" style="grid-template-columns:' + grid_tpl + '">';
        html += '<div class="cal-allday-lbl">all-day</div>';
        dates.forEach(function(d) {
            html += '<div class="cal-allday-cell">';
            if (allday[d]) {
                allday[d].forEach(function(a) {
                    html += '<div class="cal-allday-block">'
                        + (a.patient_name || a.patient) + ' \u2022 ' + (a.service_unit || '')
                        + '</div>';
                });
            }
            html += '</div>';
        });
        html += '</div>';

        // Body
        html += '<div class="cal-body-row" style="display:grid;grid-template-columns:' + grid_tpl + '">';

        // Time column
        html += '<div class="cal-time-col">';
        TIME_SLOTS.forEach(function(ts) {
            html += '<div class="cal-time-slot">' + ts + '</div>';
        });
        html += '</div>';

        // Day columns
        dates.forEach(function(d) {
            html += '<div class="cal-day-col' + (d === today ? ' today' : '') + '">';
            TIME_SLOTS.forEach(function(ts, si) {
                html += '<div class="cal-day-slot">';
                if (by_date[d] && by_date[d][si]) {
                    by_date[d][si].forEach(function(a) {
                        html += '<div class="cal-appt ' + (a.status || 'Open') + '" data-name="'
                            + a.name + '">'
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

        // Click handlers
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
            modal_row('ID', '<a href="/app/patient-appointment/' + a.name + '" target="_blank">' + a.name + '</a>') +
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