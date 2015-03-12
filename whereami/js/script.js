/**
// Author: Abbas Abdulmalik
// Creation Date: March 4, 2015
// Revised: N/A
// Note: best performance quest
*/
///////////////data below/////////////
var mostRecentTimeStamp = 0;
var latentSeconds = 4;
var contentDiv = O("content");
var tallyUp = 0;
//--Data that navigator.geolocation.getCurrentPosition() needs----
var geoOptions = {    
    enableHighAccuracy: true,//when true, it takes longer, drains battery.
    timeout: Infinity, //how long we are willing to wait for geo info in mS
    maximumAge: 1000*latentSeconds// 0 => user uses live data, Infinity => used cached data, mS before refilling cache
}
var watchId = null;

////////////event handlers//////////////
window.onload = function (){
    resize();
    setTimeout(autoWatch,1500);
};
window.onresize = resize;
O("btn").onclick = toggleUpdates;
//-------------------------
function resize(){
    var windowWidth = window.innerWidth;
    S(document.documentElement).fontSize = windowWidth/100 + "px";
    S("content").left = windowWidth/2 - O("content").offsetWidth/2  + "px"; 
}

//----useful function for showing info in test html document
function show(data, destination){
    //-----------------------------------
    var node = document.createTextNode( data );
    var br = document.createElement("br");
    destination.appendChild(node);
    destination.appendChild(br);
    //------------------------------------
}
//=================================================
var busy = false;
var lastLat = 0;
var lastLng = 0;
function showAllGeoInfo(APIpositionObject){
    O("updateMessage").innerHTML = "Tap to Stop Updates"; 
    if(busy) return;
    busy=true;
    resize();
    //wait for resizing
    setTimeout(function(){
        O("geoInfo").innerHTML="";

        var date = new Date(APIpositionObject.timestamp);
        var localTime = date.toLocaleString();        

        show(localTime,O("geoInfo")); 
        O("geoInfo").innerHTML += "<hr>";        
        show("Longitude:  " +
            APIpositionObject.coords.longitude.toFixed(6)+" degrees",O("geoInfo")); 
        show("Latitude:     " +
            APIpositionObject.coords.latitude.toFixed(6)+" degrees",O("geoInfo"));

        var speed = isNaN(APIpositionObject.coords.speed)? 0 : APIpositionObject.coords.speed;
        speed *=2.23694;/*  m/s => mi/hr  */
        show("Speed:  " + speed.toFixed(2) + " miles/hour",O("geoInfo"));
        O("geoInfo").innerHTML += "<hr>";  
        showGoogleMap(APIpositionObject);    
        busy=false;
        resize();
    },100);
}
//the watchPosition() method, unlike the getCurrentPosition() method
//will call our callback functions automatically whenever there is a change
//in position information.
function autoWatch(){
    if(navigator.geolocation){
        watchId = navigator.geolocation.watchPosition(usePositionInfo, useErrorInfo, geoOptions);
    }
}
function stopWatch(){
    navigator.geolocation.clearWatch(watchId);    
}
function usePositionInfo(APIpositionObject){
    var deltaTime = Math.abs(mostRecentTimeStamp - APIpositionObject.timestamp);
        if (deltaTime > latentSeconds*1000*2 && positionChangedEnough() ){//||
            mostRecentTimeStamp = APIpositionObject.timestamp;        
            showAllGeoInfo(APIpositionObject);
        }
    //////////////////Helper///////////////////////
    function positionChangedEnough(){
        var moved = false;
        var newLat = APIpositionObject.coords.latitude;
        var newLng = APIpositionObject.coords.longitude;
        var deltaLat = Math.abs(newLat - lastLat);
        var deltaLng = Math.abs(newLng - lastLng);
        var deltaDistance = Math.sqrt(deltaLat*deltaLat + deltaLng*deltaLng);
        if(deltaDistance > 1e-20){
            moved = true;
            lastLat = APIpositionObject.coords.latitude;
            lastLng = APIpositionObject.coords.longitude; 
        }
        return moved;
    } 
    ///////////////////////////////////////////////    
}
function useErrorInfo(APIErrorObject){
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
    else{    
        geoError = "Unknown Error";  
    }
    if(APIErrorObject.error !== APIErrorObject.PERMISSION_DENIED){
        O("updateMessage").innerHTML = "Stop Updates";   
    }
    resize();
    O("geoInfo").innerHTML = "";
    show("=============================",O("geoInfo")); 
    show("A geolocation error occurred:",O("geoInfo"));
    show(geoError,O("geoInfo"));
    show("=============================",O("geoInfo"));
    resize();
}
//=======================GOOGLE MAPS STUFF ==============================//
var currentMap ={};
var firstMap = true;
var newZoom = 16;
var newType = google.maps.MapTypeId.HYBRID;
function showGoogleMap(APIpositionObject){
    resize();
    if(firstMap){
        newZoom = 16;
        newType = google.maps.MapTypeId.HYBRID;        
        firstMap = false;
    }
    else{
        newZoom = currentMap.getZoom();
        newType = currentMap.getMapTypeId();        
    }
    var lat = APIpositionObject.coords.latitude;
    var lng = APIpositionObject.coords.longitude;
    var googleMapOptions = {
        center: new google.maps.LatLng(lat,lng),
        zoom: newZoom, 
        mapTypeId: newType,
    }
    toggleMaps();
    currentMap = new google.maps.Map(mapArray[0], googleMapOptions);
    crossFadeMaps();
    resize();
}
//---------------------------------------------
var idArray = ["map1","map2"];
var mapArray = [O(idArray[0]),O(idArray[1])];

function toggleMaps(){
    //////////////keep this working part///////////////
    //swap front and back maps (map1 and map2)    //http://stackoverflow.com/questions/7742305/changing-the-order-of-elements
    O("maps").appendChild(O("maps").firstElementChild);
    var nextMapTarget = mapArray.pop();
    mapArray.unshift(nextMapTarget);
}
//---------------------------------------------
var offKey;
var busyCrossfading = false;
function crossFadeMaps(){
    if(busyCrossfading) return;
    busyCrossfading = true;
    var dyingOpacity = 1;
    var birthingOpacity = 0    
    S(mapArray[0]).opacity = birthingOpacity;
    S(mapArray[1]).opacity = dyingOpacity;    
    var fraction = 1/10;
    var timeSlice = latentSeconds*1000*fraction;
    offKey = setInterval(function(){
        birthingOpacity+=fraction;
        dyingOpacity-=fraction;
        S(mapArray[0]).opacity = birthingOpacity;
        S(mapArray[1]).opacity = dyingOpacity;        
        if ( birthingOpacity >= 1 ){
            clearInterval(offKey);
            S(mapArray[0]).opacity = 1;
            S(mapArray[1]).opacity = 0;
            busyCrossfading=false;            
        }
    }, timeSlice);
}
//---------------------------------------------
var updating = true;
function toggleUpdates(){
    if(updating){
        stopWatch();
        updating = false;
        O("updateMessage").innerHTML = "PAUSED: Tap to restart";
    }
    else if(!updating){
        autoWatch();
        updating = true;
        O("updateMessage").innerHTML = "Tap to Stop Updates";        
    }
}
////////////////////////////////////////END///////////////////////////

