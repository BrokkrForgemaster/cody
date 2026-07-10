"use client";

import { useEffect, useMemo, useState } from "react";
import { Circle, Image as KonvaImage, Layer, Line, Stage } from "react-konva";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useLightingCatalog } from "@/lib/lightingCatalogStore";
import { cn } from "@/lib/utils";
import type { LightingProduct, MaskName } from "@/types/lighting-configurator";
import { defaultBuildConfig } from "@/types/lighting-configurator";
import { ProductPreviewCanvas } from "@/components/configurator/ProductPreviewCanvas";

function useLoadedImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.src = src;
    nextImage.onload = () => setImage(nextImage);
  }, [src]);

  return image;
}

function stagePoints(points: [number, number][], width: number, height: number) {
  return points.flatMap(([x, y]) => [(x / 100) * width, (y / 100) * height]);
}

const maskNames: MaskName[] = ["lens", "housing", "reflector", "drl", "halo", "accent"];

function duplicateProduct(product: LightingProduct): LightingProduct {
  return {
    ...JSON.parse(JSON.stringify(product)),
    id: `${product.id}-copy-${Date.now()}`,
    productName: `${product.productName} Copy`,
  };
}

export function ConfiguratorAdminClient() {
  const { products, saveProducts, resetCatalog, ready } = useLightingCatalog();
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedMaskName, setSelectedMaskName] = useState<MaskName>("lens");
  const [status, setStatus] = useState("Catalog seeded from local demo data.");
  const [uploading, setUploading] = useState(false);

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0];
  const activeMask = selectedProduct?.masks.find((mask) => mask.name === selectedMaskName);
  const previewImage = selectedProduct?.gallery.find((item) => item.kind === "studio")?.src ?? "";
  const image = useLoadedImage(previewImage);
  const stageWidth = 760;
  const stageHeight = 480;

  const updateProduct = (patch: Partial<LightingProduct>) => {
    if (!selectedProduct) return;
    saveProducts(products.map((product) => (product.id === selectedProduct.id ? { ...product, ...patch } : product)));
    setStatus("Product changes saved to local browser storage.");
  };

  const updateMaskPoints = (points: [number, number][]) => {
    if (!selectedProduct || !activeMask) return;
    const nextMasks = selectedProduct.masks.map((mask) =>
      mask.name === selectedMaskName ? { ...mask, points } : mask,
    );
    updateProduct({ masks: nextMasks });
  };

  const pointCount = activeMask?.points.length ?? 0;

  const permissionSummary = useMemo(() => {
    if (!selectedProduct) return "";
    return `${selectedProduct.brand} / ${selectedProduct.vehicle.label} / ${selectedProduct.productName}`;
  }, [selectedProduct]);

  if (!ready || !selectedProduct || !activeMask) {
    return <div className="text-sm text-muted">Loading configurator admin tools...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <AdminPageHeader
        eyebrow="Shop Ops"
        title="Lighting Configurator"
        description="Manage demo products, local media references, fitment notes, and polygon masks from the same catalog model used by the public configurator."
        actions={
          <>
            <button type="button" className="cta-secondary px-4" onClick={() => {
              saveProducts([duplicateProduct(selectedProduct), ...products]);
              setStatus("Selected product duplicated.");
            }}>
              Duplicate
            </button>
            <button type="button" className="cta-secondary px-4" onClick={() => {
              resetCatalog();
              setStatus("Catalog reset to seeded demo products.");
            }}>
              Reset Seed
            </button>
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="panel-border rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Products</p>
            <div className="mt-4 space-y-2">
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-3 text-left transition",
                    selectedProduct.id === product.id
                      ? "border-accent/60 bg-accent/10"
                      : "border-white/10 bg-white/[0.02] hover:border-accent/35",
                  )}
                >
                  <p className="text-sm font-semibold text-white">{product.brand} {product.series}</p>
                  <p className="mt-1 text-xs text-muted">{product.vehicle.label}</p>
                </button>
              ))}
            </div>
            <button
              type="button"
              className="cta-primary mt-4 w-full"
              onClick={() => {
                const clone = duplicateProduct(selectedProduct);
                saveProducts([{ ...clone, series: "New Demo", productName: "Lighting Product" }, ...products]);
                setSelectedProductId(clone.id);
                setStatus("New demo product created from the selected template.");
              }}
            >
              Add Product
            </button>
            <button
              type="button"
              className="cta-secondary mt-3 w-full"
              onClick={() => {
                if (products.length <= 1) return;
                const next = products.filter((product) => product.id !== selectedProduct.id);
                saveProducts(next);
                setSelectedProductId(next[0]?.id ?? "");
                setStatus("Selected product removed from the local demo catalog.");
              }}
            >
              Delete Selected
            </button>
          </div>

          <div className="panel-border rounded-3xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Status</p>
            <p className="mt-3 text-sm text-muted">{status}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="panel-border rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Product Editor</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input className="focus-field" value={selectedProduct.brand} onChange={(event) => updateProduct({ brand: event.target.value as LightingProduct["brand"] })} placeholder="Brand" />
                <input className="focus-field" value={selectedProduct.series} onChange={(event) => updateProduct({ series: event.target.value })} placeholder="Series" />
                <input className="focus-field" value={selectedProduct.productName} onChange={(event) => updateProduct({ productName: event.target.value })} placeholder="Product name" />
                <input className="focus-field" value={selectedProduct.productLine} onChange={(event) => updateProduct({ productLine: event.target.value })} placeholder="Product line" />
                <input className="focus-field" value={selectedProduct.vehicle.make} onChange={(event) => updateProduct({ vehicle: { ...selectedProduct.vehicle, make: event.target.value, label: `${event.target.value} ${selectedProduct.vehicle.model} (${selectedProduct.vehicle.yearRange})` } })} placeholder="Make" />
                <input className="focus-field" value={selectedProduct.vehicle.model} onChange={(event) => updateProduct({ vehicle: { ...selectedProduct.vehicle, model: event.target.value, label: `${selectedProduct.vehicle.make} ${event.target.value} (${selectedProduct.vehicle.yearRange})` } })} placeholder="Model" />
                <input className="focus-field" value={selectedProduct.vehicle.yearRange} onChange={(event) => updateProduct({ vehicle: { ...selectedProduct.vehicle, yearRange: event.target.value, label: `${selectedProduct.vehicle.make} ${selectedProduct.vehicle.model} (${event.target.value})` } })} placeholder="Years" />
                <input className="focus-field" value={String(selectedProduct.priceFrom)} onChange={(event) => updateProduct({ priceFrom: Number(event.target.value) || 0 })} placeholder="Price from" />
                <textarea className="focus-field md:col-span-2 min-h-24" value={selectedProduct.summary} onChange={(event) => updateProduct({ summary: event.target.value })} placeholder="Summary" />
                <textarea className="focus-field md:col-span-2 min-h-24" value={selectedProduct.notes} onChange={(event) => updateProduct({ notes: event.target.value })} placeholder="Fitment notes" />
                <textarea className="focus-field md:col-span-2 min-h-24" value={selectedProduct.imagePermissionNotes} onChange={(event) => updateProduct({ imagePermissionNotes: event.target.value })} placeholder="Permission notes" />
              </div>
            </div>

            <div className="panel-border rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Media + Notes</p>
              <div className="mt-4 space-y-3 text-sm text-muted">
                <p>{permissionSummary}</p>
                <p>Gallery assets: {selectedProduct.gallery.length}</p>
                <p>Installed images: {selectedProduct.installedImages.length}</p>
                <p>Night images: {selectedProduct.nightImages.length}</p>
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted">Upload replacement image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="focus-field p-2 file:mr-4 file:rounded-xl file:border-0 file:bg-accent/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      setUploading(true);
                      const reader = new FileReader();
                      reader.onload = () => {
                        const src = typeof reader.result === "string" ? reader.result : "";
                        const nextGallery = selectedProduct.gallery.map((item, index) =>
                          index === 0 ? { ...item, src } : item,
                        );
                        updateProduct({ gallery: nextGallery });
                        setUploading(false);
                        setStatus(`Uploaded ${file.name} into the lead gallery slot for local demo preview.`);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
                <p>{uploading ? "Processing upload..." : "Uploads are stored in local browser state for demo administration."}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="panel-border rounded-3xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Mask Editor</p>
                  <p className="mt-2 text-sm text-muted">Click on the preview to add points. Drag points to refine the polygon.</p>
                </div>
                <select className="focus-field max-w-[220px]" value={selectedMaskName} onChange={(event) => setSelectedMaskName(event.target.value as MaskName)}>
                  {maskNames.map((maskName) => (
                    <option key={maskName} value={maskName}>{maskName}</option>
                  ))}
                </select>
              </div>
              <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-black">
                <Stage
                  width={stageWidth}
                  height={stageHeight}
                  onClick={(event) => {
                    const stage = event.target.getStage();
                    if (!stage) return;
                    const position = stage.getPointerPosition();
                    if (!position) return;
                    const nextPoint: [number, number] = [
                      Number(((position.x / stageWidth) * 100).toFixed(2)),
                      Number(((position.y / stageHeight) * 100).toFixed(2)),
                    ];
                    updateMaskPoints([...(activeMask.points ?? []), nextPoint]);
                  }}
                >
                  <Layer>
                    {image ? <KonvaImage image={image} width={stageWidth} height={stageHeight} /> : null}
                  </Layer>
                  <Layer>
                    <Line
                      points={stagePoints(activeMask.points, stageWidth, stageHeight)}
                      closed
                      fill="rgba(193,18,31,0.18)"
                      stroke="#C1121F"
                      strokeWidth={2}
                    />
                    {activeMask.points.map(([x, y], index) => (
                      <Circle
                        key={`${selectedMaskName}-${index}`}
                        x={(x / 100) * stageWidth}
                        y={(y / 100) * stageHeight}
                        radius={5}
                        fill="#fff7ed"
                        stroke="#C1121F"
                        strokeWidth={2}
                        draggable
                        onDragEnd={(event) => {
                          const next = [...activeMask.points];
                          next[index] = [
                            Number(((event.target.x() / stageWidth) * 100).toFixed(2)),
                            Number(((event.target.y() / stageHeight) * 100).toFixed(2)),
                          ];
                          updateMaskPoints(next);
                        }}
                      />
                    ))}
                  </Layer>
                </Stage>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" className="cta-secondary px-4" onClick={() => updateMaskPoints(activeMask.points.slice(0, -1))}>
                  Delete Last Point
                </button>
                <button type="button" className="cta-secondary px-4" onClick={() => updateMaskPoints([])}>
                  Clear Region
                </button>
                <button type="button" className="cta-primary px-4" onClick={() => setStatus(`Saved ${selectedMaskName} mask with ${pointCount} points.`)}>
                  Save Mask
                </button>
              </div>
            </div>

            <div className="panel-border rounded-3xl p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-accent">Live Overlay Preview</p>
              <div className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-black">
                <ProductPreviewCanvas product={selectedProduct} imageSrc={previewImage} build={defaultBuildConfig} editableMask={selectedMaskName} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
