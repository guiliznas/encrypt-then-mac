// Criando o servidor
var app = require("http").createServer(resposta);
// Sistema de arquivos
var fs = require("fs");
// Socket.IO
var io = require("socket.io")(app);
var moment = require('moment');

// Dicionario de usuários
var usuarios = {};
// Declaracao da chave principal
var CryptoJS = require('crypto-js');
global.keyMaster = CryptoJS.MD5("senha super secreta").toString();

const _PORT_ = 3000;
app.listen(_PORT_);
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
    // Verificar se o usuario nao esta logado
    if (!(nome in Object.keys(usuarios))) {
      // Salvando nome do usuario no socket
      socket.nome = nome;
      // Adicionadno o socket do usuário ao dicionario armazenada no servidor
      usuarios[nome] = socket;

      // Mensagem de boas vindas
      var mensagem = `[${pegarDataAtual()}] ${nome} entrou na sala`;
      var obj_mensagem = { msg: mensagem, tipo: "sistema" };
      
      // Retonar usuario
      callback({nome, keyMaster: global.keyMaster});

      // Atualizar lista de usuarios online
      io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
      // Enviar mensagem de boas vindas
      io.sockets.emit("atualizar mensagens", obj_mensagem);
    } else {
      // Deu ruim
      callback(null);
    }
  });

  socket.on("enviar mensagem", function ({usuario, mensagem, chave}, callback) {
    // Caso não tenha um usuário, a mensagem será enviada para todos da sala
    var usuario = usuario;
    if (usuario == null) usuario = "";

    const msg = {
      usuario: socket.nome,
      mensagem,
      chave,
    }

    if (usuario == "") {
      // Enviar mensagem para todo mundo
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
    if (!socket.nome) {
      console.log("Usuário não encontrado para desconectar.");
      return;
    }
    // Remover usuario
    delete usuarios[socket.nome];
    // Avisar que ele saiu
    var mensagem = `[${pegarDataAtual()}] ${socket.nome} saiu da sala`;
    var obj_mensagem = { msg: mensagem, tipo: "sistema" };

    // Atualizar lista de usuarios
    io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
    // Enviar mensagem de que saiu
    io.sockets.emit("atualizar mensagens", obj_mensagem);

  });
});

// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:mm
function pegarDataAtual() {
  return moment().format('DD/MM/YYYY HH:mm')
}
