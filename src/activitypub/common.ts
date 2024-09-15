import type { Person } from "@fedify/fedify";
import getPool from "../repository/pool.js";
import type SsbAbout from "../ssb/types/about-type.js";
import markdownIt from "markdown-it";
import type { Scuttlebot } from "../ssb/types/scuttlebot-type.js";
import { SsbKeyPairRepositoryImpl } from "../entities/ssb-keypair-repository-impl.js";
import ssbFeed from "ssb-feed";
import ssbConfig from "ssb-config";
import  memoize  from "fast-memoize";

export const AP_COLLECTION_WINDOW = 10;


const isHosted = memoize(naiveisHosted)

async function naiveisHosted(handle: string): Promise<SsbAbout> {

  const query1 = `
with lastofname as (
    select * from message 
    where 
    message->'value'->'content'->>'type' = 'about' 
    and message->'value'->>'author'=(
        select message->'value'->>'author' from message 
        where message->'value'->'content'->>'type' = 'about' 
        and message->'value'->'content'->>'name'= $1
        order by message->'value'->'sequence' desc limit 1
    ) order by message->'value'->'sequence' desc limit 1
    )
    ,
    contacts as (
        select 
            message->'value'->>'sequence' as sequence,  
            message->'value'->'content'->>'contact' as contact, 
            message->'value'->'content'->>'following' as following
        from message 
        where message->'value'->'content'->>'type' = 'contact' 
        and message->'value'->'content'->>'contact'= (select message->'value'->>'author' from lastofname)
        and message->'value'->>'author' = '@' || '${ssbConfig.keys.public}'
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
    )
    select * from lastofname where message->'value'->>'author' in (select contact from following);
`;

  const query2 = `
with lastofname as (
    select * from message 
    where 
    message->'value'->'content'->>'type' = 'about' 
    and message->'value'->>'author'=(
        select message->'value'->>'author' from message 
        where message->'value'->'content'->>'type' = 'about' 
        and message->'value'->>'author' = $1
        order by message->'value'->'sequence' desc limit 1
    ) order by message->'value'->'sequence' desc limit 1
    )
    ,
    contacts as (
        select 
            message->'value'->>'sequence' as sequence,  
            message->'value'->'content'->>'contact' as contact, 
            message->'value'->'content'->>'following' as following
        from message 
        where message->'value'->'content'->>'type' = 'contact' 
        and message->'value'->'content'->>'contact'= (select message->'value'->>'author' from lastofname)
        and message->'value'->>'author' = '@' || '${ssbConfig.keys.public}'
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
    )
    select * from lastofname where message->'value'->>'author' in (select contact from following);
`;

  let queryParam: string;
  let query: string;
  const parsed = Buffer.from(handle,'base64').toString('utf-8');
  if (!parsed.endsWith(".ed25519")) {
    queryParam = handle;
    query = query1;
  } else {
    queryParam =parsed;
    query = query2;
  }
  const queryParams = [queryParam];
  const result = await getPool()
    .query(query, queryParams)
    .catch((err) => {S
      console.log(err);
      console.log(query, queryParams);
    });
  if (result.rowCount > 0) {
    return result.rows[0];
  }
  return null;
}

async function hasAbout(person: Person): Promise<SsbAbout> {
  const queryParams = [person.preferredUsername];

  const query = `
    with lastofnames as (
        select * from message 
        where 
        message->'value'->'content'->>'type' = 'about' 
        and message->'value'->>'author'=(
            select message->'value'->>'author' from message 
            where message->'value'->'content'->>'type' = 'about' 
            and message->'value'->'content'->>'name'= $1
            order by message->'value'->'sequence' desc limit 1
        ) order by message->'value'->'sequence' desc limit 1
      )
      select * from lastofnames where message->'value'->'content'->>'name' = $1;
`;

  const result = await getPool().query(query, queryParams);
  if (result.rowCount > 0) {
    return result.rows[0];
  }
  return null;
}

async function updateAbout(person: Person, sbot: Scuttlebot): Promise<void> {
  const identity = await new SsbKeyPairRepositoryImpl().getOrCreateSsbKeyPair(
    person,
    sbot,
  );
  const keyPair = {
    id: `@${identity.public}`,
    public: identity.public,
    private: identity.private,
    curve: "ed25519",
  };
  const feed = ssbFeed(sbot, keyPair);

  const ssbAbout = {
    type: "about",
    name: person.preferredUsername,
    about: `@${identity.public}`,
    description: person.summary,
    actorId: person.id,
    inboxId: person.inboxId,
  };
}

function getContentHtml(txt: string): string {
  const md = markdownIt();
  return md.render(txt);
}

export { isHosted, getContentHtml, hasAbout, updateAbout };
