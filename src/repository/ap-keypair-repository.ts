import { ActivityPubKeypair } from "../entities/ap-keypair";

export interface ActivityPubKeyPairRepository {
  getActivityPubKeyPair(handle: string): Promise<ActivityPubKeypair>;
  setActivityPubKeyPair (activityPubKeyPair: ActivityPubKeypair): void;
}
