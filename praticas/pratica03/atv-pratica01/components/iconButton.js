import { Pressable, Text, StyleSheet, View } from "react-native";
import { View } from "react-native-web";
import {Ionicons} from '@expo/vector-icons';
import { opacity } from "react-native-reanimated/lib/typescript/Colors";

function IconButton ({ icon, size, color, onPress }) { 
    return(
        <Pressable onPress={onPress}
        style = {({pressed}) => pressed && styles.pressed}>
            <View style = {styles.button_container}>    
                <Ionicons name = {icon} size = {size} color = {color} />
            </View>
        </Pressable>
    );
}

export default IconButton;

const styles = StyleSheet({
    button_container: {
        padding: 10,
    },

    pressed:{
        opacity: 0.5,
    }
});