'use strict';

const glob = require('glob');
const path = require('path');
const sh = require('shelljs');
const nunjucks = require('nunjucks');
const mdutils = require('../utils/mdutils.js');
const futils = require('./../utils/futils');

const LearningObject = require('./learningobject.js').LearningObject;

class Chapter {
  constructor(fileName) {
    this.file = fileName;
    this.title = mdutils.getHeader(fileName);
    this.shortTitle = fileName.substring(fileName.indexOf('.') + 1, fileName.lastIndexOf('.'));
    this.content = mdutils.parse(fileName);
    this.contentWithoutHeader = mdutils.parseWithoutHeader(fileName);
  }
}

class Lab extends LearningObject {
  constructor(pattern) {
    let mdFiles = glob.sync('*.md').sort();
    if (mdFiles.length === 0) mdFiles = ['error: missing lab'];
    super(path.parse(mdFiles[0]).name);
    this.parentFolder = futils.getParentFolder();
    if (mdFiles[0] != 'error: missing lab') this.chapters = this.harvestChapters(mdFiles);
    this.directories = futils.getDirectories('.');
    this.img = futils.getImageFile('img/main');
    this.icon = 'lab';
    this.credits = futils.getCredits();
  }

  harvestChapters(mdFiles) {
    const chapters = [];
    mdFiles.forEach(chapterName => {
      const chapter = {
        file: chapterName,
        title: mdutils.getHeader(chapterName),
        shortTitle: chapterName.substring(chapterName.indexOf('.') + 1,
            chapterName.lastIndexOf('.')),
        content: mdutils.parse(chapterName),
        contentWithoutHeader: mdutils.parseWithoutHeader(chapterName),
      };
      chapters.push(chapter);
    });
    this.title = chapters[0].shortTitle;
    return chapters;
  }

  publish (basepath) {
    if (this.chapters) console.log('  -->' + this.chapters[0].shortTitle);
    const path = '../' + basepath + '/' + this.folder;
    futils.initEmptyPath(path);
    this.directories.forEach(directory => {
      futils.copyFolder(directory, path + '/');
    });
    futils.writeFile(path + '/index.html', nunjucks.render('lab.html', this));
  }
}

module.exports.Lab = Lab;
