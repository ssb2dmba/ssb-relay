import { Article, Create, InboxListenerSetters, Note } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
import { Temporal } from "temporal-polyfill";

const logger = getLogger(["blog", "federation"]);

function createInboxListenerSetter(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
  return inboxListenerSetter.on(Create, async (ctx, create) => {
    console.debug("Received a Create activity");
    inboxCreate(ctx, create);
  });
};



async function inboxCreate(ctx: any, create: any) {
  const object = await create.getObject(ctx);
  if (object instanceof Note || object instanceof Article) {
    console.log(`Received a Note or Article with the following content: ${object.content}`);
    if (object.id == null || object.content == null) return;
    const author = await object.getAttribution();
    console.log(`The author of the Note or Article is: ${author}`);
    if (
      author == null || author.id == null || author.preferredUsername == null
    ) return;
    // ...
    const comment: Omit<Comment, "postUuid"> = {
      id: object.id.href,
      content: object.content.toString(),
      url: getHref(object.url) ?? object.id.href,
      author: {
        id: author.id.href,
        name: author.name?.toString() ?? author.preferredUsername.toString(),
        handle: `@${author.preferredUsername.toString()}@${author.id.host}`,
        url: getHref(author.url) ?? author.id.href,
      },
      published: create.published ?? Temporal.Now.instant(),
    };
    // Filters only `Note` objects that are in reply to posts in this blog:
    for (const replyTargetId of object.replyTargetIds) {
      const parsed = ctx.parseUri(replyTargetId);
      if (
        parsed == null || parsed.type !== "object" || parsed.class !== Article
      ) continue;
      const postUuid = parsed.values.uuid;
      await addComment({ ...comment, postUuid });
    }
    // ...

  } else {
    logger.getChild("inbox").warn(
      "Unsupported object type ({type}) for Create activity: {object}",
      { type: object?.constructor.name, object },
    );
  }
}

export {  inboxCreate };
export default createInboxListenerSetter;

function getHref(url: any) {
  throw new Error("Function not implemented.");
}
