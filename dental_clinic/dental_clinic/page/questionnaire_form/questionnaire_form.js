// ── DEBUG TOGGLE ──────────────────────────────────────────────
// Set to true to log the raw shape of the API response and every
// answer update to the console. Turn off once things work.
var DEBUG_QUESTIONNAIRE = true;

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

        if (DEBUG_QUESTIONNAIRE) {
            console.log('[questionnaire-form] Full questionnaire doc:', data.message);
            if (data.message.questions && data.message.questions.length) {
                console.log('[questionnaire-form] Raw keys on first question row:',
                    Object.keys(data.message.questions[0]));
                console.log('[questionnaire-form] First question row (full):',
                    data.message.questions[0]);
            } else {
                console.warn('[questionnaire-form] questionnaire.questions is empty or missing.');
            }
        }

        renderQuestionnaire(app, data.message);
    })
    .catch(function(err) {
        app.html('<p style="color:red;padding:20px">Error loading: ' + err.message + '</p>');
    });
};

// ── SMALL UTILITIES ───────────────────────────────────────────

// Escapes text before it goes into an HTML string, so option/label
// text containing quotes, <, >, or & can never break the markup
// (which previously could silently desync what's rendered from
// what gets read back out of the DOM).
function escapeHtml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Reads a value off a question row trying several likely field-name
// variants, in order. This protects against DocType field renames
// (e.g. a field created via Customize Form as "options" that Frappe
// silently stored as "custom_options").
function getField(question, candidateNames, fallback) {
    for (var i = 0; i < candidateNames.length; i++) {
        var key = candidateNames[i];
        if (question[key] !== undefined && question[key] !== null && question[key] !== '') {
            return question[key];
        }
    }
    return fallback;
}

function isRequired(question) {
    var v = getField(question, ['is_required', 'custom_is_required', 'mandatory', 'reqd'], 0);
    return v === 1 || v === true || v === '1';
}

function getQuestionType(question) {
    return getField(question, ['question_type', 'custom_question_type', 'type'], 'Text');
}

function getLabel(question) {
    return getField(question, ['label', 'custom_label', 'question_label', 'title'], '(Untitled question)');
}

function getHelpText(question) {
    return getField(question, ['help_text', 'custom_help_text', 'description'], '');
}

function getSection(question) {
    return getField(question, ['section', 'custom_section', 'section_name'], 'General');
}

function getMaxValue(question) {
    return parseFloat(getField(question, ['max_value', 'custom_max_value'], 5)) || 5;
}

function getScoreWeight(question) {
    return parseFloat(getField(question, ['score_weight', 'custom_score_weight'], 0)) || 0;
}

function getCorrectAnswer(question) {
    return getField(question, ['correct_answer', 'custom_correct_answer'], null);
}

// Every question needs ONE stable, guaranteed-present key used
// consistently for both writing to `answers` and reading it back
// during validation/submission. Frappe child rows normally have
// `name`, but we never trust that alone — if it's ever missing,
// fall back to a key derived from its position, and cache it back
// onto the row so it never changes across re-renders.
function getStableKey(question, sectionIdx, qi) {
    if (question.__stableKey) return question.__stableKey;
    var key = question.name || ('row_' + sectionIdx + '_' + qi);
    question.__stableKey = key;
    return key;
}

// ── HARDENED OPTION PARSER ──────────────────────────────────────
function getOptions(question) {
    var raw = getField(question, ['options', 'custom_options'], null);

    if (raw === undefined || raw === null) {
        if (DEBUG_QUESTIONNAIRE) {
            console.warn('[questionnaire-form] No options field found on question:',
                getStableKey(question, '?', '?'), getLabel(question), question);
        }
        return [];
    }

    raw = String(raw);

    // Strip HTML tags in case the field ever holds rich text
    if (/<[a-z][\s\S]*>/i.test(raw)) {
        raw = raw
            .replace(/<\/(p|div|li)>/gi, '\n')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]+>/g, '');
    }

    // Normalize Windows line endings
    raw = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    var parts;
    if (raw.indexOf('\n') !== -1) {
        parts = raw.split('\n');
    } else if (raw.indexOf(',') !== -1) {
        parts = raw.split(',');
    } else if (raw.indexOf(';') !== -1) {
        parts = raw.split(';');
    } else {
        parts = [raw];
    }

    var options = parts
        .map(function(o) { return o.trim(); })
        .filter(function(o) { return o; });

    if (options.length === 0 && DEBUG_QUESTIONNAIRE) {
        console.warn('[questionnaire-form] options resolved to 0 entries for:',
            getStableKey(question, '?', '?'), getLabel(question), '-> raw value was:', JSON.stringify(raw));
    }

    return options;
}

// ── RENDER THE FORM ─────────────────────────────────────────────
function renderQuestionnaire(app, q) {

    var sections = {};
    var secOrder = [];

    (q.questions || []).forEach(function(row, i) {
        var sec = getSection(row);
        if (!sections[sec]) {
            sections[sec] = [];
            secOrder.push(sec);
        }
        // Assign the stable key up front, at parse time, using its
        // position in the full question list so it's unique even
        // if `name` is ever missing.
        getStableKey(row, sec, i);
        sections[sec].push(row);
    });

    if (secOrder.length === 0) {
        app.html('<p style="color:var(--text-muted);padding:20px">No questions found.</p>');
        return;
    }

    var currentSection = 0;
    var answers = {};

    function setAnswer(key, value) {
        answers[key] = value;
        if (DEBUG_QUESTIONNAIRE) {
            console.log('[questionnaire-form] answers updated:', key, '=>', value, '| full answers:', answers);
        }
    }

    function renderSection(idx) {

        var secName   = secOrder[idx];
        var questions = sections[secName];
        var pct       = Math.round(((idx + 1) / secOrder.length) * 100);
        var isLast    = idx === secOrder.length - 1;

        app.empty();

        app.append(
            '<p style="font-size:12px;color:var(--text-muted);margin:0 0 5px">Section '
            + (idx + 1) + ' of ' + secOrder.length + ' \u2014 ' + escapeHtml(secName) + '</p>'
            + '<div style="height:4px;background:var(--border-color);border-radius:2px;margin-bottom:20px">'
            + '<div style="height:4px;background:var(--primary);border-radius:2px;width:' + pct + '%"></div></div>'
            + '<h2 style="font-size:20px;font-weight:500;margin:0 0 4px">' + escapeHtml(q.title) + '</h2>'
            + '<p style="font-size:13px;color:var(--text-muted);margin:0 0 24px">' + escapeHtml(q.description || '') + '</p>'
        );

        questions.forEach(function(question, qi) {

            var key    = getStableKey(question, secName, qi);
            var saved  = answers[key];
            var req    = isRequired(question) ? ' <span style="color:red">*</span>' : '';
            var help   = getHelpText(question);
            var hint   = help
                ? '<p style="font-size:12px;color:var(--text-muted);margin:0 0 8px">' + escapeHtml(help) + '</p>'
                : '';
            var label  = getLabel(question);
            var qtype  = getQuestionType(question);

            var qblock = $(
                '<div style="margin-bottom:20px" data-qkey="' + escapeHtml(key) + '">'
                + '<p style="font-size:14px;font-weight:500;margin:0 0 4px">'
                + (qi + 1) + '. ' + escapeHtml(label) + req + '</p>'
                + hint
                + '</div>'
            );

            // SELECT
            if (qtype === 'Select') {
                var sel = $('<select class="form-control" style="max-width:420px"></select>');
                sel.append('<option value="">\u2014 choose \u2014</option>');
                var opts = getOptions(question);
                opts.forEach(function(opt) {
                    sel.append(
                        '<option value="' + escapeHtml(opt) + '"'
                        + (saved === opt ? ' selected' : '') + '>'
                        + escapeHtml(opt) + '</option>'
                    );
                });
                sel.on('change', function() { setAnswer(key, this.value); });
                qblock.append(sel);

            // MULTI-SELECT
            } else if (qtype === 'Multi-select' || qtype === 'MultiSelect' || qtype === 'Multi Select') {
                var wrap = $('<div></div>');
                getOptions(question).forEach(function(opt) {
                    var checked = Array.isArray(saved) && saved.indexOf(opt) !== -1;
                    var row = $(
                        '<div style="display:flex;align-items:center;gap:8px;padding:7px 12px;'
                        + 'border:0.5px solid var(--border-color);border-radius:6px;margin-bottom:5px">'
                        + '<input type="checkbox" value="' + escapeHtml(opt) + '"' + (checked ? ' checked' : '') + '>'
                        + '<label style="margin:0;cursor:pointer">' + escapeHtml(opt) + '</label>'
                        + '</div>'
                    );
                    row.on('change', function() {
                        var vals = [];
                        wrap.find('input:checked').each(function() { vals.push(this.value); });
                        setAnswer(key, vals);
                    });
                    wrap.append(row);
                });
                qblock.append(wrap);

            // RATING
            } else if (qtype === 'Rating') {
                var max = getMaxValue(question);
                var starWrap = $('<div style="display:flex;gap:6px;margin-top:4px"></div>');
                for (var s = 1; s <= max; s++) {
                    (function(val) {
                        var star = $(
                            '<span data-val="' + val + '" style="font-size:28px;cursor:pointer;color:'
                            + (saved >= val ? '#FAC775' : 'var(--border-color)') + '">\u2605</span>'
                        );
                        star.on('click', function() {
                            setAnswer(key, val);
                            starWrap.find('span').each(function() {
                                $(this).css('color',
                                    answers[key] >= parseInt($(this).data('val'), 10)
                                    ? '#FAC775' : 'var(--border-color)'
                                );
                            });
                        });
                        starWrap.append(star);
                    })(s);
                }
                qblock.append(starWrap);

            // DATE
            } else if (qtype === 'Date') {
                var inpDate = $('<input type="date" class="form-control" style="max-width:220px">');
                if (saved) inpDate.val(saved);
                inpDate.on('input change', function() { setAnswer(key, this.value); });
                qblock.append(inpDate);

            // PARAGRAPH
            } else if (qtype === 'Paragraph') {
                var inpPara = $('<textarea class="form-control" rows="3" style="max-width:520px"></textarea>');
                if (saved) inpPara.val(saved);
                inpPara.on('input change', function() { setAnswer(key, this.value); });
                qblock.append(inpPara);

            // TEXT / DEFAULT
            } else {
                var inpText = $('<input type="text" class="form-control" style="max-width:420px">');
                if (saved) inpText.val(saved);
                inpText.on('input change', function() { setAnswer(key, this.value); });
                qblock.append(inpText);
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
            var allValid = true;

            if (DEBUG_QUESTIONNAIRE) {
                console.log('[questionnaire-form] Validating section', idx, '| current answers:', answers);
            }

            questions.forEach(function(question, qi) {
                if (!isRequired(question)) return;
                var key = getStableKey(question, secName, qi);
                var val = answers[key];

                var missing =
                    val === undefined || val === null || val === '' ||
                    (Array.isArray(val) && val.length === 0);
                // NOTE: 0 is a valid answer (e.g. a Rating of 0), so it is
                // intentionally NOT treated as missing here.

                if (missing) {
                    allValid = false;
                    if (DEBUG_QUESTIONNAIRE) {
                        console.warn('[questionnaire-form] Missing required answer for key:', key,
                            '| label:', getLabel(question), '| current value:', val);
                    }
                    frappe.msgprint('Please answer: ' + getLabel(question));
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

    (q.questions || []).forEach(function(question, i) {
        var key = getStableKey(question, getSection(question), i);
        var val = answers[key];
        if (val === undefined || val === null || val === '') return;

        var answerText   = Array.isArray(val) ? val.join(', ') : String(val);
        var scoreAwarded = 0;
        var qtype        = getQuestionType(question);
        var correct      = getCorrectAnswer(question);
        var weight       = getScoreWeight(question);

        if (qtype === 'Rating') {
            scoreAwarded = (parseFloat(val) / getMaxValue(question)) * weight;
        } else if (correct && answerText === correct) {
            scoreAwarded = weight;
        }

        totalScore += scoreAwarded;

        answerRows.push({
            question:       question.name || key,
            question_label: getLabel(question),
            answer_text:    answerText,
            score_awarded:  scoreAwarded
        });
    });

    if (DEBUG_QUESTIONNAIRE) {
        console.log('[questionnaire-form] Submitting answerRows:', answerRows, '| totalScore:', totalScore);
    }

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
                + escapeHtml(q.thank_you_message || 'Thank you!') + '</h2>'
                + '<p style="color:var(--text-muted)">Your response has been saved.</p>'
                + '</div>'
            );
        } else {
            if (DEBUG_QUESTIONNAIRE) console.error('[questionnaire-form] Save failed, server response:', data);
            app.html(
                '<p style="color:red;padding:20px">Save failed. '
                + escapeHtml(JSON.stringify(data)) + '</p>'
            );
        }
    })
    .catch(function(err) {
        app.html('<p style="color:red;padding:20px">Submit error: ' + escapeHtml(err.message) + '</p>');
    });
}