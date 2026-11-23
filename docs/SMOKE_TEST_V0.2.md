# MOLLAB PRO v0.2 – manueller Smoke-Test

**Ziel:** Den mathematisch getesteten Geometrievergleich mit den wirklichen 3D-Datenquellen und einem Browser prüfen, bevor die App im Unterricht verwendet wird.

- [ ] **2D-Platz:** Unter Windows/Edge Desktop größerer Editor (450 px bei breiter Ansicht) und breite linke Spalte; auf Smartphone keine Überlagerung der Steuerelemente.
- [ ] **Ethanol:** Zeichnen → Start → Modell A erzeugen → PubChem-3D laden. Einzelansichten, Nebeneinander und Überlagerung lassen sich schalten.
- [ ] **Zentrierung:** Beide Quellen erscheinen nach Laden ohne auffällige Verschiebung; „Nebeneinander“ zeigt beide vollständig und gemeinsam drehbar.
- [ ] **RMSD:** Automatische Überlagerung zeigt einen Zahlenwert nur bei erfolgreicher Schweratomzuordnung; bei „Automatik zurücksetzen“ verschwindet der Zahlenwert und die unabhängige Zentrierung bleibt.
- [ ] **Aceton:** Vergleich funktioniert auch bei einer anderen funktionellen Gruppe; RDKit-Deskriptoren und PubChem-Name erscheinen wie bisher.
- [ ] **Cyclohexan oder Benzol:** Symmetrische Zuordnungen prüfen; bei nicht übereinstimmender Bond-/Atomzuordnung wird eine verständliche Meldung angezeigt, kein erfundener RMSD.
- [ ] **Chirales Molekül (z.B. L-Alanin):** Eingegebener SMILES behält `@` und `/`/`\`-Marker. Stereochemiehinweis im Vergleich prüfen; kein Spiegeln-Button vorhanden.
- [ ] **Kein PubChem-3D verfügbar:** Verständliche Fehlermeldung, Modell A bleibt weiter benutzbar.
- [ ] **Interaktive Funktionen:** 3D-Drehung, Zoom, Kugel-Stab/Stäbchen/Kalotten, Abstand/Winkel, VDW-Oberfläche, Vollbild, Hell/Dunkel und PNG-Export.
- [ ] **Manuelle Ausrichtung:** Regler bleiben bedienbar; Maus-Ausrichtung an/aus; „Manuelle Korrekturen zurücksetzen“ und „Automatik zurücksetzen“ getrennt.
- [ ] **DE/EN:** Neue Bezeichnungen und Bedienhilfen in beiden Sprachen verständlich.
- [ ] **Molekülwechsel:** Nach Start eines neuen Moleküls keine alte Überlagerung/RMSD mehr sichtbar.

## Modellgrenzen und Lesart

RMSD ist eine geometrische Abweichung nach bestmöglicher **Rotation/Translation** und ermittelter Schweratomzuordnung; **keine Spiegelung** und keine energetische Bewertung. Die App vergleicht zwei *generierte* 3D-Geometrien, nicht „Molekülmechanik gegen QM“. Ein kleiner Wert setzt nicht voraus, dass beide Konformere identisch oder experimentell nachgewiesen sind.

## Automatisierte Tests

```
node tests/geometry-alignment.test.cjs
```

Testet starre Rotationen/Translationen, umsortierte SDF-Atomindizes, Abgrenzung einer Spiegelung, Zentrierung, nicht übereinstimmende Atomgraphen, JavaScript-Syntax und zentrale UI-Steuerelemente.
