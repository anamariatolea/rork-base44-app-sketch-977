import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const reactToPostProcedure = publicProcedure
  .input(
    z.object({
      postId: z.string(),
      userId: z.string(),
      reactionType: z.enum(["heart", "fire", "clap", "laugh", "cry"]),
      remove: z.boolean().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { postId, userId, reactionType, remove } = input;

    if (remove) {
      const { error } = await supabase
        .from("post_reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId)
        .eq("reaction_type", reactionType);

      if (error) {
        console.error("Error removing reaction:", error);
        throw new Error("Failed to remove reaction");
      }

      return { success: true };
    }

    const { data, error } = await supabase
      .from("post_reactions")
      .insert({
        post_id: postId,
        user_id: userId,
        reaction_type: reactionType,
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding reaction:", error);
      throw new Error("Failed to add reaction");
    }

    return data;
  });

export default reactToPostProcedure;
