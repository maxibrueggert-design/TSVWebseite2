<?php
// config.php
$host = 'localhost';
$db   = 'sg_nord';
$user = 'root';
$pass = ''; // Bei XAMPP meist leer, sonst anpassen
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // Im Live-Betrieb niemals $e->getMessage() direkt ausgeben (Sicherheitsrisiko)
    die(json_encode(['status' => 'error', 'message' => 'Datenbankverbindung fehlgeschlagen']));
}
?>