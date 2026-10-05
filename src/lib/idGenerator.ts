/**
 * Collision-resistant ID generation using cryptographically secure random values
 * Prevents ID collisions across concurrent mobile/desktop submissions.
 */

export function generateCollisionResistantId(prefix: string, length = 8): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const raw = crypto.randomUUID().replace(/-/g, '').slice(0, length).toUpperCase();
    return `${prefix}-${raw}`;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const array = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(array);
    const hex = Array.from(array, (byte) => byte.toString(16).padStart(2, '0'))
      .join('')
      .slice(0, length)
      .toUpperCase();
    return `${prefix}-${hex}`;
  }
  const timestamp = Date.now().toString(36).slice(-4).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 2 + length - 4).toUpperCase();
  return `${prefix}-${timestamp}${rand}`;
}

export function generateCardId(): string {
  return generateCollisionResistantId('FSS26', 8);
}

export function generateRegId(): string {
  return generateCollisionResistantId('REG', 8);
}

export function generateOrderId(): string {
  return generateCollisionResistantId('ORD', 8);
}

export function generateBibNumber(): string {
  return generateCollisionResistantId('BIB', 6);
}
