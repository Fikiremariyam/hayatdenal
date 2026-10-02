// Compliance Suite page: a grid of categories, each opening a folder tree of documents.
// Files are stored in Frappe's own File doctype under Home/Compliance/<Category>/...
// Wrapped in an IIFE so the script can be loaded more than once without "already declared" errors.
(() => {
  const API = "dental_clinic.api.compliance.";
  const ROOT = "Home/Compliance";

  // ---- Edit these -----------------------------------------------------------
  // title:  text on the card
  // folder: folder name on disk (must NOT contain "/")
  // roles:  optional; only these roles can open the card (keep in sync with RESTRICTED in compliance.py)
  const CATEGORIES = [
    { title: "Policy", folder: "Policy", color: "#d0202a" },
    { title: "Complaints & Significant Events", folder: "Complaints and Significant Events", color: "#0e6f82", roles: ["System Manager", "Practice Manager"] },
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

  // Sidebar links (same section as the Dental Compliance workspace)
  const NAV = [
    { label: "Dashboard", route: "dental-compliance" },
    { label: "Compliance Suite", route: "compliance-suite" },
    { label: "Calendar", route: "List/Event/Calendar/Default" },
    { label: "CPD", route: "List/Staff Training Record" },
    { label: "Online Forms", route: "List/Web Form" },
  ];
  // ---------------------------------------------------------------------------

  CATEGORIES.forEach((c) => {
    c.key = c.folder.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  });

  const esc = (s) => frappe.utils.escape_html(s || "");
  const call = (method, args) =>
    new Promise((resolve, reject) =>
      frappe.call({ method, args, callback: (r) => resolve(r.message), error: reject })
    );

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

  class ComplianceSuite {
    constructor(page) {
      this.page = page;
      this.current = null;
      this.makeSidebar();
      this.makeLayout();
      this.bindEvents();
      // Make sure Home/Compliance and one folder per category exist
      this.ready = call(API + "ensure_folders", {
        categories: CATEGORIES.map((c) => c.folder),
      }).catch(() => {});
      if (frappe.router && frappe.router.on) {
        frappe.router.on("change", () => {
          if (frappe.get_route()[0] === "compliance-suite") this.route();
        });
      }
    }

    canOpen(c) {
      return !c.roles || c.roles.some((r) => frappe.user.has_role(r));
    }

    // ---------- Layout ----------
    makeSidebar() {
      const $s = $(this.page.sidebar).empty();
      $s.html(`
        <ul class="list-unstyled sidebar-menu standard-sidebar-section">
          ${NAV.map((n) => `
            <li class="standard-sidebar-item ${n.route === "compliance-suite" ? "selected" : ""}">
              <a class="item-anchor" data-route="${n.route}">
                <span class="sidebar-item-label">${__(n.label)}</span>
              </a>
            </li>`).join("")}
        </ul>`);
      $s.on("click", "[data-route]", (e) =>
        frappe.set_route(e.currentTarget.dataset.route.split("/"))
      );
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
      this.$wrap.on("submit", ".cs-search", (e) => {
        e.preventDefault();
        this.search(this.$wrap.find(".cs-q").val().trim());
      });

      // Grid
      this.$body.on("click", ".cs-card", (e) => this.openCategory(CATEGORIES[e.currentTarget.dataset.i]));
      this.$body.on("keydown", ".cs-card", (e) => {
        if (e.key === "Enter") this.openCategory(CATEGORIES[e.currentTarget.dataset.i]);
      });

      // Tree
      this.$body.on("click", ".cs-back", () =>
        frappe.set_route("compliance-suite").then(() => {
          this.current = null;
          this.route();
        })
      );
      this.$body.on("click", ".cs-new-folder", () => this.newFolder());
      this.$body.on("click", ".cs-upload", () => this.upload());
      this.$body.on("click", ".cs-add", (e) => {
        e.stopPropagation();
        this.select($(e.currentTarget).closest(".cs-node"));
        this.upload();
      });
      this.$body.on("click", ".cs-del", (e) => {
        e.stopPropagation();
        this.remove($(e.currentTarget).closest(".cs-node"));
      });
      this.$body.on("click", ".cs-row", (e) => this.activate($(e.currentTarget).closest(".cs-node")));
      this.$body.on("keydown", ".cs-row", (e) => {
        if (e.key === "Enter") this.activate($(e.currentTarget).closest(".cs-node"));
      });

      // Search results
      this.$body.on("click", ".cs-hit", (e) => this.openItem($(e.currentTarget).data("item")));
    }

    // ---------- Routing ----------
    async route() {
      await this.ready;
      const key = frappe.get_route()[1] || "";
      if (key === this.current) return;
      this.current = key;
      this.$wrap.find(".cs-q").val("");
      const cat = CATEGORIES.find((c) => c.key === key);
      if (cat && this.canOpen(cat)) this.renderTree(cat);
      else this.renderGrid();
    }

    openCategory(cat) {
      if (!cat) return;
      if (!this.canOpen(cat)) {
        frappe.msgprint(__("You don't have access to {0}.", [esc(cat.title)]));
        return;
      }
      frappe.set_route("compliance-suite", cat.key).then(() => this.route());
    }

    // ---------- Grid ----------
    renderGrid() {
      this.page.set_title(__("Compliance Suite"));
      this.$body.html(`
        <div class="cs-grid">
          ${CATEGORIES.map((c, i) => {
            const locked = !this.canOpen(c);
            return `
              <div class="cs-card${locked ? " locked" : ""}" style="--c:${c.color}" data-i="${i}" tabindex="0" role="link">
                <div class="cs-card-head">${locked ? LOCK : ""}</div>
                <div class="cs-card-title">${esc(__(c.title))}</div>
                <div class="cs-card-foot"></div>
              </div>`;
          }).join("")}
        </div>`);
    }

    // ---------- Tree ----------
    renderTree(cat) {
      this.page.set_title(__(cat.title));
      this.$body.html(`
        <div class="cs-tree-bar">
          <a class="cs-back">&larr; ${__("All categories")}</a>
          <span class="cs-sel-label"></span>
          <div class="cs-tree-btns">
            <button class="btn btn-default btn-sm cs-new-folder">${__("New Folder")}</button>
            <button class="btn btn-primary btn-sm cs-upload">${__("Upload Files")}</button>
          </div>
        </div>
        <ul class="cs-tree"></ul>`);
      const $root = this.makeNode(
        { name: `${ROOT}/${cat.folder}`, file_name: cat.title, kind: "folder" },
        true
      );
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
      this.$body.find(".cs-sel-label").html(
        `${__("Adding to")}: <b>${esc($li.data("item").file_name)}</b>`
      );
    }

    toggle($li, open) {
      const $ul = $li.children(".cs-children");
      const show = open === undefined ? $ul.prop("hidden") : open;
      $li.toggleClass("open", show);
      $ul.prop("hidden", !show);
      if (show && !$li.data("loaded")) this.loadChildren($li);
    }

    refresh($li) {
      $li.data("loaded", false);
      this.toggle($li, true);
    }

    async loadChildren($li) {
      $li.data("loaded", true);
      const $ul = $li.children(".cs-children").html(`<li class="cs-muted">${__("Loading...")}</li>`);
      try {
        const rows = (await call(API + "get_children", { folder: $li.data("item").name })) || [];
        $ul.empty();
        if (!rows.length) $ul.append(`<li class="cs-muted">${__("Empty folder")}</li>`);
        rows.forEach((r) => $ul.append(this.makeNode(r)));
      } catch (e) {
        $li.data("loaded", false);
        $ul.html(`<li class="cs-muted">${__("Could not load this folder.")}</li>`);
      }
    }

    openItem(item) {
      if (!item) return;
      if (item.kind === "dc") {
        frappe.set_route("Form", item.doctype, item.name);
      } else {
        window.open(`/api/method/${API}download?name=${encodeURIComponent(item.name)}`, "_blank");
      }
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
        __("New Folder in {0}", [esc($f.data("item").file_name)]),
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
        restrictions: {
          allowed_file_types: [
            ".pdf", ".doc", ".docx", ".dot", ".dotx", ".odt", ".rtf", ".txt",
            ".xls", ".xlsx", ".xlt", ".xltx", ".csv", ".ods",
          ],
        },
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
      if (!q) {
        this.current = null;
        return this.route();
      }
      this.current = "__search__";
      this.page.set_title(__("Search"));
      this.$body.html(`
        <div class="cs-tree-bar"><a class="cs-back">&larr; ${__("All categories")}</a></div>
        <ul class="cs-results"><li class="cs-muted">${__("Searching...")}</li></ul>`);
      const rows = (await call(API + "search", { q }).catch(() => [])) || [];
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

  frappe.pages["compliance-suite"].on_page_load = (wrapper) => {
    const page = frappe.ui.make_app_page({
      parent: wrapper,
      title: __("Compliance Suite"),
      single_column: false,
    });
    wrapper.cs = new ComplianceSuite(page);
  };

  frappe.pages["compliance-suite"].on_page_show = (wrapper) => {
    if (wrapper.cs) wrapper.cs.route();
  };
})();