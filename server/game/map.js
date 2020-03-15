const Cell = require('./cell');
const Constants = require('./../lib/constants');
const Property = require('./property');


class Map {
    constructor (cellsMeta, propertiesMeta) {
        this.cells = [];
        this.publicCompaniesCount = 0;
        this.colorsCount = {}

        for (let color in Constants.STREET_COLORS)
            this.colorsCount[color] = 0;

        let properties = this.loadProperties(propertiesMeta);
        for (let cellMeta of cellsMeta) {
            let property = properties[cellMeta.token];
            let cell = new Cell(
                cellMeta.id,
                cellMeta.token,
                cellMeta.name,
                cellMeta.description,
                cellMeta.type,
                property
            );

            this.cells.push(cell);

            if (property != null) {
                if (property.type == Constants.PROPERTY_TYPES.STREET)
                    this.colorsCount[property.color] = this.colorsCount[property.color] + 1;

                if (property.type == Constants.PROPERTY_TYPES.PUBLIC_COMPANY)
                    this.publicCompaniesCount = this.publicCompaniesCount + 1;
            }
        }

        this.cellStats = {};
        for (let cell of this.cells) {

        }
    }

    loadProperties (propertiesMeta) {
        let properties = {};
        for (let propertyMeta of propertiesMeta) {
            let property = new Property(propertyMeta);
            properties[property.token] = property;
        }
        return properties;
    }

    /**
     * retourne 2 nombres de 1 a 6, representant 2 des
     */
    throwDices () {
        return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1]
    }

    /**
     * @param token le token de la cellule
     */
    getCellByToken(token) {
        for (let cell of this.cells)
            if (cell.token == token)
                return cell;
    }

    /**
     * @param id le nombre d'ordre de la cellule
     */
    getCellById(id) {
        for (let cell of this.cells)
            if (cell.id == id)
                return cell;
    }

    /**
     * @param player le joueur
     * @param cellsCount le nombre de cellules a avancer ou devancer
     * bouge un joueur par (int) cellsCount cellules relativement a sa position courante
     */
    movePlayerRelative (player, cellsCount) {
        let totalCellsCount = this.cells.length;
        let currentCell = player.currentCell;
        let nextCellId = currentCell.id + cellsCount;

        // si c'est un avancement et on a parcouru toutes les cellules,
        // on doit recommencer par la cellule 0
        if (nextCellId > totalCellsCount)
            nextCellId = nextCellId - totalCellsCount;

        // si c'est un devancement et on est alle plus loin en derriere que le debut,
        // il faut passer par les dernieres cellules
        if (nextCellId < 0)
            nextCellId = totalCellsCount + nextCellId;

        player.currentCell = this.getCellById(nextCellId);
    }

    /**
     * @param player le joueur
     * @param cellToken le token de la cellule ou il faut bouger
     */
    movePlayerAbsolute (player, cellToken) {
        let cell = this.getCellByToken(cellToken);
        player.currentCell = cell;
    }
}

module.exports = Map;
