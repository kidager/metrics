# Changelog

## [3.35.1](https://github.com/kidager/metrics/compare/v3.35.0...v3.35.1) (2026-10-12)


### Bug Fixes

* **action:** detect released versions without expr ([728aca5](https://github.com/kidager/metrics/commit/728aca57b3aebdbfb813f8da46ebc188ec5688cf))
* **plugins/lines:** skip the stats delay on mocked data ([23c888c](https://github.com/kidager/metrics/commit/23c888c883882f48c5f9a6af5667aa152abf6319))

## [3.35.0](https://github.com/kidager/metrics/compare/v3.34.0...v3.35.0) (2026-10-11)


### Features

* **action:** pull prebuilt images from ghcr.io/kidager/metrics ([130ebba](https://github.com/kidager/metrics/commit/130ebba2ea54adc97a58285052f11b07e7ba103f))


### Bug Fixes

* **docker:** give puppeteer the absolute Chrome path and install libatomic1 ([47c942d](https://github.com/kidager/metrics/commit/47c942d820398b6f8d28e43e9bb066103040cd8d))
* **docker:** install rugged and nokogiri from apt so licensed needs no native build ([260d4f3](https://github.com/kidager/metrics/commit/260d4f3d8c84c66b6b008c0c23c5ad9b2bad0d6d))
* **docker:** install xz-utils for the nokogiri build ([a572c13](https://github.com/kidager/metrics/commit/a572c139072f899dbd7d187c6c366030d4b26112))
* **docker:** keep recommended packages so the licensed gem builds ([c39e85f](https://github.com/kidager/metrics/commit/c39e85f066cd2af34d6c9146cd656eedb0132b88))
* **metrics:** log plugin errors before failing ([b29ca32](https://github.com/kidager/metrics/commit/b29ca326b5c8aae747f9ba0be730414e987fdda3))
* **metrics:** verify SVG with fast-xml-parser instead of the native libxmljs2 ([8261a38](https://github.com/kidager/metrics/commit/8261a38ebd3035f5d383e51c9abcb0afefc08641))
* **plugins/music:** handle a missing Spotify artwork ([9ed6fc0](https://github.com/kidager/metrics/commit/9ed6fc0635cb6b3024d56ec52c095331aa9d4dab))
