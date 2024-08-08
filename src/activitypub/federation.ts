import { type Federation, createFederation } from "@fedify/fedify";
import { InProcessMessageQueue, MemoryKvStore } from "@fedify/fedify";
import type { Scuttlebot } from "../ssb/types/scuttlebot-type";
import setActorDispatcher from "./dispatchers/actor-dispatcher";
import setInboxListener from "./listeners/inbox-listener";
import setFollowListener from "./listeners/follow-listener";
import setCreateListener from "./listeners/create-listener";
import setErrorListener from "./listeners/errors-listener";
import setFollowingDispatcher from "./dispatchers/following-dispatcher";
import setFollowersDispatcher from "./dispatchers/followers-dispatcher";
import setOutBoxDispatcher from "./dispatchers/outbox-dispatcher";
import setNodeInfoDispatcher from "./dispatchers/node-info-dispatcher";
import setUndoListener from "./listeners/undo-listener";

class MyFederation {
  federation: Federation<void>;
  sbot: Scuttlebot;

  constructor(sbot: Scuttlebot) {
    this.sbot = sbot;
    this.init();
  }

  init() {
    // create federation
    this.federation = createFederation({
      kv: new MemoryKvStore(), // TODO: implement PostgresKvStore
      queue: new InProcessMessageQueue(),
      onOutboxError: (error, activity) => {
        console.error("Failed to deliver an activity:", error);
        console.error("Activity:", activity);
      },
    });
    // add listeners
    const inboxListener = setInboxListener(this.federation);
    setCreateListener(inboxListener);
    setFollowListener(inboxListener);
    setUndoListener(inboxListener);
    setErrorListener(inboxListener);
    // add dispatchers
    setFollowingDispatcher(this.federation);
    setFollowersDispatcher(this.federation);
    setNodeInfoDispatcher(this.federation);
    setActorDispatcher(this.federation);
    setOutBoxDispatcher(this.federation);
    return this.federation;
  }

}

export default MyFederation;
