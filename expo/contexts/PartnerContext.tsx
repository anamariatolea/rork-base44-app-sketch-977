import createContextHook from '@nkzw/create-context-hook';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';

interface PartnerState {
  isPaired: boolean;
  partnerId: string | null;
  partnerName: string | null;
  partnerEmail: string | null;
  pairingCode: string | null;
  codeExpiresAt: string | null;
  pairedAt: string | null;
  isLoading: boolean;
}

interface PartnerActions {
  generateCode: () => Promise<void>;
  acceptCode: (code: string) => Promise<void>;
  unlinkPartner: () => Promise<void>;
  refreshPartnership: () => Promise<void>;
}

const isBackendAvailable = () => {
  return !!process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
};

export const [PartnerProvider, usePartner] = createContextHook(() => {
  const { user } = useAuth();
  const backendEnabled = isBackendAvailable();

  const partnershipQuery = trpc.partners.getPartnership.useQuery(
    { userId: user?.id || '' },
    {
      enabled: backendEnabled && !!user?.id,
      retry: false,
      retryOnMount: false,
    }
  );

  const generateCodeMutation = trpc.partners.generateCode.useMutation({
    onSuccess: () => {
      if (backendEnabled) {
        partnershipQuery.refetch();
      }
    },
    onError: (error) => {
      console.error('[PartnerContext] Error generating code:', {
        message: error.message,
        data: error.data,
      });
    },
  });

  const acceptCodeMutation = trpc.partners.acceptCode.useMutation({
    onSuccess: () => {
      if (backendEnabled) {
        partnershipQuery.refetch();
      }
    },
    onError: (error) => {
      console.error('[PartnerContext] Error accepting code:', {
        message: error.message,
        data: error.data,
      });
    },
  });

  const unlinkMutation = trpc.partners.unlink.useMutation({
    onSuccess: () => {
      if (backendEnabled) {
        partnershipQuery.refetch();
      }
    },
    onError: (error) => {
      console.error('[PartnerContext] Error unlinking:', {
        message: error.message,
        data: error.data,
      });
    },
  });

  const generateCode = async () => {
    if (!backendEnabled) {
      throw new Error('Backend not available. Partner linking requires backend connection.');
    }
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    try {
      console.log('[PartnerContext] Generating code for user:', user.id);
      await generateCodeMutation.mutateAsync({ userId: user.id });
      console.log('[PartnerContext] Code generated successfully');
    } catch (error) {
      console.error('[PartnerContext] Error generating code:', error);
      throw error;
    }
  };

  const acceptCode = async (code: string) => {
    if (!backendEnabled) {
      throw new Error('Backend not available. Partner linking requires backend connection.');
    }
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await acceptCodeMutation.mutateAsync({ userId: user.id, code });
  };

  const unlinkPartner = async () => {
    if (!backendEnabled) {
      throw new Error('Backend not available. Partner linking requires backend connection.');
    }
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await unlinkMutation.mutateAsync({ userId: user.id });
  };

  const refreshPartnership = async () => {
    if (backendEnabled) {
      await partnershipQuery.refetch();
    }
  };

  const partnership = partnershipQuery.data;

  return {
    isPaired: partnership?.isPaired || false,
    partnerId: (partnership?.isPaired && partnership.partnerId) || null,
    partnerName: (partnership?.isPaired && partnership.partnerName) || null,
    partnerEmail: (partnership?.isPaired && partnership.partnerEmail) || null,
    pairingCode: (!partnership?.isPaired && partnership?.pairingCode) || null,
    codeExpiresAt: (!partnership?.isPaired && partnership?.codeExpiresAt) || null,
    pairedAt: (partnership?.isPaired && partnership.pairedAt) || null,
    isLoading: partnershipQuery.isLoading || generateCodeMutation.isPending || acceptCodeMutation.isPending || unlinkMutation.isPending,
    generateCode,
    acceptCode,
    unlinkPartner,
    refreshPartnership,
  } as PartnerState & PartnerActions;
});
