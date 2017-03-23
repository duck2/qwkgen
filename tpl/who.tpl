% cat tpl/header.inc

<div class="swallow">
<div class="post">
<a href="who.html"><h1>who?</h1></a>

%{
echo -n '

duck2 is eee student occasionally poking around with CS concepts.

I currently find [modern portfolio theory][port] to be a nice approximation of stuff.

Things I particularly like: Simple software. languages without stdlib. graphics. [Acme][acme].<br>
Things I particularly dislike: Java, C#, the whole npm ecosystem, FSF.

here is my [twitter][twitter], [github][gh]. I take the lib- prefix if duck2 is taken before.

[port]: https://en.wikipedia.org/wiki/Modern_portfolio_theory
[acme]: http://acme.cat-v.org/
[twitter]: https://twitter.com/libduck2
[gh]: https://github.com/libduck2

' | ./bin/mkd2html
%}

</div>
</div>
<hr />
<div class="footer">
generator is <a href="https://github.com/libduck2/qwkgen">qwkgen</a>. all text is licensed under CC0.
</div>
