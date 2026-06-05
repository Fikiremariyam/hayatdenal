// frappe.pages['questionnaire-form'].on_page_load = function(wrapper) {

//     $(wrapper).html(
//         '<div id="q-app" style="max-width:700px;margin:40px auto;padding:0 24px">'
//         + '<p style="color:var(--text-muted)">Loading questionnaire...</p>'
//         + '</div>'
//     );

//     var app = $(wrapper).find('#q-app');

//     var params = frappe.utils.get_query_params();
//     var qname  = params.questionnaire;

//     if (!qname) {
//         app.html(
//             '<div style="text-align:center;padding:60px 20px">'
//             + '<p style="color:var(--text-muted)">No questionnaire specified in the URL.</p>'
//             + '<p style="color:var(--text-muted);font-size:12px">'
//             + 'Use: /app/questionnaire-form?questionnaire=YOUR-DOC-NAME</p>'
//             + '</div>'
//         );
//         return;
//     }

//     frappe.call({
//         method: 'frappe.client.get',
//         args: { doctype: 'Questionnaire', name: qname },
//         callback: function(r) {
//             if (!r.message) {
//                 app.html('<p style="color:red;padding:20px">Questionnaire not found</p>');
//                 return;
//             }
//             renderQuestionnaire(app, r.message);
//         }
//     });
// };

// function renderQuestionnaire(app, q) {

//     var sections  = {};
//     var secOrder  = [];

//     (q.questions || []).forEach(function(row) {
//         var sec = row.section || 'General';
//         if (!sections[sec]) {
//             sections[sec] = [];
//             secOrder.push(sec);
//         }
//         sections[sec].push(row);
//     });

//     var currentSection = 0;
//     var answers = {};

//     function getOptions(question) {
//         return (question.options || '')
//             .split('\n')
//             .map(function(opt) { return opt.trim(); })
//             .filter(function(opt) { return opt; });
//     }

//     function renderSection(idx) {

//         var secName = secOrder[idx];
//         var questions = sections[secName];
//         var pct = Math.round(((idx + 1) / secOrder.length) * 100);
//         var isLast = idx === secOrder.length - 1;

//         app.empty();

//         app.append(
//             '<p style="font-size:12px;color:var(--text-muted)">Section '
//             + (idx + 1) + ' of ' + secOrder.length + ' — ' + secName + '</p>'
//             + '<div style="height:4px;background:var(--border-color);margin-bottom:20px">'
//             + '<div style="height:4px;background:var(--primary);width:' + pct + '%"></div></div>'
//             + '<h2>' + q.title + '</h2>'
//             + '<p style="color:var(--text-muted)">' + (q.description || '') + '</p>'
//         );

//         questions.forEach(function(question, qi) {

//             var saved = answers[question.name];

//             var qblock = $(
//                 '<div style="margin-bottom:20px">'
//                 + '<p><b>' + (qi + 1) + '. ' + question.label + '</b></p>'
//                 + '</div>'
//             );

//             // ================= SELECT (FIXED) =================
//             if (question.question_type === 'Select') {

//                 var sel = $('<select class="form-control" style="max-width:420px"></select>');
//                 sel.append('<option value="">— choose —</option>');

//                 getOptions(question).forEach(function(opt) {
//                     sel.append(
//                         '<option value="' + opt + '"'
//                         + (saved === opt ? ' selected' : '') + '>'
//                         + opt + '</option>'
//                     );
//                 });

//                 sel.on('change', function() {
//                     answers[question.name] = this.value;
//                 });

//                 qblock.append(sel);
//             }

//             // ================= MULTI SELECT (FIXED) =================
//             else if (question.question_type === 'Multi-select') {

//                 var wrap = $('<div></div>');
//                 var options = getOptions(question);

//                 options.forEach(function(opt) {

//                     var checked = Array.isArray(saved) && saved.includes(opt);

//                     var row = $(
//                         '<div style="display:flex;gap:8px;margin-bottom:6px">'
//                         + '<input type="checkbox" value="' + opt + '"' + (checked ? ' checked' : '') + '>'
//                         + '<label>' + opt + '</label>'
//                         + '</div>'
//                     );

//                     row.on('change', function() {
//                         var vals = [];
//                         wrap.find('input:checked').each(function() {
//                             vals.push(this.value);
//                         });
//                         answers[question.name] = vals;
//                     });

//                     wrap.append(row);
//                 });

//                 qblock.append(wrap);
//             }

//             else if (question.question_type === 'Rating') {

//                 var max = question.max_value || 5;
//                 var starWrap = $('<div></div>');

//                 for (let i = 1; i <= max; i++) {
//                     let star = $('<span style="font-size:24px;cursor:pointer">★</span>');

//                     star.on('click', function() {
//                         answers[question.name] = i;
//                         starWrap.find('span').css('color', 'gray');
//                         star.css('color', 'gold');
//                     });

//                     starWrap.append(star);
//                 }

//                 qblock.append(starWrap);
//             }
// 			else if (question.question_type === 'Date') {

//     var inp = $(
//         '<input type="date" class="form-control" style="max-width:220px" />'
//     );

//     if (saved) {
//         inp.val(saved);
//     }

//     inp.on('input', function() {
//         answers[question.name] = this.value;
//     });

//     qblock.append(inp);
// }

//             else {
//                 var inp = $('<input class="form-control" />');

//                 inp.on('input', function() {
//                     answers[question.name] = this.value;
//                 });

//                 qblock.append(inp);
//             }

//             app.append(qblock);
//         });

//         var nav = $(
//             '<div style="margin-top:20px;display:flex;justify-content:space-between">'
//             + '<button class="btn btn-default">Prev</button>'
//             + '<button class="btn btn-primary">' + (isLast ? 'Submit' : 'Next') + '</button>'
//             + '</div>'
//         );

//         nav.find('.btn-default').on('click', function() {
//             if (currentSection > 0) {
//                 currentSection--;
//                 renderSection(currentSection);
//             }
//         });

//         nav.find('.btn-primary').on('click', function() {
//             if (isLast) {
//                 submitResponse(q, answers, app);
//             } else {
//                 currentSection++;
//                 renderSection(currentSection);
//             }
//         });

//         app.append(nav);
//     }

//     renderSection(0);
// }

// function submitResponse(q, answers, app) {

//     app.html('<p style="text-align:center">Submitting...</p>');

//     var answerRows = [];
//     var totalScore = 0;

//     (q.questions || []).forEach(function(question) {

//         var val = answers[question.name];
//         if (!val) return;

//         var answerText = Array.isArray(val) ? val.join(', ') : val;

//         var scoreAwarded = 0;

//         if (question.question_type === 'Rating') {
//             var max = question.max_value || 5;
//             scoreAwarded = (parseFloat(val) / max) * (question.score_weight || 0);
//         }

//         else if (question.correct_answer && answerText === question.correct_answer) {
//             scoreAwarded = question.score_weight || 0;
//         }

//         totalScore += scoreAwarded;

//         answerRows.push({
//             custom_question: question.name,
//              custom_question_label: question.label,
//               custom_answer_text: answerText,
//              custom_answer_option:
//         question.question_type === "Select"
//             ? answerText
//             : null
//         });
//     });

//     frappe.call({
//         method: 'frappe.client.insert',
//         args: {
//             doc: {
//                 doctype: 'Questionnaire Response',
//                 questionnaire: q.name,
//                 respondent: frappe.session.user,
//                 respondent_name: frappe.session.user_fullname,
//                 status: 'Submitted',
//                 submitted_at: frappe.datetime.now_datetime(),
//                 total_score: Math.round(totalScore * 10) / 10,
//                 custom_answers: answerRows
//             }
//         },
//         callback: function() {
//             app.html(
//                 '<div style="text-align:center;padding:60px 20px">'
//                 + '<div style="font-size:52px;color:green">✓</div>'
//                 + '<h2>' + (q.thank_you_message || 'Thank you!') + '</h2>'
//                 + '</div>'
//             );
//         }
//     });
// }


frappe.pages['questionnaire-form'].on_page_load = function(wrapper) {

    // ── CREATE THE APP DIV ──────────────────────────────────────
    $(wrapper).html(
        '<div id="q-app" style="max-width:700px;margin:40px auto;padding:0 24px">'
        + '<p style="color:var(--text-muted)">Loading questionnaire...</p>'
        + '</div>'
    );

    var app = $(wrapper).find('#q-app');
    var params = frappe.utils.get_query_params();
    var qname  = params.questionnaire;

    if (!qname) {
        app.html(
            '<div style="text-align:center;padding:60px 20px">'
            + '<p style="color:var(--text-muted)">No questionnaire specified.</p>'
            + '<p style="font-size:12px;color:var(--text-muted)">Use: /app/questionnaire-form?questionnaire=YOUR-DOC-NAME</p>'
            + '</div>'
        );
        return;
    }

    // ── FETCH USING PLAIN fetch() — WORKS FOR GUEST USERS ──────
    fetch(
        '/api/method/frappe.client.get?doctype=Questionnaire&name='
        + encodeURIComponent(qname),
        {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Frappe-CSRF-Token': frappe.csrf_token || 'fetch'
            }
        }
    )
    .then(function(response) { return response.json(); })
    .then(function(data) {
        if (!data.message) {
            app.html(
                '<p style="color:red;padding:20px">'
                + 'Questionnaire "' + qname + '" not found.<br>'
                + '<small>Check: 1) doc name is correct 2) Guest role has Read permission on Questionnaire DocType</small>'
                + '</p>'
            );
            return;
        }
        renderQuestionnaire(app, data.message);
    })
    .catch(function(err) {
        app.html('<p style="color:red;padding:20px">Error loading: ' + err.message + '</p>');
    });
};

// ── RENDER THE FORM ─────────────────────────────────────────────
function renderQuestionnaire(app, q) {

    var sections = {};
    var secOrder = [];

    (q.questions || []).forEach(function(row) {
        var sec = row.section || 'General';
        if (!sections[sec]) {
            sections[sec] = [];
            secOrder.push(sec);
        }
        sections[sec].push(row);
    });

    if (secOrder.length === 0) {
        app.html('<p style="color:var(--text-muted);padding:20px">No questions found.</p>');
        return;
    }

    var currentSection = 0;
    var answers = {};

    function getOptions(question) {
        return (question.options || '')
            .split('\n')
            .map(function(o) { return o.trim(); })
            .filter(function(o) { return o; });
    }

    function renderSection(idx) {

        var secName   = secOrder[idx];
        var questions = sections[secName];
        var pct       = Math.round(((idx + 1) / secOrder.length) * 100);
        var isLast    = idx === secOrder.length - 1;

        app.empty();

        app.append(
            '<p style="font-size:12px;color:var(--text-muted);margin:0 0 5px">Section '
            + (idx + 1) + ' of ' + secOrder.length + ' \u2014 ' + secName + '</p>'
            + '<div style="height:4px;background:var(--border-color);border-radius:2px;margin-bottom:20px">'
            + '<div style="height:4px;background:var(--primary);border-radius:2px;width:' + pct + '%"></div></div>'
            + '<h2 style="font-size:20px;font-weight:500;margin:0 0 4px">' + q.title + '</h2>'
            + '<p style="font-size:13px;color:var(--text-muted);margin:0 0 24px">' + (q.description || '') + '</p>'
        );

        questions.forEach(function(question, qi) {

            var saved  = answers[question.name];
            var req    = question.is_required ? ' <span style="color:red">*</span>' : '';
            var hint   = question.help_text
                ? '<p style="font-size:12px;color:var(--text-muted);margin:0 0 8px">' + question.help_text + '</p>'
                : '';

            var qblock = $(
                '<div style="margin-bottom:20px">'
                + '<p style="font-size:14px;font-weight:500;margin:0 0 4px">'
                + (qi + 1) + '. ' + question.label + req + '</p>'
                + hint
                + '</div>'
            );

            // SELECT
            if (question.question_type === 'Select') {
                var sel = $('<select class="form-control" style="max-width:420px"></select>');
                sel.append('<option value="">\u2014 choose \u2014</option>');
                getOptions(question).forEach(function(opt) {
                    sel.append(
                        '<option value="' + opt + '"'
                        + (saved === opt ? ' selected' : '') + '>'
                        + opt + '</option>'
                    );
                });
                sel.on('change', function() { answers[question.name] = this.value; });
                qblock.append(sel);

            // MULTI-SELECT
            } else if (question.question_type === 'Multi-select') {
                var wrap = $('<div></div>');
                getOptions(question).forEach(function(opt) {
                    var checked = Array.isArray(saved) && saved.indexOf(opt) !== -1;
                    var row = $(
                        '<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;'
                        + 'border:0.5px solid var(--border-color);border-radius:6px;margin-bottom:5px">'
                        + '<input type="checkbox" value="' + opt + '"' + (checked ? ' checked' : '') + '>'
                        + '<label style="margin:0;cursor:pointer">' + opt + '</label>'
                        + '</div>'
                    );
                    row.on('change', function() {
                        var vals = [];
                        wrap.find('input:checked').each(function() { vals.push(this.value); });
                        answers[question.name] = vals;
                    });
                    wrap.append(row);
                });
                qblock.append(wrap);

            // RATING
            } else if (question.question_type === 'Rating') {
                var max = question.max_value || 5;
                var starWrap = $('<div style="display:flex;gap:6px;margin-top:4px"></div>');
                for (var s = 1; s <= max; s++) {
                    (function(val) {
                        var star = $(
                            '<span data-val="' + val + '" style="font-size:28px;cursor:pointer;color:'
                            + (saved >= val ? '#FAC775' : 'var(--border-color)') + '">\u2605</span>'
                        );
                        star.on('click', function() {
                            answers[question.name] = val;
                            starWrap.find('span').each(function() {
                                $(this).css('color',
                                    answers[question.name] >= parseInt($(this).data('val'))
                                    ? '#FAC775' : 'var(--border-color)'
                                );
                            });
                        });
                        starWrap.append(star);
                    })(s);
                }
                qblock.append(starWrap);

            // DATE
            } else if (question.question_type === 'Date') {
                var inp = $('<input type="date" class="form-control" style="max-width:220px">');
                if (saved) inp.val(saved);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            // PARAGRAPH
            } else if (question.question_type === 'Paragraph') {
                var inp = $('<textarea class="form-control" rows="3" style="max-width:520px"></textarea>');
                if (saved) inp.val(saved);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            // TEXT / DEFAULT
            } else {
                var inp = $('<input type="text" class="form-control" style="max-width:420px">');
                if (saved) inp.val(saved);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);
            }

            app.append(qblock);
        });

        // NAVIGATION
        var nav = $(
            '<div style="display:flex;justify-content:space-between;align-items:center;'
            + 'margin-top:24px;padding-top:16px;border-top:1px solid var(--border-color)">'
            + '<button class="btn btn-default" id="btn-prev"'
            + (idx === 0 ? ' disabled' : '') + '>\u2190 Previous</button>'
            + '<span style="font-size:12px;color:var(--text-muted)">'
            + (idx + 1) + ' / ' + secOrder.length + '</span>'
            + '<button class="btn btn-primary" id="btn-next">'
            + (isLast ? 'Submit' : 'Next \u2192') + '</button>'
            + '</div>'
        );

        nav.find('#btn-prev').on('click', function() {
            currentSection--;
            renderSection(currentSection);
        });

        nav.find('#btn-next').on('click', function() {
            // Validate required
            var allValid = true;
            questions.forEach(function(question) {
                if (!question.is_required) return;
                var val = answers[question.name];
                if (!val || (Array.isArray(val) && val.length === 0)) {
                    allValid = false;
                    frappe.msgprint('Please answer: ' + question.label);
                }
            });
            if (!allValid) return;

            if (isLast) {
                submitResponse(q, answers, app);
            } else {
                currentSection++;
                renderSection(currentSection);
            }
        });

        app.append(nav);
    }

    renderSection(0);
}

// ── SUBMIT — WORKS FOR BOTH GUEST AND LOGGED IN USERS ──────────
function submitResponse(q, answers, app) {

    app.html('<p style="text-align:center;color:var(--text-muted);padding:60px">Submitting...</p>');

    var answerRows = [];
    var totalScore = 0;

    (q.questions || []).forEach(function(question) {
        var val = answers[question.name];
        if (!val && val !== 0) return;

        var answerText   = Array.isArray(val) ? val.join(', ') : String(val);
        var scoreAwarded = 0;

        if (question.question_type === 'Rating') {
            scoreAwarded = (parseFloat(val) / (question.max_value || 5)) * (question.score_weight || 0);
        } else if (question.correct_answer && answerText === question.correct_answer) {
            scoreAwarded = question.score_weight || 0;
        }

        totalScore += scoreAwarded;

        answerRows.push({
            question:       question.name,
            question_label: question.label,
            answer_text:    answerText,
            score_awarded:  scoreAwarded
        });
    });

    // ── USE fetch() NOT frappe.call() SO GUEST CAN SUBMIT ──────
    fetch('/api/method/frappe.client.insert', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept':       'application/json',
            'X-Frappe-CSRF-Token': frappe.csrf_token || 'fetch'
        },
        body: JSON.stringify({
            doc: {
                doctype:        'Questionnaire Response',
                questionnaire:  q.name,
                respondent_name: frappe.session.user !== 'Guest'
                                 ? frappe.session.user_fullname
                                 : 'Guest',
                status:         'Submitted',
                submitted_at:   frappe.datetime.now_datetime(),
                total_score:    Math.round(totalScore * 10) / 10,
                answers:        answerRows
            }
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(data) {
        if (data.message) {
            app.html(
                '<div style="text-align:center;padding:60px 20px">'
                + '<div style="font-size:52px;color:green">\u2713</div>'
                + '<h2 style="font-weight:500;margin:16px 0 8px">'
                + (q.thank_you_message || 'Thank you!') + '</h2>'
                + '<p style="color:var(--text-muted)">Your response has been saved.</p>'
                + '</div>'
            );
        } else {
            app.html(
                '<p style="color:red;padding:20px">Save failed. '
                + JSON.stringify(data) + '</p>'
            );
        }
    })
    .catch(function(err) {
        app.html('<p style="color:red;padding:20px">Submit error: ' + err.message + '</p>');
    });
}