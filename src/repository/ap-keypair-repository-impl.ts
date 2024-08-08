import { ActivityPubKeypair } from "../entities/ap-keypair";
import getPool from "../repository/pool";
import { ActivityPubKeyPairRepository } from "./ap-keypair-repository";

export class ActivityPubKeyPairRepositoryImpl implements ActivityPubKeyPairRepository {

  async setActivityPubKeyPair(keyPair: ActivityPubKeypair): Promise<void> {
    await getPool().query(
      "insert into ap_keypair (handle, public_key, private_key) values ($1, $2, $3)", 
      [keyPair.handle, keyPair.publicKey, keyPair.privateKey]
    ).catch((err) => { 
      console.log(err.toString());
    });
  }

  async getActivityPubKeyPair(handle: string): Promise<ActivityPubKeypair> {
    const dbResponse = await getPool().query("SELECT * FROM ap_keypair where handle = $1", [handle]).catch((err) => { 
      console.log(err.toString());
    });

    const result = dbResponse.rows.map((item) => {
      return ActivityPubKeypair.fromDbRow(item);
    });

    if (result.length === 0) {
      return null;
    }
    return result[0];
  }

}
