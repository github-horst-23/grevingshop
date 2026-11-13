# GrevingShop. im Main-Branch veröffentlichen

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

- Neuer App-Name **GrevingShop.**, feste Manifest-ID `/grevingshop/` und Icon-Blau `#1769e0` wie bei Greving.Fit.
- Kompaktere Startseite, Listen und Einkaufsansicht; bereinigte Ränder und Umbrüche auch für lange Produktnamen, Mengen und Notizen.
- Banner entfernt; Listentitel stehen direkt oben auf den Listenkarten.
- Keine dekorativen Personennamen oder Initialen außerhalb von Familie; der Änderungsnachweis nennt den tatsächlichen Bearbeiter.
- Warenkatalog mit ausdrücklichem, standardmäßig deaktiviertem Aufnahme-Häkchen. Produkte können aus dem Katalog wieder auf eine Liste gesetzt werden.
- Bearbeiter und Zeitpunkt werden bei Listenänderungen serverseitig aktualisiert.
- Kontaktdaten werden nach Anmeldung geschützt geladen; öffentliche App- und SQL-Dateien enthalten keine echten Kontaktadressen.

## Supabase-Erweiterung dieses Updates

Im bestehenden Projekt ist die Erweiterung für Warenkatalog, Änderungsnachweis und geschützte Profile eingerichtet. Zugriffsregeln und Katalogabläufe sind geprüft; sämtliche temporären Testdaten wurden zurückgerollt. Die vollständigen SQL-Dateien im ZIP sind für andere Installationen vorbereitet und verwenden bewusst Platzhalteradressen. Diese vor Ausführung im Supabase SQL Editor ersetzen; tatsächliche Adressen nicht in öffentlich hochladbare Dateien übernehmen.

Für ein bereits vorhandenes anderes Projekt `supabase-update.sql`, für eine neue Installation `supabase-setup.sql` verwenden. `supabase-catalog.sql` enthält ausschließlich die neue Katalog-/Profil-Erweiterung.

## Sicherheitsbefund

Die neue Auslieferung enthält keine echten Kontaktadressen oder administrativen Schlüssel in öffentlichen Dateien. E-Mail-Bestätigung für neue Konten ist im gemeinsamen Supabase-Projekt aktiviert. Frühere GitHub-Commits können alte Kontaktkonfigurationen noch enthalten; es wurde kein Verlauf umgeschrieben. Einzelheiten stehen in `PRUEFBERICHT.md`.
