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
        const cacheKey = `cachedFiction_${slug}`;
        const counterKey = `fictionCount_${slug}`;
    
        const { [counterKey]: count = 0, [cacheKey]: cached } = await chrome.storage.sync.get([counterKey, cacheKey]);
        const useCached = count % 3 !== 0;
    
        await chrome.storage.sync.set({ [counterKey]: count + 1 });
    
        if (useCached && cached) {
            return JSON.parse(cached);
        }
    
        // Fresh fetch
        const shardIndex = Math.floor(Math.random() * 15);
        const apiUrl = `${baseUrl}/${slug}/${fileBase}${shardIndex}.json`;
        const res = await fetch(apiUrl);
        const data = await res.json();
    
        const paras = data.paragraphs;
        const paragraph = paras[Math.floor(Math.random() * paras.length)];
        const result = {
            title: `${data.title} – ${data.author}`,
            html: `<p>${paragraph}</p>`
        };
    
        await chrome.storage.sync.set({ [cacheKey]: JSON.stringify(result) });
    
        return result;
    },    
    loadAndDisplayWritingWidget: async function () {
        const container = document.getElementById("writing-container");
        if (!container) return;
    
        try {
            // fetch values from cache
            const {
                fictionGlobalCount = 0,
                fictionGlobalCache
            } = await chrome.storage.sync.get(["fictionGlobalCount", "fictionGlobalCache"]);
    
            const useCached = fictionGlobalCount % 3 !== 0;
    
            await chrome.storage.sync.set({ fictionGlobalCount: (fictionGlobalCount + 1) % 3 });
    
            let result;
    
            if (useCached && fictionGlobalCache) {
                result = JSON.parse(fictionGlobalCache);
            } else {
                const source = writingSources[Math.floor(Math.random() * writingSources.length)];
    
                if (source.type === "blog") {
                    result = await source.fetch();
                } else if (source.type === "shard") {
                    const shardIndex = Math.floor(Math.random() * 15);
                    const apiUrl = `${source.baseUrl}/${source.slug}/${source.fileBase}${shardIndex}.json`;
                    const res = await fetch(apiUrl);
                    const data = await res.json();
    
                    const paras = data.paragraphs;
                    const paragraph = paras[Math.floor(Math.random() * paras.length)];
                    result = {
                        title: `${data.title} – ${data.author}`,
                        html: `<p>${paragraph}</p>`
                    };
                }
                await chrome.storage.sync.set({ fictionGlobalCache: JSON.stringify(result) });
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
            // Track how many times the widget has loaded
            const {
                fictionGlobalCount = 0,
                fictionGlobalCache
            } = await chrome.storage.sync.get(["fictionGlobalCount", "fictionGlobalCache"]);

            const useCached = fictionGlobalCount % 3 !== 0;

            await chrome.storage.sync.set({ fictionGlobalCount: (fictionGlobalCount + 1) % 3 });

            if (useCached && fictionGlobalCache) {
                return JSON.parse(fictionGlobalCache);
            }

            // Fetch fresh data every 3rd load
            const res = await fetch("http://tomisthoughtshop.com.s3-website-us-east-1.amazonaws.com/json/postsByKeyword.json");
            const data = await res.json();
            const fictionPosts = data["Fiction"] ?? [];

            if (fictionPosts.length === 0) throw new Error("No blog fiction found");

            const story = fictionPosts[Math.floor(Math.random() * fictionPosts.length)];
            const paras = story.paragraphs.map(p => p.textBody).filter(p => p.length > 100);
            const randPara = paras[Math.floor(Math.random() * paras.length)];

            const result = {
                title: `${story.title} – Tomi`,
                html: `<p>${randPara}</p>`
            };

            // Cache it
            await chrome.storage.sync.set({ fictionGlobalCache: JSON.stringify(result) });

            return result;
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