import { Projectile } from './projectile.js';

const idleState = (marceline) => {
    let timer = 0;
    return {
        enter: () => {
            if (marceline.isHuman)
                marceline.setAnimationId(marceline.isCalm ? 'idle' : 'idleFlying');
            else
            {
                marceline.y = marceline.groundY - 20;
                marceline.setAnimationId('monsterIdle');
            }
            if (marceline.isCalm)
                marceline.y = marceline.groundY;
            marceline.isAttacking = false;
            marceline.immune = false;
        },
        update: () => {
            if (!marceline.isCalm && marceline.animation_id === 'idleFlying')
                marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            if (marceline.isCalm) return;

            marceline.idleTimer -= 1;
            if (marceline.idleTimer > 0) return;
            marceline.setIdleTimer();
            const hpLost = marceline.maxHp - marceline.hp;
            if (marceline.hp <= marceline.maxHp / 2 && marceline.isHuman)
            {
                marceline.setState('monsterTransform');
                return;
            }
            if (marceline.isHuman)
            {
                if (Math.random() < 0.4 && (hpLost > 0 && hpLost % 20 === 0))
                    marceline.setState('guitarOut');
                else
                    marceline.setState('spawnBats');
            }
            else
            {
                if (Math.random() < 0.6 && marceline.player_distance > 100)
                    marceline.setState('monsterRangeAttack');
                else if (Math.random() < 0.9)
                    marceline.setState('monsterMeleeAttack');
            }
        },
    }
}

const guitarOutState = (marceline) => {
    return {
        enter: () => {
            marceline.immune = true;
            marceline.setAnimationId('guitar_out');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState('guitarAttack');
            }
        },
    }
}

const guitarAttackState = (marceline) => {
    let timer = 0;
    return {
        enter: () => {
            const duration = 50;
            timer = Math.floor(Math.random() * duration) + duration;
            marceline.setAnimationId('guitar_attack');
        },
        update: () => {
            marceline.y = marceline.groundY - 10 + Math.sin(Date.now() / 150) * 5;
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 0;
            if (timer % 20 === 0) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y + 10,
                        marceline.direction,
                        7,
                        'music_notes_moving',
                        'music_notes_exploding'
                    )
                );
            }
            timer -= 1;
            if (finished && timer <= 0) {
                marceline.setState('guitarIn');
                timer = 0;
            }
        },
    }
}

const startTeleportState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('teleport');
            marceline.invisible = true;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.x =  marceline.newX;
                marceline.setState('endTeleport')
            }
        },
    }
}

const endTeleportState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('teleport');
            marceline.animations[marceline.animation_id].reverse();
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.invisible = false;
                marceline.setState('guitarAttack');
            }
        },
    }
}

const guitarInState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('guitar_out');
            marceline.animations[marceline.animation_id].reverse();
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.immune = false;
                marceline.setState('idle');
            }
        },
    }
}

const hurtState = (marceline) => {
    return {
        enter: () => {
            marceline.idleTimer = 0;
            marceline.immuneTimer = 30;
            marceline.immune = true;
            marceline.setAnimationId(marceline.isHuman ? 'marceline_hurt' : 'monsterHurt');
        },
        
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished)
                marceline.setState('idle');
        },
    }
}

const spawnBatsState = (marceline) => {
    const batCount = 1;
    return {
        enter: () => {
            marceline.y = marceline.groundY;
            marceline.setAnimationId('flying_bats_attack');
            marceline.isAttacking = true;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const currentFrame = marceline.animations[marceline.animation_id].currentFrame;
            const offset = 100;
            if (currentFrame === 11) {
                for (let i = 0; i < batCount; i++)
                {
                    let x = Math.random() < 0.5 ? 0 : marceline.screenWidth;
                    x += (x === 0) ? -( 100 + offset * i) : (100 + offset) * i;
                    const direction = x <= 0 ? 'right' : 'left';
                    marceline.projectiles.push(
                        new Projectile( 
                            x, 
                            marceline.y,
                            direction,
                            4,
                            'bat_flying',
                            'bat_flying'
                        )
                    );
                }
            }
            if (finished) {
                marceline.setState('idle');
            }
        },
    }
}

const monsterTransformState = (marceline) => {
    return {
        enter: () => {
            marceline.immune = true;
            marceline.isHuman = false;
            marceline.y = marceline.groundY - 20;
            marceline.setAnimationId('transform');
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.setState('idle');
            }
        },
    }
}

const monsterRangeAttackState = (marceline) => {
    let timer = 0;
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_range_attack');
            marceline.isAttacking = true;
            timer = 20; // Duration of the attack
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const dir = marceline.direction;
            const offset = 60;
            if (marceline.animations[marceline.animation_id].currentFrame === 4) {
                marceline.projectiles.push(
                    new Projectile(
                        marceline.x + ( dir === 'right' ? offset : -offset ), 
                        marceline.y,
                        marceline.direction,
                        5,
                        'monster_projectile_moving',
                        'monster_projectile_exploding'
                    )
                );
            }
            timer -= 1;
            if (finished && timer <= 0)
                marceline.setState('idle');
        },
    }
}

const monsterMeleeAttackState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('monsterBat_attack');
            marceline.immune = true;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            const currentFrame = marceline.animations[marceline.animation_id].currentFrame;
            marceline.isAttacking = currentFrame > 4 && currentFrame < 7;
            if (finished)
                marceline.setState('idle');
        }
    }
}

const calmDownState = (marceline) => {
    return {
        enter: () => {
            marceline.setAnimationId('transform');
            marceline.animations[marceline.animation_id].reverse();
            marceline.isAttacking = false;
            marceline.immune = true;
            marceline.immuneTimer = 0;
        },
        update: () => {
            const finished = marceline.animations[marceline.animation_id].finished();
            if (finished) {
                marceline.isCalm = true;
                marceline.isHuman = true;
                marceline.setState('idle');
            }
        },
    }
}

export function setStates(marceline)
{
    return {
        'idle': idleState(marceline),
        'guitarOut': guitarOutState(marceline),
        'guitarAttack': guitarAttackState(marceline),
        'startTeleport': startTeleportState(marceline),
        'endTeleport': endTeleportState(marceline),
        'spawnBats': spawnBatsState(marceline),
        'guitarIn': guitarInState(marceline),
        'hurt': hurtState(marceline),
        'monsterRangeAttack': monsterRangeAttackState(marceline),
        'monsterMeleeAttack': monsterMeleeAttackState(marceline),
        'monsterTransform': monsterTransformState(marceline),
        'calmDown': calmDownState(marceline),
    };
}