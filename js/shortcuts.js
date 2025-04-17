const shortcutsWidget = {
  id: "shortcuts",
  name: "Shortcuts",
  shortcuts: [],
  container: null,
  searchInput: null,
  listEl: null,

  render: function () {
    this.container = document.getElementById("shortcuts-container");
    if (!this.container) return;

    this.container.style.display = "block";

    this.searchInput = this.container.querySelector("#shortcut-search");
    this.listEl = this.container.querySelector("#shortcut-list");

    this.searchInput.addEventListener("input", () => this.renderList());

    this.container.querySelector("#shortcut-save").addEventListener("click", () => {
      this.addShortcut();
    });

    this.container.querySelector("#shortcut-toggle-form").addEventListener("click", () => {
      const form = this.container.querySelector("#shortcut-form");
      form.style.display = form.style.display === "none" ? "flex" : "none";
    });

    this.loadFromStorage();
  },

  hide: function () {
    if (this.container) {
      this.container.style.display = "none";
    }
  },

  loadFromStorage() {
    chrome.storage.sync.get(["myShortcuts"], (result) => {
      this.shortcuts = result.myShortcuts || [];
      this.renderList();
    });
  },

  saveToStorage() {
    chrome.storage.sync.set({ myShortcuts: this.shortcuts });
  },

  renderList() {
    const query = this.searchInput.value.toLowerCase();
    this.listEl.innerHTML = "";

    this.shortcuts
      .filter(s => s.title.toLowerCase().includes(query) || s.url.toLowerCase().includes(query))
      .forEach(({ title, url }, index) => {
        const item = document.createElement("div");
        item.className = "shortcut-item";

        const text = document.createElement("span");
        text.textContent = title;
        text.addEventListener("click", () => window.open(url, "_blank"));

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "✕";
        removeBtn.addEventListener("click", () => {
          this.shortcuts.splice(index, 1);
          this.saveToStorage();
          this.renderList();
        });

        item.appendChild(text);
        item.appendChild(removeBtn);
        this.listEl.appendChild(item);
      });
  },

  addShortcut() {
    const titleInput = this.container.querySelector("#shortcut-title");
    const urlInput = this.container.querySelector("#shortcut-url");

    let title = titleInput.value.trim();
    let url = urlInput.value.trim();

    if (!title || !url) return;

    if (!/^https?:\/\//i.test(url)) url = "https://" + url;

    this.shortcuts.push({ title, url });
    this.saveToStorage();
    this.renderList();

    titleInput.value = "";
    urlInput.value = "";

    // Optional: hide form after adding
    this.container.querySelector("#shortcut-form").style.display = "none";
  }
};

window.shortcutsWidget = shortcutsWidget;