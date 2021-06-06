class Chord {

  //construtor da classe
  constructor(beat, start, chord, x, fixed) {
    this.beat = beat;
    this.start = start;
    this.chord = chord;
    this.brightness = 255;
    this.x = window.wid/2 + x;
    this.fixed_x = window.wid/2 + x;
    this.y = window.hei / 3;
    this.rw = 10; //largura da divisoria
    this.rh = 50; //altura da divisoria
    this.selected = false;
    this.changing = false;
    this.replace = false;
  }

  //Função chamada quando o usuario clica na tela
  clicked(px, py) {
    if(px > this.x-5 && px < this.x-5 + 10 && py>this.y-36 && py<this.y-36+this.rh){
      this.selected = true;
    } else {
      this.selected = false;
    }
    let s = this.x+(window.wid/50)
    if(px >= s&&px < s+100 && py >= this.y-this.rh&&py < this.y){
      this.replace = true;
    }else{
      this.replace = false;
    }

  }

  //Função para acompanhar o mouse quando o usuário alterar o tempo do acorde
  moving(px, duration){
    if(this.selected){
      let offset = (px - this.x)
      if((this.start + offset/100) >= 0 && (this.start + offset/100) <= duration){
        this.x = this.x + offset;
        this.fixed_x = this.fixed_x + offset;
        this.start = this.start + offset/100
      }
    }
  }

  //Função que mapeia a posição do acorde de acordo com tempo da musica
  move() {
      let position = map(current_time, 0, duration, 0, bar_wid);
      this.x = this.fixed_x - position;
  }

  //Função usada para alterar o acorde quando o usuario requisitar
  change(){
    if(this.changing){
      let inp = createInput("novo acorde: ");
      inp.position(0,0)
    }
  }

  //Ajusta o fixed_x para acordes adicionados
  fix(last_chord, offset){
    this.fixed_x = last_chord.fixed_x + offset
  }

  //Função criada para renderizar os acordes
  show() {
    textAlign(LEFT)
    fill(this.brightness, 125);
    text(this.chord, this.x+(window.wid/50), this.y);
    textSize(window.hei/12);
    stroke(0, 0, 0, 0)
    fill(0, 255, 255, 150);
    rect(this.x-5, this.y-36, this.rw, this.rh)
    textSize(window.hei/20);
    text(parseFloat(this.start).toFixed(2), (this.x-window.wid/50), this.y+(this.y/5));
    if(this.x <= window.wid/2+10 && this.x >= window.wid/2-10){
      chord_now[0] = this.beat - 1
      chord_now[1] = this.chord
    }
  }
}