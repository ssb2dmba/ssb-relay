import { Endpoints, Federation, Multikey, Person, exportJwk, generateCryptoKeyPair, importJwk } from "@fedify/fedify";


import { isHosted } from "../common.js";
import { ActivityPubKeyPairRepositoryImpl } from "../../repository/ap-keypair-repository-impl.js";
import { AppKeypair } from "../../entities/ap-keypair.js";

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
                url: new URL(`${handle}`, ctx.url),
                inbox: ctx.getInboxUri(handle),
                followers: ctx.getFollowersUri(handle),
                following: ctx.getFollowingUri(handle),
                outbox: ctx.getOutboxUri(handle),                
                publicKeys: (await ctx.getActorKeyPairs(handle))
                    .map(keyPair => keyPair.cryptographicKey),
                endpoints:  new Endpoints({ sharedInbox: ctx.getInboxUri() }),
                //assertionMethod:  (await ctx.getActorKeyPairs(handle))
                //.map((pair) => pair.multikey).pop(),
                assertionMethods: (await ctx.getActorKeyPairs(handle))
                .map((pair) => pair.multikey)
                
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
                await AppKeypair.fromCryptoKeyPair(handle, publicKey, privateKey)
            );
            return [{ privateKey, publicKey }];
        }
        const publicKey = await importJwk(JSON.parse(entry.publicKey), "public");
        const privateKey = await importJwk(JSON.parse(entry.privateKey), "private");
        // todo add ed25519
        // https://github.com/dahlia/fedify/blob/caa05f8135ff8d3a10759aa088e7278774e24bde/cli/inbox.tsx#L155C9-L155C48
        return [{ privateKey, publicKey }];
    });
}

export default setActorDispatcher;