frappe.pages['questionnaire-form'].on_page_load = function(wrapper) {
    const params = frappe.utils.get_query_params();
    const qname = params.questionnaire;

    if (!qname) {
        $(wrapper).find('#q-app').html('<p>No questionnaire specified.</p>');
        return;
    }

    frappe.call({
        method: 'frappe.client.get',
        args: { doctype: 'Questionnaire', name: qname },
        callback: function(r) {
            if (!r.message) return;
            renderQuestionnaire(wrapper, r.message);
        }
    });
};

function renderQuestionnaire(wrapper, q) {
    const app = $(wrapper).find('#q-app');

    // Group questions by section
    const sections = {};
    (q.questions || []).forEach(function(row) {
        const sec = row.section || 'General';
        if (!sections[sec]) sections[sec] = [];
        sections[sec].push(row);
    });

    const secNames = Object.keys(sections);
    let currentSection = 0;
    const answers = {};

    function renderSection(idx) {
        const secName = secNames[idx];
        const questions = sections[secName];
        app.empty();

        // Progress bar
        app.append(`
            <p style="font-size:12px;color:var(--text-muted);margin:0 0 6px">
                Section ${idx+1} of ${secNames.length} — ${secName}
            </p>
            <div style="height:4px;background:var(--border-color);border-radius:2px;margin-bottom:20px">
                <div style="height:4px;background:var(--primary);border-radius:2px;
                    width:${Math.round(((idx+1)/secNames.length)*100)}%"></div>
            </div>
            <h2 style="font-size:20px;font-weight:500;margin:0 0 4px">${q.title}</h2>
            <p style="font-size:13px;color:var(--text-muted);margin:0 0 24px">${q.description || ''}</p>
        `);

        // Render each question
        questions.forEach(function(question, qi) {
            const qblock = $(`<div style="margin-bottom:20px"></div>`);
            qblock.append(`
                <p style="font-size:14px;font-weight:500;margin:0 0 4px">
                    ${qi+1}. ${question.label}
                    ${question.is_required ? '<span style="color:var(--red)">*</span>' : ''}
                </p>
                ${question.help_text ? `<p style="font-size:12px;color:var(--text-muted);margin:0 0 8px">${question.help_text}</p>` : ''}
            `);

            const saved = answers[question.name];

            if (question.question_type === 'Select') {
                const sel = $(`<select class="form-control" style="max-width:400px"></select>`);
                sel.append('<option value="">— choose —</option>');
                (question.options || []).forEach(function(opt) {
                    sel.append(`<option value="${opt.value}" ${saved===opt.value?'selected':''}>${opt.label}</option>`);
                });
                sel.on('change', function() { answers[question.name] = this.value; });
                qblock.append(sel);

            } else if (question.question_type === 'Multi-select') {
                const wrap = $('<div></div>');
                (question.options || []).forEach(function(opt) {
                    const checked = Array.isArray(saved) && saved.includes(opt.value);
                    const row = $(`
                        <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;
                            border:0.5px solid var(--border-color);border-radius:6px;margin-bottom:6px;cursor:pointer">
                            <input type="checkbox" value="${opt.value}" ${checked?'checked':''}>
                            <label style="margin:0;cursor:pointer">${opt.label}</label>
                        </div>
                    `);
                    row.on('change', function() {
                        const vals = [];
                        wrap.find('input:checked').each(function() { vals.push(this.value); });
                        answers[question.name] = vals;
                    });
                    wrap.append(row);
                });
                qblock.append(wrap);

            } else if (question.question_type === 'Rating') {
                const max = question.max_value || 5;
                const starWrap = $('<div style="display:flex;gap:6px;margin-top:4px"></div>');
                for (let s = 1; s <= max; s++) {
                    const star = $(`<span style="font-size:24px;cursor:pointer;color:${saved >= s ? '#FAC775' : 'var(--border-color)'}"
                        data-val="${s}">★</span>`);
                    star.on('click', function() {
                        answers[question.name] = parseInt($(this).data('val'));
                        starWrap.find('span').each(function() {
                            $(this).css('color', answers[question.name] >= parseInt($(this).data('val')) ? '#FAC775' : 'var(--border-color)');
                        });
                    });
                    starWrap.append(star);
                }
                qblock.append(starWrap);

            } else if (question.question_type === 'Number') {
                const inp = $(`<input type="number" class="form-control" style="max-width:200px"
                    min="${question.min_value||''}" max="${question.max_value||''}" value="${saved||''}">`);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            } else if (question.question_type === 'Date') {
                const inp = $(`<input type="date" class="form-control" style="max-width:220px" value="${saved||''}">`);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);

            } else if (question.question_type === 'File Upload') {
                const inp = $(`<input type="file" class="form-control" style="max-width:400px">`);
                inp.on('change', function() { answers[question.name] = this.files[0]?.name || ''; });
                qblock.append(inp);

            } else {
                // Text / Paragraph / default
                const isLong = ['Paragraph', 'Long Text'].includes(question.question_type);
                const inp = isLong
                    ? $(`<textarea class="form-control" rows="3" style="max-width:500px">${saved||''}</textarea>`)
                    : $(`<input type="text" class="form-control" style="max-width:400px" value="${saved||''}">`);
                inp.on('input', function() { answers[question.name] = this.value; });
                qblock.append(inp);
            }

            app.append(qblock);
        });

        // Navigation
        const nav = $(`
            <div style="display:flex;justify-content:space-between;align-items:center;
                margin-top:24px;padding-top:16px;border-top:1px solid var(--border-color)">
                <button class="btn btn-default" id="btn-prev" ${idx===0?'disabled':''}>← Previous</button>
                <span style="font-size:12px;color:var(--text-muted)">Auto-saved</span>
                <button class="btn btn-primary" id="btn-next">
                    ${idx === secNames.length-1 ? 'Submit' : 'Next section →'}
                </button>
            </div>
        `);

        nav.find('#btn-prev').on('click', function() {
            currentSection--;
            renderSection(currentSection);
        });

        nav.find('#btn-next').on('click', function() {
            if (idx === secNames.length - 1) {
                submitResponse(q, answers);
            } else {
                currentSection++;
                renderSection(currentSection);
            }
        });

        app.append(nav);
    }

    renderSection(0);
}

function submitResponse(q, answers) {
    // Build answers child table rows
    const answerRows = [];
    (q.questions || []).forEach(function(question) {
        const val = answers[question.name];
        if (!val && val !== 0) return;

        const answerText = Array.isArray(val) ? val.join(', ') : String(val);

        // Auto-score
        let scoreAwarded = 0;
        if (['Select', 'Multi-select'].includes(question.question_type)) {
            (question.options || []).forEach(function(opt) {
                if (Array.isArray(val) ? val.includes(opt.value) : val === opt.value) {
                    scoreAwarded += opt.score || 0;
                }
            });
        } else if (question.question_type === 'Rating') {
            const max = question.max_value || 5;
            scoreAwarded = (parseFloat(val) / max) * (question.score_weight || 0);
        } else if (question.correct_answer && answerText === question.correct_answer) {
            scoreAwarded = question.score_weight || 0;
        }

        answerRows.push({
            question: question.name,
            question_label: question.label,
            answer_text: answerText,
            score_awarded: scoreAwarded
        });
    });

    const totalScore = answerRows.reduce(function(s, r) { return s + (r.score_awarded || 0); }, 0);

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
        callback: function(r) {
            if (r.message) {
                $('#q-app').html(`
                    <div style="text-align:center;padding:60px 0">
                        <i class="fa fa-check-circle" style="font-size:48px;color:var(--green);margin-bottom:16px"></i>
                        <h2 style="font-weight:500">${q.thank_you_message || 'Thank you for your response!'}</h2>
                        <p style="color:var(--text-muted)">Your response has been recorded.</p>
                    </div>
                `);
            }
        }
    });
}