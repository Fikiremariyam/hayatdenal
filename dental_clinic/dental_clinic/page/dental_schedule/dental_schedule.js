// frappe.pages['dental-schedule'].on_page_load = function (wrapper) {

//     let page = frappe.ui.make_app_page({
//         parent: wrapper,
//         title: 'Dental Schedule',
//         single_column: true
//     });

//     $(wrapper).html(`
//         <div id="calendar"></div>
//     `);

//     load_dependencies().then(() => {
//         init_calendar();
//     });
// };


// /* ---------------------------
//    LOAD FULLCALENDAR (CORE ONLY)
// ----------------------------*/
// function load_dependencies() {
//     return new Promise((resolve) => {
//         if (window.FullCalendar) return resolve();

//         const css = document.createElement('link');
//         css.rel = 'stylesheet';
//         css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.css';
//         document.head.appendChild(css);

//         const script = document.createElement('script');
//         script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.11/index.global.min.js';
//         script.onload = resolve;
//         document.head.appendChild(script);
//     });
// }


// /* ---------------------------
//    INIT
// ----------------------------*/
// function init_calendar() {

//     frappe.call({
//         method: "frappe.client.get_list",
//         args: {
//             doctype: "Duty Assignment",
//             fields: ["name", "employee", "employee_full_name"]
//         },
//         callback: async function (r) {

//             let assignments = r.message || [];

//             let events = await load_events(assignments);

//             render_calendar(events);
//         }
//     });
// }


// /* ---------------------------
//    LOAD CHILD TABLE → FLATTEN EVENTS
// ----------------------------*/
// // async function load_events(assignments) {

// //     let events = [];

// //     for (let a of assignments) {

// //         let res = await frappe.call({
// //             method: "frappe.client.get",
// //             args: {
// //                 doctype: "Duty Assignment",
// //                 name: a.name
// //             }
// //         });

// //         let doc = res.message;

// //         // 🔴 your child table fieldname
// //         let rows = doc.branch_schedule_assignment || [];

// //         rows.forEach(r => {

// //             if (!r.date) return;

// //             events.push({
// //                 id: `${a.name}-${r.date}-${r.branch}`,

// //                 start: `${r.date}T08:00:00`,
// //                 end: `${r.date}T17:00:00`,

// //                 title: `${a.employee_full_name || a.employee} • ${r.branch}`,

// //                 extendedProps: {
// //                     employee: a.name,
// //                     branch: r.branch
// //                 },

// //                 backgroundColor: get_color(a.name),
// //                 borderColor: "#ffffff",
// //                 textColor: "#1e3a8a"
// //             });
// //         });
// //     }

// //     return events;
// // }
// async function load_events(assignments) {

//     let events = [];

//     for (let a of assignments) {

//         let res = await frappe.call({
//             method: "frappe.client.get",
//             args: {
//                 doctype: "Duty Assignment",
//                 name: a.name
//             }
//         });

//         let doc = res.message;

//         let rows = doc.branch_schedule_assignment || [];

//         // 🧠 STEP 1: GET EMPLOYEE
//         let employee = doc.employee;

//         let crew_data = null;
//         let working_map = new Map();

//         // 🧠 STEP 2: GET EMPLOYEE DOC (to access Crew)
//         if (employee) {

//             let emp_res = await frappe.call({
//                 method: "frappe.client.get",
//                 args: {
//                     doctype: "Employee",
//                     name: employee
//                 }
//             });

//             let emp_doc = emp_res.message;

//             // 🧠 STEP 3: GET CREW FROM EMPLOYEE
//             if (emp_doc && emp_doc.crew) {

//                 let crew_res = await frappe.call({
//                     method: "frappe.client.get",
//                     args: {
//                         doctype: "Crew",
//                         name: emp_doc.crew
//                     }
//                 });

//                 crew_data = crew_res.message;

//                 // 🧠 STEP 4: BUILD WORKING DAYS MAP
//                 if (crew_data && crew_data.working_days) {
//                     crew_data.working_days.forEach(w => {
//                         working_map.set(w.date, w.shift_type);
//                     });
//                 }
//             }
//         }

//         // 🧠 STEP 5: BUILD EVENTS
//         rows.forEach(r => {

//             if (!r.date) return;

//             // 🚫 SKIP IF NOT IN WORKING DAYS (STRICT ENFORCEMENT)
//             if (working_map.size > 0 && !working_map.has(r.date)) {
//                 return;
//             }

//             let shift = working_map.get(r.date) || "";

//             events.push({
//                 id: `${a.name}-${r.date}-${r.branch}`,

//                 start: `${r.date}T08:00:00`,
//                 end: `${r.date}T17:00:00`,

//                 title: `${a.employee_full_name || a.employee} • ${r.branch}${shift ? " • " + shift : ""}`,

//                 extendedProps: {
//                     employee: a.employee,
//                     branch: r.branch,
//                     shift_type: shift
//                 },

//                 backgroundColor: get_color(a.name),
//                 borderColor: "#ffffff",
//                 textColor: "#1e3a8a"
//             });
//         });
//     }

//     return events;
// }

// /* ---------------------------
//    SIMPLE COLOR (PINK / BLUE ONLY)
// ----------------------------*/
// function get_color(id) {

//     let colors = [
//         "#bfdbfe", // light blue
//         "#fbcfe8", // pink
//         "#ffffff", // white
//         "#dbeafe", // soft blue
//         "#f9a8d4"  // deeper pink
//     ];

//     let index = Math.abs(hashCode(id)) % colors.length;
//     return colors[index];
// }

// function hashCode(str) {
//     let hash = 0;
//     for (let i = 0; i < str.length; i++) {
//         hash = ((hash << 5) - hash) + str.charCodeAt(i);
//         hash |= 0;
//     }
//     return hash;
// }


// /* ---------------------------
//    RENDER CALENDAR
// ----------------------------*/
// function render_calendar(events) {

//     let calendarEl = document.getElementById('calendar');

//     let calendar = new FullCalendar.Calendar(calendarEl, {

//         initialView: 'timeGridDay',

//         headerToolbar: {
//             left: 'prev,next today',
//             center: 'title',
//             right: 'timeGridDay,timeGridWeek'
//         },

//         events: events,

//         editable: true,
//         selectable: true,

//         slotMinTime: "08:00:00",
//         slotMaxTime: "18:00:00",
//         slotDuration: "00:15:00",

//         height: "auto",

//         dateClick: function (info) {
//             frappe.show_alert("Clicked " + info.dateStr);
//         },

//         eventDrop: function () {
//             frappe.show_alert("Moved event");
//         }
//     });

//     calendar.render();


//     /* ---------------------------
//        🎨 CLINIC UI THEME (BLUE / PINK / WHITE ONLY)
//     ----------------------------*/
//     frappe.dom.set_style(`

//         /* PAGE BACKGROUND */
//         #calendar {
//             padding: 14px;
//             background: #ffffff;
//             border-radius: 12px;
//         }

//         .fc {
//             font-family: "Inter", Arial, sans-serif;
//             font-size: 14px;
//             background: #ffffff;
//         }

//         /* 🔵 HEADER */
//         .fc-toolbar {
//             background: #2563eb;
//             padding: 12px;
//             border-radius: 10px;
//             margin-bottom: 12px;
//         }

//         .fc-toolbar-title {
//             color: #ffffff !important;
//             font-size: 18px;
//             font-weight: 700;
//         }

//         .fc-button {
//             background: #ffffff !important;
//             border: none !important;
//             color: #2563eb !important;
//             font-weight: 600;
//             border-radius: 8px !important;
//         }

//         .fc-button:hover {
//             background: #dbeafe !important;
//         }

//         .fc-button-active {
//             background: #bfdbfe !important;
//         }

//         /* GRID AREA */
//         .fc-timegrid-slot,
//         .fc-timegrid-slot-lane {
//             border-color: #e5e7eb !important;
//         }

//         .fc-col-header-cell {
//             background: #eff6ff;
//             color: #1e3a8a;
//             font-weight: 700;
//         }

//         .fc-timegrid-axis {
//             background: #f8fafc;
//             color: #1e3a8a;
//             font-weight: 600;
//         }

//         /* 🩷 EVENTS */
//         .fc-event {
//             border: none !important;
//             border-radius: 10px !important;
//             padding: 5px 6px;
//             font-size: 13px;
//             font-weight: 600;
//             color: #1e3a8a !important;
//             box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
//         }

//         .fc-event:hover {
//             transform: scale(1.02);
//             transition: 0.15s ease-in-out;
//             cursor: pointer;
//         }

//         /* CURRENT TIME LINE */
//         .fc-timegrid-now-indicator-line {
//             border-color: #2563eb;
//         }

//         .fc-timegrid-now-indicator-arrow {
//             border-color: #9ea1a8ff;
//         }

//         .fc-timegrid-slot {
//             height: 30px !important;
//         }
//     `);
// }



frappe.pages['dental-schedule'].on_page_load = function (wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Dental Schedule',
        single_column: true
    });

    $(wrapper).html(`
       <!-- FIXED TOP WRAPPER -->
        <div id="top_bar" style="
            position: sticky;
            top: 0;
            z-index: 2000;
            background: #969090ff;
            padding: 10px 0;
        ">

            <!-- HEADER (CENTERED) -->
            <div id="dental_header" style="
                font-size:22px;
                font-weight:800;
                text-align:center;
                padding:10px 14px;
                background:#9ea1a8ff;
                border-radius:10px;
                margin: 0 12px 10px 12px;
            ">
                Dental Schedule
            </div>

            <!-- FILTER BAR -->
            <div id="filter_bar" style="
                display:flex;
                justify-content:center;
                gap:12px;
                padding:10px;
                background:#fff;
                border-radius:10px;
                margin: 0 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
            ">

                <select id="service_unit_filter" style="padding:6px; border:1px solid #ddd; border-radius:6px;">
                    <option value="">All Service Units</option>
                </select>

                <select id="employee_filter" style="padding:6px; border:1px solid #ddd; border-radius:6px;">
                    <option value="">All Employees</option>
                </select>

            </div>
        </div>

        <!-- CALENDAR -->
        <div id="calendar"></div>
    `);

    load_dependencies().then(() => {
        init_calendar();
    });
};


/* ---------------------------
   LOAD FULLCALENDAR
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
   LOAD EVENTS (Crew + Working Days logic)
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
        let rows = doc.branch_schedule_assignment || [];

        let employee = doc.employee;
        let working_map = new Map();

        /* ---------------------------
           Employee → Crew → Working Days
        ----------------------------*/
        if (employee) {

            let emp_res = await frappe.call({
                method: "frappe.client.get",
                args: {
                    doctype: "Employee",
                    name: employee
                }
            });

            let emp_doc = emp_res.message;

            if (emp_doc && emp_doc.crew) {

                let crew_res = await frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Crew",
                        name: emp_doc.crew
                    }
                });

                let crew = crew_res.message;

                if (crew && crew.working_days) {
                    crew.working_days.forEach(w => {
                        working_map.set(w.date, w.shift_type);
                    });
                }
            }
        }

        /* ---------------------------
           BUILD EVENTS
        ----------------------------*/
        rows.forEach(r => {

            if (!r.date) return;

            // skip non-working days
            if (working_map.size > 0 && !working_map.has(r.date)) return;

            let shift = working_map.get(r.date) || "";

            events.push({
                id: `${a.name}-${r.date}-${r.branch}`,

                start: `${r.date}T08:00:00`,
                end: `${r.date}T17:00:00`,

                title: `${a.employee_full_name} • ${r.branch}${shift ? " • " + shift : ""}`,

                extendedProps: {
                    employee_id: a.employee,
                    employee_name: a.employee_full_name,
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
   COLOR SYSTEM (BLUE / PINK / WHITE ONLY)
----------------------------*/
function get_color(id) {

    let colors = [
        "#bfdbfe",
        "#fbcfe8",
        "#ffffff",
        "#dbeafe",
        "#f9a8d4"
    ];

    return colors[Math.abs(hashCode(id)) % colors.length];
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

    let ALL_EVENTS = events;
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
       FILTER LOGIC
    ----------------------------*/
    function apply_filters() {

        let service_unit = $("#service_unit_filter").val();
        let employee = $("#employee_filter").val();

        let filtered = ALL_EVENTS.filter(e => {

            let ok_service = true;
            let ok_employee = true;

            if (service_unit) {
                ok_service = e.extendedProps.branch === service_unit;
            }

            if (employee) {
                ok_employee = e.extendedProps.employee_id === employee;
            }

            return ok_service && ok_employee;
        });

        calendar.removeAllEvents();
        calendar.addEventSource(filtered);
    }

    $("#service_unit_filter, #employee_filter").on("change", apply_filters);


    /* ---------------------------
       POPULATE FILTERS
    ----------------------------*/
    let service_units = [...new Set(events.map(e => e.extendedProps.branch))];

    let employee_map = new Map();

    events.forEach(e => {
        if (e.extendedProps.employee_id) {
            employee_map.set(
                e.extendedProps.employee_id,
                e.extendedProps.employee_name
            );
        }
    });

    service_units.forEach(s => {
        if (s) {
            $("#service_unit_filter").append(`<option value="${s}">${s}</option>`);
        }
    });

    employee_map.forEach((name, id) => {
        $("#employee_filter").append(`<option value="${id}">${name}</option>`);
    });


    /* ---------------------------
       🎨 CLINIC UI (BLUE / PINK / WHITE)
    ----------------------------*/
    frappe.dom.set_style(`

        #calendar {
            padding: 14px;
            background: #ffffff;
            border-radius: 12px;
        }

        .fc {
            font-family: Inter, Arial;
            font-size: 14px;
        }

        .fc-toolbar {
            background: #2563eb;
            padding: 12px;
            border-radius: 10px;
        }

        .fc-toolbar-title {
            color: #fff !important;
            font-size: 18px;
            font-weight: 700;
        }

        .fc-button {
            background: #fff !important;
            color: #2563eb !important;
            border: none !important;
            font-weight: 600;
        }

        .fc-button:hover {
            background: #dbeafe !important;
        }

        .fc-col-header-cell {
            background: #eff6ff;
            color: #1e3a8a;
            font-weight: 700;
        }

        .fc-timegrid-axis {
            background: #f8fafc;
            color: #1e3a8a;
        }

        .fc-event {
            border-radius: 10px !important;
            font-weight: 600;
            color: #1e3a8a !important;
            box-shadow: 0 2px 6px rgba(37,99,235,0.15);
        }

        .fc-timegrid-slot {
            height: 30px !important;
        }
    `);
}