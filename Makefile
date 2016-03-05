LAB = node_modules/lab/bin/lab
ARGS = --ignore __core-js_shared__,Intl,core,System,_babelPolyfill,Reflect,regeneratorRuntime
COVERALLS = node_modules/.bin/coveralls
NODE = node

test:
	@$(NODE) $(LAB) $(ARGS) -v

test-cov:
	@$(NODE) $(LAB) $(ARGS) -t 100 -v
	$(if $(TRAVIS), $(MAKE) coveralls)

coveralls:
	@$(NODE) $(LAB) $(ARGS) -r lcov | $(COVERALLS)

test-cov-junit:
	@$(NODE) $(LAB) $(ARGS) -t 100 -r junit -o test-reports.xml -v

test-cov-html:
	@$(NODE) $(LAB) $(ARGS) -r html -o coverage.html -v

lint:
	@$(NODE) $(LAB) $(ARGS) -L -v

.PHONY: test test-cov test-cov-junit test-cov-html lint
