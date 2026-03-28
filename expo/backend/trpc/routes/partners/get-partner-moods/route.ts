import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";

export const getPartnerMoodsProcedure = publicProcedure
  .input(
    z.object({
      partnerId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[getPartnerMoods] Fetching moods for partner:', input.partnerId);

    const { data: moods, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', input.partnerId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('[getPartnerMoods] Error fetching moods:', error);
      throw new Error('Failed to fetch partner moods');
    }

    console.log('[getPartnerMoods] Found', moods?.length || 0, 'moods');
    return moods || [];
  });

export default getPartnerMoodsProcedure;
