import { marcelineSpritesMetadata } from "./marcelineSpritesMetadata.js";
import { AnimationfromMetadata } from "./animation.js";
import { setStates } from "./marcelineState.js";
import { boxesIntersect, distance } from "./utils.js";

class Marceline
{
    constructor(x, y, width, height)
    {
        this.maxHp = 200;
        this.hp = 200;
        this.x = x;
        this.y = y;
        this.direction = 'left';
        this.screenWidth = width;
        this.screenHeight = height;
        this.speed = 20;
        this.groundY = y;
        this.projectiles = [];

        this.xVelocity = 0;
        this.yVelocity = 0;
        this.maxHeight = 50;
        this.newX = x;
        this.player_distance = undefined;

        this.isAttacking = false;
        this.isCalm = false;
        
        this.isHuman = true;
        this.invisible = false;
        this.immune = false;
        this.immuneTimer = 0;
        this.idleTimer = 0;
        
        this.state = 'idle';
        this.states = setStates(this);
        
        this.animation_id = 'idleFlying';
        this.animations = setAnimations();
    }

    setState(state)
    {
        if (this.state !== state)
        {
            this.state = state;
            this.states[state].enter();
        }
    }

    setIdleTimer()
    {
        const duration = 30;
        this.idleTimer = Math.floor(Math.random() * duration) + duration;
    }
    
    reset()
    {
        this.hp = this.maxHp;
        this.isDead = false;
        this.isCalm = false;
        this.isHuman = true;
        this.invisible = false;
        this.immune = false;
        this.immuneTimer = 0;
        this.projectiles = [];
        this.setState('idle');
    }

    update(deltaTime, player)
    {
        if (this.immuneTimer > 0)
            this.immuneTimer--;
        if (this.hitPlayer(player))
            player.hurt(1, this.x < player.x ? 'right' : 'left');

        if (true && Math.floor(Date.now() / 50) % 2 == 0)
        {
            this.states[this.state].update();
            this.animations[this.animation_id].update();
        }
        this.projectiles.forEach(p => p.update());
        this.projectiles = this.projectiles.filter(
            p => (!p.isExploded && p.x > -this.screenWidth && p.x < 2 * this.screenWidth)
        );
        this.projectiles.forEach(p => p.hitPlayer(player));
        this.player_distance = distance(this, player);
        if (this.state === "guitarAttack" && this.player_distance < 80)
        {
            this.newX = player.x + (this.x < player.x ? 150 : -150);
            if (this.newX < 50)
                this.newX = 50;
            if (this.newX > this.screenWidth - 50)
                this.newX = this.screenWidth - 50;
            this.setState("startTeleport");
        }
        this.direction = player.x > this.x ? 'right' : 'left';
    }

    hitPlayer(player)
    {
        if (this.invisible || this.isCalm)
            return false;
        const player_hitbox = player.getHitbox();
        const player_intersect = boxesIntersect(player_hitbox, this.getHitbox());
        if (player_intersect && player.isAttacking 
            && !this.isAttacking 
            && !this.immune
            && this.immuneTimer <= 0)
        {
            this.setState('hurt');
            this.hp -= player.damage;
            if (this.hp <= 0)
            {
                this.hp = 0;
                this.setState('calmDown');
            }
            return false;
        }
        if (!this.isAttacking)
            return false;
        return player_intersect;
    }

    setAnimationId(id)
    {
        if (this.animation_id !== id)
        {
            this.animation_id = id;
            this.animations[id].reset();
        }
    }

    getHitbox()
    {
        // hitbox offset for less punishing collisions
        const offsetX = 0;
        const offsetY = 0;

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

    draw(ctx, assets)
    {
        let shouldDraw = true; 
        if (this.immuneTimer > 0 && Math.floor(this.immuneTimer) % 2 == 0)
                shouldDraw = false;
        
        if (shouldDraw)
        {
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
        }
        // ctx.strokeStyle = 'red';
        // const hitbox = this.getHitbox();
        // ctx.strokeRect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        this.projectiles.forEach(p => p.draw(ctx, assets));
    }
    
    drawHpBar(ctx)
    {
        if (this.invisible  || this.isCalm)
            return;
        const hitbox = this.getHitbox();
        const barWidth = 80;
        const barHeight = 5;
        const x = this.x - barWidth / 2;
        const y = this.y - hitbox.height / 2 - 20;
        ctx.fillStyle = 'black';
        ctx.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);
        ctx.fillStyle = 'red';
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(x, y, barWidth * (this.hp / this.maxHp), barHeight);
    }
}

function setAnimations()
{
    let anim = {};

    for (const key in marcelineSpritesMetadata)
        anim[key] = AnimationfromMetadata(key, marcelineSpritesMetadata);
    
    // Adjust offsets for better alignment
    anim['monsterBat_attack'].offsetX = 20;
    anim['monsterIdle'].offsetY = -20;
    anim['monsterBat_range_attack'].offsetY = -20;
    anim['monsterBat_attack'].offsetY = -20;
    anim['transform'].offsetY = -20;
    anim['monsterHurt'].offsetY = -20;

    anim['guitar_out'].offsetY = -6;
    anim['guitar_out'].offsetX = 4;
    anim['teleport'].offsetY = -6;
    anim['teleport'].offsetX = 4;
    return anim;
}

export { Marceline };
