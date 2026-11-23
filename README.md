# MOLLAB PRO – Molekülgeometrie und 3D-Vergleich

**Version:** v0.2.2 (23.11.2026) · CHEMIE mit KI · Browser-App für den Chemieunterricht

Die Anwendung verbindet **2D-Molekülskizzen (JSME)** mit **interaktiven 3D-Modellen (3Dmol.js)** und einfachen molekularen Deskriptoren aus RDKit.js.

## Start

**[MOLLAB PRO öffnen](https://ekerzendorfer.github.io/MOLLAB_PRO/)**

Die App benötigt Internetzugang für den JSME-Editor, RDKit.js, 3Dmol.js sowie die externen 3D-Datenquellen.

## Grundablauf

1. Molekül in einem großzügigen **2D-Sketcher** zeichnen und **Start** drücken. Die App übernimmt den erzeugten SMILES.
2. **3D-Modell A erzeugen** – 3D-Struktur vom NCI Chemical Identifier Resolver (Cactus).
3. Optional **PubChem-3D laden** – zusätzliches generiertes 3D-Konformer-Modell aus PubChem (keine quantenchemisch berechnete Geometrie).
4. Bei beiden Modellen zwischen **Modell A**, **PubChem B**, **Nebeneinander** (gemeinsam drehbar) und **Überlagerung** wechseln.

Im Überlagerungsmodus versucht die App beide Modelle automatisch nach entsprechender Schweratom-Nachbarschaft zuzuordnen und mittels rotations-/translationsbasierter Least-Squares-Anpassung optimal zu überlagern; sie zeigt einen **Schweratom-RMSD in Å** an. Die Zuordnung ist auf **36 schwere Atome** beschränkt. Ist sie nicht zuverlässig möglich, meldet die App das; sie **erfindet keinen RMSD**. Atome können in vielen symmetrischen Molekülen mehrere gleichwertige Zuordnungen haben; bei sehr vielen Möglichkeiten ist die Suche begrenzt und wird als eingeschränkt gekennzeichnet.

Manuelle Verschiebung und Drehung bleiben möglich. Die beiden Originalstrukturen werden für die Darstellung jeweils um ihren Schwerpunkt zentriert. Die falsche frühere Schaltfläche **„Spiegeln“** wurde entfernt; echte Enantiomere werden nicht durch eine Drehung erzeugt. Stereochemische SMILES-Marker werden **nicht mehr entfernt**; die 3D-Stereochemie der externen Datenquelle ist bei chiralen Molekülen dennoch gesondert zu prüfen.

## Weitere Anzeigen

- RDKit-WebAssembly: einfache Molekül-Deskriptoren, etwa Molmasse, TPSA, H-Brücken-Donoren und -Akzeptoren.
- Darstellung als Kugel-Stab, Stäbchen, Kalotten oder Linien, dazu Van-der-Waals-Oberfläche.
- Abstand-/Winkelmessung im 3D-Viewer, Vollbild, Hell/Dunkel, PNG-Export.
- Deutsch/Englisch umschaltbare Beschriftung.

**Modellgrenzen:** Ein geometrischer Vergleich ist weder Protein-Ligand-Docking noch eine energetische Optimierung. NCI/3D-Strukturen und PubChem-Konformere sind nicht automatisch experimentelle Referenzgeometrien oder QM-optimiert. Ein kleiner RMSD beweist keine energetische Gleichwertigkeit. Für MMFF/UFF, Konformersuche und xTB-GFN2 steht weiterhin das separate [MOL_LAB-Colab-Notebook](https://colab.research.google.com/github/ekerzendorfer/MOL_LAB/blob/main/MOL_LAB.ipynb) zur Verfügung.

## Technischer Aufbau

- `index.html` – Oberfläche und bisherige Funktionen
- `geometry-alignment.js` – SDF-V2000-Lesen, Schweratom-Zentrierung, Graphzuordnung, rotationsbasiertes Alignment, RMSD
- `molecule-handoff.js` – validierte URL-basierte SMILES-Übernahme samt begrenztem Rücklink zur MOLEKÜL-WERKSTATT
- `tests/geometry-alignment.test.cjs` – reproduzierbare mathematische und UI-Basistests
- `tests/handoff.test.cjs` – URL-Übergabe, Stereochemie-Zeichen, Rücklink und UI-Regression
- `.github/workflows/geometry-regression.yml` – GitHub-Actions-Regressionstests

Die Daten kommen von [NCI Cactus](https://cactus.nci.nih.gov/chemical/structure) und [PubChem](https://pubchem.ncbi.nlm.nih.gov/); es gibt keinen eigenen Backend-Server.

## Test vor Unterrichtsfreigabe

Siehe [SMOKE_TEST_V0.2.md](docs/SMOKE_TEST_V0.2.md). Für die endgültige Freigabe müssen zusätzlich die externen Datenabrufe sowie die 2D-/3D-Bedienung in einem echten Browser geprüft werden.

Das GitHub-Repository bleibt auch für die spätere Einbindung in die **MOLEKÜL-WERKSTATT** eigenständig.

*Erstellt als Unterrichtswerkzeug im Projekt CHEMIE mit KI.*

## V0.2.1 – Moleküle aus der MOLEKÜL-WERKSTATT übernehmen

Die neue [MOLEKÜL-WERKSTATT](https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/) kann einen gewählten bzw. selbst eingegebenen SMILES direkt in den bestehenden JSME-Editor übergeben.

Beispiellink:
```text
https://ekerzendorfer.github.io/MOLLAB_PRO/?smiles=CCO&name=Ethanol&source=molekuelwerkstatt&context=MW-001
```

- SMILES werden URL-kodiert übergeben und im **2D-Editor eingelesen**, sobald der Editor und der Viewer bereit sind.
- **Keine automatische 3D-Berechnung:** Nutzer klicken wie bisher selbst auf `3D-Modell A erzeugen`.
- Ein sichtbarer Rücklink führt entweder zurück zur Aufgabe MW-001 oder zum Bereich „Frei erkunden“.
- Eigene Lernnotizen und Resultate werden **nicht** übermittelt.
- Leere oder fehlerhafte SMILES werden nicht als valide Struktur ausgegeben; normales manuelles Zeichnen bleibt möglich.
- Der Rücklink wird aus einem festen erlaubten Ziel abgeleitet, nicht aus einer beliebigen `return`-URL.
- Für große Moleküle (etwa Calicheamicin) kann die externe 3D-Erzeugung scheitern; dafür steht das leistungsfähigere MOL_LAB-Colab-Notebook zur Verfügung.

Der Link kann auch weiterhin ohne Parameter geöffnet werden. Für den vollständigen Browser-Test siehe [Übergabeabnahme in der Werkstatt](https://github.com/ekerzendorfer/MOLEKUELWERKSTATT/blob/main/docs/HANDOFF_V0.2.md).

## V0.2.2 – sichere Rückkehr zu fünf Forschungswegen

Der Übergabevertrag unterstützt nach wie vor die freie Nutzung und zusätzlich genau diese fünf Werkstatt-Aufgaben: `MW-001`, `MW-002`, `MW-009`, `MW-015`, `MW-024`. Die Rückadresse wird **aus einer festen Allowlist abgeleitet** und verweist jeweils auf `https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/?case=<ID>#aufgabe`; MW-001 nutzt aus Kompatibilitätsgründen `#aufgabe` ohne Parameter.

- MW-009: Propanal/Aceton (`CCC=O`, `CC(=O)C`)
- MW-015: CO₂/Wasser/NH₃/CH₄ (jeweils separat wählbar)
- MW-024: Cyclohexan (`C1CCCCC1`)

Die chemische 2D-/3D- und Geometriefunktion von MOLLAB_PRO bleibt unverändert. Der neue Code erweitert nur die sichere Rückverknüpfung, **nicht** die Berechnungen. Auch jetzt werden weder eigene Protokollnotizen noch numerische Ergebnisse übertragen. Die URL-Rundläufe sind in `tests/handoff.test.cjs` geprüft.
