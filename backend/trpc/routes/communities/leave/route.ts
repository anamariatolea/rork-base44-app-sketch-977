import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const leaveCommunityProcedure = publicProcedure
  .input(
    z.object({
      communityId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { communityId, userId } = input;

    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("community_id", communityId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error leaving community:", error);
      throw new Error("Failed to leave community");
    }

    return { success: true };
  });

export default leaveCommunityProcedure;
