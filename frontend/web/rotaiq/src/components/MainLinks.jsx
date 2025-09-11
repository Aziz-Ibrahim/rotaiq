import React from 'react';
import {
  Group,
  ThemeIcon,
  UnstyledButton,
  Text,
  rem,
  Stack,
  useMantineTheme
} from '@mantine/core';
import {
  IconGauge,
  IconChartBar,
  IconCalendar,
  IconPencilPlus,
  IconShieldLock,
} from '@tabler/icons-react';

import './MainLinks.css';

const managerLinks = [
  { icon: IconGauge, label: 'Dashboard', to: 'dashboard' },
  { icon: IconPencilPlus, label: 'Create Shift', to: 'create-shift' },
  { icon: IconChartBar, label: 'Analytics', to: 'analytics' },
  { icon: IconShieldLock, label: 'Invitations', to: 'invitations' },
];

const employeeLinks = [
  { icon: IconGauge, label: 'Dashboard', to: 'dashboard' },
  { icon: IconCalendar, label: 'My Claims', to: 'my-claims' },
];

function MainLink({ icon: Icon, label, to, onClick, isActive, onLinkClick }) {
  const theme = useMantineTheme();
  
  const handleClick = () => {
    onClick(to);
    onLinkClick();
  };

  return (
    <UnstyledButton
      onClick={handleClick}
      className="main-link"
      data-active={isActive || undefined}
    >
      <Group>
        <ThemeIcon variant="transparent" className="main-link-icon">
          <Icon style={{ width: rem(18), height: rem(18) }} />
        </ThemeIcon>
        <Text size="sm" className="main-link-text">
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

const getLinksForRole = (userRole) => {
  if (userRole === 'branch_manager' || userRole === 'region_manager' || userRole === 'head_office') {
    return managerLinks;
  }
  if (userRole === 'employee' || userRole === 'floating_employee') {
    return employeeLinks;
  }
  return [];
};

export default function MainLinks({ userRole, currentView, setCurrentView, onLinkClick }) {
  const links = getLinksForRole(userRole).map((link) => (
    <MainLink
      {...link}
      key={link.label}
      onClick={setCurrentView}
      onLinkClick={onLinkClick}
      isActive={currentView === link.to}
    />
  ));
  return (
    <Stack spacing="xs">
      {links}
    </Stack>
  );
}