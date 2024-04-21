import { Square } from "./Square.js"
import { Field, Mina, PrivateKey, AccountUpdate } from 'o1js';

const useProof = false

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof })
Mina.setActiveInstance(Local)
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey()

const zkAppInstance = new Square(zkAppAddress)
const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount)
  await zkAppInstance.deploy()
})
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send()
const num0 = zkAppInstance.num.get()
console.log("state after init:", num0.toString())

const txn1 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.update(Field(9))
})
await txn1.prove()
await txn1.sign([senderKey]).send()

const num1 = zkAppInstance.num.get()
console.log("state after txn1:", num1.toString())


try {
  const txn2 = await Mina.transaction(senderAccount, async () => {
    await zkAppInstance.update(Field(81))
  })
  await txn2.prove()
  await txn2.sign([senderKey]).send()
} catch (error: any) {
  console.log(error.message)
}
const num2 = zkAppInstance.num.get()
console.log("state after txn2:", num2.toString())
export { Square }