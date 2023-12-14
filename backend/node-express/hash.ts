import * as crypto from 'crypto';

export default class Hasher {

    public hashPassword(input:string): string{
        const hash = crypto.createHash('md5');
        hash.update(input);
        const hashedpw = hash.digest('hex');
        return hashedpw;
    }
    
}