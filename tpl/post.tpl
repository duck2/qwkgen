% cat tpl/header.inc

%{
fn mkhtml { echo $1 | sed -e 's:lib/\(.*\).md:\1.html:g' } #POSIX: backslashes on parentheses
fn mkdate { echo $1 | sed -n -e 's:lib/\([0-9]*-[0-9]*-[0-9]*\).*:\1:p' } #POSIX: backslashes on parentheses
%}

<div class="swallow">
<div class="post">
%{
# we expect $1 to carry the markdown filename.
target=`{mkhtml $1} 
date=`{mkdate $1} 
echo '<a href="' ^ $target ^ '">'
sed 1q $1 | ./bin/mkd2html
echo '</a>'
echo $date
sed -n  '2, $p' $1 | ./bin/mkd2html
%}

</div>
<div class="previous">
<h2>previously</h2>
%{
# sed dance to get previous posts. shows last 5(sed 5q).
# mkd2html will emit <h1> but we handle that in CSS ../lib/style.css
libless=`{echo $1 | sed -n -e 's:lib/\(.*\):\1:p'}
previous=`{ls -r lib/*.md | sed -e '0,/' ^ $libless ^ '/d' | sed 5q}
for(i in $previous){
	echo '<a href="' ^ `{mkhtml $i} ^ '">'
	sed 1q $i | ./bin/mkd2html
	echo '</a>'
}
%}
</div>
</div>


