import { SafeAreaView, Text } from 'react-native'
import React, { useEffect } from 'react'
import AppNavigation from './src/navigation'
import { apiCall } from './src/api/openAI'

export default function App() {
  useEffect(()=>{
    // apiCall('apa itu quantum computing');
  },[])
  return (
    <AppNavigation/>
  )
}