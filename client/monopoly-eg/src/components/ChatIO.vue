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
export default {
    name: 'ChatIO',
    props: {
        socket: {
            type: Object,
            required: true
        },
        env: {
            type: String,
            default: 'lobby'
        }
    },
    data() {
        return {
            messages: [],
            msg: ''
        }
    },
    methods: {
        postMsg() {
            if (this.env === 'lobby')
                this.socket.emit('lobbyChatSendReq', { content: this.msg });
            else
                this.socket.emit('gameChatSendReq', { text: this.msg });
            
            this.msg = '';
        },
        scrollToBottom() {
            const element = this.$el.querySelector("#msgChat");
            element.scrollTop = element.scrollHeight;
        }
    },
    mounted() {
        this.socket.on('lobbyChatReceiveRes', (mess) => {
            // if (mess.senderUserID != loggedUser._id) {
            //     newMessageSfx.play();
            // }
            this.messages.push(mess);
        });
    },
    updated() {
        this.scrollToBottom();
    }
}
</script>