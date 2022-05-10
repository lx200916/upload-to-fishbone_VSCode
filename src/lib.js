import axios from "axios";
import Message from "./msg";
import protobuf from "protobufjs";
import CryptoJS from "crypto-js";

const Paste = Message.lookup("Paste");
const newPaste = Message.lookup("newPaste");
const httpService = axios.create({
  timeout: 45000,
  method: "post",
  headers: {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": "application/octet-stream",
  },
  responseType: "text",
  baseURL: "https://bone.saltedfish.fun/_api/paste",
});

export function fromBase64(string) {
  var buffer = protobuf.util.newBuffer(protobuf.util.base64.length(string));
  protobuf.util.base64.decode(string, buffer, 0);
  let paste = Paste.decode(buffer);
  console.log(paste);
  return paste;
}

export function toBase64(obj) {
  let buffer = newPaste.encode(obj).finish();
  console.log(buffer);
  return protobuf.util.base64.encode(buffer, 0, buffer.length);
}
export function dateFormat(fmt, date) {
  let ret;
  const opt = {
    "Y+": date.getFullYear().toString(), // 年
    "M+": (date.getMonth() + 1).toString(), // 月
    "d+": date.getDate().toString(), // 日
    "h+": date.getHours().toString(), // 时
    "m+": date.getMinutes().toString(), // 分
    "S+": date.getSeconds().toString(), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : opt[k].padStart(ret[1].length, "0")
      );
    }
  }
  return fmt;
}
export function randomString(e) {
  e = e || 32;
  let t = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678",
    a = t.length,
    n = "";
  let i;
  for (i = 0; i < e; i++) {
    n += t.charAt(Math.floor(Math.random() * a));
  }
  return n;
}

export function aesEncode(content, pass) {
  let options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  };
  let derivedParams = CryptoJS.kdf.OpenSSL.execute(
    pass,
    256 / 32,
    128 / 32,
    "fishbone"
  );
  return CryptoJS.AES.encrypt(
    "##PasteMe##" + content,
    derivedParams.key,
    options
  ).toString();
}

export function getToken(base) {
  return btoa(base).replaceAll("=", "!");
}

export function aesDecode(content, pass) {
  let options = {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  };
  let derivedParams = CryptoJS.kdf.OpenSSL.execute(
    pass,
    256 / 32,
    128 / 32,
    "fishbone"
  );
  var bytes = CryptoJS.AES.decrypt(content, derivedParams.key, options);
  var originalText = bytes.toString(CryptoJS.enc.Utf8);
  if (originalText.length > 0 && originalText.startsWith("##PasteMe##")) {
    return originalText.substr(11);
  }
  return "";
}
export async function create(content, password, options) {
  let isEncrypted = false;
  options.postUrl = "/once";
  console.log(options,options.deleteToken,options.deleteToken=="");
  if (password.length > 0) {
    content = aesEncode(content, password);
    isEncrypted = true;
  }
  if (options.hasDeleteToken&&(options.deleteToken===undefined||options.deleteToken==="")) {
    options.deleteToken = randomString(6);
    options.postUrl = "/once";
  }
  if (options.type == 2) {
    options.postUrl = "/";
  }
  let obj = {
    content: content,
    lang: options.lang,
    password: isEncrypted,
    timeline: options.type,
  };
  console.log(obj);

  try {
    let res = await httpService.get("/?method=beat");
    let objx = fromBase64(res.data);
    obj.xtoken = getToken(objx.tokenEncryption);
  } catch (err) {
    console.log(err);
  }
  if (options.hasDeleteToken) {
    obj["token"] = options.deleteToken;
    obj["tokenEncryption"] = aesEncode(obj["token"], password);
  }
  let payload = toBase64(obj);
  let res = await httpService.post(options.postUrl, payload);
  console.log(res.data);
  let resp = fromBase64(res.data);
  console.log(resp);
  resp['deleteToken']=options.deleteToken;
  return resp;
}
export default httpService;
