import type { ActivityPubKeypair } from "../entities/ap-keypair";

export interface ActivityPubKeyPairRepository {
  getActivityPubKeyPairs(handle: string): Promise<ActivityPubKeypair[]>;
  setActivityPubKeyPair (activityPubKeyPair: ActivityPubKeypair): void;
}
