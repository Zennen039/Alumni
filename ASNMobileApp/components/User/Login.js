import { useNavigation } from "@react-navigation/native";
import { useContext, useState } from "react";
import { MyDispatchContext } from "../../configs/Contexts";
import APIs, { authAPIs, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native";
import { Button, HelperText, TextInput } from "react-native-paper";

const Login = () => {
    const info = [{
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Mật khẩu',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});

    const [loading, setLoading] = useState(false);

    const [msg, setMsg] = useState();

    const nav = useNavigation();

    const dispatch = useContext(MyDispatchContext);

    const setState = (value, field) => {
        setUser({ ...user, [field]: value })
    }

    const validate = () => {
        if (Object.values(user).length == 0) {
            setMsg("Vui lòng nhập thông tin!");

            return false;
        }

        for (let i of info)
            if (user[i.field] === '') {
                setMsg(`Vui lòng nhập ${i.label}!`);

                return false;
            }

        setMsg('');

        return true;
    }

    const login = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                let res = await APIs.post(endpoints['login'], {
                    ...user,
                    client_id: 'sd3xROkJLawF08kJuYbbowW2mH8nf67xmbRhlEaC',
                    client_secret: 'mh0linZwd45e8KiH072v9eIIff4G85rmxH05eUp6O9K384a0tcgHAcg9wkVcJTTo7WoHRiNERCTiCMLCrfWzsd3YnzxmMJFGKTX804PZY44jXoRUDirX3vMptCKVepy3',
                    grant_type: 'password'
                });

                await AsyncStorage.setItem('token', res.data.access_token);

                let u = await authAPIs(res.data.access_token).get(endpoints['current-user']);

                dispatch({
                    "type": "login",
                    "payload": u.data
                });
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    }

    return (
        <ScrollView>
            <HelperText type="error" visible={msg}>
                {msg}
            </HelperText>

            {info.map(i => <TextInput key={i.field} label={i.label}
                secureTextEntry={i.secureTextEntry} right={<TextInput.Icon icon={i.icon} />}
                value={user[i.field]} onChangeText={t => setState(t, i.field)} />)}

            <Button onPress={login} disabled={loading} loading={loading} mode="contained">Đăng nhập</Button>
        </ScrollView>
    );
}

export default Login;