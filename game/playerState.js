const idleState = (player) => {
    return {
        enter : () => {
            player.stop();
            player.setAnimationId('idle1');
        },
        update: () => {},
        onKeyDown: (input) => {
            switch (input)
            {
                case 'arrowright':
                    player.state = 'running';
                    player.direction = 'right';
                    break;
                case 'arrowleft':
                    player.state = 'running';
                    player.direction = 'left';
                    break;
                case 'arrowup':
                    player.state = 'jumping';
                    break;
                case 'arrowdown':
                    player.state = 'ducking';
                    break;
                case 'keyg':
                    player.state = 'shieldOut';
                    break;
                case 'space':
                    player.state = 'swordOut';
                    break;
                default:
                    break;
            }
            if (player.state !== 'idle')
                player.states[player.state].enter();
        },
    
        onKeyUp: (input) => {}        
    }
}

const walkingState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            player.setAnimationId('walk');
        },
        update: () => {},
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const jakeRollInState = (player) => {
    return {
        enter: () => {
            player.xVelocity = player.speed * 1.5;
            player.yVelocity = 0;
            player.setAnimationId('jake_roll_in');
        },
        update: () => {
            player.x += player.xVelocity;
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'jakeRoll';
                player.states[player.state].enter();
            }
        },
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const jakeRollState = (player) => {
    return {
        enter: () => { player.setAnimationId('jake_roll'); },
        update: () => { player.x += player.xVelocity; },
        onKeyUp: (input) => {},
        onKeyDown: (input)=> {}
    }
}

const jakeRollOutState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.setAnimationId('jake_roll_out');
        },
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}
    }
}

const runningState = (player) => {
    return {
        enter: () => {
            player.xVelocity = player.speed;
            player.yVelocity = 0;
            player.setAnimationId('run');
        },    
        
        update: () => { player.move(); },
        
        onKeyUp: (input) =>
        {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return;
            player.setState('idle');
        },

        onKeyDown: (input) =>
        {
            switch (input)
            {
                case 'arrowright':
                    player.direction = 'right';
                    break;
                case 'arrowleft':
                    player.direction = 'left';
                    break;
                case 'arrowup':
                    player.setState('jumping');
                    break;
                case 'arrowdown':
                    player.setState('ducking');
                    break;
                case 'keyg':
                    player.setState('shieldOut');
                    break;
                case 'space':
                    player.setState('swordOut');
                    break;
                default:
                    player.setState('idle');
                    break;
            }
        },
    }
}

const jumpingState = (player) => {
    return {
        enter: () => {
            player.yVelocity = -player.jumpStrength;
            player.setAnimationId('jump');
        },
    
        update: () => {
            player.move();
            player.y += player.yVelocity;
            
            if (player.groundY - player.y >= player.maxHeight)
            {
                player.y = player.groundY - player.maxHeight;
                player.state = 'falling';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return;
            player.xVelocity = 0;
        },
    
        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
        },
    } 
}

const fallingState = (player) => {
    let gravity = 3;

    return {
        enter: () => {
            player.yVelocity = 0;
            player.setAnimationId('fall');
        },
    
        update: () => {
            player.move();
            player.yVelocity += gravity;
            player.y += player.yVelocity;
            if (player.y >= player.groundY)
            {
                player.y = player.groundY;
                player.state = player.xVelocity === 0 ? 'landing' : 'running';  
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.xVelocity = 0; 
        },
        
        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.xVelocity = player.speed;
        },
    }
}

const landingState = (player) => {
    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            player.setAnimationId('land');
        },
    
        update: () => {
            if (player.animations[player.animation_id].finished())
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {},
    
        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
        },
    }    
}

const duckingState = (player) => {
    let standing = false;

    return {
        enter: () => {
            player.xVelocity = 0;
            player.yVelocity = 0;
            standing = false;
            player.setAnimationId('duck');
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (standing && finished)
            {
                player.state = 'idle';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'arrowdown')
                return;
            player.animations[player.animation_id].reverse();
            standing = true;
        },
    
        onKeyDown: (input) =>
        {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
        },
    }
}

const shieldOutState = (player) => {
    return {
        enter: () => {
            player.shieldUp = true;
            player.yVelocity = 0;
            player.setAnimationId('shield_out');
        },
        
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = 'shieldWalk';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input === 'arrowright' || input === 'arrowleft')
                player.xVelocity = 0;
            if (input === 'keyg')
            {
                player.state = 'shieldIn';
                player.states[player.state].enter();
            }
        },
        
        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.state = 'shieldWalk';
            player.states[player.state].enter();
        },
    }
}

const shieldWalkState = (player) => {
    const speedModifier = 0.5;

    return {
        enter: () => {
            player.xVelocity = player.xVelocity * speedModifier;
            player.yVelocity = 0;
            player.setAnimationId(player.xVelocity == 0 ? 'shield_idle' : 'shield_walk');
        },
        
        update: () => { 
            player.move();
            if (player.xVelocity == 0)
                player.setAnimationId('shield_idle');
            else
                player.setAnimationId('shield_walk');
        },
        
        onKeyUp: (input) => {
            if (input === 'arrowright' || input === 'arrowleft')
                player.xVelocity = 0;
            if (input === 'keyg')
            {
                player.state = 'shieldIn';
                player.states[player.state].enter();
            }
        },

        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.xVelocity = player.speed / 2;
        },
    }
}

const shieldInState = (player) => {
    return {
        enter: () => {
            player.yVelocity = 0;
            player.shieldUp = false;
            player.setAnimationId('shield_in');
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                player.state = player.xVelocity === 0 ? 'idle' : 'running';
                player.states[player.state].enter();
            }
        },
    
        onKeyUp: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.xVelocity = 0;
        },
    
        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
        },
    }
}

const dieState = (player) => {

    return {
        enter: () => {
            player.stop();
            player.hp = 0;
            player.setAnimationId('die');
        },
        
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.isDead = true;
        },
        
        onKeyUp: (input) => {},
        onKeyDown: (input) => {}, 
    }
}

const hurtState = (player) => {
    const gravity = 2;

    return {
        enter: () => {
            player.stop();
            player.hurtTimer = 1.0;
            player.setAnimationId(player.hardHit ? 'hard_hit' : 'hurt');
            player.xVelocity = player.hardHit ? 4 : 2;
        },
    
        update: () => {
            player.y += player.yVelocity;
            if (player.y < player.groundY)
                player.yVelocity += gravity;
            if (player.y > player.groundY)
            {
                player.y = player.groundY;
                player.yVelocity = 0;
            } 
            player.move(player.damage_direction);
            player.direction = player.damage_direction === 'right' ? 'left' : 'right';
            const finished = player.animations[player.animation_id].finished();
            if (finished && player.y == player.groundY)
            {
                player.setState('idle');
                player.hardHit = false;
            }
        },
    
        onKeyUp: (input) => {},
    
        onKeyDown: (input) => {},
    }
}

const swordOutState = (player) => {
    return {
        enter: () => {
            player.setAnimationId('sword_out');
            player.shouldCombo = true;
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.setState('swordAttack');
        },
    
        onKeyUp: (input) => {
            if (input === 'space')
                player.shouldCombo = false;
            if (input === 'arrowright' || input === 'arrowleft')
                player.xVelocity = 0;
        },

        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.xVelocity = player.speed;
        },
    }
}

const swordAttackState = (player) => {
    let step = 2;

    return {
        enter: () =>
        {
            player.setAnimationId('sword_attack');
            player.damage = Math.random() < 0.05 ? 50 : 10;
            player.isAttacking = true;
        },
    
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
            {
                if (player.shouldCombo)
                {
                    player.setAnimationId('sword_combo');
                    player.x += player.direction === 'right' ? step : -step;
                    player.shouldCombo = false;
                }
                else
                    player.setState('swordIn');
            }
        },
    
        onKeyUp: (input) => {
            if (input === 'space')
                player.shouldCombo = false;
            if (input === 'arrowright' || input === 'arrowleft')
                player.xVelocity = 0;
        },
    
        onKeyDown: (input) =>
        {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.xVelocity = player.speed;
        },
    }
}

const swordInState = (player) => {
    return {
        enter: () => {
            player.setAnimationId('sword_out');
            player.animations[player.animation_id].reverse();
            player.damage = 10;
            player.isAttacking = false;
        },
        
        update: () => {
            const finished = player.animations[player.animation_id].finished();
            if (finished)
                player.setState(player.xVelocity === 0 ? 'idle' : 'running');
        },

        onKeyUp: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.xVelocity = 0;
        },

        onKeyDown: (input) => {
            if (input !== 'arrowright' && input !== 'arrowleft')
                return ;
            player.direction = input === 'arrowright' ? 'right' : 'left';
            player.xVelocity = player.speed;
        },
    }
}

const victoryState = (player) => {
    return {
        enter: () => {
            player.stop();
            player.setAnimationId(Math.random() < 0.5 ? 'win1' : 'win2');
            player.slowAnimation = true;
        },
        update: () => {},
        onKeyUp: (input) => {},
        onKeyDown: (input) => {},
    }
}

export function setStates(player) 
{
    return {
        'idle': idleState(player),
        'walking': walkingState(player),
        'jakeRollIn': jakeRollInState(player),
        'jakeRoll': jakeRollState(player),
        'jakeRollOut': jakeRollOutState(player),
        'running': runningState(player),
        'jumping': jumpingState(player),
        'falling': fallingState(player),
        'landing': landingState(player),
        'ducking': duckingState(player),
        'shieldOut': shieldOutState(player),
        'shieldIn': shieldInState(player),
        'shieldWalk': shieldWalkState(player),
        'swordOut': swordOutState(player),
        'swordAttack': swordAttackState(player),
        'swordIn': swordInState(player),
        'hurt': hurtState(player),
        'die': dieState(player),
        'victory': victoryState(player),
    }
}