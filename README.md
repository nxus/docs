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
