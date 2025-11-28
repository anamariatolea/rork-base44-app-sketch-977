import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase } from "../../../../lib/supabase";

export const acceptCodeProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
      code: z.string().length(6),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[acceptCode] User', input.userId, 'attempting to use code:', input.code);

    const { data: existingPartnership, error: checkError } = await supabase
      .from('partnerships')
      .select('*')
      .or(`user1_id.eq.${input.userId},user2_id.eq.${input.userId}`);

    if (checkError) {
      console.error('[acceptCode] Error checking existing partnership:', checkError);
      throw new Error('Failed to check partnership status');
    }

    if (existingPartnership && existingPartnership.length > 0) {
      const partnership = existingPartnership[0];
      if (partnership.user2_id) {
        console.log('[acceptCode] User already has a partner');
        throw new Error('You already have a partner. Please unlink first.');
      }
    }

    const { data: codeOwner, error: findError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('pairing_code', input.code)
      .single();

    if (findError || !codeOwner) {
      console.error('[acceptCode] Code not found:', findError);
      throw new Error('Invalid pairing code');
    }

    if (codeOwner.user1_id === input.userId) {
      console.log('[acceptCode] Cannot pair with self');
      throw new Error('You cannot use your own pairing code');
    }

    if (codeOwner.user2_id) {
      console.log('[acceptCode] Code already used');
      throw new Error('This pairing code has already been used');
    }

    const expiresAt = new Date(codeOwner.code_expires_at);
    if (expiresAt < new Date()) {
      console.log('[acceptCode] Code expired');
      throw new Error('This pairing code has expired');
    }

    const { error: updateError } = await supabase
      .from('partnerships')
      .update({
        user2_id: input.userId,
        paired_at: new Date().toISOString(),
      })
      .eq('user1_id', codeOwner.user1_id);

    if (updateError) {
      console.error('[acceptCode] Error updating partnership:', updateError);
      throw new Error('Failed to pair accounts');
    }

    console.log('[acceptCode] Successfully paired users');
    return {
      success: true,
      partnerId: codeOwner.user1_id,
    };
  });

export default acceptCodeProcedure;
