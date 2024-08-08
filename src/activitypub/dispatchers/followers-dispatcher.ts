import { Federation } from "@fedify/fedify";
import { isHosted } from "../common.js";


function setFollowersDispatcher(federation: Federation<void>) {

    federation.setFollowersDispatcher(
        "/users/{handle}/followers",
        async (ctx, handle) => {
            const about = await isHosted(handle);
            if (about === false) return null;
            // TODO: return the list of following users
            return { items: [] };
        }
    )
}

export default setFollowersDispatcher;