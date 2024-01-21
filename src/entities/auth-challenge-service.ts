import crypto from 'crypto';

export namespace IAuthenticationService {
    export class AuthChallengeStruct {
        value: {
            nonce: string;
            timestamp: number;
        };
        key: string;

        constructor(key: string) {
            this.value = {
                nonce: crypto.randomBytes(32).toString('hex'),
                timestamp: Date.now()

            }
            this.key = key;
        }
    }


    export type AuthResult = {
        accessToken: string;
    }
    
}

