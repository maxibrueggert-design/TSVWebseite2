// js/admin.js
const API_URL = 'api.php'; // Pfad ggf. anpassen

document.addEventListener('DOMContentLoaded', async () => {
    // Check login status with the server on page load
    try {
        const res = await fetch(`${API_URL}?action=check-status`, { credentials: 'include' });
        const data = await res.json();
        if (data.status === 'loggedin') {
            showDashboard();
        }
    } catch (e) {
        console.error("Could not check login status.", e);
    }
});

async function checkLogin() {
    const password = document.getElementById('admin-password').value;
    
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('password', password);

    try {
        const res = await fetch('api.php', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });

        if (res.ok) {
            location.reload(); // Seite neu laden, um den Status-Check beim Start auszulösen
        } else {
            alert("Falsches Passwort!");
        }
    } catch (e) {
        alert("Serverfehler beim Login.");
    }
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('dashboard-section').style.display = 'block'; // Falls inline style gesetzt war
    loadPosts(); // Liste laden
    
    // Datum auf heute setzen
    document.getElementById('datum').valueAsDate = new Date();
}

async function logout() {
    await fetch(`${API_URL}?action=logout`, { credentials: 'include' });
    location.reload();
}

// --- DATEN LADEN & LÖSCHEN ---
async function loadPosts() {
    const list = document.getElementById('posts-list');
    list.innerHTML = 'Lade Daten...';

    try {
        // No credentials needed for public GET
        const res = await fetch(API_URL); // GET Request
        const data = await res.json();
        
        // Sortieren: Neueste zuerst
        data.sort((a, b) => b.id - a.id);

        list.innerHTML = data.map(post => `
            <div class="post-item">
                <div>
                    <strong>${post.titel}</strong><br>
                    <small>${post.datum} | ${post.kategorie} (${post.typ})</small>
                </div>
                <button class="delete-btn" onclick="deletePost(${post.id})">Löschen</button>
            </div>
        `).join('');

    } catch (e) {
        console.error(e);
        list.innerHTML = 'Fehler beim Laden.';
    }
}

async function deletePost(id) {
    if(!confirm("Wirklich löschen?")) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);

    await fetch(API_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
    
    loadPosts();
}

// --- FORMULAR ABSENDEN (SPEICHERN) ---
document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('action', 'save');
    formData.append('titel', document.getElementById('titel').value);
    formData.append('datum', document.getElementById('datum').value);
    formData.append('typ', document.getElementById('typ').value);
    formData.append('kategorie', document.getElementById('kategorie').value);
    formData.append('isHighlight', document.getElementById('ist_highlight').checked ? "1" : "0");
    formData.append('beschreibung', document.getElementById('beschreibung').value);
    // In der submit-Funktion hinzufügen:
    formData.append('format', document.getElementById('format').value);
    
    const fileInput = document.getElementById('image-file');
    if(fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
    }

    // Senden
    try {
        const res = await fetch(API_URL, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const result = await res.json();
        
        if(result.status === 'success') {
            alert("Gespeichert!");
            document.getElementById('post-form').reset();
            document.getElementById('datum').valueAsDate = new Date();
            loadPosts();
        } else {
            alert("Fehler: " + result.message);
        }
    } catch(err) {
        console.error(err);
        alert("Speichern fehlgeschlagen.");
    }
});