test:
	@node node_modules/lab/bin/lab -v

test-cov:
	@node node_modules/lab/bin/lab -t 100 -v

test-cov-junit:
	@node node_modules/lab/bin/lab -t 100 -r junit -o test-reports.xml -v

test-cov-html:
	@node node_modules/lab/bin/lab -r html -o coverage.html -v

lint:
	@node node_modules/lab/bin/lab -L -v

test-jenkins: test-cov-junit lint

.PHONY: test test-cov test-cov-junit test-cov-html lint
