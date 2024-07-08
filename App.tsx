/*
 * Created by Suastika Adinata on Mon Jul 08 2024
 * Copyright (c) 2024 - Made with love
 */

import React from 'react';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Main from './src/Main';

const Stack = createNativeStackNavigator();

export default function App(){
  return(
    <GestureHandlerRootView style={{ flex: 1 }}>
       <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name={"Main"} component={Main} options={{ headerShown: false }}/>
            </Stack.Navigator>
        </NavigationContainer>
    </GestureHandlerRootView>
  )
}