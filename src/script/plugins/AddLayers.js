/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @requires plugins/Tool.js
 * @requires widgets/NewSourceDialog.js
 * @requires widgets/FeedSourceDialog.js
 * @requires plugins/GeoNodeCatalogueSource.js
 * @requires widgets/CatalogueSearchPanel.js
 * @requires plugins/TMSSource.js
 * @requires plugins/ArcRestSource.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = AddLayers
 */

/** api: (extends)
 *  plugins/Tool.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: AddLayers(config)
 *
 *    Plugin for removing a selected layer from the map.
 *    TODO Make this plural - selected layers
 */
gxp.plugins.AddLayers = Ext.extend(gxp.plugins.Tool, {
    
    /** api: ptype = gxp_addlayers */
    ptype: "gxp_addlayers",
    
    /** api: config[addActionMenuText]
     *  ``String``
     *  Text for add menu item (i18n).
     */
    addActionMenuText: "Add layers",

    /** api: config[findActionMenuText]
     *  ``String``
     *  Text for find menu item (i18n).
     */
    findActionMenuText: "Find layers",

    /** api: config[addActionMenuText]
     *  ``String``
     *  Text for add feed menu item (i18n).
     */
    addFeedActionMenuText: "Add feeds",

    /** api: config[addActionTip]
     *  ``String``
     *  Text for add action tooltip (i18n).
     */
    addActionTip: "Add layers",
    
    /** api: config[addActionText]
     *  ``String``
     *  Text for the Add action. None by default.
     */
   
    /** api: config[addServerText]
     *  ``String``
     *  Text for add server button (i18n).
     */
    addServerText: "Add a New Server",

    /** api: config[addButtonText]
     *  ``String``
     *  Text for add layers button (i18n).
     */
    addButtonText: "Add layers",
    
    /** api: config[untitledText]
     *  ``String``
     *  Text for an untitled layer (i18n).
     */
    untitledText: "Untitled",

    /** api: config[addLayerSourceErrorText]
     *  ``String``
     *  Text for an error message when WMS GetCapabilities retrieval fails (i18n).
     */
    addLayerSourceErrorText: "Error getting {type} capabilities ({msg}).\nPlease check the url and try again.",

    /** api: config[availableLayersText]
     *  ``String``
     *  Text for the available layers (i18n).
     */
    availableLayersText: "Available Layers",

    /** api: config[searchText]
     *  ``String``
     *  Text for the search dialog title (i18n).
     */
    searchText: "Search for layers",

    /** api: config[expanderTemplateText]
     *  ``String``
     *  Text for the grid expander (i18n).
     */
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
    
    /** api: config[panelTitleText]
     *  ``String``
     *  Text for the layer title (i18n).
     */
    panelTitleText: "Title",

    /** api: config[layerSelectionText]
     *  ``String``
     *  Text for the layer selection (i18n).
     */
    layerSelectionText: "View available data from:",
    
    /** api: config[instructionsText]
     *  ``String``
     *  Text for additional instructions at the bottom of the grid (i18n).
     *  None by default.
     */
    
    /** api: config[doneText]
     *  ``String``
     *  Text for Done button (i18n).
     */
    doneText: "Done",

    /** api: config[search]
     *  ``Object | Boolean``
     *  If provided, a :class:`gxp.CatalogueSearchPanel` will be added as a
     *  menu option. This panel will be constructed using the provided config.
     *  By default, no search functionality is provided.
     */

    /** api: config[feeds]
     *  ``Object | Boolean``
     *  If provided, a :class:`gxp.FeedSourceDialog` will be added as a
     *  menu option. This panel will be constructed using the provided config.
     *  By default, no feed functionality is provided.
     */

    /** api: config[upload]
     *  ``Object | Boolean``
     *  If provided, a :class:`gxp.LayerUploadPanel` will be made accessible
     *  from a button on the Available Layers dialog.  This panel will be 
     *  constructed using the provided config.  By default, no upload 
     *  button will be added to the Available Layers dialog.
     */
    
    /** api: config[uploadRoles]
     *  ``Array`` Roles authorized to upload layers. Default is
     *  ["ROLE_ADMINISTRATOR"]
     */
    uploadRoles: ["ROLE_ADMINISTRATOR"],
    
    /** api: config[uploadText]
     *  ``String``
     *  Text for upload button (only renders if ``upload`` is provided).
     */
    uploadText: "Upload layers",

    /** api: config[nonUploadSources]
     *  ``Array``
     *  If ``upload`` is enabled, the upload button will not be displayed for 
     *  sources whose identifiers or URLs are in the provided array.  By 
     *  default, the upload button will make an effort to be shown for all 
     *  sources with a url property.
     */

    /** api: config[relativeUploadOnly]
     *  ``Boolean``
     *  If ``upload`` is enabled, only show the button for sources with relative
     *  URLs (e.g. "/geoserver").  Default is ``true``.
     */
    relativeUploadOnly: true,
    
    /** api: config[uploadSource]
     *  ``String`` id of a WMS source (:class:`gxp.plugins.WMSSource') backed
     *  by a GeoServer instance that all uploads will be sent to. If provided,
     *  an Upload menu item will be shown in the "Add Layers" button menu.
     */
    
    /** api: config[postUploadAction]
     *  ``String|Object`` Either the id of a plugin that provides the action to
     *  be performed after an upload, or an object with ``plugin`` and
     *  ``outputConfig`` properties. The ``addOutput`` method of the plugin
     *  referenced by the provided id (or the ``plugin`` property) will be
     *  called, with the provided ``outputConfig`` as argument. A usage example
     *  would be to open the Styles tab of the LayerProperties dialog for a WMS
     *  layer:
     *
     *  .. code-block:: javascript
     *  
     *      postUploadAction: {
     *          plugin: "layerproperties",
     *          outputConfig: {activeTab: 2}
     *      }
     */

    /** api: config[startSourceId]
     * ``Integer``
     * The identifier of the source that we should start with.
     */
    startSourceId: null,

    /** api: config[catalogSourceKey]
     *  ``String`` When lazy layerRecords are created by the 'Find Layers'
     *  function, they can optionally be associated with another source. 
     *  E.g. the 'local' source in GeoNode client.
     */
    catalogSourceKey: null,
    
    /** private: property[selectedSource]
     *  :class:`gxp.plugins.LayerSource`
     *  The currently selected layer source.
     */
    selectedSource: null,
    
    /** private: property[addServerId]
     *  ``String`` Id of the record in the sourceComboBox that is used to
     *  add a new source.
     */
    addServerId: null,

    /** private: method[constructor]
     */
    constructor: function(config) {
        this.addEvents(
            /** api: event[sourceselected]
             *  Fired when a new source is selected.
             *
             *  Listener arguments:
             *
             *  * tool - :class:`gxp.plugins.AddLayers` This tool.
             *  * source - :class:`gxp.plugins.LayerSource` The selected source.
             */
            "sourceselected"
        );
        gxp.plugins.AddLayers.superclass.constructor.apply(this, arguments);        
    },
    
    /** api: method[addActions]
     */
    addActions: function() {
        var commonOptions = {
            tooltip : this.addActionTip,
            text: this.addActionText,
            menuText: this.addActionMenuText,
            disabled: true,
            iconCls: "gxp-icon-addlayers"
        };
        var options, uploadButton;
        if (this.initialConfig.search || (this.uploadSource)) {
            var items = [new Ext.menu.Item({
                iconCls: 'gxp-icon-addlayers', 
                text: this.addActionMenuText, 
                handler: this.showCapabilitiesGrid, 
                scope: this
            })];
            if (this.initialConfig.search) {
                items.push(new Ext.menu.Item({
                    iconCls: 'gxp-icon-addlayers', 
                    text: this.findActionMenuText,
                    handler: this.showCatalogueSearch,
                    scope: this
                }));
            }
            if (this.initialConfig.feeds) {
                items.push(new Ext.menu.Item({
                    iconCls: 'gxp-icon-addlayers',
                    text: this.addFeedActionMenuText,
                    handler: this.showFeedDialog,
                    scope: this
                }));
            }
            if (this.uploadSource) {
                uploadButton = this.createUploadButton(Ext.menu.Item);
                if (uploadButton) {
                    items.push(uploadButton);
                }
            }
            options = Ext.apply(commonOptions, {
                menu: new Ext.menu.Menu({
                    items: items
                })
            });
        } else {
            options = Ext.apply(commonOptions, {
                handler : this.showCapabilitiesGrid,
                scope: this
            });
        }
        var actions = gxp.plugins.AddLayers.superclass.addActions.apply(this, [options]);
        
        this.target.on("ready", function() {
            if (this.uploadSource) {
                var source = this.target.layerSources[this.uploadSource];
                if (source) {
                    this.setSelectedSource(source);
                } else {
                    delete this.uploadSource;
                    if (uploadButton) {
                        uploadButton.hide();
                    }
                    // TODO: add error logging
                    // throw new Error("Layer source for uploadSource '" + this.uploadSource + "' not found.");
                }
            }
            actions[0].enable();
        }, this);
        return actions;
    },

    /** api: method[showCatalogueSearch]
     * Shows the window with a search panel.
     */
    showCatalogueSearch: function() {
        var selectedSource = this.initialConfig.search.selectedSource;
        var sources = {};
        for (var key in this.target.layerSources) {
            var source = this.target.layerSources[key];
            if (source instanceof gxp.plugins.CatalogueSource) {
                var obj = {};
                obj[key] = source;
                Ext.apply(sources, obj);
            }
        }
        var output = gxp.plugins.AddLayers.superclass.addOutput.apply(this, [{
            sources: sources,
            title: this.searchText,
            height: 300,
            width: 315,
            selectedSource: selectedSource,
            xtype: 'gxp_cataloguesearchpanel',
            map: this.target.mapPanel.map
        }]);
        output.on({
            'addlayer': function(cmp, sourceKey, layerConfig) {
                var source = this.target.layerSources[sourceKey];
                var bounds = OpenLayers.Bounds.fromArray(layerConfig.bbox);
                var mapProjection = this.target.mapPanel.map.getProjection();
                var bbox = bounds.transform(layerConfig.srs, mapProjection);
                layerConfig.srs = mapProjection;
                layerConfig.bbox = bbox.toArray();
                layerConfig.source = this.initialConfig.catalogSourceKey !== null ?
                    this.initialConfig.catalogSourceKey : sourceKey;
                var record = source.createLayerRecord(layerConfig);
                this.target.mapPanel.layers.add(record);
                if (bbox) {
                    this.target.mapPanel.map.zoomToExtent(bbox);
                }
            },
            scope: this
        });
        var popup = output.findParentByType('window');
        popup && popup.center();
        return output;
    },
        
    /** api: method[showCapabilitiesGrid]
     * Shows the window with a capabilities grid.
     */
    showCapabilitiesGrid: function() {
        if(!this.capGrid) {
            this.initCapGrid();
        } else if (!(this.capGrid instanceof Ext.Window)) {
            this.addOutput(this.capGrid);
        }
        this.capGrid.show();
    },

    /** api: method[showFeedDialog]
     * Shows the window with a dialog for adding feeds.
     */
    showFeedDialog: function() {
        if(!this.feedDialog) {
            var Cls = this.outputTarget ? Ext.Panel : Ext.Window;
            this.feedDialog = new Cls(Ext.apply({
                closeAction: "hide",
                autoScroll: true,
                title: this.addFeedActionMenuText,
                items: [{
                    xtype: "gxp_feedsourcedialog",
                    target: this.target,
                    listeners: {
                        'addfeed':function (ptype, config) {
                            var sourceConfig = {"config":{"ptype":ptype}};
                            if (config.url) {
                                sourceConfig.config["url"] = config.url;
                            }
                            var source = this.target.addLayerSource(sourceConfig);
                            config.source = source.id;
                            var feedRecord = source.createLayerRecord(config);
                            this.target.mapPanel.layers.add([feedRecord]);
                            this.feedDialog.hide();
                        },
                        scope: this
                    }
                }]
            }, this.initialConfig.outputConfig));
            if (Cls === Ext.Panel) {
                this.addOutput(this.feedDialog);
            }
        }
        if (!(this.feedDialog instanceof Ext.Window)) {
            this.addOutput(this.feedDialog);
        }
        this.feedDialog.show();
    },

    /**
     * private: method[initCapGrid]
     * Constructs a window with a capabilities grid.
     */
    initCapGrid: function() {
        var source, data = [], target = this.target;        
        for (var id in target.layerSources) {
            source = target.layerSources[id];
            if (source.store && !source.hidden) {
                data.push([id, source.title || id, source.url]);                
            }
        }
        var sources = new Ext.data.ArrayStore({
            fields: ["id", "title", "url"],
            data: data
        });

        var expander = this.createExpander();
        
        function addLayers() {
            var source = this.selectedSource;
            var records = capGridPanel.getSelectionModel().getSelections();
            var recordsToAdd = [],
                numRecords = records.length;
            function collectRecords(record) {
                if (recordsToAdd) {
                    recordsToAdd.push(record);
                }
                numRecords--;
                if (numRecords === 0) {
                    this.addLayers(recordsToAdd);
                }
            }
            for (var i=0, ii=records.length; i<ii; ++i) {
                var record = source.createLayerRecord({
                    name: records[i].get("name"),
                    source: source.id
                }, collectRecords, this);
                if (record) {
                    collectRecords.call(this, record);
                }
            }
        }
        
        var idx = 0;
        if (this.startSourceId !== null) {
            sources.each(function(record) {
                if (record.get("id") === this.startSourceId) {
                    idx = sources.indexOf(record);
                }
            }, this);
        }

        source = this.target.layerSources[data[idx][0]];

        var capGridPanel = new Ext.grid.GridPanel({
            store: source.store,
            autoScroll: true,
            autoExpandColumn: "title",
            plugins: [expander],
            loadMask: true,
            colModel: new Ext.grid.ColumnModel([
                expander,
                {id: "title", header: this.panelTitleText, dataIndex: "title", sortable: true},
                {header: "Id", dataIndex: "name", width: 120, sortable: true}
            ]),
            listeners: {
                rowdblclick: addLayers,
                scope: this
            }
        });
        
        var sourceComboBox = new Ext.form.ComboBox({
            ref: "../../sourceComboBox",
            width: 165,
            store: sources,
            valueField: "id",
            displayField: "title",
            tpl: '<tpl for="."><div ext:qtip="{url}" class="x-combo-list-item">{title}</div></tpl>',
            triggerAction: "all",
            editable: false,
            allowBlank: false,
            forceSelection: true,
            mode: "local",
            value: data[idx][0],
            listeners: {
                select: function(combo, record, index) {
                    var id = record.get("id");
                    if (id === this.addServerId) {
                        showNewSourceDialog();
                        sourceComboBox.reset();
                        return;
                    }
                    var source = this.target.layerSources[id];
                    capGridPanel.reconfigure(source.store, capGridPanel.getColumnModel());
                    // TODO: remove the following when this Ext issue is addressed
                    // http://www.extjs.com/forum/showthread.php?100345-GridPanel-reconfigure-should-refocus-view-to-correct-scroller-height&p=471843
                    capGridPanel.getView().focusRow(0);
                    this.setSelectedSource(source);
                    // blur the combo box
                    //TODO Investigate if there is a more elegant way to do this.
                    (function() {
                        combo.triggerBlur();
                        combo.el.blur();
                    }).defer(100);
                },
                focus: function(field) {
                    if (target.proxy) {
                        field.reset();
                    }
                },
                scope: this
            }
        });

        var capGridToolbar = null,
            container;

        if (this.target.proxy || data.length > 1) {
            container = new Ext.Container({
                cls: 'gxp-addlayers-sourceselect',
                items: [
                    new Ext.Toolbar.TextItem({text: this.layerSelectionText}),
                    sourceComboBox
                ]
            });
            capGridToolbar = [container];
        }
        
        if (this.target.proxy) {
            this.addServerId = Ext.id();
            sources.loadData([[this.addServerId, this.addServerText + "..."]], true);
        }
        
        var newSourceDialog = {
            xtype: "gxp_newsourcedialog",
            header: false,
            listeners: {
                "hide": function(cmp) {
                    if (!this.outputTarget) {
                        cmp.ownerCt.hide();
                    }
                },
                "urlselected": function(newSourceDialog, url, type) {
                    newSourceDialog.setLoading();
                    var ptype;
                    switch (type) {
                    	case 'TMS':
                    		ptype = "gxp_tmssource";
                    		break;
                    	case 'REST':
                    		ptype = 'gxp_arcrestsource';
                    		break;
                    	default:
                    		ptype = 'gxp_wmscsource';
                    }
                    this.target.addLayerSource({
                        config: {url: url, ptype: ptype},
                        callback: function(id) {
                            // add to combo and select
                            var record = new sources.recordType({
                                id: id,
                                title: this.target.layerSources[id].title || this.untitledText
                            });
                            sources.insert(0, [record]);
                            sourceComboBox.onSelect(record, 0);
                            newSourceDialog.hide();
                        },
                        fallback: function(source, msg) {
                            newSourceDialog.setError(
                                new Ext.Template(this.addLayerSourceErrorText).apply({type: type, msg: msg})
                            );
                        },
                        scope: this
                    });
                },
                scope: this
            }
        };
        var me = this;
        function showNewSourceDialog() {
            if (me.outputTarget) {
                me.addOutput(newSourceDialog);
            } else {
                new Ext.Window({
                    title: gxp.NewSourceDialog.prototype.title,
                    modal: true,
                    hideBorders: true,
                    width: 300,
                    items: newSourceDialog
                }).show();
            }
        }        
        
        
        var items = {
            xtype: "container",
            region: "center",
            layout: "fit",
            hideBorders: true,
            items: [capGridPanel]
        };
        if (this.instructionsText) {
            items.items.push({
                xtype: "box",
                autoHeight: true,
                autoEl: {
                    tag: "p",
                    cls: "x-form-item",
                    style: "padding-left: 5px; padding-right: 5px"
                },
                html: this.instructionsText
            });
        }
        
        var bbarItems = [
            "->",
            new Ext.Button({
                text: this.addButtonText,
                iconCls: "gxp-icon-addlayers",
                handler: addLayers,
                scope : this
            }),
            new Ext.Button({
                text: this.doneText,
                handler: function() {
                    this.capGrid.hide();
                },
                scope: this
            })
        ];
        
        var uploadButton;
        if (!this.uploadSource) {
            uploadButton = this.createUploadButton();
            if (uploadButton) {
                bbarItems.unshift(uploadButton);
            }
        }

        var Cls = this.outputTarget ? Ext.Panel : Ext.Window;
        this.capGrid = new Cls(Ext.apply({
            title: this.availableLayersText,
            closeAction: "hide",
            layout: "border",
            height: 300,
            width: 315,
            modal: true,
            items: items,
            tbar: capGridToolbar,
            bbar: bbarItems,
            listeners: {
                hide: function(win) {
                    capGridPanel.getSelectionModel().clearSelections();
                },
                show: function(win) {
                    if (this.selectedSource === null) {
                        this.setSelectedSource(this.target.layerSources[data[idx][0]]);
                    } else {
                        this.setSelectedSource(this.selectedSource);
                    }
                },
                scope: this
            }
        }, this.initialConfig.outputConfig));
        if (Cls === Ext.Panel) {
            this.addOutput(this.capGrid);
        }
        
    },
    
    /** private: method[addLayers]
     *  :arg records: ``Array`` the layer records to add
     *  :arg isUpload: ``Boolean`` Do the layers to add come from an upload?
     */
    addLayers: function(records, isUpload) {
        var source = this.selectedSource;
        var layerStore = this.target.mapPanel.layers,
            extent, record, layer;
        for (var i=0, ii=records.length; i<ii; ++i) {
            // If the source is lazy, then createLayerRecord will not return
            // a record, and we take the preconfigured record.
            record = source.createLayerRecord({
                name: records[i].get("name"),
                source: source.id
            }) || records[i];
            if (record) {
                layer = record.getLayer();
                if (layer.maxExtent) {
                    if (!extent) {
                        extent = record.getLayer().maxExtent.clone();
                    } else {
                        extent.extend(record.getLayer().maxExtent);
                    }
                }
                if (record.get("group") === "background") {
                    // layer index 0 is the invisible base layer, so we insert
                    // at position 1.
                    layerStore.insert(1, [record]);
                } else {
                    layerStore.add([record]);
                }
            }
        }
        if (extent) {
            this.target.mapPanel.map.zoomToExtent(extent);
        }
        if (records.length === 1 && record) {
            // select the added layer
            this.target.selectLayer(record);
            if (isUpload && this.postUploadAction) {
                // show LayerProperties dialog if just one layer was uploaded
                var outputConfig,
                    actionPlugin = this.postUploadAction;
                if (!Ext.isString(actionPlugin)) {
                    outputConfig = actionPlugin.outputConfig;
                    actionPlugin = actionPlugin.plugin;
                }
                this.target.tools[actionPlugin].addOutput(outputConfig);
            }
        }
    },
    
    /** private: method[setSelectedSource]
     *  :arg source: :class:`gxp.plugins.LayerSource`
     */
    setSelectedSource: function(source, callback) {
        this.selectedSource = source;
        var store = source.store;
        this.fireEvent("sourceselected", this, source);
        if (this.capGrid && source.lazy) {
            source.store.load({callback: (function() {
                var sourceComboBox = this.capGrid.sourceComboBox,
                    store = sourceComboBox.store,
                    valueField = sourceComboBox.valueField,
                    index = store.findExact(valueField, sourceComboBox.getValue()),
                    rec = store.getAt(index),
                    source = this.target.layerSources[rec.get("id")];
                if (source) {
                    if (source.title !== rec.get("title") && !Ext.isEmpty(source.title)) {
                        rec.set("title", source.title);
                        sourceComboBox.setValue(rec.get(valueField));
                    }
                } else {
                    store.remove(rec);
                }
            }).createDelegate(this)});
        }
    },
    
    /** api: method[createUploadButton]
     *  :arg Cls: ``Function`` The class to use for creating the button. If not
     *      provided, an ``Ext.Button`` instance will be created.
     *      ``Ext.menu.Item`` would be another option.
     *  If this tool is provided an ``upload`` property, a button will be created
     *  that launches a window with a :class:`gxp.LayerUploadPanel`.
     */
    createUploadButton: function(Cls) {
        Cls = Cls || Ext.Button;
        var button;
        var uploadConfig = this.initialConfig.upload || !!this.initialConfig.uploadSource;
        // the url will be set in the sourceselected sequence
        var url;
        if (uploadConfig) {
            if (typeof uploadConfig === "boolean") {
                uploadConfig = {};
            }
            button = new Cls({
                text: this.uploadText,
                iconCls: "gxp-icon-filebrowse",
                hidden: !this.uploadSource,
                handler: function() {
                    this.target.doAuthorized(this.uploadRoles, function() {
                        var panel = new gxp.LayerUploadPanel(Ext.apply({
                            title: this.outputTarget ? this.uploadText : undefined,
                            url: url,
                            width: 300,
                            border: false,
                            bodyStyle: "padding: 10px 10px 0 10px;",
                            labelWidth: 65,
                            autoScroll: true,
                            defaults: {
                                anchor: "99%",
                                allowBlank: false,
                                msgTarget: "side"
                            },
                            listeners: {
                                uploadcomplete: function(panel, detail) {
                                    var layers = detail["import"].tasks[0].items;
                                    var item, names = {}, resource, layer;
                                    for (var i=0, len=layers.length; i<len; ++i) {
                                        item = layers[i];
                                        if (item.state === "ERROR") {
                                            Ext.Msg.alert(item.originalName, item.errorMessage);
                                            return;
                                        }
                                        resource = item.resource;
                                        layer = resource.featureType || resource.coverage;
                                        names[layer.namespace.name + ":" + layer.name] = true;
                                    }
                                    this.selectedSource.store.load({
                                        callback: function(records, options, success) {
                                            var gridPanel, sel;
                                            if (this.capGrid && this.capGrid.isVisible()) {
                                                gridPanel = this.capGrid.get(0).get(0);
                                                sel = gridPanel.getSelectionModel();
                                                sel.clearSelections();
                                            }
                                            // select newly added layers
                                            var newRecords = [];
                                            var last = 0;
                                            this.selectedSource.store.each(function(record, index) {
                                                if (record.get("name") in names) {
                                                    last = index;
                                                    newRecords.push(record);
                                                }
                                            });
                                            if (gridPanel) {
                                                // this needs to be deferred because the 
                                                // grid view has not refreshed yet
                                                window.setTimeout(function() {
                                                    sel.selectRecords(newRecords);
                                                    gridPanel.getView().focusRow(last);
                                                }, 100);
                                            } else {
                                                this.addLayers(newRecords, true);
                                            }
                                        },
                                        scope: this
                                    });
                                    if (this.outputTarget) {
                                        panel.hide();
                                    } else {
                                        win.close();
                                    }
                                },
                                scope: this
                            }
                        }, uploadConfig));
                    
                        var win;
                        if (this.outputTarget) {
                            this.addOutput(panel);
                        } else {
                            win = new Ext.Window({
                                title: this.uploadText,
                                modal: true,
                                resizable: false,
                                items: [panel]
                            });
                            win.show();
                        }
                    }, this);
                },
                scope: this
            });
            
            var urlCache = {};
            function getStatus(url, callback, scope) {
                if (url in urlCache) {
                    // always call callback after returning
                    window.setTimeout(function() {
                        callback.call(scope, urlCache[url]);
                    }, 0);
                } else {
                    Ext.Ajax.request({
                        url: url,
                        disableCaching: false,
                        callback: function(options, success, response) {
                            var status = response.status;
                            urlCache[url] = status;
                            callback.call(scope, status);
                        }
                    });
                }
            }
            
            this.on({
                sourceselected: function(tool, source) {
                    button[this.uploadSource ? "show" : "hide"]();
                    var show = false;
                    if (this.isEligibleForUpload(source)) {
                        url = this.getGeoServerRestUrl(source.url);
                        if (this.target.isAuthorized()) {
                            // determine availability of upload functionality based
                            // on a 200 for GET /imports
                            getStatus(url + "/imports", function(status) {
                                button.setVisible(status === 200);
                            }, this);
                        }
                    }
                },
                scope: this
            });
        }
        return button;
    },
    
    /** private: method[getGeoServerRestUrl]
     *  :arg url: ``String`` A GeoServer url like "geoserver/ows"
     *  :returns: ``String`` The rest endpoint for the above GeoServer,
     *      i.e. "geoserver/rest" 
     */
    getGeoServerRestUrl: function(url) {
        var parts = url.split("/");
        parts.pop();
        parts.push("rest");
        return parts.join("/");
    },
    
    /** private: method[isEligibleForUpload]
     *  :arg source: :class:`gxp.plugins.LayerSource`
     *  :returns: ``Boolean``
     *
     *  Determine if the provided source is eligible for upload given the tool
     *  config.
     */
    isEligibleForUpload: function(source) {
        return (
            source.url &&
            (this.relativeUploadOnly ? (source.url.charAt(0) === "/") : true) &&
            (this.nonUploadSources || []).indexOf(source.id) === -1
        );
    },
    
    /** api: config[createExpander]
     *  ``Function`` Returns an ``Ext.grid.RowExpander``. Can be overridden
     *  by applications/subclasses to provide a custom expander.
     */
    createExpander: function() {
        return new Ext.grid.RowExpander({
            tpl: new Ext.Template(this.expanderTemplateText)
        });
    }

});

Ext.preg(gxp.plugins.AddLayers.prototype.ptype, gxp.plugins.AddLayers);
