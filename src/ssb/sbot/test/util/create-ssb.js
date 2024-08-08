
import ssbKeys from "ssb-keys";
//const ssbKeys = require("ssb-keys");
//const path = require("path");
import path from "path";
import os from "os";
//const os = require("os");
//const crypto = require("crypto");
import crypto from "crypto"
//const secretStack = require("secret-stack");
import secretStack from "secret-stack";
//import { ssbDb}  from "../../index.js"
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);

const caps = { shs: crypto.randomBytes(32).toString("base64") };

const randomName = () => crypto.randomBytes(16).toString("hex");

function createSSB(name = randomName(), opts = {}, plugins) {
  const ssbDb = require("../../index.js");
  const stack = secretStack({ caps }).use(ssbDb);
  const dir = path.join(os.tmpdir(), name);

  if (plugins) {
    plugins.forEach((plugin) => stack.use(plugin));
  }

  opts.keys = opts.keys || ssbKeys.generate();
  if (opts.caps) {
    opts.caps = {
      shs: opts.caps.shs || caps.shs,
      sign: opts.caps.sign || null,
    };
  }

  return stack({ ...opts, path: dir });
};

export default createSSB;