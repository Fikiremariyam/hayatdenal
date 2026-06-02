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

        // 🔴 your child table fieldname
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
                borderColor: "#ffffff",
                textColor: "#1e3a8a"
            });
        });
    }

    return events;
}


/* ---------------------------
   SIMPLE COLOR (PINK / BLUE ONLY)
----------------------------*/
function get_color(id) {

    let colors = [
        "#bfdbfe", // light blue
        "#fbcfe8", // pink
        "#ffffff", // white
        "#dbeafe", // soft blue
        "#f9a8d4"  // deeper pink
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
   RENDER CALENDAR
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

        dateClick: function (info) {
            frappe.show_alert("Clicked " + info.dateStr);
        },

        eventDrop: function () {
            frappe.show_alert("Moved event");
        }
    });

    calendar.render();


    /* ---------------------------
       🎨 CLINIC UI THEME (BLUE / PINK / WHITE ONLY)
    ----------------------------*/
    frappe.dom.set_style(`

        /* PAGE BACKGROUND */
        #calendar {
            padding: 14px;
            background: #ffffff;
            border-radius: 12px;
        }

        .fc {
            font-family: "Inter", Arial, sans-serif;
            font-size: 14px;
            background: #ffffff;
        }

        /* 🔵 HEADER */
        .fc-toolbar {
            background: #2563eb;
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 12px;
        }

        .fc-toolbar-title {
            color: #ffffff !important;
            font-size: 18px;
            font-weight: 700;
        }

        .fc-button {
            background: #ffffff !important;
            border: none !important;
            color: #2563eb !important;
            font-weight: 600;
            border-radius: 8px !important;
        }

        .fc-button:hover {
            background: #dbeafe !important;
        }

        .fc-button-active {
            background: #bfdbfe !important;
        }

        /* GRID AREA */
        .fc-timegrid-slot,
        .fc-timegrid-slot-lane {
            border-color: #e5e7eb !important;
        }

        .fc-col-header-cell {
            background: #eff6ff;
            color: #1e3a8a;
            font-weight: 700;
        }

        .fc-timegrid-axis {
            background: #f8fafc;
            color: #1e3a8a;
            font-weight: 600;
        }

        /* 🩷 EVENTS */
        .fc-event {
            border: none !important;
            border-radius: 10px !important;
            padding: 5px 6px;
            font-size: 13px;
            font-weight: 600;
            color: #1e3a8a !important;
            box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
        }

        .fc-event:hover {
            transform: scale(1.02);
            transition: 0.15s ease-in-out;
            cursor: pointer;
        }

        /* CURRENT TIME LINE */
        .fc-timegrid-now-indicator-line {
            border-color: #2563eb;
        }

        .fc-timegrid-now-indicator-arrow {
            border-color: #2563eb;
        }

        .fc-timegrid-slot {
            height: 30px !important;
        }
    `);
}