import Header from "../components/Header";
import Footer from "../components/Footer";

const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <Header />
            <div className="main-content">
                {children}
            </div>
            <Footer />
        </div>
    );
};

export default MainLayout;
