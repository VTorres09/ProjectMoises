//Variavéis globais não inicializadas
let song_json, duration, c_input, bar_wid;

//Variavéis globais pré-definidas
let locked = false;
let pause = true;
let editing = false;
let animations = false;
let current_time = 0;
let last_current_time = 0;
let t = -1;
let chord_now = [0, '']
let index;


//A função preload carrega qualquer arquivo necessário antes de rodar qualquer outra função do p5
function preload() {

    //Atribuimos o JSON da música obtido na "p5page.html" a uma variável global do p5
    song_json = result

}

//Definimos um array de acordes
var chords = [];

//A função setup, nativa do p5, é executada uma única vez após o termino da função preload
function setup() {

    //Definimos variáveis globais para o tamanho da tela usando o window.
    window.wid = 1000;
    window.hei = 600;

    //Criamos o canvas onde o p5 irá renderizar os gráficos
    createCanvas(window.wid, window.hei).parent('canvasHolder');

    //A função parseChords irá preencher o array de acordes criado previamente com os acordes do JSON
    parseChords(chords);

    //Acessamos o último acorde do array para definir qual será o comprimento da barra de acordes
    bar_wid = chords[chords.length - 1].x

    //Criamos a area de input para a substituição de acordes
    c_input = createInput()
    c_input.position(((window.wid / 2) + (c_input.width / 1.2)), (window.hei / 2) + (c_input.height) * 1.2)
    c_button = createButton('✎ update');
    c_button.position(c_input.x + c_input.width, (window.hei / 2) + (c_input.height) * 1.2);
    c_button.mousePressed(update_chord);
    c_input.color = (0, 255, 255)
    //Vale lembrar que essa area de input ainda não é criada pelo p5, e por isso não é dinâmica como os outros elementos da página
}

//A função parseChords, chamada no setup(), vai percorrer o JSON e popular o array com os acordes encontrados
function parseChords(chords) {

    //Percorremos o JSON
    for (var i in song_json) {

        //adquirimos o beat, o tempo(start) e o acorde em si do acorde atual no JSON
        var beat = song_json[i]["current_beat"];
        var start = song_json[i]["current_beat_time"];
        var chord = song_json[i]["estimated_chord"];

        //findNextX irá definir a posição no eixo X de cada acorde
        var x = findNextX(i, start);
        var y = window.hei / 3;

        //Criamos um objeto do tipo Chord, descrito em "chord.js", e inserimos no array
        var a = new Chord(beat, start, chord, x, y, i);
        chords.push(a);
    }
}

//A função finNextX, chamada em parseChords irá definir a posição X de cada acorde
function findNextX(i, start) {
    if (i > 0) {
        return start * 100;
    } else {
        return song_json[i]["current_beat_time"];
    }
}

//A função draw, nativa do p5, irá atualizar a tela repetidamente
function draw() {

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
    não é disponibilizada.
    */
    if (!pause && current_time != last_current_time) {

        /*
        NOTA: Estamos calculando o índice de suavização baseado no tamanho da tela gerada pelo p5
        Caso esteja bugado, alterar o valor do índice poderá resolver
        */
        let indice = window.wid/65000
        current_time += indice
    }

    rect(window.wid / 2, window.hei / 8, 50, 50)
    rect(window.wid / 2 - 40, window.hei / 3, 40, 80)
    background(0, 0, 0);

    //A função playButton renderiza os botões e outros elementos na tela
    playButton();

    //A função drawRects renderiza as caixas em que os acordes ficam contidos, baseado na posição desses
    drawRects();

    //Percorremos todos os acordes
    for (var i in chords) {
        if (!pause) {
            //Enquanto a musica está sendo reporduzida os acordes movem em relação ao tempo da música
            chords[i].move();
        }
        //Aqui os acordes sao renderizados
        chords[i].show();
        chords[i].change();
    }


}

//Nessa função obtemos o input do usuario para alterar o acorde
function update_chord() {
    chord_now[1] = c_input.value()
    chords[chord_now[0]].chord = c_input.value()
}

//drawRects renderiza os retangulos que os acordes estão inseridos, dinamicamente baseado na posição dos mesmos
function drawRects() {
    let i = 0;
    for (i in chords) {
        if (i > 0) {
            let r = 20 * ((i % 2) + 1);
            fill(30 + r, 30 + r, 30 + r, 25 + r)
            rect(chords[i - 1].x, chords[i].y - 36, chords[i].x - chords[i - 1].x, chords[i].rh);
        }
    }
}

//PlayButton renderiza os botões e mais alguns elementos na tela
function playButton() {
    let radius = window.hei / 13
    let xc = window.wid / 2
    let yc = window.hei / 1.6

    fill(0, 255, 255)
    textAlign(CENTER)
    text(chord_now[1], window.wid / 2, window.hei / 8)

    fill(0, 255, 255)
    triangle(xc, window.hei / 4, xc - radius, window.hei / 5, xc + radius, window.hei / 5)

    if (pause) {
        txt = "Play"
        fill(50, 50, 50)
    } else {
        circle(window.wid / 2, window.hei / 1.6, radius)
        fill(0, 255, 255)
        circle((window.wid / 2) * 1.2, window.hei / 1.6, radius * 0.7)
        circle((window.wid / 2) * 0.8, window.hei / 1.6, radius * 0.7)
        txt = "Pause"
    }
    circle((window.wid / 2) * 1.2, window.hei / 1.6, radius * 0.7)
    circle((window.wid / 2) * 0.8, window.hei / 1.6, radius * 0.7)
    rect((window.wid / 2) * 1.8, yc - (0.5 * radius), radius * 2, radius, 200)
    circle(xc, yc, radius)
    textAlign(CENTER)
    textSize(window.hei / 20)
    fill(0, 255, 255)
    text(txt, window.wid / 2, window.hei / 1.32)


    if (pause) {
        fill(0, 255, 255)
        triangle(xc + (radius * 0.7), yc, xc - (0.5 * radius), yc - (0.5 * radius), xc - (0.5 * radius), yc + (0.5 * radius))
        textSize(window.hei / 20)
        text('>>', (window.wid / 2) * 1.2, window.hei / 1.56)
        text('<<', (window.wid / 2) * 0.8, window.hei / 1.56)
        textSize(window.hei / 25)
        text('Send', (window.wid / 2) * 1.89, (yc - (0.1 * radius)) * 1.04)
    } else {
        fill(50, 50, 50)
        rect(xc - (0.5 * radius), yc - (0.5 * radius), radius * 0.3, radius)
        rect(xc + (0.5 * radius) - (radius * 0.35), yc - (0.5 * radius), radius * 0.3, radius)
        textSize(window.hei / 20)
        text('>>', (window.wid / 2) * 1.2, window.hei / 1.56)
        text('<<', (window.wid / 2) * 0.8, window.hei / 1.56)
        textSize(window.hei / 25)
        text('Send', (window.wid / 2) * 1.89, (yc - (0.1 * radius)) * 1.04)
    }
}

/*
mousePressed é uma função nativa do p5 que ativa sempre que o mouse é pressionado.
Usamos para identificar cliques nos botões usando a posição do mouse
*/
function mousePressed() {
    for (var i in chords) {
        chords[i].clicked(mouseX, mouseY);
    }
    let d = dist(mouseX, mouseY, window.wid / 2, window.hei / 1.6)
    if (d < window.hei / 15) {
        if (pause) {
            audio.play();
            pause = false;
        } else {
            audio.pause();
            pause = true
        }
    }
    let d2 = dist(mouseX, mouseY, (window.wid / 2) * 1.2, window.hei / 1.6)
    if (d2 < (window.hei / 13) * 0.7) {
        audio.currentTime += 5.0;

    }

    let d3 = dist(mouseX, mouseY, (window.wid / 2) * 0.8, window.hei / 1.6)
    if (d3 < (window.hei / 13) * 0.7) {
        audio.currentTime -= 5.0;
    }

    let d4 = dist(mouseX, mouseY, (window.wid / 2) * 1.95, window.hei / 1.6)
    if (d4 < (window.hei / 11)) {

        $.post("/postmethod", {
            canvas_data: JSON.stringify(chords)
        }, function (err, req, resp) {

            window.location.href = "/result/";
        });
    }

    let d5 = dist(window.wid / 2, window.hei / 8, mouseX, mouseY)
    if (d5 < 50) {
        if (editing) {
            editing = false
        } else {
            editing = true
        }
    }
}

//Função nativa o p5 usada para identificar movimento de drag do mouse
function mouseDragged() {
    for (var i in chords) {
        if (i == 0) {
            chords[i].moving(mouseX, 0, 10000000);
        } else if (i + 1 == null) {
            chords[i].moving(mouseX, 0, 10000000);
        } else {
            chords[i].moving(mouseX, 0, 10000000);
        }
    }
}