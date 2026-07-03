<?php
session_start();
$ADMIN_PW = "SG-Nord-2026"; // Passwort bleibt auf dem Server

// api.php
header('Content-Type: application/json; charset=utf-8');
header("Access-Control-Allow-Origin: *"); // Für Entwicklung, später einschränken
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

require 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

// --- GET: Beiträge abrufen (mit Filter-Logik) ---
// This part is public and can be called without login.
if ($method === 'GET') {
    // Add a server-side check for login status
    if (isset($_GET['action']) && $_GET['action'] === 'check-status') {
        if (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
            echo json_encode(['status' => 'loggedin']);
        } else {
            echo json_encode(['status' => 'loggedout']);
        }
        exit;
    }

    $sql = "SELECT * FROM beitraege WHERE 1=1";
    $params = [];

    // Filter 1: Kategorie (z.B. ?category=Fussball)
    if (!empty($_GET['category']) && $_GET['category'] !== 'all') {
        $sql .= " AND kategorie = ?";
        $params[] = $_GET['category'];
    }

    // Filter 2: Typ (z.B. ?type=News)
    if (!empty($_GET['type']) && $_GET['type'] !== 'all') {
        $sql .= " AND typ = ?";
        $params[] = $_GET['type'];
    }

    // Filter 3: Highlight (z.B. ?highlight=1)
    if (isset($_GET['highlight'])) {
        $sql .= " AND ist_highlight = ?";
        $params[] = 1;
    }

    // Sortierung: Standardmäßig neueste zuerst
    $sql .= " ORDER BY datum DESC, id DESC";

    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $data = $stmt->fetchAll();
        echo json_encode($data);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Fehler beim Laden der Daten']);
    }
    exit;
}

// --- POST: Neue Beiträge erstellen oder löschen (Admin) ---
if ($method === 'POST') {
    $action = $_POST['action'] ?? '';

    // Login is the only action allowed without a session
    if ($action === 'login') {
        if (isset($_POST['password']) && $_POST['password'] === $ADMIN_PW) {
            $_SESSION['loggedin'] = true;
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Falsches Passwort']);
        }
        exit;
    }

    // For all other POST actions, require a valid session
    if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Nicht autorisiert. Bitte neu einloggen.']);
        exit;
    }

    // 1. Prüfen ob Upload-Ordner existiert
    if (!is_dir('uploads')) {
        mkdir('uploads', 0755, true);
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? 0;
        $stmt = $pdo->prepare("DELETE FROM beitraege WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['status' => 'success', 'message' => 'Gelöscht']);
        exit;
    }

    if ($action === 'save') {
        $titel = $_POST['titel'] ?? 'Ohne Titel';
        $datum = $_POST['datum'] ?? date('Y-m-d');
        $beschreibung = $_POST['beschreibung'] ?? '';
        $kategorie = $_POST['kategorie'] ?? 'Verein';
        $typ = $_POST['typ'] ?? 'News';
        $format = $_POST['format'] ?? '16-9';
        // Ändere diese Zeile:
        $isHighlight = (isset($_POST['isHighlight']) && $_POST['isHighlight'] === "1") ? 1 : 0;        
        // Bild-Handling
        $bildPath = $_POST['current_image'] ?? ''; // Falls kein neues Bild, altes behalten
        
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $filename = 'img_' . time() . '.' . $ext;
            $target = 'uploads/' . $filename;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
                $bildPath = $target; // Relativer Pfad für die DB
            }
        }

        // INSERT (oder UPDATE Logik hier ergänzen, falls ID übergeben wird)
        $sql = "INSERT INTO beitraege (datum, titel, beschreibung, bild_url, format, typ, kategorie, ist_highlight) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$datum, $titel, $beschreibung, $bildPath, $format, $typ, $kategorie, $isHighlight]);

        echo json_encode(['status' => 'success']);
        exit;
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Ungültige Anfrage']);
?>