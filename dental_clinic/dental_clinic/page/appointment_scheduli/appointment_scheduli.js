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

frappe.pages['appointment-scheduli'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Daily Appointment Schedule',
		single_column: true
	});

	// ── Date range pickers in toolbar ──────────────────────────────────────
	let from_date = frappe.datetime.get_today();
	let to_date   = frappe.datetime.get_today();

	page.add_field({
		fieldname: 'from_date',
		label: 'From Date',
		fieldtype: 'Date',
		default: from_date,
		change() {
			from_date = this.get_value() || frappe.datetime.get_today();
			load_schedule(from_date, to_date);
		}
	});

	page.add_field({
		fieldname: 'to_date',
		label: 'To Date',
		fieldtype: 'Date',
		default: to_date,
		change() {
			to_date = this.get_value() || frappe.datetime.get_today();
			load_schedule(from_date, to_date);
		}
	});

	page.add_field({
		fieldname: 'practitioner_filter',
		label: 'Practitioner',
		fieldtype: 'Link',
		options: 'Healthcare Practitioner',
		change() {
			load_schedule(from_date, to_date);
		}
	});

	// ── Inject styles ────────────────────────────────────────────────────────
	if (!document.getElementById('appt-sched-styles')) {
		const style = document.createElement('style');
		style.id = 'appt-sched-styles';
		style.textContent = `
			@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@600&display=swap');

			.appt-page {
				font-family: 'DM Sans', sans-serif;
				padding: 24px;
				background: #f5f7fa;
				min-height: 100vh;
			}

			/* ── Summary bar ── */
			.appt-summary {
				display: flex;
				gap: 16px;
				margin-bottom: 28px;
				flex-wrap: wrap;
			}
			.appt-stat {
				background: #fff;
				border-radius: 14px;
				padding: 18px 24px;
				flex: 1;
				min-width: 140px;
				box-shadow: 0 1px 4px rgba(0,0,0,.07);
				border-left: 4px solid transparent;
			}
			.appt-stat.total  { border-color: #4f8ef7; }
			.appt-stat.open   { border-color: #f7a44f; }
			.appt-stat.done   { border-color: #52c794; }
			.appt-stat.cancel { border-color: #f26e6e; }
			.appt-stat .num {
				font-family: 'Playfair Display', serif;
				font-size: 32px;
				line-height: 1;
				color: #1a1e2e;
			}
			.appt-stat .lbl {
				font-size: 12px;
				color: #8892a4;
				margin-top: 4px;
				text-transform: uppercase;
				letter-spacing: .06em;
			}

			/* ── Practitioner columns ── */
			.appt-columns {
				display: flex;
				gap: 18px;
				overflow-x: auto;
				padding-bottom: 12px;
			}
			.appt-col {
				background: #fff;
				border-radius: 16px;
				flex: 0 0 320px;
				box-shadow: 0 1px 6px rgba(0,0,0,.08);
				overflow: hidden;
			}
			.appt-col-header {
				padding: 16px 20px;
				background: linear-gradient(135deg, #1a2340 0%, #2c3a6e 100%);
				color: #fff;
			}
			.appt-col-header .pract-name {
				font-family: 'Playfair Display', serif;
				font-size: 17px;
				font-weight: 600;
			}
			.appt-col-header .pract-dept {
				font-size: 12px;
				opacity: .7;
				margin-top: 2px;
			}
			.appt-col-header .pract-count {
				float: right;
				background: rgba(255,255,255,.18);
				border-radius: 20px;
				padding: 2px 10px;
				font-size: 12px;
				font-weight: 600;
				margin-top: 2px;
			}
			.appt-col-body {
				padding: 12px;
				max-height: 70vh;
				overflow-y: auto;
			}

			/* ── Appointment card ── */
			.appt-card {
				border-radius: 12px;
				padding: 14px 16px;
				margin-bottom: 10px;
				background: #f9fafc;
				border: 1px solid #eaecf2;
				cursor: pointer;
				transition: box-shadow .18s, transform .18s;
				position: relative;
			}
			.appt-card:hover {
				box-shadow: 0 4px 16px rgba(79,142,247,.15);
				transform: translateY(-1px);
			}
			.appt-card .status-dot {
				width: 9px; height: 9px;
				border-radius: 50%;
				display: inline-block;
				margin-right: 6px;
				vertical-align: middle;
			}
			.appt-card .appt-time {
				font-size: 12px;
				font-weight: 600;
				color: #4f8ef7;
				margin-bottom: 6px;
				display: flex;
				align-items: center;
			}
			.appt-card .appt-patient {
				font-size: 15px;
				font-weight: 600;
				color: #1a1e2e;
				margin-bottom: 2px;
			}
			.appt-card .appt-type {
				font-size: 12px;
				color: #8892a4;
				margin-bottom: 8px;
			}
			.appt-card .appt-meta {
				display: flex;
				gap: 8px;
				flex-wrap: wrap;
			}
			.appt-tag {
				font-size: 11px;
				padding: 2px 8px;
				border-radius: 20px;
				font-weight: 500;
				background: #eef2ff;
				color: #4f8ef7;
			}
			.appt-tag.hygiene { background: #e8f8f1; color: #27ae73; }
			.appt-tag.status-Open, .appt-tag.status-Scheduled { background: #fff4e6; color: #d97706; }
			.appt-tag.status-Closed { background: #e8f8f1; color: #27ae73; }
			.appt-tag.status-Cancelled { background: #fde8e8; color: #dc2626; }

			/* ── Empty / loading states ── */
			.appt-empty {
				text-align: center;
				padding: 40px 20px;
				color: #b0bac8;
				font-size: 13px;
			}
			.appt-empty svg { margin-bottom: 12px; opacity: .4; }
			.appt-loading {
				text-align: center;
				padding: 40px;
				color: #b0bac8;
			}

			/* ── Modal overlay ── */
			.appt-modal-backdrop {
				position: fixed; inset: 0;
				background: rgba(10,14,30,.45);
				z-index: 9998;
				display: flex; align-items: center; justify-content: center;
			}
			.appt-modal {
				background: #fff;
				border-radius: 20px;
				padding: 32px;
				width: 460px;
				max-width: 95vw;
				box-shadow: 0 20px 60px rgba(0,0,0,.18);
				z-index: 9999;
				animation: modalIn .22s ease;
			}
			@keyframes modalIn {
				from { opacity:0; transform:scale(.95) translateY(8px); }
				to   { opacity:1; transform:scale(1)  translateY(0);   }
			}
			.appt-modal h2 {
				font-family: 'Playfair Display', serif;
				font-size: 22px;
				color: #1a1e2e;
				margin-bottom: 20px;
			}
			.appt-modal-row {
				display: flex;
				justify-content: space-between;
				padding: 10px 0;
				border-bottom: 1px solid #f0f2f7;
				font-size: 14px;
			}
			.appt-modal-row .key { color: #8892a4; }
			.appt-modal-row .val { font-weight: 600; color: #1a1e2e; }
			.appt-modal-actions {
				margin-top: 24px;
				display: flex;
				gap: 10px;
				justify-content: flex-end;
			}
			.btn-appt-primary {
				background: #1a2340; color: #fff;
				border: none; border-radius: 10px;
				padding: 9px 20px; font-size: 14px;
				cursor: pointer; font-family: 'DM Sans', sans-serif;
				transition: background .18s;
			}
			.btn-appt-primary:hover { background: #2c3a6e; }
			.btn-appt-ghost {
				background: #f0f2f7; color: #1a1e2e;
				border: none; border-radius: 10px;
				padding: 9px 20px; font-size: 14px;
				cursor: pointer; font-family: 'DM Sans', sans-serif;
			}
		`;
		document.head.appendChild(style);
	}

	// ── Build page skeleton ────────────────────────────────────────────────
	$(wrapper).find('.layout-main-section').html(`
		<div class="appt-page">
			<div class="appt-summary" id="appt-summary"></div>
			<div class="appt-columns" id="appt-columns">
				<div class="appt-loading">Loading schedule…</div>
			</div>
		</div>
	`);

	// ── Status helpers ──────────────────────────────────────────────────────
	const STATUS_COLOR = {
		'Open':      '#f7a44f',
		'Scheduled': '#f7a44f',
		'Closed':    '#52c794',
		'Cancelled': '#f26e6e',
	};

	function status_dot(status) {
		const c = STATUS_COLOR[status] || '#ccc';
		return `<span class="status-dot" style="background:${c}"></span>`;
	}

	// ── Load data ────────────────────────────────────────────────────────────
	function load_schedule(from_date, to_date) {
		const col_wrap  = document.getElementById('appt-columns');
		const sum_wrap  = document.getElementById('appt-summary');
		col_wrap.innerHTML = '<div class="appt-loading">Loading…</div>';
		sum_wrap.innerHTML = '';

		const filters = [
			['appointment_date', '>=', from_date],
			['appointment_date', '<=', to_date]
		];
		const practitioner_filter = page.fields_dict.practitioner_filter.get_value();
		if (practitioner_filter) {
			filters.push(['practitioner', '=', practitioner_filter]);
		}

		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Patient Appointment',
				fields: [
					'name', 'title', 'status', 'appointment_type',
					'appointment_for', 'practitioner', 'practitioner_name',
					'department', 'service_unit', 'appointment_date',
					'patient', 'patient_name', 'company'
				],
				filters: filters,
				limit_page_length: 200,
				order_by: 'appointment_date asc'
			},
			callback(r) {
				const appts = r.message || [];
				render_summary(appts, sum_wrap);
				render_columns(appts, col_wrap);
			}
		});
	}

	// ── Summary bar ─────────────────────────────────────────────────────────
	function render_summary(appts, wrap) {
		const total    = appts.length;
		const open     = appts.filter(a => ['Open','Scheduled'].includes(a.status)).length;
		const closed   = appts.filter(a => a.status === 'Closed').length;
		const cancelled= appts.filter(a => a.status === 'Cancelled').length;

		wrap.innerHTML = `
			<div class="appt-stat total">
				<div class="num">${total}</div>
				<div class="lbl">Total Appointments</div>
			</div>
			<div class="appt-stat open">
				<div class="num">${open}</div>
				<div class="lbl">Upcoming / Open</div>
			</div>
			<div class="appt-stat done">
				<div class="num">${closed}</div>
				<div class="lbl">Completed</div>
			</div>
			<div class="appt-stat cancel">
				<div class="num">${cancelled}</div>
				<div class="lbl">Cancelled</div>
			</div>
		`;
	}

	// ── Practitioner columns ─────────────────────────────────────────────────
	function render_columns(appts, wrap) {
		if (!appts.length) {
			wrap.innerHTML = `
				<div class="appt-empty">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
						<line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
					</svg>
					<p>No appointments found for this date.</p>
				</div>`;
			return;
		}

		// Group by practitioner
		const groups = {};
		appts.forEach(a => {
			const key = a.practitioner || 'Unassigned';
			if (!groups[key]) groups[key] = { name: a.practitioner_name || key, dept: a.department || '', appts: [] };
			groups[key].appts.push(a);
		});

		wrap.innerHTML = '';
		Object.values(groups).forEach(g => {
			const col = document.createElement('div');
			col.className = 'appt-col';
			col.innerHTML = `
				<div class="appt-col-header">
					<span class="pract-count">${g.appts.length}</span>
					<div class="pract-name">${g.name}</div>
					<div class="pract-dept">${g.dept}</div>
				</div>
				<div class="appt-col-body">
					${g.appts.map(a => card_html(a)).join('')}
				</div>
			`;
			// Attach click handlers
			col.querySelectorAll('.appt-card').forEach(card => {
				card.addEventListener('click', () => {
					const appt = appts.find(a => a.name === card.dataset.name);
					if (appt) show_detail(appt);
				});
			});
			wrap.appendChild(col);
		});
	}

	// ── Card HTML ────────────────────────────────────────────────────────────
	function card_html(a) {
		const is_hygiene = (a.appointment_type || '').toLowerCase().includes('hygien');
		const type_label = a.appointment_type || 'General';
		return `
			<div class="appt-card" data-name="${a.name}">
				<div class="appt-time">
					${status_dot(a.status)} ${a.appointment_date || ''}
				</div>
				<div class="appt-patient">${a.patient_name || a.patient || '—'}</div>
				<div class="appt-type">${type_label}</div>
				<div class="appt-meta">
					<span class="appt-tag status-${(a.status||'').replace(' ','-')}">${a.status || 'Unknown'}</span>
					${is_hygiene ? '<span class="appt-tag hygiene">🦷 Hygiene</span>' : ''}
					${a.service_unit ? `<span class="appt-tag">${a.service_unit}</span>` : ''}
					${a.appointment_for ? `<span class="appt-tag">${a.appointment_for}</span>` : ''}
				</div>
			</div>
		`;
	}

	// ── Detail modal ─────────────────────────────────────────────────────────
	function show_detail(a) {
		const backdrop = document.createElement('div');
		backdrop.className = 'appt-modal-backdrop';
		backdrop.innerHTML = `
			<div class="appt-modal">
				<h2>${a.patient_name || a.patient}</h2>
				${row('Appointment ID', `<a href="/app/patient-appointment/${a.name}" target="_blank">${a.name}</a>`)}
				${row('Status',          badge(a.status))}
				${row('Date',            a.appointment_date || '—')}
				${row('Type',            a.appointment_type || '—')}
				${row('Appointment For', a.appointment_for  || '—')}
				${row('Practitioner',    a.practitioner_name || a.practitioner || '—')}
				${row('Department',      a.department   || '—')}
				${row('Service Unit',    a.service_unit || '—')}
				${row('Company',         a.company      || '—')}
				<div class="appt-modal-actions">
					<button class="btn-appt-ghost" id="modal-close">Close</button>
					<button class="btn-appt-primary" id="modal-open">Open Record</button>
				</div>
			</div>
		`;
		document.body.appendChild(backdrop);
		backdrop.querySelector('#modal-close').onclick = () => backdrop.remove();
		backdrop.querySelector('#modal-open').onclick  = () => {
			frappe.set_route('Form', 'Patient Appointment', a.name);
			backdrop.remove();
		};
		backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
	}

	function row(key, val) {
		return `<div class="appt-modal-row"><span class="key">${key}</span><span class="val">${val}</span></div>`;
	}

	function badge(status) {
		const cls = `appt-tag status-${(status||'').replace(' ','-')}`;
		return `<span class="${cls}">${status}</span>`;
	}

	// ── Initial load ─────────────────────────────────────────────────────────
	load_schedule(from_date, to_date);
};