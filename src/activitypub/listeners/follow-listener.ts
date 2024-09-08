import { Accept, Follow, type InboxListenerSetters } from "@fedify/fedify";
import { isHosted } from "../common.js";

function setFollowListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Follow, async (ctx, follow) => {
        console.log("Follow received");
        console.log(`${follow.actorId} follows ${follow.objectId}`);
        if (follow.id == null || follow.actorId == null || follow.objectId == null) {
            console.log("incomplete follow cancelled:", follow);
                return;
            }
            const parsed = ctx.parseUri(follow.objectId);
            console.log(parsed);

            if (parsed?.type !== "actor" || isHosted(parsed.handle)==null) {
                console.log("Follow cancelled actor is not hosted1:", parsed);
                return;
            }
            const follower = await follow.getActor(ctx);
            console.log(follower);
            await ctx.sendActivity(
                { handle: parsed.handle },
                follower,
                new Accept({ actor: follow.objectId, object: follow }),
              );
            // TODO store follower in database or in sbot ?              
        });
}

export default setFollowListener;