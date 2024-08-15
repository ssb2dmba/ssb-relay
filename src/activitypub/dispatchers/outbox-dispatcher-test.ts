import app from "../../app";
import { test, after } from "node:test";
import { Temporal } from "@js-temporal/polyfill"; // Add this import
import { inboxCreate } from "../listeners/create-listener";
import  assert  from "node:assert";
import { Context, Follow, Recipient, Article, PUBLIC_COLLECTION, Create, Note } from "@fedify/fedify";



test('GET /users/{handle}/outbox ', async () => {
    const res = await app.request("/users/test_user2/outbox", {
        method: 'GET',
        headers: new Headers({ 'Content-Type': 'application/activity+json', 'accept': 'application/activity+json' }),
    })
    console.log(await res.json());
    assert.equal(res.status, 401);
});





after(() => {
    process.exit(0);
});