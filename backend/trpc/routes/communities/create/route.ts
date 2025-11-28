import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const createCommunityProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      ownerId: z.string(),
      isPrivate: z.boolean().default(false),
    })
  )
  .mutation(async ({ input }) => {
    const { name, description, imageUrl, ownerId, isPrivate } = input;

    const { data, error } = await supabase
      .from("communities")
      .insert({
        name,
        description,
        image_url: imageUrl,
        owner_id: ownerId,
        is_private: isPrivate,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating community:", error);
      throw new Error("Failed to create community");
    }

    return data;
  });

export default createCommunityProcedure;
