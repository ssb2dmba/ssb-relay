import {  Article, Create, type InboxListenerSetters, Link, Note } from "@fedify/fedify";
import { Temporal } from "@js-temporal/polyfill";
import { getLogger } from "@logtape/logtape";
import SsbPost from "../../ssb/types/post-type";
const logger = getLogger(["ssb-relay", "federation"]);

function createInboxListenerSetter(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Create, async (ctx, create) => {
            // todo: implement this
            // https://github.com/dahlia/fedify/blob/main/examples/blog/federation/mod.ts#L205C2-L205C39
            const object = await create.getObject(ctx);
            if (object instanceof Note || object instanceof Article) {
                const author = await object.getAttribution();
                if (
                  author == null || author.id == null || author.preferredUsername == null
                ) return;
                // author: {
                //     id: author.id.href,
                //     name: author.name?.toString() ?? author.preferredUsername.toString(),
                //     handle: `@${author.preferredUsername.toString()}@${author.id.host}`,
                //     url: getHref(author.url) ?? author.id.href,
                //   },
                // object.id.href,
                // object.content.toString(),
                // getHref(object.url) ?? object.id.href,
                // create.published ?? Temporal.Now.instant()
            }  else {
                logger.getChild("inbox").warn(
                  "Unsupported object type ({type}) for Create activity: {object}",
                  { type: object?.constructor.name, object },
                );
              }
        });
}

function getHref(link: Link | URL | string | null): string | null {
    if (link == null) return null;
    if (link instanceof Link) return link.href?.href ?? null;
    if (link instanceof URL) return link.href;
    return link;
  }

export default createInboxListenerSetter;