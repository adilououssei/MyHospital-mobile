declare module '@react-navigation/native' {
  import React from 'react';
  export const NavigationContainer: React.FC<{ children: React.ReactNode; linking?: any; onStateChange?: (state: any) => void; initialState?: any; theme?: any }>;
  export const useNavigation: () => any;
  export const useRoute: () => any;
  export const useFocusEffect: (effect: () => void | (() => void)) => void;
  export const useIsFocused: () => boolean;
  export const DefaultTheme: any;
  export const DarkTheme: any;
}

declare module '@react-navigation/native-stack' {
  import React from 'react';
  type ScreenComponent = { (props: any): React.ReactNode };
  export function createNativeStackNavigator(): {
    Navigator: React.FC<{ screenOptions?: any; initialRouteName?: string; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; children?: ScreenComponent; options?: any }>;
    Group: React.FC<any>;
  };
}

declare module '@react-navigation/bottom-tabs' {
  import React from 'react';
  type ScreenComponent = { (props: any): React.ReactNode };
  export function createBottomTabNavigator(): {
    Navigator: React.FC<{ screenOptions?: any; initialRouteName?: string; tabBar?: (props: any) => React.ReactNode; children?: React.ReactNode }>;
    Screen: React.FC<{ name: string; children?: ScreenComponent; options?: any }>;
    Group: React.FC<any>;
  };
}
