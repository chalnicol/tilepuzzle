

window.onload = function () {

    var config = {
        type: Phaser.AUTO,
        scale: {
            mode: Phaser.Scale.FIT,
            parent: 'game_div',
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: 800 ,
            height: 600
        },
        audio: {
            disableWebAudio: false
        },
        backgroundColor: '#ffffff',
        scene: [ Preloader, SceneA ]
    };

    new Phaser.Game(config);

} 
