import { use, useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';  

function GerenciarDespesa(){

    const [data, setData] = useState(new Date());
    const [valor, setValor] = useState('');
    const [descricao, setDescricao] = useState('');

    const [showPicker, setShowPicker] = useState(false);
    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || data;
        setShowPicker(false);
        setData(currentDate);
    }

    const handleChangeValor = (text) => {
    const cleanText = text.replace(',', '.');

    const match = cleanText.match(/^\d*\.?\d{0,2}$/);

    if (match) {
        setValor(cleanText);
    }
    };

    return(
        <View syle = {styles.container}>
            <View style = {styles.inputContainer}>
                <View style = {styles.container}>
                    <Text style = {styles.label}>Descrição</Text>
                    <TextInput style = {styles.input} maxLength = {20} onChangeText={setDescricao}></TextInput>
                </View>
            </View>

            <View style = {styles.inputContainer}>
                <View style = {styles.container}>
                        <Text style = {styles.label}>Valor da despesa</Text>
                        <TextInput style = {styles.input} maxLength = {10} keyboardType = {'decimal-pad'} onChangeText={handleChangeValor} ></TextInput>
                </View>
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Data da Despesa</Text>

                <Pressable onPress={() => setShowPicker(true)} style={styles.input}>
                        <Text>{data.toLocaleDateString('pt-BR')}</Text>
                </Pressable>

            {showPicker && (
                <DateTimePicker
                value={data}
                mode="date"
                display="default"
                onChange={onChange}
                />
            )}
            </View>

        </View>

        
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
  },
  inputContainer: {
    marginHorizontal: 4,
    marginVertical: 16,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
  },
});

export default GerenciarDespesa