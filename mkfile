CC=cc
CFLAGS=

OUTDIR=_site

POSTS=`{ls -f lib/*.md}
OUTS=${POSTS:lib/%.md=$OUTDIR/%.html}

all:V: $OUTDIR bin/mkd2html $OUTDIR/index.html $OUTDIR/who.html $OUTDIR/style.css posts

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

posts:V: $OUTS

$OUTDIR/%.html: lib/%.md tpl/post.tpl tpl/header.inc
	bin/template.awk tpl/post.tpl > /tmp/post.rc
	rc /tmp/post.rc $prereq > $target

clean:V:
	rm -rf $OUTDIR bin/mkd2html
	rm -f /tmp/post.rc
