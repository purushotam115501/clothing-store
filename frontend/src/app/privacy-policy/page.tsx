import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 w-full space-y-8 text-foreground leading-relaxed">
      <div>
        <h1 className="text-3xl font-extrabold uppercase tracking-wide">Privacy Policy</h1>
        <p className="text-xs text-muted-foreground mt-1">Last Updated: July 2026</p>
      </div>

      <div className="space-y-6 text-xs text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">1. Information We Collect</h2>
          <p>
            We collect personal details that you provide directly to us when placing an order, registering an account, or subscribing to our newsletters. This information includes your name, email address, shipping coordinates, billing details, and mobile phone numbers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">2. How We Use Your Details</h2>
          <p>
            Your information is primarily used to process purchases, coordinate deliveries, verify payment completions, and send transactional email alerts (order confirmation and shipping tracking notices). We also use details to optimize page loadings and customize product suggestions.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">3. Simulated Processing Notice</h2>
          <p>
            This website is a demonstration sandbox platform. All transactions, email alerts, payment integrations, and account registrations are simulated. We do not store real financial details or charge valid payment systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">4. Storage & Security</h2>
          <p>
            User accounts are stored in database collections protected using JWT tokens. Passwords are cryptographically hashed using salt configurations. We restrict access to admin panel routing directories to authorized system credentials only.
          </p>
        </section>
      </div>
    </div>
  );
}
