$( document ).ready(function() {

   function createCanvas(parent, width, height) {
    var canvas = document.getElementById("inputCanvas");
    canvas.context = canvas.getContext('2d');
    return canvas;
  }

  function init(container, width, height, fillColor) {

    var canvas = createCanvas(container, width, height);
    var ctx = canvas.context;


    ctx.fillCircle = function(x, y, radius, fillColor) {
      this.fillStyle = fillColor;
      this.beginPath();
      this.moveTo(x, y);
      this.arc(x, y, radius, 0, Math.PI * 2, false);
      this.fill();
    };


    ctx.clearTo = function(fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(0, 0, width, height);
    };

    ctx.clearTo("#fff");
    //Desenha no quadrado
    canvas.onmousemove = function(e) {
      if (!canvas.isDrawing) {
        return;
      }
      var x = e.pageX - this.offsetLeft;
      var y = e.pageY - this.offsetTop;
      var radius = 10;
      var fillColor = 'rgb(102,153,255)';
      ctx.fillCircle(x, y, radius, fillColor);
    };
    canvas.onmousedown = function(e) {
      canvas.isDrawing = true;
    };
    canvas.onmouseup = function(e) {
      canvas.isDrawing = false;
    };

  }

  //Inicializa o quadrado
  var container = document.getElementById('canvas');
  init(container, 200, 200, '#ddd');

  //limpa o quadrdado
  function clearCanvas() {
    var canvas = document.getElementById("inputCanvas");
    var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getData() {
    //Pega o elemento inputCanvas do html e pega o conteudo dele
    var canvas = document.getElementById("inputCanvas");
    var imageData = canvas.context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    var outputData = []
    //Modifica o visual do input
    for(var i = 0; i < data.length; i += 4) {
      var brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
      outputData.push(brightness);
    }
    //OBS: Aparentemente ele não envia para o servidor, apenas modifica no próprio arquivo js
    //Converte valores em javascript para uma String  JSON.
    $.post( "/postmethod", {
      canvas_data: JSON.stringify(outputData)
    }, function(err, req, resp){
      //Redireciona para a pagina do resultado
      window.location.href = "/results/"+resp["responseJSON"]["unique_id"];  
      //console.log(resp);
    });
  }

  //Quando o elemento #clearbutton for clicado limpa o quadrado de input
  $( "#clearButton" ).click(function(){
    clearCanvas();
  });

  //Quando o elemento #sendbutton for clicado pega a info do quadrado
  $( "#sendButton" ).click(function(){
    getData();
  });
});