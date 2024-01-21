import { execSync } from 'child_process';


export class GetIpAdressImpl {

   execute(ifName: string): string {
      const cmd = `ip -j a show ${ifName}`;
      const result = execSync(cmd);
      const jsonResult = JSON.parse(result.toString());
      if (jsonResult
         && jsonResult.length > 0
         && jsonResult[0].addr_info
         && jsonResult[0].addr_info.length > 0) {
         return jsonResult[0].addr_info[0].local;
      }
      return "";
   }
}
