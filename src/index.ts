import { serve } from "@hono/node-server";
import { configure, getConsoleSink } from "@logtape/logtape";
import app from "./app";
configure({
  sinks: { console: getConsoleSink() },
  filters: {},
  loggers: [
    { category: "fedify", sinks: ["console"], level: "info" },
    { category: [ 'logtape', 'meta'], sinks: ["console"], level: "warning" },
  ],
});
serve(
  {
    port: 8000,
    fetch: app.fetch.bind(app),
  },
  (info) =>
    console.log("Server started at http://" + info.address + ":" + info.port),
);
