"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative bg-black pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-sand text-sm font-medium tracking-widest uppercase mb-6"
          >
            Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6"
          >
            Terms of Service
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-white/60 text-lg"
          >
            Last updated: March 3, 2026
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-20 h-0.5 bg-sand mx-auto mt-8"
          />
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] px-8 md:px-12 py-10 md:py-14 space-y-10">
            <Section title="1. Acceptance of Terms">
              <p>
                By accessing or using TR&Uuml; Dating Nashville (&ldquo;TR&Uuml;,&rdquo; &ldquo;we,&rdquo;
                &ldquo;our&rdquo;), you agree to be bound by these Terms of Service. If you do not agree,
                please do not use our services.
              </p>
            </Section>

            <Section title="2. Eligibility & Admission">
              <p>To use TR&Uuml;, you must:</p>
              <ul>
                <li>Be at least 21 years of age.</li>
                <li>Be currently single (not married or in a committed relationship).</li>
                <li>Reside in or near the Nashville, Tennessee area.</li>
                <li>Submit a truthful and accurate application and be accepted into the community.</li>
              </ul>
              <p>
                TR&Uuml; is a curated, members-only community. Admission is based on subjective
                assessments of overall fit, including social energy, genuine intent, and alignment
                with our community values. We reserve the right to accept, deny, or revoke
                membership at our sole discretion, without obligation to provide a reason.
              </p>
              <p>
                Submitting an application does not guarantee acceptance. Providing false or
                misleading information on your application is grounds for immediate membership
                revocation without refund.
              </p>
              <p>
                TR&Uuml; does not discriminate on the basis of race, color, national origin,
                religion, disability, sexual orientation, or any other characteristic protected
                by applicable law. Our admission decisions are based solely on subjective
                community-fit criteria and are not influenced by protected characteristics.
              </p>
            </Section>

            <Section title="3. Membership & Billing">
              <ul>
                <li>Membership is billed monthly and renews automatically until cancelled.</li>
                <li>Event tickets are purchased separately and are non-refundable once purchased, except as noted in our cancellation policy.</li>
                <li>You may cancel your membership at any time. Cancellation takes effect at the end of your current billing period.</li>
                <li>No refunds are issued for partial billing periods.</li>
              </ul>
            </Section>

            <Section title="4. Event Attendance">
              <ul>
                <li>Event RSVPs are first-come, first-served (Inner Circle members receive 48-hour early access).</li>
                <li>If you RSVP and cannot attend, please cancel at least 48 hours before the event.</li>
                <li>Repeated no-shows may result in membership review or revocation.</li>
                <li>TR&Uuml; reserves the right to refuse entry to any event for any reason, including intoxication or disruptive behavior.</li>
              </ul>
            </Section>

            <Section title="5. Community Standards">
              <p>All TR&Uuml; members agree to:</p>
              <ul>
                <li>Treat all attendees, staff, and venue partners with respect.</li>
                <li>Not engage in harassment, discrimination, or threatening behavior.</li>
                <li>Not share another member&rsquo;s personal information without their consent.</li>
                <li>Report any concerns about safety or conduct to our team immediately.</li>
              </ul>
              <p>
                Violation of community standards may result in immediate removal from an event
                and/or permanent membership revocation without refund.
              </p>
            </Section>

            <Section title="6. Double Take">
              <ul>
                <li>Double Take selections are confidential. Your selections are never revealed unless mutual.</li>
                <li>Mutual matches result in the sharing of first names and Instagram handles between matched members.</li>
                <li>TR&Uuml; is not responsible for interactions that occur outside of our platform after a match is made.</li>
              </ul>
            </Section>

            <Section title="7. Intellectual Property">
              <p>
                All content, branding, and materials on TR&Uuml; are owned by TR&Uuml; Dating Nashville
                and may not be reproduced, distributed, or used without our written permission.
              </p>
            </Section>

            <Section title="8. Limitation of Liability">
              <p>
                TR&Uuml; is a social events platform. We do not guarantee romantic outcomes, matches,
                or the behavior of other members. TR&Uuml; is not liable for any damages arising from
                your use of our services, attendance at events, or interactions with other members,
                to the fullest extent permitted by law.
              </p>
            </Section>

            <Section title="9. Modifications">
              <p>
                We may update these Terms from time to time. Continued use of TR&Uuml; after changes
                are posted constitutes acceptance of the revised Terms. We will notify members of
                material changes via email.
              </p>
            </Section>

            <Section title="10. Governing Law">
              <p>
                These Terms are governed by the laws of the State of Tennessee. Any disputes shall
                be resolved in the courts of Davidson County, Tennessee.
              </p>
            </Section>

            <Section title="11. Contact">
              <p>
                Questions about these Terms? Reach out at{" "}
                <a href="mailto:hello@trudating.com" className="text-gold hover:text-gold transition-colors underline underline-offset-2">
                  hello@trudating.com
                </a>.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold text-black mb-4">{title}</h2>
      <div className="text-stone leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
