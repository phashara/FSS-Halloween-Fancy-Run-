// Approved administrative Google accounts in AI Studio and firestore.rules
export const SUPER_ADMIN_EMAILS: string[] = ['phasharak@gmail.com'];
export const FINANCE_ADMIN_EMAILS: string[] = [
  'pattarasiri.tiyanan2012@gmail.com',
  'primratayy14@gmail.com',
];

export const APPROVED_ADMIN_EMAILS: string[] = [
  ...SUPER_ADMIN_EMAILS,
  ...FINANCE_ADMIN_EMAILS,
];

// Backward-compatibility export
export const ADMIN_EMAIL: string = 'phasharak@gmail.com';

export function getAdminRoleForEmail(email: string | null): 'SUPER_ADMIN' | 'OFFICER_FINANCE' | null {
  if (!email) return null;
  const lower = email.trim().toLowerCase();
  if (SUPER_ADMIN_EMAILS.some((e) => e.toLowerCase() === lower)) return 'SUPER_ADMIN';
  if (FINANCE_ADMIN_EMAILS.some((e) => e.toLowerCase() === lower)) return 'OFFICER_FINANCE';
  return null;
}

export function isApprovedAdmin(user: { email: string | null; emailVerified: boolean; providerData: { providerId: string }[] } | null): boolean {
  if (!user || !user.emailVerified || !user.email) return false;
  const lower = user.email.trim().toLowerCase();
  const isApproved = APPROVED_ADMIN_EMAILS.some((e) => e.toLowerCase() === lower);
  return isApproved && user.providerData.some((provider) => provider.providerId === 'google.com');
}
