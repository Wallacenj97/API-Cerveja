import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('beer.db');

const Gelada = () => {
  const [beerData, setBeerData] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    createBeerTable();
    loadSearchHistory();
  }, []);

  const createBeerTable = () => {
    db.transaction(tx => {
      tx.executeSql(
        `
        CREATE TABLE IF NOT EXISTS beers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          brand TEXT,
          name TEXT,
          style TEXT,
          yeast TEXT,
          malts TEXT,
          alcohol TEXT
        )
        `
      );
    });
  };

  const fetchRandomBeer = async () => {
    try {
      const response = await fetch('https://random-data-api.com/api/beer/random_beer');
      const data = await response.json();
      setBeerData(data);

      db.transaction(tx => {
        if (tx.executeSql) {
          tx.executeSql(
            'INSERT INTO beers (brand, name, style, yeast, malts, alcohol) VALUES (?, ?, ?, ?, ?, ?)',
            [data.brand, data.name, data.style, data.yeast, data.malts, data.alcohol],
            (_, resultSet) => {
              if (resultSet.rowsAffected > 0) {
                console.log('Cerveja inserida!');
              }
            },
            (_, error) => {
              console.error('Erro ao inserir!', error);
            }
          );
        } else {
          console.warn('executeSql is not available');
        }
      });

      loadSearchHistory();
    } catch (error) {
      console.error('Erro ao carregar:', error);
    }
  };

  const loadSearchHistory = () => {
    db.transaction(tx => {
      if (tx.executeSql) {
        tx.executeSql('SELECT * FROM beers', [], (_, resultSet) => {
          const entries = resultSet.rows.raw().map(row => ({
            id: row.id,
            brand: row.brand,
            name: row.name,
            style: row.style,
            yeast: row.yeast,
            malts: row.malts,
            alcohol: row.alcohol,
          }));
          setSearchHistory(entries);
        });
      } else {
        console.warn('executeSql is not available');
      }
    });
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity onPress={() => showBeerDetails(item)}>
      <View style={styles.searchItem}>
        <Text style={styles.searchItemText}>Brand: {item.brand}</Text>
        <Text style={styles.searchItemText}>Name: {item.name}</Text>
        <Text style={styles.searchItemText}>Style: {item.style}</Text>
      </View>
    </TouchableOpacity>
  );

  const showBeerDetails = beer => {
    setBeerData(beer);
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Desce uma gelada" onPress={fetchRandomBeer} color="orange" />
      </View>

      {beerData && (
        <View style={styles.beerDetails}>
          <Text style={styles.beerDetailText}>Brand: {beerData.brand}</Text>
          <Text style={styles.beerDetailText}>Name: {beerData.name}</Text>
          <Text style={styles.beerDetailText}>Style: {beerData.style}</Text>
          <Text style={styles.beerDetailText}>Yeast: {beerData.yeast}</Text>
          <Text style={styles.beerDetailText}>Malts: {beerData.malts}</Text>
          <Text style={styles.beerDetailText}>Alcohol: {beerData.alcohol}</Text>
        </View>
      )}

      <Text style={styles.searchHistoryTitle}>Na mesa:</Text>
      <FlatList
        data={searchHistory}
        renderItem={renderSearchItem}
        keyExtractor={item => item.id.toString()}
        ItemSeparatorComponent={renderSeparator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '45%',
  },
  buttonContainer: {
    marginTop: 20,
  },
  beerDetails: {
    marginBottom: 20,
  },
  beerDetailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  searchHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});


export default Gelada;
