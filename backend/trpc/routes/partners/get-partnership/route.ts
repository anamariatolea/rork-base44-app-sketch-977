import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase } from "@/constants/supabase";

export const getPartnershipProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[getPartnership] Fetching partnership for user:', input.userId);

    const { data: partnership, error } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${input.userId},user2_id.eq.${input.userId}`)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[getPartnership] Error fetching partnership:', error);
      throw new Error('Failed to fetch partnership');
    }

    if (!partnership) {
      console.log('[getPartnership] No partnership found');
      return null;
    }

    const partnerId = partnership.user1_id === input.userId 
      ? partnership.user2_id 
      : partnership.user1_id;

    if (!partnerId) {
      console.log('[getPartnership] Partnership exists but not paired yet');
      return {
        isPaired: false,
        pairingCode: partnership.pairing_code,
        codeExpiresAt: partnership.code_expires_at,
      };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, display_name')
      .eq('id', partnerId)
      .single();

    console.log('[getPartnership] Found partner:', partnerId);
    return {
      isPaired: true,
      partnerId,
      partnerEmail: profile?.email || null,
      partnerName: profile?.display_name || null,
      pairedAt: partnership.paired_at,
    };
  });

export default getPartnershipProcedure;
