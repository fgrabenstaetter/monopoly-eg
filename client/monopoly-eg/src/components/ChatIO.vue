<template>
    <div>
        <div id="msgChat" class="tchat-container">
            <div v-for="{senderUserID, content, createdTime, id} in messages" :key="id" :class="senderUserID == $parent.loggedUser.id ? 'msg-me' : 'msg-other'" :title="createdTime">
                <div class="msg-author">
                    {{senderUserID === -1 ? '[Serveur]' : $parent.idToNick(senderUserID)}}
                </div>
                {{content}}
            </div>
        </div>

        <div class="tchat-container">
            <form @submit.prevent="postMsg">
                <div class="input-group">
                    <input v-model="msg" class="form-control" type="text" placeholder="Votre message...">
                    <div class="input-group-append">
                        <span class="input-group-text" v-on:click="postMsg"><i class="fa fa-paper-plane"></i></span>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import {Howl} from 'howler'

/**
 * @vuese
 * @group Components
 * Chat du jeu (utilisé dans le lobby et dans le jeu)
 */
export default {
    name: 'ChatIO',
    props: {
        // @vuese
        // socket utilisé pour l'envoi de messages
        socket: {
            type: Object,
            required: true
        },
        // @vuese
        // Environnement dans lequel est utilisé le chat : 'lobby' ou 'game'
        env: {
            type: String,
            default: 'lobby'
        }
    },
    data() {
        return {
            // @vuese
            // Messages du chat
            messages: [],
            // Valeur de l'entrée textuelle (nouveau message)
            msg: '',
            // Elements audio du chat (i.e. son de notification)
            audio: {
                sfx: {
                    newMessage: null
                }
            }
        }
    },
    methods: {
        /**
         * @vuese
         * Envoi le contenu du nouveau message au serveur et vide la zone de saisie ('msg')
         */
        postMsg() {
            if (this.env === 'lobby')
                this.socket.emit('lobbyChatSendReq', { content: this.msg });
            else
                this.socket.emit('gameChatSendReq', { text: this.msg });
            
            this.msg = '';
        },

        /**
         * @vuese
         * Descend au bas de la zone de chat (pour afficher les derniers messages reçus)
         */
        scrollToBottom() {
            const element = this.$el.querySelector("#msgChat");
            element.scrollTop = element.scrollHeight;
        },

        /**
         * @vuese
         * Charge les effets sonores du chat
         */
        loadSfx() {
            this.audio.sfx.newMessage = new Howl({
                src: ['/assets/audio/sfx/when.mp3'],
                autoplay: false,
                loop: false,
                volume: 0.5
            });
        }
    },
    mounted() {
        this.loadSfx();

        if (this.env === 'lobby') {
            this.socket.on('lobbyChatReceiveRes', (mess) => {
                if (mess.senderUserID != -1 && mess.senderUserID != this.$parent.loggedUser._id) {
                    this.audio.sfx.newMessage.play();
                }
                this.messages.push(mess);
            });
        } else {
            this.socket.on('gameChatReceiveRes', (mess) => {
                if (mess.senderUserID != -1 && mess.senderUserID != this.$parent.loggedUser._id) {
                    this.audio.sfx.newMessage.play();
                }
                const formatMsg = {senderUserID: mess.playerID, content: mess.text, createdTime: mess.createdTime};
                this.messages.push(formatMsg);
            });
        }
    },
    updated() {
        this.scrollToBottom();
    }
}
</script>