# Tarefa prática de implementação

Código para a tarefa prática de implementação 1 de Segurança da Informação e de Redes.

Troca de mensagens com criptografia pelo processo Encrypt-then-Mac.

## Características

- Usuários instanciados a partir de uma classe.
- Utilizando sockets para troca de mensagens.
- Troca de mensagens sendo feita de forma cifrada, pelo processo Encrypt-then-Mac.
  - Enviando: Usuário destino, bloco de mensagem e key wrapped.
  - Cifragem feita usando _AES no modo CTR com chave de 128 bits_.
  - MAC sendo feito usando HMAC (_HMacSHA256_).
- A mensagem é cifrada e então enviada. Ao receber mensagens, ela é decifrada.
- Não pode utilizar chave nem IV armazenados em variáveis de memória, simulando máquinas diferentes.
- Para gerar chaves/IVs, usar PBKDF2.
- Chave usada para cifrar deve ser "wrapped" (encapsulada/cifrada).
- Pode-se usar uma "senha mestre" para derivar uma chave a ser usada no programa usando PBKDF2.

## Requisitos para rodar

Ter `node` instalado. O programa foi feito utilizando o node v12.22.3.

Iniciar o repositório, instalando as dependências:

`npm install`

Executar o seguinte comando para iniciar o servidor:

`node app.js`

Após isso, basta acessar pelo navegador `localhost:3000` para começar a utilização.

### Rodar pelo script

Sem hot reload:

`npm run start`

Com hot reload:

`npm run dev`
### Rodar com debug

Rodar servidor (`npm run debug`), iniciar script no vscode (`Node: Nodemon`) e vincular os dois.
