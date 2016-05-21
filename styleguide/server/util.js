'use strict';

var path = require('path'),
	fs = require('fs'),
    glob = require('glob'),
    _ = require('lodash');

function getCapitalizedString(s) {
    return s.split('-').map(function(word) {
        return word.charAt(0).toUpperCase() + word.substring(1);
    }).join(' ')
}

function getTemplateData(pattern) {
    var dataFiles = glob.sync(pattern),
        data = {};
    dataFiles.forEach(function(file) {
        var key = path.basename(file, '.json');
        data[key] = require(file);
    });
    return data;
}

function normalizeAssetPaths(staticPath, resourcePaths) {
    return resourcePaths.map(function(resourcePath) {
        return resourcePath.indexOf('http') === 0 ? resourcePath : path.join(staticPath, resourcePath);
    });
}

module.exports = {
	getCapitalizedString: getCapitalizedString,
	getTemplateData: getTemplateData,
	normalizeAssetPaths: normalizeAssetPaths
};