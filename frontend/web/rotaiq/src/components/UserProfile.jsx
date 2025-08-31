import React, { useState } from 'react';
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
    PasswordInput,
    Stack,
    FileButton
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLock, IconUserEdit, IconUpload } from '@tabler/icons-react';
import apiClient from '../api/apiClient.js';
import { useAuth } from '../hooks/useAuth.jsx';
import { notifications } from '@mantine/notifications';

const UserProfile = () => {
    const { user, updateUserProfile } = useAuth();
    const [passwordModalOpened, { open: openPasswordModal, close: closePasswordModal }] = useDisclosure(false);
    const [avatarModalOpened, { open: openAvatarModal, close: closeAvatarModal }] = useDisclosure(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [avatarFile, setAvatarFile] = useState(null);

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
                confirm_new_password: passwordForm.confirmNewPassword,
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
        if (!avatarFile) {
            notifications.show({
                title: 'Error',
                message: 'Please select a file to upload.',
                color: 'red',
            });
            return;
        }

        try {
            const formData = new FormData();
            formData.append('avatar', avatarFile);
            const response = await apiClient.post('api/users/upload_avatar/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            
            // The backend now returns the full user object with the new avatar URL
            updateUserProfile(response.data);

            notifications.show({
                title: 'Success',
                message: 'Profile picture updated successfully.',
                color: 'green',
            });
            closeAvatarModal();
            setAvatarFile(null);
        } catch (err) {
            notifications.show({
                title: 'Avatar Change Failed',
                message: err.response?.data?.detail || 'An unexpected error occurred.',
                color: 'red',
            });
        }
    };

    if (!user) {
        return (
            <Center style={{ height: "80vh" }}>
                <Loader size="xl" />
            </Center>
        );
    }

    // Construct the full avatar URL for display
    const avatarSrc = user.avatar
        ? `http://localhost:8000${user.avatar}`
        : 'https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/avatars/avatar.png';

    return (
        <Container my="md">
            <Paper shadow="md" p="xl">
                <Group>
                    <Avatar
                        src={avatarSrc}
                        size="xl"
                        radius="xl"
                    />
                    <div>
                        <Title order={2}>{user.first_name} {user.last_name}</Title>
                        <Text size="md" color="dimmed">{user.role.replace(/_/g, ' ')}</Text>
                    </div>
                </Group>
                <Divider my="lg" />
                <Stack>
                    <Group position="apart">
                        <Text fw={700}>Email:</Text>
                        <Text>{user.email}</Text>
                    </Group>
                    {user.branch && (
                        <>
                            <Group position="apart">
                                <Text fw={700}>Branch:</Text>
                                <Text>{user.branch.name}</Text>
                            </Group>
                            {user.branch.region && (
                                <Group position="apart">
                                    <Text fw={700}>Region:</Text>
                                    <Text>{user.branch.region.name}</Text>
                                </Group>
                            )}
                        </>
                    )}
                </Stack>
                <Divider my="lg" />
                <Group position="apart">
                    {/* <Button
                        leftSection={<IconUserEdit size={16} />}
                        variant="subtle"
                        onClick={openAvatarModal}
                    >
                        Change Avatar
                    </Button> */}
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
                        <FileButton
                            onChange={setAvatarFile}
                            accept="image/png,image/jpeg"
                        >
                            {(props) => (
                                <Button
                                    leftSection={<IconUpload size={16} />}
                                    {...props}
                                >
                                    Upload File
                                </Button>
                            )}
                        </FileButton>
                        {avatarFile && (
                            <Text fz="sm" mt="sm">Selected file: {avatarFile.name}</Text>
                        )}
                        <Button type="submit" mt="md">Save Changes</Button>
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
