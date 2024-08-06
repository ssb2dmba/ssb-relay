import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
//import SecretStack from "secret-stack";
//import caps from "ssb-caps";
import Config from "ssb-config/inject";
/*
 * This file is part of the ssb-relay distribution (https://github.com/ssb2dmba/ssb-relay).
 * Copyright (c) 2023 DMBA Emmanuel Florent.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import type { Scuttlebot } from "./ssb/types/scuttlebot-type";
const SecretStack = require("secret-stack");
const caps = require("ssb-caps");

export function scuttlebot(): Scuttlebot {
  const config = Config();
  const secretStack = SecretStack({ caps })
    .use(require("ssb-master")) // define ssb.key as our
    .use(require("ssb-logging"))
    .use(require("./ssb/sbot"))
    .use(require("ssb-private1"))
    .use(require("ssb-invite"))
    .use(require("ssb-ws"))
    .use(require("ssb-blobs"));
  return secretStack(config);
}
