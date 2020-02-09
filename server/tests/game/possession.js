// Possession: représente une possession (ou propriété, bien)
class Possession {

    constructor (name) {
        this.name = name;
        const [description, price, rentPrice] = this.findInfos(name);
        this.description = description;
        this.price = price;
        this.rentPrice = rentPrice;
    }

    // @return tableau de [description, price, rentPrice]
    findInfos (name) {
        // trouver les infos d'une possession à partir de son nom
        // exemple
        let description, price, rentPrice;
        switch (name) {
            case 'McDonald\'s':
                description = 'McDonald\'s Corporation is an American fast food company, founded in 1940 as a restaurant operated by Richard and Maurice McDonald, in San Bernardino, California, United States.';
                price = 2e4; // 20 000€
                rentPrice = 2e3; // 2000€
                break;
            default:
                console.error('Nom de possession non supporté: ' + name);
                process.exit(1);
        }

        return [description, price, rentPrice];
    }
}

module.exports = Possession;
