import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { writeFileSync, mkdirSync, existsSync } from "fs";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class {
    readAsDataURL(blob) {
      blob.arrayBuffer().then((buf) => {
        const mime = blob.type || "application/octet-stream";
        this.result = `data:${mime};base64,${Buffer.from(buf).toString("base64")}`;
        this.onloadend?.({ target: this });
      });
    }
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      });
    }
  };
}


function addMesh(root, name, geo, matProps) {
  const mat = new THREE.MeshStandardMaterial(matProps);
  mat.name = name + "Mat";
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  root.add(mesh);
  return mesh;
}

function housingShape() {
  const s = new THREE.Shape();
  s.moveTo(-2.25, -0.9);
  s.lineTo(2.25, -0.9);
  s.bezierCurveTo(2.48, -0.9, 2.52, -0.4, 2.5, 0.9);
  s.lineTo(-2.5, 0.9);
  s.bezierCurveTo(-2.52, 0.9, -2.48, -0.4, -2.25, -0.9);
  return s;
}

function buildBowlGeometry() {
  const pts = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    pts.push(new THREE.Vector2(0.38 * Math.sin((t * Math.PI) / 2), -0.2 * Math.cos((t * Math.PI) / 2) + 0.2));
  }
  const geo = new THREE.LatheGeometry(pts, 40);
  geo.computeVertexNormals();
  return geo;
}

function buildSingleProjector() {
  const root = new THREE.Group();
  root.name = "Headlight_Single";

  // ── Housing (extruded trapezoidal shell) ──────────────────────────
  const hGeo = new THREE.ExtrudeGeometry(housingShape(), {
    depth: 0.82,
    bevelEnabled: true,
    bevelSize: 0.05,
    bevelThickness: 0.05,
    bevelSegments: 3,
  });
  hGeo.translate(0, 0, -0.41);
  addMesh(root, "Housing", hGeo, { color: 0x111111, roughness: 0.32, metalness: 0.62 });

  // ── Inner black cavity ────────────────────────────────────────────
  const cavShape = new THREE.Shape();
  cavShape.moveTo(-1.95, -0.72);
  cavShape.lineTo(1.95, -0.72);
  cavShape.lineTo(2.18, 0.72);
  cavShape.lineTo(-2.18, 0.72);
  cavShape.closePath();
  const cavGeo = new THREE.ExtrudeGeometry(cavShape, { depth: 0.34, bevelEnabled: false });
  cavGeo.translate(0, 0, -0.17);
  addMesh(root, "HousingInner", cavGeo, { color: 0x050505, roughness: 0.55, metalness: 0.1 });

  // ── Projector Shroud ──────────────────────────────────────────────
  const shroudGeo = new THREE.TorusGeometry(0.52, 0.13, 18, 52);
  const shroudMesh = addMesh(root, "ProjectorShroud", shroudGeo, {
    color: 0x343a40, roughness: 0.24, metalness: 0.85,
  });
  shroudMesh.rotation.x = Math.PI / 2;
  shroudMesh.position.set(-0.1, 0.02, -0.04);

  // ── Projector Bowl (lathe cup shape) ─────────────────────────────
  const bowlMesh = addMesh(root, "ProjectorBowl", buildBowlGeometry(), {
    color: 0xdcecff, roughness: 0.08, metalness: 0.28,
    transparent: true, opacity: 0.88,
  });
  bowlMesh.position.set(-0.1, 0.02, -0.18);

  // ── Projector lens cap (flat circle) ─────────────────────────────
  const capGeo = new THREE.CircleGeometry(0.36, 40);
  const cap = addMesh(root, "ProjectorCap", capGeo, {
    color: 0xb0c8ff, roughness: 0.02, metalness: 0,
    transparent: true, opacity: 0.35,
  });
  cap.position.set(-0.1, 0.02, 0.06);

  // ── DRL Strip (top bar) ───────────────────────────────────────────
  const drlMesh = addMesh(root, "DRLStrip", new THREE.BoxGeometry(3.55, 0.11, 0.09), {
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
  });
  drlMesh.position.set(0.22, 0.78, 0.2);

  // ── DRL accent (lower diagonal) ───────────────────────────────────
  const drlAcc = addMesh(root, "DRLStripAccent", new THREE.BoxGeometry(1.22, 0.09, 0.09), {
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
  });
  drlAcc.rotation.z = -0.85;
  drlAcc.position.set(1.9, 0.16, 0.2);

  // ── Halo Ring ─────────────────────────────────────────────────────
  const haloGeo = new THREE.TorusGeometry(0.66, 0.032, 10, 70);
  const haloMesh = addMesh(root, "HaloRing", haloGeo, {
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
  });
  haloMesh.rotation.x = Math.PI / 2;
  haloMesh.position.set(-0.1, 0.02, 0.08);

  // ── Outer Lens ────────────────────────────────────────────────────
  const lensGeo = new THREE.ExtrudeGeometry(housingShape(), {
    depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1,
  });
  lensGeo.translate(0, 0, -0.035);
  const lensMesh = addMesh(root, "OuterLens", lensGeo, {
    color: 0xe7f5ff, roughness: 0.02, metalness: 0,
    transparent: true, opacity: 0.18,
  });
  lensMesh.position.z = 0.28;

  // ── Logo Plate ────────────────────────────────────────────────────
  const logoMesh = addMesh(root, "LogoPlate", new THREE.BoxGeometry(0.92, 0.22, 0.07), {
    color: 0x202020, roughness: 0.22, metalness: 0.75,
  });
  logoMesh.position.set(-1.7, -0.56, 0.22);

  return root;
}

function buildDualProjector() {
  const root = new THREE.Group();
  root.name = "Headlight_Dual";

  // Same housing as single
  const hGeo = new THREE.ExtrudeGeometry(housingShape(), {
    depth: 0.82, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 3,
  });
  hGeo.translate(0, 0, -0.41);
  addMesh(root, "Housing", hGeo, { color: 0x111111, roughness: 0.32, metalness: 0.62 });

  const cavShape = new THREE.Shape();
  cavShape.moveTo(-1.95, -0.72);
  cavShape.lineTo(1.95, -0.72);
  cavShape.lineTo(2.18, 0.72);
  cavShape.lineTo(-2.18, 0.72);
  cavShape.closePath();
  const cavGeo = new THREE.ExtrudeGeometry(cavShape, { depth: 0.34, bevelEnabled: false });
  cavGeo.translate(0, 0, -0.17);
  addMesh(root, "HousingInner", cavGeo, { color: 0x050505, roughness: 0.55, metalness: 0.1 });

  // ── Two projectors ────────────────────────────────────────────────
  [-0.58, 0.78].forEach((x, i) => {
    const shroud = addMesh(root, `ProjectorShroud${i}`, new THREE.TorusGeometry(0.46, 0.11, 18, 52), {
      color: 0x343a40, roughness: 0.24, metalness: 0.85,
    });
    shroud.name = i === 0 ? "ProjectorShroud" : "ProjectorShroud2";
    shroud.rotation.x = Math.PI / 2;
    shroud.position.set(x, 0.02, -0.04);

    const bowl = addMesh(root, `ProjectorBowl${i}`, buildBowlGeometry(), {
      color: 0xdcecff, roughness: 0.08, metalness: 0.28,
      transparent: true, opacity: 0.88,
    });
    bowl.name = i === 0 ? "ProjectorBowl" : "ProjectorBowl2";
    bowl.position.set(x, 0.02, -0.18);

    const cap = addMesh(root, `Cap${i}`, new THREE.CircleGeometry(0.33, 40), {
      color: 0xb0c8ff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.35,
    });
    cap.position.set(x, 0.02, 0.06);

    const haloGeo = new THREE.TorusGeometry(0.58, 0.028, 10, 70);
    const halo = addMesh(root, `HaloRing${i}`, haloGeo, {
      color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
    });
    halo.name = i === 0 ? "HaloRing" : "HaloRing2";
    halo.rotation.x = Math.PI / 2;
    halo.position.set(x, 0.02, 0.08);
  });

  // DRL (wider for dual)
  const drl = addMesh(root, "DRLStrip", new THREE.BoxGeometry(3.55, 0.11, 0.09), {
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
  });
  drl.position.set(0.1, 0.78, 0.2);

  const drlAcc = addMesh(root, "DRLStripAccent", new THREE.BoxGeometry(1.1, 0.09, 0.09), {
    color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9, roughness: 0.1, metalness: 0,
  });
  drlAcc.rotation.z = -0.85;
  drlAcc.position.set(1.82, 0.16, 0.2);

  // Outer Lens
  const lensGeo = new THREE.ExtrudeGeometry(housingShape(), {
    depth: 0.07, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 1,
  });
  lensGeo.translate(0, 0, -0.035);
  const lens = addMesh(root, "OuterLens", lensGeo, {
    color: 0xe7f5ff, roughness: 0.02, metalness: 0, transparent: true, opacity: 0.18,
  });
  lens.position.z = 0.28;

  const logo = addMesh(root, "LogoPlate", new THREE.BoxGeometry(0.92, 0.22, 0.07), {
    color: 0x202020, roughness: 0.22, metalness: 0.75,
  });
  logo.position.set(-1.7, -0.56, 0.22);

  return root;
}

function exportGLTF(group, filename) {
  return new Promise((resolve, reject) => {
    const exporter = new GLTFExporter();
    exporter.parse(
      group,
      (result) => {
        const json = JSON.stringify(result);
        writeFileSync(filename, json, "utf8");
        console.log(`✓ ${filename} (${(json.length / 1024).toFixed(1)} KB)`);
        resolve();
      },
      (err) => reject(err),
      { binary: false }
    );
  });
}

const outDir = "public/models";
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

await exportGLTF(buildSingleProjector(), `${outDir}/headlight-single.gltf`);
await exportGLTF(buildDualProjector(), `${outDir}/headlight-dual.gltf`);
