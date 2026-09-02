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
		this.make();
	}

	make() {
		this.setup_actions();
		this.render_field_group();
		this.bind_child_table_events();
		this.set_defaults();
	}

	// ---------------------------------------------------------------
	// Page actions (Save / New / Open existing)
	// ---------------------------------------------------------------
	setup_actions() {
		var me = this;

		this.page.set_primary_action(__('Save'), function () {
			me.save();
		}, 'save');

		this.page.add_menu_item(__('New Plan'), function () {
			me.reset();
		});

		this.page.add_menu_item(__('Open Existing Plan'), function () {
			me.load_existing();
		});

		this.page.add_menu_item(__('Recalculate Totals'), function () {
			me.recalculate_totals();
		});
	}

	// ---------------------------------------------------------------
	// Build the form using frappe.ui.FieldGroup
	// ---------------------------------------------------------------
	render_field_group() {
		var me = this;

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

		// keep the child grid handy
		this.grid_field = this.fields_dict.dental_treatment_plan_procedure;
	}

	get_fields() {
		return [
			{
				fieldtype: 'Link',
				fieldname: 'patient',
				label: __('Patient'),
				options: 'Patient',
				reqd: 1,
				get_query: () => ({ filters: { status: 'Active' } }),
				onchange: () => this.fetch_patient_defaults()
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
			{
				fieldtype: 'Table',
				fieldname: 'dental_treatment_plan_procedure',
				label: __('Procedures'),
				options: this.child_doctype,
				cannot_add_rows: false
			},
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

	// ---------------------------------------------------------------
	// Recalculate totals whenever a row in the child table changes
	// ---------------------------------------------------------------
	bind_child_table_events() {
		var me = this;

		// frappe fires this whenever a field on the given child doctype
		// is set anywhere (including inline grid edits)
		frappe.model.on(this.child_doctype, 'fee', function () {
			me.recalculate_totals();
		});
		frappe.model.on(this.child_doctype, 'insurance_estimate', function () {
			me.recalculate_totals();
		});
		frappe.model.on(this.child_doctype, 'patient_portion', function () {
			me.recalculate_totals();
		});

		// also catch row add / remove
		this.grid_field.$wrapper.on('click', '.grid-add-row, .grid-remove-rows, .grid-duplicate-row', function () {
			setTimeout(() => me.recalculate_totals(), 300);
		});
	}

	recalculate_totals() {
		var rows = this.grid_field.grid.get_data() || [];

		var total_fee = 0;
		var total_insurance_estimate = 0;
		var total_patient_portion = 0;

		rows.forEach(function (row) {
			total_fee += flt(row.fee);
			total_insurance_estimate += flt(row.insurance_estimate);
			total_patient_portion += flt(row.patient_portion);
		});

		this.fields_dict.total_fee.set_value(total_fee);
		this.fields_dict.total_insurance_estimate.set_value(total_insurance_estimate);
		this.fields_dict.total_patient_portion.set_value(total_patient_portion);
	}

	// ---------------------------------------------------------------
	// Convenience defaults
	// ---------------------------------------------------------------
	set_defaults() {
		this.fields_dict.plan_type.set_value('Active');
		this.fields_dict.plan_date.set_value(frappe.datetime.get_today());
	}

	fetch_patient_defaults() {
		// placeholder hook - e.g. auto-fill the provider from the
		// patient's last encounter, if desired.
	}

	// ---------------------------------------------------------------
	// Save (insert new, or update if a plan is already loaded)
	// ---------------------------------------------------------------
	save() {
		var me = this;
		var values = this.field_group.get_values();

		if (!values) {
			// validation failed - FieldGroup already highlighted the field
			return;
		}
		if (!values.patient) {
			frappe.msgprint(__('Patient is mandatory'));
			return;
		}

		var doc = Object.assign({ doctype: this.frm_doctype }, values);

		// normalise the child table rows for the API
		doc[this.child_doctype_fieldname()] = (doc.dental_treatment_plan_procedure || []).map(function (row) {
			return Object.assign({}, row, { doctype: me.child_doctype });
		});

		frappe.dom.freeze(__('Saving...'));

		var method = this.docname ? 'frappe.client.set_value' : 'frappe.client.insert';

		if (this.docname) {
			doc.name = this.docname;
			frappe.call({
				method: 'frappe.client.save',
				args: { doc: Object.assign(doc, { name: this.docname }) },
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

	child_doctype_fieldname() {
		return 'dental_treatment_plan_procedure';
	}

	after_save(doc) {
		this.docname = doc.name;
		frappe.show_alert({ message: __('Treatment Plan {0} saved', [doc.name]), indicator: 'green' });
		this.page.set_indicator(doc.name, 'blue');
	}

	// ---------------------------------------------------------------
	// New / Open existing
	// ---------------------------------------------------------------
	reset() {
		this.docname = null;
		this.field_group.set_values({
			patient: '',
			provider: '',
			plan_type: 'Active',
			plan_date: frappe.datetime.get_today(),
			dental_treatment_plan_procedure: [],
			plan_note: '',
			total_insurance_estimate: 0,
			total_fee: 0,
			total_patient_portion: 0,
			patient_signature: '',
			signed_date: '',
			amended_from: ''
		});
		this.page.clear_indicator();
	}

	load_existing() {
		var me = this;
		frappe.prompt(
			[{
				fieldtype: 'Link',
				fieldname: 'plan',
				label: __('Dental Treatment Plan'),
				options: this.frm_doctype,
				reqd: 1
			}],
			function (values) {
				frappe.call({
					method: 'frappe.client.get',
					args: { doctype: me.frm_doctype, name: values.plan },
					callback: function (r) {
						if (!r.message) return;
						me.docname = r.message.name;
						me.field_group.set_values(r.message);
						me.recalculate_totals();
						me.page.set_indicator(me.docname, 'blue');
					}
				});
			},
			__('Open Treatment Plan'),
			__('Open')
		);
	}
}