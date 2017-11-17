test: clean $(TEST_SCSS_DIST)
	$(SILENT) ./chrome.sh reload
.PHONY: test

tests/css/_test_dep.scss: tests/css/_test.midori.scss
	$(SILENT) ./src/index.js -f tests/css/_test.midori.scss > tests/css/_test_dep.scss

test-js:
	$(SILENT) ./src/index.js -f tests/css/_test.midori.scss
.PHONY: test-js

clean:
	$(SILENT) $(RM) $(TEST_SCSS_DIST)
	$(SILENT) $(RM) tests/css/_test_dep.scss
.PHONY: clean

$(TEST_SCSS_DIST): $(SCSS_SRC) tests/css/_test_dep.scss
	$(SILENT) scss $(SCSS_OPTIONS) $(TEST_SCSS) $(TEST_SCSS_DIST)

doc: Readme.md
	$(SILENT) $(CAT) Readme.md
.PHONY: doc
