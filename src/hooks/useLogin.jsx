import { useState } from "react";
import { useAuthContext } from "./useAuthContext";
import { useNavigate } from "react-router-dom";

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [unverified, setUnverified] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();
  const { dispatch } = useAuthContext();

  // Login Function
  const login = async (user) => {
    setError(null);
    setLoading(true);
    setUnverified(false);
    setEmail("");

    try {
      const response = await fetch("/user/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const userResponse = await response.json();

      console.log("Login Response:", userResponse);

      if (userResponse.status === "Success") {
        localStorage.setItem("user", JSON.stringify(userResponse));

        dispatch({
          type: "login",
          payload: userResponse,
        });

        navigate("/", { replace: true });
      } else {
        // Email not verified
        if (userResponse.verified === false) {
          setUnverified(true);
          setEmail(userResponse.email);
        }

        setError(
          userResponse.message ||
            "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error. Please try again.");
    }

    setLoading(false);
  };

  // Resend Verification Email
  const resendVerification = async () => {

  setResendLoading(true);

  try {

    const response = await fetch(
      "http://localhost:8008/user/resend-verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const data = await response.json();

    if (data.success) {

      setUnverified(false);
      setError(null);

      navigate("/verification-email-sent", {
        replace: true,
      });

    } else {

      setError(data.message);

    }

  } catch (err) {

    console.error(err);

    setError("Failed to resend verification email.");

  } finally {

    setResendLoading(false);

  }

};

  return {
  login,
  error,
  loading,
  unverified,
  email,
  resendVerification,
  resendLoading,
};
};