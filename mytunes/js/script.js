var audioPlayer = O("audioPlayer");
var songSelection = O("songSelection");
songSelection.onchange = function(){
    if(songSelection.selectedIndex !== 0){
        O("filePlaying").innerHTML="";
        var filename = songSelection.options[songSelection.selectedIndex].value;
        if( supportsMp3() ){
            audioPlayer.src = "music/" + filename + ".mp3";
            if(O("filePlaying").innerHTML == ""){
                O("filePlaying").innerHTML = filename + ".mp3";
            }           
        }
        else if( supportsOgg() ){
            audioPlayer.src = "music/" + filename + ".ogg";
            if(O("filePlaying").innerHTML == ""){
                O("filePlaying").innerHTML = filename + ".ogg";
            }               
        }
        else{
            audioPlayer.src = "";
            O("filePlaying").innerHTML = "Trouble with file or file type."    
        }
        audioPlayer.volume = 0.75;
        audioPlayer.play();        
    }
    else{
        audioPlayer.src = "";
        O("filePlaying").innerHTML = "Trouble with file or file type."         
    }
}
//==========================
function supportsMp3(){
    var answer = audioPlayer.canPlayType('audio/mpeg;codecs="mp3"');
    if(answer == "" || answer =="no"){
        return false;
    }
    else{
        return true;
    }
}
function supportsOgg(){
    var answer = audioPlayer.canPlayType('audio/ogg;codecs="vorbis"');
    if(answer == "" || answer =="no"){
        return false;
    }
    else{
        return true;
    }
}
//==========================
audioPlayer.onerror = function(){
    O("filePlaying").innerHTML = "Error: Trouble loading audio file.";
}
//==========================
//http://24ways.org/2010/the-state-of-html5-audio
//http://www.w3schools.com/tags/av_met_canplaytype.asp
//http://www.w3schools.com/tags/tryit.asp?filename=tryhtml5_av_met_canplaytype
