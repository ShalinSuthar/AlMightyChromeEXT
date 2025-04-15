const writingWidget = {
    id: "writing",
    name: "Writing",

    render: function () {
        this.loadAndDisplayWritingWidget();
        this.restorePosition();
    },

    hide: function () {
        const widgetElement = document.getElementById("writing-container");
        if (widgetElement) {
            widgetElement.style.display = "none";
        }
    },

    setupFadeOnScroll: function (container) {
        const updateFade = () => {
            const isAtTop = container.scrollTop === 0;
            container.classList.toggle("hide-fade", !isAtTop);
        };

        container.addEventListener("scroll", updateFade);
        updateFade();
    },

    restorePosition: function () {
        chrome.storage.sync.get(["writingX", "writingY"], ({ writingX, writingY }) => {
            const container = document.getElementById("writing-container");
            if (!container) return;

            // Fallback to 0 if values are undefined
            const x = writingX ?? 0;
            const y = writingY ?? 0;

            container.style.position = "absolute";
            container.style.left = `${x}px`;
            container.style.top = `${y}px`;
        });
    },

    loadAndDisplayWritingWidget: async function () {
        const container = document.getElementById("writing-container");
        if (!container) return;

        try {
            const res = await fetch("http://tomisthoughtshop.com.s3-website-us-east-1.amazonaws.com/json/postsByKeyword.json");
            const data = await res.json();

            const fictionPosts = data["Fiction"];
            if (!fictionPosts || fictionPosts.length === 0) {
                container.innerHTML = "<p>No fiction stories found.</p>";
                return;
            }

            const story = fictionPosts[Math.floor(Math.random() * fictionPosts.length)];
            const storyHTML = story.paragraphs.map(p => `<p>${p.textBody}</p>`).join("");

            container.innerHTML = `
                <h3>${story.title}</h3>
                ${storyHTML}
            `;
            container.style.display = "block";
            this.setupFadeOnScroll(container);
        } catch (err) {
            console.error("Error loading fiction story:", err);
            container.innerHTML = "<p>Failed to load story.</p>";
            container.style.display = "block";
        }
    }
};

window.writingWidget = writingWidget;