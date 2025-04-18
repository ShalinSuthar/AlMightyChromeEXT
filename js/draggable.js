document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".draggable-component").forEach(element => {
        makeDraggable(element);
    });
});

function makeDraggable(element) {
    let startX = 0, startY = 0;
    element.addEventListener('mousedown', (e) => {
        const width = element.offsetWidth;
        element.style.setProperty('--original-width', `${width}px`);
        if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;

        startX = e.clientX;
        startY = e.clientY;

        onMouseDown(e);
    });

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // When the user presses down on the element, start the drag
    // element.addEventListener('mousedown', onMouseDown);

    function onMouseDown(e) {
        e.preventDefault();

        // Get the initial mouse cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;

        // When the user moves the mouse or lets go, attach or remove the event listeners
        document.addEventListener('mouseup', onMouseUp);
        document.addEventListener('mousemove', onMouseMove);
    }

    function onMouseMove(e) {
        e.preventDefault();

        // Calculate how far the mouse has moved
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;

        // Save new cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Move the element according to the distance moved
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function onMouseUp(e) {
        // Stop moving when mouse is released
        document.removeEventListener('mouseup', onMouseUp);
        document.removeEventListener('mousemove', onMouseMove);
        const xKey = `${element.id.split('-')[0].toLowerCase()}X`;
        const yKey = `${element.id.split('-')[0].toLowerCase()}Y`;
        // Save position of the widget after dragging
        chrome.storage.sync.set({ [xKey]: element.offsetLeft, [yKey]: element.offsetTop });

        if (Math.abs(e.clientX - startX) < 5 && Math.abs(e.clientY - startY) < 5 && e.target.tagName !== "BUTTON") {
            element.classList.toggle("artsy");
            const widgetId = element.id.split('-')[0].toLowerCase();
            const artsyKey = `artsy_${widgetId}`;
            const isArtsy = element.classList.contains("artsy");
            chrome.storage.sync.set({ [artsyKey]: isArtsy });
        }
    }
}
