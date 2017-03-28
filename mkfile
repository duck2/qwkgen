CC=cc
CFLAGS=

OUTDIR=_site

POSTS=`{ls -f lib/*.md}
IMS=`{ls -f lib/*.png}
OUTS=${POSTS:lib/%.md=$OUTDIR/%.html}

RTRAW=`{ls -f lib/rt/*.md}
RTRAWIMS = `{ls -f lib/rt/*.png}
RT=${RTRAW:lib/rt/%.md=$OUTDIR/rt/%.html}
RTIMS=${RTRAWIMS:lib/rt/%.png=$OUTDIR/rt/%.png}

all:V: $OUTDIR bin/mkd2html $OUTDIR/style.css posts $OUTDIR/rt rt

$OUTDIR:
	mkdir -pv $OUTDIR

bin/mkd2html: `{ls libsoldout/*.c}
	$CC $CFLAGS $prereq -o bin/mkd2html

$OUTDIR/index.html: `{ls lib/*.md} tpl/index.tpl tpl/header.inc
	bin/template.awk tpl/index.tpl | rc > $target

$OUTDIR/who.html: tpl/who.tpl tpl/header.inc
	bin/template.awk tpl/who.tpl | rc > $target

$OUTDIR/style.css: lib/style.css
	cp -f $prereq $target

$OUTDIR/%.html: lib/%.md tpl/post.tpl tpl/header.inc tpl/lowhdr.inc
	bin/template.awk tpl/post.tpl > /tmp/post.rc
	rc /tmp/post.rc $prereq > $target

$OUTDIR/%.png: lib/%.png
	cp -f $prereq $target
	optipng -o5 $target > /dev/null 2>&1 || echo "no optipng."

posts:V: $OUTDIR/index.html $OUTDIR/who.html $OUTS $IMS

$OUTDIR/rt:
	mkdir -pv $OUTDIR/rt

$OUTDIR/rt/index.html: `{ls lib/rt/*.md} tpl/rt/index.tpl
	bin/template.awk tpl/rt/index.tpl | rc > $target

rt:V: $OUTDIR/rt $OUTDIR/rt/index.html $RT $RTIMS

clean:V:
	rm -rf $OUTS $RT $RTIMS bin/mkd2html
	rm -f /tmp/post.rc
