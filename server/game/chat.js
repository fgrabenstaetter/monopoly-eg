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
     * @returns Le message ajouté si succès, false si limite de SPAM atteinte
     */
    addMessage (sender, text) {
        if (!this.canSend(sender))
            return false;

        this.messages.push({
            sender      : sender, // obj User ou Player
            text        : text, // text
            createdTime : Date.now()
        });

        if (this.messages.length > this.maxMessages.length)
            this.messages.shift();

        return this.messages[this.messages.length - 1];
    }

    /**
     * Limite le nombre de messages que peux envoyer un utilisauteur sur une certaine période
     * @returns true si sender peux envoyer une message, false sinon
     */
    canSend (sender) {
        const periodMaxNb = 3;
        const period = 4e3;

        let nb = 0;
        for (let i = this.messages.length - 1; i > 0; i --) {
            if (this.messages[i].sender === sender) {
                nb ++;
                if (nb === periodMaxNb && (Date.now() - this.messages[i].createdTime < period))
                    return false;
            }
        }

        return true;
    }
}

module.exports = Chat;
