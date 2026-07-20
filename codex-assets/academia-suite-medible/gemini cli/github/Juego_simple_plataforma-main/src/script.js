//crear objeto de configuración que sirve para iniciar el juego
var config = {
    //indica que se usa para mostrar el juego, la recomendada es AUTO
    type:Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade:{
            gravity:{y:300},
            debug:false
        }

    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    },
     scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};
//variables para la puntuación y otra del objeto.
var score = 0;
var scoreText; //se configura en la función de create
var gameOver=false;

//temporizador
var timerText;
var timerEvent;
var initialTime = 30;


var cursor;
var wasd; //para usar las teclas w,a,s,d

//variables para identificar la ronda de juego
var round = 1; // Ronda inicial
var roundText; // Texto para mostrar la ronda

//para iniciar el juego
var game = new Phaser.Game(config);

//todo lo que carga antes del juego, como las imágenes por ejemplo.
function preload(){
    this.load.image('sky','assets/sky.png');
    this.load.image('ground','assets/platform.png');
    this.load.image('star','assets/star.png');
    this.load.image('bomb','assets/bomb.png');

    //este es el personaje (nombre,ubicacion,frames{}) los frames cambian si está corriendo, saltado o quieto por ejemplo.
    //ir a las propiedades de la imagen y en "detalles" fijarse el ancho y alto
    //como esta imagen es de 9 posiciones diferentes se tiene que dividir el ancho/9 (se hace porque es diferente el ancho dependiendo la posición)
    //con el alto no se divide por la cantidad de posiciones del personaje porque el alto siempre es el mismo
    //en este caso el ancho de los frames es de 288/9 = 32 px y el alto de los frames es de 48 px
    this.load.spritesheet('dude','assets/dude.png',{frameWidth: 32, frameHeight: 48});
}

//mostrar todos los objetos (plataformas, fondo, etc.), o sea lo del preload.
//el orden en el que se crean los objetos (this.add.) es el orden en el que aparecen en la pantalla, si se crea por ejemplo primero la estrella y dsps el cielo, la estrella no se va a poder ver porque la tapa la imagen del cielo.
function create(){
    //          (x,y,nombre) x,y están en px
    //la imagen mide 800x600 px, se ve en "detalles", para centrarla en phaser hay que dividirla por 2. Básicamente es la mitad del ancho y la mitad del alto para centrarla.
  this.add.image(400,300,'sky');

    //CREAR PLATAFORMAS

  //es estático para que se mantengan estáticos, en este caso las plataformas. El <physics> es el que más arriba en el código iniciamos y configuramos.
  platforms = this.physics.add.staticGroup();
    //                (x,y,nombre) plataforma.
    //El .setScale(2) multiplica por 2 las dimensiones de px que tiene la imagen original, en "detalles" se ve que es de 400x32--> 800x64
  platforms.create(400, 568, 'ground').setScale(2).refreshBody(); //avisa al sistema de físicas que se escaló por 2 un cuerpo físico estático
  platforms.create(600, 400, 'ground');
  platforms.create(50, 250, 'ground');
  platforms.create(750, 220, 'ground');


    //CREAR PERSONAJE
                                //(x,y,nombre) x,y indica de donde aparece el personaje 
  player = this.physics.add.sprite(100, 450, 'dude');

  //ahora el personaje respeta los límites de la pantalla y no desaparece al caer.
  player.setCollideWorldBounds(true);

  //hacer que al caer tenga un pequeño rebote, valor de 0 a 1.
  player.setBounce(0.2);


    //ANIMACIONES

    // Crear botón "Volver a jugar"
    let restartButton = this.add.text(250, 250, 'Volver a jugar', { fontSize: '32px', fill: '#fff', backgroundColor: '#000', padding: { x: 10, y: 5 } })
        .setInteractive()
        .setVisible(false);

    restartButton.on('pointerdown', () => {
        this.scene.restart();
        score = 0;
        gameOver = false;
        initialTime = 30; // Reiniciar el temporizador
        round = 1;        // Reiniciar la ronda
    });

    // Mostrar el botón cuando el juego termina
    this.events.on('update', () => {
        if (gameOver) {
            restartButton.setVisible(true);
        } else {
            restartButton.setVisible(false);
        }
    });
  this.anims.create({
    key: 'left',                        //(nombre,{fotograma que empieza, fotograma que termina}) esto en base a la imagen de los 9 movimientos (estos primeros cuatro son los que indican que se movió a la izquierda)
    frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
    frameRate: 10, //fotograma por segundo
    repeat: -1 //al terminar la animación que vuelva al incio
  });

 this.anims.create({
    key: 'turn', //quedarse quieto
    frames:[{key:'dude', frame:4}],
    frameRate: 20, //fotograma por segundo
    });

    this.anims.create({
    key: 'right',                        //(nombre,{fotograma que empieza, fotograma que termina}) esto en base a la imagen de los 9 movimientos (estos primeros cuatro son los que indican que se movió a la izquierda)
    frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
    frameRate: 10, //fotograma por segundo
    repeat: -1 //al terminar la animación que vuelva al incio
    });


    //darle gravedad de caída
    //player.body.setGravityY(300);

    //colisión entre personaje y plataformas, que el personaje no traspase las plataformas
    //como la plataforma es cuerpo estático no se va a romper ni desarmar, si fuese dinámico si.
    //                       (obj1, obj2)               
    this.physics.add.collider(player, platforms);

    //indica que se puede usar el teclado para el personaje, arriba, abajo, derecha, izquierda. Es de phaser.
    cursors = this.input.keyboard.createCursorKeys();

    wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE
    });


    //agregar estrellas y que el pj las recoja
    stars = this.physics.add.group({ //en este caso es dinámico y no estático porque la idea es que las estrellas reboten
    key: 'star', //imagen
    repeat: 11, //aparece una por defecto, si está en 11, habrá un total de 12 estrellas
    setXY: {x: 12, y:0, stepX:70} //arranca la 1er estrella en x=12 y=0. El stepX  indica que 'x' aumentará de a 70 cada estrella de distancia entre ellas.
    })

    //Recorre todos los elementos del grupo y le da aleatoriamente un valor de rebote entre 0,4 y 0,8. el valor va desde 0 y 1. Rebotan hasta parar solas.
    stars.children.iterate(function(child){
    child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    })

    //colisión igual que con el personaje y las platafromas (obj1,obj2)
    this.physics.add.collider(stars, platforms);

    //cuando una estrella colisiona con el jugador esta desaparece
    this.physics.add.overlap(player, stars, collectStar, null, true);

    //                       (x,y,'que queremos que se vea ahí', obj json que indica tamaño de la fuente y diseño (fill para el color))    
    scoreText = this.add.text(16, 10, 'Score: 0', {fontSize:'32px', fill:'#000'});


    // Agregar texto de ronda debajo del score
    roundText = this.add.text(16, 45, 'Ronda: 1', {fontSize:'32px', fill:'#000'});

    //agrega el temporizador
    //                       (x,y, tiempo inicial, diseño y color)
    timerText = this.add.text(
    this.sys.game.config.width - 200, 10, 'Tiempo: ' + initialTime, { fontSize: '32px', fill: '#000' });

    //Evento de temporizador
timerEvent = this.time.addEvent({
    delay: 1000,                // cada 1 segundo (1000 ms)
    callback: onEvent, //función que se llama al finalizar el temporizador
    callbackScope: this, // contexto de la función
    loop: true // para que se repita indefinidamente
});



    //grupos de bombas dinámicas
    bombs = this.physics.add.group();
    
    //colisiones que reboten con plataformas
    this.physics.add.collider(bombs, platforms);

    //colisiones de bomba con jugador pero que haga daño
    this.physics.add.collider(player, bombs, hitBomb, null, this) 
}


//capta lo que hace el usuario (va a la derecha, si salta,...), se actualiza cada segundo
function update(){
    if(gameOver){
        return
    }

    //moverse a la izquierda, valor en negativo, porque arranca en 0, es como para graficar que a la izquierda del cero es negativo y a la derecha es positivo
    if(cursors.left.isDown || wasd.left.isDown){
        player.setVelocityX(-160);
        player.anims.play('left', true); //llama a la animación "left" de antes, en true para que haga la animación, sino solo apunta para la izquierda y se mueve como si flotase
    }
    //moverse a la derecha, valor en positivo
    else if(cursors.right.isDown || wasd.right.isDown){
        player.setVelocityX(160);
        player.anims.play('right', true); //igual que en 'left'
    }
    //quedarse quieto
    else{
        player.setVelocityX(0);
        player.anims.play('turn'); //igual que antes solo que el 'true' no es necesario porque al quedarse quieto no realiza ninguna animación
    }

    //salto del personaje
    if((cursors.up.isDown || wasd.up.isDown || wasd.space.isDown) 
        && player.body.touching.down){
       player.setVelocityY(-330); 

    }

}

//función para recolectar estrellas
function collectStar(player, star){
    star.disableBody(true,true);

    score+= 10; //contador que cuando se agarre una estrella sume 10 puntos.

    scoreText.setText('Score: '+score); //setea que se vea Score y concatenar con la variable score.

    //saber cuantas estrellas quedan, si es 0 significa que se juntaron todas y tira un nuevo grupo de estrellas.
    if(stars.countActive(true) === 0){
        initialTime = 30;
        timerText.setText('Tiempo: ' + initialTime);

        // Aumentar la ronda y actualizar el texto
        round += 1;
        roundText.setText('Ronda: ' + round);


        stars.children.iterate(function(child){
            child.enableBody(true, child.x, 0, true, true);
        });
        
        //coordenada en x aleatoria opuesta a donde se encuentra el jugador
    var x = (player.x <400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
    //CREAR LA BOMBA       (x, y, nombre de la textura)
    var bomb = bombs.create(x, 16, 'bomb');

    bomb.setBounce(1); //que la bomba rebote un 1 (es mucho)
    bomb.setCollideWorldBounds(true); //que tenga en cuenta el límite de la pantalla que ocupa el juego
    bomb.setVelocity(Phaser.Math.Between(-200, 200),20); //que calcule velocidad en todas las direcciones y aumente entre -200, 200 y 20

    }

    
    
}

//función de la bomba
function hitBomb(player, bomb){
    this.physics.pause(); //frena el juego si jugador toca con la bomba

    player.setTint(0xff0000); //tiñe de rojo al jugador cuando toca la bomba

    player.anims.play('turn'); //si colisiona que se quede en la postura mirando para adelante

    gameOver = true;
}

//funcion del temporizador
function onEvent() {
    if (!gameOver) {
        initialTime -= 1; // Decrementa el tiempo inicial en 1 cada segundo
        // Actualiza el texto del temporizador
        timerText.setText('Tiempo: ' + initialTime);
        if (initialTime <= 0) { 
            // El jugador pierde por tiempo
            this.physics.pause();
            player.setTint(0xff0000);
            player.anims.play('turn'); // Se queda quieto
            gameOver = true;
        }
    }
}
