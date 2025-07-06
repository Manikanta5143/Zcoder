import { useState } from "react"
import { useAuthContext } from "./useAuthContext"
import { useNavigate } from "react-router-dom"

export const useLogin = () => {
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { dispatch } = useAuthContext()
  
  const login = async (user) => {
    setError(null)
    setLoading(true)
    
    try {
      const response = await fetch('/user/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
      })
      
      const userResponse = await response.json();
      console.log('Login response:', userResponse); // Debug log

      if (userResponse.status === "Success" && userResponse.username) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(userResponse))
        dispatch({ type: 'login', payload: userResponse })
        navigate("/", { replace: true });
      } else {
        // Handle failed login
        setError(userResponse.message || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      console.error('Login error:', err);
      setError("Network or server error. Please try again.");
    }
    
    setLoading(false)
  }
  
  return { login, error, loading }
}