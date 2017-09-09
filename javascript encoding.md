# JavaScript的内部字符编码：UCS-2还是UTF-16

`
个人理解：编码就是表示怎么断句，对于一串字节流，如何分割他们的一种规则，是一个字节表示一个字符，还是多个字节表示一个字符，同时还要考虑到字节序的问题。
`

## 臭名昭著的BMP
Unicode通过一个明确的名称以及一个被称作码点（code point）的整数数字来标识一个字符。例如，字符 `©` 被命名为“copyright sign”，同时拥有`U+00A9`——`0xA9`用十进制可以被写作`169`——来作为它的码点。

Unicode的编码控件被分割为17个平面，每个平面包含2的16次方*（65536）个码点。其中有一部分码点还未被赋予字符值，也有一些被保留用作私有用途，还有一些被永久的保留为非字符（non-characters）。这些分布在每一个平面中的码点拥有十六进制值`xy0000`到`xyFFFF`，这里的`xy`是一个十六进制值从`00`到`10`（0到16），用来表示属于哪一个平面。

第一个平面（`xy`为`00`）叫做Basic Multilingual Plane(BMP)。它包含了从U+0000到U+FFFF的码点，即是那些最常用的字符。

剩下的十六个平面（U+010000 - U+10FFFF）叫做补充平面（supplementary planes）或星体平面（astral planes）。在这里不做讨论；只需记住我们有BMP字符和non-BMP字符即可，后者也称为补充字符（supplementary characters）或星体字符（astral characters）。

## UCS-2和UTF-16的区别
UCS-2和UTF-16都是unicode的字符编码。

UCS-2（2-byte Universal Character Set）产生一个固定长度的格式（fixed-length），只是通过以16位作为一个单元（16-bit code unit）来使用码点（code point）。他对于绝大部分的码点产生的结果和UTF-16是一致的，在0x0000到0xffff这个范围内（例如，BMP）。

UTF-16（16-bit Unicode Transformation Format）是一个UCS-2的扩展，它允许表示那些BMP范围之外的码点。它使用一个介于1-2个16bit的单元来表示一个码点（one or two 16-bit code unit per code point)。通过这种方式，它可以编码介于0到0X10FFFF范围内的码点。

例如，UCS-2和UTF-16，对于BMP字符U+00A9，也就是copyright sign（©），编码都是0x00A9。

## Surrogate pairs
BMP之外的字符，例如U+1D306 tetragram for centre，只能使用UTF-16编码，使用两个16-bit的code units：`0xD834 0xDF06`。这被称作surrogate pair。注意一个替换对儿（surrogate pair，两个code单元）只能表示单个字符。

替代对儿（surrogate pair）的第一个code unit通常是在`0xDC00`到`0xDFFF`范围内，通常被称为a high surrogate或者a lead surrogate。

第二个code unit通常在`0xD834`到`0xDFFF`之间，叫做a low surrogate或者a trail surrogate。

UCS-2由于缺少替代对儿的概念，所以会把`0xD834 0xDF06`解释为两个分离的字符。

##码点和替代对儿的转换

[Section 3.7 of The Unicode Standard 3.0](http://unicode.org/versions/Unicode3.0.0/ch03.pdf)定义了转换到surrogate pair或者从surrogate pair转换回码点的算法。

一个大于OxFFFF的码点`C`和一个替代对儿`<H, L>`的对应关系可以通过下面的公式得到：

```
H = Math.floor((C - Ox10000) / 0x400) + 0xD800
L = (C - 0x10000) % 0x400 + 0xDC00
```

反过来的映射关系，从一个替代对儿`<H, L>`转换到一个Unicode码点`c`，则如下所示：

```
C = (H - 0xD800) * 0x400 + L - 0xDC00 + 0x10000
```