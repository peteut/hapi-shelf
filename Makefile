LAB = node_modules/lab/bin/lab
COVERALLS = node_modules/.bin/coveralls

test:
	@node $(LAB) -v

test-cov:
	@node $(LAB) -t 100 -v
	$(if $(TRAVIS), $(MAKE) coveralls)

coveralls:
	@node $(LAB) -r lcov | $(COVERALLS)

test-cov-junit:
	@node $(LAB) -t 100 -r junit -o test-reports.xml -v

test-cov-html:
	@node $(LAB) -r html -o coverage.html -v

lint:
	@node $(LAB) -L -v

test-jenkins: test-cov-junit lint

.PHONY: test test-cov test-cov-junit test-cov-html lint test-jenkins
