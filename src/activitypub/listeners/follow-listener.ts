import { Accept, Federation, Follow, InboxListenerSetters } from "@fedify/fedify";
import { isHosted } from "../common.js";

function setFollowListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Follow, async (ctx, follow) => {
            if (follow.id == null || follow.actorId == null || follow.objectId == null) {
                return;
            }
            const parsed = ctx.parseUri(follow.objectId);
            if (parsed?.type !== "actor" || isHosted(parsed.handle)) return;
            const follower = await follow.getActor(ctx);
            console.debug(follower);
            await ctx.sendActivity(
                { handle: parsed.handle },
                follower,
                new Accept({ actor: follow.objectId, object: follow }),
              );
            // TODO store follower in database or in sbot ?              
        });
}

export default setFollowListener;