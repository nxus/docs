# Nxus Docs

The repo for the Nxus Documentation. 

Looking for the full documentation? [View the Docs](http://docs.gonxus.org)

## How to use this repo

Assuming all the core modules are in a folder named `modules`, and docs is in a sibling folder named `docs`, like:

```
- nxus/
 |- docs/
  - modules/
   |- core/
   |- admin-ui/
   ....
```

### Generate new docs
To build a new local copy of the docs:

```
> npm run build-docs
```

This will build the documentation for each module in the `modules`
folder and place the output in a subfolder of the `docs` folder.

If the module's `package.json` file defines a `build-shared-docs`
script, it will be used to build the documentation for the module.
If no script is defined, `documentation` will be invoked directly to
build the documentation.

These environment variables are available to the script:
*   `MODULE` - the module subfolder name
*   `NAME` - the module name (from `name` in `package.json`)
*   `VERSION` - the module version (from `version` in `package.json`)
*   `OUTPUT` - the `docs` subfolder output path (where the script should place the documentation)

Here's the default documentation build script:
```
documentation build src/*.js --github --format html --output ${OUTPUT} \
    --name ${NAME} --project-version ${VERSION} --external nxus-*
```

Here's an example documentation build command you might specify for
`build-shared-docs` if you'd defined a `documentation.yml` file to
organize the documentation:
```
NAME=${NAME:-"$(npm view . name)"} VERSION=${VERSION:-"$(npm view . version)"} OUTPUT=${OUTPUT:-\"./docs\"} && \
    documentation build src/*.js --github --format html --output ${OUTPUT} \
    --name ${NAME} --project-version ${VERSION} --config documentation.yml
```
The conditional definitions of `NAME`, `VERSION` and `OUTPUT` allow it
to also be invoked directly using `npm run build-shared-docs`. (To use
this as a script, you'd need to remove the line breaks and escape the
quotes.)

### Serve the docs

```
> npm start
```

This will start a server on port 8080.

### Update & push new docs
To build a new version of the docs and push to github and update the docs website:

```
> npm run update-docs
```
