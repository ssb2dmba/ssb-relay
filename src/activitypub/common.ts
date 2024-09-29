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


const isHosted: (string) => Promise<SsbAbout> = memoize(naiveisHosted)

async function naiveisHosted(p_handle: string): Promise<SsbAbout> {

  const queryByName = `
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

  const queryBySsbKey = `
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
  if (p_handle.length === 64) {
    queryParam  = "@" + hexToBase64(p_handle) + ".ed25519";
  } else {  
    queryParam = p_handle;
  }
  if (queryParam.endsWith(".ed25519")) {
    query = queryBySsbKey;
  } else {
    query = queryByName;
  }
  const queryParams = [queryParam];
  const result = await getPool()
    .query(query, queryParams)
  if (result.rowCount > 0) {
    return result.rows[0].message;
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
    return result.rows[0].message;
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



function aboutToHandle(about: SsbAbout): string {
  return base64ToHex(about.value.author.substring(1).replace(".ed25519", ""));
}

function encodeSsbMessageURI(key: string): string {
  return encodeURIComponent(key.substring(1));
}

function decodeSsbMessageURI(uriEncoded: string): string {
  return `%${decodeURIComponent(uriEncoded)}`;
}


function base64ToHex(base64: string): string {
  // Decode the Base64 string to a binary string
  const binaryString = Buffer.from(base64, 'base64').toString('binary');

  // Convert the binary string to a hexadecimal string
  let hexString = '';
  for (let i = 0; i < binaryString.length; i++) {
      const hex = binaryString.charCodeAt(i).toString(16);
      hexString += hex.padStart(2, '0');
  }

  return hexString;
}

function hexToBase64(hex: string): string {
  // Convert the hex string to a binary string
  let binaryString = '';
  for (let i = 0; i < hex.length; i += 2) {
      const byte = parseInt(hex.substr(i, 2), 16);
      binaryString += String.fromCharCode(byte);
  }

  // Encode the binary string to a Base64 string
  const base64 = Buffer.from(binaryString, 'binary').toString('base64');
  return base64;
}

export { isHosted, getContentHtml, hasAbout, updateAbout,aboutToHandle, base64ToHex, encodeSsbMessageURI, decodeSsbMessageURI,hexToBase64 };
