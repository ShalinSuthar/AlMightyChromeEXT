let draggableElement = document.getElementById('draggableElement');

const note = document.getElementById('draggableElement');
const noteContent = document.getElementById('note-content');
const editButton = document.getElementById('edit-button');
const deleteButton = document.getElementById('delete-button');
let isDragging = false;
let offsetX, offsetY;
let isEditing = false;

note.addEventListener('mousedown', (e) => {
    if (e.target !== noteContent && e.target !== editButton && e.target !== deleteButton) { // Only drag if not clicking on textarea or buttons
        isDragging = true;
        offsetX = e.clientX - note.offsetLeft;
        offsetY = e.clientY - note.offsetTop;
    }
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const x = e.clientX - offsetX;
        const y = e.clientY - offsetY;

        note.style.left = x + 'px';
        note.style.top = y + 'px';
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

editButton.addEventListener('click', () => {
    isEditing = !isEditing;
    noteContent.disabled = !isEditing;
    editButton.textContent = isEditing ? "Save" : "Edit";
});

deleteButton.addEventListener('click', () => {
    note.remove();
});

noteContent.disabled = true; 