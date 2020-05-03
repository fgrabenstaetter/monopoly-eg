/**
 * Représente un chat (pas l'animal, mais pour les messages)
 */
class Chat {

    /**
     * @param users Les utilisateurs présents dans le chat (peut changer)
     */
    constructor () {
        // tableau d'objets (voir format fonction addMessage)
        this.messages = [];
        this.maxMessages = 100;
    }

    /**
     * @param sender L'utilisateur qui envoie le message (ou null si message du serveur)
     * @param text Le texte du message
     * @returns Le message ajouté
     */
    addMessage (sender, text) {
        this.messages.push({
            sender      : sender, // obj User ou Player
            text        : text, // text
            createdTime : Date.now()
        });

        if (this.messages.length > this.maxMessages.length)
            this.messages.shift();

        return this.messages[this.messages.length - 1];
    }
}

module.exports = Chat;
