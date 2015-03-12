///////////////////////////////////////////////
/**
// Author: Abbas Abdulmalik
// Creation Date:  Feb 23
// Revised: Feb 27
// Note: 3 apps in one
// 
*/
///////////////////////////////////////////////
var openSize = "50%";
var menuOpen = true;
var menu = O("menu");
var contentDiv = O("content");
//========== Event Handlers ==============
window.onload = init;
window.onresize = resize;
menu.onclick = toggleMenu;
//=========== Functions ===============
function init(){
  resize();
  toggleMenu();
}
//-------------------------
function resize(){
    S(document.documentElement).fontSize = innerWidth/100 + "px";
    var backHeight = O("back").offsetHeight;
    var frontHeight = ("front").offsetHeight;
    if (backHeight > frontHeight){
        S("front").minHeight = backHeight+"px";    
    }
    else if(frontHeight > backHeight){
        S("back").minHeight = frontHeight + "px"
    }
}
//-------------------------
function closeMenu(){
  S("front").width = "100%";
  menuOpen = false;
}
//-------------------------
function toggleMenu(){
  if(menuOpen){
    closeMenu();
  }
  else{
    openMenu();
  }
  ///////helper functions//////
  function openMenu(){
    S("front").width = openSize;
    menuOpen = true;
  }
  //////////////////////////////
}
//------------------------------------
//get an array of all object of the apps class
var appsArray = C("apps");
var numApps = appsArray.length;
for(var i=0; i<numApps; i++){
  appsArray[i].addEventListener("click",function(){
    S("iframe").display="none";
    closeMenu();
  }, false);
}
O("app2").onclick = function(){
    S("iframe").display="block";
    O("iframe").setAttribute("src","whereami/index.html");
}
O("app3").addEventListener("click",function(){
    S("iframe").display="block";
    O("iframe").setAttribute("src","shuffletunes/index.html");    
}, false);

