// =============================================================================
// Compliance Suite page (single file: HTML + CSS + JS)
// Path: apps/dental_clinic/dental_clinic/dental_clinic/page/compliance_suite/compliance_suite.js
//
// Documents are stored in Frappe's own File doctype under:
//   Home/Compliance/<Category>/<sub folders>/<files>
// No Python code is needed.
// =============================================================================
(() => {
  const ROOT = "Home/Compliance";

  // ---- Edit these -----------------------------------------------------------
  // title:  text on the card
  // folder: folder name on disk (must NOT contain "/")
  // roles:  optional; only users with one of these roles can open the card
  const CATEGORIES = [
    { title: "Policy", folder: "Policy", color: "#d0202a" },
    { title: "Complaints & Significant Events", folder: "Complaints and Significant Events", color: "#0e6f82", roles: ["System Manager"] },
    { title: "Audits", folder: "Audits", color: "#45ad4b" },
    { title: "Risk Assessments", folder: "Risk Assessments", color: "#ef7633" },
    { title: "Staff / HR", folder: "Staff and HR", color: "#7459a6", roles: ["System Manager", "HR Manager"] },
    { title: "Staff Meetings", folder: "Staff Meetings", color: "#cc9b26" },
    { title: "Health & Safety / COSHH", folder: "Health and Safety - COSHH", color: "#283f92" },
    { title: "Fire", folder: "Fire", color: "#8d734d" },
    { title: "Infection Control", folder: "Infection Control", color: "#20aae9" },
    { title: "Radiography", folder: "Radiography", color: "#ec008c" },
    { title: "Information Governance", folder: "Information Governance", color: "#7459a6" },
    { title: "Patient Safety", folder: "Patient Safety", color: "#a0c95c" },
  ];

  // Sidebar links
  const NAV = [
    { label: "Dashboard", route: "dental-compliance" },
    { label: "Compliance Suite", route: "compliance-suite", active: true },
    { label: "Calendar", route: "List/Event/Calendar/Default" },
    { label: "CPD", route: "List/Staff Training Record" },
    { label: "Online Forms", route: "List/Web Form" },
  ];

  // Optional "DC Template" rows: records of these DocTypes that have a Link field
  // `compliance_folder` (Options: File) show inside the folder they point to.
  // Skipped automatically if the DocType or field doesn't exist.
  const TEMPLATE_DOCTYPES = [{ doctype: "Policy Document", title_field: "title" }];

  const ALLOWED_TYPES = [
    ".pdf", ".doc", ".docx", ".dot", ".dotx", ".odt", ".rtf", ".txt",
    ".xls", ".xlsx", ".xlt", ".xltx", ".csv", ".ods",
  ];
  // ---------------------------------------------------------------------------

  // ===========================================================================
  // CSS (injected once)
  // ===========================================================================
  const CSS = `
  .cs-page { padding: 8px 4px 40px; }
  .cs-page .cs-top { display:flex; justify-content:space-between; align-items:flex-start; gap:24px; flex-wrap:wrap; margin-bottom:28px; }
  .cs-page .cs-search { display:flex; gap:24px; flex:1; min-width:280px; max-width:700px; }
  .cs-page .cs-q { flex:1; padding:10px 16px; border:1px solid #333; border-radius:4px; font-size:14px; background:#fff; }
  .cs-page .cs-search-btn { background:#3a8fd9; color:#fff; border:0; border-radius:3px; padding:0 22px; font-size:14px; cursor:pointer; }
  .cs-page .cs-search-btn:hover { background:#2f7bbf; }
  .cs-page .cs-key { display:grid; grid-template-columns:repeat(2, minmax(150px, auto)); gap:2px 64px;
    border:1px solid #e3e3e3; border-radius:6px; padding:10px 18px; font-size:14px; color:#444; background:#fff; }
  .cs-page .cs-key span { display:flex; align-items:center; gap:10px; }
  .cs-page .cs-i { width:18px; height:18px; flex:none; }

  .cs-page .cs-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:28px; }
  .cs-page .cs-card { --c:#999; background:#fff; border:1px solid #e5e5e5; border-bottom:5px solid var(--c);
    border-radius:4px; overflow:hidden; cursor:pointer; display:flex; flex-direction:column; min-height:228px;
    transition:box-shadow .15s, transform .15s; }
  .cs-page .cs-card:hover { box-shadow:0 6px 18px rgba(0,0,0,.08); transform:translateY(-2px); }
  .cs-page .cs-card:focus-visible { outline:2px solid var(--c); outline-offset:2px; }
  .cs-page .cs-card-head { background:var(--c); height:40px; display:flex; align-items:center; justify-content:center; }
  .cs-page .cs-lock { width:20px; height:20px; fill:#111; }
  .cs-page .cs-card-title { flex:1; display:flex; align-items:center; justify-content:center; text-align:center;
    padding:24px; font-size:22px; line-height:1.5; color:var(--c); }
  .cs-page .cs-card-foot { height:40px; border-top:1px solid #f2f2f2; }
  .cs-page .cs-card.locked { cursor:not-allowed; }
  .cs-page .cs-card.locked:hover { transform:none; box-shadow:none; }

  .cs-page .cs-bar { display:flex; align-items:center; gap:16px; flex-wrap:wrap; margin-bottom:18px; }
  .cs-page .cs-back { cursor:pointer; color:#3a8fd9; }
  .cs-page .cs-back:hover { text-decoration:underline; }
  .cs-page .cs-sel-label { color:#666; font-size:13px; }
  .cs-page .cs-bar-btns { margin-left:auto; display:flex; gap:8px; }

  .cs-page .cs-tree, .cs-page .cs-children { list-style:none; margin:0; }
  .cs-page .cs-tree { padding-left:8px; }
  .cs-page .cs-children { padding-left:30px; }
  .cs-page .cs-node { position:relative; }
  .cs-page .cs-children > .cs-node::before { content:""; position:absolute; left:-16px; top:0; bottom:0; border-left:1px dotted #666; }
  .cs-page .cs-children > .cs-node:last-child::before { bottom:auto; height:19px; }
  .cs-page .cs-children > .cs-node::after { content:""; position:absolute; left:-16px; top:19px; width:14px; border-top:1px dotted #666; }

  .cs-page .cs-row { display:inline-flex; align-items:center; gap:10px; min-height:38px; padding:4px 10px;
    border-radius:2px; cursor:pointer; color:#333; font-size:15px; max-width:100%; }
  .cs-page .cs-row:hover { background:#f1f7fd; }
  .cs-page .cs-row.selected { background:#eaf4fc; box-shadow:inset 0 0 0 1px #cfe6f7; }
  .cs-page .cs-row:focus-visible { outline:2px solid #3a8fd9; }
  .cs-page .cs-label { overflow-wrap:anywhere; }
  .cs-page .cs-caret { width:0; height:0; border-left:5px solid #333; border-top:4px solid transparent;
    border-bottom:4px solid transparent; margin-left:-12px; transition:transform .12s; }
  .cs-page .cs-node.open > .cs-row .cs-caret { transform:rotate(90deg); }
  .cs-page .cs-row.cs-dc { background:#3a8fd9; color:#fff; }
  .cs-page .cs-row.cs-dc:hover { background:#2f7bbf; }

  .cs-page .cs-actions { display:inline-flex; gap:4px; margin-left:12px; opacity:0; transition:opacity .12s; }
  .cs-page .cs-row:hover .cs-actions, .cs-page .cs-row.selected .cs-actions { opacity:1; }
  .cs-page .cs-act { border:0; background:transparent; padding:3px; border-radius:3px; cursor:pointer; line-height:0; }
  .cs-page .cs-act svg { width:16px; height:16px; fill:#555; }
  .cs-page .cs-act:hover { background:#dde9f5; }
  .cs-page .cs-del:hover svg { fill:#c62828; }
  .cs-page .cs-muted { color:#999; font-size:13px; padding:8px 10px; list-style:none; }

  .cs-page .cs-results { list-style:none; margin:0; padding:0; }
  .cs-page .cs-hit { display:flex; align-items:center; gap:10px; padding:8px 10px; border-bottom:1px solid #f0f0f0; cursor:pointer; }
  .cs-page .cs-hit:hover { background:#f1f7fd; }
  .cs-page .cs-path { margin-left:auto; color:#888; }
  `;

  if (!document.getElementById("cs-page-style")) {
    const style = document.createElement("style");
    style.id = "cs-page-style";
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  // ===========================================================================
  // Icons
  // ===========================================================================
  const svg = (body) => `<svg class="cs-i" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const ICONS = {
    folder: svg('<path fill="none" stroke="#333" stroke-width="1.6" d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2h8.5A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>'),
    pdf: svg('<path fill="#fff" stroke="#999" d="M7 2.5h8l4 4v15H7z"/><rect x="2.5" y="12" width="13" height="6" rx="1" fill="#d32f2f"/><text x="9" y="16.6" font-size="4.6" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">PDF</text>'),
    sheet: svg('<path fill="#fff" stroke="#999" d="M8 2.5h8l4 4v15H8z"/><rect x="3" y="7" width="10" height="10" rx="1.5" fill="#1e7e45"/><text x="8" y="14.6" font-size="7" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">X</text>'),
    doc: svg('<path fill="#fff" stroke="#999" d="M8 2.5h8l4 4v15H8z"/><rect x="3" y="7" width="10" height="10" rx="1.5" fill="#2b579a"/><text x="8" y="14.6" font-size="7" font-weight="700" text-anchor="middle" fill="#fff" font-family="Arial">W</text>'),
    template: svg('<path fill="none" stroke="#333" stroke-width="1.6" d="M6 2.5h8l4 4v15H6z"/><path fill="none" stroke="#333" stroke-width="1.6" d="M12 9v7m-3-3 3 3 3-3M9 18.5h6"/>'),
    dc: svg('<circle cx="12" cy="12" r="10" fill="#0b3a3f"/><text x="12" y="15.3" font-size="9" font-weight="700" text-anchor="middle" fill="#9be15d" font-family="Arial">DC</text>'),
    form: svg('<path fill="none" stroke="#333" stroke-width="1.6" d="M6 2.5h10l2 2v17H6z"/><path stroke="#333" stroke-width="1.6" d="M9 8h6M9 11.5h6M9 15h3"/><path fill="#333" d="m14 19.5 4.5-4.5 1.5 1.5-4.5 4.5H14z"/>'),
    file: svg('<path fill="none" stroke="#333" stroke-width="1.6" d="M6 2.5h8l4 4v15H6z"/>'),
  };
  const LOCK = '<svg class="cs-lock" viewBox="0 0 24 24"><path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zM9 6a3 3 0 0 1 6 0v2H9zm3 11a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>';
  const UPLOAD = '<svg viewBox="0 0 24 24"><path d="M11 16V7.8l-3.6 3.6L6 10l6-6 6 6-1.4 1.4L13 7.8V16zM5 20v-2h14v2z"/></svg>';
  const TRASH = '<svg viewBox="0 0 24 24"><path d="M7 21a2 2 0 0 1-2-2V6H4V4h5V3h6v1h5v2h-1v13a2 2 0 0 1-2 2zM17 6H7v13h10zM9 17h2V8H9zm4 0h2V8h-2z"/></svg>';

  // ===========================================================================
  // Helpers
  // ===========================================================================
  const esc = (s) => frappe.utils.escape_html(s || "");
  const canOpen = (c) => !c.roles || c.roles.some((r) => frappe.user.has_role(r));
  const call = (method, args) =>
    new Promise((resolve, reject) =>
      frappe.call({ method, args, callback: (r) => resolve(r.message), error: reject })
    );

  const EXT_KIND = {
    pdf: "pdf",
    xls: "sheet", xlsx: "sheet", csv: "sheet", ods: "sheet",
    doc: "doc", docx: "doc", odt: "doc", rtf: "doc", txt: "doc",
    dot: "template", dotx: "template", xlt: "template", xltx: "template",
  };
  const kindOf = (name) => {
    const ext = (name || "").includes(".") ? name.split(".").pop().toLowerCase() : "";
    return EXT_KIND[ext] || "file";
  };

  // ===========================================================================
  // Data (all through standard Frappe APIs)
  // ===========================================================================
  async function ensureFolders() {
    const rootExists = await frappe.db.exists("File", ROOT);
    if (!rootExists) {
      await call("frappe.core.api.file.create_new_folder", { file_name: "Compliance", folder: "Home" });
    }
    const existing = await frappe.db.get_list("File", {
      filters: { folder: ROOT, is_folder: 1 },
      fields: ["file_name"],
      limit: 500,
    });
    const have = new Set(existing.map((f) => f.file_name));
    for (const c of CATEGORIES) {
      if (!have.has(c.folder)) {
        await call("frappe.core.api.file.create_new_folder", { file_name: c.folder, folder: ROOT });
      }
    }
  }

  async function templateDoctypes() {
    if (templateDoctypes.cache) return templateDoctypes.cache;
    const ok = [];
    const readable = (frappe.boot.user && frappe.boot.user.can_read) || [];
    for (const t of TEMPLATE_DOCTYPES) {
      if (!readable.includes(t.doctype)) continue;
      await new Promise((res) => frappe.model.with_doctype(t.doctype, res));
      if (frappe.meta.has_field(t.doctype, "compliance_folder")) ok.push(t);
    }
    templateDoctypes.cache = ok;
    return ok;
  }

  async function getChildren(folder) {
    const files = await frappe.db.get_list("File", {
      filters: { folder },
      fields: ["name", "file_name", "is_folder", "file_url"],
      order_by: "is_folder desc, file_name asc",
      limit: 1000,
    });
    const items = files.map((f) => ({ ...f, kind: f.is_folder ? "folder" : kindOf(f.file_name) }));

    for (const t of await templateDoctypes()) {
      const rows = await frappe.db.get_list(t.doctype, {
        filters: { compliance_folder: folder },
        fields: ["name", t.title_field],
        limit: 500,
      });
      rows.forEach((r) =>
        items.push({ name: r.name, file_name: r[t.title_field] || r.name, kind: "dc", doctype: t.doctype })
      );
    }
    return items;
  }

  async function searchFiles(q) {
    const rows = await frappe.db.get_list("File", {
      filters: [
        ["folder", "like", `${ROOT}/%`],
        ["is_folder", "=", 0],
        ["file_name", "like", `%${q}%`],
      ],
      fields: ["name", "file_name", "folder", "file_url"],
      order_by: "file_name asc",
      limit: 50,
    });
    return rows
      .filter((r) => {
        const cat = CATEGORIES.find((c) => r.folder === `${ROOT}/${c.folder}` || r.folder.startsWith(`${ROOT}/${c.folder}/`));
        return !cat || canOpen(cat);
      })
      .map((r) => ({ ...r, kind: kindOf(r.file_name), path: r.folder.slice(ROOT.length + 1) }));
  }

  // ===========================================================================
  // Page
  // ===========================================================================
  class ComplianceSuite {
    constructor(wrapper) {
      this.page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __("Compliance Suite"),
        single_column: false,
      });
      this.makeSidebar();
      this.makeLayout();
      this.bindEvents();
      this.renderGrid();
      ensureFolders().catch((e) => console.error("Compliance Suite: could not create folders", e));
    }

    // ---------- Layout ----------
    makeSidebar() {
      const $s = $(this.page.sidebar).empty();
      $s.html(`
        <ul class="list-unstyled sidebar-menu standard-sidebar-section">
          ${NAV.map((n) => `
            <li class="standard-sidebar-item ${n.active ? "selected" : ""}">
              <a class="item-anchor" data-route="${n.route}" style="cursor:pointer">
                <span class="sidebar-item-label">${__(n.label)}</span>
              </a>
            </li>`).join("")}
        </ul>`);
      $s.on("click", "[data-route]", (e) => {
        const route = e.currentTarget.dataset.route;
        if (route === "compliance-suite") this.renderGrid();
        else frappe.set_route(route.split("/"));
      });
    }

    makeLayout() {
      const key = [
        ["folder", "Folder"], ["pdf", "PDF"],
        ["sheet", "Spreadsheet"], ["template", "Template"],
        ["doc", "Document"], ["dc", "DC Template"],
        ["form", "Online Form"],
      ];
      this.$wrap = $(`
        <div class="cs-page">
          <div class="cs-top">
            <form class="cs-search">
              <input type="search" class="cs-q" placeholder="${__("Search for documents or templates...")}">
              <button type="submit" class="cs-search-btn">${__("Search")}</button>
            </form>
            <div class="cs-key">
              <b>${__("Key")}:</b><span></span>
              ${key.map(([k, label]) => `<span>${ICONS[k]} ${__(label)}</span>`).join("")}
            </div>
          </div>
          <div class="cs-body"></div>
        </div>`).appendTo(this.page.main);
      this.$body = this.$wrap.find(".cs-body");
    }

    bindEvents() {
      const nodeOf = (e) => $(e.currentTarget).closest(".cs-node");

      this.$wrap.on("submit", ".cs-search", (e) => {
        e.preventDefault();
        this.search(this.$wrap.find(".cs-q").val().trim());
      });

      this.$body.on("click", ".cs-card", (e) => this.openCategory(CATEGORIES[e.currentTarget.dataset.i]));
      this.$body.on("keydown", ".cs-card", (e) => {
        if (e.key === "Enter") this.openCategory(CATEGORIES[e.currentTarget.dataset.i]);
      });

      this.$body.on("click", ".cs-back", () => this.renderGrid());
      this.$body.on("click", ".cs-new-folder", () => this.newFolder());
      this.$body.on("click", ".cs-upload", () => this.upload());
      this.$body.on("click", ".cs-add", (e) => {
        e.stopPropagation();
        this.select(nodeOf(e));
        this.upload();
      });
      this.$body.on("click", ".cs-del", (e) => {
        e.stopPropagation();
        this.remove(nodeOf(e));
      });
      this.$body.on("click", ".cs-row", (e) => this.activate(nodeOf(e)));
      this.$body.on("keydown", ".cs-row", (e) => {
        if (e.key === "Enter") this.activate(nodeOf(e));
      });
      this.$body.on("click", ".cs-hit", (e) => this.openItem($(e.currentTarget).data("item")));
    }

    // ---------- Grid ----------
    renderGrid() {
      this.page.set_title(__("Compliance Suite"));
      this.$wrap.find(".cs-q").val("");
      this.$selected = null;
      this.$body.html(`
        <div class="cs-grid">
          ${CATEGORIES.map((c, i) => {
            const locked = !canOpen(c);
            return `
              <div class="cs-card${locked ? " locked" : ""}" style="--c:${c.color}" data-i="${i}" tabindex="0" role="link">
                <div class="cs-card-head">${locked ? LOCK : ""}</div>
                <div class="cs-card-title">${esc(__(c.title))}</div>
                <div class="cs-card-foot"></div>
              </div>`;
          }).join("")}
        </div>`);
    }

    openCategory(cat) {
      if (!cat) return;
      if (!canOpen(cat)) {
        frappe.msgprint(__("You don't have access to {0}.", [esc(cat.title)]));
        return;
      }
      this.renderTree(cat);
    }

    // ---------- Tree ----------
    renderTree(cat) {
      this.page.set_title(__(cat.title));
      this.$body.html(`
        <div class="cs-bar">
          <a class="cs-back">&larr; ${__("All categories")}</a>
          <span class="cs-sel-label"></span>
          <div class="cs-bar-btns">
            <button class="btn btn-default btn-sm cs-new-folder">${__("New Folder")}</button>
            <button class="btn btn-primary btn-sm cs-upload">${__("Upload Files")}</button>
          </div>
        </div>
        <ul class="cs-tree"></ul>`);
      const $root = this.makeNode({ name: `${ROOT}/${cat.folder}`, file_name: cat.title, kind: "folder" }, true);
      this.$body.find(".cs-tree").append($root);
      this.select($root);
      this.toggle($root, true);
    }

    makeNode(item, isRoot = false) {
      const isFolder = item.kind === "folder";
      const actions = [];
      if (isFolder) actions.push(`<button class="cs-act cs-add" title="${__("Upload here")}">${UPLOAD}</button>`);
      if (!isRoot && item.kind !== "dc") actions.push(`<button class="cs-act cs-del" title="${__("Delete")}">${TRASH}</button>`);

      const $li = $(`
        <li class="cs-node" data-kind="${item.kind}">
          <div class="cs-row${item.kind === "dc" ? " cs-dc" : ""}" tabindex="0">
            ${isFolder ? '<span class="cs-caret"></span>' : ""}
            ${ICONS[item.kind] || ICONS.file}
            <span class="cs-label"></span>
            <span class="cs-actions">${actions.join("")}</span>
          </div>
          ${isFolder ? '<ul class="cs-children" hidden></ul>' : ""}
        </li>`);
      $li.find(".cs-label").first().text(item.file_name);
      $li.data("item", item);
      return $li;
    }

    activate($li) {
      const item = $li.data("item");
      if (item.kind === "folder") {
        this.select($li);
        this.toggle($li);
      } else {
        this.openItem(item);
      }
    }

    select($li) {
      if (!$li || !$li.length) return;
      this.$body.find(".cs-row.selected").removeClass("selected");
      $li.children(".cs-row").addClass("selected");
      this.$selected = $li;
      this.$body.find(".cs-sel-label").html(`${__("Adding to")}: <b>${esc($li.data("item").file_name)}</b>`);
    }

    toggle($li, open) {
      const $ul = $li.children(".cs-children");
      const show = open === undefined ? $ul.prop("hidden") : open;
      $li.toggleClass("open", show);
      $ul.prop("hidden", !show);
      if (show && !$li.data("loaded")) this.loadChildren($li);
    }

    refresh($li) {
      if (!$li || !$li.length) return;
      $li.data("loaded", false);
      this.toggle($li, true);
    }

    async loadChildren($li) {
      $li.data("loaded", true);
      const $ul = $li.children(".cs-children").html(`<li class="cs-muted">${__("Loading...")}</li>`);
      try {
        const rows = await getChildren($li.data("item").name);
        $ul.empty();
        if (!rows.length) $ul.append(`<li class="cs-muted">${__("Empty folder")}</li>`);
        rows.forEach((r) => $ul.append(this.makeNode(r)));
      } catch (e) {
        console.error(e);
        $li.data("loaded", false);
        $ul.html(`<li class="cs-muted">${__("Could not load this folder.")}</li>`);
      }
    }

    openItem(item) {
      if (!item) return;
      if (item.kind === "dc") frappe.set_route("Form", item.doctype, item.name);
      else if (item.file_url) window.open(item.file_url, "_blank");
    }

    // ---------- Actions ----------
    newFolder() {
      const $f = this.$selected;
      if (!$f) return;
      frappe.prompt(
        { fieldname: "folder_name", label: __("Folder Name"), fieldtype: "Data", reqd: 1 },
        ({ folder_name }) => {
          const name = folder_name.trim();
          if (name.includes("/")) {
            frappe.msgprint(__("Folder names can't contain /"));
            return;
          }
          call("frappe.core.api.file.create_new_folder", {
            file_name: name,
            folder: $f.data("item").name,
          }).then(() => this.refresh($f));
        },
        __("New Folder"),
        __("Create")
      );
    }

    upload() {
      const $f = this.$selected;
      if (!$f) return;
      new frappe.ui.FileUploader({
        folder: $f.data("item").name,
        allow_multiple: true,
        disable_file_browser: true,
        allow_web_link: false,
        restrictions: { allowed_file_types: ALLOWED_TYPES },
        on_success: () => {
          // runs once per file; refresh once after the batch
          clearTimeout(this._refreshTimer);
          this._refreshTimer = setTimeout(() => this.refresh($f), 300);
        },
      });
    }

    remove($li) {
      const item = $li.data("item");
      frappe.confirm(__("Delete {0}?", [`<b>${esc(item.file_name)}</b>`]), () => {
        call("frappe.client.delete", { doctype: "File", name: item.name }).then(() => {
          const $parent = $li.parent().closest(".cs-node");
          if (this.$selected && this.$selected.is($li)) this.select($parent);
          this.refresh($parent);
        });
      });
    }

    // ---------- Search ----------
    async search(q) {
      if (!q) return this.renderGrid();
      this.page.set_title(__("Search"));
      this.$body.html(`
        <div class="cs-bar"><a class="cs-back">&larr; ${__("All categories")}</a></div>
        <ul class="cs-results"><li class="cs-muted">${__("Searching...")}</li></ul>`);
      let rows = [];
      try {
        rows = await searchFiles(q);
      } catch (e) {
        console.error(e);
      }
      const $ul = this.$body.find(".cs-results").empty();
      if (!rows.length) $ul.append(`<li class="cs-muted">${__("No documents found.")}</li>`);
      rows.forEach((r) => {
        const $li = $(`
          <li class="cs-hit" tabindex="0">
            ${ICONS[r.kind] || ICONS.file}
            <span class="cs-label"></span>
            <small class="cs-path"></small>
          </li>`);
        $li.find(".cs-label").text(r.file_name);
        $li.find(".cs-path").text(r.path);
        $li.data("item", r);
        $ul.append($li);
      });
    }
  }

  // ===========================================================================
  // Frappe page hooks
  // ===========================================================================
  frappe.pages["compliance-suite"].on_page_load = function (wrapper) {
    wrapper.compliance_suite = new ComplianceSuite(wrapper);
  };
})();