var CryptoJS = require("crypto-js");

export function AESEncrypt(pureText, password) {
  var ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(pureText),
    password
  ).toString();
  return ciphertext;
}
export function AESDecrypt(encryptedText, password) {
  var bytes = CryptoJS.AES.decrypt(encryptedText, password);
  var decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return decryptedData;
}
