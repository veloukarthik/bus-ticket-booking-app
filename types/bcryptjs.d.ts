declare module "bcryptjs" {
  export function hash(s: string | number, salt: number): Promise<string>;
  export function compare(a: string, b: string): Promise<boolean>;
}
