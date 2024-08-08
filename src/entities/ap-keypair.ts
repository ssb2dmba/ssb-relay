import { exportJwk } from "@fedify/fedify";

export class ActivityPubKeypair {
    handle: string;
    publicKey: string;
    privateKey: string;

    
    constructor(handle: string, publicKey: string, privateKey: string) {
        this.handle = handle;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    static fromDbRow(row: any) {
        return new ActivityPubKeypair(row.handle, row.public_key, row.private_key);
    }

    static async fromCryptoKeyPair(handle: string, publicKey: CryptoKey, privateKey: CryptoKey) {
        return new ActivityPubKeypair(
            handle,
            JSON.stringify(await exportJwk(publicKey)),   
            JSON.stringify((await exportJwk(privateKey)))
        )  
    }
}