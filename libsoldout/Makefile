PREFIX=/usr
MAN=${PREFIX}/share/man

CC=cc
CFLAGS=-Wall -O3
LDFLAGS=

all: mkd2html

mkd2html: *.c
	$(CC) *.c $(CFLAGS) $(LDFLAGS) -o mkd2html

install: all
	@echo installing executable to ${PREFIX}/bin
	mkdir -p $(PREFIX)/bin
	cp -f mkd2html $(PREFIX)/bin
	chmod 755 $(PREFIX)/bin/mkd2html
	@echo installing manpage to ${MAN}/man1
	mkdir -p $(MAN)/man1
	cp -f mkd2html.1 $(MAN)/man1/
	chmod 644 $(MAN)/man1/mkd2html.1

uninstall:
	rm -f $(PREFIX)/bin/mkd2html
	rm -f $(MAN)/man1/mkd2html.1

clean:
	rm -f mkd2html

.PHONY: all mkd2html install uninstall clean
