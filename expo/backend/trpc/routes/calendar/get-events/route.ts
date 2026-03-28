import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export const getEventsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      month: z.number(),
      year: z.number(),
    })
  )
  .query(async ({ input }) => {
    const { userId, month, year } = input;

    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching calendar events:", error);
      throw new Error("Failed to fetch calendar events");
    }

    return data || [];
  });
