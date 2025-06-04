import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, FlatList, Image, SafeAreaView, useWindowDimensions, View } from "react-native";
import { TouchableOpacity } from "react-native";
import RenderHTML from "react-native-render-html";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
    const { width } = useWindowDimensions();

    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [pages, setPages] = useState(1);

    const nav = useNavigation();

    const loadPosts = async () => {
        if (pages > 0) {
            let url = `${endpoints['posts']}?page=${pages}`;

            try {
                setLoading(true);

                let res = await APIs.get(url);

                setPosts([...posts, ...res.data.results]);

                if (res.data.next === null)
                    setPages(0);
            } catch {

            } finally {
                setLoading(false);
            }
        }
    }

    useEffect(() => {
        let timer = setTimeout(() => {
            loadPosts();
        }, 500);

        return () => clearTimeout(timer);
    }, [pages]);

    useEffect(() => {
        setPages(1);

        setPosts([]);
    }, []);

    const loadMore = () => {
        if (!loading && pages > 0)
            setPages(pages + 1);
    }

    return (
        <SafeAreaView>
            <FlatList data={posts} onEndReached={loadMore} 
                            ListFooterComponent={loading && <ActivityIndicator />} renderItem={({ item }) => (
                    <TouchableOpacity keyExtractor={item.id.toString()}
                            onPress={() => nav.navigate("post-details", { postId: item.id })} >
                        <View>
                            <Image source={{ uri: item.user?.avatar }} 
                                    style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />
                            
                            <View>
                                <Text style={{ fontWeight: 'bold' }}>{item.user?.username}</Text>

                                <Text style={{ color: 'gray', fontSize: 12 }}>{(new Date(item.created_date)).toLocaleString()}</Text>
                            </View>
                        </View>

                        <RenderHTML style={{ marginBottom: 5 }} contentWidth={width} source={{ html: item.content }}></RenderHTML>

                        {item.image && (
                            <Image source={{ uri: item.image }} style={{ width: '100%', height: 200, borderRadius: 10 }}
                                resizeMode="cover" />
                        )}
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
    );
}

export default Home;