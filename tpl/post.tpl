%{
depth=`{echo $stem | awk 'BEGIN{FS="/"}{print NF}'}
if(test 1 -eq $depth) cat tpl/header.inc
if not cat tpl/lowhdr.inc

fn mkhtml { basename $1 | sed -e 's:\(.*\).md:\1.html:g' } #POSIX: backslashes on parentheses
fn mkdate { basename $1 | sed -n -e 's:\([0-9]*-[0-9]*-[0-9]*\).*:\1:p' } #POSIX: backslashes on parentheses
%}

<div class="swallow">
<div class="post">
%{
post=lib/$stem.md
target=$stem.html
date=`{mkdate $post}
echo '<a href="/' ^ $target ^ '">'
sed 1q $post | ./bin/mkd2html
echo '</a>'
echo $date
sed -n  '2, $p' $post | ./bin/mkd2html
%}

</div>
<div class="previous">
<h2>previously</h2>
%{
# sed dance to get previous posts. shows last 5(sed 2,5p).
# mkd2html will emit <h1> but we handle that in CSS ../lib/style.css
libless=`{basename $post}
# previously should only show posts in that directory.
dirname=`{echo $post | awk 'BEGIN{FS="/"}{for(i=1;i<NF;i++){printf("%s/",$i)}}'}
previous=`{ls -r $dirname ^ *.md | sed -n '/' ^ $libless ^ '/,$p' | sed -n '2,5p'}
for(i in $previous){
	echo '<a href="' ^ `{mkhtml $i} ^ '">'
	sed 1q $i | ./bin/mkd2html
	echo '</a>'
}
%}
</div>
</div>
