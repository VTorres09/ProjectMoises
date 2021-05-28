let song_mp3;
let song_json;
let x_inicial;
let locked = false;
let bx;
let pause = true;
let amplitude;
let amp;
let animations = true;
let timer, current_time = 0;
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
  amplitude.setInput(song_mp3)
  parseChords(chords);
  bar_wid = chords[chords.length-1].x
}

function clock(){
    if(!pause){
    fill(255)
    current_time = current_time + 1
    //onsole.log(current_time/2)
    }
}

function parseChords(chords){
  for (var i in song_json) {
    var beat = song_json[i]["current_beat"];
    var start = song_json[i]["current_beat_time"];
    var chord = song_json[i]["estimated_chord"];
    var x = findNextX(i, start);
    var y = window.hei/2;
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
  fill(255)
  text(current_time, 0, 0)
  if(animations){
    amp = 25 * amplitude.getLevel();
    text("Desativar animação", 0, 0)
  }else{
    amp = 0;
    text("Ativar animação", 0, 0)
  }
  background(0, amp, amp);
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
      chords[i].move();
      chords[i].show();
      chords[i].change();
    }
  //}
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
    if(pause){
      fill(50, 50, 50)
      txt = "Play"
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
      circle(window.wid/2, window.hei/1.2, radius)
      textAlign(CENTER)
      textSize(window.hei/20)
      fill(0, 255, 255)
      text(txt, window.wid/2, window.hei/1.05)
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
      pause=false;
    }else{
      //t2 = millis()
      //playTime = playTime+(t2-t1)
      //t1 = t2
      //song_mp3.stop()
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