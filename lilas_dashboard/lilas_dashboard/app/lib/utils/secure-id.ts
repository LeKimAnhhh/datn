import { customAlphabet } from 'nanoid';
import crypto from 'crypto';

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const DEFAULT_SIZE = 21;

/**
 * Generates a cryptographically secure random ID
 * @param size Length of the ID (default: 21)
 * @returns Secure random ID string
 */
export const generateSecureId = (size: number = DEFAULT_SIZE): string => {
  // Validate size is integer and within reasonable bounds
  if (!Number.isInteger(size) || size < 1 || size > 128) {
    size = DEFAULT_SIZE;
  }
  
  const nanoid = customAlphabet(ALPHABET, size);
  return nanoid();
};

/**
 * Generates a cryptographically secure random string
 * @param length Length of the string
 * @returns Secure random string
 */
export const generateSecureString = (length: number = 32): string => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length);
};

/**
 * Generates a secure hash of the input string
 * @param input String to hash
 * @returns Hashed string
 */
export const secureHash = (input: string): string => {
  return crypto
    .createHash('sha256')
    .update(input)
    .digest('hex');
}; 