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
const pull = require('pull-stream')


export function createNetWorkRules(server: Scuttlebot): object {

    var cbs: any[] = []
    function onReady(fn: any) {
        if (cbs) cbs.push(fn)
        else fn()
    }

    //opinion: servers allow to connect every people he is following
    server.auth.hook(function (fn: Function, args: any) {
        var guest = args[0], cb = args[1]
        fn(guest, function (err: any, auth: any) {          
            if(err||auth) return cb(err, auth)
            if (server.id == guest) {
                console.warn("server aroot authenticating !")
                cb(null, true)
            } else {
                server.isFollowing({ source: server.id, dest: guest }, (err: any, ok: any) => {
                    if (!ok) {
                        console.log("ssb-relay auth hook ignored " + guest);
                        cb()
                    } else {
                        console.log("connection accepted for " + guest);
                        cb(null, true)
                    }
                })
            }
        })
    })
    
    var available = {}, streams = {}

    function createHistoryStreamSink(peer: any) {
        var modern = false
        return pull.drain(function (data: any) {
            server.add(data.value, function (err: any, msg: any) {
                // : bad protocol <- client ban
                console.log(peer.stream.address, err);
            });
        }, function (err: any) {
            console.log(err)
        })
    }

    // opinion: on connect server call for client new message
    server.on('rpc:connect', function (rpc: any, isClient: any) {
        console.log('rpc:connect', rpc.stream.address)
        try {
            server.last.get(rpc.id, function (err: any, sequence: any) {
                if (err) {
                    console.log(err.message)
                    sequence = 0
                }
                pull(
                    rpc.createHistoryStream({
                        id: rpc.id,
                        seq: sequence,
                        live: true
                    }),
                    createHistoryStreamSink(rpc)
                )
            })
        } catch (e) {
            console.log(e)
        }

    })
    
    return server
}
