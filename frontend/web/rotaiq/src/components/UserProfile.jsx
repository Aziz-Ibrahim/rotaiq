import React, { useState, useEffect } from 'react';
import {
    Container,
    Title,
    Text,
    Paper,
    Divider,
    Group,
    Avatar,
    Loader,
    Center,
    Button,
    Modal,
    TextInput,
    PasswordInput,
    Stack,
    FileButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLock, IconUserEdit, IconUpload, IconLink } from '@tabler/icons-react';
import apiClient from '../api/apiClient.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { notifications } from '@mantine/notifications';

const UserProfile = () => {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for modals
    const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);
    const [avatarModalOpened, { open: openAvatarModal, close: closeAvatarModal }] = useDisclosure(false);

    // State for forms
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [avatarInput, setAvatarInput] = useState({
        type: 'url', // 'url' or 'file'
        value: ''
    });

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await apiClient.get('api/users/me/');
                setUserProfile(response.data);
                const initialAvatarUrl = response.data.avatar || 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar-8.png';
                setAvatarInput(prev => ({ ...prev, value: initialAvatarUrl }));
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleChangePassword = async (event) => {
        event.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
            notifications.show({
                title: 'Error',
                message: 'New passwords do not match.',
                color: 'red',
            });
            return;
        }

        try {
            await apiClient.post('api/users/change_password/', {
                current_password: passwordForm.currentPassword,
                new_password: passwordForm.newPassword,
            });
            notifications.show({
                title: 'Success',
                message: 'Password changed successfully.',
                color: 'green',
            });
            closePasswordModal();
            setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } catch (err) {
            notifications.show({
                title: 'Password Change Failed',
                message: err.response?.data?.detail || 'An unexpected error occurred.',
                color: 'red',
            });
        }
    };

    const handleChangeAvatar = async (event) => {
        event.preventDefault();
        try {
            if (avatarInput.type === 'url') {
                await apiClient.patch('api/users/me/', {
                    avatar: avatarInput.value
                });
            } else {
                const formData = new FormData();
                formData.append('avatar', avatarInput.value);
                // Note: The API endpoint below is a placeholder. You'll need to create it on your Django backend.
                await apiClient.post('api/users/upload_avatar/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            notifications.show({
                title: 'Success',
                message: 'Profile picture updated successfully.',
                color: 'green',
            });
            closeAvatarModal();
        } catch (err) {
            notifications.show({
                title: 'Avatar Change Failed',
                message: err.response?.data?.detail || 'An unexpected error occurred.',
                color: 'red',
            });
        }
    };

    if (loading) {
        return (
            <Center style={{ height: "80vh" }}>
                <Loader size="xl" />
            </Center>
        );
    }

    if (error) {
        return <Text color="red">Error loading profile: {error.message}</Text>;
    }

    if (!userProfile) {
        return <Text>No user profile data available.</Text>;
    }

    return (
        <Container my="md">
            <Paper shadow="md" p="xl">
                <Group>
                    <Avatar
                        src={avatarInput.type === 'url' ? avatarInput.value : URL.createObjectURL(avatarInput.value)}
                        size="xl"
                        radius="xl"
                    />
                    <div>
                        <Title order={2}>{userProfile.first_name} {userProfile.last_name}</Title>
                        <Text size="md" color="dimmed">{userProfile.role.replace(/_/g, ' ')}</Text>
                    </div>
                </Group>
                <Divider my="lg" />
                <Stack>
                    <Group position="apart">
                        <Text fw={700}>Email:</Text>
                        <Text>{userProfile.email}</Text>
                    </Group>
                    {userProfile.branch && (
                        <>
                            <Group position="apart">
                                <Text fw={700}>Branch:</Text>
                                <Text>{userProfile.branch.name}</Text>
                            </Group>
                            {userProfile.branch.region && (
                                <Group position="apart">
                                    <Text fw={700}>Region:</Text>
                                    <Text>{userProfile.branch.region.name}</Text>
                                </Group>
                            )}
                        </>
                    )}
                </Stack>
                <Divider my="lg" />
                <Group position="apart">
                    <Button
                        leftSection={<IconUserEdit size={16} />}
                        variant="subtle"
                        onClick={openAvatarModal}
                    >
                        Change Avatar
                    </Button>
                    <Button
                        leftSection={<IconLock size={16} />}
                        variant="subtle"
                        onClick={openPasswordModal}
                    >
                        Change Password
                    </Button>
                </Group>
            </Paper>

            {/* Change Avatar Modal */}
            <Modal
                opened={avatarModalOpened}
                onClose={closeAvatarModal}
                title="Change Profile Picture"
                centered
                styles={{
                    root: { position: 'fixed' },
                    inner: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '1rem' }
                }}
            >
                <form onSubmit={handleChangeAvatar}>
                    <Stack>
                        <Group>
                            <Button
                                leftSection={<IconLink size={16} />}
                                variant={avatarInput.type === 'url' ? 'filled' : 'subtle'}
                                onClick={() => setAvatarInput({ type: 'url', value: '' })}
                            >
                                Use URL
                            </Button>
                            <FileButton
                                onChange={(file) => setAvatarInput({ type: 'file', value: file })}
                                accept="image/png,image/jpeg"
                            >
                                {(props) => (
                                    <Button
                                        leftSection={<IconUpload size={16} />}
                                        variant={avatarInput.type === 'file' ? 'filled' : 'subtle'}
                                        {...props}
                                    >
                                        Upload File
                                    </Button>
                                )}
                            </FileButton>
                        </Group>
                        {avatarInput.type === 'url' ? (
                            <TextInput
                                label="Avatar URL"
                                placeholder="Paste a link to your image"
                                value={avatarInput.value}
                                onChange={(event) => setAvatarInput({ ...avatarInput, value: event.currentTarget.value })}
                                required
                            />
                        ) : (
                            <Text fz="sm">Selected file: {avatarInput.value?.name || 'None'}</Text>
                        )}
                        <Button type="submit">Save Changes</Button>
                    </Stack>
                </form>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                opened={passwordModalOpened}
                onClose={closePasswordModal}
                title="Change Password"
                centered
                styles={{
                    root: { position: 'fixed' },
                    inner: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', padding: '1rem' }
                }}
            >
                <form onSubmit={handleChangePassword}>
                    <Stack>
                        <PasswordInput
                            label="Current Password"
                            placeholder="Enter your current password"
                            value={passwordForm.currentPassword}
                            onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.currentTarget.value })}
                            required
                        />
                        <PasswordInput
                            label="New Password"
                            placeholder="Enter new password"
                            value={passwordForm.newPassword}
                            onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.currentTarget.value })}
                            required
                        />
                        <PasswordInput
                            label="Confirm New Password"
                            placeholder="Confirm your new password"
                            value={passwordForm.confirmNewPassword}
                            onChange={(event) => setPasswordForm({ ...passwordForm, confirmNewPassword: event.currentTarget.value })}
                            required
                        />
                        <Button type="submit">Change Password</Button>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
};

export default UserProfile;
