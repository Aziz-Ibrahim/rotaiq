import React from 'react';
import {
  UnstyledButton,
  Group,
  Avatar,
  Text,
  rem,
  Divider,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useAuth } from '../hooks/useAuth.jsx';

export default function User() {
  const { user, logout } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <>
      <Divider my="sm" />
      <UnstyledButton
        sx={(theme) => ({
          display: 'block',
          width: '100%',
          padding: theme.spacing.md,
          color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
        })}
        onClick={logout}
      >
        <Group>
          <Avatar
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png"
            radius="xl"
          />
          <div style={{ flex: 1 }}>
            <Text size="sm" weight={500}>
              {user.first_name} {user.last_name}
            </Text>
            <Text color="dimmed" size="xs">
              {user.email}
            </Text>
          </div>
        </Group>
      </UnstyledButton>
    </>
  );
}