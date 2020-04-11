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
var collection = "";
// grab from collection accordingly
if (document.URL == "http://localhost:5000/") {
    collection = "qa_data";
} else if (document.URL == "https://hows-business.firebaseapp.com/"){
    collection = "prod_data";
}
db.collection(collection).get().then(function(querySnapshot) {
    querySnapshot.forEach(function(doc) {
        // doc.data() is never undefined for query doc snapshots
        //console.log(doc.id, " => ", doc.data());
        data_list.push(doc.data());
    });
    console.log(data_list);

    // calculate average ratings
    day_rating_sum = 0;
    week_rating_sum = 0;
    month_rating_sum = 0;
    day_no_rating_count = 0;
    week_no_rating_count = 0;
    month_no_rating_count = 0;
    var dates_for_this_week = [];
    for (var i = 1; i < 8; i++) {
        dates_for_this_week.push(`${getDateWithinWeek(new Date(), i)}`.substr(4,11));
    }
    data_list.forEach((element) => {
        // if date is today
        if (element.date == (`${Date()}`.substr(4,11))) {
            if (element.today_rating == '0')
                day_no_rating_count += 1;
            else
                day_rating_sum += element.today_rating;
        } else {
            day_no_rating_count += 1;
        }
        // if date is this week
        if (dates_for_this_week.indexOf(element.date) > -1) {
            if (element.week_rating == '0')
                week_no_rating_count += 1;
            else
                week_rating_sum += element.week_rating;
        } else {
            week_no_rating_count += 1;
        }
        // if date is this month
        if (element.date.substr(0,4) + element.date.substr(7,4) == (`${Date()}`.substr(4,3) + `${Date()}`.substr(10,5))) {
            if (element.month_rating == '0')
                month_no_rating_count += 1;
            else
                month_rating_sum += element.month_rating;
        } else {
            month_no_rating_count += 1;
        }
    })
    // calculate averages (does not count occurences where rating is 0
    day_rating_average = Math.round(day_rating_sum/(data_list.length - day_no_rating_count) * 10) / 10;
    week_rating_average = Math.round(week_rating_sum/(data_list.length - week_no_rating_count) * 10) / 10;
    month_rating_average = Math.round(month_rating_sum/(data_list.length - month_no_rating_count) * 10) / 10;
    document.getElementById("today_average_number").innerHTML = day_rating_average;
    document.getElementById("week_average_number").innerHTML = week_rating_average;
    document.getElementById("month_average_number").innerHTML = month_rating_average;

    // bar plot day (Actually gets yesterday's data)
    var date = new Date();
    date.setDate(date.getDate() - 1);
    bar_x = ['1', '2', '3', '4', '5'];
    bar_y = [0, 0, 0, 0, 0];
    data_list.forEach((element) => {
        if (element.date == (`${date}`.substr(4,11))) {
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
            type: 'bar',
            width: [0.7, 0.7, 0.7, 0.7, 0.7]
        }
    ];

    var layout = {
        title: 'Yesterday\'s Ratings',
        xaxis: {
            title: 'Rating',
            tickmode: 'linear'
        },
        yaxis: {
            title: 'Count',
            rangemode: 'tozero'
        }
    };

    var config = {responsive: true};

    Plotly.newPlot('bar_plot_day', data, layout, config);

    // bar plot week
    bar_x = ['1', '2', '3', '4', '5'];
    bar_y = [0, 0, 0, 0, 0];
    var dates_for_this_week = [];
    for (var i = -6; i < 1; i++) {
        dates_for_this_week.push(`${getDateWithinWeek(new Date(), i)}`.substr(4,11));
    }
    console.log(dates_for_this_week);
    data_list.forEach((element) => {
        if (dates_for_this_week.indexOf(element.date) > -1) {
            if (element.week_rating == 1) {
                bar_y[0]++;
            } else if (element.week_rating == 2) {
                bar_y[1]++;
            } else if (element.week_rating == 3) {
                bar_y[2]++;
            } else if (element.week_rating == 4) {
                bar_y[3]++;
            } else if (element.week_rating == 5) {
                bar_y[4]++;
            }
        }
    });

    var data = [
        {
            x: bar_x,
            y: bar_y,
            type: 'bar',
            width: [0.7, 0.7, 0.7, 0.7, 0.7]
        }
    ];

    var layout = {
        title: 'Last Week\'s Ratings',
        xaxis: {
            title: 'Rating',
            tickmode: 'linear'
        },
        yaxis: {
            title: 'Count',
            rangemode: 'tozero'
        }
    };

    var config = {responsive: true};

    Plotly.newPlot('bar_plot_week', data, layout, config);

    // bar plot month
    bar_x = ['1', '2', '3', '4', '5'];
    bar_y = [0, 0, 0, 0, 0];
    var date_last_month = new Date();
    date_last_month.setMonth(date_last_month.getMonth() - 1)
    date_last_month = `${date_last_month}`.substr(4,3) + `${date_last_month}`.substr(10,5)
    console.log(date_last_month);
    data_list.forEach((element) => {
        if (element.date.substr(0,4) + element.date.substr(7,4) == date_last_month) {
            if (element.month_rating == 1) {
                bar_y[0]++;
            } else if (element.month_rating == 2) {
                bar_y[1]++;
            } else if (element.month_rating == 3) {
                bar_y[2]++;
            } else if (element.month_rating == 4) {
                bar_y[3]++;
            } else if (element.month_rating == 5) {
                bar_y[4]++;
            }
        }
    });
    var data = [
        {
            x: bar_x,
            y: bar_y,
            type: 'bar',
            width: [0.7, 0.7, 0.7, 0.7, 0.7]
        }
    ];

    var layout = {
        title: 'Last Month\'s Ratings',
        xaxis: {
            title: 'Rating',
            tickmode: 'linear'
        },
        yaxis: {
            title: 'Count',
            rangemode: 'tozero'
        }
    };

    var config = {responsive: true};

    Plotly.newPlot('bar_plot_month', data, layout, config);

    // line plot average
    dates_for_last_31_days_list = [];
    dates_for_last_31_days_dict = {};
    y_list = []
    var today = new Date();
    //get last 31 days daily ratings
    for (var i = 30; i >= 0; i--) {
        y_list.push(0);
        dates_for_last_31_days_list.push(`${new Date(new Date().setDate(today.getDate() - i))}`.substr(4,11));
        dates_for_last_31_days_dict[`${new Date(new Date().setDate(today.getDate() - i))}`.substr(4,11)] = [];
        dates_for_last_31_days_dict[`${new Date(new Date().setDate(today.getDate() - i))}`.substr(4,11)].push([30-i]);
        dates_for_last_31_days_dict[`${new Date(new Date().setDate(today.getDate() - i))}`.substr(4,11)].push([]);
    }
    console.log(dates_for_last_31_days_list);
    console.log(dates_for_last_31_days_dict);
    data_list.forEach((element) => {
        if (dates_for_last_31_days_list.indexOf(element.date) > -1) {
            console.log(element.date);
            dates_for_last_31_days_dict[element.date][1].push(element.today_rating);
        }
    })
    console.log(dates_for_last_31_days_dict);
    // calculate average for each day
    for (var key in dates_for_last_31_days_dict) {
        value_array = dates_for_last_31_days_dict[key][1];
        if (value_array.length > 0) {
            var count = 0;
            var sum = 0
            value_array.forEach((element) => {
                if (element > 0) {
                    count++;
                    sum += element;
                }
            })
            average = Math.round(sum/count * 10) / 10;
            console.log(average);
            dates_for_last_31_days_dict[key][1] = average;
        }
    }
    // set up lists for plot
    for (i = 0; i < dates_for_last_31_days_list.length; i++){
        dates_for_last_31_days_list[i] = dates_for_last_31_days_list[i].substr(0,6);
    }
    x_list = dates_for_last_31_days_list;
    for (var key in dates_for_last_31_days_dict) {
        index = dates_for_last_31_days_dict[key][0];
        if (dates_for_last_31_days_dict[key][1] > 0) {
            y_list[index] = dates_for_last_31_days_dict[key][1];
        } else {
            y_list[index] = null;
        }
    }
    console.log(y_list)
    var trace1 = {
      x: x_list,
      y: y_list,
      type: 'scatter'
    };

    var data = [trace1];

    var layout = {
        title: 'Average Rating Over A Month',
        yaxis: {
            range: [0, 5],
            tickmode: 'linear',
            title: 'Rating',
        },
        xaxis: {
            title: 'Date'
        }
    }

    var config = {responsive: true};

    Plotly.newPlot('line_plot_average', data, layout, config);
});

/*****FUNCTIONS*****/

// get a specific date relative to the current week
function getDateWithinWeek(d, offset) {
  d = new Date(d);
  var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? offset-7:offset); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

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

