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

// colors
grey = "rgb(128, 128, 128)";
light_grey = "rgb(191, 189, 187)";

// select number on click
rating_numbers = document.querySelectorAll(".survey_ratings li");
for (i = 0; i < rating_numbers.length; i++) {
    rating_numbers[i].pseudo_selected = 0;
    rating_numbers[i].pseudo_position = i;

    rating_numbers[i].addEventListener('click', function() {
        if (this.pseudo_selected == 0) {
            if (this.pseudo_position < 5) {
                for (var j = 0; j < 5; j++) {
                    rating_numbers[j].pseudo_selected = 0;
                    rating_numbers[j].style.backgroundColor = light_grey;
                }
            } else if (this.pseudo_position > 4 && this.pseudo_position < 10) {
               for (var j = 5; j < 10; j++) {
                   rating_numbers[j].pseudo_selected = 0;
                   rating_numbers[j].style.backgroundColor = light_grey;
               }
            } else if (this.pseudo_position > 9 && this.pseudo_position < 15) {
                for (var j = 10; j < 15; j++) {
                    rating_numbers[j].pseudo_selected = 0;
                    rating_numbers[j].style.backgroundColor = light_grey;
                }
            }
            this.style.backgroundColor = grey;
            this.pseudo_selected = 1;
        }
        else if (this.pseudo_selected == 1) {
            this.pseudo_selected = 0;
            this.style.backgroundColor = light_grey;
        }
    }, false);

    rating_numbers[i].addEventListener('mouseover', function() {
        this.style.backgroundColor = grey;
    });

    rating_numbers[i].addEventListener('mouseout', function() {
        if (this.pseudo_selected == 0) {
            this.style.backgroundColor = light_grey;
        }
    });
}

// grab all data from firestore and plot graphs
data_list = []
db.collection("qa_data").get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        //console.log(doc.id, " => ", doc.data());
        data_list.push(doc.data());
    });
    console.log(data_list);

    // bar plot
    bar_x = ['1', '2', '3', '4', '5'];
    bar_y = [0, 0, 0, 0, 0];
    data_list.forEach((element) => {
        if (element.date == (`${Date()}`.substr(4,11))) {
            if (element.today_rating == 1) {
                bar_y[0]++;
            } else if (element.today_rating == 2) {
                bar_y[1]++;
            } else if (element.today_rating == 3) {
                bar_y[2]++;
            } else if (element.today_rating == 4) {
                bar_y[3]++;
            } else if (element.today_rating == 5) {
                bar_y[4]++;
            }
        }
    });
    var data = [
        {
            x: bar_x,
            y: bar_y,
            type: 'bar'
        }
    ];

    var layout = {
        title: 'Ratings Summary for the Day',
        xaxis: {title: 'Ratings'},
        yaxis: {title: 'Count'}
    };

    var config = {responsive: true};

    Plotly.newPlot('bar_plot', data, layout, config);
});

// setup data to upload to db
function submitData() {
    // getting the submitted data
    today_rating = 0;
    week_rating = 0;
    month_rating = 0;
    for (var i = 0; i < 5; i++) {
        if (rating_numbers[i].style.backgroundColor == "rgb(128, 128, 128)") {
            today_rating = parseInt(rating_numbers[i].innerHTML);
        }
    }
    for (var i = 5; i < 10; i++) {
        if (rating_numbers[i].style.backgroundColor == "rgb(128, 128, 128)") {
            week_rating = parseInt(rating_numbers[i].innerHTML);
        }
    }
    for (var i = 10; i < 15; i++) {
        if (rating_numbers[i].style.backgroundColor == "rgb(128, 128, 128)") {
            month_rating = parseInt(rating_numbers[i].innerHTML);
        }
    }

    // uploading data
    if (today_rating | week_rating | month_rating != 0) {
        console.log("Submitting data...")
        if (document.URL == "http://localhost:5000/") {
            upload_data("qa_data");
        } else if (document.URL == "https://hows-business.firebaseapp.com/"){
            upload_data("prod_data");
        }
    }
 }

// function to send data to db
 function upload_data(collection) {
    db.collection(collection).add({
        today_rating: today_rating,
        week_rating: week_rating,
        month_rating: month_rating,
        area_of_business: document.getElementById("survey_form").value,
        date: `${Date()}`.substr(4,11)
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        document.getElementById("survey_form").value = "Optional";
        location.reload();
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
 }

