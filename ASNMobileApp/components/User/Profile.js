import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { Text, View } from "react-native";
import { Button } from "react-native-paper";
import { MyDispatchContext, MyUserContext } from "../../configs/Contexts";

const Profile = () => {
    const user = useContext(MyUserContext);

    const dispatch = useContext(MyDispatchContext);

    const nav = useNavigation();

    const logout = () => {
        dispatch({
            "type": "logout"
        });

        nav.navigate("index");
    }

    return (
        <View>
            <Text>Chào {user?.last_name} {user.first_name}!</Text>

            <Button onPress={logout} mode="contained">Đăng xuất</Button>
        </View>
    );
}

export default Profile;