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
        if (onLinkClick) {
            onLinkClick();
        }
    };

    // Append a cache-busting query parameter to the avatar URL
    const avatarSrc = user.avatar 
        ? `http://localhost:8000${user.avatar}`
        : "https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar.png";

    return (
        <>
            <Divider my="sm" />
            <UnstyledButton
                onClick={handleProfileClick}
                className="main-link"
            >
                <Group>
                    <Avatar
                        src={avatarSrc}
                        radius="xl"
                    />
                    <div style={{ flex: 1 }}>
                        <Text size="sm" className="main-link-text">
                            {user.first_name} {user.last_name}
                        </Text>
                        <Text size="xs" color="white" sx={{ color: '#fff' }}>
                            {user.email}
                        </Text>
                    </div>
                </Group>
            </UnstyledButton>
        </>
    );
}