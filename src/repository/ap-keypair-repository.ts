import { AppKeypair } from "../entities/ap-keypair";

export interface ActivityPubKeyPairRepository {
  getActivityPubKeyPair(handle: string): Promise<AppKeypair>;
  setActivityPubKeyPair (activityPubKeyPair: AppKeypair): void;
}
