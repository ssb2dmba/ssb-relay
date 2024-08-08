import { Federation } from "@fedify/fedify";
import { isHosted } from "../common.js";

function setOutBoxDispatcher(federation: Federation<void>) {

    federation.setOutboxDispatcher(
        "/users/{handle}/outbox",
        async (ctx, handle, cursor) => {
            if (cursor == null) return null;
            const about = await isHosted(handle);
            if (about === false) return null;
            // TODO: return the list of outbox items
            return {
                items:  [],
                cursor,
              };
        },
    )
}

export default setOutBoxDispatcher;