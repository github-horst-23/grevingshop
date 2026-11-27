# GrevingShop. bereitstellen

## 1. Datenbank-Erweiterung für Artikel-Ersteller (Version 38)

Einmal `supabase-item-creators.sql` im SQL Editor des gemeinsamen Projekts ausführen. Es liefert die geschützte Zuordnung von Benutzer-ID zu Vorname und schützt den ursprünglichen Ersteller. Keine Kontaktadressen oder Passwörter einsetzen. Die Ausführung übernimmt der Benutzer; diese Fassung ändert die produktive Datenbank nicht automatisch.

Danach die aktualisierten App-Dateien hochladen und das App-Update bestätigen. Auch bestehende Artikel werden anhand ihrer gespeicherten Ersteller-ID zugeordnet. Ohne Erweiterung bleibt die App nutzbar; Namen anderer Konten sind dann möglicherweise noch nicht verfügbar.

## Bereits vorhandene Erweiterung für private Listen

Vor der Nutzung privater Listen `supabase-private-lists.sql` im SQL Editor des gemeinsamen Supabase-Projekts ausführen. Das Skript benötigt keine Kontaktadressen oder Passwörter. Es ergänzt die Sichtbarkeit, zusätzliche restriktive Zugriffsregeln und einen Schutz vor Änderungen an Besitzer und Sichtbarkeit.

Alle vorhandenen Listen erhalten den Standard „Gemeinsam“. Sie werden weder gelöscht noch einzelnen Nutzern entzogen. Private Listen sind erst nach erfolgreicher Installation der Erweiterung auswählbar. Ohne Erweiterung bleiben gemeinsame Listen nutzbar.

Die produktive Ausführung übernimmt der Benutzer. Wurde das SQL bereits erfolgreich ausgeführt, ist beim Update auf Version 38 kein erneuter SQL-Lauf nötig. Die Erweiterung für private Listen muss nicht erneut ausgeführt werden, wenn sie bereits erfolgreich installiert wurde. Für die neue Erstelleranzeige ist separat `supabase-item-creators.sql` erforderlich. Die lokale Datenbankprüfung ersetzt nicht die Prüfung der produktiven Einrichtung.

Für eine neue Installation `supabase-setup.sql` verwenden und dessen Platzhalter nur im geschützten SQL Editor durch die freigegebenen Adressen ersetzen. Niemals private Kontaktadressen oder Zugangsdaten hochladen. Das vollständige Setup und `supabase-update.sql` enthalten die Erweiterung für private Listen ebenfalls am Ende.

## 2. GitHub Pages aktualisieren

1. Das aktuelle `GrevingShop-main-root.zip` auf dem Computer entpacken.
2. Das Repository `github-horst-23/grevingshop` im Branch **main** öffnen.
3. Über **Add file → Upload files** die entpackten Dateien direkt ins Stammverzeichnis hochladen und mit **Commit changes** speichern. Das ZIP selbst wird von GitHub nicht entpackt.
4. Unter **Settings → Pages** die Quelle **Deploy from a branch → main → / (root)** wählen.
5. Auf den erfolgreichen Abschluss des Pages-Deployments warten.
6. https://github-horst-23.github.io/grevingshop/ öffnen und das angebotene App-Update mit **Jetzt aktualisieren** bestätigen.

Keinen zusätzlichen App-Ordner und keinen `docs`-Unterordner hochladen. Auch `auth-session.js`, `supabase.js`, Service Worker, Manifest, Icons, Smartphone-Vorschau, Dokumentation und PDF gehören zum vollständigen Paket. Der Benutzer führt den Upload selbst aus.

## 3. Nach dem Update prüfen

- Unter **Neue Liste** muss das Kästchen **Privat** verfügbar sein, sobald die Datenbank-Erweiterung aktiv ist.
- Eine private Liste mit Konto A anlegen. Mit Konto B darf sie weder unter „Meine Listen“ noch im Archiv oder als Katalog-Zielliste erscheinen.
- Bestehende gemeinsame Listen müssen weiterhin für alle freigegebenen Konten verfügbar sein.
- Der Warenkatalog bleibt gemeinsam. Eine Aufnahme aus einer privaten Liste erfordert das ausdrückliche Häkchen mit dem Hinweis „für alle sichtbar“.

## Vorschau und Hilfe

- Website: https://github-horst-23.github.io/grevingshop/
- Smartphone-Vorschau: https://github-horst-23.github.io/grevingshop/s24fe.html
- Bedienung: `GrevingShop-Anleitung.pdf`
- Umsetzung und Grenzen: `README.md` und `PRUEFBERICHT.md`

Lokal: im entpackten Ordner `python3 -m http.server 4173` starten und http://127.0.0.1:4173/ oder http://127.0.0.1:4173/s24fe.html öffnen.
