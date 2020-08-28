% rc ./tpl/header.rc

%{
fn mkhtml { 9 basename $1 | 9 sed -e 's:(.*).md:\1.html:g' }
fn mkdate { 9 basename $1 | 9 sed -n -e 's:([0-9]*-[0-9]*-[0-9]*).*:\1:p' }
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
			for(f in `{ls -r lib/rt/*.md}){
				target_html=`{mkhtml $f}
				date=`{mkdate $f}
				echo '<a href="' ^ $target_html ^ '">'
				sed 1q $f | ./bin/mkd2html
				echo '</a>'
			}
			%}
		</div>
	</div>
</div>

% rc ./tpl/footer.rc
