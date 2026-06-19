import { useAuth } from '../context/AppContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default function RootNavigator() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <MainStack />;
  }

  return <AuthStack />;
}
