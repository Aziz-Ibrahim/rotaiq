import { Outlet } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';

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