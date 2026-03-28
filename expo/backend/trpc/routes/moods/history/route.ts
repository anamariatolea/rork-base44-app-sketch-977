import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";

export const getMoodHistoryProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      limit: z.number().optional().default(50),
    })
  )
  .query(async ({ input }) => {
    const { userId, limit } = input;

    const { data, error } = await supabase
      .from("mood_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching mood history:", error);
      throw new Error("Failed to fetch mood history");
    }

    return data || [];
  });
