# qwkgen

qwkgen is a [mkfile][6] cobbled together with a set of tools to generate my blog[4].

qwkgen is not configurable/extensible by "config files"- its scope is not general use. however the mkfile is simple enough to maintain a personal fork.

[werc][0]'s [template.awk][5] is used as the [template language][2].
a fork of [libsoldout][1] is used as the markdown engine.

## dependencies

a C compiler, GNU or BSD make to make libsoldout.

the `9base` package or [plan9port][3] for mk and rc.

## usage

`mk`. ultimately, a static site generator is a build system and `mk` handles it quite well. default output directory is `_site/`.

posts are supposed to go to lib/*.md with a prefix of YYYY-MM-DD tag- `like 2016-10-10-the_perils_of_being_a_horse.md` or something.

any configuration is done by playing with the `mkfile`. mk is very convenient to use if you are already familiar with GNU/BSD make.

[0]: http://werc.cat-v.org/
[1]: https://github.com/faelys/libsoldout
[2]: http://werc.cat-v.org/docs/rc-template-lang
[3]: https://github.com/9fans/plan9port
[4]: http://duck2.lt/
[5]: https://github.com/libduck2/qwkgen/blob/master/bin/template.awk
[6]: http://doc.cat-v.org/plan_9/4th_edition/papers/mk
