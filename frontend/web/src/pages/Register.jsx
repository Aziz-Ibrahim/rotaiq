import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [invitationToken, setInvitationToken] = useState('');
  const [email, setEmail] = useState(''); // State to hold the email
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setInvitationToken(token);
    // Fetch invitation details using the token
    const fetchInvitationDetails = async () => {
      try {
        const response = await apiClient.get(`invitations/details/?token=${token}`);
        const { email } = response.data;
        setEmail(email);
      } catch (err) {
        console.error('Invalid or used token:', err.response);
        setError('Invalid or expired invitation link.');
        // Redirect after 3s to prevent user from being stuck on an error page
        setTimeout(() => navigate('/login'), 3000); 
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvitationDetails();
  }, [searchParams, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
      // Display the most relevant error message from the backend
      setError(err.response.data.detail || JSON.stringify(err.response.data));
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  // Display error message and prevent form submission if an error exists
  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h2>Register with Invitation</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email Address:</label>
          <input
            type="email"
            value={email}
            readOnly // Make the field read-only
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </div>
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