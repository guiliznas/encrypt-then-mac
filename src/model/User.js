var CryptoJS = require('crypto-js');

module.exports = class User {
  constructor({ nome }) {
    this.nome = nome
  }

  enviarMensagem(msg) {
    const msgCifrada = this._encrypt(msg);
    const msgMac = this._mac(msgCifrada);
    const msgFinal = `${msgCifrada}::${msgMac}`;
    return {
      usuario: { nome: this.nome },
      mensagem: msgFinal,
      chave: this._encrypt(global.K2, global.K1),
    }
  }

  _encrypt(msg, key = global.K2) {
    const result = CryptoJS.AES.encrypt(msg, key).toString();
    // AES modo CTR com 128 bits;
    return result;
  }

  _mac(msg, key = global.K1) {
    // HMacSHA256
    const result = CryptoJS.HmacSHA256(msg, key).toString();
    return result
  }

  _decrypt(msg, key = global.K2) {
    const result = CryptoJS.AES.decrypt(msg, key).toString(CryptoJS.enc.Utf8);
    // AES modo CTR com 128 bits;
    return result;
  }

  validarMensagem({ usuario, mensagem, chave }) {
    const [msgEncrypt, msgMac] = mensagem.split('::');

    const keyWrapped = this._decrypt(chave, global.K1)

    const msgDecifrada = this._decrypt(msgEncrypt, keyWrapped);

    const msgMacCompare = this._mac(msgEncrypt);

    if (msgMacCompare === msgMac) {
      return msgDecifrada
    }

    return false
  }
}


// k1 = iv -> publico
// k2 = chave
// keyWrapped = cifrar k2 com k1
// quando connectar gera uma chave