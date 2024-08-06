import { federation } from "@fedify/fedify/x/hono";
import { Hono } from "hono";
import { SsbBleApplication } from "./api/ble/ssb-ble-application";
import inviteApiHttp from "./api/http/invite";
import MyFederation from "./federation";
import { scuttlebot } from "./scuttlebot";
import { createNetWorkRules } from "./ssb/rules";

const app = new Hono();
const sbot = scuttlebot();
createNetWorkRules(sbot);
//new SsbBleApplication(sbot);
const myFederation = new MyFederation(sbot);
const fedi = myFederation.init();
app.use(federation(myFederation.init(), () => undefined));

app.route("/invite/", inviteApiHttp(sbot));

export default app;
