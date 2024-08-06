import { type Federation, Person, createFederation } from "@fedify/fedify";
import { InProcessMessageQueue, MemoryKvStore } from "@fedify/fedify";
import type { Scuttlebot } from "./ssb/types/scuttlebot-type";

class MyFederation {
  federation: Federation<void>;

  constructor(sbot: Scuttlebot) {
    this.init();
  }

  init() {
    this.federation = createFederation({
      kv: new MemoryKvStore(),
      queue: new InProcessMessageQueue(),
    });
    console.log(typeof this.federation);

    this.federation.setActorDispatcher(
      "/users/{handle}",
      async (ctx, handle) => {
        return new Person({
          id: ctx.getActorUri(handle),
          preferredUsername: handle,
          name: handle,
        });
      },
    );

    return this.federation;
  }
}

export default MyFederation;
