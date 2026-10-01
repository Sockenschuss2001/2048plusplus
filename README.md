# 2048++ v0.7.1

## Wechselbare AUTO-Strategien
- Ausgewogen: Expectimax mit dem bisherigen Kompromiss aus freien Feldern, Ordnung, Merge-Chancen und Score.
- Überleben: gewichtet freie Felder deutlich stärker; soll volle/gefährliche Boards vermeiden.
- Ecke / Ordnung: gewichtet Corner-Bonus und Monotonie stärker; große Kacheln sollen stabiler in einer Ecke bleiben.
- Punkte / Merge: aggressivere Bewertung unmittelbarer Merges und Punkte.
- Schnell: reine 1-Zug-Heuristik ohne Expectimax; geringste Rechenlast.

Die Expectimax-Tiefe 1–4 bleibt separat wählbar und gilt für alle Strategien außer „Schnell“.

## AUTO-Button
- Aktiv wieder im gewünschten Format: `AUTO 3× Ⅱ`.
- Kein `E3` und kein kleines Rechteck mehr.
- Bei „Schnell“ zeigt er `AUTO 1× Ⅱ`.

Alle Strategien werden persistent gespeichert und können auch während eines laufenden AUTO-Spiels gewechselt werden.
