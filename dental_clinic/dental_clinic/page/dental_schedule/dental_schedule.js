frappe.pages['dental-schedule'].on_page_load = function (wrapper) {
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Dental Schedule',
        single_column: true
    });

    $(wrapper).html(`<div id="calendar"></div>`);

    load_dependencies().then(() => {
        init_calendar();
    });
};


/* ---------------------------
   LOAD FULLCALENDAR CDN
----------------------------*/
function load_dependencies() {
    return new Promise((resolve) => {
        if (window.FullCalendar) return resolve();

        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
        document.head.appendChild(css);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
        script.onload = resolve;
        document.head.appendChild(script);
    });
}


/* ---------------------------
   INIT CALENDAR
----------------------------*/
function init_calendar() {

    frappe.call({
        method: "frappe.client.get_list",
        args: {
            doctype: "Duty Assignment",
            fields: ["name", "employee", "employee_full_name"]
        },
        callback: async function (r) {

            let assignments = r.message || [];

            let resources = assignments.map(d => ({
                id: d.name,
                title: d.employee_full_name || d.employee
            }));

            let events = await load_events(assignments);

            render_calendar(resources, events);
        }
    });
}


/* ---------------------------
   LOAD EVENTS FROM CHILD TABLE
----------------------------*/
async function load_events(assignments) {

    let events = [];

    for (let a of assignments) {

        let res = await frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "Duty Assignment",
                name: a.name
            }
        });

        let doc = res.message;

        // ⚠️ CHANGE THIS to your actual child table fieldname
        let rows = doc.duty_child_table || [];

        rows.forEach(r => {

            if (!r.date) return;

            // simple full-day block (upgrade later if you add time fields)
            let start = `${r.date}T08:00:00`;
            let end = `${r.date}T17:00:00`;

            events.push({
                id: `${a.name}-${r.date}-${r.branch}`,
                resourceId: a.name,

                title: r.branch || "Duty",

                start: start,
                end: end,

                backgroundColor: "#ffedd5",
                borderColor: "#f97316",
                textColor: "#111"
            });
        });
    }

    return events;
}


/* ---------------------------
   RENDER CALENDAR
----------------------------*/
function render_calendar(resources, events) {

    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'resourceTimeGridDay',
        schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'resourceTimeGridDay,resourceTimeGridWeek'
        },

        resources: resources,
        events: events,

        editable: true,
        selectable: true,

        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:15:00",

        height: "auto",

        /* -----------------------
           DRAG / RESIZE
        ------------------------*/
        eventDrop: function (info) {
            frappe.show_alert("Drag detected (needs backend save if required)");
        },

        eventResize: function (info) {
            frappe.show_alert("Resize detected (needs backend save if required)");
        },

        /* -----------------------
           CLICK TO CREATE
        ------------------------*/
        dateClick: function (info) {

            frappe.prompt([
                {
                    fieldname: "branch",
                    label: "Branch / Service",
                    fieldtype: "Data",
                    reqd: 1
                }
            ], (values) => {

                frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Duty Assignment",
                        name: info.resource.id
                    },
                    callback: function (r) {

                        let doc = r.message;

                        // ⚠️ CHANGE THIS to your child table fieldname
                        doc.duty_child_table = doc.duty_child_table || [];

                        doc.duty_child_table.push({
                            date: info.dateStr,
                            day_name: "",
                            branch: values.branch
                        });

                        frappe.call({
                            method: "frappe.client.save",
                            args: {
                                doc: doc
                            },
                            callback: function () {
                                frappe.show_alert("Added to schedule");
                                location.reload();
                            }
                        });
                    }
                });
            });
        }
    });

    calendar.render();

    frappe.dom.set_style(`
        #calendar {
            padding: 10px;
            background: white;
        }

        .fc-event {
            font-size: 12px;
            border-radius: 6px;
            padding: 2px;
        }

        .fc-toolbar-title {
            font-size: 16px;
            font-weight: 600;
        }
    `);
}