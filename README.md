# 2048++ v0.5.5

- Laufendes Spiel wird lokal als aktiver Spielstand gespeichert.
- Bei einem iOS/PWA-Neustart wird ein bis zu 48 Stunden alter Spielstand erkannt.
- Auswahl: „Fortsetzen“ oder „Neues Spiel“.
- Board, Score, Züge, Undo-Historie, Meilensteine und RNG-Zustand werden wiederhergestellt.
- Zeit im Hintergrund zählt nicht als Spielzeit.
- Wenn die App länger als 30 Sekunden im Hintergrund war und noch im Speicher lebt, erscheint beim Zurückkehren ebenfalls die Fortsetzen/Neues-Spiel-Auswahl.
- Nach 48 Stunden verfällt nur der aktive Wiederaufnahme-Spielstand; Historie, Rekorde und Checkpoints bleiben erhalten.
- Der Service-Worker-Dateicache ist davon unabhängig und war nicht die Ursache für das neue Spiel.
