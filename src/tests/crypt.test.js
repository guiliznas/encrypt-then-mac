const { expect } = require('@jest/globals')
const User = require('../model/User.js')

global.K1 = "K1";
global.K2 = "K2";

test('encrypt to a string', () => {
  const user = new User({ nome: 'Usuário' })

  const msg = 'Teste de mensagem'

  expect(typeof user._encrypt(msg)).toBe('string')
})

test('message encrypt and decrypt', () => {
  const user = new User({ nome: 'Usuário' })

  const msg = 'Teste de mensagem'

  expect(user._decrypt(user._encrypt(msg))).toBe(msg)
})

test('encrypt then mac', () => {
  const user = new User({ nome: 'Usuário' })

  const msg = "Teste de mensagem"

  const enviar = user.enviarMensagem(msg)

  expect(typeof user.validarMensagem(enviar)).toBe("string");
})
