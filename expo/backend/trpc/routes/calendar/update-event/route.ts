import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export const updateEventProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      location: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { eventId, ...updates } = input;

    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.startTime !== undefined) updateData.start_time = updates.startTime;
    if (updates.endTime !== undefined) updateData.end_time = updates.endTime;
    if (updates.location !== undefined) updateData.location = updates.location;

    const { data, error } = await supabase
      .from("calendar_events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      console.error("Error updating calendar event:", error);
      throw new Error("Failed to update calendar event");
    }

    return data;
  });
