class SceneA extends Phaser.Scene {

    constructor ()
    {
        super('SceneA');
    }

    preload () 
    {
        //..
    }

    create () 
    {


        this.cellData = { r : 6, c : 6 };

        this.isGameOn = false;

        this.add.rectangle ( 400, 300, 550, 550 ).setStrokeStyle ( 3, 0x0a0a0a );

        this.loadImage ( 'lebronwade' );

      

    }

    jumblePosition () {

        var counter = 0;

        //while ( counter < 1000 ) {

        var timer = setInterval ( () => {
            
            const adjArr = this.getAdjacents (  this.cellData.r,  this.cellData.c );
                            
            const randIndx = Math.floor ( Math.random() * adjArr.length );

            const toOpenCell = adjArr [ randIndx ];

            const cellToMove = this.cells [ toOpenCell ].resident;

            //get cells..

            const cell = this.cellsCont.getByName ( cellToMove );

            cell.setPosition( this.cells [ this.openCell ].x, this.cells [ this.openCell ].y );

            cell.currPost = this.openCell;


            this.cells [ this.openCell ].resident = cellToMove;

            this.openCell = toOpenCell;

            this.cells [ toOpenCell ].resident = '';

    
            counter++;

            if ( counter >= 500) {
                clearInterval ( timer);
                this.isGameOn = true;
            }

        }, 1 );

        // this.isGameOn = true;

      


            
    }

    loadImage ( img )
    {

        const fw = Math.floor( 800/this.cellData.r) , fh = Math.floor( 800/this.cellData.c);

        const key = 'pic' + Math.floor ( Math.random() * 99999 );

        this.load.spritesheet( key,  'client/assets/images/' + img + '.jpg', { frameWidth: fw, frameHeight: fh });
        
        this.load.once('complete', () => {

            //console.log ('this is complete..');

            this.createCells ( key );

            this.showPrompt ('Welcome!', 'Click Here to Start', () => this.startGame ());

        });  

        this.load.start(); 


    }

    createCells ( key )
    {

        this.cells = [];
        
        this.cellsCont = this.add.container (0, 0);

        const w = 800, h = 600;

        //create cells

        const cSp = 2, cSize = (h * 0.85 )/this.cellData.c ;

        const sX =  (w - (this.cellData.c * ( cSize + cSp ) - cSp))/2 + (cSize/2),

              sY = (h - (this.cellData.r * ( cSize + cSp ) - cSp))/2 + (cSize/2);

        for ( let i = 0; i < ( this.cellData.r * this.cellData.c ); i++ ) {

            const ix = Math.floor ( i/this.cellData.r), iy = i % this.cellData.r;

            const xp = sX + iy * (cSize+cSp),

                  yp = sY + ix*(cSize+cSp);


            const img = new Cell ( this, xp, yp, key, i, 'cell'+i, i ).setScale ( cSize / (800/this.cellData.c) );

            img.on ('pointerup', () => {

                this.moveCell ( img.currPost );

            });

            this.cells.push ( { 'x' : xp, 'y' : yp, 'resident' : 'cell' + i });

            this.cellsCont.add ( img );

            //this.add.text ( xp, yp, i, { color:'#ff0', fontFamily:'Oswald', fontSize: 20 }).setOrigin(0.5);


        }

    }

    startGame () 
    {

        this.openCell = (this.cellData.r * this.cellData.c) - 1;
        
        this.cells [ this.openCell ].resident = '';

        this.cellsCont.getByName ('cell' + this.openCell ).setVisible( false ).removeInteractive();

        this.removePrompt ();

        this.jumblePosition ();

    }

    getAdjacents () {


        const r = Math.floor( this.openCell/this.cellData.r),

              c = this.openCell % this.cellData.c;


        let arr = [];

        if ( c-1 >=0 ) {

            const left = (r * this.cellData.r) + (c - 1);

            arr.push ( left );

        }

        if ( c+1 < this.cellData.c ) {

            const right = (r * this.cellData.r) + (c + 1);

            arr.push ( right );
        }

        if ( r-1 >= 0 ) {

            const top = ( (r-1) * this.cellData.r) + c;

            arr.push ( top );

        }

        if ( r+1 < this.cellData.r  ) {

            const bottom = ( (r+1) * this.cellData.r) + c;

            arr.push ( bottom );
            
        }
              
        return arr;

    }

    moveCell ( post ) {

        if ( this.isGameOn ) {

            const adjArr = this.getAdjacents ();

            if ( adjArr.includes (post) ) {

                const cellToMove = this.cells [ post ].resident;

                //get cells..
                const cell = this.cellsCont.getByName ( cellToMove );

                cell.setPosition( this.cells [ this.openCell ].x, this.cells [ this.openCell ].y );

                cell.currPost = this.openCell;


                this.cells [ post ].resident = '';

                this.cells [ this.openCell ].resident = cellToMove;

                this.openCell = post;

            }

           // console.log ( 'winner', this.checkWinner () );

            if ( this.checkWinner() ) this.endGame ();

        }


    }

    checkWinner () {
 
        const total = (this.cellData.r * this.cellData.c) - 1;

        for ( let i = 0; i < total; i++ ) {

            const cell = this.cellsCont.getByName ('cell' + i );

            if ( cell.orgPost != cell.currPost ) return false;

        }

        return true;
    
    }

    endGame () {
        
        this.isGameOn = false;
        
        this.showPrompt ('Well Done!!', 'Click Here To Play Again', () => this.resetGame() );

    }

    showPrompt ( mainTxt, caption, func ) {

        this.promptCont = this.add.container (0, 0);

        var bgRect = this.add.rectangle ( 400, 300, 800, 600, 0x0a0a0a, 0.3 ).setInteractive ();


        var smRect = this.add.rectangle ( 400, 300, 250, 100, 0xffffff, 0.9 ).setInteractive ();

        smRect.on ('pointerup', () => {
            
            //this.resetGame ();
            func ();
        });

        var txt = this.add.text (  400, 290, mainTxt, { color:'#0a0a0a', fontSize:20, fontFamily : 'Oswald'} ).setOrigin (0.5);

        var txtb = this.add.text ( 400, 315, caption, { color:'#ff6a6a', fontSize:12, fontFamily : 'Oswald'} ).setOrigin (0.5);


        this.promptCont.add ( [ bgRect, smRect, txt, txtb ]);


    }

    removePrompt () {
        this.promptCont.destroy ();
    }

    resetGame () {
        //..
        this.removePrompt ();

        this.jumblePosition ();
    }
}
