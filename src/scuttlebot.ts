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
import { Scuttlebot } from "./types/scuttlebot-type"

const Config = require('ssb-config/inject')

var SecretStack = require('secret-stack')
var caps = require('ssb-caps')

export function scuttlebot(): Scuttlebot {

    var config = Config()
    var secretStack =  SecretStack({ caps })
    .use(require('ssb-logging'))    
    .use(require('../../ssb-postgres'))
    .use(require('ssb-private1'))
    .use(require('ssb-master'))
    .use(require('ssb-invite'))
    .use(require('ssb-ws'))
    return secretStack(config)

}
