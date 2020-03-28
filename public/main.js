console.log("Hello World")

// intializing firebase
var firebaseConfig = {
            apiKey: "AIzaSyDVNjIbMmbypslaxmNyfL1L-JV4-F59_GI",
            authDomain: "hows-business.firebaseapp.com",
            databaseURL: "https://hows-business.firebaseio.com",
            projectId: "hows-business",
            storageBucket: "hows-business.appspot.com",
            messagingSenderId: "1036901774461",
            appId: "1:1036901774461:web:419df3d65faa4e37ec2d14",
            measurementId: "G-736BDT2FXK"
          };
          // Initialize Firebase
          firebase.initializeApp(firebaseConfig);
          firebase.analytics();
          var db = firebase.firestore();

function submitData() {
    console.log("Submitting data...")
    db.collection("users").add({
        first: "Ada",
        last: "Lovelace",
        born: 1815
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
 }

