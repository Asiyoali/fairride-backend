export function AboutPage() {
  return (
    <main className="info-page">
      <section className="info-hero about-hero">
        <div className="info-hero-content">
          <span className="info-kicker">About FairRide</span>
          <h1>Reliable airport taxi coordination for Mogadishu.</h1>
          <p>
            FairRide connects passengers, drivers, and admins in one clear
            platform so airport taxi requests can be handled faster, safer, and
            with better visibility.
          </p>
        </div>
      </section>

      <section className="info-section">
        <div className="info-copy">
          <span className="info-kicker dark">What we do</span>
          <h2>Built for organized airport movement.</h2>
          <p>
            The system helps passengers request a ride from the airport, choose
            their destination district, and share an exact location when needed.
            Drivers can review assigned trips, while administrators can monitor
            activity and keep the service running smoothly.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <span>01</span>
            <h3>Fast Requests</h3>
            <p>Passengers can request a taxi with a simple, focused form.</p>
          </article>

          <article className="feature-card">
            <span>02</span>
            <h3>Driver Clarity</h3>
            <p>Drivers receive useful pickup and destination information.</p>
          </article>

          <article className="feature-card">
            <span>03</span>
            <h3>Admin Control</h3>
            <p>Admins can review drivers, reports, and platform activity.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
