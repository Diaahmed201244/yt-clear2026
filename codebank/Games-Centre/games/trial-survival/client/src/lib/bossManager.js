"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BossManager = void 0;
const enemies_1 = require("@/types/enemies");
class BossManager {
    constructor(canvas) {
        this.boss = null;
        this.attacks = [];
        this.minions = [];
        this.phase = 1;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.initializeBoss();
        this.initializeAttacks();
    }
    initializeBoss() {
        this.boss = {
            id: 'nightmare_boss',
            x: this.canvas.offsetWidth - 100,
            y: this.canvas.offsetHeight / 2,
            width: 80,
            height: 120,
            speed: 0.5,
            direction: Math.PI, // Facing left
            health: 300,
            maxHealth: 300,
            type: enemies_1.EnemyType.BOSS,
            lastAttack: 0,
            attackCooldown: 3000,
            isActive: true,
            damage: 50
        };
    }
    initializeAttacks() {
        this.attacks = [
            {
                id: 'laser_sweep',
                name: 'Laser Sweep',
                damage: 40,
                pattern: 'laser_sweep',
                cooldown: 5000,
                lastUsed: 0
            },
            {
                id: 'missile_rain',
                name: 'Missile Rain',
                damage: 30,
                pattern: 'missile_rain',
                cooldown: 7000,
                lastUsed: 0
            },
            {
                id: 'charge_attack',
                name: 'Charge Attack',
                damage: 60,
                pattern: 'charge_attack',
                cooldown: 8000,
                lastUsed: 0
            },
            {
                id: 'spawn_minions',
                name: 'Spawn Guards',
                damage: 0,
                pattern: 'spawn_minions',
                cooldown: 12000,
                lastUsed: 0
            }
        ];
    }
    update(playerX, playerY, deltaTime) {
        if (!this.boss || !this.boss.isActive)
            return;
        const now = Date.now();
        // Boss movement pattern
        this.updateBossMovement(playerX, playerY);
        // Check if boss should attack
        if (now - this.boss.lastAttack > this.boss.attackCooldown) {
            this.executeAttack(playerX, playerY);
            this.boss.lastAttack = now;
        }
        // Update minions
        this.updateMinions(playerX, playerY, deltaTime);
        // Phase transition based on health
        this.updatePhase();
    }
    updateBossMovement(playerX, playerY) {
        if (!this.boss)
            return;
        // Boss follows player but maintains distance
        const dx = playerX - this.boss.x;
        const dy = playerY - this.boss.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 200) {
            // Move closer to player
            this.boss.direction = Math.atan2(dy, dx);
            this.boss.x += Math.cos(this.boss.direction) * this.boss.speed;
            this.boss.y += Math.sin(this.boss.direction) * this.boss.speed;
        }
        else if (distance < 150) {
            // Move away from player
            this.boss.direction = Math.atan2(-dy, -dx);
            this.boss.x += Math.cos(this.boss.direction) * this.boss.speed;
            this.boss.y += Math.sin(this.boss.direction) * this.boss.speed;
        }
        // Keep boss within canvas bounds
        this.boss.x = Math.max(this.boss.width, Math.min(this.canvas.offsetWidth - this.boss.width, this.boss.x));
        this.boss.y = Math.max(this.boss.height, Math.min(this.canvas.offsetHeight - this.boss.height, this.boss.y));
    }
    executeAttack(playerX, playerY) {
        if (!this.boss)
            return;
        const now = Date.now();
        const availableAttacks = this.attacks.filter(attack => now - attack.lastUsed > attack.cooldown);
        if (availableAttacks.length === 0)
            return;
        const selectedAttack = availableAttacks[Math.floor(Math.random() * availableAttacks.length)];
        selectedAttack.lastUsed = now;
        switch (selectedAttack.pattern) {
            case 'laser_sweep':
                this.executeLaserSweep();
                break;
            case 'missile_rain':
                this.executeMissileRain(playerX, playerY);
                break;
            case 'charge_attack':
                this.executeChargeAttack(playerX, playerY);
                break;
            case 'spawn_minions':
                this.spawnMinions();
                break;
        }
    }
    executeLaserSweep() {
        // Create laser sweep effect - this would create temporary hazards
        console.log('Boss executes Laser Sweep!');
    }
    executeMissileRain(playerX, playerY) {
        // Create multiple missile projectiles targeting player area
        console.log('Boss executes Missile Rain!');
    }
    executeChargeAttack(playerX, playerY) {
        if (!this.boss)
            return;
        // Boss charges directly at player
        this.boss.direction = Math.atan2(playerY - this.boss.y, playerX - this.boss.x);
        this.boss.speed = 4; // Temporary speed boost
        setTimeout(() => {
            if (this.boss)
                this.boss.speed = 0.5; // Return to normal speed
        }, 2000);
        console.log('Boss executes Charge Attack!');
    }
    spawnMinions() {
        // Spawn guard minions around the boss
        for (let i = 0; i < 2; i++) {
            const angle = (i * Math.PI) / 2;
            const minion = {
                id: `minion_${Date.now()}_${i}`,
                x: this.boss.x + Math.cos(angle) * 60,
                y: this.boss.y + Math.sin(angle) * 60,
                width: 30,
                height: 40,
                speed: 2,
                direction: 0,
                health: 50,
                maxHealth: 50,
                type: enemies_1.EnemyType.GUARD,
                lastAttack: 0,
                attackCooldown: 1500,
                isActive: true,
                damage: 25
            };
            this.minions.push(minion);
        }
        console.log('Boss spawns minions!');
    }
    updateMinions(playerX, playerY, deltaTime) {
        this.minions.forEach(minion => {
            if (!minion.isActive)
                return;
            // Minions pursue player aggressively
            const dx = playerX - minion.x;
            const dy = playerY - minion.y;
            minion.direction = Math.atan2(dy, dx);
            minion.x += Math.cos(minion.direction) * minion.speed;
            minion.y += Math.sin(minion.direction) * minion.speed;
        });
        // Remove inactive minions
        this.minions = this.minions.filter(minion => minion.isActive);
    }
    updatePhase() {
        if (!this.boss)
            return;
        const healthPercentage = this.boss.health / this.boss.maxHealth;
        if (healthPercentage <= 0.3 && this.phase < 3) {
            this.phase = 3;
            this.boss.attackCooldown = 2000; // Faster attacks
            this.boss.speed = 1; // Faster movement
        }
        else if (healthPercentage <= 0.6 && this.phase < 2) {
            this.phase = 2;
            this.boss.attackCooldown = 2500; // Slightly faster attacks
        }
    }
    render() {
        if (!this.ctx)
            return;
        // Render boss
        if (this.boss && this.boss.isActive) {
            this.ctx.save();
            // Boss body
            this.ctx.fillStyle = '#660000';
            this.ctx.fillRect(this.boss.x, this.boss.y, this.boss.width, this.boss.height);
            // Boss eyes
            this.ctx.fillStyle = '#FF0000';
            this.ctx.fillRect(this.boss.x + 10, this.boss.y + 20, 15, 15);
            this.ctx.fillRect(this.boss.x + this.boss.width - 25, this.boss.y + 20, 15, 15);
            // Boss health bar
            const healthBarWidth = this.boss.width;
            const healthBarHeight = 8;
            const healthPercentage = this.boss.health / this.boss.maxHealth;
            this.ctx.fillStyle = '#330000';
            this.ctx.fillRect(this.boss.x, this.boss.y - 15, healthBarWidth, healthBarHeight);
            this.ctx.fillStyle = healthPercentage > 0.3 ? '#FF0000' : '#FF6666';
            this.ctx.fillRect(this.boss.x, this.boss.y - 15, healthBarWidth * healthPercentage, healthBarHeight);
            // Phase indicator
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(`BOSS - Phase ${this.phase}`, this.boss.x, this.boss.y - 20);
            this.ctx.restore();
        }
        // Render minions
        this.minions.forEach(minion => {
            if (!minion.isActive)
                return;
            this.ctx.save();
            this.ctx.fillStyle = '#444444';
            this.ctx.fillRect(minion.x, minion.y, minion.width, minion.height);
            // Minion health bar
            const healthPercentage = minion.health / minion.maxHealth;
            this.ctx.fillStyle = '#222222';
            this.ctx.fillRect(minion.x, minion.y - 8, minion.width, 4);
            this.ctx.fillStyle = '#FF4444';
            this.ctx.fillRect(minion.x, minion.y - 8, minion.width * healthPercentage, 4);
            this.ctx.restore();
        });
    }
    getBoss() {
        return this.boss;
    }
    getMinions() {
        return this.minions;
    }
    getPhase() {
        return this.phase;
    }
    damageMinion(minionId, damage) {
        const minion = this.minions.find(m => m.id === minionId);
        if (minion) {
            minion.health -= damage;
            if (minion.health <= 0) {
                minion.isActive = false;
                return true; // Minion destroyed
            }
        }
        return false;
    }
    damageBoss(damage) {
        if (this.boss) {
            this.boss.health -= damage;
            if (this.boss.health <= 0) {
                this.boss.isActive = false;
                return true; // Boss defeated
            }
        }
        return false;
    }
    checkCollisionWithPlayer(playerX, playerY, playerWidth, playerHeight) {
        // Check boss collision
        if (this.boss && this.boss.isActive) {
            if (playerX < this.boss.x + this.boss.width &&
                playerX + playerWidth > this.boss.x &&
                playerY < this.boss.y + this.boss.height &&
                playerY + playerHeight > this.boss.y) {
                return this.boss;
            }
        }
        // Check minion collisions
        for (const minion of this.minions) {
            if (!minion.isActive)
                continue;
            if (playerX < minion.x + minion.width &&
                playerX + playerWidth > minion.x &&
                playerY < minion.y + minion.height &&
                playerY + playerHeight > minion.y) {
                return minion;
            }
        }
        return null;
    }
    cleanup() {
        this.boss = null;
        this.minions = [];
        this.attacks = [];
    }
}
exports.BossManager = BossManager;
