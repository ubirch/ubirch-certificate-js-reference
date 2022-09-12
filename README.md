# Ubirch Certification JS Reference

A reference implementation for creating and verifying UBIRCH self-contained certificates in JavaScript/TypeScript.

## Specification

![UBIRCH self-contained certificate specification](doc/ubirch_certificate-Certificate-Spec.png)

## Run this project

### Prerequisites

You need [Node and NPM been installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on your system.

You need to contact the UBIRCH Support support@ubirch.com to get a client certificate, identity UUID and access token for stage DEMO.

Install the client certificate on your computer.

Insert your identity UUID and access token in your `environment.ts`:

```
      device: '<YOUR_DEMO_DEVICE_UUID>',
      token: '<YOUR_DEMO_VERIFICATION_TOKEN>'
```


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

### Prerequisites

You need [Node and NPM been installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) on your system.

You need to contact the UBIRCH Support

## UBIRCH Certificate Creation

### Certificate Creation Process

![UBIRCH certificate creation process](doc/ubirch_certificate-Certification-Process.png)

The resulting certificate will look like this:

```text
C01:6BFN80%20:DWZH4C52MK3O3V35HA-HK3QGVES:L39KE8UIX4NTKT3E$BLLA7:/6OF6JT6PEDYMK4I6..DF$DNTL7%E7WENJEY34MECK OL:UATRVS33UCHALYV2TFESVA8AEP/7PM36/HF17L23XUMVSK8:7%ZB7ABR+SA37FECFLAMCB.5UOUTS+A.TI8H9-EBLHQ*%H5FJHG7
```

## UBIRCH Certificate Verification

For the verification part it uses
[@ubirch/ubirch-verification-js NPM package](https://www.npmjs.com/package/@ubirch/ubirch-verification-js)
to verify the created unchained UPP. For more documentation and details about verification look
[here](https://developer.ubirch.com/ubirch-verification-js/).

> Due to processing time in the UBIRCH backend, it is possible for the verification of a certificate to fail shortly
> after its creation.

### Certificate Verification Process

![UBIRCH certificate verification process](doc/ubirch_certificate-Verification-Process.png)

[^1]: Contact support@ubirch.com to get a client certificate, identity UUID and access token.
