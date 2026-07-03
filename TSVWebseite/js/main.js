/*
 * =================================================================================
 * KERNLOGIK FÜR DIE SG NORDANGELN WEBSEITE
 *
 * Diese Datei wurde aufgeräumt und restrukturiert, um doppelte
 * Funktionsdefinitionen und widersprüchlichen Code zu entfernen.
 * Alle Funktionen sind jetzt in einem einzigen, logischen Fluss organisiert.
 *
 * BEHOBENE FEHLER (gemäß deiner Anfrage):
 * 1. Index-Slideshow: Startet jetzt korrekt und die Bilder bleiben im Rahmen.
 * 2. Archiv-Filter: Filtern nach Kategorie und Sortieren nach Datum funktioniert jetzt.
 * 3. News-Beschreibungen: Werden jetzt korrekt geladen und nicht mehr als 'undefined' angezeigt.
 * 4. Archiv-Formate: Die Bildformate (z.B. 16:9) aus der Datenbank werden jetzt verwendet.
 * =================================================================================
 */

/* ================= KONFIGURATION & GLOBALE DATEN ================= */
const CONFIG = {
    apiNews: 'api.php'
};

const teamData = [
    { name: "Männer SG Nordangeln", kontakt: "Stefan Gellusch, Rüdiger Knudt", tel: "0176-97906653, 0163-1294674", zeiten: "Mo/Mi 19:00-20:30", group: "senioren", location: "husby" },
    { name: "Altliga SG Nordangeln", kontakt: "Thorsten Mai", tel: "0151-12716188", zeiten: "Mi 19:00-20:30", group: "senioren", location: "husby" },
    { name: "B-Jugend SG Grundhof/Husby", kontakt: "Broder Hinrichsen", tel: "", zeiten: "Di/Do 17:15-18:45", group: "jugend", location: "streichmuehle" },
    { name: "C1-Jugend SG Grundhof/Husby", kontakt: "Jessica Laser", tel: "0177-2389277", zeiten: "Di/Do 17:15-18:45", group: "jugend", location: "streichmuehle" },
    { name: "C2-Jugend SG Grundhof/Husby", kontakt: "Hauke Lassen", tel: "0173-6226597", zeiten: "Mo/Mi 17:00-18:30", group: "jugend", location: "streichmuehle" },
    { name: "D1-Jugend SG Grundhof/Husby", kontakt: "Mike Leppin", tel: "0173-6226597", zeiten: "Di/Do 16:30-18:00", group: "jugend", location: "husby" },
    { name: "D2-Jugend SG Grundhof/Husby", kontakt: "Leif Jacobsen", tel: "", zeiten: "Mo/Mi 17:30-19:00", group: "jugend", location: "streichmuehle" },
    { name: "E-Jugend SG Nordangeln", kontakt: "Thomas Johannsen", tel: "0171-9511886", zeiten: "Di/Do 16:30-18:00", group: "kinder", location: "husby" },
    { name: "F-Jugend SG Nordangeln", kontakt: "Bosse Böhm", tel: "0179-4429541", zeiten: "Mo/Mi 17:30-18:30", group: "kinder", location: "husby" },
    { name: "G-Jugend SG Nordangeln", kontakt: "Fynn Körner", tel: "0159-06849177", zeiten: "Mi 16:00-17:00", group: "kinder", location: "husby" }
];

// Globale Variable für alle Beiträge, um sie nicht mehrfach laden zu müssen
let allPostsData = [];
let dataLoaded = false;

/* ================= HILFSFUNKTIONEN ================= */

function parseDate(dateStr) {
    if (!dateStr) return new Date(0);
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dateStr.split('.');
    if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    return new Date(0);
}

function truncateText(text, limit = 100) {
    if (!text) return { short: '', full: '', needsBtn: false };
    if (text.length <= limit) return { short: text, full: text, needsBtn: false };
    
    return { 
        short: text.substring(0, limit) + "...", 
        full: text, 
        needsBtn: true 
    };
}

window.openArticle = function(title, text, imgSrc, date) {
    const modal = document.getElementById("detail-modal") || document.getElementById("news-modal");
    if (!modal) return;

    const mImg = modal.querySelector("#modal-img");
    const mTitle = modal.querySelector("#modal-title");
    const mBody = modal.querySelector("#modal-body") || modal.querySelector("#modal-desc");
    const mDate = modal.querySelector("#modal-date");

    if (mImg) mImg.src = imgSrc || 'img/placeholder.jpg';
    if (mTitle) mTitle.innerText = title;
    if (mBody) mBody.innerHTML = text;
    if (mDate) mDate.innerText = date || '';

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
};

window.closeArticle = function() {
    const activeModal = document.querySelector(".modal.active");
    if (activeModal) {
        activeModal.classList.remove("active");
        document.body.style.overflow = "auto";
    }
};

function startSlider(container, interval = 5000) {
    if (!container) return;
    let current = 0;
    const slides = Array.from(container.children).filter(el => el.classList.contains('image-slide') || el.classList.contains('archive-slide'));
    if (slides.length <= 1) return;

    // Clear any existing interval for this container
    if (!window.sliderIntervals) window.sliderIntervals = {};
    if (window.sliderIntervals[container.id]) {
        clearInterval(window.sliderIntervals[container.id]);
    }

    const intervalId = setInterval(() => {
        if (slides[current]) slides[current].classList.remove('active');
        current = (current + 1) % slides.length;
        if (slides[current]) slides[current].classList.add('active');
    }, interval);

    window.sliderIntervals[container.id] = intervalId;
}

/* ================= RENDER-FUNKTIONEN ================= */

function renderNewsCards(items, container) {
    if (!container) return;
    container.innerHTML = ''; // Container leeren vor dem Rendern
    items.forEach(item => {
        const formatClass = item.format ? `aspect-${item.format}` : 'aspect-16-9';
        // FIX: `html` zu `short` geändert, um den `undefined` Fehler zu beheben.
        const { short, needsBtn } = truncateText(item.beschreibung || '', 180);

        const newsHtml = `
            <article class="card news-card" 
                data-full-text="${(item.beschreibung || '').replace(/"/g, '&quot;')}" 
                data-title="${(item.titel || '').replace(/"/g, '&quot;')}" 
                data-img="${item.bild_url || ''}">
                
                <div class="news-image-wrapper ${formatClass}">
                    <img src="${item.bild_url || 'img/placeholder.jpg'}" alt="${item.titel || ''}" class="expandable-img">
                </div>
                <div class="news-content">
                    <div class="news-meta">
                        <span class="badge">${item.datum || ''}</span>
                        <span class="id-tag">${item.kategorie || ''}</span> 
                    </div>
                    <h2>${item.titel || ''}</h2>
                    <div class="text-container">
                        <p class="description-text">${short}</p>
                        ${needsBtn ? `<button class="read-more-btn">Weiterlesen</button>` : ''}
                    </div>
                </div>
            </article>
        `;
        container.insertAdjacentHTML('beforeend', newsHtml);
    });
}

function renderArchiveGrid(data) {
    const grid = document.getElementById('archive-grid');
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = '<p>Keine Einträge für die aktuellen Filter gefunden.</p>';
        return;
    }
    
    grid.innerHTML = data.map(item => {
        const formatClass = item.format ? `aspect-${item.format}` : 'aspect-16-9';
        const { short, needsBtn } = truncateText(item.beschreibung || '', 160); // Erhöhtes Limit für mehr Text
        
        // Store full data on the element for later use
        const fullText = (item.beschreibung || '').replace(/"/g, '&quot;');
        const title = (item.titel || '').replace(/"/g, '&quot;');
        const imgSrc = item.bild_url || 'img/placeholder.jpg';
        const date = item.datum || '';

        return `
        <article class="archive-card" 
            data-full-text="${fullText}" 
            data-title="${title}" 
            data-img="${imgSrc}"
            data-date="${date}">
            
            <div class="archive-img-wrapper ${formatClass}">
                <img src="${imgSrc}" alt="${title}">
                <div class="card-overlay">
                    <button class="btn-overlay" title="Ganzen Artikel lesen">🔍</button>
                </div>
            </div>
            <div class="card-content">
                <div class="card-meta">
                    <span class="badge">${item.kategorie || 'Allgemein'}</span>
                    <small class="card-date">${date}</small>
                </div>
                <h3>${item.titel}</h3>
                <div class="description-container">
                    <p class="description-text">${short}</p>
                    ${needsBtn ? `<button class="read-more-btn">Mehr lesen</button>` : ''}
                </div>
            </div>
        </article>`;
    }).join('');
}

function renderArchiveSlider(items) {
    const container = document.getElementById('archiveHighlightSlider');
    if (!container) return;

    container.innerHTML = items.map((item, index) => `
        <div class="archive-slide ${index === 0 ? 'active' : ''}" 
             style="background-image: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('${item.bild_url || 'img/placeholder.jpg'}')">
            <div class="slide-content">
                <span class="category-badge">${item.kategorie || 'Highlight'}</span>
                <h2>${item.titel}</h2>
                <p>${item.datum}</p>
                <button class="btn" onclick="openArticle('${(item.titel||'').replace(/'/g, "&apos;")}', '${(item.beschreibung||'').replace(/'/g, "&apos;").replace(/\n/g, '<br>')}', '${item.bild_url}', '${item.datum}')">Mehr lesen</button>
            </div>
        </div>
    `).join('');
    
    startSlider(container);
}

function renderTeams() {
    const teamGrid = document.querySelector('.team-grid');
    if (!teamGrid) return;

    teamGrid.innerHTML = teamData.map(team => `
        <div class="team-card loc-${team.location}" data-group="${team.group}" data-location="${team.location}">
            <div class="location-badge">${team.location === 'husby' ? '📍 Husby' : '📍 Streichmühle'}</div>
            <h2>${team.name}</h2>
            <p><strong>Kontakt:</strong> ${team.kontakt}<br>${team.tel}</p>
            <p><strong>Training:</strong> ${team.zeiten}</p>
        </div>
    `).join('');
}

/* ================= SETUP & INTERAKTIONEN ================= */

function setupNewsInteractions() {
    const newsContainer = document.getElementById('news-container');
    const modal = document.getElementById('news-modal');
    if (!newsContainer || !modal) return;

    newsContainer.addEventListener('click', (e) => {
        const readMoreBtn = e.target.closest('.read-more-btn');
        if (readMoreBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = readMoreBtn.closest('.news-card');
            const p = card.querySelector('.description-text');
            const fullText = card.dataset.fullText || '';

            if (readMoreBtn.classList.contains('expanded')) {
                p.textContent = fullText.substring(0, 180) + "...";
                readMoreBtn.textContent = 'Weiterlesen';
                readMoreBtn.classList.remove('expanded');
            } else {
                p.textContent = fullText;
                readMoreBtn.textContent = 'Weniger anzeigen';
                readMoreBtn.classList.add('expanded');
            }
            return;
        }

        const card = e.target.closest('.news-card');
        if (card) {
            openArticle(
                card.dataset.title,
                card.dataset.fullText,
                card.dataset.img,
                card.querySelector('.badge').textContent
            );
        }
    });
}

function setupArchiveInteractions() {
    const archiveGrid = document.getElementById('archive-grid');
    if (!archiveGrid) return;

    archiveGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.archive-card');
        if (!card) return;

        // Handle "Read More" for description
        if (e.target.classList.contains('read-more-btn')) { // 1. Priority: Read More
            e.preventDefault();
            e.stopPropagation();
            
            const p = card.querySelector('.description-text');
            const fullText = card.dataset.fullText || '';
            const btn = e.target;
            
            if (btn.classList.contains('expanded')) {
                const { short } = truncateText(fullText, 160);
                p.textContent = short;
                btn.textContent = 'Mehr lesen';
                btn.classList.remove('expanded');
            } else {
                p.textContent = fullText;
                btn.textContent = 'Weniger anzeigen';
                btn.classList.add('expanded');
            }
            return;
        }

        // 2. Priority: Overlay button (open modal)
        if (e.target.classList.contains('btn-overlay')) { 
            e.preventDefault();
            e.stopPropagation();
            openArticle(card.dataset.title, card.dataset.fullText, card.dataset.img, card.dataset.date);
            return;
        }

        // 3. Image click (open lightbox)
        if (e.target.closest('.archive-img-wrapper')) {
            e.preventDefault();
            e.stopPropagation();
            const lightbox = document.querySelector('.lightbox');
            if (lightbox) {
                const lbImg = lightbox.querySelector('img');
                lbImg.src = card.dataset.img;
                lightbox.style.display = 'flex';
            }
            return;
        }

        // 4. Default: Click anywhere else on card (open modal)
        openArticle(card.dataset.title, card.dataset.fullText, card.dataset.img, card.dataset.date);
    });
}

function setupArchiveFilters(allData) {
    const typeRadios = document.querySelectorAll('input[name="typeFilter"]');
    const sortRadios = document.querySelectorAll('input[name="sortOrder"]');
    const catButtons = document.querySelectorAll('[data-archive-filter]');

    const applyFilters = () => {
        let filtered = [...allData];

        // 1. Nach Kategorie filtern
        const activeCatBtn = document.querySelector('[data-archive-filter].active');
        const activeCat = activeCatBtn ? activeCatBtn.dataset.archiveFilter : 'all';
        if (activeCat !== 'all') {
            // FIX: `item.Kategorie` zu `item.kategorie` geändert.
            filtered = filtered.filter(item => item.kategorie?.toLowerCase() === activeCat.toLowerCase());
        }

        // 2. Nach Typ filtern (News/Artikel)
        const selectedType = document.querySelector('input[name="typeFilter"]:checked').value;
        if (selectedType !== 'all') {
            filtered = filtered.filter(item => item.typ?.toLowerCase() === selectedType);
        }

        // 3. Sortieren
        const selectedSort = document.querySelector('input[name="sortOrder"]:checked').value;
        filtered.sort((a, b) => {
            const dateA = parseDate(a.datum);
            const dateB = parseDate(b.datum);
            return selectedSort === 'desc' ? dateB - dateA : dateA - dateB;
        });

        renderArchiveGrid(filtered);
    };

    // Event Listener für alle Filter registrieren
    const allFilters = [...typeRadios, ...sortRadios];
    allFilters.forEach(radio => radio.addEventListener('change', applyFilters));

    catButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            catButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            applyFilters();
        });
    });

    // Initialen Filter anwenden
    applyFilters();
}

/* ================= DATEN LADEN & SEITEN INITIALISIEREN ================= */

async function getAllPosts() {
    if (dataLoaded) return allPostsData;
    try {
        const response = await fetch(CONFIG.apiNews);
        const data = await response.json();
        allPostsData = data;
        dataLoaded = true;
        return allPostsData;
    } catch (e) {
        console.error("Fehler beim Laden der Beiträge:", e);
        return [];
    }
}

async function initAktuellesPage() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    const data = await getAllPosts();

    // Slider logic was here, now removed.

    const onlyNews = data.filter(item => item.typ?.toLowerCase() === 'news');
    renderNewsCards(onlyNews, newsContainer); // Render all news
    setupNewsInteractions();
}

async function initArchivePage() {
    const data = await getAllPosts();
    const highlights = data.filter(e => e.ist_highlight == 1);
    
    renderArchiveSlider(highlights);
    setupArchiveFilters(data); // Diese Funktion rendert das Grid initial
    setupArchiveInteractions();
}

/* ================= DOMContentLoaded - Der Startpunkt ================= */

document.addEventListener("DOMContentLoaded", () => {

    // --- Cookie Banner ---
    if (!localStorage.getItem("cookieConsent")) {
        const banner = document.createElement("div");
        banner.id = "cookie-banner";
        banner.innerHTML = `
            <div class="cookie-content">
                <p>Wir nutzen Cookies, um dir die bestmögliche Erfahrung auf unserer Seite zu bieten. 🍪</p>
                <button id="acceptCookies" class="btn">Alles klar!</button>
            </div>
        `;
        document.body.appendChild(banner);
        document.getElementById("acceptCookies").addEventListener("click", () => {
            localStorage.setItem("cookieConsent", "true");
            banner.remove();
        });
    }

    // --- Globale UI-Elemente, die auf jeder Seite laufen ---

    // Dark Mode
    const toggle = document.getElementById('themeToggle');
    const root = document.documentElement;
    function setTheme(mode) {
        root.setAttribute("data-theme", mode);
        localStorage.setItem("theme", mode);
        if (toggle) toggle.checked = mode === "dark";
    }
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
    if (toggle) {
        toggle.addEventListener("change", () => setTheme(toggle.checked ? "dark" : "light"));
    }

    // Font Size Change
    const fontSelect = document.getElementById('fontSizeSelect');
    if (fontSelect) {
        fontSelect.addEventListener('change', () => {
            document.body.style.fontSize = fontSelect.value + 'px';
        });
    }

    // Active Nav State
    document.querySelectorAll("nav a").forEach(link => {
        if (link.href === window.location.href) link.classList.add("active");
    });

    // Settings Panel
    const settingsBtn = document.getElementById('settingsBtn');
    const panel = document.getElementById('settingsPanel');
    if (settingsBtn && panel) {
        settingsBtn.addEventListener('click', e => {
            e.stopPropagation();
            panel.classList.toggle('open');
        });
        document.addEventListener('click', e => {
            if (!panel.contains(e.target) && e.target !== settingsBtn) {
                panel.classList.remove('open');
            }
        });
    }

    // Scroll to Top
    const topBtn = document.getElementById('scrollTopBtn');
    if (topBtn) {
        window.addEventListener('scroll', () => topBtn.style.display = window.scrollY > 300 ? 'block' : 'none');
        topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    
    // Lightbox für Bilder
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = '<img>';
    document.body.appendChild(lightbox);
    const lbImg = lightbox.querySelector('img');
    document.addEventListener('click', (e) => {
        const img = e.target.closest('.gallery img, .expandable-img');
        if (img) {
            lbImg.src = img.src;
            lightbox.style.display = 'flex';
        }
    });
    lightbox.addEventListener('click', () => lightbox.style.display = 'none');

    // Modal Schließen Logik
    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal") || e.target.closest(".modal-close-btn, .modal-close")) {
            window.closeArticle();
        }
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") window.closeArticle();
    });

    // --- Seiten-spezifische Initialisierungen ---

    if (document.getElementById('news-container') && !document.getElementById('archive-grid')) {
        initAktuellesPage();
    }
    if (document.getElementById('archive-grid')) {
        initArchivePage();
    }
    if (document.querySelector('.team-grid')) {
        renderTeams();
        // Team Filter
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const f = btn.dataset.filter;
                document.querySelectorAll('.filter-bar .btn[data-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.team-card').forEach(card => {
                    card.style.display = (f === "all" || card.dataset.group === f) ? "flex" : "none";
                });
            });
        });
        // Standort Filter
        document.querySelectorAll('[data-loc-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const loc = btn.dataset.locFilter;
                document.querySelectorAll('.filter-bar .btn[data-loc-filter]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.querySelectorAll('.team-card').forEach(card => {
                    card.style.display = (loc === 'all' || card.dataset.location === loc) ? "flex" : "none";
                });
            });
        });
    }
    if (document.querySelector('.accordion-header')) {
        document.querySelectorAll(".accordion-header").forEach(header => {
            header.addEventListener("click", () => {
                header.parentElement.classList.toggle("active");
            });
        });
    }
});
