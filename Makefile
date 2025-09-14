
PACKAGE := package.json

.PHONY: install, build

install:
	npm install --force

build:
	VITE_ENVIRONMENT=prod npm run build
	cd ./dist && \
		mv ./igms2/assets ./ && \
		rmdir ./igms2
	@VERSION=$$(jq -r '.version' $(PACKAGE)); \
	tar -zcvf builds/build-igms$${VERSION}.tar.gz ./dist