# quay

Welcome to the quay backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/quay](http://localhost:3000/quay).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Plugin configuration
To configure the plugin, set the properties in `app-config.yaml` under `quay-backend-plugin` section. The `url` property refers to the quay url, `token` refers to quay authentication token.

The plugin exposes the following operations:

### Get Quay Repository By Name

The url for the command is: http://localhost:7008/quay/get/${namespace}/${repository}

```shell
curl -H "Content-Type: application/json" http://localhost:7008/quay/get/dum_tmp_1/quay-1111
```

### Create Quay Repository

The url for the command is: http://localhost:7008/quay/create

The payload of the request is:

`namespace` - The organization name.

`repository` - The repo name.

`description` - The repo description.

`visibility` - The repo visibility.

```shell
curl -X POST -H "Content-Type: application/json" -d '{"namespace": "dum_tmp_1","repository": "quay-1111","description": "test repo","visibility": "public"}' http://localhost:7008/quay/create
```

### Update Quay Repository

The url for the command is: http://localhost:7008/quay/update/${namespace}/${repository}

The payload of the request is:

`description` - The repo description.

```shell
curl -X PUT -H "Content-Type: application/json" -d '{"description": "updated test repo"}' http://localhost:7008/quay/update/dum_tmp_1/quay-1111
```

### Delete Quay Repository

The url for the command is: http://localhost:7008/quay/delete/${namespace}/${repository}

```shell
curl -X DELETE -H "Content-Type: application/json" http://localhost:7008/quay/delete/dum_tmp_1/quay-1111
```
