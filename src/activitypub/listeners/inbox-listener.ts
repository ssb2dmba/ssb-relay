import { Federation,  InboxListenerSetters } from "@fedify/fedify";

function setInboxListener(federation: Federation<void>): InboxListenerSetters<void> {
    return federation.setInboxListeners("/users/{handle}/inbox", "/inbox");
}

export default setInboxListener;