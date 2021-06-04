let song_mp3;
let song_json;
let x_inicial;
let locked = false;
let bx;
let pause = true;
let editing = false;
let amplitude;
let amp = 0;
let animations = false;
let current_time = 0;
let last_current_time = 0;
let duration;
let c_input;
let t = -1;
let chord_now = [0, '']
let song_duration, bar_wid;


function preload(){
  //soundFormats('mp3');
  //song_mp3 = createAudio('assets/teste1.mp3');
  song_json = result
  //fontRoboto = loadFont('assets/Roboto-Black.ttf');
}

var chords = [];

function setup() {
  window.wid = 1000;
  window.hei = 600;
  createCanvas(window.wid, window.hei).parent('canvasHolder');
  amplitude = new p5.Amplitude();
  parseChords(chords);
  bar_wid = chords[chords.length-1].x

  c_input = createInput()
  c_input.position((window.wid/2)+(c_input.width/1.2)*0.6, (window.hei/2)+(c_input.height)*1.2)
  c_button = createButton('update');
  c_button.position((c_input.x + c_input.width), (window.hei/2)+(c_input.height)*1.2);
  c_button.mousePressed(update_chord);
  c_input.color = (0, 0, 255)
}

function parseChords(chords){
  for (var i in song_json) {
    var beat = song_json[i]["current_beat"];
    var start = song_json[i]["current_beat_time"];
    var chord = song_json[i]["estimated_chord"];
    var x = findNextX(i, start);
    var y = window.hei/3;
    var a = new Chord(beat, start, chord, x, y, i);
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

    //Como a função draw atualiza repetidamente, salvamos o valor passado do tempo atual, que será necessário mais pra frente


    //Aqui utilizamos a função ontimeupdate, que atualiza independentemente da função draw, e retorna o timestamp da música
    audio.ontimeupdate = function () {
        last_current_time = current_time
        document.getElementById("demo").innerHTML = audio.currentTime;
        current_time = audio.currentTime
        duration = audio.duration
        document.getElementById("demo1").innerHTML = last_current_time;
    }

    /*
    Como a função ontimeupdate atualiza a mais ou menos 4fps e a função draw atualiza a 60fps, para evitar lags e
    animações cortadas, suavizamos a incrementação do current_time enquanto a próxima atualização do ontimeupdate
    não é disponibilizada
    */
    if (!pause && current_time != last_current_time) {

        /*
        NOTA: Estamos calculando o índice de suavização baseado no tamanho da tela gerada pelo p5
        Caso esteja bugado, alterar o valor do índice poderá resolver
        */
        let indice = window.wid/65000
        current_time += indice
    }
  if(!pause && animations){
    if(amp==25 || amp==0){
      t = -1*t
      amp = amp + t
    }else{
      amp = amp + t
    }
  }

    rect(window.wid/2, window.hei/8, 50, 50)
    rect(window.wid / 2 - 40, window.hei / 3, 40, 80)
    if (animations) {
      //amp = 25 * amplitude.getLevel();
      text("Desativar animação", 0, 0)
    } else {
      //amp = 0;
      text("Ativar animação", 0, 0)
    }
    background(0, 0, 0);
    playButton(amp);
    drawRects();
    for (var i in chords) {
      if (!pause) {
        chords[i].move();
      }
      chords[i].show();
      chords[i].change();
    }
    //}
  //}
  //chords[i].move();
}

function update_chord(){
    //if(editable){
      console.log("CURRENT: ", chord_now[1])
      chord_now[1] = c_input.value()
      console.log("NEW CURRENT: ", chord_now[1])
      chords[chord_now[0]].chord = c_input.value()
      console.log("DEBUG: ", chords[chord_now[0]].chord, "\n", "Index: ", chord_now[0])
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
    let xc = window.wid/2
    let yc = window.hei/1.6

    fill(0, 255, 255)
    textAlign(CENTER)
    text(chord_now[1], window.wid/2, window.hei/8)

    fill(0, 255, 255)
    triangle(xc, window.hei/4, xc-radius, window.hei/5, xc+radius, window.hei/5)

    if(pause){
      txt = "Play"
      fill(50, 50, 50)
    }else{
      circle(window.wid/2, window.hei/1.6, radius)
      fill(0, 255, 255)
      circle((window.wid/2)*1.2, window.hei/1.6, radius*0.7)
      circle((window.wid/2)*0.8, window.hei/1.6, radius*0.7)
      txt = "Pause"
    }
      circle((window.wid/2)*1.2, window.hei/1.6, radius*0.7)
      circle((window.wid/2)*0.8, window.hei/1.6, radius*0.7)
      rect((window.wid/2)*1.8, yc-(0.5*radius), radius*2, radius, 200)
      circle(xc, yc, radius)
      textAlign(CENTER)
      textSize(window.hei/20)
      fill(0, 255, 255)
      text(txt, window.wid/2, window.hei/1.32)


    if(pause){
      fill(0, 255, 255)
      triangle(xc+(radius*0.7), yc, xc-(0.5*radius), yc-(0.5*radius), xc-(0.5*radius), yc+(0.5*radius))
      textSize(window.hei/20)
      text('>>', (window.wid/2)*1.2, window.hei/1.56)
      text('<<', (window.wid/2)*0.8, window.hei/1.56)
      textSize(window.hei/25)
      text('Send', (window.wid/2)*1.89, (yc-(0.1*radius))*1.04)
    }else{
      fill(50, 50, 50)
      rect(xc-(0.5*radius), yc-(0.5*radius), radius*0.3, radius)
      rect(xc+(0.5*radius)-(radius*0.35), yc-(0.5*radius), radius*0.3, radius)
      textSize(window.hei/20)
      text('>>', (window.wid/2)*1.2, window.hei/1.56)
      text('<<', (window.wid/2)*0.8, window.hei/1.56)
      textSize(window.hei/25)
      text('Send', (window.wid/2)*1.89, (yc-(0.1*radius))*1.04)
    }
}

function mousePressed() {
  for (var i in chords) {
    chords[i].clicked(mouseX, mouseY);
  }
  let d = dist(mouseX, mouseY, window.wid/2, window.hei/1.6)
  if(d < window.hei/15){
    if(pause){
      audio.play();
      pause=false;
    }else{
      audio.pause();
      pause=true
    }
  }
  let d2 = dist(mouseX, mouseY, (window.wid/2)*1.2, window.hei/1.6)
  if(d2 < (window.hei/13)*0.7){
      audio.currentTime += 5.0;

  }

  let d3 = dist(mouseX, mouseY, (window.wid/2)*0.8, window.hei/1.6)
  if(d3 < (window.hei/13)*0.7){
       audio.currentTime -= 5.0;
  }

  let d4 = dist(mouseX, mouseY, (window.wid/2)*1.95, window.hei/1.6)
  if(d4 < (window.hei/11)){
      //enviar array chords para o server e resolver problema da pausa
    $.post( "/postmethod", {
      canvas_data: JSON.stringify(chords)
    }, function(err, req, resp){
      //Redireciona para a pagina do resultado
      window.location.href = "/result/";
    });
  }

  let d5 = dist(window.wid/2, window.hei/8, mouseX, mouseY)
  if(d5 < 50){
    if(editing){
      editing = false
    }else{
      editing = true
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