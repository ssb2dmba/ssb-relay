import {
  Article,
  Collection,
  CollectionPage,
  PUBLIC_COLLECTION,
  type RequestContext,
  type Federation,
} from "@fedify/fedify";
import { base64ToHex, decodeSsbMessageURI, encodeSsbMessageURI, getContentHtml, isHosted } from "../common.js";
import getPool from "../../repository/pool.js";
import type SsbPost from "../../ssb/types/post-type.ts";
import { Temporal } from "@js-temporal/polyfill";


const window = 10;

function setObjectDispatcher(federation: Federation<void>) {
  federation.setObjectDispatcher(
    Article,
    "/posts/{uuid}",
    async (ctx, { uuid }) => {
      const key = decodeSsbMessageURI(uuid);
      const post = await getPost(key);
      if (post == null) return null;
      const comments = await getComments(post.key);
      return await toArticle(ctx, post, comments);
    },
  );

  async function getPost(key: string): Promise<SsbPost | null> {

    const params = [key];
    const query = `select * from message where message->>'key' = $1;`;
    const result = await getPool().query(query, params);
    if (result.rowCount === 0) return null;
    return result.rows[0].message;
  }

  async function toArticle(
    context: RequestContext<void>,
    ssbPost: SsbPost,
    comments: Array<SsbPost>,
  ) {
    //const id = btoa(ssbPost.key).replace("==", "");
    const id = encodeSsbMessageURI(ssbPost.key);
    const url = new URL(`/posts/${id}`, context.url);
    const attribution = ssbPost.value.content.attribution
      ? new URL(ssbPost.value.content.attribution)
      : context.getActorUri(
        base64ToHex(ssbPost.value.author.substring(1).replace(".ed25519", "")),
        );
    //const attribution= base64ToHex(ssbPost.value.author.substring(1).replace(".ed25519", ""))
    // TODO handle messages with mentions only.
    return new Article({
      id: url,
      attribution: attribution,
      to: PUBLIC_COLLECTION,
      summary: ssbPost.value.content.summary,
      content: getContentHtml(ssbPost.value.content.text),
      published: Temporal.Instant.fromEpochMilliseconds(ssbPost.value.timestamp),
      url,
      replies: new Collection({
        first: new CollectionPage({
          items: comments.map((c) => new URL(btoa(c.key).replace("==", ""),context.url)),
        }),
      }),
    });
  }

  async function getLocalHandleForMessage(key: string): Promise<string> {
    const params = [key];
    const query =
      "select * from message where message->'value'->'content'->>'type'='about' and message->'value'->'content'->>'about'= $1 order by message->'value'->>'sequence' desc limit 1;";
    const result = await getPool().query(query, params);
    if (result.rowCount === 0) return null;
    return result.rows[0].message.value.content.name;
  }

  async function getComments(key: string): Promise<SsbPost[]> {
    const params = [key];
    const query="select * from message where message->'value'->'content'->>'root'= $1 or message->'value'->'content'->>'branch'= $1 order by message->>'timestamp' desc;";
    const result = await getPool().query(query, params);
    return result.rows;
  }


}

export default setObjectDispatcher;
