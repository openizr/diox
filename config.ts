/**
 * Copyright 2018 - present, Matthieu Jabbour <matthieu.jabbour@gmail.com>.
 * All rights reserved.
 */


// tslint:disable-next-line no-var-requires typedef
const path = require('path');


module.exports = {
  target: 'node',
  entry: {
    main: './scripts/main.ts',
  },
  srcPath: path.resolve(__dirname, 'src'),
  distPath: path.resolve(__dirname, 'dist'),
  banner: '/*!\n * Copyright © 2018 - present, Matthieu Jabbour <matthieu.jabbour@gmail.com>.\n * All rights reserved.\n */',
};
