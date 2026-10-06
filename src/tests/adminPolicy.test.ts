import { describe, expect, it } from 'vitest';
import {
  ADMIN_EMAIL,
  APPROVED_ADMIN_EMAILS,
  isApprovedAdmin,
  getAdminRoleForEmail,
} from '../lib/adminPolicy';

describe('Google admin policy', () => {
  const valid = { email: ADMIN_EMAIL, emailVerified: true, providerData: [{providerId: 'google.com'}] };
  it('accepts all approved verified Google identities', () => {
    for (const email of APPROVED_ADMIN_EMAILS) {
      expect(isApprovedAdmin({ email, emailVerified: true, providerData: [{providerId: 'google.com'}] })).toBe(true);
    }
  });
  it('returns correct roles for super admin and finance admins', () => {
    expect(getAdminRoleForEmail('phasharak@gmail.com')).toBe('SUPER_ADMIN');
    expect(getAdminRoleForEmail('pattarasiri.tiyanan2012@gmail.com')).toBe('OFFICER_FINANCE');
    expect(getAdminRoleForEmail('primratayy14@gmail.com')).toBe('OFFICER_FINANCE');
    expect(getAdminRoleForEmail('stranger@example.invalid')).toBeNull();
  });
  it('rejects missing identity, other accounts, unverified email and other providers', () => {
    for (const identity of [null, {...valid, email: 'other@example.invalid'}, {...valid, emailVerified: false}, {...valid, providerData: [{providerId: 'password'}]}]) {
      expect(isApprovedAdmin(identity)).toBe(false);
    }
  });
});
