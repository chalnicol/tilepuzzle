class Cell extends Phaser.GameObjects.Image {

    constructor(scene, x, y, texture, frame, id, post ) {

        super(scene, x, y, texture, frame);

        this.setName (id).setInteractive();

        this.orgPost = post;

        this.currPost = post;

        scene.add.existing(this);

    }
    
}