/**
 * Représente un chat (pas l'animal, mais pour les messages)
 */
class Chat {

    /**
     * @param users Les utilisateurs présents dans le chat (peut changer)
     */
    constructor () {
        // tableau d'objets (voir format fonction addMessage)
        //
        this.messages = [];
        this.maxMessages = 100;
    }

    /**
     * @param senderUser L'utilisateur qui envoie le message
     * @param content Le texte du message
     * @param type Le type du message (CHAT_MESSAGE_TYPE, voir constants.js)
     * @param offer L'offre associée au message (facultatif)
     * @return Le message ajouté
     */
    addMessage (senderUser, content, type, offer = null) {
        this.messages.push({
            senderUser: senderUser,
            content: content,
            type: type,
            offer: offer,
            createdTime: Date.now()
        });

        if (this.messages.length > this.maxMessages.length)
            this.messages.shift();

        return this.messages[this.messages.length - 1];
    }
}

module.exports = Chat;
