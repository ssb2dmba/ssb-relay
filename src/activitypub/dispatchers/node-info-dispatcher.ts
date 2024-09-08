import type { Federation } from "@fedify/fedify";


function setNodeInfoDispatcher(federation: Federation<void>) {

    federation.setNodeInfoDispatcher("/nodeinfo/2.1", async (ctx) => {
        return {
          // https://github.com/dahlia/fedify/blob/main/examples/blog/federation/mod.ts#L310
          protocols: ["activitypub"],
        }
      });
}

export default setNodeInfoDispatcher;