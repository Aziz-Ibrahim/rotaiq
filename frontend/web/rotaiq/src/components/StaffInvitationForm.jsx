import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Button, TextInput, Select, Text, Group, Box, Title, Paper, LoadingOverlay, Alert } from '@mantine/core';

// This imports your authenticated client, which is correct since
// the invitation endpoint requires manager authentication.
import apiClient from '../api/apiClient';

const StaffInvitationForm = ({ branches, roles }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    first_name: '', 
    last_name: '', 
    branch: '', 
    role: 'employee' 
  });
  const [inviteToken, setInviteToken] = useState(null);
  const [registrationLink, setRegistrationLink] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSelectChange = (field) => (value) => {
    setFormData({ ...formData, [field]: value });
  };

  const generateInvitation = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setInviteToken(null);
    setRegistrationLink(null);

    // Ensure branch is a valid ID from the options
    const selectedBranch = branches.find(b => b.value === formData.branch);
    if (!selectedBranch) {
      setError('Please select a valid branch.');
      setLoading(false);
      return;
    }

    try {
      // The backend expects branch_id, not branch object
      const payload = {
          ...formData,
          branch_id: formData.branch
      };
      
      // Send the invitation data to the backend
      const response = await apiClient.post('api/invitations/', payload);
      const token = response.data.token;
      
      // Construct the full registration link using the token
      const link = `${window.location.origin}/register?token=${token}`;
      
      setInviteToken(token);
      setRegistrationLink(link);
      
    } catch (err) {
      console.error('Failed to generate invitation:', err.response?.data);
      setError(err.response?.data?.email?.[0] || err.response?.data?.detail || 'Failed to generate invitation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="relative w-full">
      <Paper shadow="xl" p="xl" radius="md" className="w-full max-w-lg mx-auto">
        <LoadingOverlay visible={loading} />
        <Title order={2} className="text-center mb-6 text-gray-800">
          Invite New Staff
        </Title>
        <form onSubmit={generateInvitation}>
          <TextInput
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="Enter first name"
            required
            className="mb-4"
          />
          <TextInput
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Enter last name"
            required
            className="mb-4"
          />
          <TextInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
            className="mb-4"
          />
          <Select
            label="Branch"
            placeholder="Select branch"
            data={branches}
            value={formData.branch}
            onChange={handleSelectChange('branch')}
            required
            className="mb-4"
          />
          <Select
            label="Role"
            placeholder="Select role"
            data={roles}
            value={formData.role}
            onChange={handleSelectChange('role')}
            required
            className="mb-6"
          />
          <Button type="submit" fullWidth>
            Generate Invitation
          </Button>
        </form>

        {error && (
          <Alert title="Error" color="red" className="mt-4">
            {error}
          </Alert>
        )}

        {inviteToken && (
          <div className="mt-8 flex flex-col items-center p-6 bg-gray-50 rounded-lg">
            <Title order={4} className="mb-4 text-gray-700">Share this with the new staff member:</Title>
            <div className="p-4 bg-white rounded-md shadow-inner">
              <QRCode value={registrationLink} size={150} />
            </div>
            <Text className="mt-4 text-center text-gray-600 font-medium break-all">
              Or share this link:
            </Text>
            <a href={registrationLink} className="mt-2 text-blue-600 hover:underline text-sm break-all">
              {registrationLink}
            </a>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default StaffInvitationForm;
