frappe.pages['dt_treatment_plan'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Dental Treatment Plan'),
		single_column: true
	});

	wrapper.dtp = new DentalTreatmentPlanPage(page);
};

class DentalTreatmentPlanPage {
	constructor(page) {
		this.page = page;
		this.frm_doctype = 'Dental Treatment Plan';
		this.child_doctype = 'Dental Treatment Plan Procedure';
		this.docname = null; // set once the plan has been saved / loaded

		// In-memory procedure rows — this is a plain array we render
		// ourselves. Nothing here queries `Dental Treatment Plan
		// Procedure` at all; that doctype is only referenced when we
		// actually call frappe.client.insert/save (this.save()) or
		// frappe.client.get (this._load_plan_by_name()).
		this.procedureRows = [];
		this.selectedRowIds = new Set();

		// Procedure dropdown source — Item only, never the child doctype.
		this.itemCatalog = [];

		this.make();
	}

	// ---------------------------------------------------------------
	// Boot
	// ---------------------------------------------------------------
	make() {
		this.setup_actions();
		this.render_field_group();
		this.render_procedure_table();
		this.load_item_catalog();
		this.set_defaults();
	}

	setup_actions() {
		var me = this;

		this.page.set_primary_action(__('Save'), function () {
			me.save();
		}, 'save');

		this.page.add_menu_item(__('New Plan'), function () {
			me.reset();
		});

		this.page.add_menu_item(__('Load History'), function () {
			me.load_plan_history();
		});

		this.page.add_menu_item(__('Recalculate Totals'), function () {
			me.recalculate_totals();
		});
	}

	// ---------------------------------------------------------------
	// Top form fields (patient, provider, plan type/date, note,
	// totals, signature) — all plain df fields, no Table field, so
	// FieldGroup never needs to fetch any doctype meta to render them.
	// ---------------------------------------------------------------
	render_field_group() {
		this.$body = $('<div class="dtp-page-wrapper">')
			.css({ 'max-width': '900px', margin: '0 auto', 'padding-top': '15px' })
			.appendTo(this.page.main);

		this.field_group = new frappe.ui.FieldGroup({
			fields: this.get_fields(),
			body: this.$body,
			card_layout: true
		});

		this.field_group.make();
		this.fields_dict = this.field_group.fields_dict;
	}

	get_fields() {
		return [
			{
				fieldtype: 'Link',
				fieldname: 'patient',
				label: __('Patient'),
				options: 'Patient',
				reqd: 1,
				get_query: () => ({ filters: { status: 'Active' } })
			},
			{
				fieldtype: 'Link',
				fieldname: 'provider',
				label: __('Provider'),
				options: 'Healthcare Practitioner'
			},
			{ fieldtype: 'Column Break', fieldname: 'column_break_lggz' },
			{
				fieldtype: 'Select',
				fieldname: 'plan_type',
				label: __('Plan Type'),
				options: 'Active\nInactive\nSaved',
				default: 'Active'
			},
			{
				fieldtype: 'Date',
				fieldname: 'plan_date',
				label: __('Plan Date'),
				default: frappe.datetime.get_today()
			},
			{ fieldtype: 'Section Break', fieldname: 'section_break_tgsl' },
			// NOTE: dental_treatment_plan_procedure is rendered as a
			// hand-rolled table below (see render_procedure_table),
			// not as a FieldGroup Table field.
			{
				fieldtype: 'Long Text',
				fieldname: 'plan_note',
				label: __('Plan Note')
			},
			{ fieldtype: 'Section Break', fieldname: 'section_break_whrp', label: __('Totals') },
			{
				fieldtype: 'Currency',
				fieldname: 'total_insurance_estimate',
				label: __('Total Insurance Estimate'),
				read_only: 1
			},
			{
				fieldtype: 'Currency',
				fieldname: 'total_fee',
				label: __('Total Fee'),
				read_only: 1
			},
			{
				fieldtype: 'Currency',
				fieldname: 'total_patient_portion',
				label: __('Total Patient Portion'),
				read_only: 1
			},
			{ fieldtype: 'Column Break', fieldname: 'column_break_usxw' },
			{
				fieldtype: 'Signature',
				fieldname: 'patient_signature',
				label: __('Patient Signature')
			},
			{
				fieldtype: 'Date',
				fieldname: 'signed_date',
				label: __('Signed Date')
			},
			{
				fieldtype: 'Link',
				fieldname: 'amended_from',
				label: __('Amended From'),
				options: this.frm_doctype,
				read_only: 1,
				hidden: 1
			}
		];
	}

	set_defaults() {
		this.fields_dict.plan_type.set_value('Active');
		this.fields_dict.plan_date.set_value(frappe.datetime.get_today());
	}

	// ---------------------------------------------------------------
	// Procedure dropdown source — Item, loaded once on page open.
	// This is the only network call made at load time; it never
	// touches Dental Treatment Plan Procedure.
	// ---------------------------------------------------------------
	load_item_catalog() {
		var me = this;
		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: 'Item',
				filters: { disabled: 0 },
				fields: ['name', 'item_name', 'standard_rate'],
				limit_page_length: 0,
				order_by: 'item_name asc'
			},
			callback: function (r) {
				me.itemCatalog = r.message || [];
				me.render_procedure_table(); // refresh dropdown options once items are in
			}
		});
	}

	// ---------------------------------------------------------------
	// Hand-rolled procedures table — plain HTML, no frappe grid/meta.
	// ---------------------------------------------------------------
	render_procedure_table() {
		var me = this;

		if (!this.$table_wrap) {
			// Insert the table section right after the "Dental Treatment
			// Plan Procedure" section break, before Plan Note.
			this.$table_section = $(`
				<div class="dtp-procedure-section" style="margin: 0 var(--form-column-gap, 0) 20px;">
					<div style="font-size:14px;font-weight:500;margin-bottom:8px;">${__('Dental Treatment Plan Procedure')}</div>
					<div class="dtp-table-wrap"></div>
				</div>
			`);
			// Place it right after plan_note's section (i.e. right before
			// the "Totals" section break), so it visually sits where the
			// Table field used to be.
			var $noteField = this.$body.find('[data-fieldname="plan_note"]').closest('.form-column, .frappe-control');
			if ($noteField.length) {
				this.$table_section.insertBefore($noteField.closest('.section-body').length ? $noteField.closest('.section-body').parent() : $noteField);
			} else {
				this.$body.prepend(this.$table_section);
			}
			this.$table_wrap = this.$table_section.find('.dtp-table-wrap');
		}

		var itemOptions = this.itemCatalog.map(function (it) {
			return '<option value="' + it.name + '">' + frappe.utils.escape_html(it.item_name || it.name) + '</option>';
		}).join('');

		var rowsHtml = this.procedureRows.map(function (row, idx) {
			return `
				<tr data-uid="${row.uid}">
					<td style="width:26px;text-align:center;"><input type="checkbox" class="dtp-row-chk" data-uid="${row.uid}" ${me.selectedRowIds.has(row.uid) ? 'checked' : ''}></td>
					<td style="width:26px;text-align:center;color:var(--text-muted);font-size:11px;">${idx + 1}</td>
					<td>
						<select class="form-control dtp-cell dtp-procedure-edit" data-uid="${row.uid}">
							<option value="">— ${__('Select')} —</option>
							${itemOptions}
						</select>
					</td>
					<td><input type="text" class="form-control dtp-cell dtp-priority-edit" data-uid="${row.uid}" value="${frappe.utils.escape_html(row.priority || '')}" placeholder="1"></td>
					<td>
						<select class="form-control dtp-cell dtp-status-edit" data-uid="${row.uid}">
							${['Active', 'Inactive', 'Saved / Signed', 'Pre-Authorisation'].map(function (o) {
								return '<option ' + (o === row.status ? 'selected' : '') + '>' + o + '</option>';
							}).join('')}
						</select>
					</td>
					<td><input type="number" step="0.01" class="form-control dtp-cell dtp-fee-edit" data-uid="${row.uid}" value="${flt(row.fee)}" style="text-align:right"></td>
					<td><input type="text" class="form-control dtp-cell dtp-ins-edit" data-uid="${row.uid}" value="${frappe.utils.escape_html(row.insurance_estimate || '')}" style="text-align:right" placeholder="—"></td>
					<td><input type="number" step="0.01" class="form-control dtp-cell dtp-portion-edit" data-uid="${row.uid}" value="${flt(row.patient_portion)}" style="text-align:right"></td>
					<td style="width:26px;text-align:center;"><span class="dtp-row-rm" data-uid="${row.uid}" style="cursor:pointer;opacity:.6;" title="${__('Delete row')}">🗑</span></td>
				</tr>`;
		}).join('');

		var nSel = this.selectedRowIds.size;

		this.$table_wrap.html(`
			<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
				<button class="btn btn-xs btn-default" id="dtp-add-row-btn">${__('+ Add Row')}</button>
				<button class="btn btn-xs btn-default" id="dtp-dup-row-btn" ${nSel ? '' : 'disabled'}>${__('Duplicate')}${nSel ? ' (' + nSel + ')' : ''}</button>
				<button class="btn btn-xs btn-default" id="dtp-del-row-btn" ${nSel ? '' : 'disabled'}>${__('Delete')}${nSel ? ' (' + nSel + ')' : ''}</button>
			</div>
			${this.procedureRows.length ? `
			<div style="border:1px solid var(--border-color);border-radius:var(--border-radius);overflow:hidden;">
				<table class="table table-bordered" style="margin-bottom:0;font-size:12px;">
					<thead>
						<tr style="background:var(--control-bg);">
							<th></th><th>#</th>
							<th>${__('Procedure')}</th>
							<th style="width:70px;">${__('Priority')}</th>
							<th style="width:150px;">${__('Status')}</th>
							<th style="width:90px;">${__('Fee')}</th>
							<th style="width:100px;">${__('Insurance Est.')}</th>
							<th style="width:110px;">${__('Patient Portion')}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>${rowsHtml}</tbody>
				</table>
			</div>` : `<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:12px;border:1px dashed var(--border-color);border-radius:var(--border-radius);">${__('No rows yet — click "+ Add Row" to plan a procedure')}</div>`}
		`);

		this.bind_procedure_table_events();
	}

	bind_procedure_table_events() {
		var me = this;
		var $wrap = this.$table_wrap;

		$wrap.find('#dtp-add-row-btn').on('click', function () {
			me.procedureRows.push({
				uid: 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
				procedure: '', priority: '', status: 'Active',
				fee: 0, insurance_estimate: '', patient_portion: 0
			});
			me.render_procedure_table();
		});

		$wrap.find('#dtp-dup-row-btn').on('click', function () {
			me.selectedRowIds.forEach(function (uid) {
				var row = me.procedureRows.find(function (r) { return r.uid === uid; });
				if (row) {
					me.procedureRows.push(Object.assign({}, row, {
						uid: 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7)
					}));
				}
			});
			me.selectedRowIds = new Set();
			me.render_procedure_table();
		});

		$wrap.find('#dtp-del-row-btn').on('click', function () {
			me.procedureRows = me.procedureRows.filter(function (r) { return !me.selectedRowIds.has(r.uid); });
			me.selectedRowIds = new Set();
			me.render_procedure_table();
			me.recalculate_totals();
		});

		$wrap.find('.dtp-row-chk').on('change', function () {
			var uid = $(this).data('uid');
			if (this.checked) me.selectedRowIds.add(uid);
			else me.selectedRowIds.delete(uid);
			me.render_procedure_table();
		});

		$wrap.find('.dtp-row-rm').on('click', function () {
			var uid = $(this).data('uid');
			me.procedureRows = me.procedureRows.filter(function (r) { return r.uid !== uid; });
			me.selectedRowIds.delete(uid);
			me.render_procedure_table();
			me.recalculate_totals();
		});

		$wrap.find('.dtp-procedure-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (!row) return;
			row.procedure = $(this).val();
			var item = me.itemCatalog.find(function (it) { return it.name === row.procedure; });
			if (item) row.fee = flt(item.standard_rate);
			me.render_procedure_table();
			me.recalculate_totals();
		});

		$wrap.find('.dtp-priority-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (row) row.priority = $(this).val();
		});

		$wrap.find('.dtp-status-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (row) row.status = $(this).val();
		});

		$wrap.find('.dtp-fee-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (row) row.fee = flt($(this).val());
			me.recalculate_totals();
		});

		$wrap.find('.dtp-ins-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (row) row.insurance_estimate = $(this).val();
		});

		$wrap.find('.dtp-portion-edit').on('change', function () {
			var uid = $(this).data('uid');
			var row = me.procedureRows.find(function (r) { return r.uid === uid; });
			if (row) row.patient_portion = flt($(this).val());
			me.recalculate_totals();
		});
	}

	recalculate_totals() {
		var total_fee = 0;
		var total_patient_portion = 0;

		this.procedureRows.forEach(function (row) {
			total_fee += flt(row.fee);
			total_patient_portion += flt(row.patient_portion);
		});

		this.fields_dict.total_fee.set_value(total_fee);
		this.fields_dict.total_patient_portion.set_value(total_patient_portion);
		// total_insurance_estimate is left for manual entry since the
		// child field is free-text (Data), not numeric, per the spec.
	}

	// ---------------------------------------------------------------
	// Save — this is the FIRST point Dental Treatment Plan Procedure
	// is referenced. The doctype name is only used to tag the rows
	// we send; no client-side meta fetch happens.
	// ---------------------------------------------------------------
	save() {
		var me = this;
		var values = this.field_group.get_values();

		if (!values) return; // validation failed - FieldGroup already highlighted the field
		if (!values.patient) {
			frappe.msgprint(__('Patient is mandatory'));
			return;
		}

		var doc = Object.assign({ doctype: this.frm_doctype }, values);
		doc.dental_treatment_plan_procedure = this.procedureRows.map(function (row) {
			return {
				doctype: me.child_doctype,
				procedure: row.procedure,
				priority: row.priority,
				status: row.status,
				fee: flt(row.fee),
				insurance_estimate: row.insurance_estimate,
				patient_portion: flt(row.patient_portion)
			};
		});

		frappe.dom.freeze(__('Saving...'));

		if (this.docname) {
			doc.name = this.docname;
			frappe.call({
				method: 'frappe.client.save',
				args: { doc: doc },
				callback: function (r) {
					frappe.dom.unfreeze();
					if (r.message) me.after_save(r.message);
				},
				error: function () { frappe.dom.unfreeze(); }
			});
		} else {
			frappe.call({
				method: 'frappe.client.insert',
				args: { doc: doc },
				callback: function (r) {
					frappe.dom.unfreeze();
					if (r.message) me.after_save(r.message);
				},
				error: function () { frappe.dom.unfreeze(); }
			});
		}
	}

	after_save(doc) {
		this.docname = doc.name;
		frappe.show_alert({ message: __('Treatment Plan {0} saved', [doc.name]), indicator: 'green' });
		this.page.set_indicator(doc.name, 'blue');
	}

	// ---------------------------------------------------------------
	// New / Load History — the SECOND point Dental Treatment Plan
	// Procedure is referenced: frappe.client.get returns it as part
	// of the full parent document, server-side.
	// ---------------------------------------------------------------
	reset() {
		this.docname = null;
		this.procedureRows = [];
		this.selectedRowIds = new Set();
		this.field_group.set_values({
			patient: '',
			provider: '',
			plan_type: 'Active',
			plan_date: frappe.datetime.get_today(),
			plan_note: '',
			total_insurance_estimate: 0,
			total_fee: 0,
			total_patient_portion: 0,
			patient_signature: '',
			signed_date: '',
			amended_from: ''
		});
		this.render_procedure_table();
		this.page.clear_indicator();
	}

	load_plan_history() {
		var me = this;
		var patientId = this.fields_dict.patient.get_value();
		var filters = patientId ? { patient: patientId } : {};

		frappe.call({
			method: 'frappe.client.get_list',
			args: {
				doctype: this.frm_doctype,
				filters: filters,
				fields: ['name', 'patient', 'plan_date', 'plan_type', 'provider'],
				order_by: 'plan_date desc',
				limit_page_length: 20
			},
			callback: function (r) {
				var list = r.message || [];
				if (!list.length) {
					frappe.msgprint({
						title: __('No Plans Found'),
						message: patientId
							? __('No saved treatment plans for this patient.')
							: __('No saved treatment plans yet.'),
						indicator: 'orange'
					});
					return;
				}

				var d = new frappe.ui.Dialog({
					title: __('Select a Treatment Plan to Load'),
					fields: [{ fieldtype: 'HTML', fieldname: 'plan_list_html' }]
				});

				var rows = list.map(function (p) {
					return (
						'<div class="dtp-hist-item" data-name="' + p.name + '" style="display:flex;align-items:center;gap:12px;padding:8px 10px;border:1px solid var(--border-color);border-radius:6px;margin-bottom:5px;cursor:pointer;font-size:12px;">' +
							'<span style="font-family:monospace;font-weight:600">' + p.name + '</span>' +
							'<span>' + (p.patient || '') + '</span>' +
							'<span style="color:var(--text-muted)">' + frappe.datetime.str_to_user(p.plan_date) + '</span>' +
							'<span style="color:var(--text-muted);font-size:11px">' + (p.plan_type || '') + '</span>' +
						'</div>'
					);
				}).join('');

				d.fields_dict.plan_list_html.$wrapper.html(
					'<div style="max-height:340px;overflow-y:auto">' + rows + '</div>'
				);

				d.fields_dict.plan_list_html.$wrapper.on('click', '.dtp-hist-item', function (e) {
					var name = $(e.currentTarget).data('name');
					d.hide();
					me._load_plan_by_name(name);
				});

				d.show();
			}
		});
	}

	_load_plan_by_name(name) {
		var me = this;
		frappe.call({
			method: 'frappe.client.get',
			args: { doctype: this.frm_doctype, name: name },
			callback: function (r) {
				if (!r.message) return;
				var doc = r.message;
				me.docname = doc.name;
				me.field_group.set_values(doc);
				me.procedureRows = (doc.dental_treatment_plan_procedure || []).map(function (row) {
					return {
						uid: 'row_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
						procedure: row.procedure || '',
						priority: row.priority || '',
						status: row.status || 'Active',
						fee: flt(row.fee),
						insurance_estimate: row.insurance_estimate || '',
						patient_portion: flt(row.patient_portion)
					};
				});
				me.selectedRowIds = new Set();
				me.render_procedure_table();
				me.recalculate_totals();
				me.page.set_indicator(me.docname, 'blue');
				frappe.show_alert({ message: __('Loaded {0}', [me.docname]), indicator: 'green' });
			}
		});
	}
}