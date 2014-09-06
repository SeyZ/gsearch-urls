'use strict';

var async = require('async');
var cheerio = require('cheerio');
var request = require('request');

function Google(opts) {

  function buildUrl() {
    var url = 'https://www.google.com/search';
    var queryParams = [];

    if (opts.lang) { queryParams.push('hl=' + opts.lang); }
    if (opts.limit) { queryParams.push('num=' + opts.limit); }
    if (opts.q) { queryParams.push('q=' + opts.q); }

    if (queryParams.length) {
      url += '?' + queryParams.join('&');
    }

    return url;
  }

  function search(callback) {
    request(buildUrl(), function (err, response, body) {
      callback(err, body);
    });
  }

  function extractUrls(html, callback) {
    var ret = [];
    var $ = cheerio.load(html);
    var urls = $('h3.r a');

    $(urls).each(function (i, url) {
      var cleaned = $(url).attr('href').match(/(?=http).*(?=&sa)/);
      if (cleaned !== null) {
        ret.push(cleaned[0]);
      }
    });

    callback(null, ret);
  }

  /**
   * Returns an array of url string according to the opts.
   */
  this.getUrls = function (callback) {
    async.waterfall([
      function (cb) {
        search(cb);
      },
      function (html, cb) {
        extractUrls(html, cb);
      }
    ], callback);
  };
}

module.exports = Google;
