% cat tpl/header.inc

<div class="swallow">
<div class="post">
%{
# we expect $1 to carry the markdown filename.
target=`{echo $1 | sed -e 's:lib/\(.*\).md:\1.html:g'}
echo '<a href="' ^ $target ^ '">'
sed 1q $1 | ./bin/mkd2html
echo '</a>'
sed -n  '2, $p' $1 | ./bin/mkd2html
%}
</div>
</div>

% cat tpl/footer.inc
