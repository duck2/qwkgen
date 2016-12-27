# qwkgen

qwkgen is a set of tools cobbled together to statically generate a personal blog.

qwkgen is not planned to be especially configurable or extensible, however I believe it will be simple enough to maintain a personal fork.

[werc][0]'s template.awk is used as the [template language][2].
a fork of [libsoldout][1] is used as the markdown engine.

## dependencies

the `9base` package or [plan9port][3] if you want to use `rc` in the templates. if you don't want to touch plan9, you can always pipe the output of template.awk to whatever shell you are using.

[0]: http://werc.cat-v.org/
[1]: https://github.com/faelys/libsoldout
[2]: http://werc.cat-v.org/docs/rc-template-lang
[3]: https://github.com/9fans/plan9port
