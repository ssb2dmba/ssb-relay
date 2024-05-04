const { hash } = require("ssb-keys");

module.exports = function implementation(db) {


    async function insertMessage(pool, message) {
        const text = `
      INSERT INTO message (message)
      VALUES ($1) ON CONFLICT DO NOTHING
    `;

        let result;
        var client = await pool.connect()
        try {
            result = await client.query(text, [message]);
        } finally {
            client.release()
        }
        return result;
    }


    async function deleteMessage(pool, key) {
        const text = "delete from message where message->>'key' = ($1)";
        return await pool.query(text, [key]);
    }

    function isFirstMsgForBlob(db, msgId, blobHash) {
        const text = "select * from message where message->'content'->>'blob' = ($1) order by message->'timestamp' asc limit 1";
        return db.pool.query(text, [blobHash]).then(res => {
            if (res.rowCount >= 1) {
                return res.rows[0].key == msgId
            } else {
                return false
            }
        }).catch(err => {
            console.log(err)
            return false
        })
    }


    db.delete = async function (key, cb) {
        try {
            let data = await deleteMessage(db.pool, key);
            cb(null, data)
        } catch (e) {
            cb(e, null)
        }
    }

    // spip-03: message deletion
    // https://dmba.info/specs/spip-03.html
    function handlePostDelete(db, data) {
        if (data.value.content.type == "post-delete"
            && data.value.content.mentions.length > 0
            && data.value.content.mentions[0].link.startsWith("%")) {
            var target = data.value.content.mentions[0].link
            // find the target and delete it and its blobs
            db.get(target, (err, msg) => {
                if (err) {
                    console.log(err);
                    return
                }
                if (msg==null || Object.keys(msg).length === 0) return
                // delete the blobs of the message
                if (msg.content.mentions) {
                    for (let mention of msg.content.mentions) {
                        var hash = mention.link
                        if (hash.startsWith("&") && isFirstMsgForBlob(db, msg, hash)) {
                            db.sbot.blobs.rm(hash, (err, has) => {
                                // an error is ok here, it means the could have alreay been deleted
                            })
                        }
                    }
                }
                // delete the message
                db.delete(target, (err, data) => {
                    if (err) console.log(err)
                })
            })

        }
    }

    function manageBlob(db, data) {
        if (data.value.content.mentions) {
            for (let mention of data.value.content.mentions) {
                var hash = mention.link
                if (!hash.startsWith("&")) return
                db.sbot.blobs.has(hash, function (err, has) {
                    if (err) {
                        console.log(err)
                        return
                    }
                    if (!has) {
                        db.sbot.blobs.want(mention.link, (err, has) => { })
                    }
                })
            }
        }
    }


    db.add = function (msg, cb) {
        db.queue(msg, async function (err, data) {
            if (err) {
                cb(err)
            } else {
                insertMessage(db.pool, data);
                setTimeout(() => { // setTimeout help test works ...
                    cb(null, data)
                }, 50)
                manageBlob(db, data)

                handlePostDelete(db, data)
            }
        })
    }
    return db;
}
