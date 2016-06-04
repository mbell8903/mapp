(function(){
  document.addEventListener("DOMContentLoaded", function() {
    var mymap = L.map('map').setView([38.9072, -77.0369], 12);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'tommyokeefe.0agm8e8p',
      accessToken: 'pk.eyJ1IjoidG9tbXlva2VlZmUiLCJhIjoiY2lwMXA5N2RnMDE2MHZibTVrYnhyMnZ1bSJ9.wGvyyAi1pyxbTnhvil-gtw'
  }).addTo(mymap);
  });
})()
