import { setStates } from "./playerState.js";
import { AnimationfromMetadata } from "./animation.js";
import { fennSpritesMetadata } from "./fennSpritesMetadata.js";

class Player
{
    constructor(x, y, screenWidth, screenHeight)
    {
        this.maxHp = 8;
        this.hp = 8;
        this.x = x;
        this.y = y;
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.groundY = y;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.direction = 'right';
        
        this.speed = 10;
        this.jumpStrength = 25;
        this.maxHeight = screenHeight * 0.3;
        this.damage = 10;

        this.shouldCombo = false;
        this.hardHit = false;
        this.hurtTimer = 0;
        this.shieldUp = false;
        this.isDead = false;
        this.isAttacking = false;

        this.state = 'idle';
        this.states = setStates(this);

        this.animation_id = 'idle1';
        this.animations = setAnimations();
        this.slowAnimation = false;
    }
    reset()
    {
        this.hp = this.maxHp;
        this.isDead = false;
        this.hurtTimer = 0;
        this.shieldUp = false;
        this.isAttacking = false;
        this.shouldCombo = false;
        this.hardHit = false;
        this.xVelocity = 0;
        this.yVelocity = 0;
        this.direction = 'right';
        this.slowAnimation = false;
        this.setState('idle');
    }

    hurt(damage, direction)
    {
        if (this.hurtTimer > 0 || this.isDead || this.shieldUp || this.isAttacking)
            return;
        this.damage_direction = direction;
        this.hp -= damage;
        if (this.hp <= 0)
            this.setState('die');
        else 
            this.setState('hurt');
    }

    move(direction = null)
    {
        if (!direction)
            direction = this.direction;
        this.x += direction === 'right' ? this.xVelocity : -this.xVelocity;
        if (this.x < 0)
            this.x = 0;
        const hitbox = this.getHitbox();
        if (this.x > this.screenWidth)
            this.x = this.screenWidth;
    }

    stop()
    {
        this.xVelocity = 0;
        this.yVelocity = 0;
    }

    setAnimationId(id)
    {
        if (this.animation_id !== id)
        {
            this.animation_id = id;
            this.animations[id].reset();
        }
    }

    setState(state)
    {
        if (this.state !== state)
        {
            this.state = state;
            this.states[state].enter();
        }
    }

    draw(ctx, assets)
    {
        if (this.hurtTimer > 0) {
            this.hurtTimer -= 0.1;
            if (this.hurtTimer < 0) 
                this.hurtTimer = 0;
            if (Math.floor(this.hurtTimer * 10) % 2 == 0)
                return;
        }
        ctx.save();
        let frame = this.animations[this.animation_id];
        ctx.translate(this.x, this.y);
        if (this.direction == 'left')
            ctx.scale(-1, 1);
        ctx.drawImage(assets.get(frame.sprite_name),
                frame.x, frame.y, frame.width, frame.height, 
                -frame.width / 2 + frame.offsetX,
                -frame.height / 2 + frame.offsetY,
                frame.width, frame.height);
        ctx.restore();
        // ctx.strokeStyle = 'red';
        // const hitbox = this.getHitbox();
        // ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
    }

    update (deltatime)
    {
        if (this.hp <= 0)
            this.setState(this.y !== this.groundY ? 'falling': 'die');
        if (this.slowAnimation && Math.floor(Date.now() / 50) % 2 == 0) return;
        this.states[this.state].update();
        this.animations[this.animation_id].update();
    }

    getHitbox()
    {
        // hitbox offset for less punishing collisions
        const offsetX = 5;
        const offsetY = 5;

        const frame = this.animations[this.animation_id];
        const currentFrame = frame.currentFrame
        const hitbox = frame.hitboxes[currentFrame];
        let hitbox_x = hitbox.x + frame.offsetX;
        if (this.direction === 'left')
            hitbox_x = frame.width - hitbox.x - hitbox.width - frame.offsetX;
        return {
            x: this.x + hitbox_x - frame.width / 2 + offsetX,
            y: this.y + hitbox.y - frame.height / 2 + frame.offsetY + offsetY,
            width: hitbox.width - offsetX * 2,
            height: hitbox.height - offsetY * 2,
        };
    }
}

function setAnimations()
{
    let anim = {};
    for (const key in fennSpritesMetadata)
        anim[key] = AnimationfromMetadata(key, fennSpritesMetadata);

    //manualy tweak some animations
    anim['jump'].repeated = false;
    anim['fall'].repeated = false;
    anim['land'].repeated = false;
    anim['duck'].repeated = false;
    anim['hurt'].repeated = false;
    anim['die'].repeated = false;
    anim['sword_out'].repeated = false;
    anim['sword_attack'].repeated = false;
    anim['sword_combo'].repeated = false;
    anim['jake_roll_in'].repeated = false;
    anim['jake_roll_out'].repeated = false;

    anim['shield_out'].offsetX = 6;
    anim['shield_in'].offsetX = 6;
    anim['shield_idle'].offsetX = 6;
    anim['shield_walk'].offsetX = 6;

    anim['sword_out'].offsetX = 14;
    anim['sword_out'].offsetY = -14;
    anim['sword_attack'].offsetX = 14;
    anim['sword_attack'].offsetY = -14;
    anim['sword_combo'].offsetX = 14;
    anim['sword_combo'].offsetY = -14;
    
    anim['jake_roll_in'].offsetY = -8;
    anim['jake_roll'].offsetY = -8;
    anim['jake_roll_out'].offsetX = -4;
    anim['jake_roll_out'].offsetY = -4;

    anim['die'].offsetY = 4;
    
    return anim;
};

export { Player };