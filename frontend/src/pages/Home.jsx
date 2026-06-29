import taxiImage from "../assets/taxi.png";
function Home() {
  return (
    <div className="modern-home">

      <div className="overlay"></div>

      <div className="modern-content">

        <span className="top-text">
          FAIRRIDE AIRPORT SYSTEM
        </span>

       <h1>
  Smart & Fair
  <br />
  Taxi Allocation
</h1>

     <p>
  FairRide ensures fair airport taxi distribution
  between drivers while helping passengers quickly
  find available taxis.
</p>

        <div className="hero-buttons">

          <button className="primary-btn">
            Request Taxi
          </button>

          <button className="secondary-btn">
            Become Driver
          </button>

        </div>

      </div>

    </div>
  );
}

export default Home;