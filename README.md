# Ubirch Certification JS Reference Example

This is a collection of example pages of ubirch certification and verification process with:
* unchained UPPs

For the verification part it uses
[@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js)
to verify the created unchained UPP. For more documentation and details about verification look
[here](https://developer.ubirch.com/ubirch-verification-js/).

## Run this project

### Prerequisites

You need [Node and NPM been installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on your system.

### Run NPM project locally with Webpack Dev Server

Clone this project and call from root directory

    npm install

To start the examples call

    npm start

Open your web browser on

    http://localhost:9333/

### Build

Run

```
npm run build
```

or

```
npm run build:dev
```

Pages will be build into the `./dist` folder.
This folder can be safely moved to any other location after the build, accordingly to project needs.

## Documentation

### How to build your own certification pages
TODO!!!

### How to build your own verification pages

Detailed documentation how to build your own verification page for UBIRCH UPPs can be found in the
[documentation of the ubirch-verification-js](https://developer.ubirch.com/ubirch-verification-js/) of the used
[@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js).

## Troubleshooting

If you have any problems compiling or executing this examples, try to solve any problems in the main project first by:

- calling `npm install` in the root directory
