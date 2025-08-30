import React from 'react';
import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  rem,
  Divider,
} from '@mantine/core';
import { useAuth } from '../hooks/useAuth.jsx';
import './MainLinks.css';

export default function User({ setCurrentView, onLinkClick }) {
  const { user } = useAuth();
  if (!user) {
    return null;
  }
  
  const handleProfileClick = () => {
    setCurrentView('user-profile');
    // Call the toggle function to collapse the navbar on mobile
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      <Divider my="sm" />
      <UnstyledButton
        onClick={handleProfileClick}
        className="main-link"
      >
        <Group>
          <Avatar
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
            radius="xl"
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" className="main-link-text">
              {user.first_name} {user.last_name}
            </Text>
            <Text size="xs" color="dimmed" sx={{ color: '#fff' }}>
              {user.email}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </>
  );
}