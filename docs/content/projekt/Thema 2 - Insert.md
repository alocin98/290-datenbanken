## Thema 2 – Daten einfüllen

### Auftrag

Fülle deine Datenbank mit sinnvollen Daten:
- **2 Haupttabellen** mit je mindestens **15 Einträgen**
- **Alle anderen Tabellen** mit je mindestens **5 Einträgen**

Dokumentiere einen Beispielbefehl und beschreibe in 1–2 Sätzen, wann dieser Befehl verwendet wird.

### Was ist INSERT?

Mit `INSERT` fügen wir neue Zeilen in eine Tabelle ein. Das ist der Befehl, den wir brauchen, um unsere Datenbank mit Daten zu füllen.

**Beispiel:** Ein neues Produkt einfügen:

```sql
INSERT INTO produkte (name, preis)
VALUES ('Kaffee', 3.50);
```

![Erklärung INSERT](../../assets/images/insert-erklaerung.png)

Was passiert hier?
- `INSERT INTO produkte` – wir fügen eine neue Zeile in die Tabelle `produkte` ein
- `(name, preis)` – das sind die Spalten, die wir befüllen
- `VALUES ('Kaffee', 3.50)` – das sind die Werte, die wir eintragen

> 💡 Die Reihenfolge der Werte muss mit der Reihenfolge der Spalten übereinstimmen. `name` bekommt `'Kaffee'`, `preis` bekommt `3.50`.

> 💡 Die Spalte `id` müssen wir nicht angeben, da sie automatisch generiert wird. Wir haben sie als `Serial` definiert.


### Mehrere Einträge auf einmal

Es wäre mühsam, 15 Einträge einzeln einzutippen. Wir können mehrere Zeilen mit einem einzigen Befehl einfügen:

```sql
INSERT INTO produkte (name, preis)
VALUES 
  ('Kaffee', 3.50),
  ('Tee', 2.90),
  ('Wasser', 1.50);
```

Jede Zeile nach `VALUES` ist ein neuer Eintrag. Die Zeilen werden mit einem Komma getrennt, der letzte Eintrag endet mit einem Semikolon `;`.

### Schritt für Schritt


> Wo füllen wir 5 ein und wo 15? Das musst du selber entscheiden. Überlege dir, wo es sinnvoll ist, 15 Einträge zu haben und wo 5.  

**Schritt 1:** Schau dir deine Tabellen an. Welche Spalten hat die Tabelle? Welche Spalten musst du befüllen?

> 💡 Du weisst nicht mehr, wie deine Tabellen und Spalten heissen? [Hier nachschauen.](/projekt/sql-tool#meine-tabellen)

**Schritt 2:** Schreibe einen INSERT Befehl nach diesem Muster:
```sql
INSERT INTO tabellenname (spalte1, spalte2, spalte3)
VALUES 
  (wert1, wert2, wert3),
  (wert1, wert2, wert3);
```

**Schritt 3:** Teste es im Query Editor mit **Run Query**. Erscheint keine Fehlermeldung? Dann hat es geklappt.

**Schritt 4:** Überprüfe deine Einträge mit einem schnellen SELECT:
```sql
SELECT * FROM tabellenname;
```
Siehst du deine neuen Einträge? Perfekt!

**Schritt 5:** Wiederhole das für alle deine Tabellen, bis du die geforderte Anzahl Einträge erreicht hast.

### Tipp: KI verwenden

15 Einträge von Hand erfinden ist aufwändig. Du kannst eine KI wie ChatGPT bitten, dir die Daten zu generieren. Zum Beispiel:

> *„Generiere mir 15 INSERT Befehle für eine SQL Tabelle `produkte` mit den Spalten `name` (Text) und `preis` (Float)."*

Kopiere die generierten Befehle in den Query Editor und führe sie aus.

---

✅ Dokumentiere einen Beispielbefehl aus deinem Projekt und beschreibe in 1–2 Sätzen, was er macht und wann er verwendet wird.
