import React from "react";
import { useNavigate } from "react-router-dom";
import { MdMarkEmailRead } from "react-icons/md";
import "./VerificationEmailSent.css";

const VerificationEmailSent = () => {
  const navigate = useNavigate();

  return (
    <div className="emailSentContainer">
      <div className="emailSentCard">

        <div className="emailIcon">
          <MdMarkEmailRead />
        </div>

        <h1>Verification Email Sent</h1>

        <p>
          We've sent a new verification email to your registered email address.
        </p>

        <p className="smallText">
          Please check your Inbox and Spam folder.
        </p>

        <button
          className="backButton"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>

      </div>
    </div>
  );
};

export default VerificationEmailSent;