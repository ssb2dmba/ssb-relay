import { Federation, Activity, Create, Article, PUBLIC_COLLECTION, RequestContext, Collection, CollectionPage } from "@fedify/fedify";
import getPool from "../../repository/pool.js";
import { isHosted } from "../common.js";
import { About } from "../../models/about.js";
import { Post } from "../../models/post.js";
import { Temporal } from "@js-temporal/polyfill";
import markdownIt from "markdown-it";

import { atob }from "b2a";


function setOutBoxDispatcher(federation: Federation<void>) {

    federation.setOutboxDispatcher(
        "/users/{handle}/outbox",
        async (ctx, handle, cursor) => {
            return handleOutbox(ctx, handle, cursor);
        },
    )


    federation.setObjectDispatcher(
        Article,
        "/messages/{uuid}",
        async (ctx, { uuid }) => {
            console.log(atob(uuid));
            const post = await getMessage(atob(uuid));
        
            if (post == null) return null;
            const comments = await getComments(post.message.key);
            const blog = await getAbout(post.message.value.author);
            return toArticle(ctx, blog, post, comments);
        },
    );

}

async function getAbout(author: string) {
    const query = `         
    select * from message 
    where 
        message->'value'->'content'->>'type' = 'about' 
        and message->'value'->>'author'= $1
    order by message->'value'->'sequence' desc limit 1
  `
    const result = await getPool().query(query, [author])
        .catch((err) => { console.error(err); return false; });
    return result.rows[0];

}


async function handleOutbox(ctx: any, handle: any, cursor: any) {
    if (cursor == null) cursor = 0;
    const about = await isHosted(handle);
    const keyOwner = await ctx.getSignedKeyOwner();
    if (about === false) return null;
    const activities: Activity[] = [];
    const messages = await getMessages(about.message.value.author, cursor);
    cursor = cursor + messages.length;
    for await (const message of messages) {
        const comments = await getComments(message.message.key);
        const objectId = btoa(message.message.key).replace(/=/g, "");
        const activity = new Create({
            id: new URL(`/messages/${objectId}#activity`, ctx.request.url),
            actor: ctx.getActorUri(handle),
            to: new URL("https://www.w3.org/ns/activitystreams#Public"),
            object: toArticle(ctx, about, message, comments),
        });
        activities.push(activity);
    }
    return {
        items: activities,
        cursor,
    };
}



function toArticle(context: RequestContext<void>, about: About, post: Post, comments: Post[]): Article {
    const objectId = btoa(post.message.key).replace(/=/g, "");
    const url = new URL(`/messages/${objectId}`, context.url);
    return new Article({
        id: url,
        attribution: context.getActorUri(about.message.value.content.name),
        to: PUBLIC_COLLECTION,
        //summary: post.title,
        content: getContentHtml(post),
        published: Temporal.Instant.fromEpochSeconds(Math.round(post.message.value.timestamp / 1000)),
        url,
        replies: new Collection({
            first: new CollectionPage({
                items: comments.map((c) => new URL(btoa(c.message.key), context.url)),
            }),
        }),
    });
}

export function getContentHtml(post: Post): string {
    const md = markdownIt();
    return md.render(post.message.value.content.text);
}



async function getMessage(key: string): Promise<boolean | any> {
    const query = `
            select message from message 
            where message->>'key' = $1
            `;

    const result = await getPool().query(query, [key]).catch((err) => { console.error(err); return false; });
    return result.rows[0];
}

async function getMessages(author: string, cursor: number): Promise<boolean | any> {
    const query = `
            select message from message 
            where message->'value'->>'author' = $1
            and message->'value'->'content'->>'type' = 'post'
            order by message->'value'->'sequence' desc limit 10 offset $2`;

    const result = await getPool().query(query, [author, cursor]).catch((err) => { console.error(err); return false; });
    return result.rows;
}


async function getComments(key: string): Promise<boolean | any> {
    const query = `
    select 
        * 
        from message 
    where message->'value'->'content'->>'root' = $1  
    order  by message->'value'->'timestamp' desc limit 1000;`;
    const result = await getPool().query(query, [key]).catch((err) => { console.error(err); return false; });
    return result.rows;
}

export { setOutBoxDispatcher, handleOutbox };
