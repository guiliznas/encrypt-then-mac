export default class User {
    constructor({nome: string}) {
        this.nome = nome
    }

    enviarMensagem() {

        return {
            usuario: {},
            mensagem: "",
            chave: "",
        }
    }

    receberMensagem({usuario, mensagem, chave}) {

        return true
    }
}