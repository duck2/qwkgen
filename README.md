# qwkgen

qwkgen is a [mkfile][0] cobbled together with some templates and 9base utilities to generate my [blog][1].

The program is not configurable. However, the mkfile and the template engine are simple enough to maintain a personal fork.

[werc][2]'s [template.awk][3] is used as the [template language][4].
A fork of [libsoldout][5] is used as the markdown engine.

## Dependencies

- A C compiler to build libsoldout.
- The `9base` package or [plan9port][6] for mk and rc. (I never tried to run this in Plan 9 itself.)

## Usage

Clone with `git clone --recursive`.

`mk` gets the ball rolling. The default output directory is `_site/`.

Place posts in lib/*.md with a prefix of YYYY-MM-DD tag. An example is `2016-10-10-the_perils_of_being_a_horse.md`.

Tweak the mkfile and the templates to your interest.

[0]: http://doc.cat-v.org/plan_9/4th_edition/papers/mk
[1]: http://duck2.lt/
[2]: http://werc.cat-v.org/
[3]: https://github.com/duck2/qwkgen/blob/master/bin/template.awk
[4]: http://werc.cat-v.org/docs/rc-template-lang
[5]: https://github.com/faelys/libsoldout
[6]: https://github.com/9fans/plan9port
