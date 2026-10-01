# 2048++ v0.7.0 — Expectimax

## Solver
- AUTO verwendet jetzt Expectimax statt der rein deterministischen Mehrzug-Vorausschau.
- Nach jedem simulierten Zug wird ein CHANCE-Knoten ausgewertet:
  - neue `2` mit 90 %
  - neue `4` mit 10 %
  - mögliche freie Positionen werden berücksichtigt.
- Expectimax-Tiefe 1–4 bleibt im Menü wählbar; Standard ist 3.
- Für iPhone-Performance verwendet der Solver iteratives Vertiefen, ein Zeitbudget und bei vielen freien Feldern eine deterministische Stichprobe von bis zu 6 Spawn-Positionen.
- AUTO-Button zeigt `AUTO E3 ■` usw.
- COACH bleibt weiterhin die schnelle unmittelbare Bewertung.

## Korrekturen
- Abstand zwischen Undo und AUTO sowie zwischen allen fünf Navigationsbuttons ist jetzt explizit einheitlich.
- Ursache des fehlenden Abstands auf schmalen Displays behoben: die alte `min-width` des Undo-Buttons konnte in den Grid-Abstand hineinragen.
- Bei Game Over wird AUTO jetzt vollständig gestoppt UND der Button sofort visuell zurückgesetzt.
- Dadurch ist nach „Neues Spiel“ nur noch ein Tastendruck auf AUTO nötig.
- Auch bei manuellem Neustart oder Checkpoint-Start wird der AUTO-Zustand sauber zurückgesetzt.
