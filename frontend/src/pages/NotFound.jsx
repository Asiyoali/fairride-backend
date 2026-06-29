import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <h1 style={{ fontSize: "72px", margin: "0", color: "#1e293b" }}>404</h1>
      <h2 style={{ color: "#475569", marginBottom: "10px" }}>Page Not Found</h2>
      <p style={{ color: "#94a3b8", marginBottom: "25px" }}>
        Sorry, this page does not exist.
      </p>
      
      <Link to="/" style={{
        padding: "10px 20px",
        background: "#3b82f6",
        color: "white",
        textDecoration: "none",
        borderRadius: "5px",
        fontWeight: "bold"
      }}>
        Go Back Home
      </Link>
    </div>
  );
}

export default NotFound;