import { Item } from "./classes/Item.mjs";
export const combatItems = [
    new Item("包帯", player => { player.hp = Math.min(player.maxHp, player.hp + 30); }),
    new Item("紫色の薬草", player => { player.hp = Math.min(player.maxHp, player.hp + 200); }),
    new Item("覚醒作用と多幸感をもたらす異世界の粉末", player => { player.hp = player.maxHp; }),
    new Item("ステロイド", player => { player.attack += 5; }),
    new Item("皮下シリコン", player => { player.defense += 3; }),
    new Item("火炎瓶", player => { if (enemy.isAlive()) { addMessage(`${player.name}は火炎瓶を投げた。`); enemy.takeDamage(20, true); } }),
    new Item("手榴弾", player => { if (enemy.isAlive()) { enemy.takeDamage(100, true); } }),
    new Item("RPG", player => { if (enemy.isAlive()) { enemy.takeDamage(200, true); } }),
    new Item("波動砲", player => { if (enemy.isAlive()) { enemy.takeDamage(700, true); } }),
];

export const dropItems = [
    new Item("魔物の肉片"),
    new Item("けだものの骨髄"),
    new Item("視神経の絡みついた大きな眼球"),
    new Item("血のついた皮膚"),
    new Item("悪臭を放つ臓物"),
    new Item("鋭利な骨の破片"),
    new Item("龍の生首"),
];