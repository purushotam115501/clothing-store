import React from 'react';

export default function TermsConditionsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 w-full space-y-8 text-foreground leading-relaxed">
      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Terms & Conditions</h1>
        <p className="text-xs text-muted-foreground mt-1">Effective Date: July 2026</p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">1. Use of the Site</h2>
          <p>
            By accessing or browsing this website, you agree to comply with standard utilization rules. You represent that all details submitted for registrations or purchases are correct and authorize system handlers to store them.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">2. Purchase & Stocking Regulations</h2>
          <p>
            Products are subject to stocking capacities. We reserve the right to cancel orders or refund amounts in case of inventory errors. All product prices are subject to modifications without notices.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">3. Simulated Store Disclaimer</h2>
          <p>
            All actions performed on this platform—including checkouts, cart totals, discount code deductions, emails, and credit card/UPI transactions—are simulated. We accept no liabilities for misunderstandings regarding order fulfillments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">4. Intellectual Property</h2>
          <p>
            All custom designs, typography integrations, image collections, and page contents are property of the site operators and protected by copyright guidelines.
          </p>
        </section>
      </div>
    </div>
  );
}
