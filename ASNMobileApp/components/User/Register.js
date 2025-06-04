import { Image, ScrollView, TouchableOpacity, View } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useState } from "react";
import { Button, HelperText, TextInput } from "react-native-paper";
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
    const info = [{
        label: 'Tên',
        field: 'first_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Họ và tên lót',
        field: 'last_name',
        icon: 'text',
        secureTextEntry: false
    }, {
        label: 'Tên đăng nhập',
        field: 'username',
        icon: 'account',
        secureTextEntry: false
    }, {
        label: 'Mật khẩu',
        field: 'password',
        icon: 'eye',
        secureTextEntry: true
    }, {
        label: 'Xác nhận mật khẩu',
        field: 'confirm',
        icon: 'eye',
        secureTextEntry: true
    }];

    const [user, setUser] = useState({});

    const [loading, setLoading] = useState(false);

    const [msg, setMsg] = useState();

    const nav = useNavigation();

    const setState = (value, field) => {
        setUser({ ...user, [field]: value })
    }

    const picker = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled)
                setState(result.assets[0], 'avatar');
        }
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

        if (user.password && user.password !== user.confirm) {
            setMsg("Mật khẩu không khớp!");

            return false;
        }

        setMsg('');

        return true;
    }

    const register = async () => {
        if (validate() === true) {
            try {
                setLoading(true);

                let form = new FormData();

                for (let key in user)
                    if (key !== 'confirm') {
                        console.info(Math.random());

                        form.append('avatar', {
                            uri: user.avatar?.uri,
                            name: user.avatar?.fileName,
                            type: user.avatar?.type
                        })
                    } else
                        form.append(key, user[key]);

                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status === 201)
                    nav.navigate('login');
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

            <TouchableOpacity onPress={picker}>
                <Button>Chọn ảnh đại diện</Button>
            </TouchableOpacity>

            {user?.avatar && <Image source={{ uri: user.avatar.uri }} />}
            <Button onPress={register} disabled={loading} loading={loading} mode="contained">Đăng ký</Button>
        </ScrollView>
    );
}

export default Register;