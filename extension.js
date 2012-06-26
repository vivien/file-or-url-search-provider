/*
 * File or URL Search Provider
 *
 * ----------------------------------------------------------------------------
 * "THE BEER-WARE LICENSE" (Revision 42):
 * <vivien@didelot.org> wrote this file. As long as you retain this notice you
 * can do whatever you want with this stuff. If we meet some day, and you think
 * this stuff is worth it, you can buy me a beer in return Vivien Didelot
 * ----------------------------------------------------------------------------
 */

const Main = imports.ui.main;
const Search = imports.ui.search;
const Shell = imports.gi.Shell;
const GLib = imports.gi.GLib;
const Util = imports.misc.util;

function FileOrURLSearchProvider() {
    this._init();
}

FileOrURLSearchProvider.prototype = {
    __proto__: Search.SearchProvider.prototype,

    _init: function(name) {
        Search.SearchProvider.prototype._init.call(this, "FILES & URLS");

        this._appSys = Shell.AppSystem.get_default();
        this._appWebBrowser = this._appSys.lookup_app('firefox.desktop');
        this._appFiles = this._appSys.lookup_app('nautilus.desktop');
    },

    _getURLs: function(path) {
        let urls = [];

        if (path.match(/^[^~\/].*\.[a-z]{2,3}\b/)) {
            let url = path.match(/^https?:\/\//) ? path : 'http://' + path;
            urls.push(url);
        }

        return urls;
    },

    _getFiles: function(path) {
        let paths = [];
        path = path.replace(/^~/, GLib.get_home_dir());

        if (GLib.file_test(path, GLib.FileTest.EXISTS)) {
            paths.push(path);
        }

        return paths;
    },

    getSubsearchResultSet: function(previousResults, newTerms) {
        return this.getInitialResultSet(newTerms);
    },

    getInitialResultSet: function(terms) {
        let that = this;
        let results = [];

        terms.forEach(function(term) {
            results = results.concat(that._getFiles(term));
            results = results.concat(that._getURLs(term));
        });

        return results;
    },

    getResultMetas: function(results) {
        let that = this;

        return results.map(function(result) {
            return that._getResultMeta(result);
        });
    },

    _getResultMeta: function(result) {
        let app = result.match(/^https?:\/\//) ? this._appWebBrowser : this._appFiles;
        let meta = {
            'id': result,
            'name': result,
            'createIcon': function(size) {
                return app.create_icon_texture(size);
            }
        };

        return meta;
    },

    activateResult: function(id) {
        Util.spawn(['xdg-open', id]);
    }
};

let searchProvider;

function init(meta) {
    searchProvider = new FileOrURLSearchProvider();
}

function enable() {
    Main.overview.addSearchProvider(searchProvider);
}

function disable() {
    Main.overview.removeSearchProvider(searchProvider);
}
