export interface LocalPartnership {
  user1_id: string;
  user2_id: string | null;
  pairing_code: string;
  code_expires_at: string;
  paired_at: string | null;
}

export interface LocalProfile {
  email: string;
  display_name: string;
}

export const localPartnerships = new Map<string, LocalPartnership>();

export const localProfiles = new Map<string, LocalProfile>();

export function findPartnershipByCode(code: string): { userId: string; partnership: LocalPartnership } | null {
  for (const [userId, partnership] of localPartnerships.entries()) {
    if (partnership.pairing_code === code && !partnership.user2_id) {
      return { userId, partnership };
    }
  }
  return null;
}

export function findPartnershipByUserId(userId: string): LocalPartnership | null {
  return localPartnerships.get(userId) || null;
}

export function deletePartnership(userId: string): void {
  localPartnerships.delete(userId);
}

export function updatePartnership(userId: string, partnership: LocalPartnership): void {
  localPartnerships.set(userId, partnership);
}

export function setProfile(userId: string, profile: LocalProfile): void {
  localProfiles.set(userId, profile);
}

export function getProfile(userId: string): LocalProfile | null {
  return localProfiles.get(userId) || null;
}
