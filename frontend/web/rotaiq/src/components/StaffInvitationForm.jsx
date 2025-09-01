import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import QRCode from 'react-qr-code';
import { Paper, Title, Button, Group, Text, Select, TextInput, Box } from '@mantine/core';
import apiClient from '../api/apiClient';

const validationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  branch: Yup.string().required('Branch is required'),
  role: Yup.string().required('Role is required'),
});

const defaultRoles = [
  { value: 'employee', label: 'Employee' },
];

export default function StaffInvitationForm({ branches = [], roles = defaultRoles, userBranchId, currentUserRole }) {
  const [inviteData, setInviteData] = useState(null);

  const formik = useFormik({
    initialValues: {
      first_name: '',
      last_name: '',
      email: '',
      branch: currentUserRole === 'branch_manager' ? userBranchId : '',
      role: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setStatus }) => {
      setStatus(null);
      setInviteData(null);

      try {
        // Find the branch name from the branches prop based on the selected branch ID
        const branchObject = branches.find(branch => branch.value === values.branch);
        
        // Create the payload to send to the API
        const payload = {
          ...values,
          branch: branchObject ? branchObject.label : values.branch
        };

        const response = await apiClient.post('/api/invitations/', payload);
        
        const token = response.data?.token;

        if (!token) {
          console.error('API response did not contain a token:', response.data);
          setStatus({
            message: 'Invitation created, but token was not returned. Please check the server logs.',
            color: 'red'
          });
          return;
        }

        const invitationLink = `${window.location.origin}/register?token=${token}`;
        
        // Store the invitation link and token in state
        setInviteData({ token, link: invitationLink });
        
        // Use a different success message for clarity
        setStatus({ message: 'Invitation generated successfully.', color: 'green' });
        
        // Reset the form values after successful submission
        resetForm();
      } catch (err) {
        console.error('Invitation failed:', err.response?.data);
        setStatus({ 
          message: err.response?.data?.email?.[0] || 
                   err.response?.data?.detail ||
                   err.response?.data?.branch?.[0] ||
                   'Invitation failed. Please try again.', 
          color: 'red' 
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Paper shadow="xl" p="xl" radius="md" className="w-full max-w-lg mx-auto">
      <Title order={2} className="text-center mb-6 text-gray-800">
        Invite New Staff
      </Title>
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          <TextInput
            label="First Name"
            placeholder="John"
            {...formik.getFieldProps('first_name')}
            error={formik.touched.first_name && formik.errors.first_name}
          />
          <TextInput
            label="Last Name"
            placeholder="Doe"
            {...formik.getFieldProps('last_name')}
            error={formik.touched.last_name && formik.errors.last_name}
          />
          <TextInput
            label="Email"
            placeholder="john.doe@example.com"
            type="email"
            {...formik.getFieldProps('email')}
            error={formik.touched.email && formik.errors.email}
          />
          
          {/* Only show the branch select for region managers */}
          {currentUserRole === 'region_manager' && (
            <Select
              label="Assign Branch"
              placeholder="Pick a branch"
              data={branches}
              {...formik.getFieldProps('branch')}
              error={formik.touched.branch && formik.errors.branch}
              onChange={(value) => formik.setFieldValue('branch', value)}
            />
          )}

          <Select
            label="Assign Role"
            placeholder="Pick a role"
            data={roles}
            {...formik.getFieldProps('role')}
            error={formik.touched.role && formik.errors.role}
            onChange={(value) => formik.setFieldValue('role', value)}
          />
        </div>

        {formik.status && (
          <Box className={`mt-4 p-3 rounded-lg text-sm ${formik.status.color === 'red' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            <Text>{formik.status.message}</Text>
          </Box>
        )}

        <Group position="right" mt="xl">
          <Button type="submit" loading={formik.isSubmitting}>
            Generate Invitation
          </Button>
        </Group>
      </form>

      {/* Conditionally render the QR code and link */}
      {inviteData && (
        <div className="mt-8 flex flex-col items-center p-6 bg-gray-50 rounded-lg">
          <Title order={4} className="mb-4 text-gray-700">Share this with the new staff member:</Title>
          <div className="p-4 bg-white rounded-md shadow-inner">
            <QRCode value={inviteData.link} size={150} />
          </div>
          <Text className="mt-4 text-center text-gray-600 font-medium break-all">
            Or share this link:
          </Text>
          <a href={inviteData.link} className="mt-2 text-blue-600 hover:underline text-sm break-all">
            {inviteData.link}
          </a>
        </div>
      )}
    </Paper>
  );
}
