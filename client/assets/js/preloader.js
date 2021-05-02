class Preloader extends Phaser.Scene {

    constructor ()
    {
        super('Preloader');
    }
    preload ()
    {
        
        this.load.audioSprite('sfx', 'client/assets/sfx/fx_mixdown.json', [
            'client/assets/sfx/sfx.ogg',
            'client/assets/sfx/sfx.mp3'
        ]);
        
        this.load.audio ('introbg', ['client/assets/sfx/lounge.ogg', 'client/assets/sfx/lounge.mp3'] );

        this.load.audio ('sceneabg', ['client/assets/sfx/starcommander.ogg', 'client/assets/sfx/starcommander.mp3'] );


        // this.load.image('centerpiece', 'client/assets/images/centerpiece.png');

        // this.load.image('cellbg', 'client/assets/images/cellsb.png');

        // this.load.spritesheet('inds', 'client/assets/images/ind_thumbs.png', { frameWidth: 40, frameHeight: 40 });

        //progress bar
       
        const rW = 300, rH = 15;

        let preloadCont = this.add.container ( 400, 300 );

        let txta = this.add.text ( 0, -(rH + 25), 'Loading Files : 0%', { color:'#3a3a3a', fontFamily: 'Oswald', fontSize: 20 }).setOrigin(0.5);

        let recta = this.add.rectangle ( 0, 0, rW + 8, rH + 8 ).setStrokeStyle ( 2, 0x0a0a0a );

        let rectb = this.add.rectangle ( -rW/2, -rH/2, 5, rH, 0x3a3a3a, 1 ).setOrigin ( 0 );

        preloadCont.add ( [ txta, recta, rectb ] );


        this.load.on ('complete', function () {

            preloadCont.visible = false;

            this.showProceed ();

        }, this);

        this.load.on ('progress', function (progress) {

            preloadCont.last.width = progress * rW;

            preloadCont.first.text = 'Loading Files : ' +  Math.floor (progress  * 100)  + '%';

        });

    }

    showProceed () {

        //..
        this.add.text ( 400, 300, 'Click to Proceed', { color : '#333', fontFamily : 'Oswald', fontSize : 24 }).setOrigin(0.5);

        this.input.once ('pointerup', () => {
            this.scene.start('SceneA');
        });

    }
    
    
}
