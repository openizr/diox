# Contribution Guide

Thank you for contributing to this repository, your help is greatly appreciated !
In ordrer to keep the project clear and make the contribution process as easy as possible, please
read this contribution guide and follow the described guidelines.


## Table of Contents

[Semantic Versioning](#semantic-versioning)

[Branch organization](#branch-organization)

[Contacts](#contacts)

[Labels naming convention](#labels-naming-convention)
 * [Type](#type)
 * [Status](#status)
 * [Difficulty](#difficulty)

[Reporting bugs](#reporting-bugs)

[Proposing changes](#proposing-changes)

[Pull Requests](#pull-requests)
 * [Naming convention](#naming-convention)
 * [Prerequisities](#prerequisities)

[Development workflow and tools](#development-workflow-and-tools)

[Guidelines](#guidelines)
 * [Typescript](#typescript)
 * [Git commits](#git-commits)

[Project structure](#project-structure)

[License](#license)


## Semantic Versioning

`diox` releases follow [semantic versioning](https://semver.org/).


## Branches organization

`master` is the main branch, and contains latest stable code that passes all the tests. We generate
new releases **from this banch only**. Please do not push your code directly on `master`, open a
pull request first so it can be validated by the community. Branches should be named after the
issue they fix, such as `issue-<ISSUE_ID>`, so it is easier for everyone to understand what they
are meant for. If there is no related issue, please open one (see below).


## Contacts

Feel free to open an issue on this repository, I will reply as soon as I can. You can also contact
me directly on:
  - [Twitter](https://twitter.com/MJaxi0m)
  - [StackOverflow](https://stackoverflow.com/users/13561063/matthieu-jabbour)
  - [LinkedIn](https://www.linkedin.com/in/matthieujabbour)


## Labels naming convention

In order to improve issues management and to make information clearer and easily identifiable, a
set of pre-defined labels has been created. Those labels are strictly structured in three main
groups, each group giving a particular useful information about the issue. It means that for each
issue you open, you must assign it exactly one label of each group, and update them all along the
issue's lifecycle as it evolves.

### Type
 - ![#fbca04](https://place-hold.it/15/fbca04/000000?text=+) **[type: breaking change](https://github.com/openizr/diox/labels/type%3A%20breaking%20change)**:
suggestion for a breaking change, that should be part of a next major release.
 - ![#b60205](https://place-hold.it/15/b60205/000000?text=+) **[type: bug](https://github.com/openizr/diox/labels/type%3A%20bug)**:
 bug reporting, that should be fixed in the next patch.
 - ![#d93f0b](https://place-hold.it/15/d93f0b/000000?text=+) **[type: regression](https://github.com/openizr/diox/labels/type%3A%20regression)**:
 just like bug, except it just showed up in the last release, and must be fixed in the next patch.
 - ![#0052cc](https://place-hold.it/15/0052cc/000000?text=+) **[type: enhancement](https://github.com/openizr/diox/labels/type%3A%20enhancement)**:
 improvement that should be implemented in the next patch.
 - ![#5319e7](https://place-hold.it/15/5319e7/000000?text=+) **[type: feature](https://github.com/openizr/diox/labels/type%3A%20feature)**:
 request for a new feature, that should be added in the next minor release.
 - ![#0e8a16](https://place-hold.it/15/0e8a16/000000?text=+) **[type: question](https://github.com/openizr/diox/labels/type%3A%20question)**:
 question or request for information, which can also help us to improve the documentation.
  - ![#006b75](https://place-hold.it/15/006b75/000000?text=+) **[type: discussion](https://github.com/openizr/diox/labels/type%3A%20discussion)**:
  everything else you want to discuss regarding the project.

### Status
 - ![#d4c5f9](https://place-hold.it/15/d4c5f9/000000?text=+) **[status: duplicate](https://github.com/openizr/diox/labels/status%3A%20duplicate)**:
 another existing issue is treating about the same topic, and should be considered instead.
 - ![#c2e0c6](https://place-hold.it/15/c2e0c6/000000?text=+) **[status: in progress](https://github.com/openizr/diox/labels/status%3A%20in%20progress)**:
 somebody is currently working on this issue, and should (hopefully) perform a PR soon!
 - ![#e99695](https://place-hold.it/15/e99695/000000?text=+) **[status: invalid](https://github.com/openizr/diox/labels/status%3A%20invalid)**:
 issue is either dead, not reproductible, or does not follow the process, and will be closed soon.
 - ![#f9d0c4](https://place-hold.it/15/f9d0c4/000000?text=+) **[status: need more information](https://github.com/openizr/diox/labels/status%3A%20need%20more%20information)**:
 issue is too vague and cannot be managed without further information.
 - ![#c5def5](https://place-hold.it/15/c5def5/000000?text=+) **[status: new](https://github.com/openizr/diox/labels/status%3A%20new)**:
 issue was just submitted, and should be assigned to someone ASAP.
 - ![#fef2c0](https://place-hold.it/15/fef2c0/000000?text=+) **[status: unconfirmed](https://github.com/openizr/diox/labels/status%3A%20unconfirmed)**:
 issue should be considered carefully to determine either it is a real issue or anything else.

### Difficulty
 - ![#3ddb42](https://place-hold.it/15/3ddb42/000000?text=+) **[difficulty: starter](https://github.com/openizr/diox/labels/difficulty%3A%starter)**:
 issue is pretty straightforward, and can be fixed by anyone (good first issue).
 - ![#ea6641](https://place-hold.it/15/ea6641/000000?text=+) **[difficulty: medium](https://github.com/openizr/diox/labels/difficulty%3A%medium)**:
 issue is a bit complex, and requires some knowledge about the project.
 - ![#c13c5b](https://place-hold.it/15/c13c5b/000000?text=+) **[difficulty: challenging](https://github.com/openizr/diox/labels/difficulty%3A%20challenging)**:
 issue is very complex, and requires both good skills and a deep knowledge of the project.


## Reporting bugs

If you think you found a bug in the code, you can open an issue to report it, so the community can
then work to fix it. Before opening a new issue, make sure the topic is not already being discussed
in another issue, to prevent duplicates. Try to be as clear and exhaustive as possible, so people
can quickly understand what is going on. You can use the following guidelines:

 * **Issue title** explaining the bug in a small and concise sentence.
 * **Version** on which you are experiencing the bug.
 * **Test case** to reproduce the bug. You can link a [JSFiddle](https://jsfiddle.net/), [JSBin](https://jsbin.com/), [CodePen](https://codepen.io/#) or any other code snippet to help.
 * **Steps to reproduce** if you don't have any test case link, you can provide a step-by-step process to reproduce the bug.
 * **Expected behaviour** describing what should normally happen.
 * **Actual behaviour** describing what actually happens.
 * **Additional information** like comments, images, GIFs, anything that can help community to correct the issue...

Of course, don't forget to set the correct labels to your issue.


## Proposing changes

As for bugs, feel free to suggest any interesting improvement or new feature. Again, before opening
this kind of request, make sure it is not already a work in progress by checking first the issues
list. You can as well use a similar guideline as the one describe before to make a new request.
Just keep in mind that other contributors have to understand your idea to put it into code.


## Pull Requests

Ready to contribute to the code? That is great, thank you and welcome in the contributors team!
You can create a new branch and open a new pull request to propose your code to the community.

### Naming convention

As for branches name, you should name your pull requests accordingly with the issue they solve
(e.g. `issue-164`). If you wish to give additional information related to that issue, you can fill
the pull request description.

### Prerequisities

To technically contribute to this project, here are the software you will need:
 * A UNIX terminal and an IDE ;)
 * [git](https://git-scm.com/)
 * [docker](https://docs.docker.com/get-docker/)
 * [docker-compose](https://docs.docker.com/compose/install/)


## Development workflow and tools

1. `git clone git@github.com:openizr/diox.git`
2. `cd diox`
3. `cp .env.example .env`
4. Fill or change environment variables in your `.env` file if necessary
5. `docker-compose up`
6. `docker exec -it <PROJECT_NAME>_library sh -c "yarn run test -w"` if you want to run unit tests
7. `docker exec -it <PROJECT_NAME>_playground sh -c "yarn && yarn run dev"` if you want to run playground

This will run the project locally and allow you to develop and see changes in real-time.


# Maintenance

In order to keep this package up-to-date, dependencies updates should be checked and updated regularily,
using the `yarn outdated` and `yarn upgrade-interactive --latest` commands. Here is the list of repositories
changelogs to watch for updates:

- [@types/react](https://github.com/DefinitelyTyped/DefinitelyTyped#readme)
- [@types/path-to-regexp](https://github.com/DefinitelyTyped/DefinitelyTyped#readme)
- [path-to-regexp](https://github.com/pillarjs/path-to-regexp/releases)
- [coveralls](https://github.com/nickmerwin/node-coveralls/releases)
- [react](https://github.com/facebook/react/releases)
- [typescript-dev-kit](https://github.com/openizr/typescript-dev-kit/releases)
- [vue](https://github.com/vuejs/vue/releases)


## Build & Deployment

You don't have to worry about deploying the code and publishing it on `npm`, the CI/CD system does
it for you (using TravisCI). Each time a new release is created on the `master` branch, TravisCI
will automatically build and deploy this release on `npm` with the version you specified in your
release name. Of course, all tests must pass otherwise code won't be deployed. However, if you want
to get an preview of the distributed package, you can run `docker exec <PROJECT_NAME>_library yarn run build`.
Assets will be compiled into the `dist` directory in `library`.


## Guidelines

### Typescript

`diox` codebase follows the [AirBnB Javascript Style Guide](https://github.com/airbnb/javascript).
Several IDE extensions are available to automatically lint your code whenever you save files.

### Git commits

To provide good and clear git commit messages, you should follow [these guidelines](https://chris.beams.io/posts/git-commit/).


## Project structure

Project is structured as follow:
- **`/docs`:** contains the documentation automatically generated from code
- **`library`:** contains the actual library codebase
- **`playground`:** contains a bunch of code samples and allows you to play with the library in real-time while developing it


## License

[MIT](https://github.com/openizr/diox/blob/master/LICENSE)

Copyright (c) Openizr. All Rights Reserved.
