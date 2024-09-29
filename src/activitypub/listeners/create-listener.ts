import {
  Article,
  Create,
  type InboxListenerSetters,
  type Link,
  Note,
  type Person,
} from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { SsbKeyPairRepositoryImpl } from "../../entities/ssb-keypair-repository-impl";
import type { Scuttlebot } from "../../ssb/types/scuttlebot-type";
import ssbFeed from "ssb-feed";
import { decodeSsbMessageURI, updateAbout } from "../common";
const logger = getLogger(["ssb-relay", "federation"]);
const ssbKeyPairRepositoryImpl = new SsbKeyPairRepositoryImpl();

function createInboxListenerSetter(
  inboxListenerSetter: InboxListenerSetters<void>,
  sbot: Scuttlebot,
): InboxListenerSetters<void> {
  return inboxListenerSetter.on(Create, async (ctx, create) => {
    const object = await create.getObject(ctx);
    if (object instanceof Note || object instanceof Article) {
      const author = (await object.getAttribution()) as Person;
      if (
        author == null ||
        author.id == null ||
        author.preferredUsername == null
      )
        return;
      // do I block author?
      // do I already have this activity (message.content.id + create index) ?
      // updateAbout(author as Person, sbot); ???
      const keyPair = await ssbKeyPairRepositoryImpl.getOrCreateSsbKeyPair(
        author,
        sbot,
      );
      const feed = ssbFeed(sbot, keyPair);

      const ssbPost = {
        type: "post",
        text: object.contents.toString(),
        summary: object.summary?.toString() ?? null,
        published: create.published.epochMilliseconds,
        root: null,
        branch: null,
        id: object.id.href,
      };
      if (object.replyTargetId?.pathname.endsWith(".sha256")) {
        ssbPost.branch = decodeSsbMessageURI(
          object.replyTargetId.pathname.replace("/posts/", ""),
        );
        // todo check if ssbPost.branch as a root if so use it
        ssbPost.root = decodeSsbMessageURI(
          object.replyTargetId.pathname.replace("/posts/", ""),
        );
      }
      feed.publish(ssbPost, (err) => {
        if (err) logger.error(err);
      });
    } else {
      logger
        .getChild("inbox")
        .warn(
          "Unsupported object type ({type}) for Create activity: {object}",
          { type: object?.constructor.name, object },
        );
    }
  });
}

export default createInboxListenerSetter;
