const firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAJqTS8RB1AUW9H5xcQAp3L_PiZmE3_O7I",
    authDomain: "sisiml.firebaseapp.com",
    databaseURL: "https://sisiml.firebaseio.com",
    projectId: "sisiml",
    storageBucket: "sisiml.appspot.com",
    messagingSenderId: "945313104609",
    appId: "1:945313104609:web:959d1762440556ea862da0"
  };

  firebase.initializeApp(firebaseConfig);

module.exports = firebase;