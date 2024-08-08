import { InboxListenerSetters } from "@fedify/fedify";

function setErrorListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.onError(async (ctx, error) => {
        console.error(error);
      });
}

export default setErrorListener;