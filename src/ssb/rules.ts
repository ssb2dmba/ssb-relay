/*
 * This file is part of the ssb-relay distribution (https://github.com/ssb2dmba/ssb-relay).
 * Copyright (c) 2023 DMBA Emmanuel Florent.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
//const pull = require("pull-stream");
import pull from "pull-stream";
import type { Scuttlebot } from "./types/scuttlebot-type";
import type SsbPost from "./types/post-type";
import { Article, Create, Note, PUBLIC_COLLECTION, Recipient } from "@fedify/fedify";
import { Temporal } from "@js-temporal/polyfill";
import { base64ToHex, encodeSsbMessageURI } from "../activitypub/common";


// biome-ignore lint/complexity/noBannedTypes: <explanation>
export function createNetWorkRules(server: Scuttlebot, fedi:any): object {
  const cbs: any[] = [];
  function onReady(fn: Function) {
    if (cbs) cbs.push(fn);
    else fn();
  }
  //opinion: servers allow to connect every people he is following
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  server.auth.hook((fn: any, args: any) => {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const guest: any = args[0];
    const cb = args[1];
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    fn(guest, (err: any, auth: any) => {
      if (err || auth) return cb(err, auth);
      if (server.id === guest) {
        server.emit("log:warn", ["rootauth", guest]);
        cb(null, true);
      } else {
        server.isFollowing(
          { source: server.id, dest: guest },
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (err: any, ok: any) => {
            if (!ok) {
              console.error(err);
              server.emit("log:info", ["REJECT", guest]);
              cb("unauthorized");
            } else {
              server.emit("log:info", ["auth", "authok", guest]);
              cb(null, true);
            }
          },
        );
      }
    });
  });

  function createHistoryStreamSink(peer: any) {
    const modern = false;
    return pull.drain(
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (data: any) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        server.add(data.value, (err: any, msg: any) => {
          if (err) {
            console.log(peer.stream.address, err);
          }
        });
      },
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      (err: any) => {
        if (err.message !== "unexpected hangup") {
          console.log(
            "createHistoryStreamSink",
            peer.stream.address,
            err.message,
          );
        }
      },
    );
  }



  server.on("published", async (msg: SsbPost) => {
    const host = `https://${server.config.connections.incoming.net.filter((e) => e.host !== undefined)[0].host}`;
    try {
    const ctx = fedi.createContext(new URL(host), undefined);
    const senderHandle =base64ToHex(msg.value.author.substring(1).replace(".ed25519", ""));
    const msgKey = encodeSsbMessageURI(msg.key);
    await ctx.sendActivity(
      { handle: senderHandle },
      "followers",
      new Create({
        actor: ctx.getActorUri(senderHandle),
        to: PUBLIC_COLLECTION,
        cc: ctx.getFollowersUri(senderHandle),
        id: new URL(`${host}/posts/${msgKey}#activity`),
        published: Temporal.Now.instant(),
        object: new Note({
          id: new URL(`${host}/posts/${msgKey}`),
          attribution: ctx.getActorUri(senderHandle),
          to: PUBLIC_COLLECTION,
          cc: ctx.getFollowersUri(senderHandle),
          //summary: msg.value.content.text,
          sensitive: false,
          attachments: null,
          published: Temporal.Now.instant(),
          url: new URL(`${host}/posts/${msgKey}`),
          content: msg.value.content.text,
          mediaType: "text/html",
        }),
      }),
      { 
        immediate: true,
        excludeBaseUris: [new URL(host)],
        preferSharedInbox: true 

      },  
    );
    } catch (e) {
      console.log(e);
    }
  });


  // opinion when client terminate receiving his own messages relay query them also
  // opinion: on connect server call for client new message
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  server.on("rpc:connect", (rpc: any, isClient: any) => {
   if (rpc.stream === undefined) return;
    try {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      server.last.get(rpc.id, (err: any, message: any) => {
        let sequence = 0;
        if (err || Object.keys(message).length === 0) {
          sequence = 0;
        } else {
          sequence = message.value.sequence;
        }
        pull(
          rpc.createHistoryStream({
            id: rpc.id,
            seq: sequence,
            live: false,
          }),
          createHistoryStreamSink(rpc),
        );
      });
    } catch (e) {
      console.log("rpc:connect", e);
    }
  });
  return server;
}
