var socket = io.connect();

// Ao enviar uma mensagem
$("form#chat").submit(async function (e) {
  e.preventDefault();

  var mensagem = $(this).find("#texto_mensagem").val();
  if (!mensagem) {
    return
  }
  // Usuário selecionado na lista lateral direita
  var usuario = $("#lista_usuarios").val();

  // Montar pacote para enviar mensagem
  const enviar = await window.user.enviarMensagem(usuario, mensagem);
  // Evento acionado no servidor para o envio da mensagem
  // junto com o nome do usuário selecionado da lista
  socket.emit("enviar mensagem", enviar, function () {
    $("form#chat #texto_mensagem").val("");
  });
});

// Resposta ao envio de mensagens do servidor
socket.on("atualizar mensagens", function (dados) {
  // Verifica se eh uma mensagem cifrada ou nao
  let result = dados.chave ? window.user.validarMensagem(dados) : dados.msg;
  if (result) {
    if (dados.usuario) {
      result = formatarMensagem({usuario: dados.usuario, mensagem: result})
    }
    var mensagem_formatada = $("<p />").text(result).addClass(dados.tipo);
    $("#historico_mensagens").append(mensagem_formatada);
    scrollBottom();
  } else {
    alert("Quebra de segurança")
  }
});

$("form#login").submit(function (e) {
  e.preventDefault();

  // Evento enviado quando o usuário insere um nome para entrar
  socket.emit("entrar", $(this).find("#apelido").val(), function ({nome, keyMaster}) {
    if (nome) {
      // Instancia classe do usuario
      window.user = new User({nome, keyMaster});
      // Caso não exista nenhum usuário com o mesmo nome, o painel principal é exibido
      $("#acesso_usuario").hide();
      $("#sala_chat").show();
    } else {
      // Do contrário o campo de mensagens é limpo e é apresentado um alert
      $("#acesso_usuario").val("");
      alert("Nome já utilizado nesta sala");
    }
  });
});

// Quando servidor enviar uma nova lista de usuários
// a lista é limpa e reinserida a opção Todos
// junto de toda a lista de usuários.
socket.on("atualizar usuarios", function (usuarios) {
  $("#lista_usuarios").empty();
  $("#lista_usuarios").append("<option value=''>Todos</option>");
  $.each(usuarios, function (indice) {
    var opcao_usuario = $("<option />").text(usuarios[indice]);
    $("#lista_usuarios").append(opcao_usuario);
  });
});

// Formatar a mensagem para o padrao, conforme dados
function formatarMensagem({usuario, mensagem}) {
  return `[${moment().format("DD/MM/YYYY HH:mm")}] ${usuario}: ${mensagem}`
}

// Manter o chat na parte inferior (ultima mensagem)
function scrollBottom() {
  var element = document.getElementById("historico_mensagens");
  element.scrollTop = element.scrollHeight;
}