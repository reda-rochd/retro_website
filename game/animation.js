class Animation
{
    constructor(sprite_name, frameW, frameH, frameCount, hitboxes = [], repeated = true, offsetX = 0, offsetY = 0)
    {
        this.sprite_name = sprite_name;
        this.frameCount = frameCount;
        this.x = 0;
        this.y = 0;
        this.width = frameW;
        this.height = frameH;

        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.repeated = repeated;
        this.reversed = false;
        this.paused = false;

        this.currentFrame = 0;
        this.hitboxes = hitboxes;
    }

    update()
    {
        if (this.paused)
            return ;

        if (this.reversed)
            this.currentFrame = (this.currentFrame - 1 >= 0 ) ? this.currentFrame - 1 : (this.repeated ? this.frameCount - 1 : 0);
        else
            this.currentFrame = (this.currentFrame + 1 < this.frameCount) ? this.currentFrame + 1 : (this.repeated ? 0 : this.frameCount - 1);
        this.x = this.currentFrame * this.width;
    }

    finished()
    {
        return (this.currentFrame === 0 && this.reversed) || (this.currentFrame === this.frameCount - 1 && !this.reversed);
    }

    reset()
    {
        this.currentFrame = 0;
        this.reversed = false;
    }

    reverse()
    {
        this.reversed = !this.reversed;
        this.currentFrame = this.frameCount - 1;
    }

    pause()
    {
        this.paused = true;
    }

    resume()
    {
        this.paused = false;
    }
}

function AnimationfromMetadata(animation_id, metadata)
{
    const data = metadata[animation_id];
    return new Animation(
        animation_id, 
        data.frame_w,
        data.frame_h,
        data.frames,
        data.hitboxes
    );
}

export { Animation, AnimationfromMetadata };