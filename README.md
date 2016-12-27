# qwkgen

qwkgen is a [rc][4] script using a set of tools cobbled together to statically generate a website.

qwkgen is not configurable/extensible by "config files". however it is intended to be simple and thus easy to maintain a personal fork.

[werc][0]'s template.awk is used as the [template language][2].
a fork of [libsoldout][1] is used as the markdown engine.

## dependencies

a C compiler, GNU or BSD make to make libsoldout.

the `9base` package or [plan9port][3] to run rc scripts.

## usage

first `make` to compile libsoldout into `bin/mkd2html`.

all configuration is done by editing the main script `qwkgen.rc`. there is a default implementation of a blog-like structure and a sitemap generator stolen from [werc][0] in `lib/`.

[0]: http://werc.cat-v.org/
[1]: https://github.com/faelys/libsoldout
[2]: http://werc.cat-v.org/docs/rc-template-lang
[3]: https://github.com/9fans/plan9port
[4]: http://doc.cat-v.org/plan_9/4th_edition/papers/rc
