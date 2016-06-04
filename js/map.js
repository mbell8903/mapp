(function(){
  document.addEventListener("DOMContentLoaded", function() {
    var mymap = L.map('map').setView([38.9072, 77.0369], 13);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    	maxZoom: 19,
    	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });
  });
})()
