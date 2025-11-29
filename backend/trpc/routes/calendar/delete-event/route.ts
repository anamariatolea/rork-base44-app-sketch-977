import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/backend/lib/supabase";

export const deleteEventProcedure = publicProcedure
  .input(
    z.object({
      eventId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { eventId } = input;

    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId);

    if (error) {
      console.error("Error deleting calendar event:", error);
      throw new Error("Failed to delete calendar event");
    }

    return { success: true };
  });
