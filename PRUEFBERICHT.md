# GrevingShop. – Prüfbericht

Stand: 13.11.2026. Geprüft ist die in diesem ZIP enthaltene Fassung.

## Funktionen und Darstellung

- Personalisierungs- und Kontokarte an GrevingFit angeglichen: direkte Auswahlfelder, Übernehmen/Design-Wechsel, Profil/E-Mail, Synchronisieren/Abmelden und aufklappbares Passwortformular. Bei 384 CSS-Pixeln im Browser geprüft: Seitenbreite und Scrollbreite jeweils 384 Pixel. Passwortformular geöffnet und geschlossen, ohne echte Zugangsdaten einzugeben. Startbereich und Speichern aller Darstellungswerte sowie das inline Passwortformular automatisiert geprüft.

- Passwortänderung in beiden Apps: aktuelles Passwort vorab erneut geprüft, neues Passwort und Wiederholung validiert, Kontowechsel erkannt und Serverfehler behandelt. Die asynchronen Formularabläufe wurden automatisiert mit simulierten Auth-Antworten geprüft. Keine echten Kontopasswörter wurden geändert. Das Initialpasswort wurde nicht im Code hinterlegt.
- Registrierung ohne Bestätigungsmail ist serverseitig aktiviert und per öffentlicher Auth-Konfiguration verifiziert. Beide Apps verwenden dasselbe Supabase-Auth-Projekt.

- Registrierung: gemeinsames Supabase-Auth-Projekt beider Apps, Formular bei 384 × 832 geprüft. Passwortwiederholung, ungültige Eingaben, fehlendes Internet, Versandfehler sowie Registrierung mit und ohne sofortige Sitzung automatisiert geprüft. Datenfreigaben für fremde Konten werden weiterhin serverseitig geprüft. Keine Testkonten oder Testmails im Produktivprojekt erzeugt.
- Die exakte GrevingShop-Rücksprungadresse wurde in Supabase gespeichert und sichtbar verifiziert. Eigener SMTP-Versand ist aktuell nicht eingerichtet.

- Katalogübernahme kompakter: Zielliste und Übernahme nebeneinander. Dauerhafte Anzeige „Bildschirm an“ im Einkaufsmodus entfernt; Wake-Lock-Anforderung und Fehlerhinweis bleiben erhalten. Neue Darstellung automatisiert geprüft.

- Direkte Produktanlage im Warenkatalog ohne Einkaufsliste: automatisierte Prüfung von Speicherung, Kategorien, Mengen, Duplikaten, ungültigen Eingaben, Offline-Zustand und fehlender Anmeldung.

- Katalog-Mehrfachauswahl: gemeinsamer Insert aller ausgewählten Produkte, Mengen/Notizen/Kategorien, Suchauswahl, Offline- und Fehlerfall sowie Zurücksetzen bei Kontowechsel automatisiert geprüft. Die bestehenden Supabase-Zugriffsregeln und Änderungs-Trigger gelten auch für diesen Vorgang.

- Kompakte Anmeldebox ohne großes Plus-Symbol und ohne Testzugang. Demo-Startfunktion und zugehörige Aktion entfernt.

- Kontobutton wie in Greving.Fit: erster Buchstabe des Vornamens nach Anmeldung, sonst „?“. Wechsel und Abmeldung automatisiert geprüft.

- Achtzehn automatisierte Tests bestanden: frischer Serverabruf beim Start, direkte Schreibvorgänge, Realtime-Nachladen, Kontowechsel und Abmeldung, kontogebundene Einstellungen, Reihenfolge schneller Einstellungsänderungen, erneute Speicherung vorgemerkter Offline-Einstellungen, automatische Kategorien, Katalog-Opt-in sowie HTML-Escaping und öffentliche Konfiguration.
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

1. **E-Mail-Bestätigung war ausgeschaltet, während Registrierungen erlaubt waren.** Dadurch konnten noch nicht registrierte freigegebene Adressen ohne Verifizierung beansprucht werden. Die Bestätigung wurde zunächst aktiviert und anschließend auf ausdrücklichen, nach Risikoaufklärung bestätigten Wunsch wieder ausgeschaltet. Der Server meldet aktuell `mailer_autoconfirm: true`; anonyme Anmeldungen sind weiterhin deaktiviert. Das Risiko für noch nicht registrierte freigegebene Adressen bleibt damit bewusst bestehen. Die Einstellung gilt im gemeinsamen Supabase-Projekt auch für neue Greving.Fit-Registrierungen. Bereits bestehende Kontoinhaber wurden dadurch nicht nachträglich identifiziert.
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
