SCSS_MIDORI_FILES := $(call rwildcard, tests, *.midori.scss)
SCSS_MIDORI_DEP_FILES := $(SCSS_MIDORI_FILES:.midori.scss=_dep.scss)

webpack:
	$(SILENT) ./node_modules/.bin/webpack
.PHONY: webpack

t: clean tests/css/grid.css $(SCSS_MIDORI_DEP_FILES)
	$(SILENT) ./chrome.sh reload
.PHONY: t

tests/css/grid.css: $(SCSS_SRC)
	$(SILENT) scss $(SCSS_MODULES) tests/css/grid.scss tests/css/grid.css

test: clean $(TEST_SCSS_DIST)
	$(SILENT) ./chrome.sh reload
.PHONY: test

tests/css/_test_dep.scss: tests/css/_test.midori.scss
	$(SILENT) ./src/index.js -f tests/css/_test.midori.scss > tests/css/_test_dep.scss

test-js:
	$(SILENT) ./src/index.js -o txt -f tests/css/_test.midori.scss
.PHONY: test-js

clean:
	$(SILENT) $(RM) .sass-cache/
	$(SILENT) $(RM) $(SCSS_MIDORI_DEP_FILES)
	$(SILENT) $(RM) $(TEST_SCSS_DIST)
.PHONY: clean

$(TEST_SCSS_DIST): $(SCSS_SRC) tests/css/_test_dep.scss
	$(SILENT) scss $(SCSS_OPTIONS) $(TEST_SCSS) $(TEST_SCSS_DIST)

doc: Readme.md
	$(SILENT) $(CAT) Readme.md
.PHONY: doc
