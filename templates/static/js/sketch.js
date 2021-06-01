let song_mp3;
let song_json;
let x_inicial;
let locked = false;
let bx;
let pause = true;
let amplitude;
let amp;
let animations = true;
let current_time = 0;
let last_current_time = 0;
let duration;
//let t0, t1, t2, playTime = 0;
let song_duration, bar_wid;


function preload(){
  //soundFormats('mp3');
  //song_mp3 = createAudio('assets/teste1.mp3');
  song_json = result
  //fontRoboto = loadFont('assets/Roboto-Black.ttf');
}

let chords = [];

function setup() {
  window.wid = 1000; //Tirar /2 na versao final
  window.hei = 600;//Tirar /2 na versao final
  //song_duration = song_mp3.duration();
  timer = setInterval(clock, 500)
  createCanvas(window.wid, window.hei).parent('canvasHolder');
  amplitude = new p5.Amplitude();
  //amplitude.setInput(audio)
  parseChords(chords);
  bar_wid = chords[chords.length-1].x
}

function clock(){
    //if(!pause){
    //fill(255)
    //current_time = current_time + 1
    //onsole.log(current_time/2)
    //}
}

function parseChords(chords){
  for (var i in song_json) {
    var beat = song_json[i]["current_beat"];
    var start = song_json[i]["current_beat_time"];
    var chord = song_json[i]["estimated_chord"];
    var x = findNextX(i, start);
    var y = window.hei/3;
    var a = new Chord(beat, start, chord, x, y);
    chords.push(a);
  }
}

function findNextX(i, start){
  if (i > 0){
    return start*100;
  }else{
    return song_json[i]["current_beat_time"];
  }
}

function draw() {
  last_current_time = current_time
  audio.ontimeupdate = function() {
    document.getElementById("demo").innerHTML = audio.currentTime;
    current_time = audio.currentTime
    duration = audio.duration
    document.getElementById("demo1").innerHTML = current_time;
  }
  if(!pause && current_time == last_current_time){
    current_time += 0.015
  }
    fill(255)
    text(current_time, 0, 0)
    rect(window.wid / 2 - 40, window.hei / 3, 40, 80)
    if (animations) {
      amp = 25 * amplitude.getLevel();
      text("Desativar animação", 0, 0)
    } else {
      amp = 0;
      text("Ativar animação", 0, 0)
    }
    background(0, amp, amp);
    //pause = player.getPlayerState()
    //console.log(player.getPlayerState())
    /*if (typeof player.getCurrentTime === "function") {
        console.log("timestamp: ",player.getCurrentTime())
        current_time = player.getCurrentTime()
    }
    if (typeof player.getPlayerState === "function") {
      console.log("State: ",player.getPlayerState())
      pause = player.getPlayerState()
    }
    if (typeof player.getDuration === "function") {
      duration = player.getDuration()
      console.log("DURATION: ",duration)
    }*/
    //console.log(player.getDuration())
    playButton(amp);
    //if(song_mp3.isLoaded()){
    //console.log("?????????", current_time)
    //console.log("funciona pf ",pause_time)
    //let aux = currentTime(current_time);
    //if(aux != null){
    //current_time = aux
    //}
    drawRects();
    for (var i in chords) {
      if (!pause) {
        chords[i].move();
      }
      chords[i].show();
      chords[i].change();
    }
    //current_time += 0.12
    //}
  //}
  //chords[i].move();
}


function drawRects(){
  let i = 0;
  for(i in chords){
    if(i>0){
      let r = 20*((i%2)+1);
      fill(30+r, 30+r, 30+r, 25+r)
      rect(chords[i-1].x, chords[i].y-36, chords[i].x-chords[i-1].x, chords[i].rh);
    }
  }
}


function playButton(amp){
    let radius = window.hei/13
    let xc = window.wid/2
    let yc = window.hei/1.2
    fill(0, 255, 255)
    triangle(xc, window.hei/4, xc-radius, window.hei/5, xc+radius, window.hei/5)
    rect()
    if(pause){
      txt = "Play"
      fill(50, 50, 50)
    }else{
      fill(0, 255, 255, 8)
      circle(window.wid/2, window.hei/1.2, radius+(amp*3.2))
      fill(0, 255, 255, 12)
      circle(window.wid/2, window.hei/1.2, radius+(amp*2.5))
      fill(0, 255, 255, 25)
      circle(window.wid/2, window.hei/1.2, radius+(amp*2))
      fill(0, 255, 255, 50)
      circle(window.wid/2, window.hei/1.2, radius+(amp*1.5))
      fill(0, 255, 255)
      txt = "Pause"
    }
      circle(xc, yc, radius)
      textAlign(CENTER)
      textSize(window.hei/20)
      fill(0, 255, 255)
      text(txt, window.wid/2, window.hei/1.05)
    if(pause){
      fill(0, 255, 255)
      triangle(xc+(radius*0.7), yc, xc-(0.5*radius), yc-(0.5*radius), xc-(0.5*radius), yc+(0.5*radius))
    }else{
      fill(50, 50, 50)
      rect(xc-(0.5*radius), yc-(0.5*radius), radius*0.3, radius)
      rect(xc+(0.5*radius)-(radius*0.35), yc-(0.5*radius), radius*0.3, radius)
    }
}

function mousePressed() {
  for (var i in chords) {
    chords[i].clicked(mouseX, mouseY);
  }
  let d = dist(mouseX, mouseY, window.wid/2, window.hei/1.2)
  if(d < window.hei/20){
    if(pause){
      //if(firstPlayClick){
        //t0 = millis()
      //}
      //t1 = millis()
      //song_mp3.play(0, 1, 1)//, playTime/1000)
      // player.playVideo()
      audio.play();
      pause=false;
    }else{
      //t2 = millis()
      //playTime = playTime+(t2-t1)
      //t1 = t2
      //song_mp3.stop()
      //player.pauseVideo()
      audio.pause();
      pause=true
    }
  }
  let d2 = dist(mouseX, mouseY, 0, 0)
  if(d2 < 50){
    if(animations){
      animations = false;
    }else{
      animations = true;
    }
  }
}

function mouseDragged() {
    for (var i in chords) {
      if(i == 0){
      chords[i].moving(mouseX, 0, 10000000);
      }else if(i+1 == null){
      chords[i].moving(mouseX, 0, 10000000);
      }else{
      chords[i].moving(mouseX, 0, 10000000);
      }
    }
}

function mouseReleased() {
  //locked = false;
  //console.log("soltou")
}

function lastChord(ex_json){
  for(var key in ex_json){
    if(ex_json.hasOwnProperty(key)){
        lastKey = key;
    }
    return lastKey;
  }
}

//function currentTime(){
  //return (millis()-t0)/1000
//}