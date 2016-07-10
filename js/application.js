jQuery.ajaxPrefilter(function( options ) {
    options.global = true;
});

var port1Lat;
var port1Long;
var port2Lat;
var port2Long;

$( document ).ready(function() {
  //autocomplete
  $(function() {
    $( ".autocomplete" ).autocomplete({
      source: function( request, response ) {
        $.ajax({
          url: "https://www.air-port-codes.com/api/v1/multi",
          jsonp: "callback",
          dataType: "jsonp",
          data: {
            term: request.term,
            limit: 7,
            size: 3,
            key: "f4b7fbcc1f",
            secret: '0c58995989872e8' // necessary for local use
          },
          success: function( data ) {
            if (data.status) {
              response( $.map( data.airports, function( item ) {
                if (item.country.name === "United States") {
                  return {
                    label: item.name + ' (' + item.iata + ')',
                    value: item.iata,
                    code: item.iata
                  }
                }
              }));
            } else {
                response();
            }
          }
        });
      },
      select: function( event, ui ) {
        console.log(ui.item.code);
      }
    });
  });
  //calculate distance
  function distance(lat1, lon1, lat2, lon2) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    return (dist * 0.8684) // convert to nautical miles
  }

  $(function() {
    $('form').submit(function (e) {
      e.preventDefault();

      $('#airport-info-container').hide();

      $.ajax({
        url: "https://www.air-port-codes.com/api/v1/single",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
          iata: $('#iata-input').val(),
          key: "f4b7fbcc1f",
          secret: '0c58995989872e8'
        },
        success: function( data ) {
          if (data.airport && data.airport.country.name === "United States"){
            console.log(data);
            if (data.status) {
              var output = '';
              output += data.airport.name + '<br />';

              if (data.airport.latitude)  { port1Lat   = data.airport.latitude; }
              if (data.airport.longitude) { port1Long  = data.airport.longitude; }

              // show the results
              $('#airport-info').html(output);
            }
          } else {
            var error = '';
            error += '<strong>Please enter a valid United States airport.</strong> ' + '<br />';
            $('#airport-info').html(error);
          }
          $('#airport-info-container').show();
          }
      });

      $('#airport-info-container-2').hide();

      $.ajax({
        url: "https://www.air-port-codes.com/api/v1/single",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
          iata: $('#iata-input-2').val(),
          key: "f4b7fbcc1f",
          secret: '0c58995989872e8'
        },
        success: function( data ) {
          if (data.airport && data.airport.country.name === "United States"){
            console.log(data);
            if (data.status) { // success
              var output = '';
              output += data.airport.name + '<br />';

              if (data.airport.latitude)  { port2Lat   = data.airport.latitude; }
              if (data.airport.longitude) { port2Long  = data.airport.longitude; }

              $('#airport-info-2').html(output);
              }
          } else {
            var error = '';
            error += '<strong>Please enter a valid United States airport.</strong> ' + '<br />';
            $('#airport-info-2').html(error);
          }
          $('#airport-info-container-2').show();
        }
        });

      function findDistance() {
        var DistanceNM = NaN;
        distanceNM = distance(parseFloat(port1Lat), parseFloat(port1Long), parseFloat(port2Lat), parseFloat(port2Long));
        // show if distance is a number
        if (!isNaN(distanceNM)) {
          $("#airport-distance-container").show()
          $('#distance_div').text('Distance in Nautical Miles: ' + distanceNM)
        } else {
          $("#airport-distance-container").show()
          $('#distance_div').html('<strong>Please enter a valid United States airport.</strong> ')
        }
        port1Lat  = null;
        port1Long = null;
        port2Lat  = null;
        port2Long = null;
      }
      // clear form input fields
      $('#iata-input').val('');
      $('#iata-input-2').val('');

      // when ajax is complete
      $( document ).ajaxStop(function () {
        initMap();
        findDistance();
        $('.results').show();
      });
    });
  });
})

var map;
// simple map
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.09024, lng: -95.712891},
    zoom: 3
  });
  // place markers on map
  if (port1Lat && port2Lat) {

    var myLatLng1 = {lat: parseFloat(port1Lat), lng: parseFloat(port1Long)};
    var myLatLng2 = {lat: parseFloat(port2Lat), lng: parseFloat(port2Long)};

    var marker1 = new google.maps.Marker({
      position: myLatLng1,
      map: map
    });

    var marker2 = new google.maps.Marker({
      position: myLatLng2,
      map: map
    });

  }
}
