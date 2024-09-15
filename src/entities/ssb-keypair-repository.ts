import type { Scuttlebot } from "../ssb/types/scuttlebot-type";
import type { SsbIdentity } from "./ssb-keypair-repository-impl";
import type { Person } from "@fedify/fedify";

export interface SsbKeyPairRepository {
    getOrCreateSsbKeyPair(person: Person, sbot: Scuttlebot): Promise<SsbIdentity>;
}