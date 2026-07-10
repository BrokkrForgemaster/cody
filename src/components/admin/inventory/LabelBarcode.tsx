"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

type Props = {
  value: string;
  displayValue?: boolean;
  height?: number;
  width?: number;
  fontSize?: number;
  margin?: number;
};

export function LabelBarcode({
  value,
  displayValue = false,
  height = 40,
  width = 1.4,
  fontSize = 10,
  margin = 0,
}: Props) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current || !value) return;
    try {
      JsBarcode(ref.current, value, {
        format: "CODE128",
        displayValue,
        height,
        width,
        fontSize,
        margin,
        background: "#ffffff",
        lineColor: "#000000",
      });
    } catch (err) {
      console.warn("[LabelBarcode] failed to render", value, err);
    }
  }, [value, displayValue, height, width, fontSize, margin]);

  return <svg ref={ref} aria-label={`Barcode ${value}`} />;
}
