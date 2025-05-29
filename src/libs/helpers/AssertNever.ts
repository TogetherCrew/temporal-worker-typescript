export function assertNever(x: any): never {
  throw new Error(`Unhandled value: ${x}`);
}
