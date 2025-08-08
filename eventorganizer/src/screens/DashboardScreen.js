
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = auth.currentUser.uid;

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const toggleFavorite = async (event) => {
    const eventRef = doc(db, 'events', event.id);
    try {
      if (event.favorites && event.favorites.includes(userId)) {
        // Remove user from favorites
        await updateDoc(eventRef, {
          favorites: event.favorites.filter(uid => uid !== userId)
        });
      } else {
        // Add user to favorites
        await updateDoc(eventRef, {
          favorites: [...(event.favorites || []), userId]
        });
      }
      // Refresh events list after toggle
      fetchEvents();
    } catch (error) {
      console.error("Error toggling favorite: ", error);
    }
  };

  const renderItem = ({ item }) => {
    const isFavorited = item.favorites?.includes(userId);
    return (
      <View style={styles.eventItem}>
        <TouchableOpacity
          onPress={() => navigation.navigate('EditEvent', { eventId: item.id })}
          style={{ flex: 1 }}
        >
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text>{new Date(item.date.seconds * 1000).toLocaleString()}</Text>
          <Text numberOfLines={1} ellipsizeMode="tail">Description: {item.description}</Text>
          <Text>Location: {item.location || 'N/A'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ paddingLeft: 10 }}>
          <Ionicons
            name={isFavorited ? 'heart' : 'heart-outline'}
            size={28}
            color={isFavorited ? '#ff5c5c' : 'gray'}
          />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ff5c5c" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Events</Text>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No events available.</Text>}
      />

        
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 12, color: '#ff5c5c' },
  eventItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  empty: { textAlign: 'center', marginTop: 30, fontStyle: 'italic', color: 'gray' },
  createButton: {
    backgroundColor: '#ff5c5c',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 30,
    marginTop: 20,
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 8,
    fontWeight: 'bold',
  },
});
