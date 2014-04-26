// JavaScript Document
var uniqid = Date.now();
var doingPhoto = false;
var position = [48.13513, 11.58198];
var dati;

$(function () {
    $(".note").draggable();
    $(".note").each(function () {
        var numberW = $(this)[0].dataset.xpos;
        var numberH = $(this)[0].dataset.ypos;
        $(this).animate({
            left: "+=" + numberW,
            top: "+=" + numberH
        }, 1000);
    });
});

$(document).ready(function () {
	$('#search-form').on('submit', function(e) {
		e.preventDefault();
    	var geocoder = new google.maps.Geocoder();
		geocoder.geocode({'address': $('#search').val()}, function(results, status) {
			map.setCenter(results[0].geometry.location);
			map.setZoom(15);
		});		
	});
	
});

function createPhoto(lat, lng) {
	if(doingPhoto) return;
	doingPhoto = true;
	setTimeout(function() {
		doingPhoto = false;
	}, 2000);
	getFlickPhoto(lat, lng, 0, function(url) {
		if(url == "NONE" || dati.get(url)) {
			return;	
		}
		dati.put(url, {status:'saved'});
		var imgName = "img"+Date.now();
		$('#notes-ul').append('<li class="note" id='+imgName+' data-noteid=2 data-xpos=800 data-ypos=700><a style="background-image:url(' + url +')"></a></li>');
		$("#"+imgName).draggable();
		var numberW =  Math.floor((Math.random()*1700)+1);
    	var numberH =  Math.floor((Math.random()*750)+1);
		$("#"+imgName).animate({
            left: "+=" + numberW,
            top: "+=" + numberH
        }, 1000, function() {
			// anim complete
			setTimeout(function() {
				$("#"+imgName).fadeOut("slow", function() {
					$("#"+imgName).remove();
				});
			}, 5000);
		});
	});
}

function getFlickPhoto(lat, lng, d, cb) {
	var depth = d;
	$.ajax({
		url: "http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=FLICKR_API_KEY&sort=relevance&lat="+lat+"&lon="+lng+"&per_page=3&page=1&format=json&nojsoncallback=1"
	}).done(function(result) {
		if(!result.photos.photo[0]) {
			cb("NONE");
			return;
		}
		photoUrl = "http://farm" + result.photos.photo[depth].farm + ".staticflickr.com/" + result.photos.photo[depth].server + "/" + result.photos.photo[depth].id + "_" + result.photos.photo[depth].secret + "_n.jpg";
		depth++;
		if(dati.get(photoUrl) && depth < 4) {
			getFlickPhoto(lat, lng, depth, cb);
		}
		cb(photoUrl);
	});
}

function initialize() {
	var myOptions = {
    	zoom: 6,
        streetViewControl: true,
        scaleControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP
   	};

    map = new google.maps.Map(document.getElementById('googlemaps'), myOptions);
    latLng = new google.maps.LatLng(position[0], position[1]);
    map.setCenter(latLng);
	
	google.maps.event.addListener(map, 'center_changed', function() {
		createPhoto(map.getCenter().lat(), map.getCenter().lng());
 	});
}

$(document).ready(function(e) {
  	dati = new ExpiringMap();  
});
