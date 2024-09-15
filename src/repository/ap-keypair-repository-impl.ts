import { ActivityPubKeypair } from "../entities/ap-keypair";
import getPool from "../repository/pool";
import type { ActivityPubKeyPairRepository } from "./ap-keypair-repository";

export class ActivityPubKeyPairRepositoryImpl implements ActivityPubKeyPairRepository {

  async setActivityPubKeyPair(keyPair: ActivityPubKeypair): Promise<void> {
    await getPool().query(
      "insert into ap_keypair (handle, public_key, private_key) values ($1, $2, $3)", 
      [keyPair.handle, keyPair.publicKey, keyPair.privateKey]
    ).catch((err) => { 
      console.log(err.toString());
    });
  }

  async getActivityPubKeyPairs(handle: string): Promise<ActivityPubKeypair[]> {
    const dbResponse = await getPool().query("SELECT * FROM ap_keypair where handle = $1", [handle])
    const result: ActivityPubKeypair[] = [];
    dbResponse.rows.map((item) => {
      result.push(ActivityPubKeypair.fromDbRow(item));
    });
    // put the rsa key in first (longuest pk)
    result.sort((b, a) => a.publicKey.length - b.publicKey.length);
    return result;
  }

}
