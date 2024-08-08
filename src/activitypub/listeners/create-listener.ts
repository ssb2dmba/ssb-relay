import {  Create, InboxListenerSetters } from "@fedify/fedify";

function createInboxListenerSetter(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Create, async (ctx, create) => {
            // todo: implement this
            // https://github.com/dahlia/fedify/blob/main/examples/blog/federation/mod.ts#L205C2-L205C39
        });
}

export default createInboxListenerSetter;