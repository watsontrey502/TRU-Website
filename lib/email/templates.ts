const BRAND = {
  bg: "#0C0C0D",
  gold: "#C8A97E",
  white: "#FFFFFF",
  muted: "rgba(255,255,255,0.5)",
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${BRAND.font};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.bg};padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
        <!-- Logo -->
        <tr><td style="padding-bottom:32px;">
          <span style="font-size:28px;font-weight:800;color:${BRAND.white};letter-spacing:-0.02em;">TR&Uuml;</span>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding-bottom:40px;">
          ${content}
        </td></tr>
        <!-- Footer -->
        <tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding-top:24px;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.6;">
            TR&Uuml; Dating Nashville<br>
            Nashville, Tennessee<br>
            <a href="https://trudatingnashville.com" style="color:${BRAND.gold};text-decoration:none;">trudatingnashville.com</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function applicationReceived(firstName: string) {
  return {
    subject: "We got your application",
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${BRAND.white};line-height:1.2;">
        Thanks, ${firstName}.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        We&rsquo;ve received your application to join TR&Uuml;. Our team reviews every application personally, so give us a little time.
      </p>
      <p style="margin:0 0 32px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        We&rsquo;ll be in touch soon with next steps.
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.gold};letter-spacing:0.1em;text-transform:uppercase;">
        The Offline Era
      </p>
    `),
  };
}

export function applicationApproved(firstName: string) {
  return {
    subject: "You're in. Welcome to TRU.",
    html: layout(`
      <p style="margin:0 0 8px;font-size:11px;color:${BRAND.gold};letter-spacing:0.2em;text-transform:uppercase;">
        Application Approved
      </p>
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${BRAND.white};line-height:1.2;">
        Welcome to TR&Uuml;, ${firstName}.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        You&rsquo;ve been accepted as a founding member. We built this for people like you &mdash; interesting people who want to meet other interesting people, offline.
      </p>
      <p style="margin:0 0 32px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        Our first events are launching soon. Keep an eye on your inbox &mdash; you&rsquo;ll be among the first to get access.
      </p>
      <a href="https://trudatingnashville.com/events" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,${BRAND.gold},#b8935e);color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">
        View Events
      </a>
    `),
  };
}

export function applicationWaitlisted(firstName: string) {
  return {
    subject: "You're on the waitlist",
    html: layout(`
      <p style="margin:0 0 8px;font-size:11px;color:${BRAND.gold};letter-spacing:0.2em;text-transform:uppercase;">
        Waitlisted
      </p>
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${BRAND.white};line-height:1.2;">
        Hang tight, ${firstName}.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        We loved your application, but we&rsquo;re keeping our first events small to get the experience right. You&rsquo;re on the waitlist and we&rsquo;ll reach out as soon as we have room.
      </p>
      <p style="margin:0 0 32px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        In the meantime, follow us on Instagram to stay in the loop.
      </p>
      <a href="https://instagram.com/trudatingnashville" style="display:inline-block;padding:14px 32px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:${BRAND.white};text-decoration:none;border-radius:999px;font-size:14px;font-weight:600;">
        Follow on Instagram
      </a>
    `),
  };
}

export function applicationRejected(firstName: string) {
  return {
    subject: "Update on your TRU application",
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:28px;font-weight:700;color:${BRAND.white};line-height:1.2;">
        Thanks for applying, ${firstName}.
      </h1>
      <p style="margin:0 0 24px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        After reviewing your application, we&rsquo;re not able to offer membership at this time. We curate our community carefully to create the best experience for everyone, and sometimes the timing just isn&rsquo;t right.
      </p>
      <p style="margin:0 0 32px;font-size:16px;color:${BRAND.muted};line-height:1.6;">
        You&rsquo;re welcome to reapply in the future. We wish you the best.
      </p>
      <p style="margin:0;font-size:14px;color:${BRAND.gold};letter-spacing:0.1em;text-transform:uppercase;">
        The Offline Era
      </p>
    `),
  };
}
