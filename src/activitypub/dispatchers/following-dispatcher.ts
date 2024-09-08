import type { Federation } from "@fedify/fedify";
import { AP_COLLECTION_WINDOW, isHosted } from "../common.js";
import getPool from "../../repository/pool.js";
import type SsbAbout from "../../ssb/types/about-type.js";



function setFollowingDispatcher(federation: Federation<void>) {
  federation
    .setFollowingDispatcher(
      "/users/{handle}/following",
      async (ctx, handle, cursor) => {
        const about = await isHosted(handle);
        if (about == null) return null;

        const offset = Number.parseInt(cursor);
        const total = await countFollowingsByUserKey(
          about.message.value.author,
        );
        const followings = await getFollowing(
          about.message.value.author,
          offset,
          AP_COLLECTION_WINDOW,
        );
        const items = followings.map((row) => {
            if (row.message.value.content.actorId!=null){
                return new URL(
                    row.message.value.content.actorId
                  );
            }
            return ctx.getActorUri(row.message.value.content.name);
        });
        return {
          items,
          nextCursor: (offset + AP_COLLECTION_WINDOW).toString(),
          totalItems: total,
        };
      },
    )
    .setFirstCursor(async (ctx, handle) => "0")
    .setLastCursor(async (ctx, handle) => {
      const total = await countFollowingsByUserHandle(handle);
      // The last cursor is the offset of the last page:
      return (total - (total % AP_COLLECTION_WINDOW)).toString();
    })
    .setCounter(async (ctx, handle) => {
      return await countFollowingsByUserHandle(handle);
    });
}

async function countFollowingsByUserHandle(handle: string) {
  const about = await isHosted(handle);
  return countFollowingsByUserKey(about.message.value.author);
}

async function countFollowingsByUserKey(key: string): Promise<number> {
  const queryParams = [key];
  const query = `
with 
--- get all contact messages for user key
contacts as (                                   
    select                                                                                                                                                          
        message->'value'->>'sequence' as sequence,  
        message->'value'->'content'->>'contact' as contact, 
        message->'value'->'content'->>'following' as following
    from message 
    where 
        message->'value'->'content'->>'type' = 'contact' 
        and message->'value'->>'author' = $1
),
--- get last contact status for each contact
lastcontact as (
    select max(sequence) as sequence,contact from contacts group by contact
)
--- check last contact is a following=true
select count(*) as count
from  contacts as c 
    inner join lastcontact  as l on  c.sequence=l.sequence and c.contact = l.contact
    and following = 'true'
    `;
  const result = await getPool().query(query, queryParams);
  return result.rows[0].count;
}

async function getFollowing(
  key: string,
  offset: number,
  limit: number,
): Promise<SsbAbout[]> {
  const queryParams = [key, offset, limit];

  const query = `
with 
--- get all contact messages for user key
contacts as (                                   
    select                                                                                                                                                          
        message->'value'->>'sequence' as sequence,  
        message->'value'->'content'->>'contact' as contact, 
        message->'value'->'content'->>'following' as following
    from message 
    where 
        message->'value'->'content'->>'type' = 'contact' 
        and $1 = $1
        --- and message->'value'->>'author' = $1
),
--- get last contact status for each contact
lastcontact as (
    select max(sequence) as sequence,contact from contacts group by contact
),
--- check last contact is a following=true
following as (
    select 
        c.contact as contact
    from contacts as c 
    inner join lastcontact  as l on  c.sequence=l.sequence and c.contact = l.contact
    and following = 'true'
),
--- grab last about message for key
lastname as (
    select message->'value'->'content'->>'about' as contact,  max(message->'value'->>'sequence') as sequence 
    from message 
    where message->'value'->'content'->>'about' in (select contact from following)
    group by message->'value'->'content'->>'about'
      )

select message from message as m 
inner join lastname as l on l.sequence=m.message->'value'->>'sequence' and l.contact=m.message->'value'->'content'->>'about'
order by message->'value'->>'sequence' desc limit $3 offset $2;
;
`;
  const result = await getPool().query(query, queryParams);
  return result.rows;
}

export default setFollowingDispatcher;
