import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React, {useState, useContext, useEffect} from 'react';
import {GiftedChat, Bubble} from 'react-native-gifted-chat';
import Voice from '@react-native-community/voice';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import {BASE_URL} from '../config';

import Header from '../components/Header';
import {AuthContext} from '../context/AuthContext';

const VoiceChat = ({chatId, handleMode}) => {
  const {userToken, userProfile} = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const [randomId, setRandomId] = useState(0);
  const [result, setResult] = useState('');

  const speechStartHandler = e => {};

  const speechEndHandler = e => {
    setRecording(false);
  };
  const speechResultsHandler = e => {
    const text = e.value[0];
    setResult(text);
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, [
        {
          _id: randomId + 1,
          text: text,
          createdAt: new Date(),
          user: {
            _id: userProfile.id,
            name: userProfile.name,
          },
        },
      ]),
    );
    setRandomId(randomId + 1);
  };

  const speechErrorHandler = e => {
    setRecording(false);
  };

  const startRecording = async () => {
    setRecording(true);
    try {
      await Voice.start('id-ID');
    } catch (err) {
      // handle error
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
      setRecording(false);
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    axios
      .get(`${BASE_URL}/messages/${chatId}`, {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      })
      .then(res => {
        setMessages(res.data.data);
      })
      .catch(err => {
        // handle error
      });

    // voice handler events
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    Voice.onSpeechError = speechErrorHandler;

    return () => {
      // destroy the voice instance after component unmounts
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (result != '') {
      axios
        .post(
          `${BASE_URL}/message`,
          {
            chat_id: chatId,
            content: result,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${userToken}`,
            },
          },
        )
        .then(res => {
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, res.data.data),
          );
        })
        .catch(err => {
          // handle error
          console.log(err);
        });
    }
  }, [result]);

  return (
    <View style={{flex: 1, backgroundColor: '#F5F5F7'}}>
      {/* <Header title="Obrolan Suara" btnLeft="enabled" btnRight="disabled" /> */}
      <GiftedChat
        messages={messages}
        renderAvatar={() => {}}
        scrollToBottom={true}
        alwaysShowSend={true}
        renderLoading={() => (
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Memuat chat...</Text>
            <Text>
              TIPS: Jika pesan lama dimuat silahkan kembali ke menu lalu coba
              lagi.
            </Text>
          </View>
        )}
        textInputStyle={styles.defaultInput}
        onSend={messages => onSend(messages)}
        user={{
          _id: userProfile.id,
          name: userProfile.name,
        }}
        renderBubble={props => {
          return (
            <Bubble
              {...props}
              textStyle={styles.bubbleText}
              wrapperStyle={styles.bubbleWrapper}
            />
          );
        }}
        renderInputToolbar={() => {}}
        minInputToolbarHeight={0}
        maxComposerHeight={0}
        minComposerHeight={0}
      />
      <View
        style={{
          padding: 20,
          backgroundColor: '#ffffff',
          elevation: 2,
        }}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}></View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            {recording ? (
              <>
                <TouchableOpacity onPress={stopRecording}>
                  <Image source={require('../images/listening.png')} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={startRecording}>
                  <Image source={require('../images/recording.png')} />
                </TouchableOpacity>
              </>
            )}
          </View>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableOpacity style={{marginLeft: 10}} onPress={handleMode}>
              <View style={styles.btnSubmit}>
                <Icon name="keyboard" size={20} color={'#ffffff'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={{marginBottom: 20, textAlign: 'center'}}>
          {recording ? 'Mendengarkan...' : 'Tekan untuk bicara'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleText: {
    left: {
      color: '#313131',
    },
    right: {
      color: '#ffffff',
    },
  },
  bubbleWrapper: {
    left: {
      backgroundColor: '#ffffff',
      padding: 5,
      marginBottom: 10,
      elevation: 2,
    },
    right: {
      backgroundColor: '#7286D3',
      padding: 5,
      marginBottom: 10,
      elevation: 2,
    },
  },
  btnSubmit: {
    backgroundColor: '#7286D3',
    width: 40,
    height: 40,
    borderRadius: 25,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VoiceChat;
