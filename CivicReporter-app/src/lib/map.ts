import { supabase } from "./supabase";

export type Hotspot = {
  id: string | number;
  title?: string;
  status?: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
};

/**
 * Fetch hotspots from Supabase. Tries complaints_for_client first; if missing,
 * falls back to complaints_with_verification_count. Uses select('*') to avoid
 * column-mismatch errors (e.g., when image_url isn't present).
 */
export async function fetchHotspots(status: string = "all", municipalId?: string) {
  try {
    // Try preferred view
    let q1: any = supabase.from("complaints_for_client").select("*");
    if (status && status !== "all") q1 = q1.eq("status", status);
    if (municipalId) q1 = q1.eq("municipal_id", municipalId);
    let { data, error } = await q1;

    // Fallback view
    if (error) {
      let q2: any = supabase
        .from("complaints_with_verification_count")
        .select("*");
      if (status && status !== "all") q2 = q2.eq("status", status);
      if (municipalId) q2 = q2.eq("municipal_id", municipalId);
      const r2 = await q2;
      data = r2.data as any[];
      error = r2.error as any;
    }

    if (error) {
      console.error("Error fetching hotspots:", error.message || error);
      return [] as Hotspot[];
    }

    if (!Array.isArray(data)) return [] as Hotspot[];

    const rows: Hotspot[] = (data as any[])
      .filter((r: any) => r?.latitude != null && r?.longitude != null)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        image_url: r.image_url ?? null,
      }));

    return rows;
  } catch (err) {
    console.error("fetchHotspots error:", err);
    return [] as Hotspot[];
  }
}

/**
 * Fetch hotspots inside a bounding box via RPC get_complaints_in_bbox.
 * If bbox is not provided, falls back to fetchHotspots(status).
 */
export async function fetchHotspotsInBBox(
  status: string = "all",
  bbox?: { min_lat: number; min_lng: number; max_lat: number; max_lng: number },
  municipalId?: string
) {
  try {
    if (!bbox) return fetchHotspots(status, municipalId);

    // If a municipal filter is provided, prefer querying the views directly
    if (municipalId) {
      // Try preferred view first
      let q1: any = supabase
        .from("complaints_for_client")
        .select("*")
        .gte("latitude", bbox.min_lat)
        .lte("latitude", bbox.max_lat)
        .gte("longitude", bbox.min_lng)
        .lte("longitude", bbox.max_lng)
        .eq("municipal_id", municipalId);
      if (status && status !== "all") q1 = q1.eq("status", status);
      let { data, error } = await q1;

      if (error) {
        // Fallback to complaints_with_verification_count
        let q2: any = supabase
          .from("complaints_with_verification_count")
          .select("*")
          .gte("latitude", bbox.min_lat)
          .lte("latitude", bbox.max_lat)
          .gte("longitude", bbox.min_lng)
          .lte("longitude", bbox.max_lng)
          .eq("municipal_id", municipalId);
        if (status && status !== "all") q2 = q2.eq("status", status);
        const r2 = await q2;
        data = r2.data as any[];
        error = r2.error as any;
      }

      if (!data || !Array.isArray(data)) return [] as Hotspot[];

      return (data as any[])
        .filter((r: any) => r.latitude != null && r.longitude != null)
        .map((r: any) => ({
          id: r.id,
          title: r.title,
          status: r.status,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
          image_url: r.image_url ?? null,
        }));
    }

    // Otherwise, use the RPC for performance (no municipal filter)
    const { data, error } = await supabase.rpc("get_complaints_in_bbox", {
      min_lat: bbox.min_lat,
      min_lng: bbox.min_lng,
      max_lat: bbox.max_lat,
      max_lng: bbox.max_lng,
    });

    if (error) {
      console.error(
        "Error RPC get_complaints_in_bbox:",
        error.message || error
      );
      return [] as Hotspot[];
    }

    if (!Array.isArray(data)) return [] as Hotspot[];

    // Optionally filter by status if RPC/view doesn't support status
    const filtered = data.filter(
      (r: any) =>
        !status ||
        status === "all" ||
        (r.status || "").toLowerCase() === status.toLowerCase()
    );

    return filtered
      .filter((r: any) => r.latitude != null && r.longitude != null)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        image_url: r.image_url ?? null,
      }));
  } catch (err) {
    console.error("fetchHotspotsInBBox error:", err);
    return [] as Hotspot[];
  }
}