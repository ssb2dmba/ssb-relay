import { execSync  }from 'child_process';


export class GetOnionAdressImpl   {
    
    execute(): string {
        const cmd =`sudo cat /var/lib/tor/ssb/hostname`;
        const result = execSync(cmd);
        return result.toString()
    }
}
