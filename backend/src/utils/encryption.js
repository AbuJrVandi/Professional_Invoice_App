const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secure-encryption-key-min-32-chars!!'; // 32 bytes
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

function encryptObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const encryptedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && shouldEncryptField(key)) {
      encryptedObj[key] = encrypt(value);
    } else if (typeof value === 'object' && value !== null) {
      encryptedObj[key] = encryptObject(value);
    } else {
      encryptedObj[key] = value;
    }
  }
  return encryptedObj;
}

function decryptObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const decryptedObj = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && shouldEncryptField(key)) {
      try {
        decryptedObj[key] = decrypt(value);
      } catch (error) {
        // If decryption fails, assume the value wasn't encrypted
        decryptedObj[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      decryptedObj[key] = decryptObject(value);
    } else {
      decryptedObj[key] = value;
    }
  }
  return decryptedObj;
}

// Define which fields should be encrypted
function shouldEncryptField(fieldName) {
  const sensitiveFields = [
    'password',
    'phoneNumber',
    'address',
    'creditCardNumber',
    'bankAccount',
    'ssn',
    'taxId',
    'customerName',
    'clientName',
    'companyDetails'
  ];
  return sensitiveFields.includes(fieldName);
}

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  shouldEncryptField
}; 