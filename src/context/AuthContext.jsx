import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            console.error("Error parsing saved user:", e);
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem("token") || null;
    });

    const [loading] = useState(false);

    const login = (userData, tokenData) => {
        try {
            localStorage.setItem("user", JSON.stringify(userData));
            if (tokenData) {
                localStorage.setItem("token", tokenData);
            }
        } catch (e) {
            console.error("Error saving user to localStorage:", e);
        }
        setUser(userData);
        setToken(tokenData || null);
    };

    const loginWithGoogle = async (firebaseUser) => {
        let userToken = "";
        try {
            if (firebaseUser.getIdToken) {
                userToken = await firebaseUser.getIdToken();
            }
        } catch (err) {
            console.error("Error getting idToken from firebaseUser:", err);
        }

        const googleUser = {
            id: firebaseUser.uid || firebaseUser.email,
            fullname: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            role: "customer"
        };

        try {
            localStorage.setItem("user", JSON.stringify(googleUser));
            localStorage.setItem("token", userToken || "google-firebase-token");
        } catch (e) {
            console.error("Error saving googleUser to localStorage:", e);
        }

        setUser(googleUser);
        setToken(userToken || "google-firebase-token");
        return googleUser;
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        sessionStorage.clear();
    };

    const updateUser = (updatedData) => {
        const newUser = { ...user, ...updatedData };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
