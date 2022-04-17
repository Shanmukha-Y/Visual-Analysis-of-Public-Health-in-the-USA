var currState = "New York";

var paragraph = document.getElementById("cityName");

paragraph.textContent += "New York";

d3.csv("/static/data/deaths.csv", function(data) {
    var deathCount = 0;
    for (var i = 0; i < data.length; i++) {
        // console.log(data[i]["Alzheimer's"]);
        if(data[i]["State"] == currState) {
            deathCount+=  parseInt(data[i]["Alzheimer's"]) + parseInt(data[i]["Heart"]) + parseInt(data[i]["Cancer"]) + parseInt(data[i]["Stroke"]) + parseInt(data[i]["Respiratory"]);
        }
    }

    document.getElementById("deaths").textContent = "Deaths:    " + deathCount;

});
