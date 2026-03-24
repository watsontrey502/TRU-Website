const BRAND = {
  bg: "#0C0C0D",
  card: "#141415",
  cardInner: "#1a1a1b",
  gold: "#C8A97E",
  goldLight: "#d4b88f",
  goldDark: "#a88a5e",
  white: "#FFFFFF",
  text: "rgba(255,255,255,0.7)",
  textBright: "rgba(255,255,255,0.85)",
  muted: "rgba(255,255,255,0.35)",
  border: "rgba(255,255,255,0.06)",
  borderGold: "rgba(200,169,126,0.25)",
  font: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};

// ─── Shared Components ────────────────────────────────────────

function layout(content: string, accentBar = true) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TRÜ Nashville</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};font-family:${BRAND.font};-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.bg};">
    <tr><td align="center" style="padding:0;">

      <!-- Top gold accent bar -->
      ${accentBar ? `<div style="width:100%;height:3px;background:linear-gradient(90deg, transparent 15%, ${BRAND.gold} 40%, ${BRAND.goldLight} 50%, ${BRAND.gold} 60%, transparent 85%);"></div>` : ""}

      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:560px;width:100%;padding:0 16px;">
        <tr><td style="padding:48px 0 16px;">

          <!-- Logo block -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr><td align="center" style="padding-bottom:8px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding-right:10px;">
                    <div style="width:32px;height:1px;background:linear-gradient(90deg, transparent, ${BRAND.gold});"></div>
                  </td>
                  <td>
                    <span style="font-size:28px;font-weight:800;color:${BRAND.white};letter-spacing:0.12em;">TR&#220;</span>
                  </td>
                  <td style="padding-left:10px;">
                    <div style="width:32px;height:1px;background:linear-gradient(90deg, ${BRAND.gold}, transparent);"></div>
                  </td>
                </tr>
              </table>
            </td></tr>
            <tr><td align="center" style="padding-bottom:40px;">
              <span style="font-size:9px;letter-spacing:0.35em;text-transform:uppercase;color:${BRAND.muted};">Nashville</span>
            </td></tr>
          </table>

          <!-- Main card -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:20px;overflow:hidden;">
            ${content}
          </table>

          <!-- Footer -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding:36px 0 48px;">
            <tr><td align="center">
              <div style="width:24px;height:1px;background:${BRAND.borderGold};margin-bottom:20px;"></div>
              <p style="margin:0 0 4px;font-size:10px;color:${BRAND.muted};letter-spacing:0.2em;text-transform:uppercase;">The Offline Era</p>
              <p style="margin:0 0 14px;font-size:11px;color:${BRAND.muted};">Nashville, Tennessee</p>
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="padding:0 8px;">
                    <a href="https://trudatingnashville.com" style="font-size:11px;color:${BRAND.gold};text-decoration:none;">Website</a>
                  </td>
                  <td style="color:${BRAND.muted};font-size:11px;">&#183;</td>
                  <td style="padding:0 8px;">
                    <a href="https://instagram.com/trudatingnashville" style="font-size:11px;color:${BRAND.gold};text-decoration:none;">Instagram</a>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>

        </td></tr>
      </table>

    </td></tr>
  </table>
</body>
</html>`;
}

function heroImage(src: string, alt: string) {
  return `
    <tr><td style="padding:0;line-height:0;">
      <img src="${src}" alt="${alt}" width="560" style="width:100%;height:auto;display:block;object-fit:cover;max-height:220px;" />
    </td></tr>`;
}

function cardBody(content: string) {
  return `<tr><td style="padding:40px 36px;">${content}</td></tr>`;
}

function goldLabel(text: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr>
        <td style="background:rgba(200,169,126,0.12);border:1px solid rgba(200,169,126,0.2);border-radius:999px;padding:6px 16px;">
          <span style="font-size:10px;color:${BRAND.gold};letter-spacing:0.25em;text-transform:uppercase;font-weight:700;">${text}</span>
        </td>
      </tr>
    </table>`;
}

function heading(text: string) {
  return `<h1 style="margin:0 0 22px;font-size:28px;font-weight:700;color:${BRAND.white};line-height:1.25;letter-spacing:-0.01em;">${text}</h1>`;
}

function paragraph(text: string) {
  return `<p style="margin:0 0 20px;font-size:15px;color:${BRAND.text};line-height:1.75;">${text}</p>`;
}

function goldButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 4px;">
      <tr><td align="center" style="background:linear-gradient(135deg, ${BRAND.gold}, ${BRAND.goldLight});border-radius:999px;box-shadow:0 4px 16px rgba(200,169,126,0.3);">
        <a href="${href}" style="display:inline-block;padding:15px 40px;color:${BRAND.bg};text-decoration:none;font-size:13px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${text}</a>
      </td></tr>
    </table>`;
}

function ghostButton(text: string, href: string) {
  return `
    <table cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 4px;">
      <tr><td align="center" style="border:1px solid rgba(255,255,255,0.15);border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:14px 36px;color:${BRAND.white};text-decoration:none;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;">${text}</a>
      </td></tr>
    </table>`;
}

function divider() {
  return `<div style="width:100%;height:1px;background:${BRAND.border};margin:28px 0;"></div>`;
}

function goldDivider() {
  return `
    <div style="margin:28px 0;text-align:center;">
      <div style="display:inline-block;width:40px;height:1px;background:linear-gradient(90deg, transparent, ${BRAND.gold});vertical-align:middle;"></div>
      <span style="display:inline-block;margin:0 8px;color:${BRAND.gold};font-size:10px;vertical-align:middle;">&#10022;</span>
      <div style="display:inline-block;width:40px;height:1px;background:linear-gradient(90deg, ${BRAND.gold}, transparent);vertical-align:middle;"></div>
    </div>`;
}

function signature() {
  return `<p style="margin:0;font-size:13px;color:${BRAND.muted};font-style:italic;">&#8212; The TR&#220; Team</p>`;
}

function featureRow(icon: string, title: string, description: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom:16px;">
      <tr>
        <td width="36" valign="top" style="padding-top:2px;">
          <span style="font-size:16px;">${icon}</span>
        </td>
        <td style="padding-left:8px;">
          <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:${BRAND.textBright};">${title}</p>
          <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:1.5;">${description}</p>
        </td>
      </tr>
    </table>`;
}

function highlightBox(content: string) {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin:8px 0 20px;">
      <tr><td style="background:${BRAND.cardInner};border:1px solid ${BRAND.borderGold};border-radius:12px;padding:20px 24px;">
        ${content}
      </td></tr>
    </table>`;
}

function statBlock(number: string, label: string) {
  return `
    <td align="center" style="padding:0 8px;">
      <p style="margin:0;font-size:24px;font-weight:700;color:${BRAND.gold};">${number}</p>
      <p style="margin:4px 0 0;font-size:10px;color:${BRAND.muted};letter-spacing:0.1em;text-transform:uppercase;">${label}</p>
    </td>`;
}

// ─── Email Templates ──────────────────────────────────────────

export function applicationReceived(firstName: string) {
  return {
    subject: "We got your application ✦",
    html: layout(`
      ${heroImage("https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&fit=crop&h=400", "TRÜ Nashville dinner event")}
      ${cardBody(`
        ${goldLabel("Application Received")}
        ${heading(`Thanks, ${firstName}.`)}
        ${paragraph("We&rsquo;ve received your application to join TR&#220;. Our team reviews every application personally &mdash; we&rsquo;re not an algorithm, we&rsquo;re real people reading every word.")}

        ${highlightBox(`
          ${featureRow("&#128270;", "Personal review", "Every application is read by our team")}
          ${featureRow("&#9201;", "Quick turnaround", "Most applications reviewed within 48 hours")}
          ${featureRow("&#128232;", "You&rsquo;ll hear from us", "We email every applicant, no ghosting")}
        `)}

        ${paragraph("In the meantime, follow us on Instagram to see what we&rsquo;re building.")}

        ${ghostButton("Follow @trudatingnashville", "https://instagram.com/trudatingnashville")}

        ${goldDivider()}
        ${signature()}
      `)}
    `),
  };
}

export function applicationApproved(firstName: string) {
  return {
    subject: "You're in. Welcome to TRÜ. ✦",
    html: layout(`
      ${heroImage("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&fit=crop&h=400", "TRÜ Nashville cocktails")}
      ${cardBody(`
        ${goldLabel("&#10003; Approved")}
        ${heading(`Welcome to TR&#220;, ${firstName}.`)}
        ${paragraph("You&rsquo;ve been accepted as a founding member. We built this for people like you &mdash; interesting people who want to meet other interesting people, offline.")}

        ${highlightBox(`
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              ${statBlock("&#10003;", "Curated Events")}
              ${statBlock("&#10003;", "Vetted Members")}
              ${statBlock("&#10003;", "Nashville")}
            </tr>
          </table>
        `)}

        ${paragraph("Our events are launching soon. You&rsquo;ll be among the first to get access to intimate dinners, cocktail hours, and curated experiences.")}

        ${goldButton("View Upcoming Events", "https://trudatingnashville.com/events")}
        <div style="height:8px;"></div>
        ${ghostButton("Visit Your Profile", "https://trudatingnashville.com/login")}

        ${goldDivider()}

        ${paragraph("<span style='color:${BRAND.textBright};font-weight:600;'>What happens next?</span>")}
        ${featureRow("1&#65039;&#8419;", "Browse events", "Check out our upcoming event formats")}
        ${featureRow("2&#65039;&#8419;", "RSVP early", "Founding members get priority access")}
        ${featureRow("3&#65039;&#8419;", "Show up", "We handle the rest &mdash; just be yourself")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function applicationApprovedWithLink(firstName: string, magicLinkUrl: string) {
  return {
    subject: "You're in. Welcome to TRÜ. ✦",
    html: layout(`
      ${heroImage("https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80&fit=crop&h=400", "TRÜ Nashville cocktails")}
      ${cardBody(`
        ${goldLabel("&#10003; Approved")}
        ${heading(`Welcome to TR&#220;, ${firstName}.`)}
        ${paragraph("You&rsquo;ve been accepted into Nashville&rsquo;s most curated social club. Click below to create your account and choose your membership.")}

        ${goldButton("Create Your Account", magicLinkUrl)}

        ${goldDivider()}

        ${paragraph(`<span style="color:${BRAND.textBright};font-weight:600;">Here&rsquo;s what happens next:</span>`)}
        ${featureRow("1&#65039;&#8419;", "Set up your profile", "Confirm your info and upload a photo ID")}
        ${featureRow("2&#65039;&#8419;", "Choose your membership", "Free, Social ($49/mo), or Premier ($125/mo)")}
        ${featureRow("3&#65039;&#8419;", "Start attending events", "Browse and RSVP to curated experiences")}

        ${divider()}
        ${paragraph(`<span style="color:${BRAND.muted};font-size:13px;">This link expires in 24 hours. If it doesn&rsquo;t work, visit <a href="https://trudatingnashville.com/login" style="color:${BRAND.gold};text-decoration:none;">trudatingnashville.com/login</a> and sign in with your email.</span>`)}

        ${signature()}
      `)}
    `),
  };
}

export function ticketPurchaseConfirmation(firstName: string, eventName: string, eventDate: string, eventVenue: string) {
  return {
    subject: `You're in for ${eventName} ✦`,
    html: layout(`
      ${cardBody(`
        ${goldLabel("Ticket Confirmed")}
        ${heading(`See you there, ${firstName}.`)}
        ${paragraph(`Your spot for <strong style="color:${BRAND.white};">${eventName}</strong> is confirmed.`)}

        ${highlightBox(`
          ${featureRow("&#128197;", "Date", eventDate)}
          ${featureRow("&#128205;", "Venue", eventVenue)}
        `)}

        ${paragraph("Dress code and additional details will be emailed closer to the event.")}

        ${goldButton("View Event Details", "https://trudatingnashville.com/dashboard")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function subscriptionWelcome(firstName: string, tierName: string) {
  const tierBenefits = tierName === "Premier"
    ? `${featureRow("&#9889;", "1 free event/month", "One event ticket included each month")}
       ${featureRow("&#127915;", "25% off additional", "Save on every extra event you attend")}
       ${featureRow("&#10024;", "Double Take", "See who caught your eye after events")}
       ${featureRow("&#128101;", "+1 Guest pass", "Bring a friend to any event")}
       ${featureRow("&#128276;", "Early access", "First to know about new events")}`
    : `${featureRow("&#127915;", "1 event/month included", "One ticket included every billing cycle")}
       ${featureRow("&#10024;", "Double Take", "See who caught your eye after events")}
       ${featureRow("&#11088;", "Priority RSVP", "Get first access to popular events")}`;

  return {
    subject: `Welcome to TRÜ ${tierName} ✦`,
    html: layout(`
      ${cardBody(`
        ${goldLabel(`${tierName} Member`)}
        ${heading(`You&rsquo;re a ${tierName} member, ${firstName}.`)}
        ${paragraph("Your membership is active. Here&rsquo;s what&rsquo;s included:")}

        ${highlightBox(tierBenefits)}

        ${goldButton("Browse Events", "https://trudatingnashville.com/dashboard")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function newMatchNotification(firstName: string, matchFirstName: string, eventName: string) {
  return {
    subject: `It's mutual. ✦`,
    html: layout(`
      ${cardBody(`
        ${goldLabel("Double Take Match")}
        ${heading(`You matched with ${matchFirstName}.`)}
        ${paragraph(`You both selected each other at <strong style="color:${BRAND.white};">${eventName}</strong>. A conversation has been started &mdash; you have 7 days to connect.`)}

        ${goldButton("Open Conversation", "https://trudatingnashville.com/dashboard/messages")}

        ${divider()}
        ${paragraph(`<span style="color:${BRAND.muted};font-size:13px;">Conversations expire after 7 days. Exchange contact info if you want to keep talking.</span>`)}
        ${signature()}
      `)}
    `),
  };
}

export function conversationExpiring(firstName: string, matchFirstName: string, hoursLeft: number) {
  return {
    subject: `Your conversation with ${matchFirstName} expires soon`,
    html: layout(`
      ${cardBody(`
        ${goldLabel("Expiring Soon")}
        ${heading(`${hoursLeft} hours left.`)}
        ${paragraph(`Your conversation with <strong style="color:${BRAND.white};">${matchFirstName}</strong> expires in ${hoursLeft} hours. Don&rsquo;t miss your chance to connect.`)}

        ${goldButton("Continue Conversation", "https://trudatingnashville.com/dashboard/messages")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function paymentFailed(firstName: string) {
  return {
    subject: "Payment issue with your TRÜ membership",
    html: layout(`
      ${cardBody(`
        ${goldLabel("Payment Failed")}
        ${heading(`Action needed, ${firstName}.`)}
        ${paragraph("We weren&rsquo;t able to process your latest payment. Please update your payment method to keep your membership active.")}

        ${goldButton("Update Payment", "https://trudatingnashville.com/dashboard/profile")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function verificationComplete(firstName: string) {
  return {
    subject: "You're verified ✦",
    html: layout(`
      ${cardBody(`
        ${goldLabel("&#10003; Verified")}
        ${heading(`You&rsquo;re verified, ${firstName}.`)}
        ${paragraph("Your identity has been confirmed. You now have the verified badge on your profile, which other members can see at events.")}

        ${goldButton("View Your Profile", "https://trudatingnashville.com/dashboard/profile")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function applicationWaitlisted(firstName: string) {
  return {
    subject: "You're on the waitlist ✦",
    html: layout(`
      ${heroImage("https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80&fit=crop&h=400", "TRÜ Nashville venue")}
      ${cardBody(`
        ${goldLabel("Waitlisted")}
        ${heading(`Hang tight, ${firstName}.`)}
        ${paragraph("We loved your application, but we&rsquo;re keeping our first events small to get the experience right. You&rsquo;re on the waitlist and we&rsquo;ll reach out as soon as we have room.")}

        ${highlightBox(`
          <p style="margin:0;font-size:14px;color:${BRAND.textBright};line-height:1.6;text-align:center;">
            <span style="color:${BRAND.gold};font-size:18px;">&#10022;</span><br>
            We&rsquo;re intentionally keeping things small.<br>
            <span style="color:${BRAND.muted};font-size:13px;">Quality over quantity &mdash; always.</span>
          </p>
        `)}

        ${paragraph("In the meantime, follow us on Instagram to stay in the loop. We&rsquo;ll announce openings there first.")}

        ${ghostButton("Follow on Instagram", "https://instagram.com/trudatingnashville")}

        ${goldDivider()}
        ${signature()}
      `)}
    `),
  };
}

export function newApplicationAdmin(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  age?: string | null;
  gender?: string | null;
  instagram?: string | null;
  neighborhood?: string | null;
  work?: string | null;
  heardFrom?: string | null;
  interesting?: string | null;
  idealDate?: string | null;
  referralCode?: string | null;
}) {
  const name = `${data.firstName} ${data.lastName}`;

  function infoRow(label: string, value: string | null | undefined) {
    if (!value) return "";
    return `
      <tr>
        <td style="padding:6px 12px 6px 0;font-size:12px;color:${BRAND.muted};text-transform:uppercase;letter-spacing:0.1em;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:6px 0;font-size:14px;color:${BRAND.textBright};vertical-align:top;">${value}</td>
      </tr>`;
  }

  return {
    subject: `New Application: ${name}`,
    html: layout(`
      ${cardBody(`
        ${goldLabel("New Application")}
        ${heading(name)}
        ${paragraph(`A new application just came in. Here&rsquo;s the summary:`)}

        ${highlightBox(`
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            ${infoRow("Email", data.email)}
            ${infoRow("Phone", data.phone)}
            ${infoRow("Age", data.age)}
            ${infoRow("Gender", data.gender)}
            ${infoRow("Instagram", data.instagram ? `<a href="https://instagram.com/${data.instagram.replace("@", "")}" style="color:${BRAND.gold};text-decoration:none;">@${data.instagram.replace("@", "")}</a>` : null)}
            ${infoRow("Neighborhood", data.neighborhood)}
            ${infoRow("Work", data.work)}
            ${infoRow("Heard From", data.heardFrom)}
            ${infoRow("Referral", data.referralCode)}
          </table>
        `)}

        ${data.interesting ? `
          <p style="margin:0 0 6px;font-size:11px;color:${BRAND.gold};letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">What makes them interesting</p>
          <p style="margin:0 0 24px;font-size:14px;color:${BRAND.text};line-height:1.7;background:${BRAND.cardInner};border-radius:10px;padding:16px 20px;border:1px solid ${BRAND.border};">${data.interesting}</p>
        ` : ""}

        ${data.idealDate ? `
          <p style="margin:0 0 6px;font-size:11px;color:${BRAND.gold};letter-spacing:0.15em;text-transform:uppercase;font-weight:600;">Ideal first date</p>
          <p style="margin:0 0 24px;font-size:14px;color:${BRAND.text};line-height:1.7;background:${BRAND.cardInner};border-radius:10px;padding:16px 20px;border:1px solid ${BRAND.border};">${data.idealDate}</p>
        ` : ""}

        ${goldButton("Review in Dashboard", "https://trudatingnashville.com/dashboard/admin/waitlist")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}

export function applicationRejected(firstName: string) {
  return {
    subject: "Update on your TRÜ application",
    html: layout(`
      ${cardBody(`
        ${heading(`Thanks for applying, ${firstName}.`)}
        ${paragraph("After reviewing your application, we&rsquo;re not able to offer membership at this time. We curate our community carefully to create the best experience for everyone, and sometimes the timing just isn&rsquo;t right.")}

        ${highlightBox(`
          <p style="margin:0;font-size:14px;color:${BRAND.text};line-height:1.6;text-align:center;">
            This isn&rsquo;t necessarily a permanent decision.<br>
            <span style="color:${BRAND.gold};">You&rsquo;re welcome to reapply in the future.</span>
          </p>
        `)}

        ${paragraph("We appreciate your interest in TR&#220; and wish you the best.")}

        ${ghostButton("Visit Our Website", "https://trudatingnashville.com")}

        ${divider()}
        ${signature()}
      `)}
    `),
  };
}
