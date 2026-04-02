# 🚀 Molecule Lab Pro (Molekül-Labor Pro)

**A powerful, zero-installation, 100% client-side chemistry web app designed for education.**

Molecule Lab Pro bridges the gap between 2D chemical sketches and 3D molecular reality. It combines industry-standard cheminformatics tools and APIs into a single, seamless HTML file. No backend server, no logins, no paywalls – just pure, interactive chemistry running directly in your browser.

Perfect for high school and undergraduate chemistry teachers to demonstrate VSEPR theory, steric hindrance, isomerism, and the difference between simple molecular mechanics (MM) and quantum mechanical (QM) optimizations.

---

## ✨ Key Features

* **✏️ 2D Sketching to 3D Reality:** Draw molecules using the integrated JSME editor (including a "cleanup" broom tool) and instantly generate 3D models.
* **🔬 Live Cheminformatics (Powered by RDKit):** Calculates molecular weight, Lipophilicity (cLogP), Topological Polar Surface Area (TPSA), and H-bond donors/acceptors in real-time via WebAssembly.
* **🌐 Database Integration:** Automatically fetches IUPAC names and true Dipole Moments, alongside highly optimized 3D reference geometries directly from the **PubChem** and **NCI Cactus** APIs.
* **🧩 Interactive 3D Docking:** A unique "Overlay" mode that allows students to manually translate and rotate a basic 3D model onto a QM-optimized reference model. A brilliant spatial puzzle for the classroom!
* **📐 Interactive Measurements:** Click atoms in the 3D viewer to measure bond distances (Å) and bond angles (°).
* **🎨 Classroom-Ready Visuals:** Toggle between Ball & Stick, Spacefill, Stick, and Line styles. Generate Van-der-Waals (VDW) surfaces to visualize steric bulk.
* **📸 Teacher-Friendly:** Includes a Dark/Light mode toggle, a Fullscreen mode for projector use, and a one-click PNG export button to create high-quality images for worksheets.
* **🌍 Bilingual:** Seamless UI toggle between English (EN) and German (DE).

---

## 🛠️ How to Use (It's that simple)

Since Molecule Lab Pro is a fully client-side application relying on external APIs and WebAssembly, you don't need to install anything.

**Option 1: Live Demo**
Simply visit the GitHub Pages link (insert your link here: `https://ekerzendorfer.github.io/MOLEKUEL_LABOR_PRO/`)

**Option 2: Host it yourself**
1. Download the `index.html`.
2. Host it on any basic web server (like GitHub Pages, Netlify, or a local server) to ensure the RDKit WebAssembly (`.wasm`) module loads correctly without CORS restrictions.

---

## 🏗️ Technology Stack

This tool stands on the shoulders of giants. It integrates:
* **[JSME](https://jsme-editor.github.io/):** For 2D molecular drawing.
* **[3Dmol.js](https://3dmol.csb.pitt.edu/):** For high-performance, WebGL-based 3D rendering.
* **[RDKit.js](https://www.rdkit.org/):** Compiled to WebAssembly for instant, on-device cheminformatics analysis.
* **[PubChem PUG REST API](https://pubchem.ncbi.nlm.nih.gov/):** For QM-optimized 3D geometries and molecular properties.
* **[NCI Cactus API](https://cactus.nci.nih.gov/chemical/structure):** For rapid, rule-based 3D structure generation and IUPAC names.
* **[Tailwind CSS](https://tailwindcss.com/):** For the responsive, modern user interface.

---

## 👨‍🏫 About the Author

Created by **Erich Kerzendorfer**, a retired austrian chemistry teacher passionate about digital education, with coding assistance from generative AI (namely mainly Google Gemini). The goal of this project is to democratize high-quality chemistry visualization tools for classrooms worldwide.
