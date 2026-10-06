import { describe, expect, it } from 'vitest';
import { ADMIN_EMAIL, isApprovedAdmin } from '../lib/adminPolicy';

describe('Google admin policy', () => {
  const valid = { email: ADMIN_EMAIL, emailVerified: true, providerData: [{providerId: 'google.com'}] };
  it('accepts the approved verified Google identity', () => { expect(isApprovedAdmin(valid)).toBe(true); });
  it('rejects missing identity, other accounts, unverified email and other providers', () => {
    for (const identity of [null, {...valid, email: 'other@example.invalid'}, {...valid, emailVerified: false}, {...valid, providerData: [{providerId: 'password'}]}]) {
      expect(isApprovedAdmin(identity)).toBe(false);
    }
  });
});
