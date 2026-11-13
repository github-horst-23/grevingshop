# GrevingShop. – Prüfbericht

Stand: 13.11.2026. Geprüft ist die in diesem ZIP enthaltene Fassung.

## Funktionen und Darstellung

- Kompakte Anmeldebox ohne großes Plus-Symbol und ohne Testzugang. Demo-Startfunktion und zugehörige Aktion entfernt.

- Kontobutton wie in Greving.Fit: erster Buchstabe des Vornamens nach Anmeldung, sonst „?“. Wechsel und Abmeldung automatisiert geprüft.

- Zehn automatisierte Tests bestanden: frischer Serverabruf beim Start, direkte Schreibvorgänge, Realtime-Nachladen, Kontowechsel und Abmeldung, kontogebundene Einstellungen, Reihenfolge schneller Einstellungsänderungen, erneute Speicherung vorgemerkter Offline-Einstellungen, automatische Kategorien, Katalog-Opt-in sowie HTML-Escaping und öffentliche Konfiguration.
- Smartphone-Ansichten bei 320, 384 und 412 Pixel Breite sowie 832 × 384 im Querformat geprüft. Auch mit langen Produktnamen, Mengen und Notizen kein horizontaler Überlauf gemessen.
- Kompakte Listenkarten, Produktformular, standardmäßig ausgeschaltetes Katalog-Häkchen, Kategorieerkennung, Kataloganzeige, Einkaufsmodus, Menübedienung und Beenden des Einkaufsmodus geprüft.
- Lange Mengen stehen unter dem Produkttext statt in einer schmalen Randspalte. Hinweise und Mengen umbrechen innerhalb ihrer Kästen.
- Icon-Farbwert in SVG sowie per Pixelprüfung in 180-, 192- und 512-Pixel-PNGs bestätigt: **#1769e0**.
- Manifest-Name **GrevingShop.**, ID **/grevingshop/**, lokale Asset-Verweise und ZIP-Inhalt geprüft.

## Abschließende Sicherheitsprüfung

### Direkte API-Aufrufe ohne Anmeldung

Mit dem öffentlichen Publishable Key und ohne Benutzer-Token wurden tatsächliche HTTP-Anfragen an folgende Schnittstellen gesendet. Alle wurden mit **HTTP 401** abgewiesen:

- shopping_lists
- shopping_items
- shopping_catalog
- shopping_preferences
- shopping_family_profiles
- shopping_add_item

Es wurden dabei keine echten Datensätze ausgegeben oder angelegt.

### Zugriffsregeln und Transaktionen im bestehenden Supabase-Projekt

Eine Testtransaktion mit `authenticated`-Rolle und wechselnden JWT-Claims wurde ausgeführt und anschließend vollständig zurückgerollt:

- Freigegebenes Konto kann Listen und Produkte anlegen.
- Ohne Opt-in wird kein Katalogprodukt angelegt.
- Mit Opt-in wird ein Katalogprodukt angelegt; Groß-/Kleinschreibung und mehrfache Leerzeichen erzeugen keine Duplikate.
- Ein ungültiger gemeinsamer Speichervorgang hinterlässt keinen teilweise angelegten Datensatz.
- Listeneinträge erhalten den serverseitigen Bearbeiter und Zeitpunkt; Abhaken aktualisiert den Nachweis.
- Ein anderes Familienkonto kann persönliche Einstellungen weder lesen noch überschreiben.
- Ein fremdes angemeldetes Konto kann Listen, Produkte, Katalog und Kontakte nicht lesen und keine Listenprodukte über die Speicherfunktion hinzufügen oder verändern.
- Anonyme Rollen besitzen keine Leserechte auf die Datentabellen und keine Ausführungsrechte auf den Profilabruf.
- Die interne Triggerfunktion ist nicht direkt für angemeldete Besucher ausführbar.

### Gefundene und behobene Punkte

1. **E-Mail-Bestätigung war ausgeschaltet, während Registrierungen erlaubt waren.** Dadurch konnten noch nicht registrierte freigegebene Adressen ohne Verifizierung beansprucht werden. Die Bestätigung für neue Konten wurde aktiviert. Der Server meldet jetzt `mailer_autoconfirm: false`; anonyme Anmeldungen sind deaktiviert. Die Einstellung gilt im gemeinsamen Supabase-Projekt auch für neue Greving.Fit-Registrierungen. Bereits bestehende Kontoinhaber wurden dadurch nicht nachträglich identifiziert.
2. **Kontaktkonfiguration war zuvor im Frontend enthalten.** In dieser Auslieferung werden die Profile ausschließlich nach Anmeldung über eine geschützte Funktion geladen. Die öffentlich hochladbaren SQL-Dateien enthalten nur Platzhalteradressen. Tatsächliche Serverkonfigurationen liegen nicht im ZIP.
3. **Lokaler Cache nach Abmeldung.** Der Listen-/Katalogcache des bisherigen Kontos wird bei Abmeldung oder Kontowechsel entfernt; die serverseitigen Daten bleiben erhalten.
4. **Zusätzliche Browserbegrenzung.** Eine Content Security Policy erlaubt Skripte nur aus der eigenen App und Verbindungen nur zur eigenen Adresse und zum konfigurierten Supabase-Projekt. Objekt-Einbettungen und fremde Formularziele sind gesperrt. HTML aus Namen und Notizen wird escaped. Es sind keine Analyse-, Werbe- oder externen CDN-Skripte eingebunden.

### Verbleibende Punkte und Grenzen

- **Frühere GitHub-Versionen:** Bereits veröffentlichte Commits enthielten die alte Kontaktkonfiguration. Das neue ZIP bereinigt die aktuellen Dateien, entfernt aber keine Informationen aus bestehenden GitHub-Commits oder bereits angefertigten Kopien. Es wurde kein Git-Verlauf verändert und kein GitHub-Upload durchgeführt.
- Die Prüfung ist kein vollständiger unabhängiger Penetrationstest und bestätigt nicht die Identität der Besitzer schon bestehender Konten. Gestohlene Benutzerzugänge und kompromittierte Geräte wurden nicht getestet.
- In der eingebetteten Browser-Prüfumgebung wurden isolierte MutationObserver-Meldungen ohne Quelladresse beobachtet. Keine ausgelieferte JavaScript-Datei enthält einen solchen Aufruf; eine zugehörige App-Fehlfunktion wurde nicht beobachtet. Der genaue Ursprung dieser Meldungen wurde nicht zugeordnet.
- Installation, Browserleisten und Energiesparverhalten auf einem echten Samsung-Gerät können abweichen. Die Funktion zum Wachhalten wurde in der Browser-Vorschau angefordert und als aktiv angezeigt; das Betriebssystem kann sie beenden.

## Auslieferung

Nur die aktuelle Datei **GrevingShop-main-root.zip** wird im Projektordner vorgehalten. Sie enthält alle benötigten App-Dateien direkt auf oberster Ebene für GitHub Pages **main → / (root)** sowie README, Upload-Anleitung, diesen Bericht und SQL-Vorlagen mit Platzhaltern.
