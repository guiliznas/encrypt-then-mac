class User {
  constructor({ nome, keyMaster }) {
    this.nome = nome

    this.keyMaster = keyMaster
  }

  /**
   * Recria as chaves utilizadas no processo do encrypt-then-mac,
   * de forma aleatoria.
   * @returns Promise<Boolean>
   */
  _atualizarChaves() {
    return new Promise((resolve) => {
      // Gerando uma chave aleatoria de 128bits = 8 bytes.
      var salt = CryptoJS.lib.WordArray.random(128 / 8);
      var k2 = CryptoJS.PBKDF2(this.keyMaster, salt, {
        keySize: 128 / 32
      }).toString();
      var k1 = CryptoJS.PBKDF2(this.keyMaster, k2, {
        keySize: 128 / 32
      }).toString();
  
      this.K2 = k2;
      this.K1 = k1;

      resolve(true)
    })
  }
  
  /**
   * Montar pacote para enviar mensagem cifrada.
   * @param {String} usuario 
   * @param {String} msg 
   * @returns {Object} {usuario: str, mensagem: str, chave: str}
   */
  async enviarMensagem(usuario, msg) {
    // Chama a atualizacao das chaves,
    // de forma totalmente aleatoria.
    await this._atualizarChaves();
    // Cifra a mensagem original.
    const msgCifrada = this._encrypt(msg, this.K2);
    // Calcula o MAC da mensagem cifrada.
    const msgMac = this._mac(msgCifrada, this.K1);
    // Concatena a mensagem cifrada com o mac.
    const msgFinal = `${msgCifrada}::${msgMac}`;
    // console.log(`Enviando nova mensagem.\nK1: ${this.K1}\nK2: ${this.K2}\n`);

    // Retorna os valores das chaves.
    return {
      usuario: usuario,
      // blocoMsgEncryptThenMac
      mensagem: msgFinal,
      // keyWrapped
      chave: this._encrypt(this.K2, this.keyMaster),
    }
  }

  /**
   * Cifrar um texto com uma chave, utilizando o metodo AES no modo CTR.
   * @param {String} msg 
   * @param {String} key 
   * @returns {String} Mensagem cifrada
   */
  _encrypt(msg, key = this.K2) {
    // AES modo CTR;
    const result = CryptoJS.AES.encrypt(msg, key, {
      mode: CryptoJS.mode.CTR,
    }).toString();
    return result;
  }

  /**
   * Decifra um texto com uma chave
   * @param {String} msg 
   * @param {String} key 
   * @returns {String} Mensagem original
   */
  _decrypt(msg, key = this.K2) {
    // AES modo CTR.
    const result = CryptoJS.AES.decrypt(msg, key, {
      mode: CryptoJS.mode.CTR,
    }).toString(CryptoJS.enc.Utf8);
    return result;
  }

  /**
   * Calcula o mac de um texto com uma chave
   * @param {String} msg 
   * @param {String} key 
   * @returns {String} MAC
   */
  _mac(msg, key = this.K1) {
    // HMacSHA256
    const result = CryptoJS.HmacSHA256(msg, key).toString();
    return result
  }

  /**
   * Validar o bloco de mensagem recebido.
   * @param {String} param {mensagem: str, chave: str} 
   * @returns {String/Boolean} Retorna a mensagem original ou false.
   */
  validarMensagem({ mensagem, chave }) {
    // Separa a mensagem cifrada do mac.
    const [msgEncrypt, msgMac] = mensagem.split('::');

    // Decifra o k2.
    const k2 = this._decrypt(chave, this.keyMaster);

    // Recalcula o k1.
    const k1 = CryptoJS.PBKDF2(this.keyMaster, k2, {
      keySize: 128 / 32
    }).toString();

    // console.log(`\nRecebendo nova mensagem.\nK1: ${k1}\nK2: ${k2}`);

    // Recalcula o mac para comparacao.
    const msgMacCompare = this._mac(msgEncrypt, k1);

    // Compara os dois macs, para garantir integridade.
    if (msgMacCompare === msgMac) {
      const msgDecifrada = this._decrypt(msgEncrypt, k2);
      return msgDecifrada
    }

    return false
  }
}

// Para os testes
// module.exports = User;