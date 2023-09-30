import { MetadataScanner } from "@stingerloom/IoC/scanners";
import { Service } from "typedi";

@Service()
export class RawTransactionScanner extends MetadataScanner {
    delete(token: string): void {
        this.mapper.delete(token);
    }

    isLock(token: string): boolean {
        return this.mapper.has(token);
    }

    lock(token: string): void {
        this.mapper.set(token, true);
    }

    unlock(token: string): void {
        this.mapper.set(token, false);
        this.delete(token);
    }
}
