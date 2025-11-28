import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const listCommunitiesProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
      myCommunitiesOnly: z.boolean().optional(),
    })
  )
  .query(async ({ input }) => {
    const { userId, myCommunitiesOnly } = input;

    if (myCommunitiesOnly && userId) {
      const { data: memberData } = await supabase
        .from("community_members")
        .select("community_id")
        .eq("user_id", userId);

      const communityIds = memberData?.map((m) => m.community_id) || [];

      const { data, error } = await supabase
        .from("communities")
        .select(`
          *,
          community_members(count),
          community_posts(count)
        `)
        .in("id", communityIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching communities:", error);
        throw new Error("Failed to fetch communities");
      }

      return data || [];
    }

    const { data, error } = await supabase
      .from("communities")
      .select(`
        *,
        community_members(count),
        community_posts(count)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching communities:", error);
      throw new Error("Failed to fetch communities");
    }

    return data || [];
  });

export default listCommunitiesProcedure;
