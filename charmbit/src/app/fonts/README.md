# Fonts

`fraunces-soft.woff2` and `fraunces-soft-italic.woff2` are Fraunces, Copyright 2020
The Fraunces Project Authors (https://github.com/undercasetype/Fraunces), licensed
under the SIL Open Font License, Version 1.1 (https://openfontlicense.org).

They are the Latin subset of the Google Fonts build, instanced with fontTools to
make them smaller: the SOFT axis is fixed at 100 (the soft look the site uses) and
weight is limited to 400–800. Optical size (9–144) is kept.

```bash
fonttools varLib.instancer Fraunces-latin.woff2 SOFT=100 wght=400:800 -o fraunces-soft.woff2
```
