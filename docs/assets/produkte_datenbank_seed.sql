DROP TABLE IF EXISTS bewertungen;
DROP TABLE IF EXISTS produkt_kategorien;
DROP TABLE IF EXISTS produkte;
DROP TABLE IF EXISTS kategorien;

CREATE TABLE kategorien (
  id SERIAL PRIMARY KEY,
  name varchar(100) NOT NULL
);

CREATE TABLE produkte (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  preis double precision NOT NULL,
  gewicht double precision NOT NULL
);

CREATE TABLE produkt_kategorien (
  produkt_id integer NOT NULL,
  kategorie_id integer NOT NULL,
  PRIMARY KEY (produkt_id, kategorie_id),
  FOREIGN KEY (produkt_id) REFERENCES produkte(id),
  FOREIGN KEY (kategorie_id) REFERENCES kategorien(id)
);

CREATE TABLE bewertungen (
  id SERIAL PRIMARY KEY,
  kommentar text NOT NULL,
  sterne integer NOT NULL,
  produkt_id integer NOT NULL,
  FOREIGN KEY (produkt_id) REFERENCES produkte(id)
);

-- kategorien (ids will be 1–6 automatically)
INSERT INTO kategorien (name) VALUES
('Schweiz'),
('Vegetarisch'),
('Frühstück'),
('Käse'),
('Getränk'),
('Snack');

-- produkte (ids will be 1..17 in this order)
INSERT INTO produkte (name, preis, gewicht) VALUES
('fondue', 13, 130),
('Maggi', 13, 60),
('pesto', 3.9, 100),
('Pasta Barilla', 3.5, 500),
('Spaghetti', 2.5, 500),
('Risotto Reis Prix Garantie', 2.5, 500),
('Raclette Käse', 6.5, 400),
('Rösti', 4.2, 500),
('Birchermuesli', 3.8, 450),
('Zopf', 2.9, 300),
('Bündnerfleisch', 9.9, 150),
('Appenzeller Käse', 7.2, 250),
('Rivella', 2.2, 500),
('Cailler Schokolade', 3.5, 100),
('Ovomaltine Pulver', 5.9, 500),
('Landjäger', 4.8, 200),
('Capri sun', 1.2, 150);

-- produkt_kategorien (remapped IDs!)
INSERT INTO produkt_kategorien (produkt_id, kategorie_id) VALUES
(7, 1),
(7, 4),
(8, 1),
(8, 2),
(9, 1),
(9, 2),
(9, 3),
(10, 1),
(10, 3),
(11, 1),
(11, 6),
(12, 1),
(12, 4),
(13, 1),
(13, 5),
(14, 1),
(14, 6),
(15, 1),
(15, 3),
(16, 1),
(16, 6),
(17, 5);

-- bewertungen (remapped produkt_id)
INSERT INTO bewertungen (kommentar, sterne, produkt_id) VALUES
('Perfekt für Raclette-Abend!', 5, 7),
('Guter Geschmack, schmilzt gut.', 4, 7),
('Sehr knusprig und lecker.', 5, 8),
('Etwas fettig, aber gut.', 3, 8),
('Super Frühstück!', 5, 9),
('Frisch und gesund.', 4, 9),
('Sehr fluffig!', 5, 10),
('Mit Butter perfekt.', 4, 10),
('Top Qualität.', 5, 11),
('Etwas teuer, aber wert.', 4, 11),
('Sehr würzig.', 5, 12),
('Starker Geschmack.', 4, 12),
('Typisch Schweiz!', 5, 13),
('Erfrischend.', 4, 13),
('Schmilzt im Mund.', 5, 14),
('Sehr süss.', 4, 14),
('Gibt Energie!', 5, 15),
('Klassiker.', 4, 15),
('Perfekt für unterwegs.', 5, 16),
('Sehr würzig.', 4, 16);