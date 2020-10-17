# duck2/libsoldout

This fork is a "make and go" version of [libsoldout][0]. Most of the documentation, LaTeX and nroff renderers and the build system is removed.

I later added support for code fences and a math extension. The math extension allows one to render LaTeX into base64-encoded PNG files embedded in the output file.

The program calls a hardcoded path `bin/latex2png` via `popen()` to render equations. I should probably change that to an environment provided path executed with `execve` and `dup2`.

Don't run this on untrusted input.

## Compile

`make` if you want a local binary. You can also run `sudo make install` if you would like a systemwide installation. If you are using something other than Debian, make sure to take a look at the Makefile.

## Run

```
$ ./mkd2html [file]
```

[0]: https://github.com/faelys/libsoldout
