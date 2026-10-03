import { ShirtSize } from '../types';

export interface OfficialShirtSizeItem {
  size: ShirtSize;
  chestInches: number;
  lengthInches: number;
  chestLabel: string;
  lengthLabel: string;
}

export const OFFICIAL_SHIRT_SIZES: OfficialShirtSizeItem[] = [
  { size: 'SSS', chestInches: 34, lengthInches: 25, chestLabel: '34"', lengthLabel: '25"' },
  { size: 'SS', chestInches: 36, lengthInches: 26, chestLabel: '36"', lengthLabel: '26"' },
  { size: 'S', chestInches: 38, lengthInches: 27, chestLabel: '38"', lengthLabel: '27"' },
  { size: 'M', chestInches: 40, lengthInches: 28, chestLabel: '40"', lengthLabel: '28"' },
  { size: 'L', chestInches: 42, lengthInches: 29, chestLabel: '42"', lengthLabel: '29"' },
  { size: 'XL', chestInches: 44, lengthInches: 30, chestLabel: '44"', lengthLabel: '30"' },
  { size: '2XL', chestInches: 46, lengthInches: 31, chestLabel: '46"', lengthLabel: '31"' },
  { size: '3XL', chestInches: 48, lengthInches: 32, chestLabel: '48"', lengthLabel: '32"' },
  { size: '4XL', chestInches: 50, lengthInches: 32, chestLabel: '50"', lengthLabel: '32"' },
  { size: '5XL', chestInches: 52, lengthInches: 34, chestLabel: '52"', lengthLabel: '34"' },
  { size: '6XL', chestInches: 54, lengthInches: 34, chestLabel: '54"', lengthLabel: '34"' },
  { size: '7XL', chestInches: 56, lengthInches: 35, chestLabel: '56"', lengthLabel: '35"' },
];

export const getShirtSizeDetails = (size: ShirtSize): OfficialShirtSizeItem => {
  const found = OFFICIAL_SHIRT_SIZES.find((s) => s.size === size);
  if (found) return found;
  // Fallback for legacy XS or unmatched
  return { size, chestInches: 34, lengthInches: 25, chestLabel: '34"', lengthLabel: '25"' };
};
