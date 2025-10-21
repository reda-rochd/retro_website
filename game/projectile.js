import { AnimationfromMetadata } from "./animation.js";
import { marcelineSpritesMetadata } from "./marcelineSpritesMetadata.js";
import { boxesIntersect } from "./utils.js";

class Projectile {
    constructor(x, y, direction, speed, movingAnimationId, explosionAnimationId) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.speed = speed;
        this.movingAnimation = AnimationfromMetadata(movingAnimationId, marcelineSpritesMetadata);
        this.explosionAnimation = AnimationfromMetadata(explosionAnimationId, marcelineSpritesMetadata);
        this.state = 'moving';
        this.isExploded = false;
    }

    update() {
        if (this.isExploded) return;
        if (this.state === 'moving') {
            this.x += this.direction === 'left' ? -this.speed : this.speed;
            this.y += Math.sin(this.x / 20) * 2; // Example of slight vertical movement
            this.movingAnimation.update();
        }
        else
        {
            this.explosionAnimation.update();
            if (this.explosionAnimation.finished()) {
                this.isExploded = true;
            }
        }
    }

    hitPlayer(player) {
        if (this.isExploded || this.state !== 'moving') return;
        const hitbox = this.getHitbox();
        const playerHitbox = player.getHitbox();
        if (boxesIntersect(hitbox, playerHitbox)) {
            player.hardHit = true;
            player.hurt(1, this.x < player.x ? 'right' : 'left');
            this.exploade();
        }
    }

    draw(ctx, assets)
    {
        if (this.isExploded) return;
        ctx.save();
        let frame = this.state === 'moving' ? this.movingAnimation : this.explosionAnimation;
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

    getHitbox()
    {
        const frame = this.state === 'moving' ? this.movingAnimation : this.explosionAnimation;
        const currentFrame = frame.currentFrame
        const hitbox = frame.hitboxes[currentFrame];
        let hitbox_x = hitbox.x + frame.offsetX;
        if (this.direction === 'left')
            hitbox_x = frame.width - hitbox.x - hitbox.width - frame.offsetX;
        return {
            x: this.x + hitbox_x - frame.width / 2,
            y: this.y + hitbox.y - frame.height / 2 + frame.offsetY,
            width: hitbox.width,
            height: hitbox.height,
        };
    }

    exploade()
    {
        if (this.state !== 'exploding') {
            this.state = 'exploding';
            this.explosionAnimation.reset();
        }
    }

}

export { Projectile };