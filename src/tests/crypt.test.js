const { expect } = require('@jest/globals')
const User = require('../model/User.js')

global.K1 = "K1";
global.K2 = "K2";
const user = new User({ nome: 'Usuário'})
user._atualizarChaves()

test('encrypt to a string', () => {
  
  const msg = 'Teste de mensagem'

  expect(typeof user._encrypt(msg)).toBe('string')
})

test('message encrypt and decrypt', () => {

  const msg = 'Teste de mensagem'

  expect(user._decrypt(user._encrypt(msg))).toBe(msg)
})

test('encrypt then mac', async () => {

  const msg = "Teste de mensagem"

  const enviar = await user.enviarMensagem("", msg)

  expect(typeof user.validarMensagem(enviar)).toBe("string");
})

test('encrypt then mac new message', async () => {

  const msg = "Segunda mensagem"

  const enviar = await user.enviarMensagem("", msg)

  expect(user.validarMensagem(enviar)).toBe(msg);
})
