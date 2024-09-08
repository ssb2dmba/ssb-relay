import type { InboxListenerSetters } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["ssb-relay", "federation"]);

function setErrorListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.onError(async (ctx, error) => {
        logger.error(error.message);
        logger.error(error.stack);
      });
}

export default setErrorListener;