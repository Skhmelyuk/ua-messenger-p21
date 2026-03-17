import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@clerk/expo";

export default function ScreenHome() {

    const { signOut } = useAuth();

    const handleLogout = async () => {
        await signOut();
    };

    return (
        <View style={styles.container}>
            <Text style={{ color: "#fff" }}>Screen Home</Text>
            <TouchableOpacity
                style={{ backgroundColor: "#fff", padding: 10, borderRadius: 10, marginTop: 10 }}
                onPress={handleLogout}
            >
                <Text style={{ color: "#000" }}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000",
    },
});