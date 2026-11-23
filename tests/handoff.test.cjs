"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../molecule-handoff.js");
const handoff = global.MoleculeHandoff;
assert(handoff && typeof handoff.makeLink === "function");

const base = "https://ekerzendorfer.github.io/MOLLAB_PRO/";
const samples = ["CCO","COC","c1ccccc1","N[C@@H](C)C(=O)O","F/C=C\\F","[NH4+].[Cl-]","CC(=O)O","Cn1cnc2n(C)c(=O)n(C)c(=O)c12"];
for (const smiles of samples) {
  const link = handoff.makeLink(base, {smiles, name:"Test-Molekül", context:"MW-001"});
  const u = new URL(link);
  assert.equal(u.searchParams.get("smiles"), smiles, "SMILES lost stereo or punctuation");
  assert.equal(u.searchParams.get("name"), "Test-Molekül");
  assert.equal(u.searchParams.get("source"), "molekuelwerkstatt");
  const decoded = handoff.readLink(link);
  assert(decoded && decoded.ok);
  assert.equal(decoded.smiles, smiles);
  assert.equal(decoded.returnUrl, "https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/#aufgabe");
}
const free = handoff.readLink(handoff.makeLink(base,{smiles:"O",name:"Wasser",context:"frei"}));
assert.equal(free.returnUrl, "https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/#frei");
const second=handoff.readLink(handoff.makeLink(base,{smiles:"S",name:"Schwefelwasserstoff",context:"MW-002"}));
assert.equal(second.smiles,"S");
assert.equal(second.context,"MW-002");
assert.equal(second.returnUrl,"https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/?case=MW-002#aufgabe",
  "MW-002 should return to its own guided case rather than MW-001");
for (const id of ["MW-009","MW-015","MW-024"]) {
  const mol = id === "MW-009" ? "CCC=O" : id === "MW-015" ? "O=C=O" : "C1CCCCC1";
  const link = handoff.makeLink(base,{smiles:mol,name:"Probe",context:id});
  const parsed = handoff.readLink(link);
  assert.equal(parsed.ok,true);
  assert.equal(parsed.context,id);
  assert.equal(parsed.smiles,mol);
  assert.equal(parsed.returnUrl,"https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/?case="+id+"#aufgabe");
}
assert.equal(handoff.readLink(base), null, "normal MOLLAB launch must remain unchanged");

const untrusted = new URL(handoff.makeLink(base,{smiles:"CCO",name:"Ethanol",context:"MW-001"}));
untrusted.searchParams.set("return","https://example.org/attacker");
assert.equal(handoff.readLink(untrusted.href).returnUrl, "https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/#aufgabe",
  "never use user-supplied return URL");
assert.throws(()=>handoff.makeLink("https://example.org/",{smiles:"CCO"}),/nicht zulässig/);
assert.throws(()=>handoff.makeLink(base,{smiles:"C C"}),/Leerzeichen/);
assert.throws(()=>handoff.makeLink(base,{smiles:""}),/Bitte zuerst/);
assert.throws(()=>handoff.makeLink(base,{smiles:"C".repeat(2001)}),/zu lang/);
const bad = new URL(untrusted.href);
bad.searchParams.set("smiles","C C");
assert.equal(handoff.readLink(bad.href).ok, false, "invalid imported SMILES should be rejected");
const unknown = new URL(untrusted.href);
unknown.searchParams.set("context","evil");
assert.equal(handoff.readLink(unknown.href).returnUrl, "https://ekerzendorfer.github.io/MOLEKUELWERKSTATT/#frei");

const html = fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
assert(html.includes("molecule-handoff.js"),"handoff helper must be loaded");
if (fs.existsSync(path.join(__dirname,"..","app.js"))) {
  const app = fs.readFileSync(path.join(__dirname,"..","app.js"),"utf8");
  new Function(app);
  assert(html.includes('id="case-handoff-0"') && html.includes('id="case-handoff-1"'),"MW-001 links missing");
  assert(html.includes('id="free-mollab-link"'),"free-mode launch missing");
  assert(app.includes("updateFreeHandoff()"),"SMILES changes must refresh the launch link");
  assert(app.includes('linkToMollab(mol.smiles, mol.name, path.id)'),"MW-001 must use task molecule data");
} else {
  assert(html.includes('id="handoffReturn"'),"return link missing");
  assert(html.includes("readGenericMolecularInput(incomingHandoff.smiles)"),"JSME auto import missing");
  assert(html.includes("tryImportHandoff();"),"import on viewer/editor initialization missing");
  const script = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
  assert(script,"MOLLAB main JS not found");
  new Function(script[1]);
}
console.log("Molecule handoff: URL roundtrips, stereo markers, safe return, UI and JS – OK");
