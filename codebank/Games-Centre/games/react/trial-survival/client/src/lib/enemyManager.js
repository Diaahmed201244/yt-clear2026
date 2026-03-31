import { EnemyType, ObstacleType, PowerUpType } from "@/types/enemies";
export class EnemyManager {
    constructor(canvas) {
        this.enemies = [];
        this.obstacles = [];
        this.hazards = [];
        this.powerUps = [];
        this.canvas = null;
        this.ctx = null;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }
    createGuard(x, y) {
        return {
            id: `guard_${Date.now()}_${Math.random()}`,
            x,
            y,
            width: 40,
            height: 60,
            speed: 1.5,
            direction: 0,
            health: 100,
            maxHealth: 100,
            type: EnemyType.GUARD,
            lastAttack: 0,
            attackCooldown: 2000,
            isActive: true,
            damage: 25
        };
    }
    createSniper(x, y) {
        return {
            id: `sniper_${Date.now()}_${Math.random()}`,
            x,
            y,
            width: 35,
            height: 55,
            speed: 0.5,
            direction: 0,
            health: 80,
            maxHealth: 80,
            type: EnemyType.SNIPER,
            lastAttack: 0,
            attackCooldown: 3000,
            isActive: true,
            damage: 50
        };
    }
    createPatrolEnemy(x, y, patrolPath) {
        return {
            id: `patrol_${Date.now()}_${Math.random()}`,
            x,
            y,
            width: 45,
            height: 65,
            speed: 2,
            direction: 0,
            health: 120,
            maxHealth: 120,
            type: EnemyType.PATROL,
            lastAttack: 0,
            attackCooldown: 1500,
            patrolPath,
            currentPathIndex: 0,
            isActive: true,
            damage: 30
        };
    }
    createHunter(x, y) {
        return {
            id: `hunter_${Date.now()}_${Math.random()}`,
            x,
            y,
            width: 50,
            height: 70,
            speed: 3,
            direction: 0,
            health: 150,
            maxHealth: 150,
            type: EnemyType.HUNTER,
            lastAttack: 0,
            attackCooldown: 1000,
            isActive: true,
            damage: 40
        };
    }
    createWall(x, y, width, height) {
        return {
            id: `wall_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: ObstacleType.WALL,
            isDestructible: false
        };
    }
    createSpikes(x, y, width, height) {
        return {
            id: `spikes_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: ObstacleType.SPIKES,
            isDestructible: false,
            damage: 35,
            effect: 'slow',
            effectDuration: 2000
        };
    }
    createLaserBeam(x, y, width, height) {
        return {
            id: `laser_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: ObstacleType.LASER_BEAM,
            isDestructible: false,
            damage: 60,
            effect: 'stun',
            effectDuration: 1500
        };
    }
    createElectricFence(x, y, width, height) {
        return {
            id: `electric_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: ObstacleType.ELECTRIC_FENCE,
            isDestructible: false,
            damage: 40,
            effect: 'stun',
            effectDuration: 2000
        };
    }
    createLavaPool(x, y, width, height) {
        return {
            id: `lava_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: 'lava',
            damage: 20,
            effect: 'damage_over_time',
            isActive: true,
            activationPattern: 'constant'
        };
    }
    createPoisonGas(x, y, width, height) {
        return {
            id: `poison_${Date.now()}_${Math.random()}`,
            x,
            y,
            width,
            height,
            type: 'poison_gas',
            damage: 15,
            effect: 'damage_over_time',
            isActive: true,
            activationPattern: 'pulse'
        };
    }
    createSpeedBoost(x, y) {
        return {
            id: `speed_${Date.now()}_${Math.random()}`,
            x,
            y,
            type: PowerUpType.SPEED_BOOST,
            effect: 'Increases movement speed by 50%',
            duration: 10000,
            isCollected: false
        };
    }
    createShield(x, y) {
        return {
            id: `shield_${Date.now()}_${Math.random()}`,
            x,
            y,
            type: PowerUpType.SHIELD,
            effect: 'Grants temporary invincibility',
            duration: 8000,
            isCollected: false
        };
    }
    addEnemy(enemy) {
        this.enemies.push(enemy);
    }
    addObstacle(obstacle) {
        this.obstacles.push(obstacle);
    }
    addHazard(hazard) {
        this.hazards.push(hazard);
    }
    addPowerUp(powerUp) {
        this.powerUps.push(powerUp);
    }
    updateEnemies(playerX, playerY, deltaTime) {
        this.enemies.forEach(enemy => {
            if (!enemy.isActive)
                return;
            switch (enemy.type) {
                case EnemyType.GUARD:
                    this.updateGuard(enemy, playerX, playerY);
                    break;
                case EnemyType.PATROL:
                    this.updatePatrol(enemy);
                    break;
                case EnemyType.HUNTER:
                    this.updateHunter(enemy, playerX, playerY);
                    break;
                case EnemyType.SNIPER:
                    this.updateSniper(enemy, playerX, playerY);
                    break;
            }
        });
    }
    updateGuard(enemy, playerX, playerY) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 150) {
            enemy.direction = Math.atan2(dy, dx);
            enemy.x += Math.cos(enemy.direction) * enemy.speed;
            enemy.y += Math.sin(enemy.direction) * enemy.speed;
        }
    }
    updatePatrol(enemy) {
        if (!enemy.patrolPath || enemy.patrolPath.length === 0)
            return;
        const currentTarget = enemy.patrolPath[enemy.currentPathIndex || 0];
        const dx = currentTarget.x - enemy.x;
        const dy = currentTarget.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 20) {
            enemy.currentPathIndex = ((enemy.currentPathIndex || 0) + 1) % enemy.patrolPath.length;
        }
        else {
            enemy.direction = Math.atan2(dy, dx);
            enemy.x += Math.cos(enemy.direction) * enemy.speed;
            enemy.y += Math.sin(enemy.direction) * enemy.speed;
        }
    }
    updateHunter(enemy, playerX, playerY) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 300) {
            enemy.direction = Math.atan2(dy, dx);
            enemy.x += Math.cos(enemy.direction) * enemy.speed;
            enemy.y += Math.sin(enemy.direction) * enemy.speed;
        }
    }
    updateSniper(enemy, playerX, playerY) {
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        enemy.direction = Math.atan2(dy, dx);
    }
    checkPlayerEnemyCollision(playerX, playerY, playerWidth, playerHeight) {
        for (const enemy of this.enemies) {
            if (!enemy.isActive)
                continue;
            if (playerX < enemy.x + enemy.width &&
                playerX + playerWidth > enemy.x &&
                playerY < enemy.y + enemy.height &&
                playerY + playerHeight > enemy.y) {
                return enemy;
            }
        }
        return null;
    }
    checkPlayerObstacleCollision(playerX, playerY, playerWidth, playerHeight) {
        for (const obstacle of this.obstacles) {
            if (playerX < obstacle.x + obstacle.width &&
                playerX + playerWidth > obstacle.x &&
                playerY < obstacle.y + obstacle.height &&
                playerY + playerHeight > obstacle.y) {
                return obstacle;
            }
        }
        return null;
    }
    checkPlayerHazardCollision(playerX, playerY, playerWidth, playerHeight) {
        for (const hazard of this.hazards) {
            if (!hazard.isActive)
                continue;
            if (playerX < hazard.x + hazard.width &&
                playerX + playerWidth > hazard.x &&
                playerY < hazard.y + hazard.height &&
                playerY + playerHeight > hazard.y) {
                return hazard;
            }
        }
        return null;
    }
    checkPlayerPowerUpCollision(playerX, playerY, playerWidth, playerHeight) {
        for (const powerUp of this.powerUps) {
            if (powerUp.isCollected)
                continue;
            if (playerX < powerUp.x + 30 &&
                playerX + playerWidth > powerUp.x &&
                playerY < powerUp.y + 30 &&
                playerY + playerHeight > powerUp.y) {
                powerUp.isCollected = true;
                return powerUp;
            }
        }
        return null;
    }
    render() {
        if (!this.ctx || !this.canvas)
            return;
        this.renderObstacles();
        this.renderHazards();
        this.renderEnemies();
        this.renderPowerUps();
    }
    renderEnemies() {
        if (!this.ctx)
            return;
        this.enemies.forEach(enemy => {
            if (!enemy.isActive)
                return;
            this.ctx.save();
            switch (enemy.type) {
                case EnemyType.GUARD:
                    this.ctx.fillStyle = '#FF4444';
                    break;
                case EnemyType.SNIPER:
                    this.ctx.fillStyle = '#FF8800';
                    break;
                case EnemyType.PATROL:
                    this.ctx.fillStyle = '#8844FF';
                    break;
                case EnemyType.HUNTER:
                    this.ctx.fillStyle = '#FF0088';
                    break;
                case EnemyType.BOSS:
                    this.ctx.fillStyle = '#880000';
                    break;
            }
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            const healthBarWidth = enemy.width;
            const healthBarHeight = 6;
            const healthPercentage = enemy.health / enemy.maxHealth;
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth, healthBarHeight);
            this.ctx.fillStyle = '#00FF00';
            this.ctx.fillRect(enemy.x, enemy.y - 10, healthBarWidth * healthPercentage, healthBarHeight);
            this.ctx.restore();
        });
    }
    renderObstacles() {
        if (!this.ctx)
            return;
        this.obstacles.forEach(obstacle => {
            this.ctx.save();
            switch (obstacle.type) {
                case ObstacleType.WALL:
                    this.ctx.fillStyle = '#666666';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
                case ObstacleType.SPIKES:
                    this.ctx.fillStyle = '#AA4444';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.fillStyle = '#FFFFFF';
                    for (let i = 0; i < obstacle.width; i += 10) {
                        this.ctx.fillRect(obstacle.x + i, obstacle.y, 2, obstacle.height);
                    }
                    break;
                case ObstacleType.LASER_BEAM:
                    this.ctx.fillStyle = '#FF0000';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    this.ctx.shadowColor = '#FF0000';
                    this.ctx.shadowBlur = 10;
                    break;
                case ObstacleType.ELECTRIC_FENCE:
                    this.ctx.fillStyle = '#00FFFF';
                    this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
                    break;
            }
            this.ctx.restore();
        });
    }
    renderHazards() {
        if (!this.ctx)
            return;
        this.hazards.forEach(hazard => {
            if (!hazard.isActive)
                return;
            this.ctx.save();
            switch (hazard.type) {
                case 'lava':
                    this.ctx.fillStyle = '#FF4400';
                    this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                    this.ctx.shadowColor = '#FF4400';
                    this.ctx.shadowBlur = 20;
                    break;
                case 'poison_gas':
                    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
                    this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                    break;
                case 'quicksand':
                    this.ctx.fillStyle = '#DEB887';
                    this.ctx.fillRect(hazard.x, hazard.y, hazard.width, hazard.height);
                    break;
            }
            this.ctx.restore();
        });
    }
    renderPowerUps() {
        if (!this.ctx)
            return;
        this.powerUps.forEach(powerUp => {
            if (powerUp.isCollected)
                return;
            this.ctx.save();
            const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 1;
            this.ctx.scale(pulse, pulse);
            switch (powerUp.type) {
                case PowerUpType.SPEED_BOOST:
                    this.ctx.fillStyle = '#00FF00';
                    break;
                case PowerUpType.SHIELD:
                    this.ctx.fillStyle = '#0080FF';
                    break;
                case PowerUpType.INVISIBILITY:
                    this.ctx.fillStyle = '#8000FF';
                    break;
                case PowerUpType.HEALTH_POTION:
                    this.ctx.fillStyle = '#FF0080';
                    break;
            }
            this.ctx.fillRect(powerUp.x, powerUp.y, 30, 30);
            this.ctx.strokeStyle = '#FFFFFF';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(powerUp.x, powerUp.y, 30, 30);
            this.ctx.restore();
        });
    }
    getEnemies() {
        return this.enemies;
    }
    getObstacles() {
        return this.obstacles;
    }
    getHazards() {
        return this.hazards;
    }
    getPowerUps() {
        return this.powerUps;
    }
    removeEnemy(enemyId) {
        this.enemies = this.enemies.filter(enemy => enemy.id !== enemyId);
    }
    clearAll() {
        this.enemies = [];
        this.obstacles = [];
        this.hazards = [];
        this.powerUps = [];
    }
}
