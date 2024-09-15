import {  type InboxListenerSetters, Undo, Follow } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["ssb-relay", "undo"]);

function setUndoListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Undo, async (ctx, undo) => {
        const activity = await undo.getObject(ctx); // An `Activity` to undo
        if (activity instanceof Follow) {
          if (activity.id == null || activity.actorId == null) return;
          await removeFollower(activity.id.href, activity.actorId.href);
        } else {
          logger.getChild("inbox").warn(
            "Unsupported object type ({type}) for Undo activity: {object}",
            { type: activity?.constructor.name, object: activity },
          );
        }
        });
}

export default setUndoListener;

function removeFollower(href: URL, href1: URL) {
    logger.info("Removing follower", { href, href1 });
}
