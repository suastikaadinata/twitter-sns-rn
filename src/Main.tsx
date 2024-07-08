/*
 * Created by Suastika Adinata on Mon Jul 08 2024
 * Copyright (c) 2024 - Made with love
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  View,
  Modal,
  BackHandler
} from 'react-native';
import Axios from 'axios';
import OAuth from 'oauth-1.0a';
import {Linking} from 'react-native';
import crypto from 'react-native-quick-crypto';
import { SafeAreaView } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
const CONSUMER_KEY = 'YOUR_CUSTOMER_KEY';
const CONSUMER_SECRET = 'YOUR_CUSTOMER_SECRET_KEY';
const TWITTER_API = 'https://api.twitter.com';
const OAUTH_CALLBACK_URL = 'twittersns://'

export default function Main({ navigation }: { navigation: any }){
    const [isOpenModal, setOpenModal] = useState(false)
    const [oauthToken, setOauthToken] = useState('')
    const [twitterAuthURL, setTwitterAuthURL] = useState('')
    const oauth = new OAuth({
        consumer: {
            key: CONSUMER_KEY,
            secret: CONSUMER_SECRET,
        },
        signature_method: 'HMAC-SHA1',
        hash_function: (baseString, key) => crypto.createHmac('sha1', key).update(baseString).digest('base64')
    });

    const signInWithTwitter = async () => {
        console.log("signInWithTwitter")
        const request_data = {
          url: TWITTER_API + '/oauth/request_token',
          method: 'POST',
          data: {
            oauth_callback: OAUTH_CALLBACK_URL,
          },
        };
    
        try {
          const res = await Axios.post(
            request_data.url,
            {},
            {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
          );
          const responseData = res.data;
          console.log("responseData", responseData)
          const requestToken = responseData.match(/oauth_token=([^&]+)/)[1];
          // now redirect user to twitter login screen
          const twitterLoginURL = TWITTER_API + `/oauth/authenticate?oauth_token=${requestToken}`;
          console.log('twitterLoginURL', twitterLoginURL);
        setOauthToken(requestToken)
        setTwitterAuthURL(twitterLoginURL)
        setOpenModal(true)
        } catch (error) {
          console.log(error);
        }
    };

    const getAccessToken = async (requestToken: string, oauthVerifier: string) => {
        const request_data = {
            url: TWITTER_API + '/oauth/access_token',
            method: 'POST',
            data: {
              oauth_token: requestToken,
              oauth_verifier: oauthVerifier,
            },
          };
    
          try {
            const res = await Axios.post(
              request_data.url,
              {},
              {headers: {...oauth.toHeader(oauth.authorize(request_data))}},
            );
            const responseData = res.data;
            const authToken = responseData.match(/oauth_token=([^&]+)/)[1];
            const authTokenSecret = responseData.match(
              /oauth_token_secret=([^&]+)/,
            )[1];
            getUserProfile(authToken, authTokenSecret)
            console.log('authToken', `${authToken}\nauthTokenSecret: ${
                authTokenSecret
              }`);
        }catch (error) {
            console.log(error);
        }
    }

    const getUserProfile = async(accessToken: any, accessTokenSecret: any) => {
        const url = TWITTER_API + '/1.1/account/verify_credentials.json?skip_status=true'
        const request_data = {
            url: url,
            method: 'GET',
        };
    
        const headers: any = oauth.toHeader(oauth.authorize(request_data, {
            key: accessToken,
            secret: accessTokenSecret
        }));
        
        try {
            const response = await Axios.get(url, { headers: headers });
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching Twitter profile:', error);
        }
    }

    const handleNavigationStateChange = (event: any) => {
        console.log("source change", event)
        const match = event.url.match(/\?oauth_token=.+&oauth_verifier=(.+)/);
        console.log("match", match)
        if(match && match.length > 1){
            setOpenModal(false)
            getAccessToken(oauthToken, match[1])
        }
  }

  return(
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
       <Modal visible={isOpenModal} animationType='slide'>
            <SafeAreaView style={{ flex: 1 }}>
                <WebView 
                    javaScriptEnabled={true}
                    javaScriptCanOpenWindowsAutomatically={true}
                    domStorageEnabled={true}
                    cacheEnabled={true}
                    startInLoadingState={true}
                    source={{ uri: twitterAuthURL }}
                    originWhitelist={['https://*', `${OAUTH_CALLBACK_URL}*`]}
                    // onNavigationStateChange={handleNavigationStateChange}
                    onShouldStartLoadWithRequest={(request) => {
                        const match = request.url.match(/\?oauth_token=.+&oauth_verifier=(.+)/);
                        console.log("match", match)
                        if(match && match.length > 1){
                            setOpenModal(false)
                            getAccessToken(oauthToken, match[1])
                        }
                        return true
                    }}
                />
            </SafeAreaView>
        </Modal> 
      <Button title='LOGIN TWITTER' onPress={signInWithTwitter}/>
    </View>
  )
}