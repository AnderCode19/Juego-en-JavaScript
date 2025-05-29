let canvas;
let ctx;
let FPS = 50;
let ancho = 50;
let alto = 50;
let muro = '#044f14';

let puerta = '#3a1700';
let tierra = '#c6892f';
let llave = '#c6bc00';

let enemigo = [];

let protagonista;
let soccermap;

let poderes = [];

let mensajes = [];

let escenario = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 0],
    [0, 0, 2, 2, 2, 2, 2, 0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 0, 2, 2, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 0, 2, 2, 2, 0],
    [0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 1, 0, 0, 2, 0],
    [0, 2, 2, 3, 0, 0, 2, 0, 0, 2, 2, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

// Función para dibujar el escenario usando rectángulos con colores según el tile
function dibujarEscenario() {
    let color;

     for (y = 0; y < 10; y++){

         for (x = 0; x < 15; x++){

             let soccer =  escenario[y][x];
            ctx.drawImage(soccermap, soccer*32,0,32,32, ancho*x, alto*y, ancho, alto);
         }
     }
}


let antorcha = function (x,y) {
    this.x = x;
    this.y = y;
    this.retraso = 10;
    this.contador = 0;
    this.fotograma = 0;


    this.cambiarFotograma = function(){
        if(this.fotograma < 3 ){
            this.fotograma++;
        }else{
            this.fotograma = 0;
        }
    }


    this.dibuja = function(){

        if (this.contador < this.retraso)
            {
             this.contador++;
            }
            else
            {
                this.contador = 0;
                this.cambiarFotograma();
            }


        ctx.drawImage(soccermap, this.fotograma*32,64,32,32, ancho*this.x, alto*this.y, ancho, alto);
    }
}

let malo = function(x, y){
    this.x = x;
    this.y = y;
    this.direccion = Math.floor(Math.random()*4);
    this.retraso = 50;
    this.fotograma = 0;
    this.contador = 0;

    this.dibuja = function(){
        ctx.drawImage(soccermap, 0,32,32,32, this.x*ancho, this.y*alto, ancho, alto);
    }

    this.compruebaColision = function(x,y) {
        let colisiona = false;
        if(escenario[y][x]== 0){
            colisiona = true
        }
        return colisiona
    }

    this.mueve = function() {

        protagonista.colisionEnemigo(this.x, this.y);

        if(this.contador < this.retraso){
            this.contador++;

        } else {
            this.contador = 0;

            //direccion hacía arriba
            if(this.direccion == 0){
                if(this.compruebaColision(this.x, this.y -1) == false){
                    this.y--;
                } else {
                    this.direccion = Math.floor(Math.random() * 4);
                }
            }

            //direccion hacía abajo
            else if(this.direccion == 1){
                if(this.compruebaColision(this.x, this.y +1)==false){
                    this.y++;
                }else{
                    this.direccion = Math.floor(Math.random()*4);
                }
            }

            //direccion hacía la izquierda
            else if(this.direccion == 2){
                if(this.compruebaColision(this.x -1, this.y)==false){
                    this.x--;
                }else{
                    this.direccion = Math.floor(Math.random()*4);
                }
            }

            //direccion hacía la derecha
            else if(this.direccion == 3){
                if(this.compruebaColision(this.x + 1, this.y)==false){
                    this.x++;
                }else{
                    this.direccion = Math.floor(Math.random()*4);
                }
            }
        }
    }
}

let poder = function(x,y,direccion){
    this.x = x;
    this.y = y;
    this.direccion = direccion; // 'arriba', 'abajo', 'izquierda', 'derecha'
    this.activo = true;

    this.mover = function(){
        if(!this.activo) return;

        // mover el poder segun la direccion
        if(this.direccion == 'arriba') this.y--;
        else if(this.direccion == 'abajo') this.y++;
        else if(this.direccion == 'izquierda') this.x--;
        else if(this.direccion == 'derecha') this.x++;

        // comprobar límites y colisiones con muro
        if(this.x < 0 || this.x >= escenario[0].length || this.y < 0 || this.y >= escenario.length){
            this.activo = false;
            return;
        }

        if(escenario[this.y][this.x] == 0){
            this.activo = false;
            return;
        }

        // comprobar colisión con enemigos
        for(let i = 0; i < enemigo.length; i++){
            if(enemigo[i].x == this.x && enemigo[i].y == this.y && this.activo){
                enemigo.splice(i,1); // eliminar enemigo
                this.activo = false;
                mostrarMensaje('Monstruo eliminado');
                break;
            }
        }
    }

    this.dibuja = function(){
        if(!this.activo) return;
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x * ancho + ancho/2, this.y * alto + alto/2, 10, 0, Math.PI*2);
        ctx.fill();
    }
}

let jugador = function(){
    this.x = 1;
    this.y = 1;
    this.color = '#820c01';
    this.llave = false;

    this.dibuja = function(){
        ctx.drawImage(soccermap, 32,32,32,32, this.x*ancho, this.y*alto, ancho, alto);
    }

    this.colisionEnemigo = function(x,y){
        if(this.x == x && this.y == y){
            this.muerte();
        }
    }

    this.margenes = function(x,y){
        let colision = false;
            if(escenario[y][x] == 0){
                colision = true;
        }
        return (colision)
    };

    this.arriba = function(){
        if(this.margenes(this.x, this.y-1) == false)
        this.y--;
            this.logicaObjetos();
    }

    this.abajo = function(){
        if(this.margenes(this.x, this.y+1) == false)
        this.y++;
            this.logicaObjetos();

    }

    this.izquierda = function(){
        if(this.margenes(this.x-1, this.y) == false)
        this.x--;
            this.logicaObjetos();

    }

    this.derecha = function(){
        if(this.margenes(this.x+1, this.y) == false)
        this.x++;
            this.logicaObjetos();

    }

    this.victoria = function(){
        // Mostrar mensaje en pantalla cuando gana
        mostrarMensaje('¡Felicidades, pasaste el juego, has ganado!');
        this.x = 1;
        this.y = 1;
        this.llave = false;
        escenario[8][3] = 3;
    }

    this.muerte = function () {
        mostrarMensaje('¡Mala suerte, has perdido!');
        this.x = 1;
        this.y = 1;
        this.llave = false;
        escenario[8][3] = 3;
    }

    this.logicaObjetos = function() {
        let objeto = escenario[this.y][this.x];

        //para obtener la llave
        if(objeto == 3 ){
            this.llave = true;
            escenario[this.y][this.x] = 2;
            mostrarMensaje('¡Has obtenido la llave!');
        }

        //para ganar
        if(objeto == 1 ){
            if(this.llave == true){
                this.victoria();
            }else{
                mostrarMensaje('¡No tienes la llave, no tienes con que abrir la puerta!');
            }
        }
    }
}

// para mostrar mensajes en pantalla
function mostrarMensaje(texto){
    mensajes.push({texto: texto, tiempo: 200}); // tiempo en frames (~4 segundos)
}

// Dibuja los mensajes en pantalla
function dibujarMensajes(){
    ctx.font = '40px Arial';
    ctx.fillStyle = 'yellow';
    ctx.textAlign = 'center';
    for(let i=0; i<mensajes.length; i++){
        let msg = mensajes[i];
        ctx.fillText(msg.texto, canvas.width/2, 50 + i*30);
        msg.tiempo--;
        if(msg.tiempo <= 0){
            mensajes.splice(i,1);
            i--;
        }
    }
}

let teclasPulsadas = {};

function inicializa(){

    canvas = document.getElementById('canvas');
    ctx =  canvas.getContext('2d');

    soccermap = new Image();
    soccermap.src = '/img/soccermap.png';

    //creamos el jugador
    protagonista = new jugador();

    //creamos la antorcha
    imagenAntorcha = new antorcha(0,0);

    //creamos los enemigos
    enemigo.push(new malo(3,3));
    enemigo.push(new malo(5,7));
    enemigo.push(new malo(7,7));

    // Capturar teclas pulsadas para detectar combinaciones
    document.addEventListener('keydown', function(e){
        teclasPulsadas[e.keyCode] = true;

        // Mover jugador
        if(e.keyCode == 38){  // arriba
            protagonista.arriba();
        }
        if(e.keyCode == 40){  // abajo
            protagonista.abajo();
        }
        if(e.keyCode == 37){  // izquierda
            protagonista.izquierda();
        }
        if(e.keyCode == 39){  // derecha
            protagonista.derecha();
        }

        if(teclasPulsadas[81]){
            lanzarPoder('arriba');
        }
    });

    document.addEventListener('keyup', function(e){
        delete teclasPulsadas[e.keyCode];
    });

    setInterval(function(){
        principal();
    },1000/FPS);

}

// para lanzar poder desde la posición del jugador en una dirección dada
function lanzarPoder(direccion){
    let px = protagonista.x;
    let py = protagonista.y;

    if(direccion == 'arriba') py--;
    else if(direccion == 'abajo') py++;
    else if(direccion == 'izquierda') px--;
    else if(direccion == 'derecha') px++;

    // Solo lanzar si no choca con muro
    if(py < 0 || py >= escenario.length || px < 0 || px >= escenario[0].length) return;
    if(escenario[py][px] == 0) return;

    poderes.push(new poder(px, py, direccion));
}

function borrarCanvas() {
    canvas.width = 750;
    canvas.height = 500;
}

function principal() {
    borrarCanvas();
    dibujarEscenario();
    imagenAntorcha.dibuja();
    protagonista.dibuja();

    for(let i = 0; i < poderes.length; i++){
        poderes[i].mover();
        poderes[i].dibuja();
        if(!poderes[i].activo){
            poderes.splice(i,1);
            i--;
        }
    }

    for(let c = 0; c < enemigo.length; c++) {
        enemigo[c].mueve();
        enemigo[c].dibuja();
    }

    dibujarMensajes();

    // Si no hay enemigos, mostrar mensaje de victoria
    if(enemigo.length === 0 && !mensajes.some(m => m.texto.includes('Felicidades, eliminaste a todos los enemigos'))){
        protagonista.victoria();
    }
}
