import getPool from "../repository/pool.js";
import type SsbAbout from "../ssb/types/about-type.js";
import markdownIt from "markdown-it";

export const AP_COLLECTION_WINDOW = 10;

async function isHosted(handle: string): Promise<SsbAbout> {
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
// @NZiJQgUl8KB6n4BqtC/dQaj/y8KUmQtx6vaK9qYiTyI=.ed25519
    const result = await getPool().query(query, queryParams);
    if (result.rowCount > 0) {
        return result.rows[0];
    } 
    return null;    
}



async function isHostedByKey(handle: string): Promise<SsbAbout> {
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
        return result.rows[0];
    } 
    return null;    
}

function getContentHtml(txt: string): string {
    const md = markdownIt();
    return md.render(txt);
  }


export { isHosted,getContentHtml };