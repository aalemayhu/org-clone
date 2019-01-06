lint:
	npm run lint

test:
	npm run test

publish: lint test
	npm publish --access=public
