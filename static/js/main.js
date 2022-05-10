window.onload = function() {
    geomap("Heart");
    getDataForState("New York");
    donut("New York");
    // barChart("New York");
    betterbubbleChart("Heart");
    pcp();
};

var card = document.querySelector('.card');
card.addEventListener( 'click', function() {
  card.classList.toggle('is-flipped');
});