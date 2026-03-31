/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 16/01/2019

        Objeto estatico que contiene las 7 posibles texturas de una cara de la ficha 

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 16/01/2019
*/




// Objeto único que contiene las 7 texturas necesarias para las fichas
var Domino_Texturas = function() {
    // Tamaño de los puntos
    this.TamPuntos = 50;
    
    this.Textura = [];
    this.Buffer  = [];
    // Inicia las texturas
    this.Iniciar = function() {
        for (i = 0; i < 7; i++) {
            // Creo el buffer
            this.Buffer[i] = new BufferCanvas(512, 512);
            // Pinto el borde gris
            this.Buffer[i].Context.strokeStyle = 'rgb(200, 200, 200)';
            this.Buffer[i].Context.lineWidth  = 12;
            this.Buffer[i].Context.strokeRect(0, 0, 512, 512);
            // Pinto el separador
            this.Buffer[i].Context.fillStyle = 'rgb(0, 0, 0)';
            this.Buffer[i].Context.fillRect(500, 48, 12, 416);
        }
        
        // Pinto la ficha 1
        this.Buffer[1].Context.beginPath();
        this.Buffer[1].Context.arc(256, 256, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[1].Context.fill();
        
        // Pinto la ficha 2
        this.Buffer[2].Context.beginPath();
        this.Buffer[2].Context.arc(128, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[2].Context.fill();
        this.Buffer[2].Context.beginPath();
        this.Buffer[2].Context.arc(384, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[2].Context.fill();
        
        // Pinto la ficha 3
        this.Buffer[3].Context.beginPath();
        this.Buffer[3].Context.arc(128, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[3].Context.fill();
        this.Buffer[3].Context.beginPath();
        this.Buffer[3].Context.arc(256, 256, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[3].Context.fill();
        this.Buffer[3].Context.beginPath();
        this.Buffer[3].Context.arc(384, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[3].Context.fill();
        
        // Pinto la ficha 4
        this.Buffer[4].Context.beginPath();
        this.Buffer[4].Context.arc(128, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[4].Context.fill();
        this.Buffer[4].Context.beginPath();
        this.Buffer[4].Context.arc(384, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[4].Context.fill();
        this.Buffer[4].Context.beginPath();
        this.Buffer[4].Context.arc(128, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[4].Context.fill();
        this.Buffer[4].Context.beginPath();
        this.Buffer[4].Context.arc(384, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[4].Context.fill();

        // Pinto la ficha 5
        this.Buffer[5].Context.beginPath();
        this.Buffer[5].Context.arc(128, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[5].Context.fill();
        this.Buffer[5].Context.beginPath();
        this.Buffer[5].Context.arc(384, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[5].Context.fill();
        this.Buffer[5].Context.beginPath();
        this.Buffer[5].Context.arc(128, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[5].Context.fill();
        this.Buffer[5].Context.beginPath();
        this.Buffer[5].Context.arc(384, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[5].Context.fill();
        this.Buffer[5].Context.beginPath();
        this.Buffer[5].Context.arc(256, 256, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[5].Context.fill();
        
        // Pinto la ficha 6
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(128, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(384, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(128, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(384, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(256, 384, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        this.Buffer[6].Context.beginPath();
        this.Buffer[6].Context.arc(256, 128, this.TamPuntos, 0, Math.PI * 2);
        this.Buffer[6].Context.fill();
        
        
        for (i = 0; i < 7; i++) {
            this.Textura[i] = new THREE.Texture(this.Buffer[i].Canvas);
            this.Textura[i].needsUpdate = true;
        }
        
        
        this.MaterialBase  = new THREE.MeshPhongMaterial({ color: 0x111111, specular : 0x555555, transparent : false, opacity:1.0, shininess : 200 });
        this.MaterialCara  = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, specular : 0xFFFFFF, transparent : false, opacity:1.0, shininess : 200 });
        this.MaterialCaraR = new THREE.MeshPhongMaterial({ color: 0xFFEE94, specular : 0xFFEE94, transparent : false, opacity:1.0, shininess : 200 });
    }
}

Texturas = new Domino_Texturas();


/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 16/01/2019

        Objeto para una ficha del domino

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 28/01/2019
*/

/* 
    0   0   0   0   0   0   0               3   3   3   3                   6
    -   -   -   -   -   -   -               -   -   -   -                   -
    0   1   2   3   4   5   6               3   4   5   6                   6

    
    1   1   1   1   1   1                   4   4   4
    -   -   -   -   -   -                   -   -   -
    1   2   3   4   5   6                   4   5   6

    2   2   2   2   2                       5   5
    -   -   -   -   -                       -   -
    2   3   4   5   6                       5   6
*/

// Creo el objeto animación
var Animaciones = new ObjetoAnimacion;



var Domino_Ficha = function() {
    this.Valores    = [ 0, 0 ];
    this.Ficha      = new THREE.Object3D();
    this.Hover      = 0;                    // puede ser 0, 1, 2
    this.Colocada   = false;                // La ficha se ha colocado
    this.Escala     = 1.0;                  // Escala para la ficha (para el efecto hover)
    this.Direccion  = "nada";               // Puede ser nada, izquierda, derecha, arriba, abajo, y centro
    this.Rama       = "nada";               // Puede ser nada, izq, y der
    
    // Hay que especificar un valor de 0 a 27 con el tipo de ficha
    // Devuelve el grupo de objetos que forman la ficha listo para aladir a la escena
    this.Crear = function(Tipo) {
        // Asigno los valores de la ficha 
        switch (Tipo) {
            case 0  :    this.Valores = [ 0, 0 ];      break;
            case 1  :    this.Valores = [ 0, 1 ];      break;
            case 2  :    this.Valores = [ 0, 2 ];      break;
            case 3  :    this.Valores = [ 0, 3 ];      break;
            case 4  :    this.Valores = [ 0, 4 ];      break;
            case 5  :    this.Valores = [ 0, 5 ];      break;
            case 6  :    this.Valores = [ 0, 6 ];      break;
            case 7  :    this.Valores = [ 1, 1 ];      break;
            case 8  :    this.Valores = [ 1, 2 ];      break;
            case 9  :    this.Valores = [ 1, 3 ];      break;
            case 10 :    this.Valores = [ 1, 4 ];      break;
            case 11 :    this.Valores = [ 1, 5 ];      break;
            case 12 :    this.Valores = [ 1, 6 ];      break;
            case 13 :    this.Valores = [ 2, 2 ];      break;
            case 14 :    this.Valores = [ 2, 3 ];      break;
            case 15 :    this.Valores = [ 2, 4 ];      break;
            case 16 :    this.Valores = [ 2, 5 ];      break;
            case 17 :    this.Valores = [ 2, 6 ];      break;
            case 18 :    this.Valores = [ 3, 3 ];      break;
            case 19 :    this.Valores = [ 3, 4 ];      break;
            case 20 :    this.Valores = [ 3, 5 ];      break;
            case 21 :    this.Valores = [ 3, 6 ];      break;
            case 22 :    this.Valores = [ 4, 4 ];      break;
            case 23 :    this.Valores = [ 4, 5 ];      break;
            case 24 :    this.Valores = [ 4, 6 ];      break;
            case 25 :    this.Valores = [ 5, 5 ];      break;
            case 26 :    this.Valores = [ 5, 6 ];      break;
            case 27 :    this.Valores = [ 6, 6 ];      break;
        }
                
        // Creo el rectangulo que hace de base negra
        this.Base = new THREE.Mesh(  new THREE.BoxGeometry( 2.0, 1.0, 0.1 ), 
                                     Texturas.MaterialBase);
//        this.Ficha.name = "Ficha";
        this.Ficha.add(this.Base);
        this.Base.position.set(0.0, 0.0, -0.1);
        // Activo las sombras para la ficha
        this.Base.castShadow = true;
        this.Base.receiveShadow = true;
        
                
        // Creo la primera cara
        this.Cara1 = new THREE.Mesh(  new THREE.BoxGeometry( 1.0, 1.0, 0.1 ), Texturas.MaterialCara);        
        this.Ficha.add(this.Cara1);
        this.Cara1.position.set(-0.5, 0.0, 0.0);
        
        this.Textura1 = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial( { map: Texturas.Textura[this.Valores[0]], transparent : true, opacity:1.0  }) );
        this.Ficha.add(this.Textura1);
        this.Textura1.position.set(-0.5, 0.0, 0.055);

        
        // Creo la segunda cara
        this.Cara2 = new THREE.Mesh(  new THREE.BoxGeometry( 1.0, 1.0, 0.1 ), Texturas.MaterialCara);
        this.Ficha.add(this.Cara2);
        this.Cara2.position.set(0.5, 0.0, 0.0);
        
        this.Textura2 = new THREE.Mesh( new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial( { map: Texturas.Textura[this.Valores[1]], transparent : true, opacity:1.0  }) );
        this.Ficha.add(this.Textura2);
        this.Textura2.rotation.z = Math.PI;
        this.Textura2.position.set(0.5, 0.0, 0.055);
        
        
        this.Bola = new THREE.Mesh(new THREE.SphereGeometry( 0.1, 32, 32 ), new THREE.MeshPhongMaterial( { color: 0x999999, specular : 0xccffcc, transparent : false, opacity: 1.0 } ));
//        this.Bola.position.set(0.0, 0.0, 0.05);
        this.Ficha.add(this.Bola);
        
        // Roto la ficha para que quede de cara
        this.Ficha.rotation.x = -Math.PI / 2;
        
        return this.Ficha;
    };
    
    this.RotarBocaAbajo = function() {
        this.Ficha.rotation.x = Math.PI / 2;
    };
    
    this.RotarBocaArriba = function() {
        this.Ficha.rotation.x = -Math.PI / 2;
    };
    
    this.RotarV = function() {
        this.Ficha.rotation.z = Math.PI / 2;
    };
    
    this.RotarH = function() {
        this.Ficha.rotation.z = 0.0;
    };
       
    this.AsignarHover = function(Hover) {
        if (typeof(this.AniHover) !== "undefined") {
            if (this.AniHover.Terminado() === false) return;
//            this.AniHover.Terminar();
        }
        
        this.Hover = Hover;
        
        if (typeof(Domino.Partida.FichaDerecha.ValorLibre) === "undefined") return;
        
        // Doble posibilidad
        if ((Domino.Partida.FichaDerecha.ValorLibre()   === this.Valores[0] || Domino.Partida.FichaDerecha.ValorLibre()   === this.Valores[1]) &&   // Si el valor libre derecho coincide con algun valor de la ficha
            (Domino.Partida.FichaIzquierda.ValorLibre() === this.Valores[0] || Domino.Partida.FichaIzquierda.ValorLibre() === this.Valores[1]) &&   // Si el valor libre izquierdo coincide con algun valor de la ficha
            (Hover > 0) &&                                                                                                                          // Si la ficha está hover
            (Domino.Partida.FichaIzquierda.ValorLibre() !== Domino.Partida.FichaDerecha.ValorLibre())) {                                            // Si la rama izquierda y la rama derecha no tienen el mismo valor libre
            if (Hover === 1) {
                this.Cara1.material = Texturas.MaterialCaraR;
                this.Cara2.material = Texturas.MaterialCara;
            }
            else if (Hover === 2) {
                this.Cara1.material = Texturas.MaterialCara;
                this.Cara2.material = Texturas.MaterialCaraR;
            }
        }
        else {
            this.Cara1.material = Texturas.MaterialCara;                
            this.Cara2.material = Texturas.MaterialCara;                            
        }
        
        // Está hover
        if (Hover > 0) {
            this.AniHover = Animaciones.CrearAnimacion([
                    { Paso : { Escala : this.Escala, z : 6.0 } },
                    { Paso : { Escala : 1.2,         z : 5.6                   }, Tiempo : 300, FuncionTiempo : FuncionesTiempo.Lineal }
            ], { FuncionActualizar : function(Valores) { 
//                    this.Ficha.position.z = Valores.z;
                    this.Ficha.scale.set(Valores.Escala, Valores.Escala, Valores.Escala);
                    this.Escala = Valores.Escala;
            }.bind(this) });
        }
        else {
            this.AniHover = Animaciones.CrearAnimacion([
                    { Paso : { Escala : this.Escala, z : 5.6   } },
                    { Paso : { Escala : 1.0,         z : 6.0                     }, Tiempo : 300, FuncionTiempo : FuncionesTiempo.Lineal }
            ], { FuncionActualizar : function(Valores) { 
  //                  this.Ficha.position.z = Valores.z;
                    this.Ficha.scale.set(Valores.Escala, Valores.Escala, Valores.Escala);
                    this.Escala = Valores.Escala;
            }.bind(this) });            
        }
        
        this.AniHover.Iniciar();
    };
    
    
    
    this.Colocar = function(FichaOrigen, Jugador1) {
        var Ret = { PosX : 0, PosZ : -2, RotZ : 0 };
        // Es la primera ficha (6 doble)
        if (FichaOrigen === false) {
            this.Direccion = "centro";
            Ret.RotZ = Math.PI / 2;
            window.ContadorDerecha      = 0;
            window.ContadorIzquierda    = 0;
            window.FinContadorIzquierda = 5;
            window.FinContadorDerecha   = 5;
        }
        else {
            // Miro la dirección de la ficha origen
            switch (FichaOrigen.Direccion) {
                case "centro" :
                    // Si las dos ramas están libres, elijo uno al azar
                    if (FichaOrigen === Domino.Partida.FichaIzquierda && FichaOrigen === Domino.Partida.FichaDerecha) {
                        if (RandInt() === 0)  { 
                            Ret = this.BuscarPosIzq(FichaOrigen);
                            this.Direccion = "izquierda";
                            this.Rama = "izquierda";
                        }
                        else {
                            Ret = this.BuscarPosDer(FichaOrigen);
                            this.Direccion = "derecha";
                            this.Rama = "derecha";
                        }
                    }
                    else { // Solo hay una rama libre
                        if (FichaOrigen === Domino.Partida.FichaIzquierda) {
                            Ret = this.BuscarPosIzq(FichaOrigen);
                            this.Direccion = "izquierda";
                            this.Rama = "izquierda";                            
                        }
                        else {
                            Ret = this.BuscarPosDer(FichaOrigen);
                            this.Direccion = "derecha";
                            this.Rama = "derecha";                            
                        }
                    }
                    break;
                    
                case "izquierda" :
                    if (FichaOrigen.Rama === "izquierda") {
                        // Correción para las fichas dobles si se llega al final de la izquierda
/*                        if (window.ContadorIzquierda === window.FinContadorIzquierda && this.FichaDoble() === true) {
                            window.FinContadorIzquierda++;
                        }*/
                        
                        if (window.ContadorIzquierda !== 5) {
                            Ret = this.BuscarPosIzq(FichaOrigen);
                            this.Direccion = "izquierda";
                        }
                        else if (window.ContadorIzquierda === window.FinContadorIzquierda) {
                            Ret = this.BuscarPosInf(FichaOrigen);
                            this.Direccion = "abajo";
                        }
                    }
                    else {
                        Ret = this.BuscarPosIzq(FichaOrigen);
                        this.Direccion = "izquierda";
                    }                        
                    this.Rama = (FichaOrigen.Rama !== "nada") ? FichaOrigen.Rama : "izquierda";                                                
                    break;
                    
                case "derecha" :
                    if (FichaOrigen.Rama === "derecha") {
                        // Correción para las fichas dobles si se llega al final de la derecha
/*                        if (window.ContadorDerecha === window.FinContadorDerecha && this.FichaDoble() === true) {
                            window.FinContadorDerecha++;
                        }*/
                            
                        if (window.ContadorDerecha !== 5) {
                            Ret = this.BuscarPosDer(FichaOrigen);
                            this.Direccion = "derecha";
                        }
                        else if (window.ContadorDerecha === window.FinContadorDerecha) {
                            Ret = this.BuscarPosSup(FichaOrigen);
                            this.Direccion = "arriba";
                        }
                    }
                    else {
                        Ret = this.BuscarPosDer(FichaOrigen);
                        this.Direccion = "derecha";
                    }                        
                    this.Rama = (FichaOrigen.Rama !== "nada") ? FichaOrigen.Rama : "derecha";                                                
                    break;
                    
                case "abajo" :
                    Ret = this.BuscarPosInfDer(FichaOrigen);
                    this.Rama = "izquierda";
                    this.Direccion = "derecha";
                    break;
                
                case "arriba" :
                    Ret = this.BuscarPosSupIzq(FichaOrigen);
                    this.Direccion = "izquierda";
                    this.Rama = "derecha";
                    break;
                
            }
            // Incremento el contador de la rama actual
            if (this.Rama === "izquierda") {
                window.ContadorIzquierda ++;                
//                Domino.Partida.FichaIzquierda = this;
            }
            else {
                window.ContadorDerecha ++;
//                Domino.Partida.FichaDerecha = this;
            }
            
            if (this.Direccion === "nada") {
                putaputaputa();
            }
            
            console.log("Colocar : r : " + this.Rama + ", d : " + this.Direccion + ", Pos:[" + Ret.PosX + ", " + Ret.PosZ + ", " + Ret.RotZ + "]");
        }
        
        
        // Termino las posibles animaciones en curso
        if (typeof(this.AniHover) !== "undefined")    this.AniHover.Terminar();        
        if (typeof(this.AniColocar) !== "undefined")  this.AniColocar.Terminar();
        
        
        this.Colocada = true;
        
        var Retraso = (typeof(Jugador1) === "undefined") ? 400 : 0;
        
        this.AniColocar = Animaciones.CrearAnimacion([
                { Paso : { Escala : this.Escala,    x : this.Ficha.position.x,  z : this.Ficha.position.z,  rx : this.Ficha.rotation.x, rz : this.Ficha.rotation.z  } },
                { Paso : { Escala : 1.0,            x : Ret.PosX,               z : Ret.PosZ,               rx : -Math.PI / 2,          rz : Ret.RotZ  }, Tiempo : 400, Retraso : Retraso, FuncionTiempo : FuncionesTiempo.SinInOut }
            ], {
            FuncionActualizar : function(Valores) { 
                this.Ficha.scale.set(Valores.Escala, Valores.Escala, Valores.Escala);
                this.Escala = Valores.Escala;
                this.Ficha.position.set(Valores.x, this.Ficha.position.y, Valores.z);
                this.Ficha.rotation.z = Valores.rz;
                this.Ficha.rotation.x = Valores.rx;
            }.bind(this),
            FuncionTerminado : function() {
                if (this.Rama === "nada") {
                    Domino.Partida.FichaIzquierda = this;
                    Domino.Partida.FichaDerecha   = this;                
                }
                else if (this.Rama === "izquierda") Domino.Partida.FichaIzquierda = this;
                else                                Domino.Partida.FichaDerecha   = this;
                
                // Una vez se ha colocado la ficha paso al siguiente turno y jugador
                Domino.Partida.JugadorActual ++;
                if (Domino.Partida.JugadorActual > 3) {
                    Domino.Partida.JugadorActual = 0;
                }
                Domino.Partida.TurnoActual ++;
                
            }.bind(this)
            
        });            
        this.AniColocar.Iniciar();
        
    };
    
    
    
    this.FichaDoble = function() {
        if (this.Valores[0] == this.Valores[1]) return true;
        return false;
    };


    this.ValorLibre = function() {
        switch (this.Direccion) {
            // solo para el 6 doble
            case "centro"       : return this.Valores[0];       
            // Si está rotado 180 grados es el valor 1, si no es el valor 0
            case "izquierda"    : return (this.Ficha.rotation.z === Math.PI) ? this.Valores[1] :  this.Valores[0];
            case "derecha"      : return (this.Ficha.rotation.z === Math.PI) ? this.Valores[0] :  this.Valores[1];
            case "arriba"       : return (this.Ficha.rotation.z === Math.PI / 2) ? this.Valores[1] : this.Valores[0];
            case "abajo"        : return (this.Ficha.rotation.z === Math.PI / 2) ? this.Valores[0] : this.Valores[1];
        }
        return -1;
    };
    

    this.BuscarPosIzq = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.FichaDoble() === true) { 
            Ret.RotZ = Math.PI / 2;
            Ret.PosX = FichaDesde.Ficha.position.x - 1.5;
        }
        else {
            if (this.Valores[0] === FichaDesde.ValorLibre()) Ret.RotZ = Math.PI;
            Ret.PosX = (FichaDesde.FichaDoble() === true && FichaDesde.Ficha.rotation.z !== 0) ? FichaDesde.Ficha.position.x - 1.5 : FichaDesde.Ficha.position.x - 2.0;            
        }
        return Ret;
    };

    this.BuscarPosDer = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.FichaDoble() === true) { 
            Ret.RotZ = Math.PI / 2;
            Ret.PosX = FichaDesde.Ficha.position.x + 1.5;
        }
        else {
            if (this.Valores[1] === FichaDesde.ValorLibre()) Ret.RotZ = Math.PI;
            Ret.PosX = (FichaDesde.FichaDoble() === true && FichaDesde.Ficha.rotation.z !== 0) ? FichaDesde.Ficha.position.x + 1.5 : FichaDesde.Ficha.position.x + 2.0;            
        }
        return Ret;        
    };
    
    this.BuscarPosSup = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.Valores[0] === FichaDesde.ValorLibre()) Ret.RotZ = Math.PI / 2;
        else                                             Ret.RotZ = Math.PI + (Math.PI / 2);
        if (FichaDesde.FichaDoble() === true) {
            Ret.PosX = FichaDesde.Ficha.position.x;            
            Ret.PosZ = FichaDesde.Ficha.position.z - 2.0;            
        }
        else {
            Ret.PosX = FichaDesde.Ficha.position.x + 0.5;
            Ret.PosZ = FichaDesde.Ficha.position.z - 1.5;            
        }
        return Ret;
    };
    
    this.BuscarPosSupIzq = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.FichaDoble() === true) {
            Ret.PosX = FichaDesde.Ficha.position.x;
            Ret.PosZ = FichaDesde.Ficha.position.z - 1.5;
            Ret.RotZ = 0.0;
        }
        else {
            if (this.Valores[0] === FichaDesde.ValorLibre()) Ret.RotZ = Math.PI;
            else                                             Ret.RotZ = 0;
            Ret.PosX = FichaDesde.Ficha.position.x - 0.5;
            Ret.PosZ = FichaDesde.Ficha.position.z - 1.5;
        }
        return Ret;        
    };
    
    this.BuscarPosInf  = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.Valores[0] === FichaDesde.ValorLibre()) Ret.RotZ = Math.PI + (Math.PI / 2);
        else                                             Ret.RotZ = Math.PI / 2;
        if (FichaDesde.FichaDoble() === true) {
            Ret.PosX = FichaDesde.Ficha.position.x;            
            Ret.PosZ = FichaDesde.Ficha.position.z + 2.0;            
        }
        else {
            Ret.PosX = FichaDesde.Ficha.position.x - 0.5;
            Ret.PosZ = FichaDesde.Ficha.position.z + 1.5;            
        }
        return Ret;        
    };
    
    this.BuscarPosInfDer  = function(FichaDesde) {
        var Ret = { PosX : 0, PosZ : FichaDesde.Ficha.position.z, RotZ : 0 };
        if (this.FichaDoble() === true) {
            Ret.PosX = FichaDesde.Ficha.position.x;
            Ret.PosZ = FichaDesde.Ficha.position.z + 1.5;
            Ret.RotZ = 0.0;
        }
        else {
            if (this.Valores[0] === FichaDesde.ValorLibre()) Ret.RotZ = 0;
            else                                             Ret.RotZ = Math.PI;
            Ret.PosX = FichaDesde.Ficha.position.x + 0.5;
            Ret.PosZ = FichaDesde.Ficha.position.z + 1.5;
        }
        return Ret;        
    };


};


/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 20/01/2019

        Objeto que controla el interfaz de usuario HTML del juego

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 25/02/2019
*/

var Domino_UI = function() {
    
    this.PuntuacionPorPartida = 300; // Por defecto las partidas son de 300 puntos
    
    this.Iniciar = function() {
        // Boton empezar
        document.getElementById("BotonEmpezar").onclick = function() {
            Domino.Partida.Empezar();
        };
        // Boton continuar (victoria / derrota)
        document.getElementById("BotonContinuar").onclick = function() {
            Domino.Partida.Continuar();
        };
        // Boton continuar empate
        document.getElementById("BotonContinuar2").onclick = function() {
            Domino.Partida.Continuar();
        };
        // Boton terminar la partida
        document.getElementById("BotonTerminar").onclick = function() {
            UI.OcultarGanador();
            UI.MostrarEmpezar();
        };
        // Edit del nombre del equipo 1
        document.getElementById("NEquipo1").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreEquipo("1", document.getElementById("NEquipo1").value);
        };

        // Edit del nombre del equipo 2
        document.getElementById("NEquipo2").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreEquipo("2", document.getElementById("NEquipo2").value);
        };
        
        // Edit del nombre del jugador 1
        document.getElementById("NNombre1").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreJugador("1", document.getElementById("NNombre1").value);
        };

        // Edit del nombre del jugador 2
        document.getElementById("NNombre2").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreJugador("2", document.getElementById("NNombre2").value);
        };
        
        // Edit del nombre del jugador 3
        document.getElementById("NNombre3").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreJugador("3", document.getElementById("NNombre3").value);
        };
        
        // Edit del nombre del jugador 4
        document.getElementById("NNombre4").onchange = function() {
            Domino.Partida.Opciones.AsignarNombreJugador("4", document.getElementById("NNombre4").value);
        };
        
        // Checkbox Jugar al descubierto
        document.getElementById("Opciones_Descubierto").onclick = function() {
            Domino.Partida.Opciones.AsignarDescubierto(document.getElementById("Opciones_Descubierto").checked);
        };
        
        // CheckBox animar turno en 3d
        document.getElementById("Opciones_AnimarTurno").onclick = function() {
            Domino.Partida.Opciones.AsignarAniTurno(document.getElementById("Opciones_AnimarTurno").checked);
        };
        
        // Checkbox ayuda para el jugador
        document.getElementById("Opciones_Ayuda").onclick = function() {
            Domino.Partida.Opciones.AsignarAyuda(document.getElementById("Opciones_Ayuda").checked);
        };
        
        // Botones con las puntuaciones máximas
        for (var i = 1; i < 7; i++) {
            document.getElementById("Puntos" + i * 100).onclick = function(Pos) {
                this.AsignarPuntuacionPorPartida(Pos * 100);
            }.bind(this, i);
        }
                
        this.MostrarEmpezar();
    };
    
    // Mostrar menu para empezar una partida
    this.MostrarEmpezar = function() {
        document.getElementById("MarcoEmpezar").setAttribute("visible", "true");
    };
    
    // Mostrar menu para ocultar una partida
    this.OcultarEmpezar = function() {
        document.getElementById("MarcoEmpezar").setAttribute("visible", "false");
    };
    
    // Mostrar menu para continuar una partida
    this.MostrarContinuar = function(Equipo, Puntos, P1, P2, P3, P4) {
        
        document.getElementById("PG_Puntos").innerHTML = Puntos;
        document.getElementById("MV_P1").innerHTML = P1;
        document.getElementById("MV_P2").innerHTML = P2;
        document.getElementById("MV_P3").innerHTML = P3;
        document.getElementById("MV_P4").innerHTML = P4;
        document.getElementById("MV_P13").innerHTML = P1 + P3;
        document.getElementById("MV_P24").innerHTML = P2 + P4;
        
        // Nombres de los jugadores y equipos
        document.getElementById("MV_E1").innerHTML = Domino.Partida.Opciones.NombreEquipo[0];
        document.getElementById("MV_E2").innerHTML = Domino.Partida.Opciones.NombreEquipo[1];
        document.getElementById("MVN_P1").innerHTML = Domino.Partida.Opciones.NombreJugador[0];
        document.getElementById("MVN_P2").innerHTML = Domino.Partida.Opciones.NombreJugador[1];
        document.getElementById("MVN_P3").innerHTML = Domino.Partida.Opciones.NombreJugador[2];
        document.getElementById("MVN_P4").innerHTML = Domino.Partida.Opciones.NombreJugador[3];
        
        if (Equipo === "1") {   // Gana el equipo 1
            document.getElementById("PG_Equipo").innerHTML = Domino.Partida.Opciones.NombreEquipo[0];
            document.getElementById("MV_E1").className = "Empate_Victoria";
            document.getElementById("MV_E2").className = "Empate_Derrota";
        }
        else {                          // Gana el equipo 2
            document.getElementById("PG_Equipo").innerHTML = Domino.Partida.Opciones.NombreEquipo[1];
            document.getElementById("MV_E1").className = "Empate_Derrota";
            document.getElementById("MV_E2").className = "Empate_Victoria";
        }        

        document.getElementById("MarcoContinuar").setAttribute("visible", "true");        
    };
        
    this.OcultarContinuar = function() {
        document.getElementById("MarcoContinuar").setAttribute("visible", "false");
    };
    
    // Mostrar menu para continuar una partida
    this.MostrarEmpate = function(P1, P2, P3, P4) {
        document.getElementById("ME_P1").innerHTML = P1;
        document.getElementById("ME_P2").innerHTML = P2;
        document.getElementById("ME_P3").innerHTML = P3;
        document.getElementById("ME_P4").innerHTML = P4;
        document.getElementById("ME_P13").innerHTML = P1 + P3;
        document.getElementById("ME_P24").innerHTML = P2 + P4;
        
        // Nombres de los jugadores y equipos
        document.getElementById("ME_E1").innerHTML = Domino.Partida.Opciones.NombreEquipo[0];
        document.getElementById("ME_E2").innerHTML = Domino.Partida.Opciones.NombreEquipo[1];
        document.getElementById("MEN_P1").innerHTML = Domino.Partida.Opciones.NombreJugador[0];
        document.getElementById("MEN_P2").innerHTML = Domino.Partida.Opciones.NombreJugador[1];
        document.getElementById("MEN_P3").innerHTML = Domino.Partida.Opciones.NombreJugador[2];
        document.getElementById("MEN_P4").innerHTML = Domino.Partida.Opciones.NombreJugador[3];
        
        
        var Equipo = 0;
        if (P1 + P3 === P2 + P4) {
            document.getElementById("ME_E1").className = "Empate_Derrota";
            document.getElementById("ME_E2").className = "Empate_Derrota";
        }
        else if (P1 + P3 < P2 + P4) {   // Gana el equipo 1 por sumar menos puntos
            document.getElementById("ME_E1").className = "Empate_Victoria";
            document.getElementById("ME_E2").className = "Empate_Derrota";
            Equipo = 1;
        }
        else {                          // Gana el equipo 2 por sumar menos puntos
            document.getElementById("ME_E1").className = "Empate_Derrota";
            document.getElementById("ME_E2").className = "Empate_Victoria";
            Equipo = 2;
        }
        
        if (Equipo === 0) { // Empate
            document.getElementById("TxtVictoria").style.display = "none";
            document.getElementById("TxtEmpate").style.display = "table";
        }
        else { // Victoria de un equipo
            document.getElementById("TxtVictoriaPuntos").innerHTML = P1 + P2 + P3 + P4;
            document.getElementById("TxtVictoriaEquipo").innerHTML = Domino.Partida.Opciones.NombreEquipo[Equipo - 1];  
            document.getElementById("TxtVictoria").style.display = "table";
            document.getElementById("TxtEmpate").style.display = "none";  
        }
        
        document.getElementById("MarcoEmpate").setAttribute("visible", "true");
        
    };
        
    this.OcultarEmpate = function() {
        document.getElementById("MarcoEmpate").setAttribute("visible", "false");
    };
    
    this.AsignarPuntuacionPorPartida = function(Puntos) {
        for (var i = 1; i < 7; i++) {
            document.getElementById("Puntos" + i * 100).className = "";
        }
        document.getElementById("Puntos" + Puntos).className = "PuntosMarcados";
        this.PuntuacionPorPartida = Puntos;
        Domino.Partida.Opciones.AsignarPuntosPorPartida(Puntos);
    };
    
    this.MostrarDatosMano = function() {
        document.getElementById("DatosJuego").setAttribute("Visible", "true");
        document.getElementById("NombreEquipo1").innerHTML = Domino.Partida.Opciones.NombreEquipo[0];
        document.getElementById("NombreEquipo2").innerHTML = Domino.Partida.Opciones.NombreEquipo[1];
        
        if (ObjetoNavegador.EsMovil() === false) {
            document.getElementById("Historial").setAttribute("Visible", "true");
        }
    };
    
    this.OcultarDatosMano = function() {
        document.getElementById("DatosJuego").setAttribute("Visible", "false");
        document.getElementById("Historial").setAttribute("Visible", "false");
    };
    
    this.MostrarGanador = function (Equipo, Puntos)  {
        document.getElementById("MarcoTerminado").setAttribute("visible", "true");
        document.getElementById("EquipoGanador").innerHTML = (Equipo === "1") ? Domino.Partida.Opciones.NombreEquipo[0] : Domino.Partida.Opciones.NombreEquipo[2];
        document.getElementById("PuntosGanador").innerHTML = Puntos;
    };
    
    this.OcultarGanador = function ()  {
        document.getElementById("MarcoTerminado").setAttribute("visible", "false");
    };
    
    this.MostrarVictoria = function() {
        document.getElementById("VictoriaDerrota").innerHTML = "<div id='Victoria'><img src='./SVG/Partida.svg#Ganada' /></div>";
    };
    
    this.MostrarDerrota = function() {
        document.getElementById("VictoriaDerrota").innerHTML = "<div id='Derrota'><img src='./SVG/Partida.svg#Perdida' /></div>";        
    };
    
    this.MostrarPartidaGanada = function() {
        document.getElementById("VictoriaDerrota").innerHTML = "<div id='ParitdaGanada'><img src='./SVG/PartidaGanada.svg' /></div>";
    };
    
    this.MostrarPartidaPerdida = function() {
        this.MostrarDerrota();
        //document.getElementById("VictoriaDerrota").innerHTML = "<div id='Derrota'><img src='./SVG/Partida.svg#Perdida' /></div>";
    };
            
};

var UI = new Domino_UI();

/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 16/01/2019

        Objeto que controla las variables que requieren ser guardadas en disco (nombres de equipo y jugadores, opciones varias)

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 28/02/2019
*/


var Domino_Opciones = function () {
    this.NombreJugador     = [ "Jugador 1", "Jugador 2", "Jugador 3", "Jugador 4" ];
    this.NombreEquipo      = [ "Equipo 1", "Equipo 2" ];
    this.PuntosPorPartida  = 300;
    this.Descubierto       = "false";
    this.AniTurno          = "true";
    this.Ayuda             = "true";
    this.Iniciar = function() {
        // Cargo las opciones del local storage (si existen)
        if (window.localStorage.PuntosPorPartida)   this.PuntosPorPartida = window.localStorage.getItem("PuntosPorPartida");
        if (window.localStorage.Descubierto)        this.Descubierto      = window.localStorage.getItem("Descubierto");
        if (window.localStorage.AniTurno)           this.AniTurno         = window.localStorage.getItem("AniTurno");
        if (window.localStorage.Ayuda)              this.Ayuda            = window.localStorage.getItem("Ayuda");
        if (window.localStorage.Jugador1)           this.NombreJugador[0] = window.localStorage.getItem("Jugador1");
        if (window.localStorage.Jugador2)           this.NombreJugador[1] = window.localStorage.getItem("Jugador2");
        if (window.localStorage.Jugador3)           this.NombreJugador[2] = window.localStorage.getItem("Jugador3");
        if (window.localStorage.Jugador4)           this.NombreJugador[3] = window.localStorage.getItem("Jugador4");
        if (window.localStorage.Equipo1)            this.NombreEquipo[0]  = window.localStorage.getItem("Equipo1");
        if (window.localStorage.Equipo2)            this.NombreEquipo[1]  = window.localStorage.getItem("Equipo2");

        // Asigno las opciones al UI
        document.getElementById("Puntos" + this.PuntosPorPartida).className = "PuntosMarcados";
        document.getElementById("Opciones_Descubierto").checked = (this.Descubierto === "true") ? true : false;
        document.getElementById("Opciones_AnimarTurno").checked = (this.AniTurno === "true")    ? true : false;
        document.getElementById("Opciones_Ayuda").checked       = (this.Ayuda === "true")       ? true : false;
        
/*        document.getElementById("Opciones_Descubierto").setAttribute("checked", (this.Descubierto === "false") ? "" : "checked");
        document.getElementById("Opciones_AnimarTurno").setAttribute("checked", (this.AniTurno === "false") ? "" : "checked");
        document.getElementById("Opciones_Ayuda").setAttribute("checked", (this.Ayuda === "false") ? "" : "checked");*/
        // Asigno los nombres de los jugadopres en el UI
        document.getElementById("NNombre1").value = this.NombreJugador[0];
        document.getElementById("NNombre2").value = this.NombreJugador[1];
        document.getElementById("NNombre3").value = this.NombreJugador[2];
        document.getElementById("NNombre4").value = this.NombreJugador[3];
        // Asigno los nombres de los equipos en el UI
        document.getElementById("NEquipo1").value = this.NombreEquipo[0];
        document.getElementById("NEquipo2").value = this.NombreEquipo[1];
    };
    
    this.AsignarPuntosPorPartida = function(Puntos) {
        window.localStorage.setItem("PuntosPorPartida", Puntos);
        this.PuntosPorPartida = Puntos;
    };
    
    this.AsignarNombreJugador = function(Jugador, Nombre) {
        if (Nombre === "") Nombre = "Jugador " + Jugador;
        window.localStorage.setItem("Jugador" + Jugador, Nombre);
        this.NombreJugador[Jugador - 1] = Nombre;
    };
    
    this.AsignarNombreEquipo = function(Equipo, Nombre) {
        if (Nombre === "") Nombre = "Equipo " + Equipo;
        window.localStorage.setItem("Equipo" + Equipo, Nombre);
        this.NombreEquipo[Equipo - 1] = Nombre;
    };
    
    this.AsignarDescubierto = function(Descubierto) {
        window.localStorage.setItem("Descubierto", Descubierto);
        if (Descubierto === false)      this.Descubierto = "false";
        else if (Descubierto === true)  this.Descubierto = "true";
        else                            this.Descubierto = Descubierto;
    };
    
    this.AsignarAniTurno = function(AniTurno) {
        window.localStorage.setItem("AniTurno", AniTurno);
        if (AniTurno === false)      this.AniTurno = "false";
        else if (AniTurno === true)  this.AniTurno = "true";
        else                         this.AniTurno = AniTurno;
    };
    
    this.AsignarAyuda = function(Ayuda) {
        window.localStorage.setItem("Ayuda", Ayuda);
        if (Ayuda === false)      this.Ayuda = "false";
        else if (Ayuda === true)  this.Ayuda = "true";
        else                      this.Ayuda = Ayuda;
    };
    
};

//Opciones = new Domino_Opciones;

/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 19/01/2019

        Objeto para la partida en curso

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 28/02/2019
*/

var Domino_Partida = function() {    
    
//    this.Jugador          = [];     // TODO por eliminar
    this.JugadorActual    = 0;    // Jugador del turno actual
    this.TurnoActual      = 0; 
    this.Mano             = 0;
    this.FichaIzquierda   = { };
    this.FichaDerecha     = { };
    
    this.Pasado           = 0;
    this.Ficha            = [];
    this.TiempoTurno      = 1250;
    this.TimerMsg         = [ 0, 0, 0, 0 ];
    this.ManoTerminada    = false;
    this.PuntosEquipo1    = 0; // 
    this.PuntosEquipo2    = 0;
    
    this.Opciones         = new Domino_Opciones;
    //this.Domino           = nDomino;
    
    this.CrearFichas = function() {
        if (this.Ficha.length !== 0) {
            for (var i = 0; i< 28; i++) {
                Domino.Escena.remove(this.Ficha[i].Ficha);
            }
        }
        this.Ficha = [];
        // Creo las fichas ordenadas
        var Pos = [ -4.5, -5.0 ];
        for (var i = 0; i< 28; i++) {
            this.Ficha[i] = new Domino_Ficha();
            this.Ficha[i].Crear(i);
            Domino.Escena.add(this.Ficha[i].Ficha);
            this.Ficha[i].Ficha.position.set(Pos[0], 0.0, Pos[1]);
            this.Ficha[i].RotarV();
            Pos[0] += 1.5;
            if (Pos[0] > 5.0) {
                Pos[0] = -4.5;
                Pos[1] += 2.5;
            }            
        }        
    };    
    
    // Función que devuelve el jugador que empieza la mano
    this.JugadorInicio = function() {
        // Miro que jugador empieza
        for (this.JugadorActual = 0; this.JugadorActual < 4; this.JugadorActual++) {
            for (j = 0; j < 7; j++) {
                if (this.Ficha[(this.JugadorActual * 7) + j].Valores[0] === 6 && this.Ficha[(this.JugadorActual * 7) + j].Valores[1] === 6) {
                    return this.JugadorActual;
                }
            }
        }        
    };
    
    this.Empezar = function() {        
        this.Mano = 0;
        this.PuntosEquipo1 = 0;
        this.PuntosEquipo2 = 0;
        this.Opciones.PuntosPorPartida = UI.PuntuacionPorPartida;
        this.Continuar();
    };
    
    this.Continuar = function() {
        
        // Oculto el menu para empezar la partida
        UI.OcultarEmpezar();   
        // Oculto el menu para continuar la siguiente mano (desde una victoria)
        UI.OcultarContinuar();           
        // Oculto el menu para continuar la siguiente mano (desde un empate)
        UI.OcultarEmpate();   
        
        // Se ha terminado la partida
        if (this.PuntosEquipo1 >= this.Opciones.PuntosPorPartida || this.PuntosEquipo2 >= this.Opciones.PuntosPorPartida) {
            var Equipo = (this.PuntosEquipo1 >= this.PuntosEquipo2) ? "1" : "2";
            UI.MostrarGanador(Equipo, (this.PuntosEquipo1 >= this.PuntosEquipo2) ? this.PuntosEquipo1 : this.PuntosEquipo2 );
            if (Equipo === "1") UI.MostrarPartidaGanada();
            else                UI.MostrarPartidaPerdida();
            return;
        }
        
        // Muestro el menu con los datos de la mano actual
        UI.MostrarDatosMano();
        
        this.Mano ++;
        this.ManoTerminada = false;
        
        // Borro el historial de fichas
        document.getElementById("Historial").innerHTML = "";
        
        // Vuelvo a crear las fichas
        this.CrearFichas();
        
//        this.Jugador = [];
        this.Pasado = 0;
        
        // Mezclo el array de las fichas
        var j, x, i;
        for (i = this.Ficha.length - 1; i > 0; i--) {
            this.Ficha[i].Colocada = false;
            j = Math.floor(Math.random() * (i + 1));
            x = this.Ficha[i];
            this.Ficha[i] = this.Ficha[j];
            this.Ficha[j] = x;            
        }
        
        // Reparto las fichas
/*        for (i = 0; i < 4; i ++) {
            this.Jugador[i] = [];
            for (j = 0; j < 7; j++) {
                this.Jugador[i][j] = (i *7) + j;
                this.Ficha[this.Jugador[i][j]].Colocada = false;
            }
        }*/
        
        // Coloco las fichas del jugador 1 y 3
        for (i = 0; i < 7; i++) {
            this.Ficha[i].RotarV();
            this.Ficha[i].Ficha.position.set(-3.8 + (1.25 * i), 0, 5.5);
            this.Ficha[14 + i].RotarV();
            if (this.Opciones.Descubierto === "false") this.Ficha[14 + i].RotarBocaAbajo();
            this.Ficha[14 + i].Ficha.position.set(-3.8 + (1.25 * i), 0, -12);
        }
        
        // Coloco las fichas del jugador 2 y 4
        for (i = 0; i < 7; i++) {
            this.Ficha[7 + i].RotarH();
            if (this.Opciones.Descubierto === "false") this.Ficha[7 + i].RotarBocaAbajo();
            this.Ficha[7 + i].Ficha.position.set(15, 0, -6.5 + (1.25 * i));
            this.Ficha[21 + i].RotarH();
            if (this.Opciones.Descubierto === "false") this.Ficha[21 + i].RotarBocaAbajo();
            this.Ficha[21 + i].Ficha.position.set(-15, 0, -6.5 + (1.25 * i));
        }
        
        // Miro que jugador empieza
        this.JugadorInicio();
        
        this.MostrarMensaje(this.JugadorActual, "<span>" + this.Opciones.NombreJugador[this.JugadorActual] + " empieza.</span>");
        
        this.TurnoActual = 0;        
        window.ContadorDerecha      = 0;
        window.ContadorIzquierda    = 0;
        window.FinContadorIzquierda = 5;
        window.FinContadorDerecha   = 5;
        
        this.Turno();        
    };
    
    
    // Función que ejecuta un turno
    this.Turno = function() {
        if (this.ManoTerminada === true) return;

        console.log("Turno : " + this.TurnoActual);
        
        document.getElementById("Mano").innerHTML    = this.Mano;
        document.getElementById("Turno").innerHTML   = this.TurnoActual;
        document.getElementById("Jugador").innerHTML = (this.JugadorActual + 1);
        document.getElementById("Equipo1").innerHTML = this.PuntosEquipo1;
        document.getElementById("Equipo2").innerHTML = this.PuntosEquipo2;

        // Animar la camara y la luz en cada turno
        if (this.Opciones.AniTurno === "true") {
            Domino.AnimarLuz(this.JugadorActual);
        }
        
        // En el primer turno se saca el doble 6
        if (this.TurnoActual === 0) {
            console.log(this.Opciones.NombreJugador[this.JugadorActual] + " empieza");
            for (var i = 0; i < 7; i ++) {
                if (this.Ficha[(this.JugadorActual * 7) + i].Valores[0] === 6 && this.Ficha[(this.JugadorActual * 7) + i].Valores[1] === 6) {
                    this.Ficha[(this.JugadorActual * 7) + i].Colocar(false);
                    setTimeout(function() { this.Turno(); }.bind(this), this.TiempoTurno);                    
//                    this.MostrarMensaje(this.JugadorActual, "Jugador" + (this.JugadorActual + 1) + " tira : " + this.Ficha[(this.JugadorActual * 7) + i].Valores[1] + " | " + this.Ficha[(this.JugadorActual * 7) + i].Valores[0]);
                    this.MostrarMensaje(this.JugadorActual, "<span>" + this.Opciones.NombreJugador[this.JugadorActual] + " tira : </span><img src='./SVG/Domino.svg#Ficha_6-6' />");                    
                }
            }
            
        }
        else {            
            console.log("Izq: " + this.FichaIzquierda.ValorLibre() + " Der: " + this.FichaDerecha.ValorLibre());            
            // Cuento las posibilidades para la izquierda y la derecha
            var Posibilidades = [];
            for (var i = 0; i < 7; i++) {
                if (this.Ficha[(this.JugadorActual * 7) + i].Colocada === false) {
                    if (this.Ficha[(this.JugadorActual * 7) + i].Valores[0] === this.FichaIzquierda.ValorLibre() || this.Ficha[(this.JugadorActual * 7) + i].Valores[1] === this.FichaIzquierda.ValorLibre()) {
                        Posibilidades.push({ Pos : (this.JugadorActual * 7) + i, Rama : "izquierda" });
                    }
                    if (this.Ficha[(this.JugadorActual * 7) + i].Valores[0] === this.FichaDerecha.ValorLibre() || this.Ficha[(this.JugadorActual * 7) + i].Valores[1] === this.FichaDerecha.ValorLibre()) {
                        Posibilidades.push({ Pos : (this.JugadorActual * 7) + i, Rama : "derecha" });                        
                    }
                }
            }
            // Ordeno las posibilidades y dejo arriba las que tienen mas valor (Que son las que se tiene que sacar de encima antes)
            Posibilidades.sort(function(a, b){                
                return (this.Ficha[a.Pos].Valores[0] + this.Ficha[a.Pos].Valores[1] > this.Ficha[b.Pos].Valores[0] + this.Ficha[b.Pos].Valores[1]) ? a : b;
            }.bind(this));
            
            // Si tiene posibilidades
            if (Posibilidades.length > 0)  {
                this.Pasado = 0;

                // Turno de la máquina
                if (this.JugadorActual !== 0) {
                    // IA 1.0
                    var Rnd = 0;//RandInt(this.Posibilidades.length -1, 0);
                    if (Posibilidades[0].Rama === "izquierda") { 
                        this.Ficha[Posibilidades[0].Pos].Colocar(this.FichaIzquierda);
                    }
                    else {
                        this.Ficha[Posibilidades[0].Pos].Colocar(this.FichaDerecha);
                    }                    
                    this.MostrarMensaje(this.JugadorActual, "<span>" +  this.Opciones.NombreJugador[this.JugadorActual] + " tira : </span><img src='./SVG/Domino.svg#Ficha_" + this.Ficha[Posibilidades[0].Pos].Valores[1] + "-" + this.Ficha[Posibilidades[0].Pos].Valores[0] +"' />");
                    console.log("Jugador" + (this.JugadorActual + 1) + " tira : " + this.Ficha[Posibilidades[0].Pos].Valores[1] + " | " + this.Ficha[Posibilidades[0].Pos].Valores[0]);
                    setTimeout(function() { this.Turno(); }.bind(this), this.TiempoTurno);
                }
                // Turno del jugador
                else {
                    this.MostrarMensaje(this.JugadorActual, "<span>Tu turno " + this.Opciones.NombreJugador[0] + "</span>");
                    this.MostrarAyuda();
                    return;
                }
            }
            // No hay posibilidades, paso
            else {
                console.log("Jugador" + (this.JugadorActual + 1) + " pasa");
                this.MostrarMensaje(this.JugadorActual, "<span>" + this.Opciones.NombreJugador[this.JugadorActual] +  " Pasa...</span>", "rojo");
                this.Pasado++;
                this.TurnoActual ++;
                this.JugadorActual ++;
                if (this.JugadorActual > 3) {
                    this.JugadorActual = 0;
                }
                
            }
        }
        
        // Compruebo si se ha terminado la mano
        if (this.ComprobarManoTerminada() === true) return;
        
        // Se ha pasado, 
        if (this.Pasado > 0) {
            setTimeout(function() { this.Turno(); }.bind(this), this.TiempoTurno);
        }        
    };
    
    // Resalta las fichas que se pueden tirar en este turno
    this.MostrarAyuda = function () {
        if (this.Opciones.Ayuda === "false") return;
        var Ayuda = [];
        // Determino las posibilidades y las guardo en el array Ayuda
        for (var i = 0; i < 7; i++) {
            if (this.Ficha[i].Colocada === false) {
                if ((this.Ficha[i].Valores[0] === this.FichaIzquierda.ValorLibre() || this.Ficha[i].Valores[1] === this.FichaIzquierda.ValorLibre()) ||
                    (this.Ficha[i].Valores[0] === this.FichaDerecha.ValorLibre()   || this.Ficha[i].Valores[1] === this.FichaDerecha.ValorLibre())) {
                    Ayuda.push(i);
                }
            }
        }
        var Pos = [ 5.5, 5.5, 5.5, 5.5, 5.5, 5.5, 5.5 ];
        for (var i = 0; i < Ayuda.length; i++) {
            if (this.Ficha[Ayuda[i]].Valores[0] == this.Ficha[Ayuda[i]].Valores[1])     Pos[Ayuda[i]] = 4.75;
            else                                                                        Pos[Ayuda[i]] = 5.0;
        }        
        
        if (typeof(this.AniAyuda) !== "undefined") {
            this.AniAyuda.Terminar();
        }
        this.AniAyuda = Animaciones.CrearAnimacion([
                { Paso : { P0 : this.Ficha[0].Ficha.position.z, P1 : this.Ficha[1].Ficha.position.z, P2 : this.Ficha[2].Ficha.position.z, P3 : this.Ficha[3].Ficha.position.z, P4 : this.Ficha[4].Ficha.position.z, P5 : this.Ficha[5].Ficha.position.z, P6 : this.Ficha[6].Ficha.position.z  } },
                { Paso : { P0 : Pos[0], P1 : Pos[1], P2 : Pos[2], P3 : Pos[3], P4 : Pos[4], P5 : Pos[5], P6 : Pos[6]  }, Tiempo : 400, FuncionTiempo : FuncionesTiempo.SinInOut }
            ], {
            FuncionActualizar : function(Valores) { 
                if (this.Ficha[0].Colocada === false) this.Ficha[0].Ficha.position.set(this.Ficha[0].Ficha.position.x, this.Ficha[0].Ficha.position.y, Valores.P0);
                if (this.Ficha[1].Colocada === false) this.Ficha[1].Ficha.position.set(this.Ficha[1].Ficha.position.x, this.Ficha[1].Ficha.position.y, Valores.P1);
                if (this.Ficha[2].Colocada === false) this.Ficha[2].Ficha.position.set(this.Ficha[2].Ficha.position.x, this.Ficha[2].Ficha.position.y, Valores.P2);
                if (this.Ficha[3].Colocada === false) this.Ficha[3].Ficha.position.set(this.Ficha[3].Ficha.position.x, this.Ficha[3].Ficha.position.y, Valores.P3);
                if (this.Ficha[4].Colocada === false) this.Ficha[4].Ficha.position.set(this.Ficha[4].Ficha.position.x, this.Ficha[4].Ficha.position.y, Valores.P4);
                if (this.Ficha[5].Colocada === false) this.Ficha[5].Ficha.position.set(this.Ficha[5].Ficha.position.x, this.Ficha[5].Ficha.position.y, Valores.P5);
                if (this.Ficha[6].Colocada === false) this.Ficha[6].Ficha.position.set(this.Ficha[6].Ficha.position.x, this.Ficha[6].Ficha.position.y, Valores.P6);
            }.bind(this)            
        });            
        this.AniAyuda.Iniciar();
    };
    
    this.OcultarAyuda = function() {
        if (this.Opciones.Ayuda === "false") return;
        if (typeof(this.AniAyuda) !== "undefined") {
            this.AniAyuda.Terminar();
        }
        this.AniAyuda = Animaciones.CrearAnimacion([
                { Paso : { P0 : this.Ficha[0].Ficha.position.z, P1 : this.Ficha[1].Ficha.position.z, P2 : this.Ficha[2].Ficha.position.z, P3 : this.Ficha[3].Ficha.position.z, P4 : this.Ficha[4].Ficha.position.z, P5 : this.Ficha[5].Ficha.position.z, P6 : this.Ficha[6].Ficha.position.z  } },
                { Paso : { P0 : 5.5, P1 : 5.5, P2 : 5.5, P3 : 5.5, P4 : 5.5, P5 : 5.5, P6 : 5.5  }, Tiempo : 400, FuncionTiempo : FuncionesTiempo.SinInOut }
            ], {
            FuncionActualizar : function(Valores) { 
                if (this.Ficha[0].Colocada === false) this.Ficha[0].Ficha.position.set(this.Ficha[0].Ficha.position.x, this.Ficha[0].Ficha.position.y, Valores.P0);
                if (this.Ficha[1].Colocada === false) this.Ficha[1].Ficha.position.set(this.Ficha[1].Ficha.position.x, this.Ficha[1].Ficha.position.y, Valores.P1);
                if (this.Ficha[2].Colocada === false) this.Ficha[2].Ficha.position.set(this.Ficha[2].Ficha.position.x, this.Ficha[2].Ficha.position.y, Valores.P2);
                if (this.Ficha[3].Colocada === false) this.Ficha[3].Ficha.position.set(this.Ficha[3].Ficha.position.x, this.Ficha[3].Ficha.position.y, Valores.P3);
                if (this.Ficha[4].Colocada === false) this.Ficha[4].Ficha.position.set(this.Ficha[4].Ficha.position.x, this.Ficha[4].Ficha.position.y, Valores.P4);
                if (this.Ficha[5].Colocada === false) this.Ficha[5].Ficha.position.set(this.Ficha[5].Ficha.position.x, this.Ficha[5].Ficha.position.y, Valores.P5);
                if (this.Ficha[6].Colocada === false) this.Ficha[6].Ficha.position.set(this.Ficha[6].Ficha.position.x, this.Ficha[6].Ficha.position.y, Valores.P6);
            }.bind(this)            
        });            
        this.AniAyuda.Iniciar();
        
    };
    
    this.ComprobarManoTerminada = function() {
        if (this.ManoTerminada === true) return true;
        // Compruebo que el jugador actual no tenga 0 fichas
        var Colocadas = 0, Equipo = "1";
        for (i = 0; i < 7; i++) {
            if (this.Ficha[(this.JugadorActual * 7) + i].Colocada === true) Colocadas ++;
        }
        
        if (Colocadas === 7) {
            var P1 = this.ContarPuntos(0), P2 = this.ContarPuntos(1), P3 = this.ContarPuntos(2), P4 = this.ContarPuntos(3);
            this.MostrarMensaje(this.JugadorActual, "<span>" + this.Opciones.NombreJugador[this.JugadorActual] + " gana la mano!</span>", "verde");
            this.ManoTerminada = true;            
            // Cuento los puntos y muestro los valores
            var Puntos = 0;
            for (i = 0; i < 4; i++) {
                Puntos += this.ContarPuntos(i);
            }
            Equipo = (this.JugadorActual === 0 || this.JugadorActual === 2) ? "1" : "2";
            if (Equipo === "1") {
                this.PuntosEquipo1 += Puntos;
                UI.MostrarVictoria();
            }
            else {
                this.PuntosEquipo2 += Puntos;
                UI.MostrarDerrota();
            }
            document.getElementById("Equipo1").innerHTML = this.PuntosEquipo1;
            document.getElementById("Equipo2").innerHTML = this.PuntosEquipo2;
            
//            if (this.PuntosEquipo1 >= this.Opciones.PuntosPorPartida || this.PuntosEquipo2 >= this.Opciones.PuntosPorPartida) UI.MostrarGanador(Equipo, (Equipo === "1") ? this.PuntosEquipo1 : this.PuntosEquipo2);
            UI.MostrarContinuar(Equipo, Puntos, P1, P2, P3, P4);                        
        }
        // Todos los jugadores han pasado
        if (this.Pasado === 4) {
            var J = (this.JugadorActual + 1) + 1;
            if (J > 4) J = 1;
//            this.MostrarMensaje(this.JugadorActual, "Jugador" + J +  " ha bloqueado la mano!", "verde");
            this.ManoTerminada = true;                        
            // http://www.ludoteka.com/domino.html
            // Por cierre o tranca:     cuando ninguno de los 4 jugadores puede seguir colocando ninguna de sus fichas. 
            //                          En este caso se suman los puntos de las fichas que no han sido jugadas por ambos jugadores de cada pareja, 
            //                          ganando aquella que totalice una suma menor. En caso de empate, la mano no cuenta a efectos de puntuación.
            var P1 = this.ContarPuntos(0), P2 = this.ContarPuntos(1), P3 = this.ContarPuntos(2), P4 = this.ContarPuntos(3);
            if ((P1 + P3) === (P2 + P4)) { // EMPATE (no se contabiliza nada)
                UI.MostrarEmpate(P1, P2, P3, P4);
            }
            else {
                if ((P1 + P3) < (P2 + P4)) { // Gana el equipo 1
                    this.PuntosEquipo1 += (P1 + P2 + P3 + P4);
                    Equipo = "1";
                    UI.MostrarVictoria();
                }
                else if ((P1 + P3) > (P2 + P4)) { // Gana el equipo 2
                    this.PuntosEquipo2 += (P1 + P2 + P3 + P4);
                    Equipo = "2";
                    UI.MostrarDerrota();
                }
                UI.MostrarEmpate(P1, P2, P3, P4);
                
            }

            document.getElementById("Equipo1").innerHTML = this.PuntosEquipo1;
            document.getElementById("Equipo2").innerHTML = this.PuntosEquipo2;
            
        }        

        if (this.ManoTerminada === true) {
            for (var i = 0; i < this.Ficha.length; i++) {
                this.Ficha[i].RotarBocaArriba();
            }
/*            if (this.PuntosEquipo1 >= this.Opciones.PuntosPorPartida || this.PuntosEquipo2 >= this.Opciones.PuntosPorPartida) { // Se ha terminado la partida
                // Oculto el menu para continuar la siguiente mano (desde una victoria)
                UI.OcultarContinuar();           
                // Oculto el menu para continuar la siguiente mano (desde un empate)
                UI.OcultarEmpate();                   
                
                UI.MostrarGanador((this.PuntosEquipo1 >= this.PuntosEquipo2) ? "1" : "2", (this.PuntosEquipo1 >= this.PuntosEquipo2) ? this.PuntosEquipo1 : this.PuntosEquipo2 );
            }*/
            return true;
        }
        
        return false;
    };
    
    this.ContarPuntos = function(Jugador) {
        var Total = 0;
        for (var i = 0; i < 7; i++) {
            if (this.Ficha[(Jugador * 7) + i].Colocada === false) {
                Total += (this.Ficha[(Jugador * 7) + i].Valores[0] + this.Ficha[(Jugador * 7) + i].Valores[1]);
            }
        }
        return Total;
    };
    
    // Función para mostrar un mensaje especifico para un jugador
    this.MostrarMensaje = function(Jugador, Texto, ColFondo) {
        var ColorFondo = (typeof(ColFondo) === "undefined") ? "negro" : ColFondo;
        var Msg = document.getElementById("Msg" + (Jugador + 1));
        Msg.setAttribute("MsgVisible", "true");        
        Msg.setAttribute("ColorFondo", ColorFondo);
        if (this.TimerMsg[Jugador] !== 0) clearTimeout(this.TimerMsg);
        this.TimerMsg[Jugador] = setTimeout(function(J) { document.getElementById("Msg" + (J + 1)).setAttribute("MsgVisible", "false"); this.TimerMsg[J] = 0; }.bind(this, Jugador), this.TiempoTurno * 2);
        Msg.innerHTML = Texto;               
        
        
        var Historial = document.getElementById("Historial");
        Historial.innerHTML = Historial.innerHTML + "<div class='Historial_" + ColorFondo + "'>" + Texto + "</div>";
        Historial.scrollTo(0, Historial.scrollHeight);
    };
    
    // Coloca la ficha presionada por el jugador (si es posible)
    this.JugadorColocar = function() {
//        var Rama = "izquierda";
        if (this.JugadorActual === 0) {
            
            // Miro que no se este colocando una ficha
            for (var f = 0; f < this.Ficha.length; f++) {
                if (typeof(this.Ficha[f].AniColocar) !== "undefined") {
                    if (this.Ficha[f].AniColocar.Terminado() === false)
                        return;
                }
            }
            
            for (var i = 0; i < 7; i++) {
                // Es muy importante saber si la ficha está hover o no
                if (this.Ficha[i].Hover > 0 && this.Ficha[i].Colocada === false) {
                    // Si la ficha se puede colocar en las dos ramas
                    var nPos = -1;
                    if ((this.Ficha[i].Valores[0] === this.FichaIzquierda.ValorLibre() || this.Ficha[i].Valores[1] === this.FichaIzquierda.ValorLibre()) && 
                        (this.Ficha[i].Valores[0] === this.FichaDerecha.ValorLibre()   || this.Ficha[i].Valores[1] === this.FichaDerecha.ValorLibre()) && 
                        (this.FichaIzquierda.ValorLibre() !== this.FichaDerecha.ValorLibre())) {
                        
                        if (this.Ficha[i].Hover === 1) {
                            if (this.Ficha[i].Valores[0] === this.FichaIzquierda.ValorLibre()) nPos = this.FichaIzquierda;  
                            else                                                               nPos = this.FichaDerecha;    
                        }
                        else if (this.Ficha[i].Hover === 2) {
                            if (this.Ficha[i].Valores[1] === this.FichaIzquierda.ValorLibre()) nPos = this.FichaIzquierda;  
                            else                                                               nPos = this.FichaDerecha;    
                        }
                    }
                    else { // la ficha solo se puede colocar en una rama
                        if (this.Ficha[i].Valores[0] === this.FichaIzquierda.ValorLibre() || this.Ficha[i].Valores[1] === this.FichaIzquierda.ValorLibre()) {
                            nPos = this.FichaIzquierda;
                        }
                        if (this.Ficha[i].Valores[0] === this.FichaDerecha.ValorLibre() || this.Ficha[i].Valores[1] === this.FichaDerecha.ValorLibre()) {
                            nPos = this.FichaDerecha;
                        }
                    }
                    
                    if (nPos !== -1) {
                        console.log ("Jugador1 tira " + this.Ficha[i].Valores[0] + " | " + this.Ficha[i].Valores[1]);
                        this.Ficha[i].Colocar(nPos, true);
                        this.MostrarMensaje(this.JugadorActual, "<span>" + this.Opciones.NombreJugador[this.JugadorActual] + " tira : </span><img src='./SVG/Domino.svg#Ficha_" + this.Ficha[i].Valores[1] + "-" + this.Ficha[i].Valores[0] +"' />");
                        
                        // Compruebo si se ha terminado la mano
                        if (this.ComprobarManoTerminada() === true) return;
                        
                        this.OcultarAyuda();
                        setTimeout(function() { this.Turno(); }.bind(this), this.TiempoTurno);
                    }
                    
                }
            }
        }        
    };
    
};



/* 
    Domino ThreeJS creado por Josep Antoni Bover Comas el 16/01/2019

        MAIN para el javascript

        Vista por defecto en el Laboratorio de pruebas  
		devildrey33_Lab->Opciones->Vista = Filas;

        Ultima modificación el 28/02/2019
*/

/* 
    TODO :
        - Renovat el ObjetoCanvas, ara s'ha de crear abans del event load, i ell mateix ja es carrega en el load.
        
        - Puc posar ficha al acabar la má )no estic segur si es nomes en el meu torn o sempre... xd) no influeix en la puntuació del equip (per que es calcula abans) pero es un bug curiós
        - Ara veig que he DES-ajustat la llum, i al mostrar 2 posibilitats en una fitxa es segueix veient la ficha practivament blanca... (hauria de ser groga)
            - Deu tenir que veure amb l'ajustament que li he fet per portrait / landscape / desktop

        - Nivell de dificultat (facil rand / normal)
            - Afegir predilecció per tirar una doble si es posible abans de tirar la que major puntuació tingui?
                - Jo crec que es 99% factible a no ser que em pensi una IA que pugui tancar partides si ho veu posible i necesari.... (maça curru igual per una 2.0)
        V Les finestres de victoria i derrota no posen els noms dels equips i dels jugadors guardats en el localstorage...
        - Idiomes (Catalá, Castellano, English)
            - El tema de les traduccions el veig complicat (sobretot pels spans que han de mostrar el nom del equip en mig d'una frase)
            - Lo millor seria crear un HTML per cada idioma??
        V Revisar tema movil, sobretot el touch, i veure que tots els menus no sobresurten de la pantalla
            V Touch revisat, ara sembla que funciona simulant desde el chrome.
        V Tinc 2 puntuacions per partida... en el UI i en Partida.Opciones.... i hi ha lio (si el poso a 100 i recarrego la pagina, mostra el 100, pero realment conta fins a 300)
        V Entre el moment que hi ha l'animació al colocar la ficha es pot posar una ficha com si no s'haques colocat la que s'esta animant
        V Hi ha algo raro amb les opcions, per exemple activa el AniTurno quan está desactivat (aquest cop no funcionará, pero si fas un refresh a la pagina, funciona...)
        - Com no he aconseguit limitar la vista a landscape, he habilitat el modo portrait amb les seves mides... falta ajustar la càmara 3d de l'escena
            - Una solució podria ser girar tot 45º de forma que es vegi tot, i tiris desde l'esquerra (pilotaço al canto amb els msgs de la UI) però m'agrada la idea.
        - Implementar espai / intro per continuar / acabar / començar (dels menús)
        - Fer animació per sumar els punts de l'equip un cop acabada la ma


        0.999
            - Netejar / pulir / ampliar comentaris
        
*/

// Constructor
var DominoThree = function() {
    // Llamo al constructor del ObjetoBanner
    if (ObjetoCanvas.call(this, { 
        'Tipo'                      : 'THREE',
        'Ancho'                     : 'Auto',
        'Alto'                      : 'Auto',
        'Entorno'                   : 'Normal',
        'MostrarFPS'                : false,
        'BotonesPosicion'           : "derecha",         // Puede ser 'derecha' o 'izquierda'
        'BotonPantallaCompleta'     : true,        
        'BotonLogo'                 : true,
        'BotonExtraHTML'            : "",                // Contenido extra para los botones del lateral inferior izquierdo (solo se usa en el ejemplo sinusoidal y cyberparasit)
        'ElementoRaiz'              : "",                // ID de la etiqueta que se usara como raíz para todo el HTML del objeto canvas. Si no se especifica ninguna, se usara el body.
        'Pausar'                    : false,             // Pausa el canvas si la pestaña no tiene el foco del teclado
        'ColorFondo'                : 0xFFFFFF,
        'CapturaEjemplo'            : "Domino.png",      // Captura de pantalla para el ejemplo a "NuevoCanvas2D.png" se le añadirá "https://devildrey33.github.io/Graficos/250x200_"
        'ForzarLandscape'           : false              // Fuerza al dispositivo movil para que se muestre solo apaisado
    }) === false) { return false; }
    
    // VERSIÓN DEL JUEGO A MANO
    this.VersionDomino = "0.99.3b";
    
    // Se ha creado el canvas, inicio los valores de la animación ... 
//    this.Iniciar();    
    
    // Esconde la ventana que informa al usuario de que se está cargando la animación. (REQUERIDO)
//    this.Cargando(false);
};

DominoThree.prototype = Object.assign( Object.create(ObjetoCanvas.prototype) , {
    constructor     : DominoThree, 
    // Función que se llama al redimensionar el documento
    Redimensionar   : function() {  
        if (typeof(this.Camara) === "undefined") return;
        if (window.screen.availHeight > window.screen.availWidth) { // portrait
            this.Camara.Rotacion.Distancia = 18;
        }
        else { // landscape (por defecto)
            this.Camara.Rotacion.Distancia = 10;
            
        }
        this.Camara.position.set(0, 10, this.Camara.Rotacion.Distancia);
        this.Camara.lookAt(this.Camara.Rotacion.MirarHacia);
    },
    // Función que se llama al hacer scroll en el documento    
    Scroll          : function() {    },
    // Función que se llama al mover el mouse por el canvas
    MouseMove       : function(Evento) { 
        this.MouseMovido = true;
        this.PosMouse.x = ( Evento.clientX / window.innerWidth ) * 2 - 1;
	this.PosMouse.y = - ( Evento.clientY / window.innerHeight ) * 2 + 1;
        this.ComprobarMouse();
    },
    // Función que se llama al presionar un botón del mouse por el canvas
    MousePresionado : function(Evento) { },
    // Función que se llama al soltar un botón del mouse por el canvas
    MouseSoltado    : function(Evento) { 
        this.Partida.JugadorColocar();
    },
    // Función que se llama al entrar con el mouse en el canvas
    MouseEnter      : function(Evento) { },
    // Función que se llama al salir con el mouse del canvas
    MouseLeave      : function(Evento) { },
    // Función que se llama al presionar la pantalla
    TouchStart      : function(Evento) { 
        this.MouseMovido = true;
        this.PosMouse.x =   ( Evento.touches[0].clientX / window.innerWidth ) * 2 - 1;
	this.PosMouse.y = - ( Evento.touches[0].clientY / window.innerHeight ) * 2 + 1;        
//        this.Partida.JugadorColocar();
//        this.ComprobarMouse();
    },
    
    // Función que se llama al mover la presión sobre la pantalla
    TouchMove      : function(Evento) { 
        this.MouseMovido = true;
        this.PosMouse.x =   ( Evento.touches[0].clientX / window.innerWidth ) * 2 - 1;
	this.PosMouse.y = - ( Evento.touches[0].clientY / window.innerHeight ) * 2 + 1;        
//        this.ComprobarMouse();
    },    
    
    TouchEnd      : function(Evento) { 
/*        this.MouseMovido = true;
        this.PosMouse.x =   ( Evento.touches[0].clientX / window.innerWidth ) * 2 - 1;
	this.PosMouse.y = - ( Evento.touches[0].clientY / window.innerHeight ) * 2 + 1;        */
        this.Partida.JugadorColocar();
//        this.ComprobarMouse();
    },    
    // Función que se llama al presionar una tecla
    TeclaPresionada : function(Evento) { },
    // Función que se llama al soltar una tecla
    TeclaSoltada    : function(Evento) { },
    // Función que se llama al pausar el banner
    Pausa           : function() { },
    // Función que se llama al reanudar el banner
    Reanudar        : function() { },
//    Texturas        : new Domino_Texturas(),
    Partida         : new Domino_Partida(this),
    RayCaster       : new THREE.Raycaster(),
    PosMouse        : new THREE.Vector2(),
//    Opciones        : new Domino_Opciones(),
    
    // Función que inicia el ejemplo
    Iniciar         : function() {       
        // Esconde la ventana que informa al usuario de que se está cargando la animación. (REQUERIDO)
        this.Cargando(false);        
        
        // VERSIÓN DEL JUEGO A MANO
        document.getElementById("VersionDomino").innerHTML = this.VersionDomino;
        
        // Fijo el modo landscape (NO VA...)
//        screen.orientation.lock("landscape");

        // Fuerzo a recargar todo el contenido (NO VA...)
        // Al StackOverflow es comenta que si fas "Request desktop site" es fa un hard reload inclus dels CSS
        // I si no.. amb el movil enxufat al PC Cmd+Shift+R...
        // Una altre solucio es afegir/modificar un parámetre get al link : ej: www.url.com/?a=1
        //window.location.reload(true);
        
        // Activo el mapeado de sombras
        this.Context.shadowMap.enabled	= true;
        // Creo la escena
        this.Escena = new THREE.Scene();
        // Creo la camara
        this.Camara = new THREE.PerspectiveCamera(75, this.Ancho / this.Alto, 0.5, 1000);
        this.Camara.Rotacion = { Grados : 0, Avance : (Math.PI / 180) / 1.5, Distancia : 7, MirarHacia : new THREE.Vector3(0, 0, 0), Animacion : true };
        this.Camara.position.set(0, 10, this.Camara.Rotacion.Distancia);        
        
        // Función para que la cámara rote alrededor de la escena
/*        this.Camara.Rotar = function() {
            if (this.Rotacion.Animacion === true) {
                this.Rotacion.Grados += this.Rotacion.Avance;
                this.position.x = this.Rotacion.Distancia * Math.cos(this.Rotacion.Grados);
                this.position.z = this.Rotacion.Distancia * Math.sin(this.Rotacion.Grados);
                this.lookAt(this.Rotacion.MirarHacia); 
            }
        };*/
        this.Escena.add(this.Camara);
        this.Camara.lookAt(this.Camara.Rotacion.MirarHacia); 

        // Plano para el suelo
        this.Suelo = new THREE.Mesh(    new THREE.PlaneGeometry(300, 300), 
                                        new THREE.MeshPhongMaterial({ color: 0xaaccaa, specular : 0xddEEdd }));
        this.Suelo.rotation.x = -Math.PI / 2;
        this.Suelo.position.y = -0.2;
        //this.Suelo.position.x = -25;
        this.Suelo.position.z = 15;
        this.Suelo.castShadow = false;
        this.Suelo.receiveShadow = true;
        this.Escena.add(this.Suelo);
        
        // Inicio las texturas del domino
        Texturas.Iniciar();

        this.CrearLuces();
        this.Partida.Opciones.Iniciar();
        UI.Iniciar();
        
        this.Redimensionar();
//        this.Camara.Rotar();
        setTimeout(this.Partida.CrearFichas.bind(this.Partida), 10);
    },
    
    
    CrearLuces : function() {
        // Luz direccional
        this.DirLight = new THREE.DirectionalLight( 0xfff1e0, 0.281 );
        this.DirLight.position.set( 0, 40, -30 ); //.normalize();
//        this.DirLight.position.multiplyScalar( 20 );
        this.DirLight.castShadow = true;
        this.DirLight.shadow.mapSize.width = 2048;
        this.DirLight.shadow.mapSize.height = 2048;
        var d = 40;
        this.DirLight.shadow.camera.left = -d;
        this.DirLight.shadow.camera.right = d;
        this.DirLight.shadow.camera.top = d;
        this.DirLight.shadow.camera.bottom = -d;
        this.DirLight.shadow.camera.far = 3500;
//        this.DirLight.target = this.Ficha.Ficha;
        this.Escena.add( this.DirLight );
        
        // Luz de ambiente  
        this.HemiLight = new THREE.HemisphereLight( 0xeeeeee, 0xffffff, 0.7 );
        this.HemiLight.color.setHSL( 0.6, 0.6, 0.6 );
        this.HemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.HemiLight.position.set( 0, 0, 0 );
        this.Escena.add( this.HemiLight );                 
    },
        
    // Mueve la luz y la cámara al jugador especificado
    AnimarLuz       : function(NumJugador) {
        if (typeof(this.AniLuz) !== "undefined") {
            this.AniLuz.Terminar();
        }
        var PosX = 0;
        var PosZ = 0;
        var RotZ = 0;
        switch (NumJugador) {
            case 0 :    // Abajo
                PosZ = -25;
                PosX = 0;
                break;
            case 1 :    // Derecha
                PosZ = -30;
                PosX = 30;
                RotZ = -Math.PI / 128;
                break;
            case 2 :    // Arriba
                PosZ = -50;
                PosX = 0;
                break;
            case 3 :    // Izquierda
                PosZ = -30;
                PosX = -30;
                RotZ = Math.PI / 128;
                break;
        }
        
        console.log(this.Camara.rotation);
        
        this.AniLuz = Animaciones.CrearAnimacion([
                    { Paso : { PX : this.DirLight.position.x , PZ : this.DirLight.position.z, RZ : this.Camara.rotation.y  } },
                    { Paso : { PX : PosX,                      PZ : PosZ                    , RZ : RotZ  }, Tiempo : 400, FuncionTiempo : FuncionesTiempo.SinInOut }
            ], { FuncionActualizar : function(Valores) { 
                    this.DirLight.position.set(Valores.PX, 40, Valores.PZ);                    
                    this.DirLight.lookAt(this.Camara.Rotacion.MirarHacia);
                    this.Camara.rotation.y = Valores.RZ;
                    this.Camara.lookAt(this.Camara.Rotacion.MirarHacia);
                    //this.DirLight.needUpdate = true;
//                    this.DirLight.position.multiplyScalar( 20 );
            }.bind(this) });
        this.AniLuz.Iniciar();
    },
    
    
    ComprobarMouse  : function() {
        if (this.MouseMovido === false) return;
        if (typeof(this.Partida.Ficha[0]) === "undefined") return;
        
        
        this.RayCaster.setFromCamera(this.PosMouse, this.Camara);
        var intersects = this.RayCaster.intersectObjects( this.Escena.children, true );        
        var Hover = [ 0, 0, 0, 0, 0, 0, 0 ];
        
        
        // Compruebo si hay que hacer hover en alguna de las fichas del jugador 1
        for (var i = 0; i < intersects.length; i++ ) {
            for (var f = 0; f < 7; f++) {
                if (intersects[i].object === this.Partida.Ficha[f].Cara1 && this.Partida.Ficha[f].Colocada === false) {
                    Hover[f] = 1;
                }
                if (intersects[i].object === this.Partida.Ficha[f].Cara2 && this.Partida.Ficha[f].Colocada === false) {
                    Hover[f] = 2;
                }
                if (intersects[i].object === this.Partida.Ficha[f].Bola && this.Partida.Ficha[f].Colocada === false) {
                    Hover[f] = 3;
                }                
            }        
        }
        
        // Miro si hay algun cambio respecto los hovers (siempre que sea el jugador 1)
        if (this.Partida.JugadorActual === 0) {        
            for (var f = 0; f < 7; f++) {
                if (Hover[f] !== this.Partida.Ficha[f].Hover) {
                    this.Partida.Ficha[f].AsignarHover(Hover[f]);
                }
            }
        }
    },
        
    
    // Función que pinta cada frame de la animación
    Pintar          : function() {  
        this.ComprobarMouse();
        
        Animaciones.Actualizar();
        
        //this.Camara.Rotar();
        this.Context.render(this.Escena, this.Camara);  
    }
});

// Inicialización del canvas en el Load de la página
//var Domino = {};
//window.addEventListener('load', function() { Domino = new DominoThree; });

var Domino = new DominoThree;
});
