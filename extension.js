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
const Gio = imports.gi.Gio;
const Util = imports.misc.util;

function FileOrURLSearchProvider() {
    this._init();
}

FileOrURLSearchProvider.prototype = {
    __proto__: Search.SearchProvider.prototype,

    _init: function(name) {
        Search.SearchProvider.prototype._init.call(this, "FILES & URLS");
    },

    getSubsearchResultSet: function(previousResults, newTerms) {
        return this.getInitialResultSet(newTerms);
    },

    getInitialResultSet: function(terms) {
        let results = [];

        terms.forEach(function(term) {
            let arg = term.replace(/^~/, GLib.get_home_dir());
            let file = Gio.File.new_for_commandline_arg(arg);

            if (file.query_exists(null)) {
                results.push(file);
            }
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
        //let app = result.query_default_handler(null);
        let app = Shell.AppSystem.get_default().lookup_app('firefox.desktop');
        let meta = {
            'id': result,
            'name': result.get_uri(),
            'createIcon': function(size) {
                return app.create_icon_texture(size);
            }
        };

        return meta;
    },

    activateResult: function(id) {
        let app = id.query_default_handler(null);
        app.launch([id], null);
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
