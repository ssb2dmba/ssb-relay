import getPool from "../repository/pool.js";


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
        return result.rows[0];
    } else {
        return false;
    }
}

export { isHosted };