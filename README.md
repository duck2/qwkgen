# qwkgen

qwkgen is a [mkfile][0] cobbled together with some templates and a set of tools to generate my [blog][1].

qwkgen is not configurable/extensible by "config files"- its scope is not general use. however it should be easy to maintain a personal fork if you are familiar with all the sed courtship dance.

[werc][2]'s [template.awk][3] is used as the [template language][4].
a fork of [libsoldout][5] is used as the markdown engine.

## dependencies

a C compiler to make libsoldout.

the `9base` package or [plan9port][6] for mk and rc.

`grep POSIX` for parts not working with plan9 tools.

## usage

clone with `git clone --recursive` to clone together with libsoldout.

`mk` gets the ball rolling. ultimately, a static site generator is a build system and `mk` handles it quite well. default output directory is `_site/`.

posts are supposed to go to lib/*.md with a prefix of YYYY-MM-DD tag- `like 2016-10-10-the_perils_of_being_a_horse.md` or something.

any configuration is done by playing with the `mkfile`. mk is very convenient to use if you are already familiar with GNU/BSD make.

[0]: http://doc.cat-v.org/plan_9/4th_edition/papers/mk
[1]: http://duck2.lt/
[2]: http://werc.cat-v.org/
[3]: https://github.com/libduck2/qwkgen/blob/master/bin/template.awk
[4]: http://werc.cat-v.org/docs/rc-template-lang
[5]: https://github.com/faelys/libsoldout
[6]: https://github.com/9fans/plan9port
