import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export const createEventProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      date: z.string(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, title, description, date, startTime, endTime, location } = input;

    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        user_id: userId,
        title,
        description,
        date,
        start_time: startTime,
        end_time: endTime,
        location,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar event:", error);
      throw new Error("Failed to create calendar event");
    }

    return data;
  });
