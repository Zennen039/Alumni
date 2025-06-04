import { useContext, useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Image, ScrollView, View } from "react-native";
import { Button, Card, List, TextInput } from "react-native-paper";
import { MyUserContext } from "../../configs/Contexts";

const PostDetails = ({ route }) => {
    const [post, setPost] = useState(null);

    const [comments, setComments] = useState([]);

    const postId = route.params?.postId;

    const user = useContext(MyUserContext);

    const [content, setContent] = useState();

    const [loading, setLoading] = useState(false);

    const loadLesson = async () => {
        let res = await APIs.get(endpoints['post-details'](postId));

        setPost(res.data);
    }

    const loadComments = async () => {
        let res = await APIs.get(endpoints['comments'](postId));

        setComments(res.data);
    }

    const addComments = async () => {
        try {
            setLoading(true);

            // let token = await AsyncStorage.getItem('token');

            // let res = await authApis(token).post(endpoints['comments'](postId), {
            //     content: content
            // });

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
    }, [postId]);

    return (
        <ScrollView>
            {post === null ? <ActivityIndicator /> : <>
                <Card>
                    <Card.Cover source={{ uri: post.image }} />

                    <Card.Content>
                        <RenderHTML source={{ html: post.content }} />
                    </Card.Content>
                </Card>
            </>}

            {user && <View>
                <TextInput mode="outlined"
                    label="Bình luận" value={content} onChangeText={setContent}
                    placeholder="Nội dung bình luận" />
                <Button onPress={addComments} disabled={loading} loading={loading} mode="contained">Thêm bình luận</Button>
            </View>}

            <View>
                {comments.map(c => <List.Item title={c.content} description={moment(c.created_date).fromNow()} left={() => <Image source={{ uri: c.user.image }} />} />)}
            </View>
        </ScrollView>
    );
}

export default PostDetails;