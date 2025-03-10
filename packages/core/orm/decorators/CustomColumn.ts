/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
export class CustomColumn<T> {
  protected value!: T;

  setValue(value: T): void {
    this.value = value;
  }

  getValue(): T {
    return this.value;
  }
}
