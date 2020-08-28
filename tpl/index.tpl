% rc ./tpl/header.rc

%{
fn mkhtml { 9 basename $1 | 9 sed -e 's:(.*).md:\1.html:g' }
fn mkdate { 9 basename $1 | 9 sed -n -e 's:([0-9]*-[0-9]*-[0-9]*).*:\1:p' }
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
		sed 1q $i | ./bin/mkd2html # render post title
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

% rc ./tpl/footer.rc
