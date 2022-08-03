const cryptsJs = require('crypto-js');
const config = require('config');

async function encode(string){
    var encrypt = cryptsJs.AES.encrypt(string, config.get('cipherKey')).toString();
    return encrypt;
}

async function decode(string) {
    var decrpt = cryptsJs.AES.decrypt(string, config.get('cipherKey'));
    return decrpt.toString(cryptsJs.enc.Utf8);
}

module.exports = {encode, decode}
