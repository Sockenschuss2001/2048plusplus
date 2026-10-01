# 2048++ v0.6.1

AUTO bekommt echte Mehrzug-Vorausschau.

- AUTO-Vorausschau im Menü: 1, 2, 3 oder 4 Züge.
- Standard ist 3 Züge.
- AUTO bewertet nicht mehr nur den unmittelbar nächsten Zug, sondern simuliert mögliche Folgezüge rekursiv.
- Zukünftige Bewertungen werden leicht abgewertet, damit die aktuelle Brettsituation weiterhin stärker zählt.
- COACH bleibt bewusst bei der schnellen 1-Zug-Bewertung.
- Aktiver AUTO-Button zeigt die gewählte Tiefe, z. B. `AUTO 3×`.
- Historie speichert die verwendete AUTO-Tiefe.
- AUTO-Tempo bleibt unabhängig von der Rechentiefe.
- Die Berechnung simuliert noch keine zufälligen 2/4-Spawns zwischen den Lookahead-Zügen. Das ist der nächste sinnvolle Solver-Schritt (Expectimax).
