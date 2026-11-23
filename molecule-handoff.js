/* MOLEKÜL-WERKSTATT ↔ MOLLAB PRO: small URL handoff contract v0.2.0
   Transport: ?smiles=<url-encoded>&name=<url-encoded>&source=molekuelwerkstatt&context=MW-001|frei
   Only the SMILES/label/context cross apps; private learning notes stay in browser-local storage.
   A return address is NEVER read from the query string. */
(function (root) {
  "use strict";
  const TARGET = "https://ekerzendorfer.github.io/MOLLAB_PRO/";
  const HOME = "https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/";
  const MAX_SMILES = 2000;
  function checkedSmiles(value) {
    if (typeof value !== "string") throw new Error("SMILES muss Text sein.");
    const smiles = value.trim();
    if (!smiles) throw new Error("Bitte zuerst einen SMILES eingeben oder ein Beispiel auswählen.");
    if (smiles.length > MAX_SMILES) throw new Error("SMILES ist für eine URL-Übergabe zu lang (maximal " + MAX_SMILES + " Zeichen).");
    if (/[\u0000-\u0020\u007f]/.test(smiles)) throw new Error("SMILES darf keine Leerzeichen oder Steuerzeichen enthalten.");
    return smiles;
  }
  function safeLabel(value) {
    if (typeof value !== "string") return "Molekül";
    const label = value.trim().replace(/[\u0000-\u001f\u007f]/g, "");
    return label.slice(0,100) || "Molekül";
  }
  function safeContext(value) {
    return value === "MW-001" || value === "MW-002" ? value : "frei";
  }
  function makeLink(base, details) {
    const u = new URL(base || TARGET);
    if (u.protocol !== "https:" || u.hostname !== "ekerzendorfer.github.io" ||
        !/^\/MOLLAB_PRO\/?$/.test(u.pathname))
      throw new Error("MOLLAB_PRO-Zieladresse ist nicht zulässig.");
    const smiles = checkedSmiles(details && details.smiles);
    u.searchParams.set("smiles", smiles);
    u.searchParams.set("name", safeLabel(details.name));
    u.searchParams.set("source", "molekuelwerkstatt");
    u.searchParams.set("context", safeContext(details.context));
    return u.toString();
  }
  function readLink(href) {
    const u = new URL(href, TARGET);
    if (!u.searchParams.has("smiles")) return null;
    const context = safeContext(u.searchParams.get("context"));
    const fromWerkstatt = u.searchParams.get("source") === "molekuelwerkstatt";
    const result = {
      ok: false, name: safeLabel(u.searchParams.get("name")),
      smiles: "", fromWerkstatt, context,
      returnUrl: fromWerkstatt ? HOME + (context === "MW-002" ? "?case=MW-002#aufgabe" : context === "MW-001" ? "#aufgabe" : "#frei") : null,
      error: ""
    };
    try {
      result.smiles = checkedSmiles(u.searchParams.get("smiles"));
      result.ok = true;
    } catch (error) { result.error = error.message; }
    return result;
  }
  root.MoleculeHandoff = { makeLink, readLink, checkedSmiles, safeContext };
})(typeof window !== "undefined" ? window : globalThis);
