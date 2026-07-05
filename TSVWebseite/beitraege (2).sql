-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE DATABASE IF NOT EXISTS `sg_nord`
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `sg_nord`;

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Tabellenstruktur für Tabelle `beitraege`
--

DROP TABLE IF EXISTS `beitraege`;

CREATE TABLE `beitraege` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `datum` date NOT NULL,
  `titel` varchar(255) NOT NULL,
  `beschreibung` text DEFAULT NULL,
  `bild_url` varchar(255) DEFAULT NULL,
  `format` varchar(50) DEFAULT '16-9',
  `typ` varchar(50) DEFAULT NULL,
  `kategorie` varchar(50) DEFAULT NULL,
  `ist_highlight` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

--
-- Daten für Tabelle `beitraege`
--

INSERT INTO `beitraege`
(`id`, `datum`, `titel`, `beschreibung`, `bild_url`, `format`, `typ`, `kategorie`, `ist_highlight`, `created_at`)
VALUES
(33, '2026-07-05', 'Willkommen bei der SG Nordangeln', 'Schön, dass ihr da seid!

Unsere neue Webseite ist ab sofort online. Hier findet ihr künftig aktuelle Vereinsnews, Spielberichte, Termine und viele Informationen rund um die SG Nordangeln.

Schaut regelmäßig vorbei – wir halten euch auf dem Laufenden!', 'uploads/img_1783250985.png', '3-4', 'News', 'Sonstige', 1, '2026-07-05 11:29:45'),

(34, '2026-07-05', 'Unsere neue Homepage ist online', 'Nach vielen Stunden Arbeit präsentieren wir euch unsere neue Vereinswebseite.

Sie ist moderner, übersichtlicher und wird künftig regelmäßig mit Neuigkeiten, Terminen und Spielberichten aktualisiert.

Viel Spaß beim Entdecken!', 'uploads/img_1783251034.jpg', '16-9', 'News', '', 1, '2026-07-05 11:30:34'),

(35, '2026-07-05', 'Danke für euren Einsatz!', 'Ob Trainer, Betreuer, Schiedsrichter oder Helfer – ohne euch wäre unser Vereinsleben nicht möglich.

Vielen Dank für euren Einsatz und eure Unterstützung. Gemeinsam machen wir die SG Nordangeln stark!', 'uploads/img_1783251088.jpg', '16-9', 'News', 'Sonstige', 0, '2026-07-05 11:31:28');

--
-- AUTO_INCREMENT auf den nächsten Wert setzen
--

ALTER TABLE `beitraege`
AUTO_INCREMENT = 36;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;