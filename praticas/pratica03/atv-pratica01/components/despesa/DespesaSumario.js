import { Text } from "react-native";
import { View } from "react-native-web";

function DespesaSumario({despesas, periodo}) {      
    const somaDespesas = despesas.reduce(
        (total, despesa) => {return total + despesa.valor;} , 0
    );

    return(
        <View>
            <Text>{periodo}</Text>
            <Text>R$ {somaDespesas.toFixed(2)}</Text>
        </View>
    );
}

export default DespesaSumario;