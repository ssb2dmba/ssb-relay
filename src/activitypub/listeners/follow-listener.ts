import { Accept, Follow, InboxListenerSetters, getActorHandle } from "@fedify/fedify";
import { isHosted } from "../common.js";
import { Scuttlebot } from "../../ssb/types/scuttlebot-type.js";
import { SsbKeyPairRepositoryImpl } from "../../repository/ssb-keypair-repository-impl.js";
import ssbFeed from "ssb-feed";

const ssbKeyPairRepositoryImpl = new SsbKeyPairRepositoryImpl();

function setFollowListener(inboxListenerSetter: InboxListenerSetters<void>,
    sbot: Scuttlebot): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Follow, async (ctx, follow) => {
        if (follow.id == null || follow.actorId == null || follow.objectId == null) {
            return;
        }
        const parsed = ctx.parseUri(follow.objectId);
        const followerHandle = await getActorHandle(follow.actorId);
        if (parsed?.type !== "actor" || !isHosted(parsed.handle)) return;
        const follower = await follow.getActor(ctx);
        const keyPair = await ssbKeyPairRepositoryImpl.getSsbKeyPair(followerHandle);

        var feed = ssbFeed(sbot, keyPair)
        feed.publish({
            type: 'contact',
            contact: keyPair.id,
            following: true
        }, function (err) {
            console.error(err);
        });
        feed.publish({
            type: 'about',
            name: follower.name,
            about: keyPair.id,
            description: follower.summary,
        }, function (err) {
            console.error(err);
        });
        await ctx.sendActivity(
            { handle: parsed.handle },
            follower,
            new Accept({ actor: follow.objectId, object: follow }),
        );

    });
}

export default setFollowListener;