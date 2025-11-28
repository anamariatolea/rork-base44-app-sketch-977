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

export const [PartnerProvider, usePartner] = createContextHook(() => {
  const { user } = useAuth();

  const partnershipQuery = trpc.partners.getPartnership.useQuery(
    { userId: user?.id || '' },
    {
      enabled: !!user?.id,
      refetchInterval: 30000,
    }
  );

  const generateCodeMutation = trpc.partners.generateCode.useMutation({
    onSuccess: () => {
      partnershipQuery.refetch();
    },
  });

  const acceptCodeMutation = trpc.partners.acceptCode.useMutation({
    onSuccess: () => {
      partnershipQuery.refetch();
    },
  });

  const unlinkMutation = trpc.partners.unlink.useMutation({
    onSuccess: () => {
      partnershipQuery.refetch();
    },
  });

  const generateCode = async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await generateCodeMutation.mutateAsync({ userId: user.id });
  };

  const acceptCode = async (code: string) => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await acceptCodeMutation.mutateAsync({ userId: user.id, code });
  };

  const unlinkPartner = async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }
    await unlinkMutation.mutateAsync({ userId: user.id });
  };

  const refreshPartnership = async () => {
    await partnershipQuery.refetch();
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
