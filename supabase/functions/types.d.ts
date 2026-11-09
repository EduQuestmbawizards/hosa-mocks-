// Ambient type declarations for Deno runtime and URL imports used by Supabase Edge Functions

declare module "https://*" {
  export const serve: (handler: (req: Request) => Promise<Response> | Response) => void;
  export const createClient: (supabaseUrl: string, supabaseKey: string, options?: any) => any;
  const value: any;
  export default value;
}

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};
