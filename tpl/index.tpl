% cat tpl/header.inc

%{
fn mkhtml { echo $1 | sed -e 's:lib/\(.*\).md:\1.html:g' } #POSIX: backslashes on parentheses
fn mkdate { echo $1 | sed -n -e 's:lib/\([0-9]*-[0-9]*-[0-9]*\).*:\1:p' } #POSIX: backslashes on parentheses
%}

<div class="swallow">
%{
# the first line of the post is always a link to the post page.
# if the post is longer than $max lines, a read more link is appended.
max=20
for(i in `{ls -r lib/*.md}){
	target=`{mkhtml $i}
	date=`{mkdate $i}
	echo '<div class="post">'
	echo '<a href="' ^ $target ^ '">'
	sed 1q $i | ./bin/mkd2html
	echo '</a>'
	echo $date
	sed -n '2, ' ^ $max ^ 'p' $i | ./bin/mkd2html
	lc=`{cat $i | wc -l}
	if(test $lc -gt $max){
		echo '[<a href="' ^ $target ^ '">more...</a>]'
	}
	echo '</div>'
}
%}
</div>

<hr />
<div class="footer">
generator is <a href="https://github.com/libduck2/qwkgen">qwkgen</a>. all text is licensed under CC0.
</div>
