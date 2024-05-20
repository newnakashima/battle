import { enemies } from './enemies.mjs';
import { combatItems as items, dropItems } from './items.mjs';
import { Item } from './classes/Item.mjs';

const statePlaying = 0;
const statePaused = 1;
const stateGameOver = 2;
const availableStates = ["playing", "paused", "gameover"];
let gameState = availableStates[statePaused];
class Character {
    constructor(name, level, hp, attack, defense) {
        this.name = name;
        this.level = level;
        this.hp = hp;
        this.maxHp = hp;
        this.attack = attack;
        this.defense = defense;
        this.buffs = [];
        this.equipment = [];
    }

    getCalculatedAttack() {
        const buffs = this.buffs.reduce((a, b) => a + (b.type === 'attack' ? b.value : 0), 0);
        const equipment = this.equipment.reduce((a, b) => a + b.attack, 0);
        return this.attack + buffs + equipment;
    }

    takeDamage(damage, mustAlive = false) {
        const actualDamage = Math.max(damage - this.defense, 1);
        this.hp -= actualDamage;
        if (this.hp < 0) this.hp = 0;
        if (mustAlive && !this.isAlive()) this.hp = 1;
        return actualDamage;
    }

    isAlive() {
        return this.hp > 0;
    }
}

class Player extends Character {
    constructor() {
        super("プレイヤー", 1, 100, 10, 5);
        this.exp = 0;
        this.gold = 0;
        this.inventory = new Inventory([]);
    }

    gainExp(amount) {
        this.exp += amount;
        const nextLevelExp = this.level * 100;
        if (this.exp >= nextLevelExp) {
            this.levelUp();
            this.exp -= nextLevelExp;
        }
    }

    levelUp() {
        this.level++;
        this.maxHp += 20;
        this.hp = this.maxHp;
        this.attack += 5;
        this.defense += 2;
    }

    gainGold(amount) {
        this.gold += amount;
    }

    addItem(item) {
        this.inventory.add(item);
    }

    useItem(index) {
        this.inventory.use(index, this);
    }
}

class Enemy extends Character {
    constructor(playerLevel) {
        // playerLevel の +- 3 の範囲でランダムなレベルの敵を生成
        let level = Math.max(1, playerLevel + Math.floor(Math.random() * 7) - 3);
        // levelは必ず1以上100以下になるように調整
        level = Math.min(100, level);
        // 該当するレベルのenemyを取得
        const enemy = enemies.find(enemy => enemy.level === level);
        super(enemy.name, enemy.level, enemy.hp, enemy.attack, enemy.defense);

        document.querySelector("#enemy-name").textContent = enemy.name;
    }
}

class Inventory {
    constructor(inventoryItems) {
        this.inventoryItems = inventoryItems;
    }

    add(item) {
        const existingItem = this.inventoryItems.find(inventoryItem => inventoryItem.item.name === item.name);
        if (existingItem) {
            existingItem.count++;
            return;
        }

        this.inventoryItems.push(new InventoryItem(item, 1));
    }

    use(index, player) {
        this.inventoryItems[index].use(player);
        updateStats();
    }
}


class InventoryItem {
    constructor(item, count) {
        this.item = item;
        this.count = count;
    }

    use(player) {
        if (this.count <= 0) {
            throw new Error("アイテムがありません");
        };

        this.item.use(player);
        this.count--;
    }
}

function getRandomItem() {
    if (Math.random() < 0.1) {
        const item = dropItems[Math.floor(Math.random() * items.length)];
        return new Item(item.name, item.effect);
    }
    return null;
}

const player = new Player();
let enemy = new Enemy(player.level);

const playerStats = document.getElementById("playerStats");
const enemyStats = document.getElementById("enemyStats");
const inventoryItems = document.getElementById("items");
const toggleButton = document.getElementById("toggleButton");
const messages = document.getElementById("messages");

let gameInterval;

function updateStats() {
    playerStats.textContent = `レベル: ${player.level} | HP: ${player.hp}/${player.maxHp} | 攻撃力: ${player.attack} | 防御力: ${player.defense} | 経験値: ${player.exp} | ゴールド: ${player.gold}`;
    enemyStats.textContent = `レベル: ${enemy.level} | HP: ${enemy.hp}/${enemy.maxHp} | 攻撃力: ${enemy.attack} | 防御力: ${enemy.defense}`;
    const listItemsAfterFirst = Array.from(inventoryItems.children).slice(1);
    listItemsAfterFirst.forEach(item => inventoryItems.removeChild(item));
    player.inventory.inventoryItems.forEach((item, index) => {
        if (item.count <= 0) {
            return;
        }

        const itemLine = document.createElement("li");
        const itemName = document.createElement("button");
        itemName.textContent = item.item.name;
        itemName.disabled = item.item.effect === undefined;
        itemName.onclick = () => player.useItem(index);
        const itemCount = document.createElement("span");
        itemCount.textContent = `${item.count}`;
        itemLine.appendChild(itemName);
        itemLine.appendChild(itemCount);
        inventoryItems.appendChild(itemLine);
    });
}

function addMessage(text) {
    const message = document.createElement("li");
    message.textContent = text;
    messages.insertBefore(message, messages.firstChild);
    const children = messages.children;
    if (children.length > 100) {
        messages.removeChild(children[children.length - 1]);
    }

}

function battleTurn() {
    if (!player.isAlive() || !enemy.isAlive()) {
        clearInterval(gameInterval);
        return;
    }

    const playerDamage = enemy.takeDamage(player.getCalculatedAttack());
    const enemyDamage = player.takeDamage(enemy.getCalculatedAttack(), true);

    addMessage(`${player.name}は${playerDamage}のダメージを与えた。${enemy.name}は${enemyDamage}のダメージを与えた。`);

    if (!enemy.isAlive()) {
        player.gainExp(enemy.level * 10);
        player.gainGold(enemy.level * 5);
        const item = getRandomItem();
        if (item) {
            player.addItem(item);
            addMessage(`${enemy.name}は死んだ！経験値とゴールドを獲得し、アイテム「${item.name}」を手に入れた。`);
        } else {
            addMessage(`${enemy.name}は死んだ！経験値とゴールドを獲得した。`);
        }
        enemy = new Enemy(player.level);
    } else if (!player.isAlive()) {
        addMessage(`${player}は死んだ！`);
    }

    updateStats();
}

toggleButton.addEventListener("click", () => {
    if (gameState === availableStates[statePlaying]) {
        clearInterval(gameInterval);
        gameState = availableStates[statePaused];
        toggleButton.textContent = "探索";
    } else if (gameState === availableStates[statePaused]) {
        gameInterval = setInterval(battleTurn, 100);
        gameState = availableStates[statePlaying];
        toggleButton.textContent = "停止";
    }
});

updateStats();
