// Deployment must set the approved Google account in this file AND firestore.rules.
export const ADMIN_EMAIL: string = 'phasharak@gmail.com';

export function isApprovedAdmin(user: { email: string | null; emailVerified: boolean; providerData: { providerId: string }[] } | null): boolean {
  return !!user && !!ADMIN_EMAIL && user.emailVerified && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
    && user.providerData.some((provider) => provider.providerId === 'google.com');
}
