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
 * Fetch hotspots from Supabase complaints table
 */
export async function fetchHotspots(status: string = "all", municipalId?: string) {
  try {
    let query = supabase
      .from("complaints")
      .select("id, title, status, latitude, longitude, municipal_id");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (municipalId) {
      query = query.eq("municipal_id", municipalId);
    }

    const { data, error } = await query;

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
        image_url: null,
      }));

    return rows;
  } catch (err) {
    console.error("fetchHotspots error:", err);
    return [] as Hotspot[];
  }
}

/**
 * Fetch hotspots inside a bounding box from Supabase complaints table
 */
export async function fetchHotspotsInBBox(
  status: string = "all",
  bbox?: { min_lat: number; min_lng: number; max_lat: number; max_lng: number },
  municipalId?: string
) {
  try {
    if (!bbox) return fetchHotspots(status, municipalId);

    let query: any = supabase
      .from("complaints")
      .select("id, title, status, latitude, longitude, municipal_id")
      .gte("latitude", bbox.min_lat)
      .lte("latitude", bbox.max_lat)
      .gte("longitude", bbox.min_lng)
      .lte("longitude", bbox.max_lng);

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (municipalId) {
      query = query.eq("municipal_id", municipalId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching hotspots in bbox:", error.message || error);
      return [] as Hotspot[];
    }

    if (!Array.isArray(data)) return [] as Hotspot[];

    return (data as any[])
      .filter((r: any) => r?.latitude != null && r?.longitude != null)
      .map((r: any) => ({
        id: r.id,
        title: r.title,
        status: r.status,
        latitude: Number(r.latitude),
        longitude: Number(r.longitude),
        image_url: null,
      }));
  } catch (err) {
    console.error("fetchHotspotsInBBox error:", err);
    return [] as Hotspot[];
  }
}