import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export const getPartnerEventsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      month: z.number(),
      year: z.number(),
    })
  )
  .query(async ({ input }) => {
    const { userId, month, year } = input;

    const { data: partnership } = await supabase
      .from("partnerships")
      .select("partner1_id, partner2_id")
      .or(`partner1_id.eq.${userId},partner2_id.eq.${userId}`)
      .eq("status", "active")
      .single();

    if (!partnership) {
      return [];
    }

    const partnerId = partnership.partner1_id === userId ? partnership.partner2_id : partnership.partner1_id;

    const startDate = new Date(year, month, 1).toISOString();
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", partnerId)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching partner calendar events:", error);
      return [];
    }

    return data || [];
  });
