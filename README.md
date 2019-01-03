# github-sync-repos

GitHub tools to synchronize milestones or labels across all organization repositories.

## Prerequisites

- [Node.JS](https://nodejs.org/) v8.x LTS or above.

  The suggested way to install node.js is install [Node Version Manager](https://github.com/creationix/nvm). Follow [this](https://github.com/creationix/nvm#installation) instruction to install.

- GitHub credentials. You can use your username and password, or generate access tokens from [GitHub Settings - Developer Settings - Personal access tokens](https://github.com/settings/tokens).

## Installation

Install stable version from npm registry.

```
npm install github-sync-repos -g
```

To upgrade, you can run the above command again.

## Usage

To find command help, type `gsr -h`:

```shell
$ gsr -h
Usage: gsr [options] <command> [command-options]

Commands:
  gsr ls-labels [repository]      List labels of a repository.
  gsr ls-milestones [repository]  List milestones of a repository.
  gsr ls-repos                    List repositories of organization or user.

GitHub:
  --organization   Github organization name.
  --template-repo  Github template repository name.
  --username, -u   Github account username. Required if API token is empty.
  --password, -p   Github account password. Required if API token is empty.
  --token          Github API token. Required if username is empty.

Options:
  --version      Show version number                                   [boolean]
  --config       Path to JSON config file
  --format       Response format. Available values are: plain, json.
                                                              [default: "plain"]
  --verbose, -v  Show more processing details.        [boolean] [default: false]
  -h, --help     Show help                                             [boolean]
```

For each commands, you can type `gsr ls-labels -h` to get more detail helps.

## Provide GitHub Crendentials

There are several ways to provide command line options. The priority of finding options are (from top to low):

1. Command line options,
2. Environment variables on command line,
3. Environment variables defined in .env file,
4. Config json file,
5. Default option value shown in `gsr -h`.

### With Command Line Options

You can use `gsr --token <my-api-token> <command>` to specify API token in command line.

### With Environement Variable

Use `GSR_` to prefix your capitalized option name as environment variable name. For example:

```
$ GSR_TOKEN=<my-api-token> GSR_ORGANIZATION=<my-org-name> GSR_TEMPLATE_REPO=<tpl> gsr ls-repos
```

If you are using Windows, you will need [cross-env](https://www.npmjs.com/package/cross-env). Install with command `npm install --g cross-env` then you can prefix the above command with `cross-env`. For example:

```
$ cross-env GSR_TOKEN=<my-api-token> GSR_ORGANIZATION=<my-org-name> GSR_TEMPLATE_REPO=<tpl> gsr ls-repos
```

### With .env File

You can put `GSR_*` environment variables into a `.env` file. **Please note, the `.env` has to be in same folder where you issue `gsr` command.**

For example, create a `.env` file with this content and put into folder where you usually run your `gsr` command:

```
GSR_ORGANIZATION=<my-org>
GSR_TEMPLATE_REPO=<my-tpl-repo>
GSR_TOKEN=<my-api-token>
```

### With config json File

You can create a config json file with key/value of option name/value. For example, create a `~/.config/gsr.json` with this content:

```json
{
  "organization": "<my-org>",
  "template-repo": "<my-tpl-repo>",
  "token": "<my-api-token>"
}
```

Then use this command to use the config file:

```shell
$ gsr --config ~/.config/gsr.json [command]
```
