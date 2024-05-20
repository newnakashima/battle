export class Item {
    constructor(name, effect) {
        this.name = name;
        this.effect = effect;
    }

    use(player) {
        this.effect(player);
    }
}