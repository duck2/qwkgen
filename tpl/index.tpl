% cat tpl/header.inc

<div class="swallow">
%{
# the first line of the post is always a link to the post page.
# if the post is longer than $max lines, a read more link is appended.
max=20
for(i in `{ls -r lib/*.md}){
	target=`{echo $i | sed -e 's:lib/\(.*\).md:\1.html:g'}
	echo '<div class="post">'
	echo '<a href="' ^ $target ^ '">'
	sed 1q $i | ./bin/mkd2html
	echo '</a>'
	sed -n '2, ' ^ $max ^ 'p' $i | ./bin/mkd2html
	lc=`{cat $i | wc -l}
	if(test $lc -gt $max){
		echo '[<a href="' ^ $target ^ '">more...</a>]'
	}
	echo '</div>'
}
%}
</div>

% cat tpl/footer.inc
