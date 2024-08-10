import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import PushNotification from 'react-native-push-notification';

const TaskListApp = () => {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    // Configuración de las notificaciones
    PushNotification.configure({
      onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
        // Procesar la notificación si es necesario
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios', // Solicitar permisos solo en iOS
    });

    // Crear un canal de notificación
    PushNotification.createChannel(
      {
        channelId: "default-channel-id",
        channelName: "Default Channel",
        channelDescription: "A default channel for notifications",
        playSound: true,
        soundName: 'default',
        importance: 4, // Alta importancia
        vibrate: true,
      },
      (created) => console.log(`createChannel returned '${created}'`)
    );
  }, []);

  useEffect(() => {
    if (timeLeft === 300) {
      PushNotification.localNotification({
        channelId: "default-channel-id",
        message: "Quedan 5 minutos para la tarea seleccionada",
      });
    }

    if (timeLeft && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft <= 1) {
            clearInterval(timerId);
            return null;
          }
          return prevTimeLeft - 1;
        });
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [timeLeft]);

  const addTask = () => {
    if (task) {
      setTasks([...tasks, { id: Date.now().toString(), name: task }]);
      setTask('');
    }
  };

  const startCountdown = () => {
    setTimeLeft(3600); // 1 hora para la cuenta regresiva
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput 
        placeholder="Agregar tarea" 
        value={task} 
        onChangeText={setTask} 
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      <Button title="Agregar" onPress={addTask} />
      <Picker
        selectedValue={selectedTask}
        onValueChange={(itemValue) => setSelectedTask(itemValue)}
        style={{ height: 50, width: 200 }}
      >
        {tasks.map(task => (
          <Picker.Item key={task.id} label={task.name} value={task} />
        ))}
      </Picker>
      {selectedTask && (
        <View>
          <Text>Tarea Seleccionada: {selectedTask.name}</Text>
          <Button title="Iniciar cuenta regresiva" onPress={startCountdown} />
          {timeLeft !== null && (
            <Text>Tiempo restante: {Math.floor(timeLeft / 60)}:{timeLeft % 60}</Text>
          )}
        </View>
      )}
      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedTask(item)}>
            <Text style={{ padding: 10, borderBottomWidth: 1 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default TaskListApp;
