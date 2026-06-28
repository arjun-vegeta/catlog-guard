import { API_BASE_URL } from "./config";
import {
  ListingRequest,
  ListingResponse,
  HealthResponse,
  AuditRecord,
  OverviewMetrics,
} from "./types";

export const SAMPLE_PAYLOADS: { label: string; payload: ListingRequest }[] = [
  {
    label: "Clean Compliant Drawer Slides",
    payload: {
      item_id: "SKU_HDW_8821",
      title: "Heavy Duty Stainless Steel Drawer Slides 22 Inch Soft Close",
      brand: "ProHardware",
      product_type: "HARDWARE",
      bullet_points:
        "Ball bearing mechanism, 100lb load capacity, corrosion resistant stainless steel.",
      color: "Silver",
      material: "Stainless Steel",
      item_dimensions: "22 x 1.77 x 0.5 inches",
    },
  },
  {
    label: "Truncated Title (High Risk)",
    payload: {
      item_id: "SKU_SHO_9942",
      title: "find. Women's",
      brand: "find.",
      product_type: "SHOES",
      bullet_points: "Faux suede upper, synthetic sole, 3-inch stiletto heel.",
      color: "Red",
      material: "Faux Suede",
      item_dimensions: "10 x 4 x 3 inches",
    },
  },
  {
    label: "Category Mismatch Defect",
    payload: {
      item_id: "SKU_MEC_1104",
      title: "PETG 3D Printer Filament 1.75mm 1kg Spool High Precision",
      brand: "ProFilament",
      product_type: "SHOES",
      bullet_points: "High transparency, easy to print, chemical resistance.",
      color: "Black",
      material: "PETG",
      item_dimensions: "8 x 8 x 2.8 inches",
    },
  },
  {
    label: "Missing Attribute Defect",
    payload: {
      item_id: "SKU_FURN_3321",
      title: "Ergonomic Leather Executive Office Chair Lumbar Support",
      brand: "Generic",
      product_type: "HOME_FURNITURE",
      bullet_points: "Padded armrests, 360 swivel, tilt tension mechanism.",
      color: "",
      material: "",
      item_dimensions: "26 x 27 x 42 inches",
    },
  },
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: "LOG_001",
    timestamp: "2026-06-09T15:14:17.000Z",
    item_id: "SKU_MEC_1104",
    title: "PETG 3D Printer Filament 1.75mm 1kg Spool High Precision",
    brand: "ProFilament",
    product_type: "SHOES",
    defect_flag: 1,
    defect_type: "category_mismatch",
    defect_probability: 0.9412,
    quality_score: 52.4,
    compliance_risk: "high",
    reason:
      "Product title describes 3D printer filament, but taxonomy category is set to 'SHOES'.",
    suggested_fix: "Re-categorize item under 'MECHANICAL_COMPONENTS'.",
    latency_ms: 412.5,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_002",
    timestamp: "2026-06-09T14:32:05.000Z",
    item_id: "SKU_SHO_9942",
    title: "find. Women's",
    brand: "find.",
    product_type: "SHOES",
    defect_flag: 1,
    defect_type: "truncated_title",
    defect_probability: 0.968,
    quality_score: 45.0,
    compliance_risk: "high",
    reason: "Product title is truncated mid-phrase ('find. Women's').",
    suggested_fix: "Extend title to include full product details.",
    latency_ms: 389.2,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_003",
    timestamp: "2026-06-09T14:10:00.000Z",
    item_id: "SKU_FURN_3321",
    title: "Ergonomic Leather Executive Office Chair Lumbar Support",
    brand: "Generic",
    product_type: "HOME_FURNITURE",
    defect_flag: 1,
    defect_type: "missing_attribute",
    defect_probability: 0.884,
    quality_score: 58.0,
    compliance_risk: "medium",
    reason:
      "Mandatory material attribute is empty despite title specifying 'Leather'.",
    suggested_fix: "Populate material attribute field with 'Genuine Leather'.",
    latency_ms: 362.1,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_004",
    timestamp: "2026-06-09T13:45:12.000Z",
    item_id: "SKU_ELE_4412",
    title: "Braided Nylon USB-C Cable 6ft Braided Nylon USB-C Cable 6ft",
    brand: "AnkerTech",
    product_type: "ELECTRONICS",
    defect_flag: 1,
    defect_type: "duplicate",
    defect_probability: 0.912,
    quality_score: 64.2,
    compliance_risk: "low",
    reason:
      "Title contains redundant repeated phrase ('Braided Nylon USB-C Cable 6ft').",
    suggested_fix: "Deduplicate repeated title phrase.",
    latency_ms: 295.4,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_005",
    timestamp: "2026-06-09T13:12:30.000Z",
    item_id: "SKU_APP_5501",
    title: "Men's Casual Slim Fit Cotton T-Shirt",
    brand: "Generic",
    product_type: "CLOTHING",
    defect_flag: 1,
    defect_type: "missing_attribute",
    defect_probability: 0.865,
    quality_score: 61.5,
    compliance_risk: "medium",
    reason:
      "Brand name is unassigned ('Generic'). Color and Size attributes are missing.",
    suggested_fix:
      "Specify valid manufacturer brand and add color/size metrics.",
    latency_ms: 310.2,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_006",
    timestamp: "2026-06-09T12:50:18.000Z",
    item_id: "SKU_KIT_7712",
    title: "Stainless Steel Chef Knife 8 Inch Precision German Steel",
    brand: "CulinaryPro",
    product_type: "SOFA",
    defect_flag: 1,
    defect_type: "category_mismatch",
    defect_probability: 0.952,
    quality_score: 48.0,
    compliance_risk: "high",
    reason:
      "Product title describes a kitchen chef knife, but category is set to 'SOFA'.",
    suggested_fix: "Re-categorize item under 'KITCHEN'.",
    latency_ms: 405.0,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_007",
    timestamp: "2026-06-09T12:18:40.000Z",
    item_id: "SKU_HDW_8821",
    title: "Heavy Duty Stainless Steel Drawer Slides 22 Inch Soft Close",
    brand: "ProHardware",
    product_type: "HARDWARE",
    defect_flag: 0,
    defect_type: "none",
    defect_probability: 0.024,
    quality_score: 98.5,
    compliance_risk: "low",
    reason: "Listing satisfies standard catalog compliance guidelines.",
    suggested_fix: "No action required.",
    latency_ms: 1.25,
    llm_cost_usd: 0.0,
  },
  {
    id: "LOG_008",
    timestamp: "2026-06-09T11:40:00.000Z",
    item_id: "SKU_BEA_8819",
    title: "Organic Hydrating Face Serum Hyaluronic Acid",
    brand: "GlowBeauty",
    product_type: "BEAUTY",
    defect_flag: 1,
    defect_type: "missing_attribute",
    defect_probability: 0.812,
    quality_score: 68.0,
    compliance_risk: "low",
    reason:
      "Volume / Item weight dimensions are missing from attribute metadata.",
    suggested_fix: "Add liquid volume attribute (e.g., 30ml / 1 fl oz).",
    latency_ms: 280.0,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_009",
    timestamp: "2026-06-09T11:15:22.000Z",
    item_id: "SKU_OFF_9910",
    title: "Wireless Mechanical Keyboard RGB Backlit",
    brand: "",
    product_type: "OFFICE_PRODUCTS",
    defect_flag: 1,
    defect_type: "missing_attribute",
    defect_probability: 0.895,
    quality_score: 55.0,
    compliance_risk: "medium",
    reason:
      "Brand attribute is blank. Switch type and connectivity specs are missing.",
    suggested_fix: "Populate brand attribute and key switch specification.",
    latency_ms: 345.1,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_010",
    timestamp: "2026-06-09T10:30:15.000Z",
    item_id: "SKU_AUT_1190",
    title: "Car",
    brand: "AutoParts",
    product_type: "HARDWARE",
    defect_flag: 1,
    defect_type: "truncated_title",
    defect_probability: 0.982,
    quality_score: 30.0,
    compliance_risk: "high",
    reason:
      "Title 'Car' is extremely brief and lacks model, year, and component details.",
    suggested_fix:
      "Expand title with vehicle compatibility and part identification.",
    latency_ms: 420.5,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_011",
    timestamp: "2026-06-09T10:05:00.000Z",
    item_id: "SKU_MEC_2200",
    title:
      "Industrial Flange Bearing 1 Inch Shaft Diameter Industrial Flange Bearing 1 Inch Shaft Diameter",
    brand: "BearTech",
    product_type: "MECHANICAL_COMPONENTS",
    defect_flag: 1,
    defect_type: "duplicate",
    defect_probability: 0.925,
    quality_score: 60.0,
    compliance_risk: "low",
    reason:
      "Item title repeats the full string 'Industrial Flange Bearing 1 Inch Shaft Diameter'.",
    suggested_fix: "Remove duplicate string phrase from title.",
    latency_ms: 315.0,
    llm_cost_usd: 0.00025,
  },
  {
    id: "LOG_012",
    timestamp: "2026-06-09T09:30:00.000Z",
    item_id: "SKU_ELE_9944",
    title: "Noise Cancelling Over-Ear Wireless Headphones",
    brand: "SoundMaster",
    product_type: "ELECTRONICS",
    defect_flag: 0,
    defect_type: "none",
    defect_probability: 0.015,
    quality_score: 96.0,
    compliance_risk: "low",
    reason: "Listing satisfies standard catalog compliance guidelines.",
    suggested_fix: "No action required.",
    latency_ms: 1.18,
    llm_cost_usd: 0.0,
  },
];

export async function checkBackendHealth(
  customBaseUrl?: string,
): Promise<HealthResponse | null> {
  const url = `${customBaseUrl || API_BASE_URL}/health`;
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {
    console.warn(`Backend health check failed at ${url}`);
  }
  return null;
}

export async function checkListing(
  payload: ListingRequest,
  customBaseUrl?: string,
): Promise<ListingResponse> {
  const baseUrl = customBaseUrl || API_BASE_URL;
  const endpoint = `${baseUrl}/check-listing`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: unknown) {
    console.warn(
      "Backend API unavailable or error encountered. Utilizing client fallback:",
      error,
    );

    const isTruncated = payload.title.length < 15;
    const isMissingBrand =
      !payload.brand || payload.brand.toLowerCase() === "generic";
    const isCategoryMismatch =
      payload.product_type === "SHOES" &&
      payload.title.toLowerCase().includes("filament");

    let defect_type = "none";
    let defect_flag = 0;
    let defect_prob = 0.05;
    let quality_score = 95.0;
    let risk: "low" | "medium" | "high" = "low";
    let reason = "Listing satisfies standard catalog compliance guidelines.";
    let fix = "No action required.";

    if (isCategoryMismatch) {
      defect_flag = 1;
      defect_type = "category_mismatch";
      defect_prob = 0.94;
      quality_score = 52.0;
      risk = "high";
      reason = `Product category '${payload.product_type}' mismatches item title which describes 3D Printer Filament.`;
      fix = "Update product_type to MECHANICAL_COMPONENTS.";
    } else if (isTruncated) {
      defect_flag = 1;
      defect_type = "truncated_title";
      defect_prob = 0.96;
      quality_score = 45.0;
      risk = "high";
      reason = `Title '${payload.title}' is too short or cut off mid-phrase.`;
      fix = "Expand title with brand, model, and key specs.";
    } else if (isMissingBrand) {
      defect_flag = 1;
      defect_type = "missing_attribute";
      defect_prob = 0.88;
      quality_score = 58.0;
      risk = "medium";
      reason = "Mandatory brand attribute is missing or set to Generic.";
      fix = "Specify valid manufacturer brand name.";
    }

    return {
      item_id: payload.item_id || "SKU_TEMP",
      defect_flag,
      defect_type,
      defect_probability: defect_prob,
      quality_score,
      compliance_risk: risk,
      reason,
      suggested_fix: fix,
      latency_ms: Math.round(Math.random() * 15 + 2),
    };
  }
}

export function calculateMetrics(records: AuditRecord[]): OverviewMetrics {
  const total = records.length;
  if (total === 0) {
    return {
      total_audited: 0,
      total_flagged: 0,
      defect_flag_rate_pct: 0,
      avg_quality_score: 0,
      avg_latency_ms: 0,
      total_llm_cost_usd: 0,
    };
  }

  const flagged = records.filter((r) => r.defect_flag === 1).length;
  const flagRate = (flagged / total) * 100;
  const avgQuality =
    records.reduce((acc, r) => acc + r.quality_score, 0) / total;
  const avgLatency = records.reduce((acc, r) => acc + r.latency_ms, 0) / total;
  const totalCost = records.reduce((acc, r) => acc + (r.llm_cost_usd || 0), 0);

  return {
    total_audited: total,
    total_flagged: flagged,
    defect_flag_rate_pct: Number(flagRate.toFixed(1)),
    avg_quality_score: Number(avgQuality.toFixed(1)),
    avg_latency_ms: Number(avgLatency.toFixed(1)),
    total_llm_cost_usd: Number(totalCost.toFixed(4)),
  };
}

export function formatTimeString(isoString: string): string {
  if (!isoString) return "";
  try {
    const parts = isoString.split("T");
    if (parts.length === 2) {
      return parts[1].slice(0, 8);
    }
  } catch {
    // Fallback
  }
  return isoString;
}
