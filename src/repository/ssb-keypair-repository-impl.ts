import { AppKeypair as AppKeypair } from "../entities/ap-keypair";
import getPool from "./pool";
import { SsbKeyPairRepository } from "./ssb-keypair-repository";
import ssbKeys from "ssb-keys";

export interface SsbIdentity   {
    id: string,
    public: string,
    private: string,
    curve:string
}


export class SsbKeyPairRepositoryImpl implements SsbKeyPairRepository {

  async genSsbKeyPair(handle: string): Promise<SsbIdentity> {
    const identity = ssbKeys.generate();
    await getPool().query(
      "insert into ssb_keypair (handle, public_key, private_key) values ($1, $2, $3)", 
      [handle, identity.public, identity.private]
    ).catch((err) => { 
      console.log(err.toString());
    });
    return {
      id: "@" + identity.public,
      public: identity.public,
      private: identity.private,
      curve: 'ed25519'
    };
  }

  async getSsbKeyPair(handle: string): Promise<SsbIdentity> {
    const dbResponse = await getPool().query("SELECT * FROM ssb_keypair where handle = $1", [handle]).catch((err) => { 
      console.log(err.toString());
    });

    const result = dbResponse.rows.map((item) => {
      const kp= AppKeypair.fromDbRow(item);
      return{
        id: "@" + kp.publicKey,
        public: kp.publicKey,
        private: kp.privateKey,
        curve: 'ed25519'
      };
    });

    if (result.length === 0) {
      return this.genSsbKeyPair(handle);
    }
  }

}
