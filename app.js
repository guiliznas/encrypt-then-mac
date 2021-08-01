var app = require("http").createServer(resposta); // Criando o servidor
var fs = require("fs"); // Sistema de arquivos
var io = require("socket.io")(app); // Socket.IO
var moment = require('moment');

var usuarios = {}; // Dicionario de usuários

const _PORT_ = 3000;
app.listen(_PORT_);

var CryptoJS = require('crypto-js');
var salt = CryptoJS.lib.WordArray.random(128 / 8);
var key128Bits = CryptoJS.PBKDF2("senha super secreta", salt, {
  keySize: 128 / 32
});

global.K1 = salt.toString(); //"K1";
console.log("K1", global.K1);
global.K2 = key128Bits.toString(); //"K2"; // Chave para AES CTR com 128 bits;
console.log("K2", global.K2);

console.log(`Aplicação está em execução na port ${_PORT_}`);

// Função principal de resposta as requisições do servidor
function resposta(req, res) {
  var arquivo = "";
  if (req.url == "/") {
    arquivo = __dirname + "/index.html";
  } else {
    arquivo = __dirname + req.url;
  }
  fs.readFile(arquivo, function (err, data) {
    if (err) {
      res.writeHead(404);
      return res.end("Página ou arquivo não encontrados");
    }

    res.writeHead(200);
    res.end(data);
  });
}

io.on("connection", function (socket) {
  // Método de resposta ao evento de entrar
  socket.on("entrar", function (nome, callback) {
    if (!(nome in Object.keys(usuarios))) {
      const user = { nome };
      user.K1 = global.K1;
      user.K2 = global.K2;
      socket.user = user;
      usuarios[user.nome] = socket; // Adicionadno o nome de usuário ao dicionario armazenada no servidor

      var mensagem = `[${pegarDataAtual()}] ${nome} entrou na sala`;
      var obj_mensagem = { msg: mensagem, tipo: "sistema" };
      
      callback(user);

      io.sockets.emit("atualizar usuarios", Object.keys(usuarios)); // Enviando a nova lista de usuários
      io.sockets.emit("atualizar mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário
    } else {
      callback(null);
    }
  });

  socket.on("enviar mensagem", function ({usuario, mensagem, chave}, callback) {
    var usuario = usuario.nome;
    if (usuario == null) usuario = ""; // Caso não tenha um usuário, a mensagem será enviada para todos da sala

    const msg = {
      usuario: {nome: socket.user.nome},
      mensagem,
      chave,
    }

    if (usuario == "") {
      io.sockets.emit("atualizar mensagens", msg);
    } else {
      msg.tipo = "privada";
      // Enviando a mensagem para o usuario origem;
      socket.emit("atualizar mensagens", msg);
      // Enviando a mensagem para o usuario destino;
      usuarios[usuario].emit("atualizar mensagens", msg);
    }

    callback();
  });

  socket.on("disconnect", function () {
    if (!socket.user) {
      console.log("Usuário não encontrado para desconectar.");
      return;
    }
    delete usuarios[socket.user.nome];
    var mensagem = `[${pegarDataAtual()}] ${socket.user.nome} saiu da sala`;
    var obj_mensagem = { msg: mensagem, tipo: "sistema" };

    // No caso da saída de um usuário, a lista de usuários é atualizada
    // junto de um aviso em mensagem para os participantes da sala
    io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
    io.sockets.emit("atualizar mensagens", obj_mensagem);

  });
});

// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual() {
  return moment().format('DD/MM/YYYY HH:mm')
}
