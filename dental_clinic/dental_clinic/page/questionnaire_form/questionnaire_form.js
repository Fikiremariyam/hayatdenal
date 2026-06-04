frappe.pages['questionnaire-form'].on_page_load = function(wrapper) {

    // ── CREATE #q-app div right here in JS ──────────────────────
    $(wrapper).html(
        '<div id="q-app" style="max-width:700px;margin:40px auto;padding:0 24px">'
        + '<p style="color:var(--text-muted)">Loading questionnaire...</p>'
        + '</div>'
    );

    var app = $(wrapper).find('#q-app');

    // ── READ questionnaire NAME FROM URL ─────────────────────────
    var params = frappe.utils.get_query_params();
    var qname  = params.questionnaire;

    if (!qname) {
        app.html(
            '<div style="text-align:center;padding:60px 20px">'
            + '<p style="color:var(--text-muted)">No questionnaire specified in the URL.</p>'
            + '<p style="color:var(--text-muted);font-size:12px">'
            + 'Use: /app/questionnaire-form?questionnaire=YOUR-DOC-NAME</p>'
            + '</div>'
        );
        return;
    }

    // ── FETCH THE QUESTIONNAIRE DOC ──────────────────────────────
    frappe.call({
        method: 'frappe.client.get',
        args: { doctype: 'Questionnaire', name: qname },
        callback: function(r) {
            if (!r.message) {
                app.html(
                    '<p style="color:red;padding:20px">'
                    + 'Questionnaire "' + qname + '" not found. '
                    + 'Check the doc name in the URL.</p>'
                );
                return;
            }
            renderQuestionnaire(app, r.message);
        },
        error: function(r) {
            app.html(
                '<p style="color:red;padding:20px">'
                + 'API error: ' + JSON.stringify(r.message || r) + '</p>'
            );
        }
    });
};

// ── RENDER THE FORM ──────────────────────────────────────────────
function renderQuestionnaire(app, q) {

    // Group questions by section — preserve insertion order
    var sections  = {};
    var secOrder  = [];
    (q.questions || []).forEach(function(row) {
        var sec = row.section || 'General';
        if (!sections[sec]) { sections[sec] = []; secOrder.push(sec); }
        sections[sec].push(row);
    });

    if (secOrder.length === 0) {
        app.html('<p style="color:var(--text-muted);padding:20px">This questionnaire has no questions yet.</p>');
        return;
    }

    var currentSection = 0;
    var answers = {};

    function renderSection(idx) {
        var secName   = secOrder[idx];
        var questions = sections[secName];
        var pct       = Math.round(((idx + 1) / secOrder.length) * 100);
        var isLast    = (idx === secOrder.length - 1);

        app.empty();

        // Progress
        app.append(
            '<p style="font-size:12px;color:var(--text-muted);margin:0 0 5px">'
            + 'Section ' + (idx + 1) + ' of ' + secOrder.length + ' \u2014 ' + secName
            + '</p>'
            + '<div style="height:4px;background:var(--border-color);border-radius:2px;margin-bottom:20px">'
            + '  <div style="height:4px;background:var(--primary);border-radius:2px;width:' + pct + '%"></div>'
            + '</div>'
            + '<h2 style="font-size:20px;font-weight:500;margin:0 0 4px">' + q.title + '</h2>'
            + '<p style="font-size:13px;color:var(--text-muted);margin:0 0 24px">' + (q.description || '') + '</p>'
        );

        // Questions
        questions.forEach(function(question, qi) {
            var saved  = answers[question.name];
            var req    = question.is_required ? ' <span style="color:red">*</span>' : '';
            var hint   = question.help_text
                ? '<p style="font-size:12px;color:var(--text-muted);margin:0 0 8px">' + question.help_text + '</p>'
                : '';
            var qblock = $(
                '<div style="margin-bottom:20px">'
                + '  <p style="font-size:14px;font-weight:500;margin:0 0 4px">'
                + (qi + 1) + '. ' + question.label + req
                + '  </p>' + hint
                + '</div>'
            );

            // ── SELECT ──────────────────────────────────────────
            if (question.question_type === 'Select') {
                var sel = $('<select class="form-control" style="max-width:420px"></select>');
                sel.append('<option value="">\u2014 choose \u2014</option>');
                (question.options || []).forEach(function(opt) {
                    sel.append(
                        '<option value="' + opt.value + '"'
                        + (saved === opt.value ? ' selected' : '') + '>'
                        + opt.label + '</option>'
                    );
                });
                sel.on('change', function() { answers[question.name] = this.value; });
                qblock.append(sel);

            // ── MULTI-SELECT ─────────────────────────────────────
            } else if (question.question_type === 'Multi-select') {
                var wrap = $('<div></div>');
                (question.options || []).forEach(function(opt) {
                    var checked = Array.isArray(saved) && saved.indexOf(opt.value) !== -1;
                    var row = $(
                        '<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;'
                        + 'border:0.5px solid var(--border-color);border-radius:6px;margin-bottom:6px;cursor:pointer">'
                        + '<input type="checkbox" value="' + opt.value + '"' + (checked ? ' checked' : '') + '>'
                        + '<label style="margin:0;cursor:pointer">' + opt.label + '</label>'
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

            // ── RATING ───────────────────────────────────────────
            } else if (question.question_type === 'Rating') {
                var max      = question.max_value || 5;
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
                                $(this).css(
                                    'color',
                                    answers[question.name] >= parseInt($(this).data('val'))
                                        ? '#FAC775' : 'var(--border-color)'
                                );
                            });
                        });
                        starWrap.append(star);
                    })(s);
                }
                qblock.append(starWrap);
                if (saved) {
                    qblock.append(
                        '<p style="font-size:11px;color:var(--text-muted);margin:4px 0 0">'
                        + saved + ' out of ' + max + '</p>'
                    );
                }

            // ── NUMBER ───────────────────────────────────────────
            } else if (question.question_type === 'Number') {
                var inp = $(
                    '<input type="number" class="form-control" style="max-width:200px"'
                    + ' min="' + (question.min_value || '') + '"'
                    + ' max="' + (question.max_value || '') + '"'
                    + ' value="' + (saved || '') + '">'
                );
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            // ── DATE ─────────────────────────────────────────────
            } else if (question.question_type === 'Date') {
                var inp = $(
                    '<input type="date" class="form-control" style="max-width:220px"'
                    + ' value="' + (saved || '') + '">'
                );
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            // ── FILE UPLOAD ──────────────────────────────────────
            } else if (question.question_type === 'File Upload') {
                var inp = $('<input type="file" class="form-control" style="max-width:420px">');
                inp.on('change', function() {
                    answers[question.name] = this.files[0] ? this.files[0].name : '';
                });
                qblock.append(inp);

            // ── TEXT / PARAGRAPH / DEFAULT ───────────────────────
            } else {
                var isLong = (
                    question.question_type === 'Paragraph' ||
                    question.question_type === 'Long Text'
                );
                var inp = isLong
                    ? $('<textarea class="form-control" rows="3" style="max-width:520px">'
                        + (saved || '') + '</textarea>')
                    : $('<input type="text" class="form-control" style="max-width:420px"'
                        + ' value="' + (saved || '') + '">');
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);
            }

            app.append(qblock);
        });

        // Navigation buttons
        var nav = $(
            '<div style="display:flex;justify-content:space-between;align-items:center;'
            + 'margin-top:24px;padding-top:16px;border-top:1px solid var(--border-color)">'
            + '  <button class="btn btn-default" id="btn-prev"'
            + (idx === 0 ? ' disabled' : '') + '>\u2190 Previous</button>'
            + '  <span style="font-size:12px;color:var(--text-muted)">Auto-saved</span>'
            + '  <button class="btn btn-primary" id="btn-next">'
            + (isLast ? 'Submit' : 'Next section \u2192') + '</button>'
            + '</div>'
        );

        nav.find('#btn-prev').on('click', function() {
            currentSection--;
            renderSection(currentSection);
        });

        nav.find('#btn-next').on('click', function() {
            // Validate required fields on this section
            var allValid = true;
            questions.forEach(function(question) {
                if (!question.is_required) return;
                var val = answers[question.name];
                var empty = !val || (Array.isArray(val) && val.length === 0);
                if (empty) {
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

// ── SUBMIT RESPONSE ──────────────────────────────────────────────
function submitResponse(q, answers, app) {

    app.html(
        '<p style="text-align:center;color:var(--text-muted);padding:60px">'
        + 'Submitting...</p>'
    );

    var answerRows = [];
    var totalScore = 0;

    (q.questions || []).forEach(function(question) {
        var val = answers[question.name];
        if (val === undefined || val === null || val === '') return;

        var answerText   = Array.isArray(val) ? val.join(', ') : String(val);
        var scoreAwarded = 0;

        if (question.question_type === 'Select' || question.question_type === 'Multi-select') {
            (question.options || []).forEach(function(opt) {
                var match = Array.isArray(val)
                    ? val.indexOf(opt.value) !== -1
                    : val === opt.value;
                if (match) scoreAwarded += (opt.score || 0);
            });
        } else if (question.question_type === 'Rating') {
            var max = question.max_value || 5;
            scoreAwarded = (parseFloat(val) / max) * (question.score_weight || 0);
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

    frappe.call({
        method: 'frappe.client.insert',
        args: {
            doc: {
                doctype:        'Questionnaire Response',
                questionnaire:  q.name,
                respondent:     frappe.session.user,
                respondent_name: frappe.session.user_fullname,
                status:         'Submitted',
                submitted_at:   frappe.datetime.now_datetime(),
                total_score:    Math.round(totalScore * 10) / 10,
                answers:        answerRows
            }
        },
        callback: function(r) {
            if (r.message) {
                app.html(
                    '<div style="text-align:center;padding:60px 20px">'
                    + '  <div style="font-size:52px;color:green">\u2713</div>'
                    + '  <h2 style="font-weight:500;margin:16px 0 8px">'
                    + (q.thank_you_message || 'Thank you for your response!') + '</h2>'
                    + '  <p style="color:var(--text-muted)">Your response has been saved.</p>'
                    + '</div>'
                );
            }
        },
        error: function(r) {
            app.html(
                '<p style="color:red;padding:20px">Save failed: '
                + JSON.stringify(r.message || r) + '</p>'
            );
        }
    });
}