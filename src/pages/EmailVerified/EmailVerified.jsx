import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmailVerified.css";

const EmailVerified = () => {

    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {

        const timer = setInterval(() => {

            setCountdown(prev => {

                if (prev === 1) {

                    clearInterval(timer);
                    navigate("/login");
                    return 0;

                }

                return prev - 1;

            });

        },1000);

        return () => clearInterval(timer);

    }, [navigate]);

    return (

        <div className="emailVerifiedContainer">

            <div className="verificationCard">

                <div className="successIcon">

                    ✓

                </div>

                <h1>

                    Email Verified Successfully

                </h1>

                <p>

                    Welcome to <span>ZCoder</span> 🚀

                </p>

                <p className="description">

                    Your account has been successfully verified.

                    <br />

                    You can now log in and start solving coding problems,

                    participate in contests, chat with developers,

                    and track your programming journey.

                </p>

                <button
                    className="loginButton"
                    onClick={() => navigate("/login")}
                >
                    Go To Login
                </button>

                <p className="redirectText">

                    Redirecting automatically in

                    <span> {countdown} </span>

                    seconds...

                </p>

            </div>

        </div>

    );

};

export default EmailVerified;