# Save as: apps/dental_clinic/dental_clinic/api/dashboard.py
# (also create an empty apps/dental_clinic/dental_clinic/api/__init__.py)
import frappe
from frappe.utils import nowdate, add_days, getdate, get_fullname

NEW_NEWS_DAYS = 60  # news newer than this gets the "New" badge


def _count(doctype, filters=None):
    """Count respecting the user's permissions (practice-level user permissions apply)."""
    if not frappe.db.exists("DocType", doctype):
        return 0
    return len(frappe.get_list(doctype, filters=filters or {}, pluck="name"))


@frappe.whitelist()
def get_dashboard_data():
    today = nowdate()

    data = {
        "user": get_fullname(frappe.session.user),
        "tasks": {
            "total": _count("Compliance Task"),
            "done": _count("Compliance Task", {"status": "Completed"}),
        },
        "policies": {
            "total": _count("Policy Document"),
            "reviewed": _count("Policy Document", {"status": "Reviewed"}),
        },
        "staff": {
            "total": _count("Staff Training Record"),
            "compliant": _count("Staff Training Record", {"status": "Valid"}),
        },
        "news": [],
        "events": [],
    }

    # Latest news
    if frappe.db.exists("DocType", "Compliance News"):
        cutoff = getdate(add_days(today, -NEW_NEWS_DAYS))
        for n in frappe.get_list(
            "Compliance News",
            fields=["name", "title", "posting_date"],
            order_by="posting_date desc",
            limit=5,
        ):
            data["news"].append({
                "doctype": "Compliance News",
                "name": n.name,
                "title": n.title,
                "date": str(n.posting_date),
                "is_new": getdate(n.posting_date) >= cutoff,
            })

    # Upcoming events: open compliance tasks due soon + calendar Events
    if frappe.db.exists("DocType", "Compliance Task"):
        for t in frappe.get_list(
            "Compliance Task",
            filters={"status": ["!=", "Completed"], "due_date": [">=", today]},
            fields=["name", "subject", "due_date"],
            order_by="due_date asc",
            limit=5,
        ):
            data["events"].append({
                "doctype": "Compliance Task", "name": t.name,
                "title": t.subject, "date": str(t.due_date),
            })

    for e in frappe.get_list(
        "Event",
        filters={"starts_on": [">=", today]},
        fields=["name", "subject", "starts_on"],
        order_by="starts_on asc",
        limit=5,
    ):
        data["events"].append({
            "doctype": "Event", "name": e.name,
            "title": e.subject, "date": str(getdate(e.starts_on)),
        })

    data["events"] = sorted(data["events"], key=lambda x: x["date"])[:5]
    return data