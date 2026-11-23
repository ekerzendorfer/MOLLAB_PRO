/* MOLLAB PRO – geometry alignment helpers v0.2
   V2000 SDF: heavy-atom connectivity mapping, proper-rotation least-squares fit, RMSD in angstrom.
   No reflection, no conformer search, no docking or quantum-chemical calculation. */
(function (root) {
  "use strict";
  function parseSdf(sdf) {
    if (typeof sdf !== "string") throw Error("SDF-Text fehlt.");
    const lines = sdf.replace(/\r/g, "").split("\n");
    const headerIndex = lines.findIndex((line, index) => index < 12 && /\bV2000\b/.test(line));
    if (headerIndex < 0) throw Error("Derzeit werden nur 3D-SDF-Dateien im V2000-Format unterstützt.");
    const header = lines[headerIndex];
    const atomCount = Number.parseInt(header.slice(0,3),10);
    const bondCount = Number.parseInt(header.slice(3,6),10);
    if (!Number.isInteger(atomCount)||atomCount<1||atomCount>5000||!Number.isInteger(bondCount)||bondCount<0||bondCount>10000)
      throw Error("Ungültiger V2000-SDF-Kopf.");
    const atomStart=headerIndex+1;
    if (lines.length < atomStart+atomCount+bondCount) throw Error("Die SDF-Datei ist unvollständig.");
    const atoms=[];
    for (let i=0;i<atomCount;i++) {
      const line=lines[atomStart+i];
      const p=[Number.parseFloat(line.slice(0,10)),Number.parseFloat(line.slice(10,20)),Number.parseFloat(line.slice(20,30))];
      const el=line.slice(31,34).trim();
      if (p.some(x=>!Number.isFinite(x))||!el) throw Error("Ungültige Atomkoordinaten im SDF.");
      atoms.push({p,el});
    }
    const bonds=[];
    for (let i=0;i<bondCount;i++) {
      const line=lines[atomStart+atomCount+i];
      const a=Number.parseInt(line.slice(0,3),10)-1, b=Number.parseInt(line.slice(3,6),10)-1;
      const order=Number.parseInt(line.slice(6,9),10);
      if (!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>=atomCount||b>=atomCount||a===b)
        throw Error("Ungültiger Bindungseintrag im SDF.");
      bonds.push({a,b,order:Number.isInteger(order)?order:1});
    }
    return {lines,atoms,bonds,atomStart};
  }
  function writeCoords(parsed,coords) {
    if (coords.length !== parsed.atoms.length) throw Error("Falsche Koordinatenzahl.");
    const lines=parsed.lines.slice();
    for (let i=0;i<coords.length;i++) {
      const xyz=coords[i];
      if (xyz.some(x=>!Number.isFinite(x)||Math.abs(x)>9999))throw Error("Ungültige transformierte Koordinaten.");
      lines[parsed.atomStart+i]=xyz.map(x=>x.toFixed(4).padStart(10," ")).join("")+lines[parsed.atomStart+i].slice(30);
    }
    return lines.join("\n");
  }
  function heavyIndices(parsed) {
    return parsed.atoms.map((a,i)=>({el:a.el,i})).filter(x=>!["H","D","T"].includes(x.el)).map(x=>x.i);
  }
  function avg(points) {
    const p=[0,0,0];
    for(const q of points){p[0]+=q[0];p[1]+=q[1];p[2]+=q[2];}
    return p.map(x=>x/points.length);
  }
  function centerSdf(sdf) {
    const mol=parseSdf(sdf);
    const indices=heavyIndices(mol);
    if (!indices.length)throw Error("Keine schweren Atome gefunden.");
    const centroid=avg(indices.map(i=>mol.atoms[i].p));
    return writeCoords(mol,mol.atoms.map(a=>a.p.map((x,i)=>x-centroid[i])));
  }
  function graph(parsed) {
    const indices=heavyIndices(parsed);
    const positions=new Map(indices.map((global,i)=>[global,i]));
    const n=indices.length;
    const adj=Array.from({length:n},()=>Array(n).fill(0));
    for(const bond of parsed.bonds){
      if(positions.has(bond.a) && positions.has(bond.b)) {
        const a=positions.get(bond.a),b=positions.get(bond.b);
        adj[a][b]=adj[b][a]=bond.order;
      }
    }
    const elements=indices.map(i=>parsed.atoms[i].el);
    const signatures=elements.map((el,i)=>el+"|"+adj[i].filter(x=>x!==0).length+"|"+
      adj[i].map((x,j)=>x!==0?elements[j]:null).filter(Boolean).sort().join(","));
    return {indices,adj,elements,signatures};
  }
  function jacobiQuaternion(matrix) {
    const a=matrix.map(row=>row.slice());
    const v=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i===j?1:0));
    for(let iter=0;iter<80;iter++) {
      let p=0,q=1,max=0;
      for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)
        if(Math.abs(a[i][j])>max){max=Math.abs(a[i][j]);p=i;q=j;}
      if(max<1e-12)break;
      const phi=0.5*Math.atan2(2*a[p][q],a[q][q]-a[p][p]);
      const c=Math.cos(phi),s=Math.sin(phi),app=a[p][p],aqq=a[q][q],apq=a[p][q];
      a[p][p]=c*c*app-2*s*c*apq+s*s*aqq;
      a[q][q]=s*s*app+2*s*c*apq+c*c*aqq;
      a[p][q]=a[q][p]=0;
      for(let k=0;k<4;k++) {
        if(k!==p&&k!==q){
          const akp=a[k][p],akq=a[k][q];
          a[k][p]=a[p][k]=c*akp-s*akq;
          a[k][q]=a[q][k]=s*akp+c*akq;
        }
        const vkp=v[k][p],vkq=v[k][q];
        v[k][p]=c*vkp-s*vkq;
        v[k][q]=s*vkp+c*vkq;
      }
    }
    let k=0;
    for(let i=1;i<4;i++)if(a[i][i]>a[k][k])k=i;
    const q=v.map(row=>row[k]),n=Math.hypot(...q);
    return q.map(x=>x/n);
  }
  function rotationFromQuaternion(q) {
    const [w,x,y,z]=q;
    return [
      [1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y)],
      [2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x)],
      [2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)]
    ];
  }
  function fit(source,target) {
    if(source.length!==target.length||!source.length)throw Error("Vergleich benötigt gleiche Atomanzahl.");
    const from=avg(source),to=avg(target);
    const h=Array.from({length:3},()=>[0,0,0]);
    source.forEach((p,i)=>{
      const q=target[i],a=p.map((x,j)=>x-from[j]),b=q.map((x,j)=>x-to[j]);
      for(let k=0;k<3;k++)for(let l=0;l<3;l++)h[k][l]+=a[k]*b[l];
    });
    const xx=h[0][0],xy=h[0][1],xz=h[0][2],yx=h[1][0],yy=h[1][1],yz=h[1][2],zx=h[2][0],zy=h[2][1],zz=h[2][2];
    const mat=[
      [xx+yy+zz,yz-zy,zx-xz,xy-yx],
      [yz-zy,xx-yy-zz,xy+yx,xz+zx],
      [zx-xz,xy+yx,-xx+yy-zz,yz+zy],
      [xy-yx,xz+zx,yz+zy,-xx-yy+zz]
    ];
    const rotation=rotationFromQuaternion(jacobiQuaternion(mat));
    const transform=p=>rotation.map((row,k)=>row.reduce((sum,coef,j)=>sum+coef*(p[j]-from[j]),0)+to[k]);
    const value=source.reduce((sum,p,i)=>{
      const mapped=transform(p);
      return sum+mapped.reduce((d,x,j)=>d+(x-target[i][j])**2,0);
    },0);
    return {rotation,from,to,rmsd:Math.sqrt(Math.max(0,value/source.length)),transform};
  }
  function alignSdfs(targetSdf,sourceSdf,limit=3500) {
    const targetMol=parseSdf(targetSdf),sourceMol=parseSdf(sourceSdf);
    const ga=graph(targetMol), gb=graph(sourceMol);
    const n=ga.indices.length;
    if(n!==gb.indices.length||n<2) throw Error("Atomanzahlen der beiden 3D-Modelle stimmen nicht überein.");
    if(n>36)throw Error("Dieser automatische Vergleich ist auf maximal 36 schwere Atome beschränkt.");
    const map=new Array(n).fill(-1),used=new Set();
    const possibilities=ga.signatures.map(sig=>gb.signatures.map((s,i)=>s===sig?i:-1).filter(i=>i>=0));
    if(possibilities.some(x=>!x.length)) throw Error("Unterschiedliche Atomumgebungen: kein eindeutiger Geometrievergleich möglich.");
    const order=Array.from({length:n},(_,i)=>i).sort((i,j)=>possibilities[i].length-possibilities[j].length);
    let best=null,done=0,limitHit=false;
    function search(depth,strict) {
      if(done>=limit){limitHit=true;return;}
      if(depth===n){
        done++;
        const a=order.map(i=>targetMol.atoms[ga.indices[i]].p);
        const b=order.map(i=>sourceMol.atoms[gb.indices[map[i]]].p);
        const fitted=fit(b,a);
        if(!best||fitted.rmsd<best.rmsd){
          best={rmsd:fitted.rmsd,mapping:map.slice(),transform:fitted.transform,strict};
        }
        return;
      }
      const i=order[depth];
      for(const j of possibilities[i]){
        if(used.has(j))continue;
        let okay=true;
        for(let k=0;k<depth;k++){
          const prev=order[k],a=ga.adj[i][prev],b=gb.adj[j][map[prev]];
          if((a!==0)!==(b!==0) || (strict&&a!==b)){okay=false;break;}
        }
        if(!okay)continue;
        used.add(j);map[i]=j;search(depth+1,strict);used.delete(j);map[i]=-1;
        if(done>=limit)return;
      }
    }
    search(0,true);
    if(!best){search(0,false);}
    if(!best)throw Error("Keine kompatible Atomzuordnung nach Elementen und Bindungsnachbarschaft gefunden.");
    return {
      sdf:writeCoords(sourceMol,sourceMol.atoms.map(a=>best.transform(a.p))),
      rmsd:best.rmsd,
      atomCount:n,
      strict:best.strict,
      limited:limitHit,
      mapping:best.mapping
    };
  }
  root.MolGeo={parseSdf,centerSdf,alignSdfs,fit};
})(typeof window!=="undefined"?window:globalThis);
