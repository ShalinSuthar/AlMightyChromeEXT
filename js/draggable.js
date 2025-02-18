document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".draggable-component").forEach(makeDraggable);
});

function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;
    element.style.position = "absolute";
    element.style.top = `${window.innerHeight * 0.45}px`; // 10% down (90% from bottom)

    element.addEventListener("mousedown", (e) => {
        if (e.target.closest("input, textarea, button")) return;

        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;
        element.style.zIndex = 1000;
    });

    document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    });

    document.addEventListener("mouseup", () => {
        isDragging = false;
        element.style.zIndex = "auto";
    });

    // Adjust position on window resize to keep it in the correct spot
    window.addEventListener("resize", setInitialPosition(element));
}

// TODO: how should we determine initial position?
function setInitialPosition(element) {
    element.style.position = "absolute";
    element.style.top = `${window.innerHeight * 0.45}px`; // 10% down (90% from bottom)
}
