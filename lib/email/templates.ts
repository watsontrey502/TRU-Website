const BRAND = {
  bg: "#0C0C0D",
  card: "#141415",
  gold: "#C8A97E",
  goldLight: "#d4b88f",
  white: "#FFFFFF",
  text: "rgba(255,255,255,0.65)",
  muted: "rgba(255,255,255,0.35)",
  border: "rgba(255,255,255,0.06)",
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

function layout(content: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRU Nashville</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${BRAND.font};-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.bg};">
    <tr><td align="center" style="padding:48px 24px 32px;">

      <!-- Container -->
      <table width="520" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;width:100%;">

        <!-- Logo + Gold line -->
        <tr><td align="center" style="padding-bottom:40px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr><td align="center">
              <span style="font-size:32px;font-weight:800;color:${BRAND.white};letter-spacing:0.04em;">TR&#220;</span>
            </td></tr>
            <tr><td align="center" style="padding-top:12px;">
              <div style="width:40px;height:2px;background:linear-gradient(90deg,${BRAND.gold},${BRAND.goldLight});border-radius:1px;"></div>
            </td></tr>
          </table>
        </td></tr>

        <!-- Card -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;">
            <tr><td style="padding:40px 36px;">
              ${content}
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td align="center" style="padding-top:36px;">
          <table cellpadding="0" cellspacing="0" role="presentation">
            <tr><td align="center">
              <p style="margin:0 0 6px;font-size:11px;color:${BRAND.muted};letter-spacing:0.12em;text-transform:uppercase;">
                The Offline Era
              </p>
              <p style="margin:0 0 16px;font-size:12px;color:${BRAND.muted};line-height:1.5;">
                Nashville, Tennessee
              </p>
              <a href="https://trudatingnashville.com" style="font-size:12px;color:${BRAND.gold};text-decoration:none;">trudatingnashville.com</a>
            </td></tr>
          </table>
        </td></tr>

      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

function goldLabel(text: string) {
  return `<p style="margin:0 0 14px;font-size:10px;color:${BRAND.gold};letter-spacing:0.25em;text-transform:uppercase;font-weight:600;">${text}</p>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:${BRAND.white};line-height:1.25;letter-spacing:-0.01em;">${text}</h1>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 20px;font-size:15px;color:${BRAND.text};line-height:1.7;">${text}</p>`;
}

function goldButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:12px;">
      <tr><td align="center" style="background:${BRAND.gold};border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:14px 36px;color:${BRAND.bg};text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">${text}</a>
      </td></tr>
    </table>`;
}

function ghostButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-top:12px;">
      <tr><td align="center" style="border:1px solid rgba(255,255,255,0.15);border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:13px 36px;color:${BRAND.white};text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">${text}</a>
      </td></tr>
    </table>`;
}

function divider() {
  return `<div style="width:100%;height:1px;background:${BRAND.border};margin:24px 0;"></div>`;
}

function signature() {
  return `<p style="margin:0;font-size:13px;color:${BRAND.muted};font-style:italic;">&#8212; The TR&#220; Team</p>`;
}

export function applicationReceived(firstName: string) {
  return {
    subject: "We got your application",
    html: layout(`
      ${goldLabel("Application Received")}
      ${heading(`Thanks, ${firstName}.`)}
      ${paragraph("We&rsquo;ve received your application to join TR&#220;. Our team reviews every application personally &mdash; we&rsquo;re not an algorithm, we&rsquo;re real people reading every word.")}
      ${paragraph("Give us a little time. We&rsquo;ll be in touch soon with next steps.")}
      ${divider()}
      ${signature()}
    `),
  };
}

export function applicationApproved(firstName: string) {
  return {
    subject: "You're in. Welcome to TRU.",
    html: layout(`
      ${goldLabel("Application Approved")}
      ${heading(`Welcome to TR&#220;, ${firstName}.`)}
      ${paragraph("You&rsquo;ve been accepted as a founding member. We built this for people like you &mdash; interesting people who want to meet other interesting people, offline.")}
      ${paragraph("Our first events are launching soon. Keep an eye on your inbox &mdash; you&rsquo;ll be among the first to get access.")}
      ${goldButton("View Events", "https://trudatingnashville.com/events")}
      <div style="height:12px;"></div>
      ${divider()}
      ${signature()}
    `),
  };
}

export function applicationWaitlisted(firstName: string) {
  return {
    subject: "You're on the waitlist",
    html: layout(`
      ${goldLabel("Waitlisted")}
      ${heading(`Hang tight, ${firstName}.`)}
      ${paragraph("We loved your application, but we&rsquo;re keeping our first events small to get the experience right. You&rsquo;re on the waitlist and we&rsquo;ll reach out as soon as we have room.")}
      ${paragraph("In the meantime, follow us on Instagram to stay in the loop.")}
      ${ghostButton("Follow on Instagram", "https://instagram.com/trudatingnashville")}
      <div style="height:12px;"></div>
      ${divider()}
      ${signature()}
    `),
  };
}

export function applicationRejected(firstName: string) {
  return {
    subject: "Update on your TRU application",
    html: layout(`
      ${heading(`Thanks for applying, ${firstName}.`)}
      ${paragraph("After reviewing your application, we&rsquo;re not able to offer membership at this time. We curate our community carefully to create the best experience for everyone, and sometimes the timing just isn&rsquo;t right.")}
      ${paragraph("You&rsquo;re welcome to reapply in the future. We wish you the best.")}
      ${divider()}
      ${signature()}
    `),
  };
}
