import { NavigationContainer } from "@react-navigation/native";

import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";

import { useAppSelector } from "../app/hooks";

export default function RootNavigator() {
  const isLoggedIn = useAppSelector(
    state => state.auth.isLoggedIn
  );

  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}