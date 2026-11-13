# Greving.Shop im Main-Branch veröffentlichen

Das ZIP enthält die benötigten App-Dateien direkt auf oberster Ebene. Es gibt keinen zusätzlichen App- oder docs-Unterordner.

1. ZIP auf dem Computer entpacken.
2. https://github.com/github-horst-23/grevingshop öffnen.
3. Im Branch **main** die Option **Add file → Upload files** wählen.
4. Alle entpackten Dateien in die Upload-Fläche ziehen. Besonders wichtig: `index.html`, `app.js`, `styles.css`, `supabase.js`, `service-worker.js`, `manifest.webmanifest` und die Icons. README, diese Anleitung, die Smartphone-Vorschau und das SQL-Setup können mit hochgeladen werden. Das ZIP selbst wird von GitHub nicht automatisch entpackt.
5. Mit **Commit changes** speichern.
6. Unter **Settings → Pages** einstellen: **Deploy from a branch → main → / (root)** und speichern.
7. Unter **Actions** auf den erfolgreichen Abschluss von **pages build and deployment** warten.
8. https://github-horst-23.github.io/grevingshop/ öffnen.

Ein eventuell vorhandener alter docs-Ordner wird bei dieser Einstellung nicht für die App verwendet.

## Smartphone-Vorschau

https://github-horst-23.github.io/grevingshop/s24fe.html

Lokal im entpackten Ordner `python3 -m http.server 4173` ausführen und http://localhost:4173/s24fe.html öffnen. Die Vorschau verwendet ein 384 × 832 CSS-Pixel großes Fenster; die tatsächliche Darstellung hängt von Bildschirmzoom und Browserleisten ab.

## Supabase

Die Einkaufslisten-Tabellen, Zugriffsregeln und Realtime sind bereits eingerichtet. Auch die Erweiterung für persönliche Einstellungen und automatische Kategorien wurde im bestehenden Projekt bereits ausgeführt. Es ist kein erneuter SQL-Lauf nötig. Für andere bestehende Supabase-Projekte zuerst `supabase-update.sql` ausführen; für neue Installationen `supabase-setup.sql`.

## Neu in dieser Fassung

- Einheitliche Abstände von 16 Pixeln zwischen den Inhaltskästen, auch zwischen Anmeldekarte und Infokarten.
- Beschreibende Unterzeilen unter den Seitenüberschriften entfernt. Eigene Listennotizen bleiben erhalten.
- Menüanimation wie in Greving.Fit: kreisförmiges Öffnen vom tatsächlichen Menüknopf und gestaffelt aufsteigende Menüeinträge.
- Animationen werden bei der Systemeinstellung für reduzierte Bewegung deaktiviert.
- Alle Dateien liegen weiterhin direkt auf ZIP-Hauptebene für **main → / (root)**.

- Produkte werden automatisch nach Hauptkategorien entlang einer üblichen Supermarkt-Laufrichtung gruppiert; eine manuelle Kategorieauswahl bleibt möglich.
- Farbschema, Hell/Dunkel, Schriftgröße und Dichte werden pro Konto in Supabase gespeichert und beim Start mit abgerufen.
- Nach erfolgreicher ZIP-Erstellung bleibt im Projektordner nur **Greving.Shop-main-root.zip** bestehen.
