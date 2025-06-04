import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/HomePage/Home";
import { Icon } from "react-native-paper";
import PostDetails from "./components/HomePage/PostDetails";
import Login from "./components/User/Login";
import Register from "./components/User/Register";
import CreatePost from "./components/HomePage/CreatePost";
import Profile from "./components/User/Profile";
import { MyDispatchContext, MyUserContext } from "./configs/Contexts";
import { useContext, useReducer } from "react";
import MyUserReducer from "./reducers/MyUserReducer";

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="home" component={Home} options={{ title: "Trang chủ" }} />

      <Stack.Screen name="post-details" component={PostDetails} options={{ title: "Chi tiết" }} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext);
  return (
    <Tab.Navigator >
      <Tab.Screen name="index" component={StackNavigator} options={{ headerShown: false, title: "Trang chủ", tabBarIcon: () => <Icon size={30} source="home" /> }} />

      <Tab.Screen name="createPost" component={CreatePost} options={{ headerShown: false, title: "Thêm bài đăng", tabBarIcon: () => <Icon size={30} source="plus" />}} />

      {user === null ? <>
        <Tab.Screen name="login" component={Login} options={{ title: "Đăng nhập", tabBarIcon: () => <Icon size={30} source="account" /> }} />
        
        <Tab.Screen name="register" component={Register} options={{ title: 'Đăng ký', tabBarIcon: () => <Icon size={30} source="account-plus" /> }} />
      </> : <>
        <Tab.Screen name="login" component={Profile} options={{ title: "Tài khoản", tabBarIcon: () => <Icon size={30} source="account" /> }} />
      </>}
    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}

export default App;