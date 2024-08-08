import { Endpoints, Federation, Multikey, Person, exportJwk, generateCryptoKeyPair, importJwk } from "@fedify/fedify";


import { isHosted } from "../common.js";
import { ActivityPubKeyPairRepositoryImpl } from "../../repository/ap-keypair-repository-impl.js";
import { ActivityPubKeypair } from "../../entities/ap-keypair.js";

const activityPubKeyPairRepositoryImpl = new ActivityPubKeyPairRepositoryImpl();

function setActorDispatcher(federation: Federation<void>) {

    federation.setActorDispatcher(
        "/users/{handle}",
        async (ctx, handle) => {
            const about = await isHosted(handle);
            if (about === false) return null;
            return new Person({
                id: ctx.getActorUri(handle),
                preferredUsername: handle,
                name: handle,
                summary: about.message.value.content.description,
                url: new URL(`@${handle}`, ctx.url),
                inbox: ctx.getInboxUri(handle),
                followers: ctx.getFollowersUri(handle),
                following: ctx.getFollowingUri(handle),
                outbox: ctx.getOutboxUri(handle),                
                publicKeys: (await ctx.getActorKeyPairs(handle))
                    .map(keyPair => keyPair.cryptographicKey),
                endpoints:  new Endpoints({ sharedInbox: ctx.getInboxUri() }),
                assertionMethod:  (await ctx.getActorKeyPairs(handle))
                .map((pair) => pair.multikey).pop(),
                
            });
        },
    ).setKeyPairsDispatcher(async (ctx, handle) => {
        if (!isHosted(handle)) return [];
        const entry = await activityPubKeyPairRepositoryImpl.getActivityPubKeyPair(handle);
        if (!entry) {
            // Generate a new key pair at the first time:
            const { privateKey, publicKey } = await generateCryptoKeyPair("RSASSA-PKCS1-v1_5");
            // Store the generated key pair to the Deno KV database in JWK format:
            activityPubKeyPairRepositoryImpl.setActivityPubKeyPair(
                await ActivityPubKeypair.fromCryptoKeyPair(handle, publicKey, privateKey)
            );
            return [{ privateKey, publicKey }];
        }
        const publicKey = await importJwk(JSON.parse(entry.publicKey), "public");
        const privateKey = await importJwk(JSON.parse(entry.privateKey), "private");
        return [{ privateKey, publicKey }];
    });
}

export default setActorDispatcher;