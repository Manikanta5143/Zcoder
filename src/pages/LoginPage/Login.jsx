import React, { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { FaUser, FaLock } from "react-icons/fa"
import { useLogin } from '../../hooks/useLogin'
import styles from './Login.module.css'

const Login = () => {
  const { login, error, loading } = useLogin()
  const [user1, setUser] = useState({
    username: "",
    password: "",
  });
  const [debugInfo, setDebugInfo] = useState(null);
  
  const handleInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setUser({ ...user1, [name]: value })
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(user1)
  };

  // Debug function to test user verification status
  const testUserStatus = async () => {
    if (!user1.username) {
      alert('Please enter a username first');
      return;
    }
    
    try {
      const response = await fetch(`/user/test-user/${user1.username}`);
      const data = await response.json();
      setDebugInfo(data);
      console.log('User test result:', data);
    } catch (error) {
      console.error('Error testing user:', error);
      setDebugInfo({ error: 'Failed to test user' });
    }
  };

  return (
    <section className={styles.sectionForm}>
      <div className={styles.wrapper}>
        <h1>LOGIN</h1>
        {error && (
          <div style={{
            background: '#ffe0e0',
            color: '#b00020',
            border: '1px solid #b00020',
            borderRadius: 4,
            padding: '8px 12px',
            marginBottom: 16,
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
            {error}
          </div>
        )}
        
        {/* Debug info display */}
        {debugInfo && (
          <div style={{
            background: '#e0f0ff',
            color: '#0066cc',
            border: '1px solid #0066cc',
            borderRadius: 4,
            padding: '8px 12px',
            marginBottom: 16,
            textAlign: 'left',
            fontSize: '12px',
          }}>
            <strong>Debug Info:</strong><br/>
            {debugInfo.found ? (
              <>
                User found: {debugInfo.user.username}<br/>
                Email: {debugInfo.user.email}<br/>
                Verified: {debugInfo.user.verified ? 'Yes' : 'No'}<br/>
                ID: {debugInfo.user._id}
              </>
            ) : (
              debugInfo.message
            )}
          </div>
        )}
        
        <form onSubmit={handleSubmit} action="">
          <div className={styles.inputBox}>
            <input name="username" className={styles.input} type="text" placeholder='Username' required onChange={handleInput} value={user1.username} />
            <FaUser className={styles.icon} />
          </div>
          <div className={styles.inputBox}>
            <input name="password" type="password" placeholder='Password' required onChange={handleInput} value={user1.password} />
            <FaLock className={styles.icon} />
          </div>
          <button type="submit" className={styles.loginButton} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          
          {/* Debug button */}
          <button 
            type="button" 
            onClick={testUserStatus}
            style={{
              background: '#666',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '10px',
              width: '100%'
            }}
          >
            Test User Status (Debug)
          </button>
          
          <div className={styles.registerLink}>
            <p>Don't have an account? <NavLink to='/signup'>Signup</NavLink></p>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Login

