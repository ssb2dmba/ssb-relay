import { Accept, Follow, type InboxListenerSetters, type Person, getActorHandle } from "@fedify/fedify";
import { isHosted, updateAbout } from "../common.js";
import { getLogger } from "@logtape/logtape";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type.js";
import { SsbKeyPairRepositoryImpl } from "../../entities/ssb-keypair-repository-impl.js";
import ssbFeed from "ssb-feed";
const logger = getLogger(["ssb-relay", "federation"]);
const ssbKeyPairRepositoryImpl = new SsbKeyPairRepositoryImpl();
function setFollowListener(inboxListenerSetter: InboxListenerSetters<void>, sbot: Scuttlebot): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Follow, async (ctx, follow) => {

        if (follow.id == null || follow.actorId == null || follow.objectId == null) {
                logger.warn(`incomplete follow cancelled:${follow}`);
                return;
            }
            console.log(follow.objectId)

            const parsed = ctx.parseUri(follow.objectId);
            const about =await isHosted(parsed.handle);
            if (parsed?.type !== "actor" || about==null) {
                logger.warn("Follow cancelled actor is not hosted1:", parsed);
                return;
            }
            const follower = await follow.getActor(ctx);

            const keyPair = await ssbKeyPairRepositoryImpl.getOrCreateSsbKeyPair(follower as Person, sbot);

            const feed = ssbFeed(sbot, keyPair)
            updateAbout(follower as Person, sbot);
            feed.publish({
                type: 'contact',
                contact: keyPair.id,
                following: true
            }, (err) => {
                if (err) console.log(err);
            });

            const handle = btoa(about?.message.value.author).replace("=","");
            console.log(handle)
            console.log("================")
            await ctx.sendActivity(
                { handle: handle },
                follower,
                new Accept({ actor: follow.objectId, object: follow }),
              );         
        });
}

export default setFollowListener;


