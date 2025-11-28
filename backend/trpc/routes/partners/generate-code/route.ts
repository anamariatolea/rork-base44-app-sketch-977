import { publicProcedure } from "../../../create-context";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from "../../../../lib/supabase";

function generatePairingCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const generateCodeProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string(),
    })
  )
  .mutation(async ({ input }) => {
    console.log('[generateCode] Starting for user:', input.userId);

    if (!isSupabaseConfigured) {
      console.error('[generateCode] Supabase not configured');
      throw new Error('Database not configured. Please set up Supabase credentials in your environment variables.');
    }

    const code = generatePairingCode();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const { data: existingPartnership, error: checkError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('user1_id', input.userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[generateCode] Error checking existing partnership:', checkError);
      throw new Error('Failed to check partnership status');
    }

    if (existingPartnership && existingPartnership.user2_id) {
      console.log('[generateCode] User already has a partner');
      throw new Error('You already have a partner. Please unlink first.');
    }

    const { error: upsertError } = await supabase
      .from('partnerships')
      .upsert({
        user1_id: input.userId,
        pairing_code: code,
        code_expires_at: expiresAt.toISOString(),
        user2_id: null,
      }, {
        onConflict: 'user1_id'
      });

    if (upsertError) {
      console.error('[generateCode] Error upserting partnership:', upsertError);
      throw new Error('Failed to generate pairing code');
    }

    console.log('[generateCode] Successfully generated code:', code);
    return {
      code,
      expiresAt: expiresAt.toISOString(),
    };
  });

export default generateCodeProcedure;
