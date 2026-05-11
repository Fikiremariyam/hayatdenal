import frappe

@frappe.whitelist()
def compare_periods():
    return {
        "message": "Comparison logic here"
    }