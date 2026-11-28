# GrevingShop.

Gemeinsame und private Einkaufslisten sowie ein Warenkatalog für die freigegebenen Familienkonten. GrevingShop nutzt dieselben Supabase-Konten wie GrevingFit und übernimmt dessen Farbschemata.

[App öffnen](https://github-horst-23.github.io/grevingshop/) · [Smartphone-Vorschau](https://github-horst-23.github.io/grevingshop/s24fe.html) · [PDF-Anleitung](GrevingShop-Anleitung.pdf) · [Technische Dokumentation](GrevingShop-Dokumentation.pdf)

**Aktuelle Fassung:** Version 39, Stand 28.11.2026.

## Schnellstart

1. App öffnen und mit der eigenen E-Mail-Adresse und dem bestehenden GrevingFit-Passwort anmelden.
2. Unter **Meine Listen → Neue Liste** eine Einkaufsliste anlegen; bei Bedarf **Privat** anhaken.
3. Liste öffnen und über **Produkt hinzufügen** Produkte erfassen.
4. Mit **Einkauf starten** in die konzentrierte Einkaufsansicht wechseln und Produkte abhaken.

Es gibt keinen Testzugang und keine Selbstregistrierung. Neue Konten müssen geschützt in Supabase bereitgestellt und freigegeben werden. Ein automatisches Initialpasswort ist nicht eingerichtet; bestehende Passwörter werden durch die App nicht zurückgesetzt.

## Funktionen und Bedienung

| Bereich | Möglichkeiten |
| --- | --- |
| Meine Listen | Listen anlegen, über die drei Punkte umbenennen und mit Notizen versehen |
| Produkte | Name, Menge, Notiz und Kategorie erfassen; bearbeiten, entfernen und abhaken |
| Einkauf | Sofortige Häkchen und Fortschritt; Hintergrundspeicherung; mit **Beenden** zurück zur normalen Ansicht |
| Aufräumen | **Besorgte entfernen (Anzahl)** löscht nach Bestätigung die abgehakten Produkte der aktuellen Liste gesammelt |
| Warenkatalog | Produkte direkt anlegen, suchen und mehrere ausgewählte Produkte gemeinsam auf eine aktive Liste übernehmen |
| Archiv | Listen wiederherstellen oder nach Bestätigung samt Produkten endgültig für alle löschen |
| Familie | Geschützte Kontoprofile ausschließlich nach Anmeldung und online anzeigen |
| Settings | Startbereich, Farbschema, Schriftgröße, Darstellungsdichte, helles/dunkles Design und Kontoverwaltung |

Beim Tippen eines Produktnamens erscheinen passende Katalogprodukte direkt im Formular. Die Vorschlagsliste lässt sich mit dem Finger scrollen; über **Ausblenden** kannst du sie schließen. Beim Antippen werden Name, Menge, Notiz und Kategorie in das Formular übernommen. Mit **Hinzufügen** wird das Produkt anschließend auf der Liste gespeichert. Es gibt kein natives Browser-Vorschlagsfenster mehr.

Produkte landen beim Hinzufügen zu einer Liste nur dann zusätzlich im Katalog, wenn **Im Warenkatalog speichern** angehakt ist. **Neues Produkt** im Warenkatalog speichert direkt im Katalog. Bei der Mehrfachauswahl werden Menge, Notiz und Kategorie übernommen; die Auswahl bleibt beim Suchen erhalten.

Die automatische Gruppierung folgt dieser allgemeinen Supermarkt-Reihenfolge:

**Obst & Gemüse → Brot & Backwaren → Vorrat → Kühlregal → Getränke → Haushalt → Sonstiges.**

Eine manuell gewählte Kategorie hat Vorrang. Die Erkennung arbeitet lokal ohne zusätzlichen Dienst. Innerhalb einer Liste werden Bearbeiter und Zeitpunkt der letzten Änderung angezeigt.

Das Menü mit den drei Linien schwebt auf Smartphones unten rechts. Die eigenen Initialen öffnen den persönlichen Startbereich. Das Synchronisieren-Symbol ruft den aktuellen Cloud-Stand ab.

## Abhaken und besorgte Produkte entfernen

Häkchen und Fortschritt reagieren sofort. Die App speichert die Änderung im Hintergrund in Supabase; **Speichert …** kennzeichnet noch ausstehende Bestätigungen. Verschiedene Artikel können parallel gespeichert werden. Mehrfaches Antippen desselben Artikels wird in der richtigen Reihenfolge verarbeitet. Bei einem Fehler wird nur dieser Artikel auf den letzten bestätigten Stand zurückgesetzt und eine Meldung angezeigt. Bitte die App bis zum Abschluss der Speicherung geöffnet lassen. Unbestätigte Häkchen werden nicht als gesichert in den Offline-Cache geschrieben.

Nach **Beenden** findest du in der normalen Liste **Besorgte entfernen (Anzahl)**. Nach Bestätigung werden die abgehakten Artikel dieser Liste mit einem einzigen Löschaufruf entfernt. Offene Artikel bleiben erhalten. Zwischenzeitlich wieder geöffnete Artikel und erst nach Beginn der Aktion abgehakte Artikel werden nicht mitgelöscht. Bei gemeinsamen Listen wirkt das Löschen für alle; bei privaten Listen nur auf den eigenen Bestand. Es gibt keine Wiederherstellung. Solange Häkchen noch gespeichert werden, ist die Sammellöschung gesperrt.

Einkaufslisten enthalten kein Suchfeld und keinen Filter mehr. Die Kategoriegruppen und der aufklappbare Bereich **Besorgt** bleiben erhalten. **Im Warenkatalog bleibt die Suche verfügbar.**

## Wer hat einen Artikel hinzugefügt?

Unter dem Produkt steht beispielsweise **Hinzugefügt von Kathrin**, auch bei besorgten Artikeln und im Einkaufsmodus. Die Angabe bezieht sich auf das ursprüngliche Hinzufügen, nicht auf die letzte Bearbeitung oder das Abhaken. Sie funktioniert für direkte Produkteingaben und für einzelne bzw. gemeinsame Katalogübernahmen.

Einmal [supabase-item-creators.sql](supabase-item-creators.sql) im bestehenden Supabase-Projekt ausführen und danach die App aktualisieren bzw. neu öffnen. Das Skript ordnet die bereits gespeicherten Ersteller-IDs den geschützten Familienprofilen zu. Daher können auch ältere Artikel zugeordnet werden. Fehlende Zuordnungen werden als **Ersteller nicht verfügbar** angezeigt; es wird kein Name erfunden.

Die neue Funktion liefert nur IDs und Vornamen der freigegebenen Konten an angemeldete Familienkonten, keine E-Mail-Adressen. Es gibt keinen direkten Browserzugriff auf die Auth-Benutzertabelle. Ein Trigger setzt bei neuen Artikeln die tatsächliche angemeldete Person und verhindert spätere Erstellerwechsel. Private Listen bleiben durch die vorhandenen Zugriffsregeln geschützt. Im Offline-Cache wird die bereits geladene Zuordnung beim jeweiligen Artikel gespeichert.

## Gemeinsame und private Listen

Beim Anlegen einer Liste gibt es ein Kästchen **Privat**. Ohne Häkchen ist die Liste gemeinsam sichtbar, mit Häkchen nur für dich. Die Auswahl bleibt dauerhaft bestehen; sie kann später nicht geändert werden. Alle bisher angelegten Listen bleiben gemeinsam sichtbar. Private Listen und ihre Produkte sind ausschließlich für das erstellende freigegebene Konto zugänglich, auch im Archiv und bei der Katalog-Zielliste.

Die Übersicht zeigt zuerst **Gemeinsame Listen**, darunter **Meine privaten Listen**, jeweils mit eigener Anzahl und klarer Trennlinie. Private Listen tragen ein kleines Schloss. Die gleiche Gliederung gilt im Archiv. Innerhalb eines Bereichs bleibt die bisherige Reihenfolge erhalten; leere Bereiche werden kurz gekennzeichnet.

Die Trennung wird serverseitig durch zusätzliche restriktive RLS-Regeln für Listen und Produkte abgesichert. Besitzer und Sichtbarkeit werden bei Updates nicht verändert; bei neuen Listen setzt die Datenbank den angemeldeten Ersteller. Das bloße Ausblenden in der Oberfläche ist nicht die Zugriffssicherung. Der lokale Cache filtert ergänzend nach Konto und Listenbesitzer.

**Der Warenkatalog bleibt gemeinsam.** Auch ein Produkt aus einer privaten Liste wird für alle sichtbar, wenn ausdrücklich **Im gemeinsamen Warenkatalog speichern (für alle sichtbar)** angehakt wird. Ohne dieses Häkchen bleibt das Listenprodukt privat.

**Vor dem ersten Einsatz:** Im gemeinsamen Supabase-Projekt [supabase-private-lists.sql](supabase-private-lists.sql) ausführen. Die App bietet private Listen erst an, wenn die installierte Datenbank-Erweiterung über `shopping_privacy_version()` erkannt wird. Ohne Erweiterung funktionieren gemeinsame Listen weiter; die private Auswahl ist deaktiviert. Im vollständigen Setup und Update-Skript ist dieselbe Migration am Ende enthalten. Die Regeln wurden isoliert in einer PostgreSQL-Testumgebung geprüft. Die produktive Ausführung übernimmt der Benutzer. Wurde die Migration bereits erfolgreich ausgeführt, ist für das App-Update kein erneuter SQL-Lauf erforderlich.

## Anmeldung und schneller Start

- Anmeldung und Passwort gelten für GrevingShop und GrevingFit. Die Apps behalten getrennte Sitzungen.
- Die gespeicherte Sitzung wird lokal 30 Tage seit der letzten Nutzung aufbewahrt; Nutzung und Token-Erneuerung verlängern diese Frist. Passwörter werden nicht gespeichert.
- Beim Start erscheint zunächst **Anmeldung wird wiederhergestellt**. Kontoprüfung und Datenabruf laufen parallel. Der eigene gespeicherte Stand wird nach der Kontoprüfung bereits angezeigt, während die aktuellen Daten nachladen.
- Nach Standby und Verbindungswechsel wird die Sitzung erneut aufgenommen. Bei Fehlern steht **Erneut versuchen** bereit.
- **Abmelden** beendet nur die aktuelle App-Sitzung. Unter **Settings → Login & Cloud-Synchronisierung → Passwort ändern** lässt sich das gemeinsame Kontopasswort ändern.

Gelöschte Browserdaten, widerrufene Sitzungen oder kürzere Supabase-Limits können eine frühere Neuanmeldung erfordern. Die serverseitige Sitzungsdauer wurde nicht geprüft oder geändert. Für parallele Apps und Geräte muss **Single session per user** ausgeschaltet sein; Time-box und Inactivity timeout dürfen für die gewünschte Nutzung nicht kürzer als 30 Tage sein. Die kurze JWT-Laufzeit muss dafür nicht verlängert werden.

## Online- und Offline-Modus

**Online:** Listen, Produkte, Einstellungen und Katalog werden beim Start frisch aus Supabase geladen. Bestätigte Änderungen werden unmittelbar gespeichert und über Realtime auf anderen geöffneten Geräten nachgeladen. Beim Zurückkehren zur App und nach Wiederherstellung der Verbindung erfolgt ein erneuter Abgleich. Bei konkurrierenden Änderungen desselben Feldes gilt der zuletzt gespeicherte Stand.

**Offline:** Ein auf diesem Gerät zuvor geprüftes Konto kann den gespeicherten Stand lesen, solange die gespeicherte Auth-Sitzung nutzbar ist. Ein Hinweis kennzeichnet den Offline-Modus. Listen- und Produktänderungen sind deaktiviert; es gibt keine Offline-Schreibwarteschlange. Familienkontakte werden offline nicht angezeigt. Ist eine Token-Erneuerung nötig, kann für die Wiederaufnahme der Anmeldung eine Verbindung erforderlich sein.

Persönliche Darstellungsänderungen werden bei fehlender Verbindung lokal vorgemerkt und nach Rückkehr online gespeichert. Nach dem Abmelden werden der eigene Listen-Cache und das lokal geprüfte Profil entfernt.

## Smartphone und Updates

- **Android / Samsung:** Website in einem unterstützten Browser öffnen und das Installieren-Symbol oder den entsprechenden Menüpunkt des Browsers verwenden.
- **iPhone / iPad:** In Safari **Teilen → Zum Home-Bildschirm** wählen. Das Installieren-Symbol der Website erklärt die Schritte und wird im installierten App-Fenster ausgeblendet.
- **Bildschirm wach halten:** Wird im Einkaufsmodus automatisch angefordert. Browser, Betriebssystem und Energiesparmodus können die Funktion einschränken. Bei einem Hinweis **Erneut aktivieren** verwenden.
- **Updates:** Neue App-Fassungen werden nur mit **Jetzt aktualisieren** übernommen. **Später** behält die bestätigte Fassung bei, auch nach Neustart. Vor dem Aktualisieren offene Eingaben abschließen und den Einkaufsmodus beenden.
- **App-Icon:** Manifest-ID ist `/grevingshop/`. Versionierte Icon-Adressen ermöglichen die Erkennung neuer Symbole; der tatsächliche Austausch und eine mögliche zusätzliche Bestätigung werden vom Browser gesteuert.

Farbschemata: Energy, Lavender, Lagoon, Apricot, Verdelia, Noctara, Iriselle, Maréa und Rosavelle, jeweils hell und dunkel. Angemeldete Nutzer speichern ihre Darstellungseinstellungen kontogebunden in Supabase.

## Lokal öffnen

Die App besteht aus statischen Dateien und benötigt keinen Build-Schritt:

```sh
python3 -m http.server 4173
```

Danach [Website-Vorschau](http://127.0.0.1:4173/) oder [Smartphone-Vorschau](http://127.0.0.1:4173/s24fe.html) öffnen. Die Smartphone-Vorschau verwendet 384 × 832 CSS-Pixel; Bildschirmzoom und Browserleisten können die tatsächliche Darstellung verändern.

## GitHub Pages bereitstellen

1. Das aktuelle **GrevingShop-main-root.zip** entpacken.
2. Die enthaltenen Dateien direkt in das Stammverzeichnis des **main**-Branches hochladen.
3. GitHub Pages auf **Deploy from a branch → main → / (root)** einstellen.

Keinen zusätzlichen Ordner und keine `docs`-Verschachtelung hochladen. Der Upload erfolgt manuell. Das ZIP enthält die App, Anleitung, Vorschau, öffentlichen SQL-Vorlagen und Dokumentation; keine Tests, Agentenvorgaben, privaten Daten oder vorherigen ZIPs. Details stehen in [UPLOAD-ANLEITUNG.md](UPLOAD-ANLEITUNG.md).

## Supabase einrichten

Für eine neue Installation das [vollständige Setup](supabase-setup.sql) verwenden; für eine bestehende Installation die erforderlichen [Erweiterungen](supabase-update.sql), [Katalog-Erweiterung](supabase-catalog.sql) und [Startbereich-Korrektur](supabase-preferences-startpage.sql) beachten. Die Skripte vor Ausführung prüfen; das ZIP führt sie nicht automatisch aus.

1. Bestehendes gemeinsames Auth-Projekt nutzen und vorgesehene Konten geschützt bereitstellen. Anonyme Anmeldung deaktiviert lassen.
2. Platzhalter-Adressen in den SQL-Vorlagen erst im geschützten SQL Editor durch die freigegebenen Adressen ersetzen. Keine echten Kontakte öffentlich hochladen.
3. Supabase-Projekt-URL und Publishable Key in `app.js` sowie gegebenenfalls die Verbindungsziele der Content Security Policy in `index.html` anpassen.
4. Tabellen, Row Level Security, geschützte Profilfunktion und Realtime einrichten bzw. prüfen. Bestehende Fitness-Tabellen bleiben davon getrennt.

| Tabelle | Inhalt |
| --- | --- |
| shopping_lists | Listen, Notizen, Archivstatus und Änderungsnachweis |
| shopping_items | Produkte, Mengen, Notizen, Kategorien und Häkchen |
| shopping_catalog | Gemeinsamer Warenkatalog |
| shopping_preferences | Persönlicher Startbereich und Darstellung pro Konto |

Der Publishable Key ist für Browser vorgesehen. Secret Keys, Service-Role-Schlüssel und Passwörter dürfen niemals ins Frontend oder ZIP. RLS begrenzt gemeinsame Daten auf die freigegebenen Konten; persönliche Einstellungen sind nur dem jeweiligen Konto zugänglich. Das Entfernen der Registrierung aus GrevingShop ändert keine serverseitigen Auth-Einstellungen.

## Prüfung

Version 39: **69 App-Tests und 111 isolierte PostgreSQL-Zugriffsprüfungen bestanden** (zusätzlich 35 Ersteller-Prüfungen aus Version 38), einschließlich Sitzungsaufbewahrung, parallelem Start, Cache-Anzeige vor Abschluss der Datenabfragen, Offline-Lesemodus, Kontentrennung, Cloud-Schreibvorgängen, Katalogauswahl und bestätigungspflichtigen Updates. Anleitung und technische PDF-Dokumentation wurden auf Version 39 aktualisiert, gerendert und visuell geprüft. Die mobile Vorschau wurde mit künstlich um 3,5 Sekunden verzögerten Schreibantworten geprüft. Keine Messung auf einem physischen Smartphone oder Änderung der produktiven Datenbank. Einzelheiten und Grenzen stehen im [Prüfbericht](PRUEFBERICHT.md).
