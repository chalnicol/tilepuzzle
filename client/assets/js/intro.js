class Intro extends Phaser.Scene {

    constructor ()
    {
        super('Intro');
    }

    preload () 
    {
        //..
    }

    create () 
    {
        this.add.rectangle ( 400, 300, 750, 550 ).setStrokeStyle ( 3, 0x0a0a0a);

        this.add.text (  400, 150, 'Tile Puzzle', { color:'#0a0a0a', fontSize: 60, fontFamily : 'Oswald'} ).setOrigin (0.5);

        
        this.add.text (  400, 280, 'Select Tile Dimensions', { color:'#9c9c9c', fontSize: 20, fontFamily : 'Oswald'} ).setOrigin (0.5);


        const buts = [
            { txt : '4x4', r : 4, c : 4 },
            { txt : '6x6', r : 6, c : 6 },
            { txt : '8x8', r : 8, c : 8 }
         ];

        for ( let i = 0; i < 3; i++ ) {

            let xp = 400, yp = 340 + i * 55;

            var cont = this.add.container ( xp, yp ).setSize(220, 45).setInteractive();

            var rct = this.add.rectangle ( 0, 0, 220, 45 ).setStrokeStyle ( 1, 0x0a0a0a);

            var txt = this.add.text (  0, 0, buts [i].txt, { color:'#3a3a3a', fontSize: 26, fontFamily : 'Oswald'} ).setOrigin (0.5);

            cont.add ( [ rct, txt ]);

            cont.on('pointerup', () => {

                this.scene.start ('SceneA', { r: buts[i].r,  c: buts[i].c });

            });

            cont.on('pointerover', function () {
                this.first.setFillStyle ( 0xdedede, 1 );
            });
            cont.on('pointerout', function () {
                this.first.setFillStyle ( 0xffffff, 1 );
            });
            cont.on('pointerdown', function () {
                this.first.setFillStyle ( 0xffff00, 1 );
            });
            



        }

    }

}
