import React from 'react';
import {
  AppShell,
  Title,
  useMantineTheme,
  Group,
  Image,
  Stack,
  Burger,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import MainLinks from './MainLinks.jsx';
import User from './User.jsx';
import RotaIQLogo from '../assets/rotaiQ.png';

const DashboardLayout = ({ children, user, currentView, setCurrentView }) => {
  const theme = useMantineTheme();
  const [opened, { toggle }] = useDisclosure();
  
  if (!user) {
      return null;
  }
  
  return (
    <AppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbar={{
        width: { base: 250 },
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      header={{
        height: 60,
      }}
    >
      <AppShell.Header p="md">
        <Group sx={{ height: '100%' }}>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={4}>RotaIQ</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="xs" bg={theme.colors['dark-olive'][5]}>
        <AppShell.Section>
          <Group position="center" my="xl">
            <Image src={RotaIQLogo} alt="RotaIQ Logo" height={160} fit="contain" />
          </Group>
        </AppShell.Section>
        <AppShell.Section grow mt="md">
          <Stack spacing="xs">
            <MainLinks userRole={user?.role} currentView={currentView} setCurrentView={setCurrentView} onLinkClick={toggle} />
          </Stack>
        </AppShell.Section>
        <AppShell.Section>
          <User />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
};

export default DashboardLayout;