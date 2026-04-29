# 290 datenbanken Documentation Workspace

Dieses Repository verwendet **eine** VitePress-App für die komplette Website:

- Landingpage auf `/`
- Moduldokumentation auf `/modul/`
- Game-Doku auf `/jsgame/`

Alles bleibt markdown-first, gemeinsam gestylt und lokal deploybar nach GitHub Pages.

## Setup

```bash
npm install
npm run dev
```

Weitere Befehle:

- `npm run diagrams:build` exportiert alle `*.excalidraw.json`-Dateien nach SVG.
- `npm run zips:build` erstellt für jeden Unterordner in `docs/projects/` eine gleichnamige `.zip`-Datei in `docs/assets/zips/`.
- `npm run build` erstellt die statische Website lokal.
- `npm run preview` startet eine lokale Vorschau der gebauten Website.
- `npm run deploy` baut lokal und veröffentlicht den Inhalt von `docs/.vitepress/dist` mit `gh-pages`.


## Shared Layout

VitePress verwendet kein einzelnes rohes HTML-Template pro Seite. Die maintainable Entsprechung in diesem Projekt ist:

1. Gemeinsame Site-Konfiguration in [site.config.mjs](site.config.mjs)
2. Gemeinsame Head-Konfiguration und Navigation in [docs/.vitepress/config.mts](docs/.vitepress/config.mts)
3. Gemeinsamer Seiten-Wrapper in [docs/.vitepress/theme/Layout.vue](docs/.vitepress/theme/Layout.vue)
4. Gemeinsames Styling in [docs/.vitepress/theme/custom.css](docs/.vitepress/theme/custom.css)

`Layout.vue` wrappt das Standard-Layout von VitePress einmal zentral. Dort ist der richtige Ort für gemeinsame Body-nahe Strukturen, Shell-Elemente und spätere globale UI-Erweiterungen.

## Shared CSS

Das gemeinsame Styling liegt in [docs/.vitepress/theme/custom.css](docs/.vitepress/theme/custom.css).

Dort sind:

- Farbvariablen für alle Bereiche
- Landingpage-Anpassungen
- gemeinsame Karten-, Bild- und Link-Stile
- leichte Shell-Hintergründe für ein zusammenhängendes Erscheinungsbild

## Shared JavaScript

Der globale Einstiegspunkt für zukünftiges gemeinsames JavaScript ist [docs/.vitepress/theme/shared/global.ts](docs/.vitepress/theme/shared/global.ts).

Aktuell ist die Datei absichtlich klein und SSR-sicher. Sie wird über das Theme global geladen und ist damit der zentrale Ort für spätere Dinge wie:

- gemeinsame Event-Listener
- Analyse- oder Tracking-Hooks
- DOM-basierte UI-Erweiterungen
- eingebundenes Zusatz-JavaScript für alle Seiten

Wenn du später mehr Logik brauchst, erweitere diese Datei oder teile sie in weitere Module innerhalb von `docs/.vitepress/theme/shared/` auf.

## Markdown-Workflow

Die Inhalte leben direkt als `.md`-Dateien unter `docs/`.

- Neue Modulkapitel legst du als Markdown-Dateien in `docs/content/modul/` oder in einem Unterordner davon an.
- Top-Level-Bereiche wie `modul` oder `jsgame` liegen unter `docs/content/`.
- Bilder kannst du in `docs/assets/images/` speichern und direkt aus Markdown referenzieren.
- Diagrammquellen können in `docs/assets/diagrams/` abgelegt werden.
- Unterordner in `docs/projects/` werden vor jedem Build automatisch zu `.zip`-Dateien in `docs/assets/zips/` verpackt.
- ZIP-Dateien aus `docs/assets/zips/` werden beim Dev-Server und Build unter `/assets/zips/<datei>.zip` bereitgestellt. Auf GitHub Pages ist der vollständige Pfad wegen des Base Paths z. B. `/290-datenbanken/assets/zips/click-game-starter.zip`.
- Links auf ZIP-Dateien bekommen beim Build automatisch einen Content-Hash als Query-Parameter, damit Browser und GitHub Pages nach Änderungen keine alte ZIP-Version aus dem Cache ausliefern.
- `docs/assets/diagrams/*.excalidraw.json` werden beim `dev`- und `build`-Prozess automatisch zu `docs/assets/images/*.svg` exportiert.
- Code-Snippets können direkt aus echten Quelldateien importiert werden.

Ein Beispiel dafür findest du in:

- [docs/content/modul/html-elemente-mit-javascript-veraendern/html-elemente-ansprechen.md](docs/content/modul/html-elemente-mit-javascript-veraendern/html-elemente-ansprechen.md)
- [docs/examples/dom-demo/main.js](docs/examples/dom-demo/main.js)

VitePress-Code-Import:

```md
<<< @/examples/dom-demo/main.js#query-example
```

Diagramm-Einbindung nach dem automatischen Export:

```md
![Datenmodell](../assets/images/diagram.svg)
```

## Excalidraw-Workflow

Die Excalidraw-Integration ist lokal in den Vite-Prozess eingebaut.

- Beim Start von `npm run dev` werden vorhandene `*.excalidraw.json`-Dateien zuerst nach SVG exportiert.
- Wenn du eine solche Datei speicherst, erzeugt der Vite-Prozess die passende SVG-Datei neu und lädt die Seite neu.
- Beim `npm run build` passiert derselbe Export vor dem eigentlichen statischen Build.

Die Implementierung liegt in:

- `scripts/excalidraw/export.mjs` für den eigentlichen Export
- `scripts/excalidraw/vite-plugin.mjs` für die Integration in den Dev- und Build-Prozess

Die Zuordnung ist bewusst einfach:

- Quelle: `docs/assets/diagrams/foo.excalidraw.json`
- Ziel: `docs/assets/images/foo.svg`

## Modulkapitel erweitern

Für ein neues Kapitel im Modul:

1. Neue Markdown-Datei unter `docs/content/modul/` anlegen.
2. Falls nötig einen Unterordner für zusammengehörige Kapitel erstellen.
3. Die Sidebar wird beim nächsten Dev-Server-Neustart oder Build automatisch aus dem Dateibaum erzeugt.

Die Modulstruktur ist bewusst flach und lesbar gehalten, damit neue Kapitel ohne Speziallogik ergänzt werden können.

Änderungen unter `docs/content/` lösen im Dev-Server automatisch einen Neustart aus, damit Navigation, Sidebars und Rewrites neu aufgebaut werden.

## Weitere Top-Level-Bereiche ergänzen

Für einen neuen Bereich wie `/workshops/` oder `/api/`:

1. Einen neuen Ordner unter `docs/content/` anlegen, zum Beispiel `docs/content/workshops/`.
2. Eine `index.md` in diesem Ordner anlegen.
3. Navigation und Sidebar werden daraus automatisch erzeugt.
4. Die Landingpage in [docs/index.md](docs/index.md) um einen Link ergänzen.

## GitHub Pages lokal deployen

Die Website wird **lokal** gebaut. Es gibt keine GitHub Actions und keinen Build auf GitHub.

Der Ablauf ist:

1. `npm run build` erzeugt statische Dateien in `docs/.vitepress/dist`.
2. `npm run deploy` veröffentlicht genau diesen Build mit dem Paket `gh-pages`.
3. GitHub Pages liefert danach nur die bereits gebauten statischen Dateien aus.

## Game Framework auf GitHub Pages

Die Quelle für das Framework liegt direkt unter `docs/public/game-framework/`. Alles unter `docs/public/` wird von VitePress unverändert nach GitHub Pages veröffentlicht, deshalb ist kein zusätzlicher Kopier-Schritt mehr nötig.

Beispiel innerhalb dieses Repositories:

```html
<script src="/290-datenbanken/game-framework/bbzgame.js"></script>
```

Mit der GitHub-Pages-Domain entspricht das:

```html
<script src="https://bbz-biel-informatik.github.io/290-datenbanken/game-framework/bbzgame.js"></script>
```

Danach steht die API als `window.BBZGame` zur Verfügung:

```html
<script>
  BBZGame.initGame();
  BBZGame.setPosition(document.getElementById("player"), 120, 40);
</script>
```

Das ist technisch kein externes CDN wie unpkg oder jsDelivr, aber es verhält sich für eure eigenen Seiten ähnlich: GitHub Pages liefert die Datei als statisches Asset über eine feste URL aus.

Wichtig: GitHub Pages muss einmalig so konfiguriert sein, dass es die veröffentlichte Pages-Branch verwendet.

## Base Path und Repository-Name

Der zentrale Ort für den GitHub-Pages-Basispfad ist [site.config.mjs](site.config.mjs).

Standard:

- `repoName: "290-datenbanken"` führt zu `base: "/290-datenbanken/"`

Wenn das Repository umbenannt wird, ändere dort `repoName`.

Alternativ kannst du zur Laufzeit überschreiben:

```bash
VITEPRESS_BASE=/mein-repo/ npm run build
```

Für eine User- oder Org-Page auf Root-Level verwendest du `/` als Base.

Die Excalidraw-Hinweise liegen in `docs/assets/diagrams/README.txt`, damit sie nicht als eigene Website-Seite veröffentlicht werden.
