import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase } from "@/constants/supabase";

export const unlinkPartnerProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[unlinkPartner] Unlinking partner for user:', input.userId);

    const { error } = await supabase
      .from('partnerships')
      .delete()
      .or(`user1_id.eq.${input.userId},user2_id.eq.${input.userId}`);

    if (error) {
      console.error('[unlinkPartner] Error unlinking:', error);
      throw new Error('Failed to unlink partner');
    }

    console.log('[unlinkPartner] Successfully unlinked');
    return { success: true };
  });

export default unlinkPartnerProcedure;
