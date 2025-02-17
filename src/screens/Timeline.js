import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import React, {useEffect, useContext, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {AuthContext} from '../context/AuthContext';
import axios from 'axios';
import {responsiveHeight, responsiveWidth} from '../components/Responsive';

import {BASE_URL} from '../config';

import Header from '../components/Header';
import Date from '../components/Date';

const Timeline = () => {
  const navigation = useNavigation();
  const {userToken, soon} = useContext(AuthContext);
  const [getTimeline, setGettimeline] = useState([]);
  const [description, setDescription] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const PostTimeLine = async () => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    };
    axios
      .post(
        `${BASE_URL}/post`,
        {
          description: description,
        },
        {
          headers: headers,
        },
      )
      .then(res => {
        // handle response
      })
      .catch(err => {
        //handle error
      })
      .finally(() => setIsLoading(false), onRefresh());
  };

  const DeleteTimeline = async id => {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${userToken}`,
    };

    axios.delete(`${BASE_URL}/post/${id}`, {headers}).then(res => {
      onRefresh();
    });
  };

  const fetchTimeLine = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/all-posts`);
      setGettimeline(res.data.data);
    } catch (error) {
      // handle error
    }
  };

  useEffect(() => {
    const unSubscribe = navigation.addListener('focus', () => {
      fetchTimeLine();
    });
    return unSubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 100);
    fetchTimeLine();
  };

  const DeleteFuntion = id =>
    Alert.alert('Hapus', 'Yakin menghapus komentar?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {text: `Hapus`, onPress: () => DeleteTimeline(id)},
    ]);

  return (
    <View style={{flex: 1}}>
      <Header title="Status" btnLeft="disabled" btnRight="disabled" />
      <View style={styles.create}>
        <Image style={styles.image} source={require('../images/user.png')} />
        <TextInput
          value={description}
          onChangeText={text => setDescription(text)}
          multiline
          style={{flex: 1, marginLeft: 15, color: 'grey'}}
          placeholder="Tulis cerita..."
          placeholderTextColor={'grey'}
        />
        <TouchableOpacity
          onPress={() => {
            description ? PostTimeLine(description) : '';
          }}
          style={{marginRight: 30, marginTop: 30}}>
          <Image
            style={{width: 25, height: 25}}
            source={require('../images/paper-plane.png')}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          backgroundColor: 'white',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
        onPress={() => soon()}>
        <Image
          style={{marginTop: 2}}
          source={require('../images/camera.png')}
        />
        <Text style={{marginLeft: 7, marginBottom: 15, color: '#7286D3'}}>
          Tambah gambar
        </Text>
      </TouchableOpacity>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        style={{backgroundColor: '#d9d9d9', flex: 1}}>
        {getTimeline.map((data, index) => (
          <View key={index}>
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: 'white',
                marginHorizontal: 25,
                marginTop: 25,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
              }}>
              <Image
                style={styles.image}
                source={require('../images/user.png')}
              />
              <View
                style={{
                  flexDirection: 'column',
                  flex: 1,
                  padding: 10,
                  marginTop: 10,
                }}>
                <Text style={{color: 'grey', fontWeight: 'bold'}}>
                  {data.user.name}
                </Text>
                <Date
                  style={{
                    fontWeight: 'normal',
                    fontSize: 12,
                  }}
                  timestamp={data.createdAt}
                />
                <Text style={{color: 'grey'}}>{data.description}</Text>
              </View>

              <TouchableOpacity
                onPress={() => DeleteFuntion(data.id)}
                key={data.id}>
                <Image
                  style={{
                    width: responsiveWidth(30),
                    height: responsiveHeight(30),
                    marginTop: 10,
                  }}
                  source={require('../images/more.png')}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                marginHorizontal: 25,
                backgroundColor: 'white',
                flexDirection: 'row',
                borderBottomLeftRadius: 15,
                borderBottomRightRadius: 15,
                marginBottom: 15,
              }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
                onPress={() => soon()}>
                <Image
                  style={{marginTop: 2}}
                  source={require('../images/circle-up.png')}
                />
                <Text style={{color: '#7286D3', marginHorizontal: 10}}>
                  0 Dukungan
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 15,
                }}
                // onPress={() =>
                //   navigation.navigate('Comment', {
                //     id: data.id,
                //   })
                // }
                onPress={() => soon()}
                key={data.id}>
                <Image
                  style={{marginTop: 2}}
                  source={require('../images/comment.png')}
                />
                <Text style={{color: '#7286D3', marginHorizontal: 10}}>
                  0 Komentar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 15,
    elevation: 2,
  },
  create: {
    backgroundColor: 'white',
    marginTop: 5,
    flexDirection: 'row',
  },
  image: {
    marginLeft: 25,
    marginTop: 25,
    marginBottom: 25,
    width: 40,
    height: 40,
  },
});

export default Timeline;
