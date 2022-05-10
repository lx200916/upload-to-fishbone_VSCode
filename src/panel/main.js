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