import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const listPostsProcedure = publicProcedure
  .input(
    z.object({
      communityId: z.string(),
    })
  )
  .query(async ({ input }) => {
    const { communityId } = input;

    const { data, error } = await supabase
      .from("community_posts")
      .select(`
        *,
        user_profiles(display_name, avatar_url),
        post_reactions(reaction_type, user_id)
      `)
      .eq("community_id", communityId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching posts:", error);
      throw new Error("Failed to fetch posts");
    }

    return data || [];
  });

export default listPostsProcedure;
