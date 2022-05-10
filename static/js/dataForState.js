// var currState = "New York";

function getDataForState(currState, textColor) {
  var paragraph = document.getElementById("cityName");

  paragraph.textContent = currState;

  paragraph.style.color = textColor;

  // Uninsured
  d3.csv("/static/data/allMerged.csv", function (data) {
    var deathCount = 0;
    var airQuality = 0;
    var unemployed = 0;
    var Uninsured = 0;
    for (var i = 0; i < data.length; i++) {
      // console.log(data[i]["Alzheimer's"]);
      if (data[i]["State"] == currState) {
        deathCount +=
          parseInt(data[i]["Alzheimer's"]) +
          parseInt(data[i]["Heart"]) +
          parseInt(data[i]["Cancer"]) +
          parseInt(data[i]["Stroke"]) +
          parseInt(data[i]["Respiratory"]);
        airQuality += parseInt(data[i]["Median AQI"]);
        unemployed += parseFloat(data[i]["rate"]);
        Uninsured += parseInt(data[i]["Uninsured"]);
      }
    }

    document.getElementById("deathsValue").textContent = deathCount;
    document.getElementById("deathsValue").style.color = textColor;

    document.getElementById("airQualityValue").textContent = airQuality;
    document.getElementById("airQualityValue").style.color = textColor;

    document.getElementById("UnemployedValue").textContent = unemployed+"%";
    document.getElementById("UnemployedValue").style.color = textColor;

    document.getElementById("UninsuredValue").textContent =Uninsured;
    document.getElementById("UninsuredValue").style.color = textColor;
  });
}
