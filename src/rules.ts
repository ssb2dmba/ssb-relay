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
                server.emit('log:warn', ['rootauth', guest])
                cb(null, true)
            } else {
                server.isFollowing({ source: server.id, dest: guest }, (err: any, ok: any) => {
                    if (!ok) {
                        server.emit('log:info',["REJECT", guest]);
                        cb("unauthorized");
                    } else {
                        server.emit('log:info',["auth","authok", guest]);
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
                if (err) {
                    console.log(peer.stream.address, err);
                }
            });
        }, function (err: any) {
            if (err.message !="unexpected hangup") {
                console.log('createHistoryStreamSink',peer.stream.address, err.message)
            }
        })
    }

    // opinion when client terminate receiving his own messages relay query them also
    server.on('db:createHistoryStream', function (id: any, isConnected: any) {
        if (isConnected[0]!=null) {
            var rpc = isConnected[0]
            try {
                server.last.get(rpc.id, function (err: any, message: any) {
                    var sequence = 0
                    if (err || Object.keys(message).length === 0) {
                        sequence = 0
                    } else {
                        sequence = message.sequence
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
                console.log('on db:createHistoryStream',e)
            }
        }
    })
    return server
}
