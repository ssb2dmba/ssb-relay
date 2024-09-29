import { Article, Create, type Federation } from "@fedify/fedify";
import { AP_COLLECTION_WINDOW, encodeSsbMessageURI, getContentHtml, isHosted } from "../common.js";
import getPool from "../../repository/pool.js";


function setOutBoxDispatcher(federation: Federation<void>) {

    federation.setOutboxDispatcher(
        "/users/{handle}/outbox",
        async (ctx, handle, cursor) => {
            const offset= Number.parseInt(cursor);
            const about = await isHosted(handle);
            if (about === null) return null;
            const total = await countPostsByUserKey(about.value.author);
            const posts = await getPostsByUserKey(
                about.value.author,
                { offset, limit: AP_COLLECTION_WINDOW }
              );
            const items = posts.map(row =>  {
                const id = encodeSsbMessageURI(row.key);
                return new Create({
                  id: new URL(`/posts/${id}#activity`, ctx.url),
                  actor: ctx.getActorUri(handle),
                  object: new Article({
                    id: new URL(`/posts/${id}`, ctx.url),
                    summary: row.value.content.summary,
                    content: getContentHtml(row.value.content.text)
                  }),
                })
            }
            
              );
              return { items, nextCursor: (offset + AP_COLLECTION_WINDOW).toString(), totalItems: total };
        },
    )
    .setFirstCursor(async (_ctx, _handle) => "0")
    .setLastCursor(async (_ctx, handle) => {
        const total = await countPostsByUserHandle(handle);
        return (total - (total % AP_COLLECTION_WINDOW)).toString();
      })
      .setCounter(async (ctx, handle) => {
        return await countPostsByUserHandle(handle);
      })
}

async function countPostsByUserHandle(handle: string) {
    const about = await isHosted(handle);
    return countPostsByUserKey(about.value.author);
}

async function countPostsByUserKey(key: string) : Promise<number>  {
        const queryParams = [key];
        const query = `select count(*) from message where message->'value'->'content'->>'type'='post' and message->'value'->>'author'= $1;`;
        const result = await getPool().query(query, queryParams);
        return result.rows[0].count;
}


async function getPostsByUserKey(author: string, opts: { offset: number; limit: number; }) {

    const queryParams = [author, opts.limit, opts.offset];
    const query = "select * from message where message->'value'->'content'->>'type'='post' and message->'value'->>'author'= $1 order by message->'value'->'sequence' desc limit $2 offset $3;";
    const result = await getPool().query(query, queryParams);
    return result.rows.map(row => row.message);
}


export default setOutBoxDispatcher;