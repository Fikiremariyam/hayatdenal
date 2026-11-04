# ---------------------------------------------------------------------------
# Add these to apps/dental_clinic/dental_clinic/hooks.py
# If hooks.py ALREADY has doc_events / scheduler_events / permission_query_conditions /
# has_permission, merge these entries into the existing dictionaries instead of
# pasting a second copy (a second copy would overwrite the first).
# ---------------------------------------------------------------------------

scheduler_events = {
	"daily": [
		"dental_clinic.compliance_scheduler.generate_scheduled_tasks",
		"dental_clinic.compliance_scheduler.mark_overdue_tasks",
	],
}

doc_events = {
	"Compliance Schedule": {
		"validate": "dental_clinic.compliance_scheduler.validate_schedule",
		"on_update": "dental_clinic.compliance_scheduler.on_schedule_update",
	},
	"Compliance Form Response": {
		"after_insert": "dental_clinic.compliance_scheduler.on_response_submitted",
	},
}

# OPTIONAL – employees only see tasks assigned to them
permission_query_conditions = {
	"Compliance Task": "dental_clinic.compliance_scheduler.task_query_conditions",
}
has_permission = {
	"Compliance Task": "dental_clinic.compliance_scheduler.task_has_permission",
}
