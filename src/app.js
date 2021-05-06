'use strict';
import 'hslayers-ng/components/add-layers/add-layers.module';
import 'hslayers-ng/components/core/core.module';
import 'hslayers-ng/components/datasource-selector/datasource-selector.module';
import 'hslayers-ng/components/info/info.module';
import 'hslayers-ng/components/map/map.module';
import 'hslayers-ng/components/measure/measure.module';
import 'hslayers-ng/components/permalink/permalink.module';
import 'hslayers-ng/components/print/print.module';
import 'hslayers-ng/components/query/query.module';
import 'hslayers-ng/components/search/search.module';
import 'hslayers-ng/components/sidebar/sidebar.module';
import 'hslayers-ng/components/toolbar/toolbar.module';
// hslayers-ng components must be loaded first, otherwise angular will be undefined
import View from 'ol/View';
import { transform, transformExtent } from 'ol/proj';
import { Tile, Group, Image as ImageLayer } from 'ol/layer';
import { TileWMS, WMTS, OSM, XYZ, TileArcGISRest } from 'ol/source';
import { Style, Icon, Stroke, Fill, Circle, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';
import './adjuster/adjuster.module';
import nuts from './nuts';

var module = angular.module('hs', [
  'hs.addLayers',
  'hs.core',
  'hs.datasource_selector',
  'hs.geolocation',
  'hs.info',
  'hs.layermanager',
  'hs.map',
  'hs.measure',
  'hs.permalink',
  'hs.print',
  'hs.query',
  'hs.save-map',
  'hs.search',
  'hs.sidebar',
  'hs.toolbar',
  'pra.adjuster'
]);

module.directive('hs', ['HsConfig', 'HsCore', function (config, Core) {
    return {
        template: Core.hslayersNgTemplate,
        link: function (scope, element) {
            Core.fullScreenMap(element);
        }
    };
}]);

function getHostname() {
    var url = window.location.href
    var urlArr = url.split("/");
    var domain = urlArr[2];
    return urlArr[0] + "//" + domain;
};


var stroke = new Stroke({
    color: '#3399CC',
    width: 0.25
});

function perc2color(perc) {
    perc = perc * 100;
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return `rgba(${r}, ${g}, ${b}, 0.7)`;
}

var styles = function(feature){
    if(isNaN(feature.get('total'))){
        return [new Style({
            fill:  new Fill({
                color: '#FFF'
            }),
            stroke: stroke
        })]
    } else
    return [new Style({
        fill:  new Fill({
            color: perc2color(feature.get('total'))
        }),
        stroke: stroke
    })]
};

var nuts2Layer = new VectorLayer({
    source: nuts.nuts2Source,
    visible: false,
    style: styles,
    title: 'NUTS2 regions'
});


var nuts3Layer = new VectorLayer({
    source: nuts.nuts3Source,
    visible: true,
    style: styles,
    title: 'NUTS3 regions',
});
nuts3Layer.set('hoveredKeys', ['NUTS_NAME', 'totalForHumans', "Social & Human", "Anthropic", "Institutional", "Economical", "Natural", "Cultural"]);
nuts3Layer.set('hoveredKeysTranslations', {'NUTS_NAME': 'Name', 'totalForHumans': 'Calculated score'});


module.value('HsConfig', {
    proxyPrefix: "../8085/",
    default_layers: [
        new Tile({
            source: new OSM(),
            title: "Open street map",
            base: true,
            editor: { editable: false },
            removable: false
        }),
        nuts2Layer,
        nuts3Layer
    ],
    project_name: 'erra/map',
    default_view: new View({
        center: [2433348.3022471312, 7744501.813885343],
        zoom: 3.6,
        units: "m"
    }),
    advanced_form: true,
    datasources: [],
    hostname: {
        "default": {
            "title": "Default",
            "type": "default",
            "editable": false,
            "url": getHostname()
        }
    },
    panelWidths: {
    },
    panelsEnabled: {
        language: false,
        composition_browser: false,
        legend: false,
        ows: false,
        info: false,
        saveMap: false,
        draw: false
    }, 
    searchProvider: (q) => {
        return `/app/jupyter-test/8085/search/?q=${q}`
    },
    sidebarPosition: 'right',
});

module.controller('Main', ['$scope', 'HsCore', '$compile', 'HsLayoutService', 'HsSidebarService', 'pra.adjuster.service',
    function ($scope, Core, $compile, layoutService, hsSidebarService, adjusterService) {
        $scope.Core = Core;
        $scope.panelVisible = layoutService.panelVisible;
        //layoutService.sidebarRight = true;
        //layoutService.sidebarToggleable = false;
        //Core.singleDatasources = true;
        layoutService.sidebarButtons = true;
        hsSidebarService.buttons.push({
          panel: 'adjuster',
          module: 'pra.adjuster',
          order: 0,
          title: 'Adjust factors',
          description: 'Adjust factors for computation',
          icon: 'icon-analytics-piechart',
          //visible: true
        });
        $scope.$on("scope_loaded", function (event, args) {
          if (args == 'Sidebar') {
            var el = angular.element('<pra.adjuster hs.draggable ng-if="Core.exists(\'pra.adjuster\')" ng-show="panelVisible(\'adjuster\', this)"></pra.adjuster>')[0];
            layoutService.panelListElement.appendChild(el);
            $compile(el)($scope);
            layoutService.setDefaultPanel('adjuster');

            //var toolbar_button = angular.element('<div pra.adjuster.sidebar-btn></div>')[0];
            //layoutService.sidebarListElement.appendChild(toolbar_button);
            //$compile(toolbar_button)(event.targetScope);
          }
        })
    }
]);

