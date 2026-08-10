import { View, Text, Button } from "react-native";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  loginSuccess,
  logout,
} from "../features/auth/authSlice";

export default function HomeScreen() {
  const dispatch = useAppDispatch();

  const isLoggedIn = useAppSelector(
    (state) => state.auth.isLoggedIn
  );

  return (
    <View>
      <Text>
        {isLoggedIn
          ? "Logged In"
          : "Logged Out"}
      </Text>

      <Button
        title="Login"
        onPress={() =>
          dispatch(loginSuccess("dummy-token"))
        }
      />

      <Button
        title="Logout"
        onPress={() => dispatch(logout())}
      />
    </View>
  );
}