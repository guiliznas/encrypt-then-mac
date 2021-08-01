var app = require("http").createServer(resposta); // Criando o servidor
var fs = require("fs"); // Sistema de arquivos
var io = require("socket.io")(app); // Socket.IO

var usuarios = []; // Lista de usuários
var ultimas_mensagens = []; // Lista com ultimas mensagens enviadas no chat

const _PORT_ = 3000;
app.listen(_PORT_);

global.K1 = "K1";

// var CryptoJS = require('crypto-js');
// CryptoJS.PBKDF2("");

global.K2 = "K2"; // Chave para AES CTR com 128 bits;

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
    if (!(nome in usuarios)) {
      const user = { nome };
      user.K1 = global.K1;
      user.K2 = global.K2;
      socket.user = user;
      usuarios[user.nome] = socket; // Adicionadno o nome de usuário a lista armazenada no servidor

      // Enviar para o usuário ingressante as ultimas mensagens armazenadas.
      for (indice in ultimas_mensagens) {
        socket.emit("atualizar mensagens", ultimas_mensagens[indice]);
      }

      var mensagem =
        "[ " + pegarDataAtual() + " ] " + nome + " acabou de entrar na sala";
      var obj_mensagem = { msg: mensagem, tipo: "sistema" };

      io.sockets.emit("atualizar usuarios", Object.keys(usuarios)); // Enviando a nova lista de usuários

      armazenaMensagem(obj_mensagem); // Guardando a mensagem na lista de histórico

      callback(user);

      io.sockets.emit("atualizar mensagens", obj_mensagem); // Enviando mensagem anunciando entrada do novo usuário
    } else {
      callback(null);
    }
  });

  socket.on("enviar mensagem", function ({usuario, mensagem, chave}, callback) {
    var mensagem_enviada = mensagem;
    var usuario = usuario.nome;
    if (usuario == null) usuario = ""; // Caso não tenha um usuário, a mensagem será enviada para todos da sala

    const msg = {
      usuario: {nome: socket.user.nome},
      mensagem,
      chave,
    }

    mensagem_enviada =
      "[ " +
      pegarDataAtual() +
      " ] " +
      socket.user.nome +
      " diz: " +
      mensagem_enviada;
    var obj_mensagem = { msg: mensagem_enviada, tipo: "" };

    if (usuario == "") {
      // io.sockets.emit("atualizar mensagens", obj_mensagem);
      io.sockets.emit("atualizar mensagens", msg);
      armazenaMensagem(obj_mensagem); // Armazenando a mensagem
    } else {
      // obj_mensagem.tipo = "privada";
      // socket.emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário que a enviou
      // usuarios[usuario].emit("atualizar mensagens", obj_mensagem); // Emitindo a mensagem para o usuário escolhido
      msg.tipo = "privada";
      socket.emit("atualizar mensagens", msg);
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
    var mensagem =
      "[ " + pegarDataAtual() + " ] " + socket.user.nome + " saiu da sala";
    var obj_mensagem = { msg: mensagem, tipo: "sistema" };

    // No caso da saída de um usuário, a lista de usuários é atualizada
    // junto de um aviso em mensagem para os participantes da sala
    io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
    io.sockets.emit("atualizar mensagens", obj_mensagem);

    armazenaMensagem(obj_mensagem);
  });
});

// Função para apresentar uma String com a data e hora em formato DD/MM/AAAA HH:MM:SS
function pegarDataAtual() {
  var dataAtual = new Date();
  var dia = (dataAtual.getDate() < 10 ? "0" : "") + dataAtual.getDate();
  var mes =
    (dataAtual.getMonth() + 1 < 10 ? "0" : "") + (dataAtual.getMonth() + 1);
  var ano = dataAtual.getFullYear();
  var hora = (dataAtual.getHours() < 10 ? "0" : "") + dataAtual.getHours();
  var minuto =
    (dataAtual.getMinutes() < 10 ? "0" : "") + dataAtual.getMinutes();
  var segundo =
    (dataAtual.getSeconds() < 10 ? "0" : "") + dataAtual.getSeconds();

  var dataFormatada =
    dia + "/" + mes + "/" + ano + " " + hora + ":" + minuto + ":" + segundo;
  return dataFormatada;
}

// Função para guardar as mensagens e seu tipo na variável de ultimas mensagens
function armazenaMensagem(mensagem) {
  if (ultimas_mensagens.length > 5) {
    ultimas_mensagens.shift();
  }

  ultimas_mensagens.push(mensagem);
}
