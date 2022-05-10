window.onload = function() {
    geomap("Heart","#AB2135");
    getDataForState("New York","#AB2135");
    donut("New York");
    // barChart("New York");
    betterbubbleChart("Heart");
    pcp("");
};

var card = document.querySelector('.card');
card.addEventListener( 'click', function() {
  card.classList.toggle('is-flipped');
});