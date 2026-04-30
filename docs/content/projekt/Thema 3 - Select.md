
# Thema 3 - SELECT

## Auftrag

Schreibe **5 SELECT Queries** und dokumentiere sie. Die Queries werden später auch vorgetragen.

**Anforderungen:**
- 1 Query mit einem Filter (`WHERE`)
- 2 Queries mit einer Aggregation (`SUM`, `AVG`, ...)
- 2 Queries über mehrere Tabellen (`JOIN`)

Für jedes Query schreibst du 1–2 Sätze: Was macht der Befehl, und wann wäre er nützlich?

---

## Was ist SELECT?

Mit `SELECT` lesen wir Daten aus einer Tabelle aus – wir verändern nichts, wir schauen nur.

Öffne den [Dein Projekt](https://sqlproject.coffee-journal.com) und gib im [Query Editor](/projekt/sql-tool#query-editor) folgendes ein:

```sql
SELECT name, preis
FROM produkte;
```

Dieser Befehl zeigt die Spalten `name` und `preis` aus der Tabelle `produkte`. Passe ihn auf deine eigene Tabelle an und klicke auf **Run Query**. Du solltest eine Tabelle mit Daten sehen.

> 💡 Du weisst nicht mehr, wie deine Tabellen heissen? [Hier nachschauen.](/projekt/sql-tool#meine-tabellen)

![Erklärung SELECT](/assets/images/select-erklaerung.png)

---

## Query 1 – WHERE (Filter)

Mit `WHERE` zeigen wir nur die Zeilen, die eine bestimmte Bedingung erfüllen.

**Beispiel:** Alle Produkte, die weniger als 5 Franken kosten:

```sql
SELECT name, preis
FROM produkte
WHERE preis < 5;
```

⚡️ Überlege dir einen sinnvollen Filter für deine Tabelle und schreibe dein eigenes Query.

✅ Dokumentiere: Was filtert dein Query, und wann wäre das nützlich?

---

## Query 2 & 3 – JOIN (zwei Tabellen verbinden)

Mit `JOIN` kombinieren wir Daten aus zwei Tabellen. Das macht Sinn, wenn Daten zusammengehören, aber in verschiedenen Tabellen stehen – zum Beispiel Produkte und ihre Bewertungen.

**Beispiel:**

```sql
SELECT produkte.name AS produkt, produkte.preis AS preis, bewertungen.kommentar AS kommentar
FROM produkte
JOIN bewertungen ON produkte.id = bewertungen.produkt_id;
```

Was passiert hier?
- `FROM produkte` – wir starten mit der Tabelle `produkte`
- `JOIN bewertungen` – wir fügen die Tabelle `bewertungen` hinzu
- `ON produkte.id = bewertungen.produkt_id` – wir sagen, wie die zwei Tabellen zusammenhängen: die `id` aus `produkte` entspricht der `produkt_id` in `bewertungen`
- `AS` benennt die Spalten im Ergebnis um

⚡️ Wähle zwei Tabellen aus deinem Projekt, die miteinander verbunden sind. Schreibe zwei verschiedene JOIN Queries.

✅ Dokumentiere beide Queries: Welche Tabellen verbindest du, und was zeigt das Ergebnis?

### N:M Beziehung (optional)

Wenn zwei Tabellen über eine **Zwischentabelle** verbunden sind (n:m), brauchst du zwei `JOIN`s:

```sql
SELECT produkte.name AS produkt, kategorien.name AS kategorie
FROM produkte
JOIN produkt_kategorien ON produkte.id = produkt_kategorien.produkt_id
JOIN kategorien ON kategorien.id = produkt_kategorien.kategorie_id;
```

Hier verbinden wir `produkte` und `kategorien` über die Zwischentabelle `produkt_kategorien`.

---

## Query 4 & 5 – Aggregation (Werte berechnen)

Mit Aggregationsfunktionen berechnen wir Werte aus mehreren Zeilen – zum Beispiel eine Summe oder einen Durchschnitt. Das Ergebnis ist immer eine einzelne Zahl.

Die wichtigsten Funktionen:

| Funktion | Was sie macht |
|----------|--------------|
| `SUM` | Addiert alle Werte einer Spalte |
| `AVG` | Berechnet den Durchschnitt |
| `COUNT` | Zählt die Anzahl Zeilen |
| `MAX` / `MIN` | Gibt den grössten / kleinsten Wert zurück |

**Beispiele:**

```sql
-- Wie viel kosten alle Produkte zusammen?
SELECT SUM(preis) AS gesamtpreis
FROM produkte;

-- Was ist der Durchschnittspreis?
SELECT AVG(preis) AS durchschnittspreis
FROM produkte;

-- Wie viele Produkte gibt es?
SELECT COUNT(*) AS anzahl_produkte
FROM produkte;

-- Was ist das teuerste und günstigste Produkt?
SELECT MAX(preis) AS teuerster, MIN(preis) AS guenstigster
FROM produkte;
```

⚡️ Schreibe zwei eigene Aggregations-Queries für deine Tabellen. Verwende dabei mindestens zwei verschiedene Funktionen.

### GROUP BY – Gruppiert berechnen

Manchmal wollen wir nicht einen Wert für die **gesamte** Tabelle, sondern einen Wert **pro Gruppe**. Dafür gibt es `GROUP BY`.

**Beispiel:** Den Durchschnittspreis pro Kategorie berechnen:

```sql
SELECT kategorie, AVG(preis) AS durchschnittspreis
FROM produkte
GROUP BY kategorie;
```

Was passiert hier?
- `GROUP BY kategorie` – die Tabelle wird nach `kategorie` gruppiert
- `AVG(preis)` – der Durchschnitt wird **pro Gruppe** berechnet, nicht für alle Produkte zusammen

Stell dir vor, du hast Produkte in den Kategorien „Getränke" und „Snacks". Ohne `GROUP BY` bekommst du **einen** Durchschnitt für alles. Mit `GROUP BY kategorie` bekommst du **einen Durchschnitt pro Kategorie**.

⚡️ Überlege, welche Spalte in deiner Tabelle sich zum Gruppieren eignet, und schreibe ein Query mit `GROUP BY`.

✅ Dokumentiere beide Queries: Was berechnen sie, und in welcher Situation wären diese Informationen nützlich?
