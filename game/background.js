
class Background
{
    constructor(screenW, screenH, assets)
    {
        this.width = screenW;
        this.height = screenH;
        this.sky = {
            width: assets.get('sky').width,
            height: assets.get('sky').height,
            x: 0, 
            y: 0, 
            speed: 0.1,
        };
        this.mountains = {
            width: assets.get('mountains').width,
            height: assets.get('mountains').height,
            x: 0,
            y: screenH * 0.1, 
            speed: 0.2,
        };

        this.trees = {
            width: assets.get('trees').width,
            height: assets.get('trees').height,
            x: 0,
            y: screenH * 0.4,
            speed: 0.4,
        };
        this.grass = {
            width: assets.get('grass').width,
            height: assets.get('grass').height,
            x: 0, 
            y: screenH - assets.get('grass').height + 5, 
            speed: 0.6
        };
        this.ground = {
            width: assets.get('ground').width,
            height: assets.get('ground').height,
            x: 0,
            y: screenH - assets.get('ground').height + 10,
            speed: 1,
        }

        this.tutorial = {
            width: assets.get('billboard').width,
            height: assets.get('billboard').height,
            x: screenW,
            y: screenH - assets.get('billboard').height,
            speed: 0.6,
        }
        this.showTutorial = true;
    }

    update()
    {
        this.sky.x -= this.sky.speed;
        this.mountains.x -= this.mountains.speed;
        this.trees.x -= this.trees.speed;
        this.grass.x -= this.grass.speed;
        this.tutorial.x -= this.tutorial.speed;
        this.ground.x -= this.ground.speed;

        if (this.sky.x <= -this.sky.width / 3)
            this.sky.x = 0;
        if (this.mountains.x <= -this.mountains.width / 3)
            this.mountains.x = 0;
        if (this.trees.x <= -this.trees.width / 3)
            this.trees.x = 0;
        if (this.grass.x <= -this.grass.width / 3)
            this.grass.x = 0;
        if (this.tutorial.x <= -this.tutorial.width)
            this.tutorial.x = this.width + 160;
        if (this.ground.x <= -this.ground.width / 3)
            this.ground.x = 0;
    }

    draw(ctx, assets)
    {
        ctx.drawImage(assets.get('sky'), this.sky.x, this.sky.y);
        ctx.drawImage(assets.get('mountains'), this.mountains.x, this.mountains.y);
        ctx.drawImage(assets.get('trees'), this.trees.x, this.trees.y);
        ctx.drawImage(assets.get('grass'), this.grass.x, this.grass.y);
        if (this.showTutorial)
            ctx.drawImage(assets.get('billboard'), this.tutorial.x, this.tutorial.y);
        ctx.drawImage(assets.get('ground'), this.ground.x, this.ground.y);
    }

    reset()
    {
        this.sky.x = 0;
        this.mountains.x = 0;
        this.trees.x = 0;
        this.grass.x = 0;
        this.ground.x = 0;
        this.tutorial.x = this.width;
        this.showTutorial = true;
    }
}

export { Background };