import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "../../../../lib/supabase";
import { findPartnershipByUserId, getProfile } from "../../../../lib/local-partnerships";

export const getPartnershipProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .query(async ({ input }) => {
    console.log('[getPartnership] Fetching partnership for user:', input.userId);

    if (!isSupabaseConfigured) {
      console.log('[getPartnership] Supabase not configured, using local storage');
      
      const partnership = findPartnershipByUserId(input.userId);
      
      if (!partnership) {
        console.log('[getPartnership] No partnership found (local)');
        return null;
      }

      const partnerId = partnership.user2_id;

      if (!partnerId) {
        console.log('[getPartnership] Partnership exists but not paired yet (local)');
        return {
          isPaired: false,
          pairingCode: partnership.pairing_code,
          codeExpiresAt: partnership.code_expires_at,
        };
      }

      const profile = getProfile(partnerId);

      console.log('[getPartnership] Found partner (local):', partnerId);
      return {
        isPaired: true,
        partnerId,
        partnerEmail: profile?.email || 'partner@example.com',
        partnerName: profile?.display_name || 'Your Partner',
        pairedAt: partnership.paired_at,
      };
    }

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
