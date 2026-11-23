"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
require("../geometry-alignment.js");
const g = global.MolGeo;
assert(g && typeof g.alignSdfs === "function");

function sdf(coords, elements, bonds) {
  const lines = ["synthetic","MOLLAB regression","",
    String(coords.length).padStart(3) + String(bonds.length).padStart(3) +
    "  0  0  0  0            999 V2000"];
  for (let i=0; i<coords.length; i++) {
    lines.push(coords[i].map(x=>x.toFixed(4).padStart(10)).join("") +
      " " + elements[i].padEnd(3) + " 0  0  0  0  0  0  0  0  0  0  0  0");
  }
  for(const [a,b,order=1] of bonds) {
    lines.push(String(a+1).padStart(3) + String(b+1).padStart(3) +
      String(order).padStart(3) + "  0  0  0  0");
  }
  lines.push("M  END","$$$$");
  return lines.join("\n");
}
const pts=[[0,0,0],[1,0,0],[0,2,0],[0,0,3],[2,2,2]];
const elems=["C","O","N","Cl","F"];
const bonds=[[0,1],[0,2],[0,3],[0,4]];
const base=sdf(pts,elems,bonds);
const transformed=p=>[-p[1]+4,p[0]+2,p[2]-8];
const source=sdf(pts.map(transformed),elems,bonds);
const result=g.alignSdfs(base,source);
assert(result.rmsd<.0001,"rigid alignment should have near-zero RMSD");
assert.equal(result.atomCount,5);
assert(result.strict);

const perm=[3,0,4,1,2], inverse={};
perm.forEach((old,newIndex)=>inverse[old]=newIndex);
const reordered=sdf(perm.map(i=>transformed(pts[i])),perm.map(i=>elems[i]),
  bonds.map(([a,b])=>[inverse[a],inverse[b]]));
assert(g.alignSdfs(base,reordered).rmsd<.0001,"must map atoms by graph, not SDF order");

const mirrored=sdf(pts.map(p=>[-p[0]+4,p[1]+2,p[2]-8]),elems,bonds);
assert(g.alignSdfs(base,mirrored).rmsd>.1,"proper rotations must not falsely equate mirror images");

const centered=g.parseSdf(g.centerSdf(source));
for(let k=0;k<3;k++) {
  const mean=centered.atoms.reduce((sum,a)=>sum+a.p[k],0)/centered.atoms.length;
  assert(Math.abs(mean)<.0001,"centroid must be centered");
}

assert.throws(()=>g.alignSdfs(sdf([[0,0,0],[1,0,0]],["C","O"],[[0,1]]),
  sdf([[0,0,0],[1,0,0]],["C","N"],[[0,1]])),/Atomumgebungen/);

const html=fs.readFileSync(path.join(__dirname,"..","index.html"),"utf8");
const script=html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
assert(script,"inline controller missing");
new Function(script[1]); // syntax validation
for(const target of ["tglSide","tglOverlay","btnAutoAlign","alignmentSummary","jsme_container"]) {
  assert(html.includes('id="'+target+'"'),"missing UI element "+target);
}
assert(html.includes("geometry-alignment.js"),"alignment helper not loaded");
assert(!html.includes("QM-Referenz"),"obsolete QM label returned");
assert(!html.includes('id="btnMirrorGlobal"'),"misleading Spiegeln control returned");

console.log("MOLLAB PRO geometry and UI regression: OK");
