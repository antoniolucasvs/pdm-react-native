import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import DespesaRecente from './screens/DespesasRecentes';
import TodasDespesas from './screens/TodasDespesas';
import GerenciarDespesa from './screens/GerenciarDespesa';

export default function App() {
  
  const Tab = createBottomTabNavigator();

  function BottonTabScreen() {
    return(
      <Tab.Navigator>
        <Tab.Screen name = "DespesaRecentes" component={DespesaRecente} />
        <Tab.Screen name = "TodasDespesas" component={TodasDespesas} />
      </Tab.Navigator>
    )
  }
  
  const Stack = createNativeStackNavigator();
  return(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name = "Despesas" component = {BottonTabScreen} />
        <Stack.Screen name = "GerenciarDespesa" component = {GerenciarDespesa} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({ container: {
  flex: 1,
  backgroundColor: '#fff',
  alignItems: 'center',
  justifyContent: 'Center',
  },
});


