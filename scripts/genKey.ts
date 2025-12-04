import { Wallet } from "ethers";

function generateRandomWallet() {
  // 使用 Wallet.createRandom() 方法生成一个新的随机钱包实例
  const wallet = Wallet.createRandom();

  console.log("--- 随机生成的测试钱包 ---");
  console.log(`地址 (Address):     ${wallet.address}`);
  console.log(`私钥 (Private Key): ${wallet.privateKey}`);
  console.log(`助记词 (Mnemonic):  ${wallet.mnemonic!.phrase}`);
  console.log("----------------------------------");

  // 返回钱包对象，您可以用它来签名交易
  return wallet;
}
//0x3c721483b74147fFE6b2FA2b56C24B0e51290b8a
//0xf3f4084a72ac1d2e79301e626784d490c4a390c7d1a2a5d6d6dfd492507d4701

const testWallet = generateRandomWallet();
