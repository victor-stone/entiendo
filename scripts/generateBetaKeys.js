/**
 * Entiendo Beta Key Generator
 *
 * This script exists to securely generate a pair of keys (`testKey` and `betaKey`)
 * for use in the Entiendo application's beta access system. By providing a password,
 * this tool produces a random `testKey` (used as a salt) and a corresponding `betaKey`
 * (a SHA-256 hash of the password and `testKey`). These values can then be stored in
 * the application's settings to enable password-protected beta access, without ever
 * storing or exposing the original password.
 *
 * Usage:
 *   node scripts/generateBetaKeys.js <password>
 *
 * Output:
 *   testKey: <randomly generated hex string>
 *   betaKey: <SHA-256 hash of password + testKey>
 */

import crypto from 'crypto';

function randomHex(bytes = 16) {
  return crypto.randomBytes(bytes).toString('hex');
}

function hashPassword(password, testKey) {
  return crypto
    .createHash('sha256')
    .update(password + testKey)
    .digest('hex');
}

const password = process.argv[2];

if (!password) {
  console.error('Usage: node generateBetaKeys.js <password>');
  process.exit(1);
}

const testKey = randomHex(16);
const betaKey = hashPassword(password, testKey);

console.log(`
    {
        "testKey": "${testKey}",
        "betaKey": "${betaKey}"
    }
`);
