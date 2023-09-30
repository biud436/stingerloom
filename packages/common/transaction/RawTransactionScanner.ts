/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataScanner } from "@stingerloom/IoC/scanners";
import { Service } from "typedi";

export interface RawTransactionMetadata {
    targetClass: InstanceType<any>;
    currentMethod: string;
}

@Service()
export class RawTransactionScanner extends MetadataScanner {
    delete(token: string): void {
        this.mapper.delete(token);
    }

    isLock(token: string): boolean {
        return this.mapper.has(token);
    }

    lock(
        token: string,
        targetClass: InstanceType<any>,
        currentMethod: string,
    ): void {
        this.mapper.set(token, {
            targetClass,
            currentMethod,
        } as RawTransactionMetadata);
    }

    unlock(token: string): void {
        this.mapper.set(token, false);
        this.delete(token);
    }
}
