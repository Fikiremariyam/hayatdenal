"""
Compliance scheduling for the Dental Clinic app (ERPNext / Frappe v15).

Save as:  apps/dental_clinic/dental_clinic/compliance_scheduler.py
(the inner dental_clinic folder – the one that contains hooks.py)

What it does
  * Compliance Schedule (validate / on_update): works out the next due date and
    immediately creates any tasks that fall inside the "create days before" window.
  * Daily job: creates upcoming Compliance Tasks for every active schedule and
    assigns them to the employee (bell notification + ToDo).
  * Daily job: marks Open tasks whose due date has passed as Overdue.
  * Compliance Form Response (after_insert): if the response carries a
    compliance_task, that task is marked Completed and its assignment closed.
  * Optional: employees only see their own tasks (permission hooks).
"""

import frappe
from frappe.desk.form.assign_to import add as add_assignment
from frappe.utils import add_days, add_months, cint, formatdate, getdate, now_datetime, today

# ---------------------------------------------------------------------------
# Names – change these if your DocTypes / fields are named differently
# ---------------------------------------------------------------------------
SCHEDULE = "Compliance Schedule"
TASK = "Compliance Task"
FORM = "Dental Compliance Form"

TASK_TITLE_FIELD = "subject"          # title field on Compliance Task
STATUS_OPEN = "Open"
STATUS_OVERDUE = "Overdue"
STATUS_COMPLETED = "Completed"

MANAGER_ROLE = "Compliance Manager"   # users with this role see every task
MAX_TASKS_PER_RUN = 50                # safety limit per schedule per run

# frequency -> (days, months) between occurrences
STEP = {
	"Daily": (1, 0),
	"Weekly": (7, 0),
	"Fortnightly": (14, 0),
	"Monthly": (0, 1),
	"Quarterly": (0, 3),
	"Six-monthly": (0, 6),
	"Annually": (0, 12),
}


# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------
def occurrence(start_date, frequency, n):
	"""The n-th due date (0 = start date). Always counted from the start date,
	so monthly dates don't drift (31 Jan -> 28 Feb -> 31 Mar)."""
	days, months = STEP[frequency]
	start = getdate(start_date)
	return add_months(start, months * n) if months else add_days(start, days * n)


def first_occurrence_from_today(start_date, frequency):
	n = 0
	now = getdate(today())
	while getdate(occurrence(start_date, frequency, n)) < now and n < 10000:
		n += 1
	return n


# ---------------------------------------------------------------------------
# Compliance Schedule events
# ---------------------------------------------------------------------------
def validate_schedule(doc, method=None):
	if doc.frequency not in STEP:
		frappe.throw(f"Frequency must be one of: {', '.join(STEP)}")
	if doc.end_date and getdate(doc.end_date) < getdate(doc.start_date):
		frappe.throw("End Date cannot be before Start Date")
	if not doc.manager:
		doc.manager = frappe.session.user
	if cint(doc.create_days_before) < 0:
		doc.create_days_before = 0

	# New schedule, or start date / frequency changed: start counting from today
	if doc.is_new() or doc.has_value_changed("start_date") or doc.has_value_changed("frequency"):
		doc.occurrence_count = first_occurrence_from_today(doc.start_date, doc.frequency)

	doc.next_due_date = occurrence(doc.start_date, doc.frequency, cint(doc.occurrence_count))


def on_schedule_update(doc, method=None):
	"""Create tasks straight away when a schedule is saved."""
	if cint(doc.is_active):
		create_tasks_for_schedule(doc)


def create_tasks_for_schedule(schedule):
	"""Create every task due within the next `create_days_before` days. Returns the count."""
	horizon = getdate(add_days(today(), cint(schedule.create_days_before)))
	end = getdate(schedule.end_date) if schedule.end_date else None
	count = cint(schedule.occurrence_count)
	created = 0
	finished = False

	while created < MAX_TASKS_PER_RUN:
		due = getdate(occurrence(schedule.start_date, schedule.frequency, count))
		if end and due > end:
			finished = True
			break
		if due > horizon:
			break
		if not frappe.db.exists(TASK, {"compliance_schedule": schedule.name, "due_date": due}):
			make_task(schedule, due)
			created += 1
		count += 1

	values = {
		"occurrence_count": count,
		"next_due_date": occurrence(schedule.start_date, schedule.frequency, count),
	}
	if finished:
		values["is_active"] = 0
	frappe.db.set_value(SCHEDULE, schedule.name, values, update_modified=False)
	return created


def make_task(schedule, due):
	form_title = frappe.db.get_value(FORM, schedule.compliance_form, "title") or schedule.compliance_form
	task = frappe.get_doc({
		"doctype": TASK,
		TASK_TITLE_FIELD: f"{form_title} – due {formatdate(due)}",
		"compliance_form": schedule.compliance_form,
		"compliance_schedule": schedule.name,
		"assigned_to": schedule.assigned_to,
		"manager": schedule.manager,
		"due_date": due,
		"status": STATUS_OPEN,
	})
	task.insert(ignore_permissions=True)

	# Assign → employee gets a bell notification, an email and a ToDo
	try:
		add_assignment(
			{
				"doctype": TASK,
				"name": task.name,
				"assign_to": [schedule.assigned_to],
				"date": due,
				"description": f"Complete “{form_title}” by {formatdate(due)}",
			},
			ignore_permissions=True,
		)
	except Exception:
		frappe.log_error(title=f"Could not assign {task.name}")
	return task


# ---------------------------------------------------------------------------
# Daily jobs (registered in hooks.py → scheduler_events)
# ---------------------------------------------------------------------------
def generate_scheduled_tasks():
	for name in frappe.get_all(SCHEDULE, filters={"is_active": 1}, pluck="name"):
		try:
			create_tasks_for_schedule(frappe.get_doc(SCHEDULE, name))
			frappe.db.commit()
		except Exception:
			frappe.db.rollback()
			frappe.log_error(title=f"Compliance Schedule {name}: task generation failed")


def mark_overdue_tasks():
	overdue = frappe.get_all(
		TASK, filters={"status": STATUS_OPEN, "due_date": ["<", today()]}, pluck="name"
	)
	for name in overdue:
		try:
			task = frappe.get_doc(TASK, name)
			task.status = STATUS_OVERDUE
			task.save(ignore_permissions=True)   # save() so "Value Change" notifications fire
			frappe.db.commit()
		except Exception:
			frappe.db.rollback()
			frappe.log_error(title=f"Could not mark {name} overdue")


# ---------------------------------------------------------------------------
# Compliance Form Response → complete the task
# ---------------------------------------------------------------------------
def on_response_submitted(doc, method=None):
	task_name = doc.get("compliance_task")
	if not task_name or not frappe.db.exists(TASK, task_name):
		return

	task = frappe.get_doc(TASK, task_name)
	if task.status == STATUS_COMPLETED:
		return

	task.status = STATUS_COMPLETED
	task.completed_on = now_datetime()
	task.completed_by = doc.owner
	task.compliance_response = doc.name
	task.save(ignore_permissions=True)

	try:
		from frappe.desk.form.assign_to import close_all_assignments
		try:
			close_all_assignments(TASK, task.name, ignore_permissions=True)
		except TypeError:   # older signature without ignore_permissions
			close_all_assignments(TASK, task.name)
	except Exception:
		frappe.log_error(title=f"Could not close assignment on {task.name}")


# ---------------------------------------------------------------------------
# OPTIONAL – employees only see their own tasks (hooks.py → permission hooks)
# ---------------------------------------------------------------------------
def _is_manager(user):
	return user == "Administrator" or MANAGER_ROLE in frappe.get_roles(user) or "System Manager" in frappe.get_roles(user)


def task_query_conditions(user=None):
	user = user or frappe.session.user
	if _is_manager(user):
		return ""
	return f"(`tab{TASK}`.`assigned_to` = {frappe.db.escape(user)})"


def task_has_permission(doc, ptype=None, user=None):
	user = user or frappe.session.user
	if _is_manager(user):
		return True
	return doc.assigned_to == user
