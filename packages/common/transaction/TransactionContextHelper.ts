/* eslint-disable @typescript-eslint/no-explicit-any */

export class TransactionContextHelper {
    public context: Map<string, InstanceType<any>> = new Map();

    public setContext(key: string, value: InstanceType<any>): this {
        this.context.set(key, value);

        return this;
    }

    public clearContext(): this {
        this.context.clear();

        return this;
    }

    public toArray() {
        return Array.from(this.context.values());
    }

    public forEach(callback: (value: InstanceType<any>, key: string) => void) {
        this.context.forEach(callback);
    }
}
