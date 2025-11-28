import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const joinCommunityProcedure = publicProcedure
  .input(
    z.object({
      communityId: z.string(),
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    const { communityId, userId } = input;

    const { data, error } = await supabase
      .from("community_members")
      .insert({
        community_id: communityId,
        user_id: userId,
        role: "member",
      })
      .select()
      .single();

    if (error) {
      console.error("Error joining community:", error);
      throw new Error("Failed to join community");
    }

    return data;
  });

export default joinCommunityProcedure;
