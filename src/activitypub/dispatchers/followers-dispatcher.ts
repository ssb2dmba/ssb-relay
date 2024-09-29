import type { Federation, Recipient } from "@fedify/fedify";
import { AP_COLLECTION_WINDOW, isHosted } from "../common.js";
import type SsbAbout from "../../ssb/types/about-type.js";
import getPool from "../../repository/pool.js";
import { getLogger } from "@logtape/logtape";

const logger = getLogger(["ssb-relay", "federation"]);

function setFollowersDispatcher(federation: Federation<void>) {
  federation
    .setFollowersDispatcher(
      "/users/{handle}/followers",
      async (ctx, handle, cursor="0") => {
        const about = await isHosted(handle);
        if (about === null) return null;
        if (cursor === null) cursor = "0";
        const offset = Number.parseInt(cursor);
        const total = await countFollowersByUserKey(about.value.author);
        const followers = await getFollowing(
          about.value.author,
          offset,
          AP_COLLECTION_WINDOW,
        );
        const items: Recipient[] = followers.map((row) => {
          if (
            row.value.content.actorId != null &&
            row.value.content.inboxId != null
          ) {
            return {
              id: new URL(row.value.content.actorId),
              inboxId: new URL(row.value.content.inboxId), // The URI of the actor's inbox.
            };
          }
          if (isHosted(row.value.content.name)) {
            return {
              id: ctx.getActorUri(row.value.content.name),
              inboxId: ctx.getInboxUri(row.value.content.name),
            };
          }
          logger.error("No actorId or inboxId found in about message and actor is not hosted");
        });
        return {
          items,
          nextCursor: (offset + AP_COLLECTION_WINDOW).toString(),
          totalItems: total,
        };
      },
    )
    .setFirstCursor(async (_ctx, _handle) => "0")
    .setLastCursor(async (_ctx, handle) => {
      const total = await countFollowersByUserHandle(handle);
      // The last cursor is the offset of the last page:
      return (total - (total % AP_COLLECTION_WINDOW)).toString();
    })
    .setCounter(async (_ctx, handle) => {
      return await countFollowersByUserHandle(handle);
    });
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
          message->'value'->>'author' as author, 
          message->'value'->'content'->>'following' as following
      from message 
      where 
          message->'value'->'content'->>'type' = 'contact' 
          and message->'value'->'content'->>'contact'  = $1
  ),
  --- get last contact status for each contact
  lastcontact as (
      select max(sequence) as sequence,author from contacts group by author
  ),
  --- check last contact is a following=true
  following as (
      select 
          c.author as author
      from contacts as c 
      inner join lastcontact  as l on  c.sequence=l.sequence and c.author = l.author
      and following = 'true'
  ),
  --- grab last about message for key
  lastname as (
      select message->'value'->'content'->>'about' as contact,  max(message->'value'->>'sequence') as sequence 
      from message 
      where message->'value'->'content'->>'about' in (select author from following)
      group by message->'value'->'content'->>'about'
        )
  
  select message from message as m 
  inner join lastname as l on l.sequence=m.message->'value'->>'sequence' and l.contact=m.message->'value'->'content'->>'about'
  order by message->'value'->>'sequence' desc limit $3 offset $2;
  ;
  `;
  const result = await getPool().query(query, queryParams);
  return result.rows.map((row) => row.message);
}

async function countFollowersByUserHandle(handle: string) {
  const about = await isHosted(handle);
  return countFollowersByUserKey(about.value.author);
}

async function countFollowersByUserKey(key: string) {
  const queryParams = [key];
  const query = `
  with 
  --- get all contact messages for user key
  contacts as (                                   
      select                                                                                                                                                          
          message->'value'->>'sequence' as sequence,  
          message->'value'->>'author' as author, 
          message->'value'->'content'->>'following' as following
      from message 
      where 
          message->'value'->'content'->>'type' = 'contact' 
          and message->'value'->'content'->>'contact'  = $1
  ),
  --- get last contact status for each contact
  lastcontact as (
      select max(sequence) as sequence,author from contacts group by author
  )
  --- check last contact is a following=true
  select count(*) as count
  from  contacts as c 
      inner join lastcontact  as l on  c.sequence=l.sequence and c.author = l.author
      and following = 'true'
      `;
  const result = await getPool().query(query, queryParams);
  return result.rows[0].count;
}

export default setFollowersDispatcher;
