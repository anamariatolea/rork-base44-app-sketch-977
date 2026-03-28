import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";

export const recordMoodProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      mood: z.enum(["happy", "neutral", "sad", "tired", "exciting", "busy"]),
      note: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, mood, note } = input;

    const { data, error } = await supabase
      .from("mood_history")
      .insert({
        user_id: userId,
        mood: mood,
        note: note,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error recording mood:", error);
      throw new Error("Failed to record mood");
    }

    return data;
  });
