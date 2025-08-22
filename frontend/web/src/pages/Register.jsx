import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitationToken, setInvitationToken] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Read the token from the URL on component load
    const token = searchParams.get('token');
    if (token) {
      setInvitationToken(token);
    } else {
      // If no token is found, redirect to an error page or the login page
      navigate('/login');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic form validation
    if (password !== password2) {
      setError("Passwords don't match.");
      return;
    }

    try {
      const response = await apiClient.post('register/', {
        invitation_token: invitationToken,
        password,
        password2,
        first_name: firstName,
        last_name: lastName,
      });

      console.log('Registration successful:', response.data);
      // Redirect to the login page to allow the user to log in
      navigate('/login');
    } catch (err) {
      console.error('Registration failed:', err.response.data);
      setError(err.response.data.detail || 'Registration failed.');
    }
  };

  return (
    <div>
      <h2>Register with Invitation</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="hidden"
          value={invitationToken}
          readOnly
        />
        <div>
          <label>First Name:</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Last Name:</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Confirm Password:</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
          />
        </div>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default Register;