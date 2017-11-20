MAKE_FILE_HEADER(The makefile for midori project, Wed Nov 15 12:02:08 2017)

MAKE_INIT

MAKE_JS_INIT

MAKE_MARKDOWN_INIT

MAKE_SECTION_HEADER(CONSTANTS)

SCSS_SRC := FIND_FILES(src, *.scss) FIND_FILES(tests, *.scss)

SCSS_MODULES := $(shell ./src/index.js -o include)

SCSS_OPTIONS := --sourcemap=inline $(SCSS_MODULES)

TEST_SCSS := tests/css/test.scss

TEST_SCSS_DIST := tests/css/test.css

MAKE_SECTION_HEADER(Patterns)

WEB_MAKE_PATTERNS

MARKDOWN_MAKE_PATTERNS(macros/markdown.m4)

MAKE_SECTION_HEADER(Tasks)

MAKE_BODY
