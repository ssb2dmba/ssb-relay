import { Federation } from "@fedify/fedify";


function setNodeInfoDispatcher(federation: Federation<void>) {

    federation.setNodeInfoDispatcher("/nodeinfo/2.1", async (ctx) => {
        return {
          protocols: ["activitypub"],
        }
      });
}

export default setNodeInfoDispatcher;