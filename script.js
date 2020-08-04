$(document).ready(function () {
  $("#search-button").on("click", function () {
    var searchCity = $("#search-city").val();

    // clear input box
    $("#search-city").val("");
    searchWeather(searchCity);
  });

  $(".history").on("click", "li", function () {
    searchWeather($(this).text());
  });

  function makeRow(text) {
    var li = $("<li>").addClass("list-group-item list-group-item-action").text(text);
    $(".history").append(li);
  }

  var apiKey = "&appid=b014eef38a6844122ea9abe61cc6fca6"
  var CurrentURL = "https://api.openweathermap.org/data/2.5/weather?q="

  function searchWeather(searchCity) {
    $.ajax({
      type: 'GET',
      url: CurrentURL + searchCity + apiKey,
      dataType: "json",
      data: {
        units: "imperial"
      },
      success: function (data) {
        console.log(data)
        // create history link for this search
        if (history.indexOf(searchCity) === -1) {
          history.push(searchCity);
          window.localStorage.setItem("history", JSON.stringify(history));

          makeRow(searchCity);
          console.log(data);
        }
        $("#city").html(data.name);
        $("#description").html(data.weather[0].description);
        $("#icon").html("<img src='https://openweathermap.org/img/w/" + data.weather[0].icon + ".png'>");
        $("#temp").html("Temperatue: " + data.main.temp + " °F");
        $("#humidity").html("Humidity: " + data.main.humidity + "%");
        $("#speed").html("Wind Speed: " + data.wind.speed + " mph");

        getForecast(searchCity);
        getUVIndex(data.coord.lat, data.coord.lon);
      }
    });
  }

  var apiKey2 = "b014eef38a6844122ea9abe61cc6fca6"
  var ForecastURL = "https://api.openweathermap.org/data/2.5/forecast?q="

  function getForecast(searchCity) {
    $.ajax({
      type: 'GET',
      url: ForecastURL + searchCity + apiKey,
      dataType: "json",
      data: {
        units: "imperial",
      },
      success: function (data) {
        // overwrite any existing content with title and empty row
        console.log('Received data:', data) // For testing
        $("#fiveDayForecast").empty();

        // loop over all forecasts (by 3-hour increments)
        for (var i = 0; i < data.list.length; i++) {
          // only look at forecasts around 3:00pm
          if (data.list[i].dt_txt.indexOf("15:00:00") !== -1) {
            console.log('Received data:', data)
            // create html elements for a bootstrap card
            var forecastTemp = data.list[i].main.temp;
            var forecastHumidity = (data.list[i].main.humidity);
            var img = $("<img>").attr("src", "https://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png");
            var col = $("<div>").addClass("col-lg-2 card-wrapper");
            var card = $("<div>").addClass("card");
            var cardHeader = $("<div>").addClass("card-header");
            cardHeader.text(new Date(data.list[i].dt_txt).toLocaleDateString());
            var cardBody = $("<div>").addClass("card-body");
            cardBody.html("<strong>" + forecastTemp.toFixed(2) + " &degF" + "</strong>" + "<br>" + "Humidity: " + forecastHumidity + "%" + "<br>");

            // 5-day forecast CSS
            cardHeader.css("background", "#E84A5F").css("color", "white").css("fontWeight", "bold");
            cardBody.css("color", "3E8AC1");
            img.css("width", "25%");

            // merge together and put on page
            card.append(cardHeader, img, cardBody);
            col.append(card);
            $("#fiveDayForecast").append(col)
          }
        }
      }
    });
  }

  var UVIndexURL = "https://api.openweathermap.org/data/2.5/uvi?appid="

  function getUVIndex(lat, lon) {
    $.ajax({
      type: "GET",
      url: UVIndexURL + apiKey2 + "&lat=" + lat + "&lon=" + lon,
      dataType: "json",

      success: function (data) {
        console.log(data)
        $("#index").empty();
        var uv = $("<p>").text("UV Index: ");
        var btn = $("<span>").addClass("btn btn-sm").text(data.value);

        // change color depending on uv value
        if (data.value >= 0 && data.value <= 2) {
          btn.css("background", "green");
        }
        else if (data.value >= 3 && data.value <= 5) {
          btn.css("background", "yellow");
        }
        else if (data.value >= 6 && data.value <= 7) {
          btn.css("background", "orange");
        }
        else if (data.value >= 8 && data.value <= 10) {
          btn.css("background", "red");
        }
        else if (data.value >= 11) {
          btn.css("background", "purple");
        }

        $("#index").append(uv.append(btn));
      }
    });
  }

  // get current history, if any
  var history = JSON.parse(window.localStorage.getItem("history")) || [];

  if (history.length > 0) {
    searchWeather(history[history.length - 1]);
  }

  for (var i = 0; i < history.length; i++) {
    makeRow(history[i]);
  }
});
