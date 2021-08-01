if (!CryptoJS) {
  var CryptoJS = require('crypto-js');
}

class User {
  constructor({ nome, K1, K2 }) {
    this.nome = nome
    this.K1 = K1 // IV -> público
    this.K2 = K2 // Chave
  }
  
  enviarMensagem(usuario, msg) {
    const msgCifrada = this._encrypt(msg);
    const msgMac = this._mac(msgCifrada);
    const msgFinal = `${msgCifrada}::${msgMac}`;
    return {
      usuario: { nome: usuario },
      mensagem: msgFinal,
      chave: this._encrypt(this.K2, this.K1), // keyWrapped
    }
  }

  _encrypt(msg, key = this.K2) {
    const result = CryptoJS.AES.encrypt(msg, key, {
      mode: CryptoJS.mode.CTR,
    }).toString();
    // AES modo CTR com 128 bits;
    return result;
  }

  _mac(msg, key = this.K1) {
    // HMacSHA256
    const result = CryptoJS.HmacSHA256(msg, key).toString();
    return result
  }

  _decrypt(msg, key = this.K2) {
    const result = CryptoJS.AES.decrypt(msg, key, {
      mode: CryptoJS.mode.CTR,
    }).toString(CryptoJS.enc.Utf8);
    // AES modo CTR com 128 bits;
    return result;
  }

  validarMensagem({ mensagem, chave }) {
    const [msgEncrypt, msgMac] = mensagem.split('::');

    const keyWrapped = this._decrypt(chave, this.K1)

    const msgDecifrada = this._decrypt(msgEncrypt, keyWrapped);

    const msgMacCompare = this._mac(msgEncrypt);

    if (msgMacCompare === msgMac) {
      return msgDecifrada
    }

    return false
  }
}

// Para os testes
// if (module) {
//   module.exports = User;
// }