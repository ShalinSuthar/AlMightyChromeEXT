const shortcutsWidget = {
  id: "shortcuts",
  name: "Shortcuts",
  MAX_SHORTCUTS: 10,

  shortcuts: [],
  shortcutContainer: null,
  addShortcutBtn: null,
  shortcutModal: null,
  modalTitle: null,
  shortcutTitleInput: null,
  shortcutUrlInput: null,
  saveShortcutBtn: null,
  cancelShortcutBtn: null,
  widgets: null,

  editIndex: null,

  hide: function () {
    this.shortcutContainer = document.getElementById("shortcutContainer");
    if (this.shortcutContainer) {
      this.shortcutContainer.style.display = "none";
    }
  },

  updateAddButtonState: function () {
    if (this.addShortcutBtn) {
      this.addShortcutBtn.disabled = this.shortcuts.length >= this.MAX_SHORTCUTS;
      this.addShortcutBtn.title = this.shortcuts.length >= this.MAX_SHORTCUTS ?
        'Maximum shortcuts limit reached (10)' : 'Add new shortcut';
    }
  },

  render: function () {
    this.shortcutContainer = document.getElementById("shortcutContainer");
    this.shortcutContainer.style.display = "flex";
    this.addShortcutBtn = document.getElementById("addShortcutBtn");
    this.shortcutModal = document.getElementById("shortcutModal");
    this.modalTitle = document.getElementById("modalTitle");
    this.shortcutTitleInput = document.getElementById("shortcutTitle");
    this.shortcutUrlInput = document.getElementById("shortcutUrl");
    this.saveShortcutBtn = document.getElementById("saveShortcutBtn");
    this.cancelShortcutBtn = document.getElementById("cancelShortcutBtn");

    this.initEventListeners();
    this.loadShortcutsAndRender();
  },

  initEventListeners: function () {
    this.addShortcutBtn.removeEventListener("click", this.handleAddShortcut);
    this.handleAddShortcut = () => {
      if (this.shortcuts.length < this.MAX_SHORTCUTS) {
        this.openAddModal();
      }
    };
    this.addShortcutBtn.addEventListener("click", this.handleAddShortcut);


    this.saveShortcutBtn.addEventListener("click", () => {
      this.saveShortcut();
    });

    this.cancelShortcutBtn.addEventListener("click", () => {
      this.closeModal();
    });

    this.shortcutModal.addEventListener("click", (e) => {
      if (e.target === this.shortcutModal) {
        this.closeModal();
      }
    });
  },

  loadShortcutsAndRender: function () {
    chrome.storage.sync.get(["myShortcuts"], (result) => {
      this.shortcuts = result.myShortcuts || [];
      this.renderShortcuts();
      this.updateAddButtonState();
    });
  },

  renderShortcuts: function () {
    this.shortcutContainer.innerHTML = "";

    this.shortcuts.forEach((shortcut, index) => {
      const tile = document.createElement("div");
      tile.className = "shortcut-tile";

      let domain;
      try {
        domain = new URL(shortcut.url).hostname;
      } catch {
        domain = shortcut.url;
      }

      const img = document.createElement("img");
      img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      img.onerror = () => {
        img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      };

      const span = document.createElement("span");
      span.textContent = shortcut.title || domain;

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.innerHTML = "✏️";
      editBtn.title = "Edit shortcut";
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openEditModal(index);
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.innerHTML = "×";
      deleteBtn.title = "Delete shortcut";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deleteShortcut(index);
      });

      tile.addEventListener("click", () => {
        window.open(shortcut.url, "_blank");
      });

      tile.appendChild(img);
      tile.appendChild(span);
      tile.appendChild(editBtn);
      tile.appendChild(deleteBtn);

      this.shortcutContainer.appendChild(tile);
    });

    this.updateAddButtonState();
  },

  saveShortcutsToStorage: function () {
    const uniqueShortcuts = [...new Map(this.shortcuts.map(s => [s.url, s])).values()];
    chrome.storage.sync.set({ myShortcuts: uniqueShortcuts }, () => {
      this.shortcuts = uniqueShortcuts;
      this.renderShortcuts();
    });
  },

  openAddModal: function () {
    if (this.shortcuts.length >= this.MAX_SHORTCUTS) {
      alert(`Maximum number of shortcuts (${this.MAX_SHORTCUTS}) reached!`);
      return;
    }
    this.editIndex = null;
    this.modalTitle.textContent = "Add Shortcut";
    this.shortcutTitleInput.value = "";
    this.shortcutUrlInput.value = "";
    this.shortcutModal.style.display = "block";
  },

  openEditModal: function (index) {
    this.editIndex = index;
    const item = this.shortcuts[index];
    this.modalTitle.textContent = "Edit Shortcut";
    this.shortcutTitleInput.value = item.title;
    this.shortcutUrlInput.value = item.url;
    this.shortcutModal.style.display = "block";
  },

  deleteShortcut: function (index) {
    if (confirm('Are you sure you want to delete this shortcut?')) {
      this.shortcuts.splice(index, 1);
      this.saveShortcutsToStorage();
    }
  },

  saveShortcut: function () {
    const title = this.shortcutTitleInput.value.trim();
    let url = this.shortcutUrlInput.value.trim();

    if (!title || !url) {
      alert("Please fill in both fields");
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      new URL(url);

      if (this.editIndex !== null) {
        this.shortcuts[this.editIndex].title = title;
        this.shortcuts[this.editIndex].url = url;
      } else {
        if (this.shortcuts.length >= this.MAX_SHORTCUTS) {
          alert(`Maximum number of shortcuts (${this.MAX_SHORTCUTS}) reached!`);
          return;
        }
        this.shortcuts.push({ title, url });
      }

      this.saveShortcutsToStorage();
      this.closeModal();
    } catch (e) {
      alert('Please enter a valid URL');
    }
  },

  closeModal: function () {
    this.shortcutModal.style.display = "none";
  }
};

window.shortcutsWidget = shortcutsWidget;
