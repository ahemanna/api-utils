# API Utils

## Overview

API Utils is an utility built to manage Apigee API proxies. This is built on top of the Apigee [management APIs](https://apidocs.apigee.com/apis).

In the current state the utility supports just one functionality, that is to return the list of API proxies and their revisions using a particular shared flow.

The endpoint is accessible at `http://<host>:<port>/organizations/{org}/environments/{env}/sharedflows/{shared-flow-name}`.

## Usage

Below steps helps you get the utility up and running - 
1. Clone the code to your local machine and navigate to the project root directory
2. Run `npm install`
3. Update the `.env` file
4. Start the server either using `npm run dev` or `node ./src/app.js` commands
5. This should get the server up and running on localhost and configured port

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.