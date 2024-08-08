import { Federation } from "@fedify/fedify";
import { isHosted } from "../common.js";


function setFollowingDispatcher(federation: Federation<void>) {

    federation.setFollowingDispatcher(
        "/users/{handle}/following",
        async (ctx, handle) => {
            const about = await isHosted(handle);
            if (about === false) return null;
            // TODO: return the list of following users
            return { items: [] };
        }
    )
}

export default setFollowingDispatcher;