"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="font-sans">
      {/* Hero */}
      <section className="relative bg-forest pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1920&q=80"
          alt=""
          fill
          className="object-cover opacity-10"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-dark/60 to-forest/90" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-8 text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-copper-light text-sm font-medium tracking-widest uppercase mb-6"
          >
            Legal
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold text-white mb-6"
          >
            Privacy Policy
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
            className="w-20 h-0.5 bg-copper-light mx-auto mt-8"
          />
        </div>
      </section>

      {/* Content */}
      <section className="bg-cream py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] px-8 md:px-12 py-10 md:py-14 space-y-10">
            <Section title="1. Information We Collect">
              <p>When you apply for or use TR&Uuml; Dating Nashville, we may collect:</p>
              <ul>
                <li><strong>Account information:</strong> Name, email address, age, gender, neighborhood, and Instagram handle.</li>
                <li><strong>Application data:</strong> Responses you provide during the membership application process.</li>
                <li><strong>Event activity:</strong> RSVPs, attendance records, and Double Take selections.</li>
                <li><strong>Payment information:</strong> Processed securely through our third-party payment provider. We do not store your full card number.</li>
                <li><strong>Device &amp; usage data:</strong> Browser type, IP address, and general usage patterns to improve our service.</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and review your membership application.</li>
                <li>Facilitate event RSVPs, attendance, and Double Take matching.</li>
                <li>Communicate with you about events, matches, and account updates.</li>
                <li>Curate balanced, high-quality events (e.g., age ranges, gender ratios).</li>
                <li>Improve our services and develop new features.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </Section>

            <Section title="3. Double Take & Matching Privacy">
              <p>
                Your Double Take selections are <strong>never revealed</strong> unless they are mutual.
                If you select someone and they do not select you back, neither party is notified.
                Only mutual matches result in shared contact information.
              </p>
            </Section>

            <Section title="4. Information Sharing">
              <p>We do not sell your personal information. We may share limited data with:</p>
              <ul>
                <li><strong>Mutual matches:</strong> First name and Instagram handle are shared only when a Double Take match is mutual.</li>
                <li><strong>Service providers:</strong> Trusted third parties that help us operate (e.g., payment processing, email delivery, hosting).</li>
                <li><strong>Legal requirements:</strong> When required by law, subpoena, or to protect our rights and safety.</li>
              </ul>
            </Section>

            <Section title="5. Data Security">
              <p>
                We use industry-standard security measures to protect your information, including
                encryption in transit and at rest. However, no method of transmission over the Internet
                is 100% secure, and we cannot guarantee absolute security.
              </p>
            </Section>

            <Section title="6. Your Rights">
              <p>You may:</p>
              <ul>
                <li>Access or update your personal information through your dashboard.</li>
                <li>Request deletion of your account and associated data.</li>
                <li>Opt out of marketing communications at any time.</li>
              </ul>
              <p>
                To exercise these rights, email us at{" "}
                <a href="mailto:hello@trudating.com" className="text-copper hover:text-copper-dark transition-colors underline underline-offset-2">
                  hello@trudating.com
                </a>.
              </p>
            </Section>

            <Section title="7. Cookies">
              <p>
                We use essential cookies to keep you signed in and maintain your session.
                We may use analytics cookies to understand how our service is used. You can
                manage cookie preferences through your browser settings.
              </p>
            </Section>

            <Section title="8. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of
                significant changes via email or through the service. Your continued use of
                TR&Uuml; after changes constitutes acceptance of the updated policy.
              </p>
            </Section>

            <Section title="9. Contact Us">
              <p>
                If you have questions about this Privacy Policy, contact us at{" "}
                <a href="mailto:hello@trudating.com" className="text-copper hover:text-copper-dark transition-colors underline underline-offset-2">
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
      <h2 className="font-serif text-2xl font-semibold text-dark mb-4">{title}</h2>
      <div className="text-muted leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-2 [&_a]:text-copper [&_a]:underline [&_a]:underline-offset-2">
        {children}
      </div>
    </div>
  );
}
