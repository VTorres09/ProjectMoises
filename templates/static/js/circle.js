class Chord {
  constructor(beat, start, chord, x, y) {
    this.beat = beat;
    this.start = start;
    this.chord = chord;
    this.brightness = 255;
    this.x = window.wid/2 + x;
    this.fixed_x = window.wid/2 + x
    this.y = y;
    this.rw = 10; //largura da divisoria
    this.rh = 50; //altura da divisoria
    this.selected = false;
    this.changing = false;
  }

  clicked(px, py) {
    if(px > this.x-5 && px < this.x-5 + 10 && py>this.y-36 && py<this.y-36+this.rh){
      //locked = true;
      this.selected = true;
      console.log("boa")
    } else {
      //locked = false;
      this.selected = false;
    }
  }

  moving(px, limit_left = 0, limit_right){
    if(this.selected && px>limit_left && px<limit_right){
        //console.log(this.start)
        //console.log(px)
        //console.log(this.x)
        //console.log(this.start)
        let offset = (px - this.x)
        this.x = this.x + offset;
        this.fixed_x = this.fixed_x + offset;
        this.start = this.start + offset/100
    }
  }

  move() {
      //console.log("BAR: ", bar_wid)
      //console.log("BAR: ", song_duration)
      //console.log("t0: ", t0)
      //console.log("Curr: ", current_time)
      //console.log("curr: ", currentTime())
      let position = map(current_time, 0, duration, 0, bar_wid);
      //console.log("TIME: ", current_time)
      this.x = this.fixed_x - position;
      //console.log(this.x)
  }

  change(){
    if(this.changing){
      let inp = createInput("novo acorde: ");
      inp.position(0,0)
    }
  }



  show() {
    textAlign(LEFT)
    fill(this.brightness, 125);
    text(this.chord, this.x+(window.wid/50)+(amp/2), this.y);
    //textFont(fontRoboto);
    textSize(window.hei/12);
    stroke(0, 0, 0, 0)
    fill(0, 255, 255, 150);
    rect(this.x-5, this.y-36, this.rw+(amp/2), this.rh)
    textSize(window.hei/20);
    text(parseFloat(this.start).toFixed(2), (this.x-window.wid/50), this.y+(this.y/5));
  }
}