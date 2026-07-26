import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

function NotFound() {
    return (
        <>
            <Header />
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "65vh",
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: "#fafafa",
                color: "#111"
            }}>
                <h1 style={{ fontSize: "100px", margin: "0", fontWeight: "300", letterSpacing: "4px" }}>404</h1>
                <h2 style={{ fontSize: "24px", marginTop: "10px", fontWeight: "400", textTransform: "uppercase", letterSpacing: "2px" }}>
                    Page Not Found
                </h2>
                <p style={{ color: "#666", maxWidth: "450px", margin: "15px 0 30px", lineHeight: "1.6" }}>
                    The luxury piece or page you are looking for does not exist or has been moved.
                </p>
                <Link to="/" style={{
                    padding: "14px 32px",
                    backgroundColor: "#111",
                    color: "#fff",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: "600",
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    borderRadius: "4px",
                    transition: "all 0.3s ease"
                }}>
                    Return To Homepage
                </Link>
            </div>
            <Footer />
        </>
    );
}

export default NotFound;
