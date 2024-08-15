import getPool from "../repository/pool.js";
import { Link } from "@fedify/fedify";
import { getLogger } from "@logtape/logtape";
const logger = getLogger(["blog", "federation"]);

async function isHosted(handle: string): Promise<boolean | any> {
    const queryParams = [handle];

    const query = `
    with lastname as (
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
      select * from lastname where message->'value'->'content'->>'name' = $1;
`;

    const result = await getPool().query(query, queryParams);

    if (result.rowCount > 0) {
        console.debug("author is hosted: " +  result.rows[0].message.value.content.name);
        return result.rows[0];
    } else {
        console.log("No hosted account found: " + handle);
        return false;
    }
}


function getHref(link: Link | URL | string | null): string | null {
    if (link == null) return null;
    if (link instanceof Link) return link.href?.href ?? null;
    if (link instanceof URL) return link.href;
    return link;
  }

export { isHosted };