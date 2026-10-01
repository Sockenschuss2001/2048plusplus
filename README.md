# 2048++ v0.7.2 — Strategievergleich

In der Spielhistorie gibt es jetzt einen eigenen AUTO-Strategievergleich.

Je Strategie werden aus abgeschlossenen AUTO-Läufen berechnet:
- Anzahl Läufe
- 2048-Erfolgsquote
- höchste erreichte Kachel
- Median der maximal erreichten Kachel
- durchschnittlicher Score
- bester Score
- durchschnittliche Anzahl Züge

Strategiewechsel während eines einzelnen AUTO-Laufs werden ab jetzt mitprotokolliert. Solche Läufe erscheinen separat als „Gemischt“, damit sie die Statistik einer einzelnen Strategie nicht verfälschen.

Ältere AUTO-Läufe, die vor der Einführung der Strategieaufzeichnung entstanden sind, erscheinen als „Früheres AUTO“.

Die Detailzeile jedes neuen AUTO-Laufs zeigt außerdem Strategie und Rechentiefe.
