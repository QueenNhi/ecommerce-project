import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Register.css";
import { useAuth } from "../../context/AuthContext";

const Register = () => {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        fullname: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value
        });

    };

    const handleRegister = async (e) => {

        e.preventDefault();

        if (
            !form.fullname ||
            !form.email ||
            !form.password
        ) {

            alert("Vui lòng nhập đầy đủ thông tin.");

            return;

        }

        if (form.password !== form.confirmPassword) {

            alert("Mật khẩu xác nhận không khớp.");

            return;

        }

        try {

            setLoading(true);

            const res = await fetch(

                "http://localhost:5000/api/auth/register",

                {

                    method: "POST",

                    headers: {

                        "Content-Type": "application/json"

                    },

                    body: JSON.stringify({

                        fullname: form.fullname,

                        email: form.email,

                        phone: form.phone,

                        password: form.password

                    })

                }

            );

            const data = await res.json();

            if (data.success) {

                alert("Đăng ký thành công!");

                login(data.user, data.token);

                navigate("/");

            } else {

                alert(data.message);

            }

        } catch (err) {

            console.log(err);

            alert("Có lỗi xảy ra.");

        }

        setLoading(false);

    };

    return (

        <div className="register-page">

            <div className="register-container">

                {/* LEFT */}

                <div className="register-left">

                    <img
                        src="/images/login-banner.jpg"
                        alt=""
                    />

                    <div className="register-overlay">

                        <h2>LUXE HANDBAGS</h2>

                        <p>
                            Timeless Luxury • Since 2026
                        </p>

                    </div>

                </div>

                {/* RIGHT */}

                <div className="register-right">

                    <div className="register-box">

                        <div className="register-tabs">

                            <Link to="/login">
                                SIGN IN
                            </Link>

                            <span className="active">
                                CREATE ACCOUNT
                            </span>

                        </div>

                        <h1>Create Account</h1>

                        <p className="register-subtitle">

                            Join the Luxe Handbags family
                            and discover premium fashion.

                        </p>

                        <form onSubmit={handleRegister}>

                            <div className="register-group">

                                <label>Full Name</label>

                                <input
                                    type="text"
                                    name="fullname"
                                    placeholder="Enter your full name"
                                    value={form.fullname}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="register-group">

                                <label>Email</label>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={form.email}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="register-group">

                                <label>Phone Number</label>

                                <input
                                    type="text"
                                    name="phone"
                                    placeholder="Enter phone number"
                                    value={form.phone}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="register-group">

                                <label>Password</label>

                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Create password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                            </div>

                            <div className="register-group">

                                <label>Confirm Password</label>

                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                />

                            </div>

                            <button
                                type="submit"
                                className="register-btn"
                            >

                                {
                                    loading
                                        ? "CREATING..."
                                        : "CREATE ACCOUNT"
                                }

                            </button>

                        </form>

                        <div className="register-footer">

                            Already have an account?

                            <Link to="/login">

                                Sign In

                            </Link>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    );

};

export default Register;