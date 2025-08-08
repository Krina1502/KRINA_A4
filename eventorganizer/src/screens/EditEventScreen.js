import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Platform, ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  doc, getDoc, updateDoc, deleteDoc, Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

const EditEventScreen = ({ route, navigation }) => {
  const { eventId } = route.params;

  const [event, setEvent] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      const ref = doc(db, 'events', eventId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setEvent(data);
        setDate(data.date.toDate());
      } else {
        Alert.alert('Error', 'Event not found');
        navigation.goBack();
      }
    };
    loadEvent();
  }, []);

  const handleUpdate = async () => {
    if (!event.title.trim()) return Alert.alert('Validation', 'Title is required');
    try {
      const ref = doc(db, 'events', eventId);
      await updateDoc(ref, {
        ...event,
        date: Timestamp.fromDate(date),
      });
      Alert.alert('Success', 'Event updated');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert('Confirm', 'Delete this event?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'events', eventId));
            navigation.goBack();
          } catch (e) {
            Alert.alert('Error', e.message);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  if (!event) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>Edit Event</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          value={event.title}
          onChangeText={(val) => setEvent({ ...event, title: val })}
          style={styles.input}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={event.description}
          onChangeText={(val) => setEvent({ ...event, description: val })}
          style={[styles.input, { height: 80 }]}
          multiline
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          value={event.location}
          onChangeText={(val) => setEvent({ ...event, location: val })}
          style={styles.input}
        />

        <Text style={styles.label}>Date & Time</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateButton}>
          <Text style={styles.dateButtonText}>{date.toLocaleString()}</Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(e, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
          <Text style={styles.buttonText}>Update Event</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.buttonText}>Delete Event</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EditEventScreen;

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 20 : 40,
    paddingHorizontal: 16,
    backgroundColor: '#fff5f5',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ff5c5c',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#4caf50',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
