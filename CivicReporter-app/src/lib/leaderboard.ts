import { supabase } from "./supabase";

export type CityStat = {
  municipal_id?: string;
  name: string;
  state_name?: string;
  total_complaints: number;
  verified_count: number;
  pending_count?: number;
  resolved_count?: number;
  score_percentage: number; // provided by view
};

/**
 * Fetch leaderboard rows from the database view city_leaderboard.
 * The view computes score_percentage server-side.
 */
export async function fetchLeaderboard(): Promise<CityStat[]> {
  const { data, error } = await supabase
    .from("city_leaderboard")
    .select(
      "municipal_id, name, state_name, total_complaints, verified_count, pending_count, resolved_count, score_percentage"
    )
    .order("score_percentage", { ascending: false });

  if (error) {
    console.error("Error fetching leaderboard data:", error.message || error);
    return [];
  }

  if (!Array.isArray(data)) return [];

  // Normalize and coerce values to expected types
  const rows: CityStat[] = data.map((r: any) => ({
    municipal_id: r.municipal_id,
    name: r.name ?? "Unknown",
    state_name: r.state_name,
    total_complaints: Number(r.total_complaints) || 0,
    verified_count: Number(r.verified_count) || 0,
    pending_count: Number(r.pending_count) || 0,
    resolved_count: Number(r.resolved_count) || 0,
    score_percentage: Number(r.score_percentage) || 0,
  }));

  return rows;
}