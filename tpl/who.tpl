% rc ./tpl/header.rc

<div class="swallow">
	<div class="post">
		<a href="who.html"><h1>who?</h1></a>
		%{
		echo -n '
ECE with a focus on FPGAs and custom accelerators.

Things I particularly like are [Acme](http://acme.cat-v.org/), computer graphics, chemistry and [open source FPGA tooling](https://symbiflow.github.io/).

My projects can be found on this blog and my [GitHub page](https://github.com/duck2).
' | ./bin/mkd2html
		%}
	</div>
</div>

% rc ./tpl/footer.rc
