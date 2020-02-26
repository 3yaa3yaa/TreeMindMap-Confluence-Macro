define('com/example/plugins', ['ajs', 'jquery'], function (AJS, $){
    "use strict";

    return {
        init : function(ed) {
            // create new group
            $("#rte-toolbar .toolbar-primary").append($("<ul class='aui-buttons'></ul>")
                .addClass("rte-toolbar-group-example"));

            ed.addCommand('mceExample', function() {
                alert('button pressed');
            });
            // Register button in a new group
            ed.addButton('confluence-example-button', {
                //default value of "toolbar" is "toolbar-primary"
                title: "",
                tooltip: AJS.I18n.getText("com.example.plugins.tutorial.confluence.tinymce-example.example.button.tooltip"),
                cmd: "mceExample",
                className: "example",
                icon: "aui-icon aui-icon-small aui-iconfont-addon",
                locationGroup: "rte-toolbar-group-example",
                weight: 0
            });
        },
        getInfo : function() {
            return {
                longname : 'Example',
                author : 'Atlassian',
                authorurl : 'http://www.atlassian.com',
                version : tinymce.majorVersion + "." + tinymce.minorVersion
            };
        }
    }
});

require('confluence/module-exporter')
    .safeRequire('com/example/plugins', function(ExamplePlugin) {
        var tinymce = require('tinymce');

        tinymce.create('tinymce.plugins.ExamplePlugin', ExamplePlugin);

        // Register plugin
        tinymce.PluginManager.add('example', tinymce.plugins.ExamplePlugin);

        require('confluence-editor/loader/tinymce-bootstrap').addTinyMcePluginInit(function(settings) {
            settings.plugins += ",example";
        });
    });