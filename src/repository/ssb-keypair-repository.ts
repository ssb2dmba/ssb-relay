
import { SsbIdentity } from "./ssb-keypair-repository-impl";

export interface SsbKeyPairRepository {
  getSsbKeyPair(handle: string): Promise<SsbIdentity>;
}
