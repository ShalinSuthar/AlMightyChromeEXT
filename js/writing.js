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
    fetchRandomShardParagraph: async function(slug, fileBase, baseUrl) {
        const shardIndex = Math.floor(Math.random() * 15);
        const apiUrl = `${baseUrl}/${slug}/${fileBase}${shardIndex}.json`
        const res = await fetch(apiUrl);
        const data = await res.json();
    
        const paras = data.paragraphs;
        const paragraph = paras[Math.floor(Math.random() * paras.length)];
        return {
            title: `${data.title} – ${data.author}`,
            html: `<p>${paragraph}</p>`
        };
    },
    loadAndDisplayWritingWidget: async function () {
        const container = document.getElementById("writing-container");
        if (!container) return;
    
        try {
            const source = writingSources[Math.floor(Math.random() * writingSources.length)];
    
            let result;
            if (source.type === "blog") {
                result = await source.fetch();
            } else if (source.type === "shard") {
                result = await this.fetchRandomShardParagraph(source.slug, source.fileBase, source.baseUrl);
            }
    
            container.innerHTML = `
                <h3>${result.title}</h3>
                ${result.html}
            `;
            container.style.display = "block";
            this.setupFadeOnScroll(container);
        } catch (err) {
            console.error("Error loading writing widget:", err);
            container.innerHTML = "<p>Failed to load writing.</p>";
            container.style.display = "block";
        }
    }    
};

window.writingWidget = writingWidget;

const writingSources = [
    {
        type: "blog",
        name: "Tomi",
        fetch: async () => {
            const res = await fetch("http://tomisthoughtshop.com.s3-website-us-east-1.amazonaws.com/json/postsByKeyword.json");
            const data = await res.json();
            const fictionPosts = data["Fiction"] ?? [];

            if (fictionPosts.length === 0) throw new Error("No blog fiction found");

            const story = fictionPosts[Math.floor(Math.random() * fictionPosts.length)];
            const html = story.paragraphs.map(p => `<p>${p.textBody}</p>`).join("");
            return { title: story.title, html };
        }
    },
    {
        type: "shard",
        name: "Melville",
        slug: "herman_melville_moby_dick_shards",
        fileBase: "herman_melville_moby_dick_shard",
        baseUrl: "https://doa508wm14jjw.cloudfront.net/fiction",
    },
    {
        type: "shard",
        name: "Twain",
        slug: "mark_twain_innocents_abroad_shards",
        fileBase: "mark_twain_innocents_abroad_shard",
        baseUrl: "https://doa508wm14jjw.cloudfront.net/fiction",
    }
];