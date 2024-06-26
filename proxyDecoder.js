utf = new function () {
    this.unpackUTF16 = function (_str) {
        var i, utf16 = [];
        for (i = 0; i < _str.length; i++) utf16[i] = _str.charCodeAt(i);
        return utf16;
    }

    this.unpackChar = function (_str) {
        var utf16 = this.unpackUTF16(_str);
        var i, n, tmp = [];
        for (n = i = 0; i < utf16.length; i++) {
            if (utf16[i] <= 0xff) tmp[n++] = utf16[i];
            else {
                tmp[n++] = utf16[i] >> 8;
                tmp[n++] = utf16[i] & 0xff;
            }
        }
        return tmp;
    }

    this.packChar =
        this.packUTF16 = function (_utf16) {
            var i, str = "";
            for (i in _utf16) str += String.fromCharCode(_utf16[i]);
            return str;
        }

    this.unpackUTF8 = function (_str) {
        return this.toUTF8(this.unpackUTF16(_str));
    }

    this.packUTF8 = function (_utf8) {
        return this.packUTF16(this.toUTF16(_utf8));
    }

    this.toUTF8 = function (_utf16) {
        var utf8 = [];
        var idx = 0;
        var i, j, c;
        for (i = 0; i < _utf16.length; i++) {
            c = _utf16[i];
            if (c <= 0x7f) utf8[idx++] = c;
            else if (c <= 0x7ff) {
                utf8[idx++] = 0xc0 | (c >>> 6);
                utf8[idx++] = 0x80 | (c & 0x3f);
            }
            else if (c <= 0xffff) {
                utf8[idx++] = 0xe0 | (c >>> 12);
                utf8[idx++] = 0x80 | ((c >>> 6) & 0x3f);
                utf8[idx++] = 0x80 | (c & 0x3f);
            }
            else {
                j = 4;
                while (c >> (6 * j)) j++;
                utf8[idx++] = ((0xff00 >>> j) & 0xff) | (c >>> (6 * --j));
                while (j--)
                    utf8[idx++] = 0x80 | ((c >>> (6 * j)) & 0x3f);
            }
        }
        return utf8;
    }

    this.toUTF16 = function (_utf8) {
        var utf16 = [];
        var idx = 0;
        var i, s;
        for (i = 0; i < _utf8.length; i++, idx++) {
            if (_utf8[i] <= 0x7f) utf16[idx] = _utf8[i];
            else {
                if ((_utf8[i] >> 5) == 0x6) {
                    utf16[idx] = ((_utf8[i] & 0x1f) << 6)
                        | (_utf8[++i] & 0x3f);
                }
                else if ((_utf8[i] >> 4) == 0xe) {
                    utf16[idx] = ((_utf8[i] & 0xf) << 12)
                        | ((_utf8[++i] & 0x3f) << 6)
                        | (_utf8[++i] & 0x3f);
                }
                else {
                    s = 1;
                    while (_utf8[i] & (0x20 >>> s)) s++;
                    utf16[idx] = _utf8[i] & (0x1f >>> s);
                    while (s-- >= 0) utf16[idx] = (utf16[idx] << 6) ^ (_utf8[++i] & 0x3f);
                }
            }
        }
        return utf16;
    }

    this.URLencode = function (_str) {
        return _str.replace(/([^a-zA-Z0-9_\-\.])/g, function (_tmp, _c) {
            if (_c == "\x20") return "+";
            var tmp = utf.toUTF8([_c.charCodeAt(0)]);
            var c = "";
            for (var i in tmp) {
                i = tmp[i].toString(16);
                if (i.length == 1) i = "0" + i;
                c += "%" + i;
            }
            return c;
        });
    }

    this.URLdecode = function (_dat) {
        _dat = _dat.replace(/\+/g, "\x20");
        _dat = _dat.replace(/%([a-fA-F0-9][a-fA-F0-9])/g,
            function (_tmp, _hex) { return String.fromCharCode(parseInt(_hex, 16)) });
        return this.packChar(this.toUTF16(this.unpackUTF16(_dat)));
    }
}

module.exports = { utf }