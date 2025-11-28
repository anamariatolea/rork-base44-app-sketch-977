import { publicProcedure } from "@/backend/trpc/create-context";
import { supabase } from "@/constants/supabase";
import { z } from "zod";

export const createPostProcedure = publicProcedure
  .input(
    z.object({
      communityId: z.string(),
      userId: z.string(),
      caption: z.string().optional(),
      imageUrl: z.string().optional(),
      locationName: z.string().optional(),
      locationLatitude: z.number().optional(),
      locationLongitude: z.number().optional(),
      sharedFrom: z.string().optional(),
      sharedData: z.any().optional(),
    })
  )
  .mutation(async ({ input }) => {
    const {
      communityId,
      userId,
      caption,
      imageUrl,
      locationName,
      locationLatitude,
      locationLongitude,
      sharedFrom,
      sharedData,
    } = input;

    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        community_id: communityId,
        user_id: userId,
        caption,
        image_url: imageUrl,
        location_name: locationName,
        location_latitude: locationLatitude,
        location_longitude: locationLongitude,
        shared_from: sharedFrom,
        shared_data: sharedData,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating post:", error);
      throw new Error("Failed to create post");
    }

    return data;
  });

export default createPostProcedure;
