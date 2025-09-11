import { Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { Flex } from '@mantine/core';

function App() {
  return (
    <AuthProvider>
      <Flex direction="column" style={{ minHeight: '100vh' }}>
        <Outlet />
      </Flex>
    </AuthProvider>
  );
}

export default App;