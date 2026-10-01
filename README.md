# 2048++ v0.6.0

Erster funktionaler AUTO-Modus.

- AUTO spielt selbständig mit derselben Bewertungslogik wie COACH.
- AUTO-Button startet/stoppt den Automatiklauf; aktiver Zustand wird deutlich markiert.
- Einstellbares AUTO-Tempo: Turbo, Schnell, Normal, Langsam.
- Slide-Geschwindigkeit und AUTO-Denkpause bleiben getrennte Einstellungen.
- Die 2048-Glückwunschmeldung wird im AUTO-Modus automatisch übersprungen.
- Manuelle Pause und Menü pausieren AUTO; danach wird derselbe AUTO-Lauf fortgesetzt.
- Bei Game Over stoppt AUTO automatisch.
- Spielhistorie kennzeichnet AUTO-Läufe.
- Nach Wiederherstellung aus Hintergrund/48h-Cache wird AUTO aus Sicherheitsgründen nicht automatisch gestartet; der Spielstand bleibt erhalten.
- AUTO nutzt zunächst bewusst nur die vorhandene einzügige COACH-Heuristik. Das schafft eine messbare Basis für spätere Lookahead-/Solver-Versionen.
