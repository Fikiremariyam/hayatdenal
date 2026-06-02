frappe.pages['dental-schedule'].on_page_load = function (wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Dental Schedule',
        single_column: true
    });

    $(wrapper).html(`
        <div id="calendar"></div>
    `);

    load_dependencies().then(() => {
        init_calendar();
    });
};


/* ---------------------------
   LOAD FULLCALENDAR (CORE ONLY)
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
   INIT
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

            let events = await load_events(assignments);

            render_calendar(events);
        }
    });
}


/* ---------------------------
   LOAD CHILD TABLE → FLATTEN EVENTS
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

        // 🔴 CHANGE THIS to your real child table fieldname
        let rows = doc.branch_schedule_assignment || [];

        rows.forEach(r => {

            if (!r.date) return;

            events.push({
                id: `${a.name}-${r.date}-${r.branch}`,

                start: `${r.date}T08:00:00`,
                end: `${r.date}T17:00:00`,

                title: `${a.employee_full_name || a.employee} • ${r.branch}`,

                extendedProps: {
                    employee: a.name,
                    branch: r.branch
                },

                backgroundColor: get_color(a.name),
                borderColor: "#ddd"
            });
        });
    }

    return events;
}


/* ---------------------------
   SIMPLE COLOR PER EMPLOYEE
----------------------------*/
function get_color(id) {

    let colors = [
        "#ffedd5",
        "#dadee4ff",
        "#dcfce7",
        "#fce7f3",
        "#643b0bff"
    ];

    let index = Math.abs(hashCode(id)) % colors.length;
    return colors[index];
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return hash;
}


/* ---------------------------
   RENDER CALENDAR (TIME GRID ONLY)
----------------------------*/
function render_calendar(events) {

    let calendarEl = document.getElementById('calendar');

    let calendar = new FullCalendar.Calendar(calendarEl, {

        initialView: 'timeGridDay',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'timeGridDay,timeGridWeek'
        },

        events: events,

        editable: true,
        selectable: true,

        slotMinTime: "08:00:00",
        slotMaxTime: "18:00:00",
        slotDuration: "00:15:00",

        height: "auto",

        /* -----------------------
           CLICK TO CREATE
        ------------------------*/
        dateClick: function (info) {

            frappe.show_alert("Clicked " + info.dateStr);
        },

        /* -----------------------
           DRAG
        ------------------------*/
        eventDrop: function (info) {
            frappe.show_alert("Moved event (you can persist later)");
        }
    });

    calendar.render();


    /* -----------------------
       CLINIC STYLE IMPROVEMENT
    ------------------------*/
  frappe.dom.set_style(`
    /* MAIN BACKGROUND */
    #calendar {
        padding: 12px;
        background: #532c2cff;
        border-radius: 10px;
    }

    /* TIME GRID BACKGROUND */
    .fc {
        background: #ffffff;
        font-family: Arial, sans-serif;
    }

    /* HEADER */
    .fc-toolbar {
        margin-bottom: 10px;
    }

    .fc-toolbar-title {
        font-size: 16px;
        font-weight: 600;
        color: #1f2937;
    }

    /* TIME COLUMN (LEFT SIDE) */
    .fc-timegrid-axis {
        background: #f8fafc;
        color: #475569;
        font-size: 12px;
        border-right: 1px solid #e5e7eb;
    }

    /* GRID LINES */
    .fc-timegrid-slot {
        border-color: #f1f5f9 !important;
    }

    .fc-timegrid-slot-lane {
        border-color: #f1f5f9 !important;
    }

    /* DAY HEADER */
    .fc-col-header-cell {
        background: #f8fafc;
        border-color: #e5e7eb;
        font-weight: 600;
        color: #334155;
    }

    /* EVENTS (APPOINTMENTS) */
    .fc-event {
        border: none !important;
        border-radius: 8px !important;
        padding: 4px 6px;
        font-size: 12px;
        font-weight: 500;
        color: #1f2937 !important;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    /* HOVER EFFECT */
    .fc-event:hover {
        transform: scale(1.01);
        transition: 0.1s ease-in-out;
        cursor: pointer;
    }

    /* CURRENT TIME LINE */
    .fc-timegrid-now-indicator-line {
        border-color: #ef4444;
    }

    .fc-timegrid-now-indicator-arrow {
        border-color: #ef4444;
    }

    /* SLOT HEIGHT CLEANER */
    .fc-timegrid-slot {
        height: 28px !important;
    }
`);
}