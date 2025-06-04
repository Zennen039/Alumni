import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, FlatList, Image, SafeAreaView } from "react-native";
import { TouchableOpacity } from "react-native";
import { List, Searchbar } from "react-native-paper";

const Home = () => {
    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(false);

    const [pages, setPages] = useState(1);

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
            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator />} data={posts}
                renderItem={({ item }) => <List.Item key={`Post${item.id}`} title={item.content}
                    description={item.created_date}
                    left={() => <TouchableOpacity onPress={() => nav.navigate('post-details', {'postId': item.id})}>
                        <Image source={{ uri: item.image }} />
                    </TouchableOpacity>} />} />
        </SafeAreaView>
    );
}

export default Home;