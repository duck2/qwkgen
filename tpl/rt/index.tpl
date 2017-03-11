% cat tpl/lowhdr.inc

%{
fn mkhtml { basename $1 | sed -e 's:\(.*\).md:\1.html:g' } #POSIX: backslashes on parentheses
fn mkdate { basename $1 | sed -n -e 's:\([0-9]*-[0-9]*-[0-9]*\).*:\1:p' } #POSIX: backslashes on parentheses
%}

<div class="swallow">
<div class="post">
<h1>rt</h1>
I am taking a raytracing course in spring 2016.<br>
Programming assignments are weekly. Each assignment is a blogpost under rt/.
<div class="previous">
%{
# the first line of the post is always a link to the post page.
# if the post is longer than $max lines, a read more link is appended.
max=20
for(i in `{ls -r lib/rt/*.md}){
	target=`{mkhtml $i}
	date=`{mkdate $i}
	echo '<a href="' ^ $target ^ '">'
	sed 1q $i | ./bin/mkd2html
	echo '</a>'
}
%}
</div>
</div>
</div>

<hr />
<div class="footer">
generator is <a href="https://github.com/libduck2/qwkgen">qwkgen</a>. all text is licensed under CC0.
</div>
