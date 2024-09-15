import { ActivityPubKeypair as AppKeypair } from "../entities/ap-keypair";
import getPool from "../repository/pool";
import type { SsbKeyPairRepository } from "../entities/ssb-keypair-repository";
import ssbKeys from "ssb-keys";
import type {  Person } from "@fedify/fedify";
import ssbFeed from "ssb-feed";
import type { Scuttlebot } from "../ssb/types/scuttlebot-type";
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["ssb-relay", "SsbKeyPairRepositoryImpl"]);

export interface SsbIdentity   {
    id: string,
    public: string,
    private: string,
    curve:string
}


export class SsbKeyPairRepositoryImpl implements SsbKeyPairRepository {

  async genSsbKeyPair(person: Person,sbot:Scuttlebot): Promise<SsbIdentity> {
    const identity = ssbKeys.generate();
    await getPool().query(
      "insert into ssb_keypair (handle, public_key, private_key) values ($1, $2, $3)", 
      [person.id.href, identity.public, identity.private]
    )

    const keyPair = {
        id: `@${identity.public}`,
        public: identity.public,
        private: identity.private,
        curve: 'ed25519'
      };
    const feed = ssbFeed(sbot, keyPair)

    const ssbAbout = {
        type: 'about',
        name: person.preferredUsername,
        about:  `@${identity.public}`,
        description: person.summary,
        actorId: person.id.href,
        inboxId: person.inboxId
    }

    feed.publish(ssbAbout, (err) => {
        if (err) logger.error(err);
    });

    return keyPair;
  }

  async getOrCreateSsbKeyPair(person: Person, sbot: Scuttlebot): Promise<SsbIdentity> {
    const dbResponse = await getPool().query("SELECT * FROM ssb_keypair where handle = $1", [person.id.href]).catch((err) => { 
      logger.error(err.toString());
    });

    const result = dbResponse.rows.map((item) => {
      const kp= AppKeypair.fromDbRow(item);
      return{
        id: `@${kp.publicKey}`,
        public: kp.publicKey,
        private: kp.privateKey,
        curve: 'ed25519'
      };
    });

    if (result.length === 0) {
      return this.genSsbKeyPair(person,sbot);
    }
    return result[0];
  }

}