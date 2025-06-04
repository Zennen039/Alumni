import { useContext, useEffect, useState } from "react";
import { MyUserContext } from "../../configs/Contexts";
import APIs, { authAPIs, endpoints } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { Button, Card, List, TextInput } from "react-native-paper";
import RenderHTML from "react-native-render-html";
import MyStyles from "../../styles/MyStyles";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";

const PostDetails = ({ route }) => {
    const [post, setPost] = useState(null);

    const [comments, setComments] = useState([]);

    const [reactions, setReactions] = useState(null);

    const postId = route.params?.postId;

    const user = useContext(MyUserContext);

    const [content, setContent] = useState();

    const [loading, setLoading] = useState(false);

    const loadPost = async () => {
        let res = await APIs.get(endpoints['post-details'](postId));

        setPost(res.data);
    }

    const loadComments = async () => {
        let res = await APIs.get(endpoints['comments'](postId));

        setComments(res.data);
    }

    const loadReactions = async () => {
        try {
            let res = await APIs.get(endpoints['reactions'](postId), { reaction_choice });

            setReactions(res.data.reaction_choice);
        } catch (ex) {
            console.error(ex);
        }
    }

    const addComment = async () => {
        try {
            setLoading(true);

            let token = await AsyncStorage.getItem('token');

            let res = await authAPIs(token).post(endpoints['comments'](postId), {
                content: content
            });

            setComments([res.data, ...comments]);

            setContent("");
        } catch (ex) {
            console.error(ex);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        console.info(Math.random());

        loadPost();

        loadComments();

        loadReactions();
    }, [postId]);

    return (
        <ScrollView>
            {post === null ? <ActivityIndicator /> : <>
                <Card>
                    <Card.Cover source={{ uri: post.image }} />

                    <Card.Content>
                        <RenderHTML source={{ html: post.content }}></RenderHTML>
                    </Card.Content>
                </Card>
            </>}

            {user && <View style={MyStyles.p}>

                <TextInput mode="outlined" label="Bình luận" value={content} onChangeText={setContent}
                    placeholder="Nội dung bình luận" />

                <Button onPress={addComment} disabled={loading} loading={loading} style={MyStyles.m} mode="contained">Thêm bình luận</Button>
            </View>}

            <View>
                {comments.map(c => <List.Item title={c.content} description={moment(c.created_date).fromNow()} left={() => <Image style={MyStyles.avatar} source={{ uri: c.user.image }} />} />)}
            </View>

            <View style={MyStyles.reactions}>
                <TouchableOpacity onPress={() => loadReactions('like')}>
                    <Ionicons name="thumbs-up" size={24} color={reactions === 'like' ? 'blue' : 'gray'} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => loadReactions('heart')}>
                    <Ionicons name="heart" size={24} color={reactions === 'heart' ? 'orange' : 'gray'} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => loadReactions('haha')}>
                    <Ionicons name="laugh-beam" size={24} color={reactions === 'haha' ? 'red' : 'gray'} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

export default PostDetails;