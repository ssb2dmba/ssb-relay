import app from "../../../src/app";
import { test, after } from "node:test";
import { Temporal } from "@js-temporal/polyfill"; // Add this import
import { inboxCreate } from "./create-listener";
import  assert  from "node:assert";
import { Context, Follow, Recipient, Article, PUBLIC_COLLECTION, Create, Note } from "@fedify/fedify";


const create = new Create({
    id: new URL("https://example.com/activities/1s23"),
    actor: new URL("https://toot.cafe/users/aaa"),
    object: new Note({
        id: new URL("https://example.com/notes/456"),
        content: "Hello, world!",
        published: Temporal.Instant.from("2024-01-01T00:00:00Z"),
    }),
});


// test('POST /posts', async () => {
//     const create_json = JSON.stringify(await create.toJsonLd({ expand: true }), null, 4);
//     const res = await app.request("/users/test_user/inbox", {
//         method: 'POST',
//         body: create_json,
//         headers: new Headers({ 'Content-Type': 'application/activity+json', 'accept': 'application/activity+json' }),
//     })
//     console.log(await res.text());
//     assert.equal(res.status, 401);
// });



test('inbox create', async () => {
    const create_json = JSON.stringify(await create.toJsonLd({ expand: true }), null, 4);
    inboxCreate({}, create);

});


after(() => {
    process.exit(0);
});