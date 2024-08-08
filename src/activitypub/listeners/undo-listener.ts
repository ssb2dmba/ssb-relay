import {  InboxListenerSetters, Undo } from "@fedify/fedify";

function setUndoListener(inboxListenerSetter: InboxListenerSetters<void>): InboxListenerSetters<void> {
    return inboxListenerSetter.on(Undo, async (ctx, create) => {
            // todo: implement this
            // https://github.com/dahlia/fedify/blob/7c19a1b1d7361e973c3ba818e46063227e1dfc45/examples/blog/federation/mod.ts#L244
        });
}

export default setUndoListener;