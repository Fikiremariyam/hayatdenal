frappe.pages['questionnaire-form'].on_page_load = function(wrapper) {

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
            + '<p style="color:var(--text-muted)">No questionnaire specified in the URL.</p>'
            + '<p style="color:var(--text-muted);font-size:12px">'
            + 'Use: /app/questionnaire-form?questionnaire=YOUR-DOC-NAME</p>'
            + '</div>'
        );
        return;
    }

    frappe.call({
        method: 'frappe.client.get',
        args: { doctype: 'Questionnaire', name: qname },
        callback: function(r) {
            if (!r.message) {
                app.html('<p style="color:red;padding:20px">Questionnaire not found</p>');
                return;
            }
            renderQuestionnaire(app, r.message);
        }
    });
};

function renderQuestionnaire(app, q) {

    var sections  = {};
    var secOrder  = [];

    (q.questions || []).forEach(function(row) {
        var sec = row.section || 'General';
        if (!sections[sec]) {
            sections[sec] = [];
            secOrder.push(sec);
        }
        sections[sec].push(row);
    });

    var currentSection = 0;
    var answers = {};

    function getOptions(question) {
        return (question.options || '')
            .split('\n')
            .map(function(opt) { return opt.trim(); })
            .filter(function(opt) { return opt; });
    }

    function renderSection(idx) {

        var secName = secOrder[idx];
        var questions = sections[secName];
        var pct = Math.round(((idx + 1) / secOrder.length) * 100);
        var isLast = idx === secOrder.length - 1;

        app.empty();

        app.append(
            '<p style="font-size:12px;color:var(--text-muted)">Section '
            + (idx + 1) + ' of ' + secOrder.length + ' — ' + secName + '</p>'
            + '<div style="height:4px;background:var(--border-color);margin-bottom:20px">'
            + '<div style="height:4px;background:var(--primary);width:' + pct + '%"></div></div>'
            + '<h2>' + q.title + '</h2>'
            + '<p style="color:var(--text-muted)">' + (q.description || '') + '</p>'
        );

        questions.forEach(function(question, qi) {

            var saved = answers[question.name];

            var qblock = $(
                '<div style="margin-bottom:20px">'
                + '<p><b>' + (qi + 1) + '. ' + question.label + '</b></p>'
                + '</div>'
            );

            // ================= SELECT (FIXED) =================
            if (question.question_type === 'Select') {

                var sel = $('<select class="form-control" style="max-width:420px"></select>');
                sel.append('<option value="">— choose —</option>');

                getOptions(question).forEach(function(opt) {
                    sel.append(
                        '<option value="' + opt + '"'
                        + (saved === opt ? ' selected' : '') + '>'
                        + opt + '</option>'
                    );
                });

                sel.on('change', function() {
                    answers[question.name] = this.value;
                });

                qblock.append(sel);
            }

            // ================= MULTI SELECT (FIXED) =================
            else if (question.question_type === 'Multi-select') {

                var wrap = $('<div></div>');
                var options = getOptions(question);

                options.forEach(function(opt) {

                    var checked = Array.isArray(saved) && saved.includes(opt);

                    var row = $(
                        '<div style="display:flex;gap:8px;margin-bottom:6px">'
                        + '<input type="checkbox" value="' + opt + '"' + (checked ? ' checked' : '') + '>'
                        + '<label>' + opt + '</label>'
                        + '</div>'
                    );

                    row.on('change', function() {
                        var vals = [];
                        wrap.find('input:checked').each(function() {
                            vals.push(this.value);
                        });
                        answers[question.name] = vals;
                    });

                    wrap.append(row);
                });

                qblock.append(wrap);
            }

            else if (question.question_type === 'Rating') {

                var max = question.max_value || 5;
                var starWrap = $('<div></div>');

                for (let i = 1; i <= max; i++) {
                    let star = $('<span style="font-size:24px;cursor:pointer">★</span>');

                    star.on('click', function() {
                        answers[question.name] = i;
                        starWrap.find('span').css('color', 'gray');
                        star.css('color', 'gold');
                    });

                    starWrap.append(star);
                }

                qblock.append(starWrap);
            }

            else {
                var inp = $('<input class="form-control" />');

                inp.on('input', function() {
                    answers[question.name] = this.value;
                });

                qblock.append(inp);
            }

            app.append(qblock);
        });

        var nav = $(
            '<div style="margin-top:20px;display:flex;justify-content:space-between">'
            + '<button class="btn btn-default">Prev</button>'
            + '<button class="btn btn-primary">' + (isLast ? 'Submit' : 'Next') + '</button>'
            + '</div>'
        );

        nav.find('.btn-default').on('click', function() {
            if (currentSection > 0) {
                currentSection--;
                renderSection(currentSection);
            }
        });

        nav.find('.btn-primary').on('click', function() {
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

function submitResponse(q, answers, app) {

    app.html('<p style="text-align:center">Submitting...</p>');

    var answerRows = [];
    var totalScore = 0;

    (q.questions || []).forEach(function(question) {

        var val = answers[question.name];
        if (!val) return;

        var answerText = Array.isArray(val) ? val.join(', ') : val;

        var scoreAwarded = 0;

        if (question.question_type === 'Rating') {
            var max = question.max_value || 5;
            scoreAwarded = (parseFloat(val) / max) * (question.score_weight || 0);
        }

        else if (question.correct_answer && answerText === question.correct_answer) {
            scoreAwarded = question.score_weight || 0;
        }

        totalScore += scoreAwarded;

        answerRows.push({
            question: question.name,
            question_label: question.label,
            answer_text: answerText,
            score_awarded: scoreAwarded
        });
    });

    frappe.call({
        method: 'frappe.client.insert',
        args: {
            doc: {
                doctype: 'Questionnaire Response',
                questionnaire: q.name,
                respondent: frappe.session.user,
                respondent_name: frappe.session.user_fullname,
                status: 'Submitted',
                submitted_at: frappe.datetime.now_datetime(),
                total_score: Math.round(totalScore * 10) / 10,
                answers: answerRows
            }
        },
        callback: function() {
            app.html(
                '<div style="text-align:center;padding:60px 20px">'
                + '<div style="font-size:52px;color:green">✓</div>'
                + '<h2>' + (q.thank_you_message || 'Thank you!') + '</h2>'
                + '</div>'
            );
        }
    });
}