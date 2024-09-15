import {
  Endpoints,
  type Federation,
  Person,
  generateCryptoKeyPair,
  importJwk,
  exportJwk,
} from "@fedify/fedify";

import { aboutToHandle, isHosted } from "../common.js";
import { ActivityPubKeyPairRepositoryImpl } from "../../repository/ap-keypair-repository-impl.js";
import { ActivityPubKeypair } from "../../entities/ap-keypair.js";
import { Temporal } from "@js-temporal/polyfill";

const activityPubKeyPairRepositoryImpl = new ActivityPubKeyPairRepositoryImpl();

function setActorDispatcher(federation: Federation<void>) {
  federation
    .setActorDispatcher("/users/{handle}", async (ctx, p_handle) => {
      const about = await isHosted(p_handle);
      if (about === null) return null;
      //
      const preferredUsername = about?.message.value.content.name;
      const handle= aboutToHandle(about);
      return new Person({
        id: ctx.getActorUri(p_handle),
        preferredUsername: preferredUsername,
        name: preferredUsername,
        summary: about.message.value.content.description,
        url: new URL(`@${handle}`, ctx.url),
        inbox: ctx.getInboxUri(handle),
        followers: ctx.getFollowersUri(handle),
        following: ctx.getFollowingUri(handle),
        outbox: ctx.getOutboxUri(handle),
        publicKeys: (await ctx.getActorKeyPairs(handle)).map(
          (keyPair) => keyPair.cryptographicKey,
        ),
        endpoints: new Endpoints({ sharedInbox: ctx.getInboxUri() }),
        assertionMethod: (await ctx.getActorKeyPairs(handle))
          .map((pair) => pair.multikey)
          .pop(),
        icon: new URL(`@${handle}/icon`, ctx.url),
        published: Temporal.Instant.fromEpochMilliseconds(
          about.message.value.timestamp,
        ),
        alias: new URL(handle, ctx.url),
        manuallyApprovesFollowers: false,
      })
    })
    .mapHandle(async (ctx, username) => {
      const about = await isHosted(username);
      const handle= aboutToHandle(about);
      console.log("mapped handle to",username, handle);
      return handle;
    })

    .setKeyPairsDispatcher(async (_ctx, p_handle) => {
      const about = await isHosted(p_handle);
      if (about === null) return [];
      const handle= aboutToHandle(about);
      const result: CryptoKeyPair[] = [];

      let apKeyPairentries =
        await activityPubKeyPairRepositoryImpl.getActivityPubKeyPairs(handle);
      if (apKeyPairentries.length === 0) {
        console.log("not found generating new keypair", handle);
        const rsa = await generateCryptoKeyPair("RSASSA-PKCS1-v1_5");
        activityPubKeyPairRepositoryImpl.setActivityPubKeyPair(
          await ActivityPubKeypair.fromCryptoKeyPair(
            handle,
            rsa.publicKey,
            rsa.privateKey,
          ),
        );
        const ed25519 = await generateCryptoKeyPair("Ed25519");
        activityPubKeyPairRepositoryImpl.setActivityPubKeyPair(
          await ActivityPubKeypair.fromCryptoKeyPair(
            handle,
            ed25519.publicKey,
            ed25519.privateKey,
          ),
        );
        apKeyPairentries =
          await activityPubKeyPairRepositoryImpl.getActivityPubKeyPairs(handle);
      }
      for (const apKeyPairentry of apKeyPairentries) {
        result.push({
          privateKey: await importJwk(
            JSON.parse(apKeyPairentry.privateKey),
            "private",
          ),
          publicKey: await importJwk(
            JSON.parse(apKeyPairentry.publicKey),
            "public",
          ),
        });
      }
      return result;
    });
}

export default setActorDispatcher;
