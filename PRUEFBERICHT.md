# GrevingShop. – Prüfbericht

Stand: 15.11.2026. Geprüft ist die in diesem ZIP enthaltene Fassung.

## Reparatur vom 14.11.2026

- Ursache: Der neue Schlüssel `startPage` fehlte im Check-Constraint `shopping_preferences_keys`.
- Korrektur im bestehenden Supabase-Projekt angewendet: Schlüssel zugelassen und zusätzlicher Werte-/Typcheck für die vier Startbereiche eingerichtet. Keine Nutzerdaten oder Zugriffsrechte geändert.
- Datenbanktest in temporärer Tabelle mit den echten Check-Constraints: vier vollständige Einstellungen mit verschiedenen Startbereichen und ein älterer Datensatz ohne Startbereich akzeptiert. Ungültiger Startbereich, falscher Typ, JSON-null, fremder Schlüssel und Nicht-Objekt abgewiesen. Testtransaktion zurückgerollt.
- Ergebnis: `valid_payloads_accepted = 5`, `row_security_enabled = true`, `policy_count = 3`.
- Regressionstest liest die erlaubten Schlüssel aus dem SQL-Schema. Fehlerhafte Schreibversuche bleiben lokal vorgemerkt, erfolgreiche Wiederholung entfernt die Vormerkung. App zeigt bei veraltetem Schema einen verständlichen Hinweis statt rohem Datenbankfehler.
- Setup-, Update- und eigenständige Reparaturdateien vereinheitlicht. Keine Cache-Löschung nötig.

## Update-Zustimmung und Installation vom 15.11.2026

- Version 22 führt einen bestätigten App-Cache ein. Eine neue Worker-Fassung darf nach dem Schließen aller Ansichten aktiv werden, liefert aber weiterhin die zuvor bestätigten Programmdateien aus. Erst eine ausdrückliche Versionsbestätigung stellt den Cache um. Query-Parameter umgehen diese Entscheidung nicht. Erstinstallation bzw. erstmalige Umstellung setzt die bereits laufende Fassung als Ausgangsversion.
- Automatisiert geprüft: konsistente Versionsnummern, Neustart ohne Zustimmung, ausdrückliche Übernahme, Schutz bei falscher Versionsnummer/fremder Quelle/unvollständigem Download, Erstinitialisierung, „Später“, kein ungefragtes Neuladen, Fehlerbehandlung und Schutz offener Bearbeitungen. Installationsanleitung für iPhone/iPad, Ausblendung im App-Modus und native Browserinstallation nach Klick ebenfalls geprüft.
- Echter Browserablauf in einer getrennten Testadresse ohne angemeldete Konten: Version 22 geladen; Version 23 als neue Serverfassung bereitgestellt. Reload, „Später“, Schließen und erneutes Öffnen ließen Version 22 aktiv. Erst „Jetzt aktualisieren“ führte zu Version 23. Browser-Prüfung mit Testversion 24 zeigte den Update-Hinweis erneut. Kein Produktiv-Upload oder Kontoeingriff.
- Beide Kopfzeilen-Buttons bei 384 und 320 Pixel breiten Smartphone-Frames geprüft. Kein horizontaler Überlauf: Client-/Scrollbreite je 369 bzw. 305 Pixel. Eine echte Installation auf einem physischen iPhone wurde nicht durchgeführt; der manuelle Safari-Ablauf entspricht der Apple-Anleitung.
- Neue Assets werden bei der Vorbereitung mit `cache: reload` geladen, die laufende Fassung wird anschließend ausschließlich aus ihrem bestätigten Cache ausgeliefert. Keine externen Bibliotheken, administrativen Schlüssel oder zusätzlichen Datenrechte hinzugefügt. Live-Datenabgleich bleibt bestehen.

## Funktionen und Darstellung

- Version 24: gewählte Variante G (Smartphone mit Kreis-Pfeil) im Update-Button übernommen; SVG-Geometrie mit dem freigegebenen Entwurf abgeglichen. Versionskennungen konsistent erhöht.

- Version 23: Installationssymbol im Standalone-Modus per CSS vorab verborgen. Wiederholte Modusprüfung bei pageshow, focus und visibilitychange. iPhone-PWA-Erkennung sowie Rückkehr zum Browser automatisiert geprüft. Keine echte iPhone-Installation durchgeführt.

- Vorschau-Aktualisierung: Versionskennung für HTML-Vorschau, App-JavaScript und CSS; inzwischen auf Auslieferung der bestätigten Fassung umgestellt. Lokaler Server erneut gestartet. Serverseitig ausgelieferter App-Code wird mit der Projektdatei verglichen und auf fehlende Stiftzeichen geprüft.

- Kleine Stiftzeichen durch einheitliche Drei-Punkte-SVGs ersetzt. Produktbearbeitung mit 44 Pixel breiter Tippfläche; bestehende Bearbeitungsaktionen und Beschriftungen bleiben erhalten. Im Einkaufsmodus sind Bearbeitungsaktionen weiterhin ausgeblendet.

- Identische SVG-Symbole für Settings, Katalog und Listen in beiden Apps; die bisherigen GrevingShop-Symbole wurden übernommen. Geometrie und Strichstärke abgeglichen.
- Klick auf Initialen: persönliche Startseite, geschlossene Navigation und Verlassen des Einkaufsmodus; ohne Sitzung Anmeldung. Alle vier Startbereiche automatisiert geprüft.
- Produktanlage als Hauptaktion vor Suche/Filter; „Einkauf starten“ am rechten Rand, im Browser sowohl am Desktop als auch in der Smartphone-Ansicht mit rechtem Abstand 0 geprüft. Mobile Archivansicht ohne horizontalen Überlauf (Client-/Scrollbreite je 369 Pixel innerhalb des 384-Pixel-Vorschauframes).
- Archiv-Löschfunktion automatisiert geprüft: Abbrechen, aktive Liste, Offline-Zustand, zwischenzeitliches Wiederherstellen sowie erfolgreiche Löschung mit zugehörigen Produkten in der simulierten Datenbank. Browserdarstellung der Löschbuttons geprüft; keine echten Listen oder Produkte gelöscht. Serverseitiger Delete ist zusätzlich auf `archived = true` begrenzt. Bestehende RLS-Regeln und Fremdschlüssel bleiben unverändert.


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

- Dreiunddreißig automatisierte Tests bestanden: frischer Serverabruf beim Start, direkte Schreibvorgänge, Realtime-Nachladen, Kontowechsel und Abmeldung, kontogebundene Einstellungen, Reihenfolge schneller Einstellungsänderungen, erneute Speicherung vorgemerkter Offline-Einstellungen, automatische Kategorien, Katalog-Opt-in sowie HTML-Escaping und öffentliche Konfiguration.
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

Version 25: App-Symbol C (Einkaufstasche mit G) in allen Größen, weiterhin Blau #1769e0. Im Warenkatalog entfällt der einzelne „+ Liste“-Button; Produkte werden über die gemeinsame Auswahl übernommen. Produktname und Menge stehen nebeneinander, Notizen darunter.

Version 26: Tasche und G im App-Symbol um 20 % um den Mittelpunkt verkleinert. Blauer Hintergrund (#1769e0) unverändert; Icons mit 180, 192 und 512 Pixeln erneuert.

Version 27 (16.11.2026): Selbstregistrierung aus Startseite, Anmeldedialog, Settings und App-Logik entfernt. Login und Passwortänderung bleiben erhalten. App-Icons jetzt vollflächig blau ohne weißen Rand, mit weiterhin um 20 % verkleinertem Motiv. Icon-Adressen versioniert, Manifest-ID unverändert. Keine serverseitigen Konten oder Passwörter geändert; Initialpasswort nicht automatisch eingerichtet.

## Anmeldung für 30 Tage beibehalten

Version 28: Die bestehende Supabase-Sitzung wird für 30 Tage seit der letzten Nutzung lokal aufbewahrt. Nutzung und Token-Erneuerung verlängern diese Frist. Bestehende Anmeldungen werden ohne erzwungenen Wechsel übernommen. Passwörter werden nicht gespeichert; kurze Zugangstokens werden weiterhin automatisch erneuert. Nach Standby und Verbindungswechsel wird die Sitzung erneut aus dem sicheren Auth-Ablauf aufgenommen. „Abmelden“ beendet nur die aktuelle App-Sitzung, nicht die anderen Apps oder Geräte.

Eine serverseitig widerrufene Sitzung, gelöschte Browserdaten oder ein kürzeres Supabase-Limit können eine frühere Neuanmeldung erfordern. Im gemeinsamen Supabase-Projekt unter Authentication → Sessions dürfen Time-box und Inactivity timeout nicht kürzer als 30 Tage sein; Single session per user muss für parallele Apps/Geräte ausgeschaltet sein. Diese Serverwerte wurden nicht geändert oder überprüft. Keine 30-Tage-Verlängerung der JWT-Laufzeit vornehmen.

Sitzungsprüfung Version 28: 40 Tests bestanden, einschließlich 30-Tage-Frist mit simuliertem Zeitablauf, Bestandsmigration, Token-Rotation, lokalem Logout und Wiederaufnahme nach Netzfehler in beiden Apps. Kein realer 30-Tage-Dauertest; Serverlimits nicht geprüft. GrevingFit v79 separat paketiert.

Version 29 (18.11.2026): Doppelten „+ Produkt“-Button im Leerzustand einer Liste entfernt. Die Hauptaktion „Produkt hinzufügen“ oberhalb der Liste bleibt erhalten.

Version 30 (18.11.2026): App-Icon mit exakt derselben Außenform wie GrevingFit: 512 × 512, Eckenradius 120. Motiv und Blau unverändert; Icon-Adressen versioniert.

Version 31 (18.11.2026): G anhand seiner sichtbaren Kontur horizontal und vertikal in der Taschenfläche zentriert. Buchstabe als feste Vektorform statt geräteabhängiger Schrift; Außenform, Blau und Motivgröße bleiben erhalten.

## Version 32 - 20.11.2026

- Kontoprüfung und Datenabruf parallel statt nacheinander; pro Anmeldung weiterhin ein frischer Abruf der vier Datensätze.
- Vorhandener eigener Listenstand wird nach erfolgreicher Kontoprüfung vor Abschluss des Datenabrufs angezeigt. Während der Wiederaufnahme erscheint keine falsche Abmeldemaske. Doppelte Auth-Ereignisse werden während einer laufenden Kontoprüfung unterdrückt.
- Offline-Lesemodus benötigt eine nutzbare gespeicherte Auth-Sitzung und ein zuvor online geprüftes eigenes Profil. Keine Serverabfragen im Offline-Start; Schreibaktionen deaktiviert. Geschützte Familienkontakte werden offline nicht angezeigt. Bei Rückkehr online erneute Kontoprüfung. Keine Offline-Schreibwarteschlange.
- 43 Tests bestanden, darunter paralleler Start, Cache-Anzeige vor Abschluss der Abfragen, Offline-Start und Kontentrennung. Kein pauschales Zeitversprechen: tatsächliche Dauer hängt von Netz und Token-Erneuerung ab.
- PDF-Anleitung: vier Seiten vollständig gerendert und visuell geprüft; Text, Seitenzahl und Datenschutz geprüft.
- README auf die aktuelle Bedienung und Einrichtung reduziert. Keine Serverkonfiguration geändert.

## Version 33 - private Listen - 22.11.2026

- Vorprüfung im produktiven Projekt: vier bestehende Listen, keine Sichtbarkeitsspalte, bekannte familienweite Policies, Replica Identity DEFAULT für Listen und Produkte. Keine Daten verändert.
- Produktive Migration durch automatische Sicherheitsprüfung bis zur unmittelbaren Bestätigung blockiert. Skript im SQL Editor vorbereitet; noch nicht ausgeführt.
- Neue Listen wählen Gemeinsam oder Privat, alte Listen bleiben standardmäßig gemeinsam. Auswahl bei fehlender Server-Erweiterung deaktiviert. Sichtbarkeit und Besitzer unveränderlich.
- Restriktive RLS-Policies begrenzen auch zusätzliche permissive Policies; Artikelzugriffe prüfen die sichtbare Elternliste. Kein Sicherheitsdefiner für die neuen Regeln. DELETE-Realtime enthält durch DEFAULT-Identität keine alten Produktnamen oder Notizen; zufällige Primärschlüssel können Teil von Löschereignissen sein.
- Isolierte echte PostgreSQL-Engine PGlite 0.5.17: 108 Zugriffsprüfungen bestanden. Vier simulierte Familienkonten, gegenseitige Lese-/Schreib-/Löschversuche, Artikel-INSERT, übergebener fremder Besitzer, nachträgliche Sichtbarkeit/Owner-Änderung, fremde Elternliste, Anon/Outsider, gemeinsame Bestandsliste, eigenes Archivieren und Löschen, Migration zweimal ausgeführt. Sämtliche Testdaten lokal und fiktiv; keine produktiven Testlisten angelegt.
- 47 App-Tests bestanden, einschließlich privater Auswahl, Katalogwarnung, Archiv/Ziellisten und Cache-Trennung. Keine Geschwindigkeits- oder Sicherheitsbehauptung über ein noch nicht migriertes Produktivsystem.
- Gemeinsamer Katalog unverändert; ausdrückliche Katalogaufnahme zeigt „für alle sichtbar“. Anleitung und Upload-Hinweise aktualisiert.

## Version 34 - Anmeldereparatur - 22.11.2026

Ursache: Der echte Supabase PostgREST-RPC-Builder bietet `then`, aber kein direktes `catch`. Der mit async gemockte RPC im früheren Test hatte den Fehler verdeckt. Die Fähigkeitsprüfung wird nun über eine echte Promise-Kette ausgeführt.

Regression mit der unveränderten, ausgelieferten supabase.js-Bibliothek und lokalem Fetch-Stub: Builder ohne catch, genau ein RPC-Abruf, erfolgreiche Kontowiederaufnahme und Erkennung der privaten Listen. Zusätzlich synchrone Fehler, abgelehnter Thenable und fehlende RPC-Funktion geprüft: bestehende gemeinsame Listen und Anmeldung bleiben nutzbar; private Auswahl bleibt gesperrt. 49 App-Tests bestanden. SQL unverändert; kein produktiver Eingriff und keine erneute Migration erforderlich, wenn diese bereits erfolgreich ausgeführt wurde.

## Version 35 - mobile Formulare - 22.11.2026

- Native HTML-datalist durch Inline-Vorschläge ersetzt. Nach Produktname gefilterte Katalogtreffer, maximal 40 gleichzeitig, eigener begrenzter Scrollbereich, Ausblenden-Schaltfläche. Kein natives Popup, kein preventDefault für Touch-Scrollen. Auswahl übernimmt Name, Menge, Notiz und Kategorie, ohne automatisch zu speichern oder Katalogfreigaben zu setzen. Escape schließt zunächst die Vorschläge.
- Mobile Dialoghöhe an sichtbaren Viewport angepasst, Dialog auf kleinen Bildschirmen am oberen Rand positioniert. Formular und Trefferliste bleiben getrennt scrollbar. Pinch-Zoom bleibt erlaubt.
- Neue Liste: einzelnes nicht angehaktes Kästchen Privat. Ohne Häkchen shared, mit Häkchen private; ohne Server-Erweiterung deaktiviert. Bestehende Listensichtbarkeit bleibt unveränderlich.
- 52 App-Tests bestanden. Zusätzliche Regressionen für Auswahl/Übernahme, HTML-Escaping, Trefferbegrenzung, Escape sowie gemeinsame Standardanlage.
- Browserprüfung ausschließlich mit fiktiven lokalen Daten auf getrennter Vorschau-Adresse: 384 × 600 Pixel, 60 Katalogtreffer, Vorschlags-Scrollposition 0 → 168, Produkt 04 ausgewählt, Menge/Notiz/Kategorie korrekt übernommen. Dialog-Scrollposition anschließend 67 bei 605 Pixel Scrollhöhe und 538 Pixel sichtbarer Höhe. Privat initial nicht angehakt, nach Tippen angehakt. Kein produktiver Datenzugriff und keine Speicherung der Beispieldaten.
- Echte Android/iOS-Tastatur und physische Touch-Eingabe nicht geprüft; Desktop-Browser mit kleinem Viewport als Layout- und Scrollprüfung. PDF und README aktualisiert. Keine SQL-Änderung.

## Version 36 - getrennte Listenbereiche - 22.11.2026

- Variante A umgesetzt: erst Meine privaten Listen, danach Gemeinsame Listen. Eigene Überschrift, Anzahl und Trennlinie pro Bereich; Schloss in privaten Listenkarten. Auch im Archiv konsistent. Kartenreihenfolge innerhalb der Gruppe, Öffnen, Fortschritt und Archivaktionen unverändert. Leere Gruppen mit kurzem Hinweis; vollständig leere Übersicht behält die Anlegen-Aktion.
- 54 App-Tests bestanden. Neue Prüfungen für Gruppierung, Anzahl, fremde private Liste, gemeinsame Bestandslisten ohne Sichtbarkeitsfeld, Archiv/Löschen und Leerzustände. Kein SQL-Eingriff.
- Isolierte Browservorschau mit fiktiven Daten, 384 × 832 Pixel: beide Bereiche sichtbar, privates Schloss und Zähler geprüft, kein horizontaler Überlauf. Keine Anmeldung oder Datenänderung in Supabase. README und PDF-Anleitung aktualisiert.

## Version 37 - Reihenfolge der Listenbereiche - 22.11.2026

Gemeinsame Listen stehen jetzt vor den privaten, auch im Archiv. Gruppierungs- und Archivtests auf diese Reihenfolge angepasst. 54 App-Tests bestanden. README und PDF aktualisiert; keine Datenbankänderung.

## Version 38 - ursprünglicher Artikel-Ersteller - 27.11.2026

- Kleine Zeile „Hinzugefügt von Vorname“ bei jedem Listenartikel, einschließlich besorgter Artikel und Einkaufsmodus. Keine Erstellerangabe in Katalogzeilen, keine erfundenen Namen bei fehlenden Informationen.
- Bestehendes shopping_items.created_by bleibt Quelle. Neue geschützte shopping_user_names()-Funktion ordnet Auth-IDs über die bereits freigegebenen Familienprofile zu und gibt nur ID/Vorname aus. SECURITY DEFINER benötigt Zugriff auf auth.users, aber keine Datenbankberechtigung für den Browser; anon gesperrt, fremde angemeldete Konten erhalten keine Zeilen. Die Prüfung nutzt weiterhin die ursprünglichen JWT-Claims des Aufrufers.
- Trigger erzwingt den tatsächlichen angemeldeten Ersteller bei INSERT und sperrt spätere Änderungen. Bestehende Artikel werden nicht umgeschrieben. Direkte Eingabe, Katalog-RPC und Mehrfach-INSERT abgedeckt.
- Zuordnung wird parallel zur Anmeldung geladen. Bei fehlender Erweiterung bleibt Anmeldung möglich. Cache bindet Namen an Ersteller-ID und aktuelles Benutzerkonto; Logout entfernt die Zuordnung und den Benutzer-Cache.
- 57 App-Tests bestanden. Isolierte echte PostgreSQL-Testumgebung: 35 zusätzliche Prüfungen bestanden, darunter vier Konten, anon/Outsider, keine E-Mail-Spalte im Ergebnis, Ersteller-Fälschung beim INSERT, unveränderte Ersteller beim Abhaken/Bearbeiten, Trigger trotz zusätzlich gewährtem UPDATE(created_by), zweimalige Migration. Keine produktiven Daten geändert; SQL-Ausführung durch Benutzer erforderlich.
- Mobile Browserprüfung bei 384 × 832 mit vier fiktiven Artikeln und allen vier Vornamen: kompakte Erstellerzeilen und Notiz sichtbar. README, SQL-Vorlagen, Upload-Hinweise und PDF-Anleitung aktualisiert.


## Version 39 - sofortiges Abhaken und Aufräumen - 28.11.2026

- Häkchen und Fortschritt werden vor der Serverantwort angezeigt. Separater Speicherzustand pro Artikel, parallele Übertragung verschiedener Artikel, serialisierte Folgeänderungen desselben Artikels. Kein globales busy für Häkchen. Minimale UPDATE-Antwort mit ID, anschließend ein gebündelter Datenabgleich. Fehler setzt nur den betroffenen Artikel auf den zuletzt bestätigten Stand zurück.
- Ausstehende Häkchen zeigen „Speichert …“. Nur bestätigte Werte gelangen in den kontogebundenen Cache. Veraltete laufende Datenabfragen werden anhand einer Revision verworfen. Konto-/Sitzungswechsel entwertet ausstehende lokale Folgeaktionen. Updateübernahme und andere Mutationen sind bis zur Speicherung gesperrt. Keine Offline-Schreibwarteschlange; bei Verlassen während ausstehender Speicherung wird eine Browserwarnung angefordert (systemabhängig).
- „Besorgte entfernen (Anzahl)“ in der normalen Listenansicht: Bestätigung mit Anzahl und Hinweis auf gemeinsame Wirkung, ein DELETE mit Listen-ID, checked=true und der beim Start erfassten ID-Menge. Nur zurückgemeldete IDs werden lokal entfernt. Wieder geöffnete, neu abgehakte oder fremde Listenartikel bleiben erhalten. Fehler löscht lokal nichts. Endgültige Löschung, kein Papierkorb.
- Suchfeld und Filter aus Einkaufslisten entfernt. Kategoriegruppen und Besorgt-Bereich bleiben erhalten; Katalogsuche und Katalogvorschläge unverändert.
- 69 App-Tests bestanden: sofortige Anzeige, parallele und wiederholte Klicks, Teilfehler, bestätigter Cache, veraltete Refresh-/Auth-Daten, Logout, Offline-Sperre, fehlende Änderungsberechtigung, Batch-Konkurrenz und Fehler-/Abbruchfälle. 111 isolierte PostgreSQL-Zugriffsprüfungen bestanden; zusätzlich geprüft: fremde private Artikel per Sammellöschung nicht erreichbar, eigene offene Artikel erhalten. 35 Erstellerprüfungen waren in Version 38 erfolgreich; SQL seitdem unverändert.
- Mobile lokale Browserprüfung 384 × 832: vier fiktive Artikel, Schreibantworten künstlich 3.500 ms verzögert. Zwei Häkchen und Fortschritt 2/4 sofort sichtbar, während Speichert angezeigt wird. Sammellöschknopf und bereinigte Liste geprüft. Keine Messung auf einem physischen Android-/iOS-Gerät und keine produktiven Datenzugriffe oder Änderungen.
- Keine neue SQL-Migration erforderlich. Bestehende private/Ersteller-Erweiterungen bleiben Voraussetzung für die jeweiligen Funktionen. Anleitung (4 Seiten), technische Dokumentation (5 Seiten), README und Upload-Anleitung aktualisiert und PDF-Renderings visuell geprüft. ZIP enthält beide PDFs flach im Hauptverzeichnis.
