import React,{useState, useEffect, useCallback, useContext} from 'react'
import {Image,Text,TouchableOpacity,ImageBackground, StyleSheet,TextInput,StatusBar, } from 'react-native'
import countries from '../Data/countries'
import SelectCountry from '../components/SelectCountry'
import {NativeModules} from 'react-native' 
import { Container,Content, Icon,Left, CardItem, Right, Body } from 'native-base';
import {fontbold, fontfamily, fontmedium, greentext, white,} from '../constants/colors'
import styles from '../styles/RegisterScreenStyle'
import {Context as RegisterationContext} from '../context/RegisterationContext'
import auth from '@react-native-firebase/auth';
import { Dimensions } from 'react-native';
import {isPortrait, normalize} from '../actions/Functions'
import { LoginManager, AccessToken, GraphRequest, GraphRequestManager} from "react-native-fbsdk";
import { GoogleSignin,statusCodes,} from '@react-native-community/google-signin';
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const {GetCountryCodeModules} = NativeModules;
import {transparentcolor} from '../constants/constants'
import Modal from 'react-native-modal';
import { ActivityIndicator } from 'react-native'

    const RegisterScreen  = ({navigation}) =>{
        const [mobilenumber, setmobilenumber] = useState('3333333444'); // 12345432112
        const [isValidMobileNumber, setIsValidMobileNumber] = useState(true);
        const [myorientation, setOrientation] = useState(isPortrait() ? 'portrait' : 'landscape')
        const [isLoading, setLoading] = useState(false)
        const [visible, setVisible] = useState(false)
        const [defalutCountry, setDefaultCountry] = useState({ "callingCode": '92',  "code": "PK",  "name": "Pakistan",  "flag":"https://www.countryflags.io/PK/flat/64.png"})
        const {OTPconformation} = useContext(RegisterationContext);
        useEffect(() =>{
            GetCountryCodeModules.getcountrycode().then((countrycode) =>{
                var results = findByMatchingProperties(countries[0].items, { code: `${countrycode}`.toLocaleUpperCase()});
              //  setDefaultCountry(results[0])
            });

            Dimensions.addEventListener('change', () => {
                setOrientation(isPortrait() ? 'portrait' : 'landscape')
            })
            configureGoogleSignIn();
        },[])

       
       
        function findByMatchingProperties(countries, country_code) {
            return countries.filter(function (entry) {
                return Object.keys(country_code).every(function (key) {
                    return entry[key] === country_code[key];
                });
            });
        }

        const signInWithPhoneNumber = async (phoneNumber) =>  {
            setLoading(true)
            if(phoneNumber.length < 9){
                setLoading(false)
                setIsValidMobileNumber(false)
                return;
              }else{
                setIsValidMobileNumber(true)
            }
            const number = phoneUtil.parseAndKeepRawInput(phoneNumber, defalutCountry.code.toUpperCase());
            
            if(!(phoneUtil.isValidNumberForRegion(number, defalutCountry.code.toUpperCase()))){
                setLoading(false)
                setIsValidMobileNumber(false);
                return;
            }else{
                setIsValidMobileNumber(true);
                auth().signInWithPhoneNumber(phoneUtil.format(number, PNF.E164)).then(async (confirmResult) =>{
                    OTPconformation(confirmResult)
                    navigation.navigate("OTPScreen",{num:phoneUtil.format(number, PNF.E164)})
                    setLoading(false)
                }).catch((error) => {
                    console.log(error);
                    alert('Some thing Went Wrong')
                    setLoading(false)
                });
               
            }       
        }

        const  configureGoogleSignIn = () =>  {
            try {
                GoogleSignin.configure({webClientId:"166945368943-oos7vbpl4p5jqqc8a85au3vlrd5numha.apps.googleusercontent.com"})
            }catch(error){
                console.log(error, "Error in config")
            }
        }

        // const GooglesignIn = async () => {
        //     setLoading(true)
        //     try {
        //         GoogleSignin.hasPlayServices({ 
        //             autoResolve: true ,
        //             showPlayServicesUpdateDialog: true
        //         }).then((kk) => {
                    
        //         })
        //         .catch((err) => {
        //             console.log(err, "Error")
        //         })
        //         const userInfo = await GoogleSignin.signIn();
        //         const googleCredential = auth.GoogleAuthProvider.credential(userInfo.idToken);
        //         auth().signInWithCredential(googleCredential).then((data) => {
        //             console.log(data)
        //            navigation.navigate("SocialProfileScreen",{
        //                name:data.user.displayName, 
        //                email:data.user.email,
        //                photo:data.user.photoURL
        //             })
        //             setLoading(false)
        //         }).catch((error) => {
        //             setLoading(false);
        //             console.log(error, 'Some Error')
        //         })
        //     } catch (error) {
        //         console.log(error, 'Error')
        //         switch (error.code) {
        //             case statusCodes.SIGN_IN_CANCELLED:
        //                 setLoading(false)
        //                 alert('Sign In Cancelled')
        //             break;
        //             case statusCodes.IN_PROGRESS:
        //                 setLoading(false)
        //                 alert('SignIn In Preogress')
        //             break;
        //             case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
        //                 setLoading(false)
        //                 alert('Google Play Services Not avaliable')
        //             break;
        //             default:
        //                 setLoading(false)
        //                 alert('Some Error Occured')
        //         }
        //     }
        // };
    
        
        // const faceboooklogin  = () =>{
        //     setLoading(true)
        //     LoginManager.logInWithPermissions(["public_profile", 'email',]).then(
        //         async function(result) {
        //             if (result.isCancelled) {
        //                 setLoading(false)
        //                 alert("Loginnded cancelled");
                        
        //             } else {
        //                 const data =  await AccessToken.getCurrentAccessToken();
                        
        //                 if (!data) {
        //                     alert('Something went wrong. please try again.');
        //                     setLoading(false)
        //                     return;
        //                 }
        //                 const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
                        
        //                 auth().signInWithCredential(facebookCredential).then(async (data) => {
        //                     // navigate here to socil profile screen,
        //                     let kk = await getFacebookEmail();
        //                     if(kk !== null){
        //                             console.log(kk)
        //                     }else{
        //                         alert('Error in retreving data')
        //                     }
        //                     console.log(data)
        //                     setLoading(false);
        //                 }).catch(async (error) =>{
        //                     if(error.code === "auth/account-exists-with-different-credential"){
        //                         const email = await getFacebookEmail();
        //                         if(email){
        //                             try{
        //                                 // Get sign-in methods for this email.
        //                                 auth().fetchSignInMethodsForEmail("engr.aftabufaq@gmail.com").then(function(methods) {
        //                                       if(methods[0] === 'google.com'){
        //                                           alert("You have already signin with google. Please use google signIn");
        //                                           setLoading(false)
        //                                       }
        //                                 }).catch((error) => {
        //                                     alert('Something went wrong. please try again.');
        //                                     setLoading(false);
        //                                 })
        //                             }catch(error){
        //                                 alert('Something went wrong. please try again.');
        //                                 setLoading(false);
        //                             }
        //                         }
        //                     }
        //                 })
        //             }
        //         },
        //         function(error) {
        //             console.log("Login fail with error: " + error);
        //         }
        //     );
        // }

        return(
            <Container style={styles.container}> 
                <ImageBackground 
                    source={require('../assets/resgister_bg.png')}
                    resizeMode="cover" 
                    style={{...StyleSheet.absoluteFillObject}}>    
                    <StatusBar backgroundColor="rgba(0, 150, 255,.9)" barStyle={"light-content"} hidden={false} />
                    <Content 
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom:10,}}
                        style={[styles.content,{ 
                            marginLeft:isPortrait()?normalize(20):normalize(120), 
                            marginRight:isPortrait()?normalize(20):normalize(120),
                        }]}
                    >  
                        
                        <Text style={{color:white, fontSize:normalize(19), fontFamily:fontbold}} >Enter your phone Number</Text>
                        <Text style={{color:white, fontSize:normalize(15), fontFamily:fontfamily}} >Select your country and enter your phone nubmer</Text>
                        <SelectCountry defalutCountry={defalutCountry} setDefaultCountry={setDefaultCountry} visible={visible} setVisible={setVisible}  />
                        <CardItem button  onPress={() => setVisible(true)}
                                style={{flexDirection:"column", alignItems:"flex-start", backgroundColor:'transparent'}} >
                                
                                <Left style={{alignSelf:"flex-start" , marginBottom:normalize(8)}}>
                                    <Text  adjustsFontSizeToFit style={{color:white, fontSize:normalize(16), fontFamily:fontfamily }} >Country{"     "}</Text>
                                    <Icon name="md-location" style={{fontSize:normalize(14), color:white}} />
                                </Left>
                                
                                <Left style={{borderBottomColor:transparentcolor, paddingBottom:5, borderBottomWidth:1, backgroundColor:"transparent"}}>
                                    <TouchableOpacity>
                                        <Text style={{color:white,fontSize:normalize(16),fontFamily:fontfamily}} >{defalutCountry.name}</Text>
                                    </TouchableOpacity>
                                    
                                    <Right>
                                        <Icon name="md-arrow-down-circle" style={{fontSize:normalize(16), color:white}} />
                                    </Right>
                                </Left>

                            </CardItem>
                        <Text></Text>
                        <CardItem style={{height:normalize(30), backgroundColor:"transparent"}}>
                            <Left>
                                <Text style={{color:white,fontSize:normalize(14),fontFamily:fontfamily}} >Code{"     "}</Text>
                            </Left>
                        </CardItem>

                        <CardItem  style={{height:normalize(50),backgroundColor:"transparent"}}>
                            <Left style={{backgroundColor:"transparent"}}>
                                <TextInput style={[styles.textinput,{backgroundColor:"transparent"}]}
                                    value={`+${defalutCountry.callingCode}`}
                                />
                                <Body style={{paddingLeft:25}}>
                                    <TextInput style={styles.textinput}
                                        value={mobilenumber}
                                        placeholder="Mobile Number"
                                        placeholderTextColor="#fff"
                                        keyboardType="phone-pad"
                                        onChangeText={(text) => setmobilenumber(text)}
                                    />
                                    {isValidMobileNumber?null:
                                        <Text style={{color:'red',fontSize:10, fontFamily:fontfamily}} >*Please Enter valid Number</Text>
                                    } 
                                </Body>
                            </Left>
                        </CardItem>
                                
                        <TouchableOpacity onPress={() => signInWithPhoneNumber(mobilenumber) } 
                                style={[styles.register_button,{marginVertical:normalize(18), minWidth:130, paddingHorizontal:30, backgroundColor:(isValidMobileNumber)?greentext:"#EEE", }]} >
                            <Text style={[styles.buttonText,{color:(isValidMobileNumber)?white:"#EEE", textAlign:"center" }]} >Continue</Text> 
                        </TouchableOpacity>

                        <CardItem style={{backgroundColor:"rgba(0,0,0,.4)",borderRadius:10, marginBottom:30, flexDirection:"column", padding:10,}}>
                            <Text style={styles1.orsiginintext} >Sign In with </Text>    
                            <CardItem  style={{backgroundColor:"transparent", marginTop:normalize(5), justifyContent:"center"}}>
                                <TouchableOpacity onPress={() => faceboooklogin()} style={{marginRight:10}}> 
                                    <Image
                                        onError={() => console.log('Error')}
                                        onLoad={() => console.log('On Load')}
                                        onLoadStart={() => console.log("onLoadStart")}
                                        onLoadEnd={() => console.log('onLoadEnd')}
                                        style={{width:normalize(35), height:normalize(35)}}
                                        source={require('../assets/facebook_icon.png')}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => GooglesignIn()}> 
                                    <Image
                                        style={{width:normalize(35), height:normalize(35)}}
                                        source={require('../assets/google_icon.png')}
                                    />
                                </TouchableOpacity>
                            </CardItem>
                        </CardItem>
                    </Content>
 
                   
                </ImageBackground> 
                <Modal 
                        style={{ flex: 1, ...StyleSheet.absoluteFillObject, backgroundColor:"transparent"}}
                        animationIn="slideInUp"
                        animationInTiming={100}
                        animationOut="slideOutUp"
                        animationOutTiming={1000}
                        hideModalContentWhileAnimatin={true}
                        useNativeDriverForBackdrop={false}
                        isVisible={isLoading}
                    >
                        <Container style={{alignSelf:"center", justifyContent:"center", alignItems:"center",
                         maxHeight:100, backgroundColor:"#fff", width:'95%', borderRadius:20 }}>
                            <ActivityIndicator color={"green"} size={"large"} />
                            <Text style={{color:"rgba(0,0,0,.8)", fontFamily:fontmedium}}>Please Wait</Text>
                        </Container>
                    </Modal>
            </Container>
        )    
    }
  

    export default RegisterScreen;

const styles1 = StyleSheet.create({
    orsiginintext:{
        color:white, 
        textAlign:"center", 
        fontSize:normalize(15), 
        marginTop:normalize(5), 
        fontFamily:fontbold
    },

});
