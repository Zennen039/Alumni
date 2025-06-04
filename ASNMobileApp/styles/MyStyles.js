import { StyleSheet } from "react-native";

export default StyleSheet.create({
    home: {
        flex: 1,
        backgroundColor: '#f0f2f5'
    },
    text: {
        textAlign: 'center',
        marginTop: 30,
        color: '#888'
    },
    card: {
        marginVertical: 8,
        marginHorizontal: 12,
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        marginRight: 12,
        borderColor: '#ddd',
        borderWidth: 1,
    },
    author: {
        fontWeight: '600',
        fontSize: 16,
    },
    time: {
        color: '#888',
        fontSize: 12,
        marginTop: 2,
    },
    content: {
        fontSize: 15,
        marginBottom: 10,
        color: '#333',
    },
    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        marginTop: 5,
    },
    reactions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    reactionCount: {
        fontSize: 14,
        color: '#555',
    },
})