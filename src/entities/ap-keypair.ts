import { exportJwk } from "@fedify/fedify";

export class AppKeypair {

    handle: string;
    publicKey: string;
    privateKey: string;
    curve: string;

    
    constructor(handle: string, publicKey: string, privateKey: string) {
        this.handle = handle;
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    static fromDbRow(row: any) {
        return new AppKeypair(row.handle, row.public_key, row.private_key);
    }

    static async fromCryptoKeyPair(handle: string, publicKey: CryptoKey, privateKey: CryptoKey) {
        return new AppKeypair(
            handle,
            JSON.stringify(await exportJwk(publicKey)),   
            JSON.stringify((await exportJwk(privateKey)))
        )  
    }

    static fromSsbKeys(handle: string, identity: any): AppKeypair {
        const kp = new AppKeypair(handle, identity.public, identity.private);
        kp.curve ='ed25519';
        return kp;
    }

}