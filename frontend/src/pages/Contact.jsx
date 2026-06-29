export function ContactPage() {
  return (
    <main className="info-page">
      <section className="info-hero contact-hero">
        <div className="info-hero-content">
          <span className="info-kicker">Contact FairRide</span>
          <h1>Need help with a ride, driver, or account?</h1>
          <p>
            Reach our support team for booking help, driver questions, account
            support, or service feedback.
          </p>
        </div>
      </section>

      <section className="contact-layout">
        <div className="contact-panel">
          <span className="info-kicker dark">Support</span>
          <h2>Talk to us directly.</h2>
          <p>
            We are here to keep airport taxi movement simple, clear, and
            dependable for passengers and drivers.
          </p>
        </div>

        <div className="contact-cards">
          <article className="contact-card">
            <span className="contact-label">Phone</span>
            <a href="tel:+252619156527">+252 61 9156527</a>
            <p>Call for urgent ride or driver support.</p>
          </article>

          <article className="contact-card">
            <span className="contact-label">Email</span>
            <a href="mailto:support@fairride.com">support@fairride.com</a>
            <p>Send details about account or service questions.</p>
          </article>

          <article className="contact-card">
            <span className="contact-label">Location</span>
            <strong>Mogadishu, Somalia</strong>
            <p>Serving airport taxi coordination locally.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
