CC=cc
CFLAGS=-O3

all: bin/mkd2html

bin/mkd2html: libsoldout/*.c
	$(CC) $(CFLAGS) libsoldout/*.c -o bin/mkd2html
