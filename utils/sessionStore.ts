
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { DatabaseConnectionConfig, DatabaseType } from '@/types/Database'
import crypto from 'crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '10sec'
const ENCRYPTION_KEY = crypto.createHash('sha256').update("gfezP+0e/1IxkhvPWnT8okTSbH0ijfsouCx4O3lwyggLOCbQCZysFJdZsu8eKTLN").digest();

// Utility to encrypt sensitive data
export function encrypt(text: string): { encryptedData: string; iv: string } {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
  };
}


// Utility to decrypt sensitive data
export function decrypt(encryptedData: string, iv: string): string {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    ENCRYPTION_KEY,
    Buffer.from(iv, 'hex')
  );
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}


// Store connection config in an encrypted JWT
export async function storeCredentials(config: DatabaseConnectionConfig): Promise<void> {
  // Encrypt sensitive data based on connection method
  const sensitiveData = config.method === 'url'
    ? { connectionString: config.connectionString }
    : {
        username: config.parameters.username,
        password: config.parameters.password,
      }

  const { encryptedData, iv } = encrypt(JSON.stringify(sensitiveData))
  
  // Create payload with encrypted data and non-sensitive information
  const payload = {
    type: config.type,
    method: config.method,
    // Include non-sensitive data for parameters method
    ...(config.method === 'parameters' && {
      host: config.parameters.host,
      port: config.parameters.port,
      database: config.parameters.database,
    }),
    encryptedData,
    iv
  }

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(new TextEncoder().encode(JWT_SECRET));

  (await cookies()).set('db_credentials', token, {  
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600
  })
}

// Retrieve stored connection config
export async function getStoredCredentials(): Promise<DatabaseConnectionConfig | null> {
  const token = (await cookies()).get('db_credentials')
  if (!token) return null
  
  try {
    const { payload } = await jwtVerify(
      token.value, 
      new TextEncoder().encode(JWT_SECRET)
    ) as { payload: any }
    
    // Decrypt sensitive data
    const decrypted = decrypt(payload.encryptedData, payload.iv)
    const sensitiveData = JSON.parse(decrypted)
    
    if (payload.method === 'url') {
      return {
        type: payload.type as DatabaseType,
        method: 'url',
        connectionString: sensitiveData.connectionString
      }
    } else {
      return {
        type: payload.type as DatabaseType,
        method: 'parameters',
        parameters: {
          host: payload.host,
          port: payload.port,
          database: payload.database,
          username: sensitiveData.username,
          password: sensitiveData.password,
        }
      }
    }
  } catch (error) {
    return null
  }
}

// Clear stored credentials
export async function clearCredentials() {
  (await cookies()).delete('db_credentials')
}