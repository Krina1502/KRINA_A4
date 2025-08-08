// src/screens/FavoritesScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const userId = auth.currentUser.uid;

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'events'),
        where('favorites', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFavorites(data);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
    setLoading(false);
  };

  // This will run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const toggleFavorite = async (event) => {
    const eventRef = doc(db, 'events', event.id);
    try {
      await updateDoc(eventRef, {
        favorites: event.favorites.filter(uid => uid !== userId)
      });
      // Refresh favorite events list instantly after removing
      loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.eventItem}>
      <View style={{ flex: 1 }}>
        <Text style={styles.eventTitle}>{item.title}</Text>
        <Text>{new Date(item.date.seconds * 1000).toLocaleString()}</Text>
        <Text numberOfLines={1} ellipsizeMode="tail">{item.description}</Text>
      </View>

      <TouchableOpacity onPress={() => toggleFavorite(item)} style={{ paddingLeft: 10 }}>
        <Ionicons name="heart" size={28} color="#ff5c5c" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#ff5c5c" style={{ flex: 1, justifyContent: 'center' }} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorite Events</Text>
      <FlatList
        data={favorites}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No favorite events.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#ff5c5c',
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTitle: { fontSize: 18, fontWeight: '600', marginBottom: 4 },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
    color: 'gray',
  },
});
