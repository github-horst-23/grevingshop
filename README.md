# Greving.Shop

**Gemeinsame Einkaufslisten für die Familie Greving.** Eine installierbare Web-App im Design von Greving.Fit, mit Supabase als zentralem Datenspeicher und Live-Synchronisierung zwischen den Geräten.

[App öffnen](https://github-horst-23.github.io/grevingshop/) · [Galaxy-S24-FE-Vorschau](https://github-horst-23.github.io/grevingshop/s24fe.html)

## Funktionen

- **Geteilte Listen:** Neue Listen anlegen, umbenennen, mit Notizen versehen, archivieren und wiederherstellen. Alle Listen sind für Carsten, Kathrin, Mathilda und Mariette freigegeben.
- **Produkte:** Name, Menge als Freitext (z. B. „2 Liter“), Notiz und Kategorie erfassen; Produkte bearbeiten oder entfernen.
- **Beim Einkauf:** Produkte abhaken und wieder öffnen, Fortschritt verfolgen sowie alle Häkchen für einen erneuten Einkauf zurücksetzen.
- **Suche und Filter:** Produkte suchen und zwischen allen, offenen und erledigten Einträgen wechseln.
- **Einkaufsmodus:** Die aktive Liste steht im Mittelpunkt. Navigation und Bearbeitungsaktionen werden ausgeblendet; große Häkchen und Mengen erleichtern die Bedienung. Der Bildschirm wird automatisch wach gehalten, sofern der Browser und das Betriebssystem es erlauben.
- **Live-Synchronisierung:** Jede bestätigte Änderung wird direkt in Supabase gespeichert. Andere geöffnete Apps werden über Supabase Realtime aktualisiert. Beim Start werden die Listen frisch vom Server geladen.
- **Settings:** Neun vollständige Farbschemata aus Greving.Fit, jeweils hell und dunkel, sowie Schriftgröße, Darstellungsdichte und Kontoverwaltung.
- **Installierbare PWA:** App-Icon, Web-App-Manifest und zwischengespeicherte Oberfläche für Smartphone und Desktop.

## Anmelden

1. [Greving.Shop öffnen](https://github-horst-23.github.io/grevingshop/).
2. Auf **?** oder **Mit Greving.Fit-Konto anmelden** tippen.
3. Das eigene Familienprofil auswählen und das bestehende Greving.Fit-Passwort eingeben.

Die Anmeldung nutzt dasselbe Supabase-Projekt wie Greving.Fit. Es werden keine neuen Passwörter oder Konten durch die App erzeugt. Das Profil wird anhand der hinterlegten E-Mail-Adresse zugeordnet. Nach der Anmeldung zeigt der Profilknopf den Anfangsbuchstaben des Vornamens.

**App ausprobieren** öffnet lokale Beispieldaten. Diese Vorschau überträgt keine Einkaufslisten nach Supabase.

## Auf dem Smartphone installieren

**Samsung/Android:** Die App in Chrome oder Samsung Internet öffnen und im Browser-Menü **App installieren**, **Zu Startbildschirm hinzufügen** oder die entsprechende Browseroption wählen.

**iPhone/iPad:** In Safari **Teilen → Zum Home-Bildschirm** wählen.

Die Installation und das Bildschirm-Wachhalten benötigen HTTPS oder eine lokale Entwicklungsadresse. Das Betriebssystem kann Wake Lock beispielsweise im Energiesparmodus beenden. Die App zeigt den tatsächlichen Status und bietet bei Problemen einen erneuten Versuch an. Nach Rückkehr zur aktiven App wird das Wachhalten erneut angefordert, solange der Einkaufsmodus läuft.

## Farbschemata

Unter **Settings → Farbschema & Darstellung** sind dieselben Paletten wie in Greving.Fit verfügbar:

Energy, Lavender, Lagoon, Apricot, Verdelia, Noctara, Iriselle, Maréa und Rosavelle.

Jede Palette enthält abgestimmte Hintergründe, Flächen, Schrift-, Haupt- und Akzentfarben für die helle und dunkle Darstellung. Darstellungsoptionen werden auf dem jeweiligen Gerät gespeichert.

## Synchronisierung und Offline-Verhalten

- Beim Start einer angemeldeten App werden Listen und Produkte aus Supabase abgefragt.
- Anlegen, Bearbeiten, Abhaken, Entfernen und Archivieren schreiben unmittelbar in die Datenbank. Eine Änderung gilt erst nach Bestätigung durch Supabase als gespeichert.
- Realtime-Ereignisse lösen einen erneuten Abruf des aktuellen Stands aus. Bei einer unterbrochenen Live-Verbindung erfolgt zusätzlich alle fünf Sekunden ein Abgleich, solange die App sichtbar ist.
- Beim Zurückkehren zur App und nach Wiederherstellung der Internetverbindung wird erneut synchronisiert.
- Ohne Internet sind die zwischengespeicherte Oberfläche und der zuletzt geladene Benutzerstand lesbar. **Änderungen benötigen eine Verbindung.** Es gibt keine Offline-Schreibwarteschlange.
- Bei gleichzeitiger Änderung desselben Feldes gilt die zuletzt in Supabase gespeicherte Änderung. Einzelne Produkte werden separat gespeichert; eine Änderung ersetzt nicht die gesamte Einkaufsliste.

## Supabase einrichten

Für die bereitgestellte App sind die Einkaufslisten-Tabellen und Realtime im bestehenden Greving.Fit-Projekt eingerichtet.

Für eine eigene Installation:

1. E-Mail-Anmeldung in Supabase Auth aktivieren und die vier vorgesehenen Familienkonten bereitstellen.
2. Das [SQL-Setup](docs/supabase-setup.sql) im Supabase SQL Editor ausführen. Das Skript kann erneut ausgeführt werden und richtet Tabellen, RLS-Regeln und die Realtime-Veröffentlichung ein.
3. Supabase-Projekt-URL und den **Publishable Key** in `docs/app.js` anpassen. Die Profil-/E-Mail-Zuordnung in App und SQL muss übereinstimmen.
4. Bei Nutzung von Bestätigungs- oder Wiederherstellungslinks die App-URL in der Supabase Auth-Konfiguration berücksichtigen.

### Datenmodell und Zugriff

| Tabelle | Inhalt |
| --- | --- |
| `shopping_lists` | Listenname, Notiz, Ersteller, Erstellungszeit und Archivstatus |
| `shopping_items` | Zugehörige Liste, Produktname, Menge, Notiz, Kategorie und Erledigt-Status |

Beide Tabellen verwenden **Row Level Security (RLS)**. Nur authentifizierte Konten mit einer der vier freigegebenen Familien-E-Mail-Adressen dürfen zugreifen. Die vorhandenen Fitness-Tabellen werden durch das Setup nicht verändert.

Der im Frontend eingebundene Publishable Key ist für die Verwendung im Browser vorgesehen. **Secret Keys und Service-Role-Schlüssel gehören niemals ins Frontend.**

## Lokal entwickeln

Die App besteht aus statischen Dateien. Ein Build-Schritt und eine Paketinstallation sind nicht erforderlich.

```sh
git clone https://github.com/github-horst-23/grevingshop.git
cd grevingshop
python3 -m http.server 4173 --directory docs
```

Anschließend [localhost:4173](http://localhost:4173/) öffnen. Die Smartphone-Vorschau liegt unter [localhost:4173/s24fe.html](http://localhost:4173/s24fe.html).

```text
docs/
├── index.html              # App-Oberfläche und Navigation
├── app.js                  # Listen, Anmeldung, Synchronisierung und Wake Lock
├── styles.css              # Responsive Gestaltung und Greving.Fit-Farbschemata
├── supabase.js             # Lokal eingebundenes Supabase-JavaScript-SDK
├── supabase-setup.sql       # Tabellen, Zugriffsregeln und Realtime
├── service-worker.js       # Zwischenspeichern der App-Oberfläche
├── manifest.webmanifest    # PWA-Metadaten
├── icon.svg / icon-*.png    # App-Icons
└── s24fe.html               # Interaktive Smartphone-Vorschau
```

Die Oberfläche lädt das Supabase-SDK lokal aus dem Repository und benötigt dafür keinen externen CDN-Aufruf.

## Auf GitHub Pages veröffentlichen

Unter **Settings → Pages → Build and deployment** einstellen:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/docs**

Nach dem Speichern und einer erfolgreichen Pages-Bereitstellung ist die App unter `https://<benutzername>.github.io/<repository>/` erreichbar. Bei Änderungen an zwischengespeicherten App-Dateien die Cache-Version in `docs/service-worker.js` erhöhen.

## Validierung

JavaScript-Syntax lässt sich mit Node.js prüfen:

```sh
node --check docs/app.js
node --check docs/service-worker.js
```

Die Synchronisierungslogik wurde automatisiert auf frischen Serverabruf beim Start, unmittelbare Schreibvorgänge, Offline-Schreibsperre, Realtime-Nachladen und das Leeren der sichtbaren Daten bei Abmeldung geprüft. Die Datenbankregeln wurden mit Familien- und fremden E-Mail-Claims sowie anonymen Tabellenrechten geprüft; Testdaten wurden zurückgerollt.

Die Smartphone-Vorschau ist eine responsive Browserdarstellung, kein echter Samsung-Gerätetest. Anmeldung, Mehrgerätebetrieb und Bildschirm-Wachhalten sollten zusätzlich auf den verwendeten Smartphones geprüft werden.
