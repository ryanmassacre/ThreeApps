///////////////////////////////////////////////
/**
// Author: Abbas Abdulmalik
// Creation Date: Feb 23, 2015
// Revised: March 3, 2015
// Note: Muntz minimally working geo maps
// 
*/ 
///////////////data below/////////////
var contentDiv = O("content");
var geoOptions = {    
    enableHighAccuracy: true,//when true, it takes longer, drains battery.
    timeout: Infinity, //how long we are willing to wait for geo info in mS
    maximumAge: 0// 0 user uses live data, Infinity => used cached data, mS before refilling cache
}
var watchId = null;
autoWatch();
var currentGoogleMap = {};
var firstGoogleMap = true;
var googleMapOptions = {};

////////////event handlers//////////////
window.onload = resize;
window.onresize = resize;
//-------------------------
function resize(){
    var windowWidth = window.innerWidth;
    S(document.documentElement).fontSize = windowWidth/100 + "px";
    S("content").left = windowWidth/2 - O("content").offsetWidth/2  + "px"; 
}
//----useful function for showing info in test html document
function show(data, destination){
    resize();
    var node = document.createTextNode( data );
    var br = document.createElement("br");
    destination.appendChild(node);
    destination.appendChild(br);
}

var busyUpdating = false;
var lastLat = 0;
var lastLng = 0;
var minimumUpdateTime = 10; //(no more than every x seconds)
var lastTimestamp = 0;
function showAllGeoInfo(APIpositionObject){
    //resize();
    if(busyUpdating) return;
    var deltaTime = Math.abs(APIpositionObject.timestamp - lastTimestamp);
    if ( positionChangedEnough() && deltaTime >= 1000*minimumUpdateTime ){
        lastTimestamp = APIpositionObject.timestamp;
        //////////////////////////////////////////////////////////
        busyUpdating=true;
        resize(); 
        O("geoInfo").innerHTML="";
        var date = new Date(APIpositionObject.timestamp);
        var localTime = date.toLocaleString();    
        show(localTime,O("geoInfo"));       
        show("Longitude:  " +
            APIpositionObject.coords.longitude +
            " +- " +
            (APIpositionObject.coords.accuracy).toFixed(2) +
            " meters",O("geoInfo"));
        show("Latitude:  " +
            APIpositionObject.coords.latitude +
            " +- " +
            (APIpositionObject.coords.accuracy).toFixed(2) +
            " meters",O("geoInfo"));
        /////////////////////////////////////////////////////////        
        showGoogleMap(APIpositionObject);
        ////////////////////////////////////////////////////////
        busyUpdating=false;
        resize();        
    } 
    //====================helper=======================
    function positionChangedEnough(){
        var delta = false;
        var newLat = APIpositionObject.coords.latitude;
        var newLng = APIpositionObject.coords.longitude;
        var deltaLat = Math.abs(newLat - lastLat);
        var deltaLng = Math.abs(newLng - lastLng);
        var deltaDistance = Math.sqrt(deltaLat*deltaLat + deltaLng*deltaLng);
        if(deltaDistance > 1e-15){
            delta=true;
            lastLat = APIpositionObject.coords.latitude;
            lastLng = APIpositionObject.coords.longitude;
        }
        return delta;
    }
}
function autoWatch(){
    if(navigator.geolocation){
        watchId = navigator.geolocation.watchPosition(showAllGeoInfo, showErrorInfo, geoOptions);
    }
}
function showErrorInfo(APIErrorObject){
    var geoError = "";
    if(APIErrorObject.error === APIErrorObject.PERMISSION_DENIED){
        geoError = "Permission Denied by user.";      
    }
    else if(APIErrorObject.error === APIErrorObject.POSITION_UNAVAILABLE){    
        geoError = "Location information is unavailable";  
    }
    else if(APIErrorObject.error === APIErrorObject.TIMEOUT){    
        geoError = "The request has timed out";  
    }
    else if(APIErrorObject.error === APIErrorObject.UNKNOWN_ERROR){    
        geoError = "Unknown Error";  
    }
    else{
        geoError = "Unknown Error";    
    }
    resize();
    O("geoInfo").innerHTML = "";
    show("=============================",O("geoInfo")); 
    show("A geolocation error occurred:",O("geoInfo"));
    show(geoError,O("geoInfo"));
    show("=============================",O("geoInfo"));
    resize();
}
//============================ Dissolve stuff ==============================//
var frameArray = C("map");
function swapMaps(){
    /////// swap targets //////////////////
    var temp = frameArray.shift();
    frameArray.push(temp);
}
function dissolve(seconds){
    var becomingVisible = 0;
    var becomingHidden = 1;
    var dissolveTime = seconds*1000;
    var steps = 10;
    var dt = dissolveTime/steps;
    var stopKey = null;
    ////////////////////////////////////////////
    stopKey = setInterval(function(){
        becomingHidden -= (1/steps);
        becomingVisible =+ (1/steps);
        S(frameArray[0]).opacity = becomingHidden;
        S(frameArray[1]).opacity = becomingVisible;        
        if( becomingVisible >= 0.7  || becomingHidden <= 0.3){
            clearInterval(stopKey);
            S(frameArray[0]).opacity = 0;
            S(frameArray[0]).display = "none";  
            S(frameArray[1]).opacity = 1;
            S(frameArray[1]).display = "block";            
        }
    },dt);
}
//========================= GOOGLE MAPS STUFF ==============================//
function showGoogleMap(APIpositionObject){
    var lat = APIpositionObject.coords.latitude;
    var lng = APIpositionObject.coords.longitude;
    var CENTER = new google.maps.LatLng(lat, lng);
    if (firstGoogleMap){
        firstGoogleMap = false;
        googleMapOptions = {
            center: CENTER,
            zoom: 17, 
            mapTypeId: google.maps.MapTypeId.HYBRID,
        }
    }
    else{
        googleMapOptions = {
            center: CENTER,
            zoom: currentGoogleMap.getZoom(), 
            mapTypeId: currentGoogleMap.getMapTypeId(),
        }
    }
    swapMaps();      
    currentGoogleMap = new google.maps.Map(frameArray[1], googleMapOptions);
    dissolve((1/4)*minimumUpdateTime);    
}
//====================================DONE=====================================
