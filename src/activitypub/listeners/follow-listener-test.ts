import app from "../../app";
import { test, after } from "node:test";
import { Temporal } from "@js-temporal/polyfill"; // Add this import
import { inboxCreate } from "./create-listener";
import  assert  from "node:assert";
import { Context, Follow, Recipient, Article, PUBLIC_COLLECTION, Create, Note } from "@fedify/fedify";


const follow = new Follow({
        id: new URL("https://example.com/follows/1"),
        actor: new URL("https://mastodon.social/users/alice"),
        object: new URL("https://mastodon.social/users/bob")
});


test('POST /posts', async () => {
    const create_json = JSON.stringify(await follow.toJsonLd({ expand: true }), null, 4);
    const res = await app.request("/users/test_user2/inbox", {
        method: 'POST',
        body: create_json,
        headers: new Headers({ 'Content-Type': 'application/activity+json', 'accept': 'application/activity+json' }),
    })
    console.log(res);
    console.log(await res.text());
    assert.equal(res.status, 401);
});





after(() => {
    process.exit(0);
});