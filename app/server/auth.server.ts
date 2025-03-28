import { randomBytes, pbkdf2 } from 'node:crypto';
import config from './config.server';

export function newSalt(): string {
  return randomBytes(config.auth.saltLengthBytes).toString('hex');
}

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    pbkdf2(
      password,
      salt,
      config.auth.iterations,
      config.auth.keyLengthBytes,
      'sha512',
      (err, hash) => {
        if (err == null) {
          resolve(hash.toString('hex'));
        } else {
          reject(err);
        }
      },
    );
  });
}
