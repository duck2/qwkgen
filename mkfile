CC=cc
CFLAGS=

OUTDIR=`{9 pwd}/_site  # change to publish
BASE_URL=$OUTDIR  # change to publish

DIRS=`{9 du lib | 9 awk '{print $2}'}
POSTS=`{9 du -a lib | 9 awk '{print $2}' | 9 grep ".+md$"}
OTHERS=`{9 du -a tpl | 9 awk '{print $2}' | 9 grep -v "post.tpl" | 9 grep ".+tpl$"}
STATIC=`{9 du -a lib | 9 awk '{print $2}' | 9 grep ".+(png|webm|css)$"}

RCS=`{9 du -a tpl | 9 awk '{print $2}' | 9 grep ".+rc$"}

OUT_DIRS=${DIRS:lib%=$OUTDIR%}
OUT_POSTS=${POSTS:lib%md=$OUTDIR%html}
OUT_OTHERS=${OTHERS:tpl%tpl=$OUTDIR%html}
OUT_STATIC=${STATIC:lib%=$OUTDIR%}

all:V: bin/mkd2html $OUT_DIRS $OUT_POSTS $OUT_OTHERS $OUT_STATIC

bin/mkd2html: `{ls libsoldout/*.c}
	$CC $CFLAGS $prereq -o bin/mkd2html

$OUT_DIRS:
	mkdir -pv $OUT_DIRS

# if a prereq exists(e.g. files in $INCS), mk assumes all other prereqs exist and
# looks for files like tpl/2017-whatever.tpl . so we specify them separately

$OUTDIR/%.html: $INCS tpl/post.tpl $POSTS

$OUTDIR/%.html: tpl/%.tpl
	awk -f bin/template.awk tpl/$stem.tpl | rc > $target

$OUTDIR/%.html: lib/%.md
	awk -f bin/template.awk tpl/post.tpl | rc > $target

$OUTDIR/%: lib/%
	cp -f $prereq $target

clean:V:
	rm -rf $OUT_POSTS $OUT_OTHERS $OUT_STATIC
	rm -f /tmp/post.rc
