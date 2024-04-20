import { IncrementSecret } from "./IncrementSecret.js"
import { SmartContract, Field, State, Mina, AccountUpdate, PrivateKey } from "o1js"

const useProof = false

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof })
Mina.setActiveInstance(Local)
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0]
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1]

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey()

const zkAppInstance = new IncrementSecret(zkAppAddress)
const salt = Field.random();

const deployTxn = await Mina.transaction(deployerAccount, async () => {
  AccountUpdate.fundNewAccount(deployerAccount)
  await zkAppInstance.deploy()
  await zkAppInstance.initState(salt, Field(750))
})
await deployTxn.prove()
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send()

const num0 = zkAppInstance.x.get()
console.log("init: ", num0.toString())

const txn1 = await Mina.transaction(senderAccount, async () => {
  await zkAppInstance.incrementSecret(salt, Field(750))
})
await txn1.prove()
await txn1.sign([senderKey]).send()

const num1 = zkAppInstance.x.get()
console.log("init: ", num1.toString())

export { IncrementSecret }