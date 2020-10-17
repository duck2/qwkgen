% rc ./tpl/header.rc

%{
fn mkhtml { 9 basename $1 | 9 sed -e 's:(.*).md:\1.html:g' }
fn mkdate { 9 basename $1 | 9 sed -n -e 's:([0-9]*-[0-9]*-[0-9]*).*:\1:p' }
%}

<div class="swallow">
	<div class="post">
		%{
echo -n '
# gpu

I have always looked with wonder at the magic of GPUs and finally decided to try and make one. However there is no [Mano''s simple GPU](https://en.wikipedia.org/wiki/Mano_machine) and the amount of online resources is significantly less compared to CPUs.

So far, my main resources are [these](https://fgiesen.wordpress.com/2011/07/09/a-trip-through-the-graphics-pipeline-2011-index/) [two](https://fgiesen.wordpress.com/2013/02/17/optimizing-sw-occlusion-culling-index/) series from Fabian Giesen and [this](https://courses.cs.washington.edu/courses/cse467/15wi/) course which is apparently a GPU design project disguised as an advanced digital design course.

This is intended to be an activity log to keep a tab on myself.
' | ./bin/mkd2html
		%}
		<div class="previous">
			%{
			# the first line of the post is always a link to the post page.
			# if the post is longer than $max lines, a read more link is appended.
			max=20
			for(f in `{ls -r lib/gpu/*.md}){
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
