import { Resend } from "resend";

let _resend: Resend | null = null;

export const resend = new Proxy({} as Resend, {
  get(_, prop) {
    if (!_resend) {
      _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return (_resend as unknown as Record<string, unknown>)[prop as string];
  },
});

export const FROM_EMAIL = "TRU Nashville <hello@trudatingnashville.com>";
