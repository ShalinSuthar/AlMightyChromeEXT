const shortcutsWidget = {
    id: "shortcuts",
    name: "Shortcuts",
  
    // We'll store the in-memory shortcuts and DOM references as properties
    shortcuts: [],
    shortcutContainer: null,
    addShortcutBtn: null,
    shortcutModal: null,
    modalTitle: null,
    shortcutTitleInput: null,
    shortcutUrlInput: null,
    saveShortcutBtn: null,
    cancelShortcutBtn: null,
  
    editIndex: null, // track if we're editing an existing shortcut

    render: function() {
        console.log("rendered!");
      // Grab DOM elements
      this.shortcutContainer = document.getElementById("shortcutContainer");
      this.addShortcutBtn = document.getElementById("addShortcutBtn");
      this.shortcutModal = document.getElementById("shortcutModal");
      this.modalTitle = document.getElementById("modalTitle");
      this.shortcutTitleInput = document.getElementById("shortcutTitle");
      this.shortcutUrlInput = document.getElementById("shortcutUrl");
      this.saveShortcutBtn = document.getElementById("saveShortcutBtn");
      this.cancelShortcutBtn = document.getElementById("cancelShortcutBtn");
        
      console.log(saveShortcutBtn);
      console.log(this.shortcutUrlInput);
    console.log(this.shortcutTitleInput);
      console.log(cancelShortcutBtn);
      console.log(modalTitle);
      console.log(shortcutContainer);
      // Initialize event listeners
      this.initEventListeners();
      console.log("inited event listeners!");
      // Load existing shortcuts from storage and render them
      this.loadShortcutsAndRender();
      console.log("rendered shortcuts");
    },
    initEventListeners: function() {
      // "Add Shortcut" button
      this.addShortcutBtn.addEventListener("click", () => {
        console.log("Add button clicked");
        this.openAddModal();
      });
  
      // "Save" shortcut in modal
      this.saveShortcutBtn.addEventListener("click", () => {
        this.saveShortcut();
      });
  
      // "Cancel" shortcut in modal
      this.cancelShortcutBtn.addEventListener("click", () => {
        this.closeModal();
      });
  
      // close modal if user clicks outside the modal
      this.shortcutModal.addEventListener("click", (e) => {
        if (e.target === this.shortcutModal) {
          this.closeModal();
        }
      });
    },
    loadShortcutsAndRender: function() {
      chrome.storage.sync.get(["myShortcuts"], (result) => {
        this.shortcuts = result.myShortcuts || [];
        this.renderShortcuts();
      });
    },
    renderShortcuts: function() {
      // Clear existing content
      this.shortcutContainer.innerHTML = "";
  
      this.shortcuts.forEach((shortcut, index) => {
        const tile = document.createElement("div");
        tile.className = "shortcut-tile";
  
        // use a favicon or custom icon
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${shortcut.url}&sz=64`;
        const img = document.createElement("img");
        img.src = faviconUrl;
        tile.appendChild(img);
  
        // Title
        const span = document.createElement("span");
        span.textContent = shortcut.title || shortcut.url;
        tile.appendChild(span);
  
        // Edit button (inline icon, or text)
        const editBtn = document.createElement("button");
        editBtn.className = "edit-btn";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", (e) => {
          e.stopPropagation(); // prevent tile click
          this.openEditModal(index);
        });
        tile.appendChild(editBtn);
  
        // Delete button
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteShortcut(index);
        });
        tile.appendChild(deleteBtn);
  
        // Make entire tile clickable (opens URL in new tab)
        tile.addEventListener("click", () => {
          window.open(shortcut.url, "_blank");
        });
  
        this.shortcutContainer.appendChild(tile);
      });
    },
    saveShortcutsToStorage: function() {
      chrome.storage.sync.set({ myShortcuts: this.shortcuts }, () => {
        // After saving, re-render
        this.renderShortcuts();
      });
    },
    openAddModal: function() {
      console.log("in modal");
      this.editIndex = null; // no index, we're adding
      this.modalTitle.textContent = "Add Shortcut";
      this.shortcutTitleInput.value = "";
      this.shortcutUrlInput.value = "";
      this.shortcutModal.style.display = "block";
    },
    openEditModal: function(index) {
      this.editIndex = index;
      const item = this.shortcuts[index];
      this.modalTitle.textContent = "Edit Shortcut";
      this.shortcutTitleInput.value = item.title;
      this.shortcutUrlInput.value = item.url;
      this.shortcutModal.style.display = "block";
    },
    deleteShortcut: function(index) {
      this.shortcuts.splice(index, 1);
      this.saveShortcutsToStorage();
    },
    saveShortcut: function() {
      const title = this.shortcutTitleInput.value.trim();
      const url = this.shortcutUrlInput.value.trim();
  
      if (!url) {
        alert("Please enter a valid URL.");
        return;
      }
  
      // Ensure URL has http(s)
      let formattedUrl = url;
      if (!/^https?:\/\//.test(url)) {
        formattedUrl = "https://" + url;
      }
  
      if (this.editIndex !== null) {
        // Editing existing
        this.shortcuts[this.editIndex].title = title || formattedUrl;
        this.shortcuts[this.editIndex].url = formattedUrl;
      } else {
        // Adding new
        this.shortcuts.push({
          title: title || formattedUrl,
          url: formattedUrl
        });
      }
  
      // Persist & re-render
      this.saveShortcutsToStorage();
      this.closeModal();
    },
    closeModal: function() {
      this.shortcutModal.style.display = "none";
    }
};

window.shortcutsWidget = shortcutsWidget;  