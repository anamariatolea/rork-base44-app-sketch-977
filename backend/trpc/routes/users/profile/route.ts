import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const upsertProfileProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      displayName: z.string().optional(),
      avatarUrl: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { userId, displayName, avatarUrl } = input;

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id: userId,
        display_name: displayName,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting profile:", error);
      throw new Error("Failed to update profile");
    }

    return data;
  });

export default upsertProfileProcedure;
