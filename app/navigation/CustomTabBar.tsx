import BottomNavigation from '../tabs/BottomNavigation';

export default function CustomTabBar({ state, navigation }: any) {
  const currentScreen = state.routes[state.index].name;
  return (
    <BottomNavigation
      currentScreen={currentScreen}
      onNavigate={(screen, params) => {
        if (screen === currentScreen) return;
        navigation.navigate(screen, params);
      }}
    />
  );
}
